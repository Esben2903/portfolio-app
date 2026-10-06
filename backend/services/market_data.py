import time
import threading
import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

TWELVE_DATA_API_KEY = os.getenv("TWELVE_DATA_API_KEY")

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
        response = requests.get(
            "https://api.twelvedata.com/exchange_rate",
            params={
                "symbol": "EUR/USD",
                "apikey": TWELVE_DATA_API_KEY
            },
            timeout=10
        )

        data = response.json()

        if "rate" not in data:
            print(f"❌ FX Error: {data}")
            return 1.0

        fx = float(data["rate"])

        if fx <= 0:
            return 1.0

        _fx_cache = fx
        _fx_time = now

        return fx

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
        response = requests.get(
            "https://api.twelvedata.com/price",
            params={
                "symbol": ticker,
                "apikey": TWELVE_DATA_API_KEY
            },
            timeout=10
        )

        data = response.json()

        # CHECK FOR API ERROR
        if "price" not in data:
            print(f"⚠️ No price for {ticker}: {data}")
            return None

        price = float(data["price"])

        # VALIDATION
        if price <= 0:
            print(f"⚠️ Invalid price for {ticker}: {price}")
            return None

        # EUR CONVERSION
        fx = get_fx_rate()

        if not fx or fx <= 0:
            fx = 1.0

        price_eur = round(price / fx, 2)

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
            response = requests.get(
                "https://api.twelvedata.com/price",
                params={
                    "symbol": ticker,
                    "apikey": TWELVE_DATA_API_KEY
                },
                timeout=10
            )

            data = response.json()

            if "price" not in data:
                print(f"⚠️ No price for {ticker}: {data}")
                results[ticker] = None
                continue

            price = float(data["price"])

            if price <= 0:
                results[ticker] = None
                continue

            # EUR CONVERSION
            fx = get_fx_rate()

            if not fx or fx <= 0:
                fx = 1.0

            price_eur = round(price / fx, 2)

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