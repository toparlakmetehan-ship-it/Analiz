from bs4 import BeautifulSoup

with open("sample_horse_profile.html", "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

print("Title:", soup.title.string if soup.title else "No title")
tables = soup.find_all("table")
print("Total tables:", len(tables))
for i, t in enumerate(tables):
    print(f"\n--- Table {i} (class: {t.get('class')}) ---")
    headers = [th.get_text(strip=True) for th in t.find_all("th")]
    print("Headers:", headers)
    rows = t.find_all("tr")
    print(f"Row count: {len(rows)}")
    for r in rows[1:4]:
        cells = [td.get_text(strip=True) for td in r.find_all(["td", "th"])]
        print("  Row:", cells)
