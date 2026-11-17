import urllib.parse
import requests
from bs4 import BeautifulSoup

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'tr-TR,tr;q=0.9',
}

CITIES = [
    (1, 'Ankara'), (2, 'İstanbul'), (3, 'İzmir'), (4, 'Bursa'),
    (5, 'Adana'), (6, 'Şanlıurfa'), (7, 'Elazığ'), (8, 'Diyarbakır'),
    (9, 'Kocaeli'), (10, 'Antalya')
]

for date_str in ['16/11/2026', '17/11/2026']:
    print(f'=== Testing Date: {date_str} ===')
    q_date = urllib.parse.quote(date_str)
    for cid, cname in CITIES:
        q_name = urllib.parse.quote(cname)
        url = f'https://www.tjk.org/TR/YarisSever/Info/Sehir/GunlukYarisProgrami?SehirId={cid}&QueryParameter_Tarih={q_date}&SehirAdi={q_name}'
        try:
            r = requests.get(url, headers=headers, timeout=6)
            soup = BeautifulSoup(r.text, 'html.parser')
            tables = soup.find_all('table', class_='tablesorter')
            if len(tables) > 0:
                print(f'  FOUND: {cname} (ID: {cid}) -> {len(tables)} races!')
        except Exception as e:
            print(f'  Error {cname}: {e}')
