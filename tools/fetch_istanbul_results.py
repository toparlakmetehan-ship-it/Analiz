import requests
from bs4 import BeautifulSoup
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://www.tjk.org/TR/YarisSever/Info/Page/GunlukYarisSonuclari'
}
url = 'https://www.tjk.org/TR/YarisSever/Info/Sehir/GunlukYarisSonuclari?SehirId=3&QueryParameter_Tarih=15%2F11%2F2026&SehirAdi=%C4%B0stanbul&Era=today'
try:
    r = requests.get(url, headers=headers, timeout=15)
    print('Istanbul Status:', r.status_code, 'Length:', len(r.text))
    soup = BeautifulSoup(r.text, 'html.parser')
    for el in soup.find_all(string=re.compile(r"6'LI GANYAN", re.I)):
        p = el.find_parent('table') or el.find_parent('div')
        if p:
            print('ISTANBUL 6LI:', p.get_text(' | ', strip=True))
except Exception as e:
    print('Error:', e)
