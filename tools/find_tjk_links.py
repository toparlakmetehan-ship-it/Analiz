from bs4 import BeautifulSoup
import re

with open('tjk_sonuclar.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

for a in soup.find_all('a', href=True):
    href = a['href']
    if any(k in href.lower() for k in ['adana', 'sonuc', 'gunluk', 'sehir']):
        print(a.get_text(strip=True), "->", href)
