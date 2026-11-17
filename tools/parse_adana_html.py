from bs4 import BeautifulSoup
import re, json

with open('tjk_adana_sonuclar.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

print("=== ADANA SONUÇLARI ARAMASI ===")

# Bahis / Ganyan Tablolarını Bul
tables = soup.find_all('table')
print(f"Total tables: {len(tables)}")

bahis_rows = []
for t in tables:
    for tr in t.find_all('tr'):
        text = tr.get_text(" | ", strip=True)
        if any(w in text.lower() for w in ["6'lı ganyan", "1. 6'lı", "2. 6'lı", "altılı ganyan", "ikramiye"]):
            print("BAHIS TR:", text)

# Let's search inside all elements with text containing "6'lı"
for el in soup.find_all(text=re.compile(r"6'lı|GANYAN", re.I)):
    parent_text = el.parent.get_text(" | ", strip=True) if el.parent else ""
    if "6'lı" in parent_text or "GANYAN" in parent_text:
        if len(parent_text) < 200:
            print("MATCH TEXT:", parent_text)
