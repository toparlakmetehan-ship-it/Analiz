from bs4 import BeautifulSoup

with open('sample_horse_profile.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

table1 = soup.find_all('table')[1]
rows = table1.find_all('tr')
for r_idx, row in enumerate(rows[1:3]):
    tds = row.find_all('td')
    print(f'=== Row {r_idx} ({len(tds)} tds) ===')
    for i, td in enumerate(tds):
        print(f'Col {i}: text="{td.get_text(strip=True)}", html={str(td)[:120]}')
