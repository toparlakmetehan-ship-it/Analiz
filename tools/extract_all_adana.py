from bs4 import BeautifulSoup
import re

with open('tjk_adana_sonuclar.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

print("=== TÜM ADANA BAHİS SONUÇLARI VE İKRAMİYELERİ ===")
# Find all divs or tables with class or id containing bahis / tevziat / sonuc
for div in soup.find_all(['div', 'table']):
    txt = div.get_text(" | ", strip=True)
    if "91.921,68" in txt or "541.758,25" in txt:
        print("MATCHED CONTAINER:")
        print(txt)
        print("--------------------------------------------------")
