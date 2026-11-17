from bs4 import BeautifulSoup

with open('tjk_bursa_program.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

print("Title:", soup.title.string if soup.title else "No title")

# Check all tables or race headers
# Usually TJK uses tables with class or headers with 'Koşu'
race_headers = soup.find_all(string=lambda t: t and 'Koşu' in t)
print(f"Total strings with 'Koşu': {len(race_headers)}")
for rh in race_headers[:15]:
    parent = rh.parent
    if parent.name in ['h2', 'h3', 'h4', 'th', 'td', 'span', 'a', 'div']:
        print(f"<{parent.name} class='{parent.get('class')}'>: {rh.strip()[:80]}")
