from bs4 import BeautifulSoup
import re

with open('tjk_adana_sonuclar.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

rapor_links = soup.find_all('a', href=lambda h: h and 'rapor' in h.lower())
print('Rapor links:', len(rapor_links))
for a in rapor_links[:5]:
    print(a.get_text(strip=True), a['href'])

# Check for son 800 spans or divs
son800 = soup.find_all(text=re.compile(r'Son 800', re.I))
print('Son 800 occurrences:', len(son800))
for s in son800[:5]:
    print('Parent tag:', s.parent.name, s.strip())

# Check for gidişat / seyir comments or text
print('\nChecking for any text that might be race comments...')
for p in soup.find_all(['p', 'span', 'div']):
    t = p.get_text(strip=True)
    if any(k in t.lower() for k in ['viraj', 'düzlük', 'liderlik', 'kafayı', 'doldur', 'startla', 'sprinte', 'pusu']):
        print(f'Match ({p.name}):', t[:100])
