from bs4 import BeautifulSoup
import re

with open('tjk_adana_sonuclar.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

panes = soup.find('div', class_='races-panes')
race_divs = [c for c in panes.children if c.name == 'div']
print(f"Total race divs in panes: {len(race_divs)}")

for idx, div in enumerate(race_divs):
    # Find race title like "1. Koşu 17.45"
    title_text = ""
    for elem in div.find_all(True):
        t = elem.get_text(strip=True)
        if re.search(r'\d+\.\s*Koşu', t):
            title_text = t
            break
    print(f"\nRace {idx+1} title: {title_text}")
    
    # race config
    rh = div.find('h3', class_='race-config')
    if rh:
        print("Config text:", rh.get_text(" ", strip=True)[:100])
    
    # son 800
    s800 = div.find('div', class_='bsinfo-Son800')
    if s800:
        print("Son 800 text:", s800.get_text(strip=True))
