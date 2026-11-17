import urllib.parse
import requests
from bs4 import BeautifulSoup
import re

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://www.tjk.org/TR/YarisSever/Info/Sehir/GunlukYarisProgrami'
}

def extract_idman_for_race_html(table_elem):
    """
    Program tablosundaki ilk Atkodu ve KosuKodu bağlantısını bularak
    TJK'dan o koşudaki tüm atların resmî galoplarını çeker.
    """
    a = table_elem.find('a', href=lambda h: h and 'KosuKodu=' in h and 'Atkodu=' in h)
    if not a:
        return {}

    href = a['href']
    m_k = re.search(r'KosuKodu=(\d+)', href)
    m_at = re.search(r'Atkodu=(\d+)', href)
    if not m_k or not m_at:
        return {}

    kosu_kodu = m_k.group(1)
    atkodu = m_at.group(1)
    url = f"https://www.tjk.org/TR/YarisSever/Info/idmanpisti/Kosu?KosuKodu={kosu_kodu}&Atkodu={atkodu}"

    try:
        resp = requests.get(url, headers=HEADERS, timeout=12)
        if resp.status_code != 200:
            return {}

        soup = BeautifulSoup(resp.text, 'html.parser')
        tbl = soup.find('table')
        if not tbl:
            return {}

        galop_map = {}
        rows = tbl.find_all('tr')[1:] # Skip header
        for r in rows:
            tds = [td.get_text(strip=True) for td in r.find_all(['td', 'th'])]
            if len(tds) < 17:
                continue

            at_no_str = tds[0]
            at_adi = tds[1]
            # Temiz at adı
            clean_at_adi = re.sub(r'\s*\(\d+\)\s*$', '', at_adi).strip()

            d_1200 = tds[7]
            d_1000 = tds[8]
            d_800 = tds[9]
            d_600 = tds[10]
            d_400 = tds[11]
            d_200 = tds[12]
            idman_tarihi = tds[13]
            pist = tds[14]
            idman_turu = tds[15]
            idman_hipodromu = tds[16]

            # En belirgin dereceyi ve son 400 sprint hızını bul
            main_derece = ""
            son400hiz = None

            if d_400:
                main_derece = f"400: {d_400}"
                # 0.24.60 -> saniye
                parts = d_400.split('.')
                try:
                    if len(parts) == 3:
                        sec = int(parts[0])*60 + int(parts[1]) + int(parts[2])/100.0
                    elif len(parts) == 2:
                        sec = int(parts[0]) + int(parts[1])/100.0
                    else:
                        sec = float(d_400)
                    if sec > 0:
                        son400hiz = round((400.0 / sec) * 3.6, 1)
                except Exception:
                    pass

            if d_600:
                main_derece = f"600: {d_600} / " + main_derece if main_derece else f"600: {d_600}"
            if d_800:
                main_derece = f"800: {d_800} / " + main_derece if main_derece else f"800: {d_800}"
            if d_1000:
                main_derece = f"1000: {d_1000} / " + main_derece if main_derece else f"1000: {d_1000}"

            main_derece = main_derece.strip(" /")

            # Galop objesi
            galop_map[clean_at_adi.upper()] = {
                "at_no": int(at_no_str) if at_no_str.isdigit() else 1,
                "at_adi": clean_at_adi,
                "tarih": idman_tarihi,
                "pist": pist,
                "tur": idman_turu,
                "sehir": idman_hipodromu,
                "derece": main_derece or "İdman Derecesi Yok",
                "d_1000": d_1000,
                "d_800": d_800,
                "d_600": d_600,
                "d_400": d_400,
                "d_200": d_200,
                "son400hiz": son400hiz,
                "durum_kodu": f"{idman_hipodromu} {pist}" if idman_hipodromu else "ÇR"
            }

        return galop_map
    except Exception as e:
        print(f"Error scraping idman: {e}")
        return {}

# Test with Bursa Race 1
with open('tjk_bursa_program.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')
tables = soup.find_all('table')
print(f"Testing Bursa Race 1 idman...")
res = extract_idman_for_race_html(tables[0])
print(f"Parsed {len(res)} horses from official TJK idman page:")
for k, v in res.items():
    print(f"  {k}: Derece={v['derece']} | Hız={v['son400hiz']} km/h | Tarih={v['tarih']} | Pist={v['sehir']} {v['pist']} ({v['tur']})")
