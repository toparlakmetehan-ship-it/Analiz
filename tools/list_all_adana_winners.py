from bs4 import BeautifulSoup
import re, json

with open('tjk_adana_sonuclar.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

races = []
# Each race has a title or table
# In TJK html, races are often marked with div id or h3 or table
tables = soup.find_all('table')

# Let's inspect rows with class or first row of results
for i in range(1, 9):
    # Find race header
    reg = re.compile(rf"{i}\.\s*Koşu", re.I)
    el = soup.find(string=reg)
    if el:
        # Find following table with horse results
        parent = el.find_parent('div') or el.find_parent('td') or el.parent
        # let's search table after el
        tbl = None
        curr = el
        for _ in range(20):
            curr = curr.find_next()
            if curr and curr.name == 'table':
                tbl = curr
                break
        
        winner_info = None
        if tbl:
            rows = tbl.find_all('tr')
            for r in rows:
                cols = [c.get_text(strip=True) for c in r.find_all(['td', 'th'])]
                # In results table: S, At İsmi, Yaş, Orijin, Sıklet, Jokey, Sahip, Antrenör, Derece, Gny, AGF, St, Fark, HP
                if len(cols) >= 10 and cols[0] == '1':
                    winner_info = {
                        'sira': cols[0],
                        'at': cols[1],
                        'jokey': cols[5] if len(cols) > 5 else '',
                        'derece': cols[8] if len(cols) > 8 else '',
                        'gny': cols[9] if len(cols) > 9 else '',
                        'agf': cols[10] if len(cols) > 10 else ''
                    }
                    break
        print(f"Koşu {i}: Winner ->", winner_info)
