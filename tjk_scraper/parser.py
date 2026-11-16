# -*- coding: utf-8 -*-
"""
TJK HTML Ayrıştırıcı (Parser) Modülü
TJK resmî bülten ve at profil sayfalarından verileri kaynaktaki haliyle,
asla tahmin veya uydurma yapmadan, Türkçe karakterleri bozmadan ayrıştırır.
"""

import re
import json
from bs4 import BeautifulSoup


def parse_degree_to_seconds(raw_degree):
    """
    TJK derece metnini (örn: '1.35.42', '2.12.39', '0.58.12') saniyeye çevirir.
    Dönüştürülemezse (örn: 'Derecesiz', 'Koşmadı', None) None döner.
    """
    if not raw_degree or not isinstance(raw_degree, str):
        return None
    raw_clean = raw_degree.strip()
    if not raw_clean or any(k in raw_clean.lower() for k in ['derecesiz', 'koşmadı', 'k', 'd']):
        return None

    # mm.ss.cc formatı (örn: 1.35.42)
    m = re.match(r'^(\d+)\.(\d{1,2})\.(\d{1,2})$', raw_clean)
    if m:
        dakika = int(m.group(1))
        saniye = int(m.group(2))
        salise = int(m.group(3))
        return round(dakika * 60 + saniye + (salise / 100.0), 2)

    # ss.cc formatı (örn: 58.42)
    m2 = re.match(r'^(\d{1,2})\.(\d{1,2})$', raw_clean)
    if m2:
        saniye = int(m2.group(1))
        salise = int(m2.group(2))
        return round(saniye + (salise / 100.0), 2)

    return None


def parse_clean_float(raw_val):
    """Sayısal ondalıklı değeri güvenli bir şekilde float yapar."""
    if raw_val is None:
        return None
    s = str(raw_val).strip().replace(',', '.')
    m = re.search(r'[-+]?\d*\.?\d+', s)
    if m:
        try:
            return float(m.group())
        except ValueError:
            return None
    return None


def parse_clean_int(raw_val):
    """Sayısal tam sayı değerini güvenli bir şekilde int yapar."""
    if raw_val is None:
        return None
    s = str(raw_val).strip()
    m = re.search(r'\d+', s)
    if m:
        try:
            return int(m.group())
        except ValueError:
            return None
    return None


def parse_money(raw_str):
    """Para metnini (örn: '545.000', '1.250.000 t') float yapar."""
    if not raw_str:
        return None
    clean = re.sub(r'[^0-9]', '', str(raw_str))
    if clean:
        try:
            return float(clean)
        except ValueError:
            return None
    return None


def parse_margin_to_lengths(fark_str):
    """
    TJK bitiriş farkı metnini (örn: 'Yarım Boy', '1 Boy', 'Boyun', 'Baş', 'Burun', '2,5 Boy')
    sayısal boy cinsine çevirir.
    """
    if not fark_str:
        return None
    f = str(fark_str).strip().lower()
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
    """Geç çıkış metnini (örn: '2 Boy', '3 Boy') sayısal boya çevirir."""
    if not gec_cikis_str:
        return None
    f = str(gec_cikis_str).strip().lower()
    m = re.search(r'([\d\.,]+)', f)
    if m:
        try:
            return float(m.group(1).replace(',', '.'))
        except ValueError:
            return None
    return None


def parse_son_800_times(son_800_str):
    """
    Son 800 metnini (örn: '0.58.20-0.58.38', '0.51.36') saniye cinsine çevirir.
    (min_sn, max_sn) tuple döner.
    """
    if not son_800_str:
        return None, None
    s = str(son_800_str).replace('Son 800', '').replace(':', '').strip()
    parts = s.split('-')
    t1 = parse_degree_to_seconds(parts[0].strip()) if len(parts) > 0 else None
    t2 = parse_degree_to_seconds(parts[1].strip()) if len(parts) > 1 else t1
    return t1, t2


def extract_query_param(url, param_name):
    """URL içerisinden parametre değerini regex ile çeker."""
    if not url:
        return None
    m = re.search(rf'{param_name}=([^&]+)', url)
    if m:
        return m.group(1).strip()
    return None


# --------------------------------------------------------------------------
# 1. GÜNLÜK YARIŞ PROGRAMI AYRIŞTIRMA
# --------------------------------------------------------------------------

def parse_race_details_header(rd_elem, race_idx):
    """
    Bir koşunun başlık kutusunu (race-details) ayrıştırır:
    Koşu No, Saat, Mesafe, Pist türü, Şartlar, İkramiyeler (1-5), vb.
    """
    raw_text = rd_elem.get_text(" | ", strip=True)

    # Saat (örn: 14.30)
    saat_m = re.search(r'(\d{1,2}\.\d{2})', raw_text)
    saat = saat_m.group(1).replace('.', ':') if saat_m else None

    # Mesafe (örn: 1300, 1400)
    mesafe_m = re.search(r'(\d{4})\s*(?:Kum|Çim|Sentetik)?', raw_text)
    mesafe = int(mesafe_m.group(1)) if mesafe_m else None

    # Pist türü
    pist_turu = None
    if "Çim" in raw_text:
        pist_turu = "Çim"
    elif "Sentetik" in raw_text:
        pist_turu = "Sentetik"
    elif "Kum" in raw_text:
        pist_turu = "Kum"

    # En İyi Derece (E.İ.D.)
    eid_m = re.search(r'E\.İ\.D\.\s*:\s*([\d\.]+)', raw_text)
    eid_raw = eid_m.group(1) if eid_m else None

    # Koşu Cinsi / Grup (örn: Maiden, Handikap 16, KV-6, ŞARTLI 4)
    # TJK'da genellikle a etiketi içinde veya ilk kısımda yer alır
    cins_a = rd_elem.find('a')
    kosu_cinsi = cins_a.get_text(strip=True) if cins_a else None

    # Parent div üzerinden ikramiyeleri topla
    parent = rd_elem.parent if rd_elem else None
    parent_text = parent.get_text(" | ", strip=True) if parent else ""

    prizes = {}
    # İkramiyeler: 1.) 545.000 | 2.) 218.000 ...
    ikramiye_matches = re.findall(r'(\d)\.\)\s*([0-9.]+)\s*t?', parent_text)
    for pos, amount in ikramiye_matches[:5]:
        prizes[int(pos)] = parse_money(amount)

    # Yetiştirici ve Sahip Primi 1.lik
    yetistirici_primi_1 = None
    yet_m = re.search(r'Yetistirici\s*Primi\s*:\s*1\.\)\s*([0-9.]+)', parent_text, re.I)
    if yet_m:
        yetistirici_primi_1 = parse_money(yet_m.group(1))

    sahip_primi_1 = None
    sah_m = re.search(r'At\s*Sahibi\s*Primi\s*:\s*1\.\)\s*([0-9.]+)', parent_text, re.I)
    if sah_m:
        sahip_primi_1 = parse_money(sah_m.group(1))

    # Grup bilgisi (örn: "2 Yaşlı İngilizler", "3 Yaşlı Araplar")
    grup_m = re.search(r'(\d\s*Yaşlı\s*(?:İngilizler|Araplar|ve\s*Yukarı\s*(?:İngilizler|Araplar)))', raw_text)
    grup_bilgisi = grup_m.group(1) if grup_m else None

    # Sıklet ve Yaş şartları
    agirlik_m = re.search(r'(\d{2}(?:\.\d{2})?\s*kg(?:,\s*\d{2}(?:\.\d{2})?\s*kg)*)', raw_text)
    agirlik_sarti = agirlik_m.group(1) if agirlik_m else None

    return {
        "kosu_no": race_idx,
        "saat": saat,
        "mesafe": mesafe,
        "pist_turu": pist_turu,
        "kosu_cinsi": kosu_cinsi,
        "grup_bilgisi": grup_bilgisi,
        "yas_sarti": grup_bilgisi,
        "agirlik_handikap_sarti": agirlik_sarti,
        "eid_sure_raw": eid_raw,
        "ikramiye_1": prizes.get(1),
        "ikramiye_2": prizes.get(2),
        "ikramiye_3": prizes.get(3),
        "ikramiye_4": prizes.get(4),
        "ikramiye_5": prizes.get(5),
        "ikramiye_raw": parent_text[:500] if parent else None,
        "yetistirici_primi_1": yetistirici_primi_1,
        "sahip_primi_1": sahip_primi_1,
    }


def parse_horse_row(tr_elem, race_id):
    """
    Koşu tablosundaki tek bir at satırını (<tr>) kaynaktan eksiksiz ayrıştırır.
    Türkçe karakterleri ve orijinal yazımı korur.
    """
    cells = tr_elem.find_all(['td', 'th'])
    if len(cells) < 10:
        return None

    # Forma resmi URL
    img_tag = cells[0].find('img')
    forma_url = img_tag.get('src') if img_tag else None
    if not forma_url:
        a_img = cells[0].find('a')
        if a_img and a_img.get('href', '').endswith('.jpg'):
            forma_url = a_img.get('href')

    # At No (N)
    no_raw = cells[1].get_text(strip=True)
    at_no = parse_clean_int(no_raw) or 1

    # At İsmi ve AtId
    td_name = cells[2]
    at_a = td_name.find('a')
    at_adi = at_a.get_text(strip=True) if at_a else td_name.get_text(strip=True)
    at_adi = re.sub(r'[\r\n\t]+', ' ', at_adi).strip()
    # At adından parantez içindeki kapı/forma numarasını temizle (Örn: ARSLANBEYLİ(6) -> ARSLANBEYLİ)
    at_adi = re.sub(r'\s*\(\d+\)\s*$', '', at_adi).strip()

    at_id = None
    if at_a and at_a.get('href'):
        at_id_str = extract_query_param(at_a.get('href'), 'QueryParameter_AtId')
        at_id = parse_clean_int(at_id_str)

    # İdman linkinden de at_id bulunabilir
    if not at_id:
        for a_any in tr_elem.find_all('a'):
            href = a_any.get('href', '')
            if 'Atkodu=' in href:
                at_id = parse_clean_int(extract_query_param(href, 'Atkodu'))
                break

    # Ekipman/Takı (KG, DB, SK vb.)
    takilar = []
    for s in td_name.find_all('span'):
        t_text = s.get_text(strip=True)
        if t_text and len(t_text) <= 5 and t_text not in takilar:
            takilar.append(t_text)
    takilar_str = " ".join(takilar) if takilar else None

    # Eküri kontrolü (örn: (1) veya forma rengi)
    ekuri = None
    ekuri_m = re.search(r'\(([A-Z0-9]+)\)', td_name.get_text())
    if ekuri_m:
        ekuri = ekuri_m.group(1)

    # Yaş / Cinsiyet / Irk
    yas_cins_raw = cells[3].get_text(strip=True) if len(cells) > 3 else None
    yas = parse_clean_int(yas_cins_raw)

    # Orijin (Baba - Anne / Kısrak Babası)
    td_orijin = cells[4] if len(cells) > 4 else None
    baba_id = None
    baba_adi = None
    anne_id = None
    anne_adi = None
    kisrak_babasi_adi = None

    if td_orijin:
        for a_orig in td_orijin.find_all('a'):
            href = a_orig.get('href', '')
            txt = a_orig.get_text(strip=True)
            if 'QueryParameter_BabaId' in href:
                baba_id = parse_clean_int(extract_query_param(href, 'QueryParameter_BabaId'))
                baba_adi = txt
            elif 'QueryParameter_AnneId' in href:
                anne_id = parse_clean_int(extract_query_param(href, 'QueryParameter_AnneId'))
                anne_adi = txt
            elif 'KisrakBabasi' in href or 'QueryParameter_KisrakBabaAdi' in href:
                kisrak_babasi_adi = txt

        # Link yoksa metinden ayır
        if not baba_adi:
            orijin_str = td_orijin.get_text(strip=True)
            parts = orijin_str.split('-')
            baba_adi = parts[0].strip() if len(parts) > 0 else None
            if len(parts) > 1:
                anne_part = parts[1].strip()
                if '/' in anne_part:
                    anne_adi, kisrak_babasi_adi = [x.strip() for x in anne_part.split('/', 1)]
                else:
                    anne_adi = anne_part

    # Sıklet / Kilo
    kilo_raw = cells[5].get_text(strip=True) if len(cells) > 5 else None
    kilo = parse_clean_float(kilo_raw)

    # Jokey
    td_jokey = cells[6] if len(cells) > 6 else None
    jokey_id = None
    jokey_ad = td_jokey.get_text(strip=True) if td_jokey else None
    if td_jokey:
        j_a = td_jokey.find('a')
        if j_a:
            jokey_ad = j_a.get_text(strip=True)
            jokey_id = parse_clean_int(extract_query_param(j_a.get('href'), 'QueryParameter_JokeyId'))

    # Sahip
    td_sahip = cells[7] if len(cells) > 7 else None
    sahip_id = None
    sahip_ad = td_sahip.get_text(strip=True) if td_sahip else None
    if td_sahip:
        s_a = td_sahip.find('a')
        if s_a:
            sahip_ad = s_a.get_text(strip=True)
            sahip_id = parse_clean_int(extract_query_param(s_a.get('href'), 'QueryParameter_SahipId'))

    # Antrenör
    td_ant = cells[8] if len(cells) > 8 else None
    antrenor_id = None
    antrenor_ad = td_ant.get_text(strip=True) if td_ant else None
    if td_ant:
        ant_a = td_ant.find('a')
        if ant_a:
            antrenor_ad = ant_a.get_text(strip=True)
            antrenor_id = parse_clean_int(extract_query_param(ant_a.get('href'), 'QueryParameter_AntrenorId'))

    # Start No (Kulvar - St)
    st_raw = cells[9].get_text(strip=True) if len(cells) > 9 else None
    start_no = parse_clean_int(st_raw)

    # Handikap Puanı (HP)
    hp_raw = cells[10].get_text(strip=True) if len(cells) > 10 else None
    handikap_puani = parse_clean_int(hp_raw)

    # Son 6 Yarış
    son_6_yaris = cells[11].get_text(strip=True) if len(cells) > 11 else None

    # KGS (Koşmadığı Gün Sayısı)
    kgs_raw = cells[12].get_text(strip=True) if len(cells) > 12 else None
    kgs = parse_clean_int(kgs_raw)

    # s20
    s20_raw = cells[13].get_text(strip=True) if len(cells) > 13 else None
    s20 = parse_clean_int(s20_raw)

    # En İyi Derece
    en_iyi_d_raw = cells[14].get_text(strip=True) if len(cells) > 14 else None

    # Ganyan
    gny_raw = cells[15].get_text(strip=True) if len(cells) > 15 else None
    ganyan_oran = parse_clean_float(gny_raw)

    # AGF
    agf_raw = cells[16].get_text(strip=True) if len(cells) > 16 else None
    agf_orani = parse_clean_float(agf_raw)

    return {
        "kosu_id": race_id,
        "at_id": at_id,
        "at_no": at_no,
        "at_adi": at_adi,
        "forma_img_url": forma_url,
        "start_no": start_no,
        "kilo": kilo,
        "kilo_raw": kilo_raw,
        "takilar": takilar_str,
        "ekuri": ekuri,
        "yas_cinsiyet": yas_cins_raw,
        "yas": yas,
        "baba_id": baba_id,
        "baba_adi": baba_adi,
        "anne_id": anne_id,
        "anne_adi": anne_adi,
        "kisrak_babasi_adi": kisrak_babasi_adi,
        "jokey_id": jokey_id,
        "jokey_ad": jokey_ad,
        "sahip_id": sahip_id,
        "sahip_ad": sahip_ad,
        "antrenor_id": antrenor_id,
        "antrenor_ad": antrenor_ad,
        "handikap_puani": handikap_puani,
        "handikap_raw": hp_raw,
        "son_6_yaris": son_6_yaris,
        "kgs": kgs,
        "s20": s20,
        "en_iyi_derece_raw": en_iyi_d_raw,
        "ganyan_oran": ganyan_oran,
        "ganyan_raw": gny_raw,
        "agf_orani": agf_orani,
        "agf_raw": agf_raw,
        "veri_durumu": "TAM" if at_id else "EKSIK",
        "hata_notu": None if at_id else "TJK AtId bulunamadı"
    }


def parse_daily_race_program_html(html_content, sehir_id, sehir_adi, tarih_iso):
    """
    TJK Günlük Yarış Programı HTML çıktısını tam olarak parse eder.
    Koşular ve içindeki tüm atları içeren yapılandırılmış dict listesi döner.
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    race_details = soup.find_all('div', class_='race-details')
    tables = soup.find_all('table', class_='tablesorter')

    total_races = min(len(race_details), len(tables))
    parsed_kosular = []

    for i in range(total_races):
        kosu_no = i + 1
        rd = race_details[i]
        header_data = parse_race_details_header(rd, kosu_no)
        header_data["tarih"] = tarih_iso
        header_data["hipodrom_id"] = sehir_id

        # At satırları ve İdman Linki
        table = tables[i]
        kosu_kodu = None
        idman_atkodu = None
        idman_a = table.find('a', href=lambda h: h and 'KosuKodu=' in h and 'Atkodu=' in h)
        if idman_a:
            m_k = re.search(r'KosuKodu=(\d+)', idman_a['href'])
            m_at = re.search(r'Atkodu=(\d+)', idman_a['href'])
            if m_k:
                kosu_kodu = int(m_k.group(1))
            if m_at:
                idman_atkodu = int(m_at.group(1))

        header_data["kosu_kodu"] = kosu_kodu
        header_data["idman_atkodu"] = idman_atkodu

        tbody = table.find('tbody')
        rows = tbody.find_all('tr') if tbody else table.find_all('tr')[1:]

        atlar = []
        for r in rows:
            horse_data = parse_horse_row(r, None)
            if horse_data:
                atlar.append(horse_data)

        header_data["beklenen_at_sayisi"] = len(atlar)
        header_data["atlar"] = atlar
        parsed_kosular.append(header_data)

    return parsed_kosular


# --------------------------------------------------------------------------
# 2. HER ATIN TÜM GEÇMİŞ BİLGİLERİ VE PROFİLİNİ AYRIŞTIRMA
# --------------------------------------------------------------------------

def parse_horse_profile_html(html_content, at_id):
    """
    TJK 'AtKosuBilgileri' profil sayfasından:
    - Doğum tarihi, Orijin, Yetiştirici, Gerçek Sahip
    - Toplam yarış, 1-5'likler, Toplam kazanç
    - Pist performans özetleri (Çim, Kum, Sentetik)
    - Kariyerindeki TÜM geçmiş yarış kayıtlarını
    eksiksiz olarak çıkarır.
    """
    soup = BeautifulSoup(html_content, 'html.parser')

    at_adi = soup.title.get_text(strip=True) if soup.title else None

    # 1. tabs-1 Bilgileri
    tab1 = soup.find('div', id='tabs-1')
    tab1_text = tab1.get_text(" | ", strip=True) if tab1 else ""

    # Doğum Tarihi (örn: 14.04.2024)
    dogum_m = re.search(r'Doğ\.\s*Trh\s*\|\s*([0-9.]+)', tab1_text, re.I)
    dogum_tarihi = dogum_m.group(1).strip() if dogum_m else None

    # Yaş ve Cinsiyet (örn: 2 y de)
    yas_m = re.search(r'Yaş\s*\|\s*([^|]+)', tab1_text, re.I)
    yas_cinsiyet = yas_m.group(1).strip() if yas_m else None

    # Irk
    irk = "Arap" if (yas_cinsiyet and 'a' in yas_cinsiyet.lower() and 'k' in yas_cinsiyet.lower()) else "İngiliz"

    # Gerçek Sahip
    sahip_m = re.search(r'Gerçek\s*Sahip\s*\|\s*([^|]+)', tab1_text, re.I)
    gercek_sahip = sahip_m.group(1).strip() if sahip_m else None

    # Yetiştirici
    yet_m = re.search(r'Yetiştirici\s*\|\s*([^|]+)', tab1_text, re.I)
    yetistirici = yet_m.group(1).strip() if yet_m else None

    # Toplam Kazanç
    kazanc_m = re.search(r'Kazanç\s*\|\s*([0-9.]+)\s*t?', tab1_text, re.I)
    toplam_kazanc = parse_money(kazanc_m.group(1)) if kazanc_m else None
    toplam_kazanc_raw = kazanc_m.group(1) if kazanc_m else None

    # Tablo 0: Özet İstatistikler (TOPLAM, 2026, Çim, Kum, Sentetik)
    tables = soup.find_all('table', class_='tablesorter')
    toplam_kosu = None
    birincilik = None
    ikincilik = None
    ucunculuk = None
    dordunculuk = None
    besincilik = None
    cim_perf = None
    kum_perf = None
    sentetik_perf = None

    if len(tables) > 0:
        table_summary = tables[0]
        for tr in table_summary.find_all('tr'):
            cells = [td.get_text(strip=True) for td in tr.find_all(['td', 'th'])]
            if not cells:
                continue
            cat = cells[0].upper()
            if 'TOPLAM' in cat and len(cells) >= 7:
                toplam_kosu = parse_clean_int(cells[1])
                birincilik = parse_clean_int(cells[2])
                ikincilik = parse_clean_int(cells[3])
                ucunculuk = parse_clean_int(cells[4])
                dordunculuk = parse_clean_int(cells[5]) if len(cells) > 5 else None
                besincilik = parse_clean_int(cells[6]) if len(cells) > 6 else None
            elif 'ÇİM' in cat or 'CIM' in cat:
                cim_perf = " | ".join(cells)
            elif 'KUM' in cat:
                kum_perf = " | ".join(cells)
            elif 'SENTETİK' in cat or 'SENTETIK' in cat:
                sentetik_perf = " | ".join(cells)

    # Tablo 1: Geçmiş Koşular (Tüm Liste)
    gecmis_yarislar = []
    if len(tables) > 1:
        table_races = tables[1]
        tbody = table_races.find('tbody')
        rows = tbody.find_all('tr') if tbody else table_races.find_all('tr')[1:]

        for r in rows:
            cells = [td.get_text(strip=True) for td in r.find_all(['td', 'th'])]
            # Sitede gösterilen sayfa altı özet satırını atla
            if len(cells) < 10 or 'sonuçtan' in cells[0]:
                continue

            # Headers: Tarih, Şehir, Msf, Pist, S, Derece, Sıklet, Takı, Jokey, St, Gny, Grup, K. No, Kcins, Ant, Sahip, HP, Ikramiye, S20
            tarih_str = cells[0]
            sehir = cells[1]
            mesafe_raw = cells[2]
            mesafe = parse_clean_int(mesafe_raw)
            pist_raw = cells[3]

            pist_turu = "Kum"
            if "Ç" in pist_raw or "ç" in pist_raw:
                pist_turu = "Çim"
            elif "S" in pist_raw or "s" in pist_raw:
                pist_turu = "Sentetik"

            pist_durumu = pist_raw.split(':')[-1] if ':' in pist_raw else None

            sira_raw = cells[4]
            sira = parse_clean_int(sira_raw)

            derece_raw = cells[5]
            derece_saniye = parse_degree_to_seconds(derece_raw)

            kilo_raw = cells[6]
            kilo = parse_clean_float(kilo_raw)

            taki = cells[7] if len(cells) > 7 else None
            jokey = cells[8] if len(cells) > 8 else None
            st = parse_clean_int(cells[9]) if len(cells) > 9 else None

            gny_raw = cells[10] if len(cells) > 10 else None
            gny = parse_clean_float(gny_raw)

            grup = cells[11] if len(cells) > 11 else None
            kosu_no = parse_clean_int(cells[12]) if len(cells) > 12 else 1
            kosu_cinsi = cells[13] if len(cells) > 13 else None
            ant_ad = cells[14] if len(cells) > 14 else None
            sahip_ad = cells[15] if len(cells) > 15 else None

            hp_raw = cells[16] if len(cells) > 16 else None
            hp = parse_clean_int(hp_raw)

            ikramiye_raw = cells[17] if len(cells) > 17 else None
            ikramiye = parse_money(ikramiye_raw)

            s20 = parse_clean_int(cells[18]) if len(cells) > 18 else None

            # Fark varsa 19 veya 20. hücre
            fark = cells[19] if len(cells) > 19 and cells[19] else None

            gecmis_yarislar.append({
                "at_id": at_id,
                "tarih": tarih_str,
                "hipodrom_sehir": sehir,
                "mesafe": mesafe,
                "mesafe_raw": mesafe_raw,
                "pist_turu": pist_turu,
                "pist_durumu": pist_durumu,
                "pist_raw": pist_raw,
                "sira": sira,
                "sira_raw": sira_raw,
                "derece_raw": derece_raw,
                "derece_saniye": derece_saniye,
                "kilo": kilo,
                "kilo_raw": kilo_raw,
                "jokey_ad": jokey,
                "start_no": st,
                "taki": taki,
                "ganyan": gny,
                "ganyan_raw": gny_raw,
                "grup": grup,
                "kosu_no": kosu_no,
                "kosu_cinsi": kosu_cinsi,
                "antrenor_ad": ant_ad,
                "sahip_ad": sahip_ad,
                "handikap": hp,
                "handikap_raw": hp_raw,
                "ikramiye": ikramiye,
                "ikramiye_raw": ikramiye_raw,
                "s20": s20,
                "fark": fark,
                "raw_satir_json": json.dumps(cells, ensure_ascii=False)
            })

    profile_data = {
        "id": at_id,
        "at_adi": at_adi,
        "dogum_tarihi": dogum_tarihi,
        "yas_cinsiyet": yas_cinsiyet,
        "irk": irk,
        "gercek_sahip": gercek_sahip,
        "yetistirici": yetistirici,
        "toplam_kosu": toplam_kosu or len(gecmis_yarislar),
        "birincilik_sayisi": birincilik,
        "ikincilik_sayisi": ikincilik,
        "ucunculuk_sayisi": ucunculuk,
        "dordunculuk_sayisi": dordunculuk,
        "besincilik_sayisi": besincilik,
        "toplam_kazanc": toplam_kazanc,
        "toplam_kazanc_raw": toplam_kazanc_raw,
        "cim_performans": cim_perf,
        "kum_performans": kum_perf,
        "sentetik_performans": sentetik_perf,
        "profil_eksik_mi": False,
        "gecmis_yarislar": gecmis_yarislar
    }

    return profile_data


# --------------------------------------------------------------------------
# 3. GÜNLÜK YARIŞ SONUÇLARI VE GİDİŞAT AYRIŞTIRMA (GunlukYarisSonuclari)
# --------------------------------------------------------------------------

def parse_daily_race_results_html(html, sehir_id, sehir_adi, target_date_iso):
    """
    TJK GunlukYarisSonuclari sayfasındaki tüm koşuları ve bitiriş/gidişat detaylarını ayrıştırır.
    Her koşu için: mesafe, pist, son 800, video linki, accurace linki, komiser raporu.
    Her at için: sıra, at_id, isim, derece (sn), fark (boy), geç çıkış (boy), ganyan, AGF, start_no, HP.
    """
    if not html:
        return []

    soup = BeautifulSoup(html, 'html.parser')
    panes = soup.find('div', class_='races-panes')
    if not panes:
        return []

    races = []
    race_divs = [c for c in panes.children if getattr(c, 'name', None) == 'div']

    for div_idx, div in enumerate(race_divs):
        # 1. Koşu No ve Saat
        kosu_no = div_idx + 1
        saat = None
        for elem in div.find_all(True):
            t = elem.get_text(strip=True)
            m = re.search(r'(\d+)\.\s*Koşu(?:\s*(\d{1,2}[\.:]\d{2}))?', t)
            if m:
                kosu_no = int(m.group(1))
                saat = m.group(2).replace('.', ':') if m.group(2) else None
                break

        rh = div.find('h3', class_='race-config')
        config_text = rh.get_text(" ", strip=True) if rh else ""

        # Mesafe & Pist
        mesafe = None
        pist_turu = "Kum"
        m_msf = re.search(r'(\d{3,4})\s*(?:m|metre)?\s*(Kum|Çim|Sentetik)', config_text, re.I)
        if m_msf:
            mesafe = int(m_msf.group(1))
            pist_turu = m_msf.group(2).title()
        else:
            m_m = re.search(r'(\d{3,4})', config_text)
            mesafe = int(m_m.group(1)) if m_m else None
            m_p = re.search(r'(Kum|Çim|Sentetik)', config_text, re.I)
            if m_p:
                pist_turu = m_p.group(1).title()

        kosu_cinsi = config_text.split(',')[0].strip() if ',' in config_text else config_text[:40].strip()
        grup_bilgisi = config_text.split(',')[1].strip() if ',' in config_text and len(config_text.split(',')) > 1 else ""

        # Linkler
        video_url = None
        kosu_kodu = None
        video_a = rh.find('a', href=lambda h: h and 'KosuKodu' in h) if rh else None
        if video_a:
            v_href = video_a['href']
            video_url = "https://www.tjk.org/TR/YarisSever/Info/" + v_href.lstrip('./') if not v_href.startswith('http') else v_href
            m_k = re.search(r'KosuKodu=(\d+)', v_href)
            if m_k:
                kosu_kodu = int(m_k.group(1))

        accurace_url = None
        acc_a = rh.find('a', href=lambda h: h and 'accurace' in h) if rh else None
        if acc_a:
            accurace_url = acc_a['href']

        fotofinish_url = None
        foto_a = rh.find('a', href=lambda h: h and 'fotoftp' in h) if rh else None
        if foto_a:
            fotofinish_url = foto_a['href']

        komiser_url = None
        kom_a = div.find('a', href=lambda h: h and 'raporftp' in h and '.pdf' in h)
        if kom_a:
            komiser_url = kom_a['href']

        # Son 800 Derecesi
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
                    if m_id:
                        at_id = int(m_id.group(1))
                    at_name = at_a.get_text(strip=True)
                else:
                    at_name = at_td.get_text(strip=True)

                m_no = re.search(r'\((\d+)\)', at_td.get_text())
                at_no = int(m_no.group(1)) if m_no else None

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


# --------------------------------------------------------------------------
# 4. RESMÎ TJK İDMAN PİSTİ VE GALOP VERİLERİ AYRIŞTIRMA
# --------------------------------------------------------------------------

def parse_tjk_idman_html(html_content, kosu_no, hipodrom_id, tarih_iso, kosu_kodu):
    """
    TJK /Info/idmanpisti/Kosu sayfasındaki resmî galop tablosunu ayrıştırır.
    Her at için:
    at_no, at_adi, d_1200, d_1000, d_800, d_600, d_400, d_200,
    idman_tarihi, pist_turu, idman_turu, idman_hipodromu,
    derece_ozet, son_400_hiz_kmh, durum_kodu
    """
    if not html_content:
        return {}

    soup = BeautifulSoup(html_content, 'html.parser')
    tbl = soup.find('table')
    if not tbl:
        return {}

    galop_map = {}
    rows = tbl.find_all('tr')[1:]
    for r in rows:
        tds = [td.get_text(strip=True) for td in r.find_all(['td', 'th'])]
        if len(tds) < 17:
            continue

        at_no_str = tds[0]
        at_adi = tds[1]
        clean_at_adi = re.sub(r'\s*\(\d+\)\s*$', '', at_adi).strip()

        d_1200 = tds[7] if len(tds) > 7 else ""
        d_1000 = tds[8] if len(tds) > 8 else ""
        d_800 = tds[9] if len(tds) > 9 else ""
        d_600 = tds[10] if len(tds) > 10 else ""
        d_400 = tds[11] if len(tds) > 11 else ""
        d_200 = tds[12] if len(tds) > 12 else ""
        idman_tarihi = tds[13] if len(tds) > 13 else ""
        pist = tds[14] if len(tds) > 14 else ""
        idman_turu = tds[15] if len(tds) > 15 else ""
        idman_hipodromu = tds[16] if len(tds) > 16 else ""

        son400hiz = None
        main_derece = ""

        if d_400:
            main_derece = f"400: {d_400}"
            parts = d_400.split('.')
            try:
                if len(parts) == 3:
                    sec = int(parts[0]) * 60 + int(parts[1]) + int(parts[2]) / 100.0
                elif len(parts) == 2:
                    sec = int(parts[0]) + int(parts[1]) / 100.0
                else:
                    sec = float(d_400)
                if sec > 0:
                    son400hiz = round((400.0 / sec) * 3.6, 1)
            except Exception:
                pass
        elif d_600:
            parts = d_600.split('.')
            try:
                if len(parts) == 3:
                    sec = int(parts[0]) * 60 + int(parts[1]) + int(parts[2]) / 100.0
                elif len(parts) == 2:
                    sec = int(parts[0]) + int(parts[1]) / 100.0
                else:
                    sec = float(d_600)
                if sec > 0:
                    son400hiz = round((400.0 / (sec * 400.0 / 600.0)) * 3.6, 1)
            except Exception:
                pass

        if d_600:
            main_derece = f"600: {d_600} / " + main_derece if main_derece else f"600: {d_600}"
        if d_800:
            main_derece = f"800: {d_800} / " + main_derece if main_derece else f"800: {d_800}"
        if d_1000:
            main_derece = f"1000: {d_1000} / " + main_derece if main_derece else f"1000: {d_1000}"

        main_derece = main_derece.strip(" /")

        at_no = parse_clean_int(at_no_str) or 1
        rec = {
            "tarih": tarih_iso,
            "hipodrom_id": hipodrom_id,
            "kosu_no": kosu_no,
            "kosu_kodu": kosu_kodu,
            "at_no": at_no,
            "at_adi": clean_at_adi,
            "d_1200": d_1200,
            "d_1000": d_1000,
            "d_800": d_800,
            "d_600": d_600,
            "d_400": d_400,
            "d_200": d_200,
            "idman_tarihi": idman_tarihi,
            "pist_turu": pist,
            "idman_turu": idman_turu,
            "idman_hipodromu": idman_hipodromu,
            "derece_ozet": main_derece or "İdman Derecesi Yok",
            "son_400_hiz_kmh": son400hiz,
            "durum_kodu": f"{idman_hipodromu} {pist}" if idman_hipodromu else "ÇR"
        }
        galop_map[at_no] = rec

    return galop_map


def parse_altili_package_starts(html_content):
    """TJK programındaki 'N. 6'LI GANYAN Bu koşudan başlar' kartlarını bulur.

    Dönüş: [{"paketNo": 1, "baslangicKosu": 1}, {"paketNo": 2, "baslangicKosu": 3}]
    Böylece 8/9 koşulu programlarda 1. ve 2. altılı paketleri tahminle değil,
    TJK'nın kendi işaretleriyle ayrıştırılır.
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    packages = []
    seen = set()
    for card in soup.select('div.bahisTipiCard h4'):
        text = card.get_text(' ', strip=True)
        # Tek paketli hipodromlarda TJK başına "1." koymaz:
        # "6'LI GANYAN Bu koşudan başlar" da 1. paket sayılır.
        m = re.match(r"(?:(\d+)\.\s*)?6['’]?LI\s+GANYAN\s+Bu\s+koşudan\s+başlar", text, re.I)
        if not m:
            continue
        paket_no = int(m.group(1) or 1)
        start_race = None
        for parent in card.parents:
            parent_text = parent.get_text(' ', strip=True)
            rm = re.match(r"^(\d+)\.\s*Koşu\b", parent_text)
            if rm:
                start_race = int(rm.group(1))
                break
        if not start_race or (paket_no, start_race) in seen:
            continue
        seen.add((paket_no, start_race))
        packages.append({"paketNo": paket_no, "baslangicKosu": start_race})

    packages.sort(key=lambda p: (p["paketNo"], p["baslangicKosu"]))
    return packages
