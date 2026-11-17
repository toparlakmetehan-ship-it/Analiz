from bs4 import BeautifulSoup
import re

from test_parse_row import parse_horse_row

with open('tjk_bursa_program.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

tables = soup.find_all('table')
print(f"Total tables: {len(tables)}")

for idx, table in enumerate(tables):
    rows = table.find_all('tr')[1:]
    print(f"\n=================== BURSA KOŞU {idx + 1} ({len(rows)} AT) ===================")
    for r in rows:
        h = parse_horse_row(r)
        if h:
            print(f"  #{h['no']} {h['isim']:<22} | Jokey: {h['jokey']:<12} | Kilo: {h['siklet']} | Kulvar: {h['kulvar']} | HP: {h['handikap_puani']} | Son: {h['son_yarislar']}")
