import time
import threading
import yfinance as yf


# -------------------------
# CACHE
# -------------------------
_cache = {}
_cache_time = {}

_fx_cache = {}
_fx_time = {}

CACHE_TTL = 45
FX_TTL = 3600

_lock = threading.Lock()


# -------------------------
# FX RATE
# -------------------------
def get_fx_rate(from_currency: str, to_currency: str = "EUR"):
    """
    Get exchange rate from one currency to EUR.

    Example:
        USD -> EUR
        SEK -> EUR
    """

    from_currency = from_currency.upper()
    to_currency = to_currency.upper()

    if from_currency == to_currency:
        return 1.0

    cache_key = f"{from_currency}_{to_currency}"
    now = time.time()

    # CACHE HIT
    with _lock:
        if (
            cache_key in _fx_cache
            and cache_key in _fx_time
            and now - _fx_time[cache_key] < FX_TTL
        ):
            return _fx_cache[cache_key]

    try:
        fx_ticker = yf.Ticker(f"{from_currency}{to_currency}=X")
        rate = fx_ticker.fast_info["lastPrice"]

        rate = float(rate)

        if rate <= 0:
            print(f"⚠️ Invalid FX rate {from_currency}/{to_currency}: {rate}")
            return 1.0

        with _lock:
            _fx_cache[cache_key] = rate
            _fx_time[cache_key] = now

        return rate

    except Exception as e:
        print(f"❌ FX Error {from_currency}/{to_currency}: {e}")
        return 1.0


# -------------------------
# CONVERT TO EUR
# -------------------------
def convert_to_eur(price: float, currency: str):
    currency = currency.upper()

    if currency == "EUR":
        return round(price, 2)

    fx = get_fx_rate(currency, "EUR")

    if not fx or fx <= 0:
        return round(price, 2)

    return round(price * fx, 2)


# -------------------------
# SINGLE PRICE
# -------------------------
def get_live_price(ticker: str):

    if not ticker:
        return None

    ticker = ticker.replace("$", "").strip().upper()

    now = time.time()

    # CACHE HIT
    with _lock:
        if (
            ticker in _cache
            and ticker in _cache_time
            and now - _cache_time[ticker] < CACHE_TTL
        ):
            return _cache[ticker]

    try:
        stock = yf.Ticker(ticker)
        info = stock.fast_info

        price = float(info["lastPrice"])
        currency = info["currency"]

        # VALIDATION
        if price <= 0:
            print(f"⚠️ Invalid price for {ticker}: {price}")
            return None

        # CONVERT TO EUR
        price_eur = convert_to_eur(price, currency)

        # CACHE
        with _lock:
            _cache[ticker] = price_eur
            _cache_time[ticker] = now

        return price_eur

    except Exception as e:
        print(f"❌ Error fetching {ticker}: {e}")
        return None


# -------------------------
# BATCH PORTFOLIO PRICES
# -------------------------
def get_portfolio_prices(tickers):

    if not tickers:
        return {}

    tickers = list(set(
        t.replace("$", "").strip().upper()
        for t in tickers
        if t
    ))

    results = {}
    now = time.time()

    # -------------------------
    # CACHE FIRST
    # -------------------------
    missing = []

    with _lock:
        for ticker in tickers:

            if (
                ticker in _cache
                and ticker in _cache_time
                and now - _cache_time[ticker] < CACHE_TTL
            ):
                results[ticker] = _cache[ticker]

            else:
                missing.append(ticker)

    # -------------------------
    # FETCH MISSING
    # -------------------------
    for ticker in missing:

        try:
            stock = yf.Ticker(ticker)
            info = stock.fast_info

            price = float(info["lastPrice"])
            currency = info["currency"]

            if price <= 0:
                print(f"⚠️ Invalid price for {ticker}: {price}")
                results[ticker] = None
                continue

            # CONVERT TO EUR
            price_eur = convert_to_eur(price, currency)

            results[ticker] = price_eur

            # CACHE
            with _lock:
                _cache[ticker] = price_eur
                _cache_time[ticker] = now

        except Exception as e:
            print(f"❌ Error fetching {ticker}: {e}")
            results[ticker] = None

    # ALWAYS RETURN KEYS
    for ticker in tickers:
        if ticker not in results:
            results[ticker] = None

    return results