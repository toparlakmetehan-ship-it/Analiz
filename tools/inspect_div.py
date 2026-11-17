from bs4 import BeautifulSoup

with open('tjk_bursa_program.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

div = soup.find('div', id='kosubilgisi-228587')
print("Div text preview:")
print(div.get_text()[:400])

# Also look at parent of div
parent = div.parent
print("\nParent tag:", parent.name, "id:", parent.get('id'), "class:", parent.get('class'))
# Check siblings of div
for s in div.previous_siblings:
    if hasattr(s, 'get_text') and s.get_text(strip=True):
        print("Previous sibling:", s.name, s.get('class'), s.get_text(strip=True)[:200])
