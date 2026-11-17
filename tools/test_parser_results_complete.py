from bs4 import BeautifulSoup
import re
import json

def parse_margin_to_lengths(fark_str):
    if not fark_str:
        return None
    f = fark_str.strip().lower()
    if f == 'burun':
        return 0.05
    elif f == 'baş':
        return 0.1
    elif f == 'boyun':
        return 0.25
    elif 'yarım' in f or '1/2' in f:
        return 0.5
    m = re.search(r'([\d\.,]+)', f)
    if m:
        try:
            return float(m.group(1).replace(',', '.'))
        except ValueError:
            return None
    return None

def parse_late_break_lengths(gec_cikis_str):
    if not gec_cikis_str:
        return None
    f = gec_cikis_str.strip().lower()
    m = re.search(r'([\d\.,]+)', f)
    if m:
        try:
            return float(m.group(1).replace(',', '.'))
        except ValueError:
            return None
    return None

def parse_son_800_times(son_800_str):
    if not son_800_str:
        return None, None
    s = son_800_str.replace('Son 800', '').replace(':', '').strip()
    parts = s.split('-')
    from tjk_scraper.parser import parse_degree_to_seconds
    t1 = parse_degree_to_seconds(parts[0].strip()) if len(parts) > 0 else None
    t2 = parse_degree_to_seconds(parts[1].strip()) if len(parts) > 1 else t1
    return t1, t2

def parse_daily_race_results_html(html, sehir_id, sehir_adi, target_date_iso):
    soup = BeautifulSoup(html, 'html.parser')
    panes = soup.find('div', class_='races-panes')
    if not panes:
        return []

    races = []
    race_divs = [c for c in panes.children if getattr(c, 'name', None) == 'div']
    
    for div_idx, div in enumerate(race_divs):
        # 1. Koşu No ve Saat
        title_text = ""
        for elem in div.find_all(True):
            t = elem.get_text(strip=True)
            m = re.search(r'(\d+)\.\s*Koşu(?:\s*(\d{1,2}[\.:]\d{2}))?', t)
            if m:
                kosu_no = int(m.group(1))
                saat = m.group(2).replace('.', ':') if m.group(2) else None
                break
        else:
            kosu_no = div_idx + 1
            saat = None

        rh = div.find('h3', class_='race-config')
        config_text = rh.get_text(" ", strip=True) if rh else ""

        # Mesafe & Pist
        mesafe = None
        m_msf = re.search(r'(\d{3,4})\s*(?:m|metre)?\s*(Kum|Çim|Sentetik)', config_text, re.I)
        if m_msf:
            mesafe = int(m_msf.group(1))
            pist_turu = m_msf.group(2).title()
        else:
            m_m = re.search(r'(\d{3,4})', config_text)
            mesafe = int(m_m.group(1)) if m_m else None
            m_p = re.search(r'(Kum|Çim|Sentetik)', config_text, re.I)
            pist_turu = m_p.group(1).title() if m_p else "Kum"

        # Koşu cinsi / sınıf
        kosu_cinsi = config_text.split(',')[0].strip() if ',' in config_text else config_text[:40].strip()
        grup_bilgisi = config_text.split(',')[1].strip() if ',' in config_text and len(config_text.split(',')) > 1 else ""

        # Linkler
        video_url = None
        video_a = rh.find('a', href=lambda h: h and 'KosuKodu' in h) if rh else None
        kosu_kodu = None
        if video_a:
            video_url = video_a['href']
            m_k = re.search(r'KosuKodu=(\d+)', video_url)
            if m_k: kosu_kodu = int(m_k.group(1))

        accurace_url = None
        acc_a = rh.find('a', href=lambda h: h and 'accurace' in h) if rh else None
        if acc_a: accurace_url = acc_a['href']

        fotofinish_url = None
        foto_a = rh.find('a', href=lambda h: h and 'fotoftp' in h) if rh else None
        if foto_a: fotofinish_url = foto_a['href']

        komiser_url = None
        kom_a = div.find('a', href=lambda h: h and 'raporftp' in h and '.pdf' in h)
        if kom_a: komiser_url = kom_a['href']

        # Son 800
        s800_el = div.find('div', class_='bsinfo-Son800')
        son_800_raw = s800_el.get_text(strip=True).replace('Son 800', '').replace(':', '').strip() if s800_el else None
        s800_min, s800_max = parse_son_800_times(son_800_raw)

        # At sonuçları tablosu
        table = div.find('table')
        horses = []
        if table:
            rows = table.find_all('tr')[1:]
            for r in rows:
                tds = r.find_all('td')
                if len(tds) < 14:
                    continue
                sira_raw = tds[1].get_text(strip=True)
                m_s = re.search(r'\d+', sira_raw)
                sira = int(m_s.group()) if m_s else None

                at_td = tds[2]
                at_a = at_td.find('a', href=lambda h: h and 'AtId=' in h)
                at_id = None
                if at_a:
                    m_id = re.search(r'QueryParameter_AtId=(\d+)', at_a['href'])
                    if m_id: at_id = int(m_id.group(1))
                    at_name = at_a.get_text(strip=True)
                else:
                    at_name = at_td.get_text(strip=True)

                # at_no from name string like ALİMENDER(4)
                m_no = re.search(r'\((\d+)\)', at_td.get_text())
                at_no = int(m_no.group(1)) if m_no else None

                from tjk_scraper.parser import parse_degree_to_seconds, parse_clean_float, parse_clean_int
                derece_raw = tds[9].get_text(strip=True)
                derece_saniye = parse_degree_to_seconds(derece_raw)
                gny = parse_clean_float(tds[10].get_text(strip=True))
                agf = tds[11].get_text(strip=True)
                st = parse_clean_int(tds[12].get_text(strip=True))
                fark_raw = tds[13].get_text(strip=True)
                fark_boy = parse_margin_to_lengths(fark_raw)
                gec_cikis_raw = tds[14].get_text(strip=True) if len(tds) > 14 else ""
                gec_cikis_boy = parse_late_break_lengths(gec_cikis_raw)
                hp = parse_clean_int(tds[15].get_text(strip=True)) if len(tds) > 15 else None

                horses.append({
                    "tarih": target_date_iso,
                    "hipodrom_id": sehir_id,
                    "sehir_adi": sehir_adi,
                    "kosu_no": kosu_no,
                    "kosu_kodu": kosu_kodu,
                    "at_id": at_id,
                    "at_no": at_no,
                    "at_ismi": at_name,
                    "sira": sira,
                    "sira_raw": sira_raw,
                    "derece_raw": derece_raw,
                    "derece_saniye": derece_saniye,
                    "fark_raw": fark_raw,
                    "fark_boy": fark_boy,
                    "gec_cikis_raw": gec_cikis_raw,
                    "gec_cikis_boy": gec_cikis_boy,
                    "ganyan": gny,
                    "agf": agf,
                    "start_no": st,
                    "hp": hp,
                    "son_800_raw": son_800_raw,
                    "son_800_saniye": s800_min,
                    "video_url": video_url,
                    "accurace_url": accurace_url,
                    "fotofinish_url": fotofinish_url,
                    "komiser_raporu_url": komiser_url,
                    "gidisat_yorumu": None
                })

        races.append({
            "kosu_no": kosu_no,
            "saat": saat,
            "mesafe": mesafe,
            "pist_turu": pist_turu,
            "kosu_cinsi": kosu_cinsi,
            "grup_bilgisi": grup_bilgisi,
            "kosu_kodu": kosu_kodu,
            "son_800_raw": son_800_raw,
            "son_800_saniye": s800_min,
            "video_url": video_url,
            "accurace_url": accurace_url,
            "fotofinish_url": fotofinish_url,
            "komiser_raporu_url": komiser_url,
            "sonuclar": horses
        })

    return races

with open('tjk_adana_sonuclar.html', 'r', encoding='utf-8') as f:
    html = f.read()

races = parse_daily_race_results_html(html, 1, 'Adana', '2026-11-15')
print(f"Successfully parsed {len(races)} races!")
for r in races:
    print(f"Koşu {r['kosu_no']} ({r['saat']}) - {r['mesafe']}m {r['pist_turu']} | Son 800: {r['son_800_raw']} ({r['son_800_saniye']}s) | Atlar: {len(r['sonuclar'])}")
    for h in r['sonuclar'][:2]:
        print(f"  #{h['sira']} AtId: {h['at_id']} {h['at_ismi']} | Süre: {h['derece_raw']} ({h['derece_saniye']}s) | Fark: {h['fark_raw']} ({h['fark_boy']}b) | Gny: {h['ganyan']}")
