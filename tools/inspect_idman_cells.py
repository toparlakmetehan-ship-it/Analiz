import requests
from bs4 import BeautifulSoup

url = 'https://www.tjk.org/TR/YarisSever/Info/idmanpisti/Kosu?KosuKodu=228587'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://www.tjk.org/TR/YarisSever/Info/Sehir/GunlukYarisProgrami'
}
r = requests.get(url, headers=headers, timeout=10)
soup = BeautifulSoup(r.text, 'html.parser')
table = soup.find('table')
if table:
    rows = table.find_all('tr')
    for tr in rows:
        cells = [td.get_text(strip=True) for td in tr.find_all(['td', 'th'])]
        print(cells)
else:
    print("No table found")
