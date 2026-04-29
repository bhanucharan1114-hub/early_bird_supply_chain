import openmeteo_requests
import requests_cache
from retry_requests import retry

# Setup the Open-Meteo API client with cache and auto-retry
cache_session = requests_cache.CachedSession(".cache", expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)

# Extended country → centroid coordinates map
# Covers all countries present in both the frontend and common company profiles
COUNTRY_COORDS = {
    "China": {"lat": 35.8617, "lon": 104.1954},
    "Taiwan": {"lat": 23.6978, "lon": 120.9605},
    "South Korea": {"lat": 35.9078, "lon": 127.7669},
    "Vietnam": {"lat": 14.0583, "lon": 108.2772},
    "Malaysia": {"lat": 4.2105, "lon": 101.9758},
    "India": {"lat": 20.5937, "lon": 78.9629},
    "Germany": {"lat": 51.1657, "lon": 10.4515},
    "USA": {"lat": 37.0902, "lon": -95.7129},
    # Extended coverage
    "Australia": {"lat": -25.2744, "lon": 133.7751},
    "Chile": {"lat": -35.6751, "lon": -71.5430},
    "Ireland": {"lat": 53.1424, "lon": -7.6921},
    "Singapore": {"lat": 1.3521, "lon": 103.8198},
    "Canada": {"lat": 56.1304, "lon": -106.3468},
    "Argentina": {"lat": -38.4161, "lon": -63.6167},
    "Indonesia": {"lat": -0.7893, "lon": 113.9213},
    "Japan": {"lat": 36.2048, "lon": 138.2529},
    "Thailand": {"lat": 15.8700, "lon": 100.9925},
    "Mexico": {"lat": 23.6345, "lon": -102.5528},
    "Brazil": {"lat": -14.2350, "lon": -51.9253},
    "South Africa": {"lat": -30.5595, "lon": 22.9375},
    "Turkey": {"lat": 38.9637, "lon": 35.2433},
    "Poland": {"lat": 51.9194, "lon": 19.1451},
    "Netherlands": {"lat": 52.1326, "lon": 5.2913},
    "France": {"lat": 46.2276, "lon": 2.2137},
    "UK": {"lat": 55.3781, "lon": -3.4360},
    "Italy": {"lat": 41.8719, "lon": 12.5674},
    "Spain": {"lat": 40.4637, "lon": -3.7492},
    "Saudi Arabia": {"lat": 23.8859, "lon": 45.0792},
    "UAE": {"lat": 23.4241, "lon": 53.8478},
    "Philippines": {"lat": 12.8797, "lon": 121.7740},
    "Pakistan": {"lat": 30.3753, "lon": 69.3451},
    "Bangladesh": {"lat": 23.6850, "lon": 90.3563},
    "Ethiopia": {"lat": 9.1450, "lon": 40.4897},
}


def get_weather_risk(countries: list[str]) -> list[dict]:
    """
    Fetch live weather conditions for each supplier country and compute
    a risk score based on precipitation, wind speed, and temperature extremes.
    """
    url = "https://api.open-meteo.com/v1/forecast"
    results = []

    for country in countries:
        coords = COUNTRY_COORDS.get(country)
        if not coords:
            results.append({
                "country": country,
                "riskScore": 15,
                "condition": "Unknown — no coordinates",
                "temperature": None,
                "windSpeed": None,
                "precipitation": None,
            })
            continue

        params = {
            "latitude": coords["lat"],
            "longitude": coords["lon"],
            "current": [
                "temperature_2m",
                "precipitation",
                "wind_speed_10m",
                "wind_gusts_10m",
                "weather_code",
            ],
            "forecast_days": 1,
        }

        try:
            responses = openmeteo.weather_api(url, params=params)
            response = responses[0]
            current = response.Current()

            temp = current.Variables(0).Value()
            precip = current.Variables(1).Value()
            wind = current.Variables(2).Value()
            gusts = current.Variables(3).Value()
            wmo_code = int(current.Variables(4).Value())

            # Derive human-readable condition from WMO weather code
            condition = _wmo_to_condition(wmo_code)

            # --- Risk scoring ---
            risk_score = 10  # baseline

            # Precipitation (mm/h)
            if precip > 20:
                risk_score += 45   # torrential
            elif precip > 10:
                risk_score += 30   # heavy rain
            elif precip > 2:
                risk_score += 12   # moderate rain

            # Wind speed (km/h)
            if wind > 60 or gusts > 80:
                risk_score += 35   # storm / hurricane force
            elif wind > 40:
                risk_score += 20   # strong winds
            elif wind > 25:
                risk_score += 8    # moderate winds

            # Temperature extremes
            if temp < -15:
                risk_score += 30   # extreme freeze
            elif temp < -5:
                risk_score += 15   # significant cold
            elif temp > 45:
                risk_score += 30   # heat emergency
            elif temp > 38:
                risk_score += 15   # significant heat

            risk_score = min(100, risk_score)

            results.append({
                "country": country,
                "riskScore": risk_score,
                "condition": condition,
                "temperature": round(temp, 1),
                "windSpeed": round(wind, 1),
                "windGusts": round(gusts, 1),
                "precipitation": round(precip, 1),
            })

        except Exception as e:
            print(f"Weather fetch failed for {country}: {e}")
            results.append({
                "country": country,
                "riskScore": 20,
                "condition": "Data Error",
                "temperature": None,
                "windSpeed": None,
                "precipitation": None,
            })

    return results


def _wmo_to_condition(code: int) -> str:
    """Map WMO weather interpretation codes to human-readable strings."""
    if code == 0:
        return "Clear"
    if code in (1, 2, 3):
        return "Partly Cloudy"
    if code in (45, 48):
        return "Fog"
    if code in range(51, 68):
        return "Rain"
    if code in range(71, 78):
        return "Snow"
    if code in range(80, 83):
        return "Rain Showers"
    if code in range(85, 87):
        return "Snow Showers"
    if code in (95, 96, 99):
        return "Thunderstorm"
    return "Unknown"
