from bs4 import BeautifulSoup

with open('tjk_sanliurfa_program.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

tables = soup.find_all('table')
print(f"Total tables in Sanliurfa: {len(tables)}")

for idx, table in enumerate(tables):
    rows = table.find_all('tr')
    print(f"\n--- Sanliurfa Table {idx}: {len(rows)} rows ---")
    if rows:
        headers = [th.get_text(strip=True) for th in rows[0].find_all(['th', 'td'])]
        print(f"Headers: {headers[:10]}")
        if len(rows) > 1:
            first_row = [td.get_text(strip=True) for td in rows[1].find_all(['td', 'th'])]
            print(f"Row 1: {first_row[:10]}")
