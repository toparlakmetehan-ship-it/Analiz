from bs4 import BeautifulSoup
import re, json

with open('tjk_sonuclar.html', 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

print("Page title:", soup.title.string if soup.title else "No title")

# Look for Ganyan / Ikramiye / Bahis results
text = soup.get_text()
for line in text.split('\n'):
    line_clean = line.strip()
    if any(k in line_clean.lower() for k in ["6'lı", "ganyan", "adana", "ikramiye", "tevziat", "dağıtılan"]):
        if len(line_clean) < 150 and len(line_clean) > 5:
            print("MATCH:", line_clean)
