import time
import threading
import yfinance as yf

# -------------------------
# CACHE
# -------------------------
_cache = {}
_cache_time = {}

_fx_cache = None
_fx_time = 0

CACHE_TTL = 45
FX_TTL = 3600

_lock = threading.Lock()


# -------------------------
# FX RATE
# -------------------------
def get_fx_rate():
    global _fx_cache, _fx_time

    now = time.time()

    # CACHE HIT
    if _fx_cache is not None and now - _fx_time < FX_TTL:
        return _fx_cache

    try:
        fx_ticker = yf.Ticker("EURUSD=X")

        fx = None

        # HISTORY
        hist = fx_ticker.history(period="1d")

        if hist is not None and not hist.empty:
            fx = hist["Close"].iloc[-1]

        # FALLBACK
        if fx is None:
            fx = 1.0

        fx = float(fx)

        if fx <= 0:
            fx = 1.0

        _fx_cache = fx
        _fx_time = now

        return _fx_cache

    except Exception as e:
        print(f"❌ FX Error: {e}")

        _fx_cache = 1.0
        _fx_time = now

        return _fx_cache


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

        price = None

        # -------------------------
        # TRY INFO
        # -------------------------
        try:
            info = stock.info

            price = (
                info.get("regularMarketPrice")
                or info.get("currentPrice")
            )

        except Exception:
            pass

        # -------------------------
        # FALLBACK HISTORY
        # -------------------------
        if price is None:

            hist = stock.history(period="1d")

            if hist is not None and not hist.empty:
                price = hist["Close"].iloc[-1]

        # -------------------------
        # VALIDATION
        # -------------------------
        if price is None:
            print(f"⚠️ No live price for {ticker}")
            return None

        price = float(price)

        if price <= 0:
            print(f"⚠️ Invalid price for {ticker}: {price}")
            return None

        # -------------------------
        # EUR CONVERSION
        # -------------------------
        fx = get_fx_rate()

        if not fx or fx <= 0:
            fx = 1.0

        price_eur = round(price / fx, 2)

        # -------------------------
        # CACHE
        # -------------------------
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
    # FETCH MISSING IN BATCH
    # -------------------------
    if missing:

        try:

            data = yf.download(
                tickers=missing,
                period="1d",
                interval="1m",
                group_by="ticker",
                auto_adjust=False,
                progress=False,
                threads=True
            )

            fx = get_fx_rate()

            if not fx or fx <= 0:
                fx = 1.0

            for ticker in missing:

                try:

                    price = None

                    # MULTI TICKER
                    if len(missing) > 1:

                        if ticker in data:
                            ticker_data = data[ticker]

                            if (
                                "Close" in ticker_data
                                and not ticker_data["Close"].dropna().empty
                            ):
                                price = ticker_data["Close"].dropna().iloc[-1]

                    # SINGLE TICKER
                    else:

                        if (
                            "Close" in data
                            and not data["Close"].dropna().empty
                        ):
                            price = data["Close"].dropna().iloc[-1]

                    # VALIDATION
                    if price is not None:

                        price = float(price)

                        if price > 0:

                            price_eur = round(price / fx, 2)

                            results[ticker] = price_eur

                            with _lock:
                                _cache[ticker] = price_eur
                                _cache_time[ticker] = now

                            continue

                    results[ticker] = None

                except Exception as e:
                    print(f"⚠️ Batch parse error {ticker}: {e}")
                    results[ticker] = None

        except Exception as e:
            print(f"❌ Batch download error: {e}")

            # FALLBACK SINGLE FETCH
            for ticker in missing:
                results[ticker] = get_live_price(ticker)

    # ALWAYS RETURN KEYS
    for ticker in tickers:
        if ticker not in results:
            results[ticker] = None

    return results