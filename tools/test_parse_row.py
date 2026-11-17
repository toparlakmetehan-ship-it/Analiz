from bs4 import BeautifulSoup
import re

def parse_horse_row(row):
    cells = row.find_all(['td', 'th'])
    if len(cells) < 10:
        return None
    
    # 1. No
    no_text = cells[1].get_text(strip=True)
    try:
        no = int(re.sub(r'[^0-9]', '', no_text))
    except:
        no = 1
        
    # 2. At İsmi
    td_name = cells[2]
    a_tag = td_name.find('a')
    raw_name = a_tag.get_text(strip=True) if a_tag else td_name.get_text(strip=True)
    # clean name from equipment explanation if any
    isim = re.sub(r'[\r\n\t]+', ' ', raw_name).strip()
    
    # Equipment
    takilar = []
    for s in td_name.find_all('span'):
        txt = s.get_text(strip=True)
        if txt and len(txt) <= 5 and txt not in takilar:
            takilar.append(txt)
            
    # 3. Yas / Cinsiyet / Irk
    yas_str = cells[3].get_text(strip=True)
    # e.g. "2y d e", "3y k a", "4y d k"
    yas_match = re.search(r'(\d+)', yas_str)
    yas = int(yas_match.group(1)) if yas_match else 3
    cinsiyet = "Erkek" if 'e' in yas_str.lower() or 'a' in yas_str.lower() else "Dişi"
    
    # 4. Orijin (Baba - Anne / Kısrak Babası)
    # e.g. "SUPER SAVER (USA)-DAISY DIAMONDS/BUSHRANGER (IRE)"
    orijin_str = cells[4].get_text(strip=True)
    parts = orijin_str.split('-')
    baba = parts[0].strip() if len(parts) > 0 else ""
    anne_part = parts[1].strip() if len(parts) > 1 else ""
    if '/' in anne_part:
        anne, kisrak_babasi = [x.strip() for x in anne_part.split('/', 1)]
    else:
        anne = anne_part
        kisrak_babasi = ""
        
    # 5. Sıklet (Kilo)
    siklet_str = cells[5].get_text(strip=True).replace(',', '.')
    try:
        siklet = float(re.search(r'[\d\.]+', siklet_str).group())
    except:
        siklet = 57.0
        
    # 6. Jokey
    jokey_str = cells[6].get_text(strip=True)
    # Jokey and apranti
    apranti = 'AP' in jokey_str or 'Apranti' in jokey_str
    jokey = re.sub(r'AP.*$', '', jokey_str).strip()
    
    # 7. Sahip & Antrenör
    sahip = cells[7].get_text(strip=True) if len(cells) > 7 else ""
    antrenor = cells[8].get_text(strip=True) if len(cells) > 8 else ""
    
    # 8. Kulvar (St)
    st_str = cells[9].get_text(strip=True) if len(cells) > 9 else "1"
    try:
        kulvar = int(re.sub(r'[^0-9]', '', st_str))
    except:
        kulvar = 1
        
    # 9. HP (Handikap Puanı)
    hp_str = cells[10].get_text(strip=True) if len(cells) > 10 else ""
    try:
        hp = int(re.sub(r'[^0-9]', '', hp_str))
    except:
        hp = 0
        
    # 10. Son 6 Y. (Son Yarışlar)
    son_yarislar = cells[11].get_text(strip=True) if len(cells) > 11 else ""
    
    # 11. KGS (Dinlenme Günü)
    kgs_str = cells[12].get_text(strip=True) if len(cells) > 12 else "20"
    try:
        dinlenme_gunu = int(re.sub(r'[^0-9]', '', kgs_str))
    except:
        dinlenme_gunu = 20
        
    # 12. Gny (Ganyan)
    gny_str = cells[15].get_text(strip=True) if len(cells) > 15 else "3.50"
    ganyan = gny_str if gny_str and gny_str != '-' else "3.50"
    
    # 13. AGF
    agf_str = cells[16].get_text(strip=True) if len(cells) > 16 else "10"
    try:
        agf = float(re.sub(r'[^0-9\.]', '', agf_str))
    except:
        agf = 10.0
        
    return {
        "no": no,
        "isim": isim,
        "yas": yas,
        "cinsiyet": cinsiyet,
        "baba": baba,
        "anne": anne,
        "kisrak_babasi": kisrak_babasi,
        "jokey": jokey,
        "siklet": siklet,
        "apranti_indirimi": apranti,
        "sahip": sahip,
        "antrenor": antrenor,
        "kulvar": kulvar,
        "handikap_puani": hp,
        "son_yarislar": son_yarislar,
        "dinlenme_gunu": dinlenme_gunu,
        "takilar": takilar,
        "ganyan": ganyan,
        "agf_orani": agf
    }

with open('tjk_bursa_program.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

table = soup.find_all('table')[0]
for r in table.find_all('tr')[1:]:
    h = parse_horse_row(r)
    if h:
        print(f"#{h['no']} {h['isim']} | Jokey: {h['jokey']} | Kilo: {h['siklet']} | Kulvar: {h['kulvar']} | HP: {h['handikap_puani']} | Son: {h['son_yarislar']} | Orijin: {h['baba']} - {h['anne']}")
