import requests
from bs4 import BeautifulSoup

url = 'https://www.tjk.org/TR/YarisSever/Info/Page/GunlukYarisSonuclari?QueryParameter_Tarih=15%2F11%2F2026'
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'}
resp = requests.get(url, headers=headers, timeout=15)
soup = BeautifulSoup(resp.text, 'html.parser')

print(f"Status: {resp.status_code}, Length: {len(resp.text)}")

# Find city links or tabs
for a in soup.find_all('a', href=True):
    href = a['href']
    if 'Sehir' in href or 'SehirId' in href:
        print("City link:", a.get_text(strip=True), href)

tables = soup.find_all('table')
print(f"Total tables: {len(tables)}")
for i, t in enumerate(tables[:6]):
    ths = [th.get_text(strip=True) for th in t.find_all('th')]
    print(f"Table {i}: {ths[:8]}")
