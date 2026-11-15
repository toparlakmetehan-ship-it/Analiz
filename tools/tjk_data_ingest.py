# tjk_data_ingest.py
"""
Batch script to download essential TJK data:
1. Full horse registry (paginated JSON) → saved as ``horses.json``
2. Daily race result CSVs for the last N days (default 7) → saved under ``daily_csvs/``
3. Optional: jockey & trainer stats (HTML tables) – saved as raw HTML for later parsing.

The script respects TJK's public endpoints and includes retries, back‑off, and a polite delay.
"""

import os
import json
import time
import requests
from datetime import datetime, timedelta
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# ------------------- Configuration -------------------
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../public/data/tjk"))
HORSE_JSON_PATH = os.path.join(BASE_DIR, "horses.json")
DAILY_CSV_DIR = os.path.join(BASE_DIR, "daily_csvs")
DAYS_BACK = 7  # number of past days to fetch CSVs for

# ------------------- Helpers -------------------

def ensure_dirs():
    os.makedirs(BASE_DIR, exist_ok=True)
    os.makedirs(DAILY_CSV_DIR, exist_ok=True)

def _session():
    """Create a ``requests.Session`` with sensible retry policy."""
    s = requests.Session()
    retries = Retry(
        total=5,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"],
    )
    s.mount("https://", HTTPAdapter(max_retries=retries))
    return s

def fetch_horse_page(page: int):
    """Fetch a single page of horse data.
    Returns a list (may be empty on error). Includes a 1‑second pause.
    """
    url = (
        f"https://www.tjk.org/TR/YarisSever/Query/DataRows/Atlar"
        f"?QueryParameter_OLDUFLG=on&PageNumber={page}&Sort=AtIsmi&X-Requested-With=XMLHttpRequest"
    )
    sess = _session()
    try:
        resp = sess.get(url, timeout=30)
        resp.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"[fetch_horse_page] Error page {page}: {e}")
        return []
    # The endpoint may wrap JSON in HTML – try to extract it.
    try:
        data = resp.json()
    except ValueError:
        import re
        match = re.search(r"(?s)\[.*?\]", resp.text)
        data = json.loads(match.group(0)) if match else []
    time.sleep(1)
    return data

def download_all_horses():
    print("Downloading full horse registry …")
    all_horses = []
    page = 1
    while True:
        batch = fetch_horse_page(page)
        if not batch:
            print(f"No data returned for page {page}; assuming end of registry.")
            break
        all_horses.extend(batch)
        print(f"  page {page} → {len(batch)} records (total {len(all_horses)})")
        page += 1
    with open(HORSE_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(all_horses, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(all_horses)} horse records to {HORSE_JSON_PATH}")

def download_daily_csv(date: datetime):
    """Download CSVs for a given date across known hippodromes."""
    cities = [
        "Istanbul", "Ankara", "Izmir", "Adana", "Bursa",
        "Kocaeli", "Antalya", "Sanliurfa", "Diyarbakir", "Elazig",
    ]
    year = date.year
    year_month = f"{date.year}-{date.month:02d}"
    day_str = date.strftime("%d.%m.%Y")
    for city in cities:
        url = (
            f"https://medya-cdn.tjk.org/raporftp/TJKPDF/{year}/{year_month}/CSV/"
            f"GunlukYarisSonuclari/{day_str}-{city}-GunlukYarisSonuclari-TR.csv"
        )
        try:
            r = requests.get(url, timeout=30)
            if r.status_code == 200:
                filename = f"{date.strftime('%Y%m%d')}_{city}.csv"
                out_path = os.path.join(DAILY_CSV_DIR, filename)
                with open(out_path, "wb") as f:
                    f.write(r.content)
                print(f"Downloaded CSV for {city} on {date.date()}")
            else:
                # No race data for this city/date – silently ignore.
                pass
        except requests.exceptions.RequestException as e:
            print(f"[download_daily_csv] Error for {city} on {date.date()}: {e}")

def download_recent_csvs(days_back: int = DAYS_BACK):
    print(f"Downloading daily CSVs for the last {days_back} days …")
    today = datetime.utcnow()
    for delta in range(days_back):
        target_date = today - timedelta(days=delta)
        download_daily_csv(target_date)

def main():
    ensure_dirs()
    download_all_horses()
    download_recent_csvs()

if __name__ == "__main__":
    main()
