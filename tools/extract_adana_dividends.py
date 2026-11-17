from bs4 import BeautifulSoup
import re

with open('tjk_adana_sonuclar.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

for el in soup.find_all(string=re.compile(r"6'LI GANYAN", re.I)):
    # print ancestors up to table or div
    parent = el.find_parent('table') or el.find_parent('div')
    if parent:
        print("=== FOUND 6'LI BLOCK ===")
        print(parent.get_text(" | ", strip=True))
