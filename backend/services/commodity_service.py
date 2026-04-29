import yfinance as yf

# Map generic material names (case-insensitive) to Yahoo Finance tickers.
# Covers the most commonly used supply-chain critical materials.
TICKER_MAP = {
    # Metals & mining
    "lithium": "LIT",          # Global X Lithium ETF
    "cobalt": "PICK",          # iShares MSCI Global Metals & Mining
    "nickel": "PICK",
    "copper": "HG=F",          # Copper Futures
    "aluminum": "ALUMINIUM",   # Aluminium futures proxy
    "aluminium": "AA",         # Alcoa Corp (liquid proxy)
    "steel": "SLX",            # VanEck Steel ETF
    "iron": "SLX",
    "iron ore": "SLX",
    "gold": "GC=F",            # Gold Futures
    "silver": "SI=F",          # Silver Futures
    "platinum": "PL=F",
    "palladium": "PA=F",
    "tin": "PICK",
    "zinc": "PICK",
    "lead": "PICK",

    # Energy
    "oil": "CL=F",             # WTI Crude Oil Futures
    "crude oil": "CL=F",
    "natural gas": "NG=F",     # Natural Gas Futures
    "lng": "NG=F",
    "coal": "KOL",             # VanEck Coal ETF

    # Technology / semiconductors
    "semiconductors": "SOXX",  # iShares Semiconductor ETF
    "silicon": "SMH",          # VanEck Semiconductor ETF
    "rare earth": "REMX",      # VanEck Rare Earth ETF
    "rare earth metals": "REMX",
    "rare earths": "REMX",
    "memory chips": "SOXX",
    "chips": "SOXX",

    # Agricultural / industrial
    "rubber": "SGX:J91u",
    "glass": "SLX",            # No direct ETF; use steel as industrial proxy
    "plastic": "CL=F",         # Plastic tracks oil prices
    "resin": "CL=F",
    "fiber": "CL=F",
    "cotton": "CT=F",          # Cotton Futures
    "wheat": "ZW=F",           # Wheat Futures
    "corn": "ZC=F",            # Corn Futures
    "soybeans": "ZS=F",        # Soybean Futures

    # Chemicals
    "chemicals": "IYM",        # iShares Basic Materials ETF
    "specialty chemicals": "IYM",
    "fertilizer": "MOS",       # Mosaic Company
}


def get_commodity_stress(materials: list[str]) -> list[dict]:
    results = []

    for material in materials:
        # Case-insensitive lookup with partial match fallback
        ticker_symbol = TICKER_MAP.get(material.lower())
        if not ticker_symbol:
            # Try partial match (e.g. "Rare Earth Metals" → "rare earth")
            ticker_symbol = next(
                (v for k, v in TICKER_MAP.items() if k in material.lower()),
                None
            )

        if not ticker_symbol:
            results.append({
                "material": material,
                "riskScore": 25,
                "priceChange": 0.0,
                "currentPrice": None,
                "note": "Unmapped material — using baseline risk"
            })
            continue

        try:
            ticker = yf.Ticker(ticker_symbol)
            hist = ticker.history(period="5d")

            if hist.empty or len(hist) < 2:
                raise ValueError("Insufficient price history")

            today_close = float(hist["Close"].iloc[-1])
            prev_close = float(hist["Close"].iloc[-2])

            percent_change = ((today_close - prev_close) / prev_close) * 100

            # 5-day volatility: std dev of daily % changes
            if len(hist) >= 3:
                daily_changes = hist["Close"].pct_change().dropna() * 100
                volatility_5d = float(daily_changes.std())
            else:
                volatility_5d = abs(percent_change)

            # Risk formula:
            # - Base: 10
            # - Per % of absolute price change: +12 per point (capped at 60)
            # - Volatility bonus: +0.5 per std-dev point (capped at 20)
            abs_change = abs(percent_change)
            price_risk = min(60, abs_change * 12)
            vol_risk = min(20, volatility_5d * 0.5)
            risk_score = min(100, int(10 + price_risk + vol_risk))

            results.append({
                "material": material,
                "riskScore": risk_score,
                "priceChange": round(percent_change, 2),
                "currentPrice": round(today_close, 2),
                "volatility5d": round(volatility_5d, 2),
            })

        except Exception as e:
            print(f"Commodity fetch failed for {material} ({ticker_symbol}): {e}")
            results.append({
                "material": material,
                "riskScore": 30,
                "priceChange": 0.0,
                "note": "Data unavailable"
            })

    return results
