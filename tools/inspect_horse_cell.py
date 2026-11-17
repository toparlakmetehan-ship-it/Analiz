from bs4 import BeautifulSoup
import json

with open('tjk_bursa_program.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

table = soup.find_all('table')[0]
rows = table.find_all('tr')
headers = [th.get_text(strip=True) for th in rows[0].find_all(['th', 'td'])]
print("Headers:", headers)

for r in rows[1:4]:
    cells = [td.get_text(strip=True) for td in r.find_all(['td', 'th'])]
    print("Cells count:", len(cells))
    for h, c in zip(headers, cells):
        print(f"  {h}: {c[:50]}")
    # Also inspect HTML inside horse name cell to see clean horse name and equipment
    td_name = r.find_all('td')[2]
    # Check for links or spans
    a_tag = td_name.find('a')
    clean_name = a_tag.get_text(strip=True) if a_tag else td_name.get_text(strip=True)
    print("  Clean horse name from <a>:", clean_name)
    # Check equipment
    eq_spans = td_name.find_all('span')
    print("  Equipment spans:", [s.get_text(strip=True) for s in eq_spans])
