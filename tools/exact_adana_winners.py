from bs4 import BeautifulSoup
import re

with open('tjk_adana_sonuclar.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

tables = soup.find_all('table')

print("=== ADANA 15 KASIM 2026 RESMÎ YARIŞ SONUÇLARI (1. - 8. KOŞULAR) ===")
winners = []
for idx, t in enumerate(tables):
    rows = t.find_all('tr')
    for r in rows:
        tds = [td.get_text(strip=True) for td in r.find_all(['td', 'th'])]
        # Row 1 is header, Row 2 is 1st place
        if len(tds) >= 11 and tds[1] == '1':
            horse_raw = tds[2]
            # remove tooltip explanations
            horse_clean = re.sub(r'KG|SK|K|DB|Ring mahalinden.*|Kapalı gözlük.*|Kulaklık.*|Dilinin.*', '', horse_raw).strip()
            # extract number e.g. ALİMENDER(4) -> name: ALİMENDER, no: 4
            m = re.search(r'([^(]+)\(([0-9]+)\)', horse_clean)
            horse_name = m.group(1).strip() if m else horse_clean
            horse_no = int(m.group(2)) if m else -1
            jockey = tds[6] if len(tds) > 6 else ''
            derece = tds[9] if len(tds) > 9 else ''
            gny = tds[10] if len(tds) > 10 else ''
            agf = tds[11] if len(tds) > 11 else ''
            winners.append({
                'kosuNo': idx + 1,
                'no': horse_no,
                'isim': horse_name,
                'jokey': jockey,
                'derece': derece,
                'gny': gny,
                'agf': agf
            })
            print(f"Koşu {idx+1}: No: {horse_no} {horse_name} | Jokey: {jockey} | Ganyan: {gny} ₺ | Derece: {derece} | AGF: {agf}")
            break
