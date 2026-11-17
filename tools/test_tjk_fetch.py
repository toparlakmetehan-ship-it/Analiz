import requests

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/html, */*",
    "Accept-Language": "tr-TR,tr;q=0.9",
}

for date_str in ["16.11.2026", "17.11.2026"]:
    url = f"https://www.tjk.org/TR/YarisSever/Query/DataRows/Program?QueryParameter_Tarih={date_str}"
    try:
        r = requests.get(url, headers=headers, timeout=10)
        print(f"{date_str} Status: {r.status_code}, Length: {len(r.text)}")
        if r.status_code == 200 and len(r.text) > 100:
            print("Preview:", r.text[:200])
    except Exception as e:
        print(f"{date_str} Error:", e)
