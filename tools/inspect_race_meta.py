from bs4 import BeautifulSoup
import re

with open('tjk_bursa_program.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

tables = soup.find_all('table')

for idx, table in enumerate(tables):
    # Find preceding text/elements for this table
    prev = table.find_previous(lambda e: e.name in ['div', 'h3', 'h4', 'p', 'tr'] and ('Koşu' in e.get_text() or 'Metre' in e.get_text() or 'İkramiye' in e.get_text()))
    # Let's inspect the container above table
    parent = table.parent
    # Let's see all text in parent or preceding siblings
    siblings = []
    curr = table.previous_sibling
    count = 0
    while curr and count < 10:
        if hasattr(curr, 'get_text'):
            t = curr.get_text(strip=True)
            if t:
                siblings.append(t)
        curr = curr.previous_sibling
        count += 1
    print(f"\n=== Table {idx+1} Race Info Context ===")
    print("Previous siblings:", siblings[:3])
    # Also find div with class containing race or kosu
    # Let's check table id or parent div
    print("Table id:", table.get('id'), "class:", table.get('class'))
    print("Parent tag:", parent.name, "id:", parent.get('id'), "class:", parent.get('class'))
