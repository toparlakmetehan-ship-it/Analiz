# -*- coding: utf-8 -*-
"""
TJK Web Scraper ve Analiz Orkestrasyon Motoru
5 Aşamalı Günlük Otomatik Veri & Analiz Pipeline:
  Aşama 1: Dünün (ve işlenmemiş son günlerin) resmî sonuçları ve gidişat verilerini topla (yaris_sonuclari, gecmis_yarislar)
  Aşama 2: Bugün ve yarının resmî yarış programını eksiksiz topla (kosular, program_kayitlari)
  Aşama 3: Programdaki her at için kariyer geçmişini kontrol et ve yeni koşuları kaydet (gecmis_yarislar)
  Aşama 4: At bazında koşu stili / taktiği türet (turev_at_taktikleri - Kural 1 & 2'ye tam sadakat)
  Aşama 5: Koşu bazında tempo tahmini ve koşu içi etkileri türet (turev_kosu_tempolari, turev_kosu_at_etkileri)
  Aşama 6: Canlı bülten JSON dosyalarını (bulten_bugun.json, bulten_yarin.json) doğrulanmış verilerle güncelle
  Aşama 7: Doğrulama ve ayrıntılı özet raporu sun
"""

import os
import re
import json
import time
import urllib.parse
import logging
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import requests
from bs4 import BeautifulSoup

from .db import (
    get_db_connection,
    upsert_hipodrom,
    upsert_kosu,
    upsert_at,
    upsert_jokey,
    upsert_antrenor,
    upsert_sahip,
    upsert_program_kaydi,
    upsert_gecmis_yaris,
    upsert_yaris_sonucu,
    upsert_idman_kaydi,
    check_yaris_sonucu_exists,
    check_gecmis_yaris_exists,
    get_cached_at_ids_today,
    log_scrape_run,
    replace_altili_paketleri,
    get_altili_paketleri
)
from .parser import (
    parse_daily_race_program_html,
    parse_horse_profile_html,
    parse_daily_race_results_html,
    parse_tjk_idman_html,
    parse_altili_package_starts
)
from .analytics import run_full_tactical_and_pace_pipeline
from .accurace import fetch_race, normalize_city_slug, parse_race_date
from .validator import validate_database_integrity, print_validation_report

# Log yapılandırması
logger = logging.getLogger("TJKScraper")

# TJK Bilinen Resmî Hipodromları
TJK_HIPODROMLAR = [
    (1, "Ankara", "Ankara 75. Yıl Hipodromu"),
    (2, "İstanbul", "İstanbul Veliefendi Hipodromu"),
    (3, "İzmir", "İzmir Şirinyer Hipodromu"),
    (4, "Bursa", "Bursa Osmangazi Hipodromu"),
    (5, "Adana", "Adana Yeşiloba Hipodromu"),
    (6, "Şanlıurfa", "Şanlıurfa Hipodromu"),
    (7, "Elazığ", "Elazığ Hipodromu"),
    (8, "Diyarbakır", "Diyarbakır Hipodromu"),
    (9, "Kocaeli", "Kocaeli Kartepe Hipodromu"),
    (10, "Antalya", "Antalya Hipodromu")
]

BASE_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
    "Connection": "keep-alive"
}


# Pist yatkınlığında kullanılan aygır soy eğilimleri (JS enricher ile aynı sözlük).
PIST_SIRE_BIAS = {
    # 1. KABA KUM DOMİNANT (Arap & İngiliz)
    'OVA': ('KUM', 'Kaba Kum & Çamur Otoritesi (Şentay Hattı)'),
    'SANCAKBEYI': ('KUM', 'Ağır Kaba Kum Efsanesi'),
    'HABERBATUR': ('KUM', 'Arap Kaba Kum Güç Hattı'),
    'OZGUNHAN': ('KUM', 'Arap Kaba Kum Otoritesi'),
    'BILGIN': ('KUM', 'Arap Kaba Kum & Çamur Ustası'),
    'GOBAK BEY': ('KUM', 'Kaba Kum Arap Güç Hattı'),
    'GOBAKTI': ('KUM', 'Kaba Kum Arap Güç Hattı'),
    'ALTAHA': ('KUM', 'Kaba Kum Güç & Dayanıklılık'),
    'SENTAY': ('KUM', 'Kaba Kum Efsanesi'),
    'TUMOZ BEY': ('KUM', 'Kaba Kum Güç Hattı'),
    'AYABAKAN': ('KUM', 'Kaba Kum Güçlü Hat'),
    'KARAUZUM': ('KUM', 'Kaba Kum Dayanıklılık'),
    'GUNTAY': ('KUM', 'Kaba Kum Güçlü Hat'),
    'BERKSOY': ('KUM', 'Kaba Kum Sert Aygır'),
    'UCANOGLU': ('KUM', 'Kaba Kum Güç Hattı'),
    'SARRAF': ('KUM', 'Kaba Kum Erken Sürat & Güç'),
    'DEMIRKAZIK': ('KUM', 'Kaba Kum Otoritesi'),
    'KAFKAS SAHI': ('KUM', 'Kaba Kum Güç Hattı'),
    'GELIBOLU': ('KUM', 'Kaba Kum Güç Hattı'),
    'EMBIR HAN': ('KUM', 'Kaba Kum Güç Hattı'),
    'DAYIBEY': ('KUM', 'Kaba Kum Güç Hattı'),
    'BABA MEVLUT': ('KUM', 'Kaba Kum Güç Hattı'),
    'YELGECEN': ('KUM', 'Kaba Kum Hattı'),
    'COMERTKAN': ('KUM', 'Kaba Kum Güç Hattı'),
    'SONALP': ('KUM', 'Kaba Kum Hattı'),
    'YAKUPBEY': ('KUM', 'Kaba Kum Hattı'),
    'HURBATUR': ('KUM', 'Ağır Kum & Çamur Efsanesi'),
    'SERGEN': ('KUM', 'Kaba Kum Güç Hattı'),
    'KAMAN': ('KUM', 'Kaba Kum Güç Hattı'),
    'DILIRAN': ('KUM', 'Kaba Kum Güç Hattı'),
    'GUMBURGUMBUR': ('KUM', 'Kaba Kum Sprint & Güç'),
    'ORCUN': ('KUM', 'Kaba Kum & Dayanıklılık'),
    'UCANBEY': ('KUM', 'Kaba Kum Güç Hattı'),
    'DAREDEVIL': ('KUM', 'Safkan Kaba Kum Gücü'),
    'BODEMEISTER': ('KUM', 'Kaba Kum Güç & Dayanıklılık'),
    'TIZWAY': ('KUM', 'Kaba Kum Klasik Mesafe Aygırı'),
    'CUVEE': ('KUM', 'Kaba Kum Erken Sürat Aygırı'),
    'LION HEART': ('KUM', 'Kaba Kum Dayanıklı Sprint'),
    'CORINTHIAN': ('KUM', 'Kaba Kum Gücü Yüksek'),
    'RUN AWAY AND HIDE': ('KUM', 'Kaba Kum Erken Hız ve Güç'),
    'SUPER SAVER': ('KUM', 'Kaba Kum ve Ağır Pist Şampiyonu'),
    'BOSPORUS': ('KUM', 'Kaba Kum Sürat Otoritesi'),
    'SPEEDY WOLF': ('KUM', 'Kaba Kum Sprint Hattı'),
    'EXPANSION': ('KUM', 'Kaba Kum Güç Hattı'),
    'HAKEEM': ('KUM', 'Kaba Kum Güçlü Hat'),
    'PULPIT': ('KUM', 'Kaba Kum Amerikan Hattı'),
    'TAPIT': ('KUM', 'Kaba Kum Efsanesi'),
    'UNACCOUNTED FOR': ('KUM', 'Kaba Kum Dayanıklılık Efsanesi'),
    'STRIKE THE GOLD': ('KUM', 'Kaba Kum ve Çamur Efsanesi'),
    'WEST BY WEST': ('KUM', 'Kaba Kum Otoritesi'),
    'ROYAL ABJAR': ('KUM', 'Kaba Kum Sürat Hattı'),
    'TRIPPE DAYS': ('KUM', 'Kaba Kum Sürat Hattı'),
    'DUTYFREE': ('KUM', 'Kaba Kum Sürat Gücü'),
    'AFTER MARKET': ('KUM', 'Kaba Kum Güç Hattı'),
    'TALIPHAN': ('KUM', 'Kaba Kum ve Güç Hattı'),
    # 2. DUAL (KUM & SENTETİK)
    'VICTORY GALLOP': ('DUAL', 'Kum & Sentetik Şampiyonu'),
    'KAIZBERT': ('DUAL', 'Kum ve Sentetikte Yenilmez (Arap)'),
    'PAPA CLEM': ('DUAL', 'Kum & Sentetik Dengeli Hat'),
    'MENDIP': ('DUAL', 'Kum ve Sentetikte Yüksek Form'),
    'OZHABER': ('DUAL', 'Kum & Sentetik Çift Yönlü'),
    'KANEKO': ('DUAL', 'Kum & Sentetik Güçlü Hat'),
    'TURBO': ('DUAL', 'Kum & Sentetikte Üst Düzey Güç'),
    'AUTHORIZED': ('DUAL', 'Kum & Çim Dayanıklı Hat'),
    'SMART ROBIN': ('DUAL', 'Kum & Sentetik Dengeli Hat'),
    'TAMERINOGLU': ('DUAL', 'Kum & Sentetik Başarılı'),
    'GURSU': ('DUAL', 'Kum & Sentetik Çift Yönlü'),
    # 3. SENTETİK & ÇİM
    'NATIVE KHAN': ('SENTETIK', 'Sentetik & Çim Otoritesi'),
    'TOROK': ('SENTETIK', 'Sentetik ve Çim Uzmanı'),
    'LUXOR': ('SENTETIK', 'Sentetik / Açık Koşu Çim Uzmanı'),
    "FAST 'N' FAMOUS": ('SENTETIK', 'Sentetik Sprint Gücü'),
    'INVINCIBLE SPIRIT': ('SENTETIK', 'Sentetik / All-Weather Orijini'),
    'APPROVE': ('SENTETIK', 'Sentetik Sprint Yatkını'),
    'SATONO ARES': ('SENTETIK', 'Sentetik & Çim Japon Hattı'),
}


def normalize_horse_name(name):
    if not name:
        return ""
    trans = str.maketrans("İıŞşĞğÜüÖöÇç", "IISSGGUUOOCC")
    return name.translate(trans).upper().strip()


def find_pedigree_bias(name):
    norm = normalize_horse_name(name)
    if not norm:
        return None
    for key, val in PIST_SIRE_BIAS.items():
        norm_key = normalize_horse_name(key)
        if norm_key in norm or norm in norm_key:
            return val
    return None


def build_pist_aptitude(conn, at_id, is_young, race_track, sire_name="", dam_sire="", running_style=""):
    """Geçmiş yarışlardan kum/sentetik/çim istatistiklerini ve pist deltasını üretir."""
    empty = {"runs": 0, "wins": 0, "top4": 0}
    dirt, syn, turf = dict(empty), dict(empty), dict(empty)

    if at_id:
        rows = conn.execute(
            "SELECT pist_turu, sira FROM gecmis_yarislar WHERE at_id = ?", (at_id,)
        ).fetchall()
        for row in rows:
            trk = (row["pist_turu"] or "").strip()
            if "Sentetik" in trk:
                bucket = syn
            elif "Çim" in trk or "Cim" in trk:
                bucket = turf
            elif "Kum" in trk:
                bucket = dirt
            else:
                continue
            bucket["runs"] += 1
            raw_rank = str(row["sira"] or "").strip()
            rank = int(raw_rank) if raw_rank.isdigit() else 99
            if rank == 1:
                bucket["wins"] += 1
            if rank <= 4:
                bucket["top4"] += 1

    stats = {
        "dirtStats": dict(dirt),
        "synStats": dict(syn),
        "turfStats": dict(turf),
    }

    if is_young:
        return {
            "badge": "🌱 Pist Deneyimi: İlk 3 Koşusu (Pist & Taktik Nötr)",
            "delta": 0,
            "color": "#38bdf8",
            "desc": "Safkan kariyerinin başında (≤3 yarış). Pist adaptasyonu ve gidişatı henüz oturmadığı için puanı nötr tutulur.",
            **stats,
        }

    track = (race_track or "").strip().lower()
    badge, delta, color, desc = "", 0, "#f3e5ab", ""

    if "sentetik" in track:
        if dirt["wins"] >= 1 and syn["wins"] >= 1:
            badge = f"⭐ DUAL-PİST USTASI (Kum: {dirt['wins']}G/{dirt['top4']}T · Sentetik: {syn['wins']}G/{syn['top4']}T)"
            delta, color = 2, "#34d399"
            desc = "Hem Kaba Kumda hem Sentetik pistte galibiyete sahip elit safkan; pist seçmez, sentetikte de çok diridir."
        elif (dirt["wins"] >= 1 and syn["top4"] >= 2) or (syn["wins"] >= 1 and dirt["top4"] >= 2):
            badge = "⚖️ ÇİFT PİST UYUMLU (Kum & Sentetik Formu Yüksek)"
            delta, color = 1, "#34d399"
            desc = "Her iki zeminde de tabela ve galibiyet tecrübesi bulunuyor, sentetik zemine sorunsuz uyum sağlar."
        elif syn["runs"] >= 3 and syn["wins"] >= 2 and (syn["top4"] / syn["runs"]) >= 0.4:
            badge = f"👑 SENTETİK PİST UZMANI (Sentetikte {syn['wins']}G / {syn['top4']} Tabela)"
            delta, color = 2, "#10b981"
            desc = f"Sentetik pistte {syn['runs']} koşuda {syn['wins']} galibiyet, {syn['top4']} tabela başarısı bulunuyor. Bu zeminde aksiyonu son derece akıcıdır."
        elif syn["runs"] >= 2 and (syn["wins"] >= 1 or (syn["top4"] / syn["runs"]) >= 0.5):
            badge = f"🔥 SENTETİK PİST DENEYİMLİ ({syn['wins']}G / {syn['top4']}T)"
            delta, color = 1, "#10b981"
            desc = f"Sentetikte {syn['runs']} koşuda {syn['wins']}G/{syn['top4']}T elde etti; sentetik zemine ayak uyumu yüksektir."
        elif syn["runs"] >= 3 and syn["top4"] == 0 and dirt["top4"] >= 2:
            badge = "⚠️ PİST RİSKİ: KABA KUM TERCİHLİ (Sentetikte 0 Tabela)"
            delta, color = -2, "#ef4444"
            desc = f"Kaba kumda {dirt['runs']} koşuda {dirt['top4']} tabela yapmasına rağmen, sentetikte {syn['runs']} koşuda tabelaya giremedi. Sentetik zemin aksiyonunu olumsuz etkileyebilir."
        elif syn["runs"] == 0 and dirt["runs"] >= 3:
            sire_key = (sire_name or "").upper()
            match = next(((bias, text) for key, (bias, text) in PIST_SIRE_BIAS.items() if key in sire_key), None)
            if match and match[0] in ("SENTETIK", "DUAL"):
                badge = f"🌱 SENTETİKTE İLK KEZ: Soyu ({match[1]}) Sentetikle Uyumlu"
                delta, color = 0, "#38bdf8"
                desc = f"Kariyerinde sentetik koşusu yok ancak aygırı {match[1]} olduğundan sentetik aksiyonuna yatkındır."
            else:
                badge = "⚠️ SENTETİKTE İLK KEZ: Kaba Kum Formu Var"
                delta, color = -1, "#f59e0b"
                desc = f"Kariyerindeki {dirt['runs']} koşunun tamamını Kaba Kumda koştu; sentetik pistin yapısına ilk kez çıkıyor, hafif adaptasyon payı ayrıldı."
        else:
            detail = f"{syn['runs']} Koşuda {syn['top4']} Tabela" if syn["runs"] > 0 else "Dengeli Hat"
            badge = f"🏟️ Sentetik Pist Uyumlu ({detail})"
            delta, color = (1 if syn["top4"] >= 2 else 0), "#f3e5ab"
            desc = "Sentetik pist tecrübesi mevcut; koşu sınıfına göre performansını sahaya yansıtması beklenir."

    elif "kum" in track:
        if dirt["wins"] >= 1 and syn["wins"] >= 1:
            badge = f"⭐ DUAL-PİST USTASI (Kum: {dirt['wins']}G/{dirt['top4']}T · Sentetik: {syn['wins']}G/{syn['top4']}T)"
            delta, color = 2, "#34d399"
            desc = "Hem Kaba Kumda hem Sentetikte galibiyet yapmış çok yönlü safkan; pist şartı seçmeksizin yüksek performans sergiler."
        elif (dirt["wins"] >= 1 and syn["top4"] >= 2) or (syn["wins"] >= 1 and dirt["top4"] >= 2):
            badge = "⚖️ ÇİFT PİST UYUMLU (Kum & Sentetik Formu Yüksek)"
            delta, color = 1, "#34d399"
            desc = "Her iki zeminde de tabela ve galibiyet başarısı var, ağır kumda da etkili koşması beklenir."
        elif dirt["runs"] >= 3 and dirt["wins"] >= 2 and (dirt["top4"] / dirt["runs"]) >= 0.4:
            badge = f"🔥 KABA KUM UZMANI (Kumda {dirt['wins']}G / {dirt['top4']} Tabela)"
            delta, color = 2, "#10b981"
            desc = f"Kaba kumda {dirt['runs']} koşuda {dirt['wins']} galibiyet, {dirt['top4']} tabela elde etti. Ağır kum ve kickback altında mücadele gücü çok yüksektir."
        elif dirt["runs"] >= 2 and (dirt["wins"] >= 1 or (dirt["top4"] / dirt["runs"]) >= 0.5):
            badge = f"🔥 KABA KUM DENEYİMLİ (${dirt['wins']}G / ${dirt['top4']}T)"
            delta, color = 1, "#10b981"
            desc = f"Kaba kumda {dirt['runs']} koşuda {dirt['wins']}G/{dirt['top4']}T elde etti, zemin şartlarına aşinadır."
        elif dirt["runs"] == 0 and syn["runs"] >= 3:
            style_str = (running_style or "").lower()
            is_kacak = ("kaçak" in style_str) or ("kacak" in style_str) or ("lider" in style_str)
            is_pres = "pres" in style_str

            sire_match = find_pedigree_bias(sire_name)
            dam_sire_match = find_pedigree_bias(dam_sire)

            has_kum_ped = (sire_match and sire_match[0] in ("KUM", "DUAL")) or (dam_sire_match and dam_sire_match[0] in ("KUM", "DUAL"))
            ped_text = (sire_match[1] if (sire_match and sire_match[0] in ("KUM", "DUAL")) else (dam_sire_match[1] if dam_sire_match else "Kaba Kum Hattı"))

            if has_kum_ped and is_kacak:
                badge = "🛡️ KABA KUMA İLK KEZ (Kum Orijinli & Kaçak - Kickback Muafiyeti)"
                delta, color = 0, "#38bdf8"
                desc = f"Kariyerindeki {syn['runs']} koşuyu sentetikte koştu; soyunda ({ped_text}) kaba kum genetiği tamdır. Kaçak/Lider stili sayesinde öndeki atlardan gelecek kum sıçramasına (kickback) maruz kalmayacaktır."
            elif has_kum_ped and is_pres:
                badge = "🛡️ KABA KUMA İLK KEZ (Kum Orijinli & Ön Grup Pres)"
                delta, color = 0, "#38bdf8"
                desc = f"Kariyerindeki {syn['runs']} koşuyu sentetikte koştu; soyunda ({ped_text}) kaba kum gücü mevcut. Ön grupta pres yapacağı için kickback etkisi önemsizdir."
            elif has_kum_ped:
                badge = "⚠️ KABA KUMA İLK KEZ (Kum Orijinli - Geride Kickback Riski)"
                delta, color = -1, "#f59e0b"
                desc = f"Soyunda ({ped_text}) kaba kum genetiği mevcut ancak bekleme/sprinter stili nedeniyle ön gruptan sıçrayacak kum parçalarına (kickback) ilk kez maruz kalacaktır."
            elif is_kacak:
                badge = "⚠️ KABA KUMA İLK KEZ (Kaçak Stille Kickback Yok / Derin Kum Testi)"
                delta, color = -1, "#f59e0b"
                desc = "Soyunda kaba kum baskınlığı sınırlı. Kaçak stiliyle kickback yemeyecek olsa da kaba kumun derin yapısına ilk kez ayak uydurmaya çalışacaktır."
            else:
                badge = "⚠️ PİST RİSKİ: SENTETİK ATI (Kaba Kuma İlk Kez Çıkıyor)"
                delta, color = -2, "#ef4444"
                desc = f"Kariyerindeki {syn['runs']} koşuyu sentetikte koştu; kaba kumun derin yapısına ve geriden gelirken önden sıçrayacak kum parçalarına (kickback) ilk kez maruz kalacaktır."
        elif dirt["runs"] >= 3 and dirt["top4"] == 0 and (syn["top4"] >= 2 or turf["top4"] >= 2):
            badge = "⚠️ PİST UYARISI: Kaba Kumda 0 Tabela (Sentetik/Çim Atı)"
            delta, color = -2, "#ef4444"
            desc = "Kaba kumdaki önceki yarışlarında tabelaya giremedi; safkanın sentetik veya çim performansı kaba kuma göre belirgin şekilde üstündür."
        else:
            detail = f"{dirt['runs']} Koşuda {dirt['top4']} Tabela" if dirt["runs"] > 0 else "Dengeli Hat"
            badge = f"🏟️ Kaba Kum Deneyimli ({detail})"
            delta, color = (1 if dirt["top4"] >= 2 else 0), "#f3e5ab"
            desc = "Kaba kum pistte tecrübesi bulunuyor; yarış temposuna göre taktik konum alacaktır."

    else:
        if turf["runs"] >= 3 and turf["wins"] >= 2 and (turf["top4"] / turf["runs"]) >= 0.5:
            badge = f"🌿 ÇİM PİST UZMANI (Çimde {turf['wins']}G / {turf['top4']} Tabela)"
            delta, color = 2, "#10b981"
            desc = f"Çim pistte {turf['runs']} koşuda {turf['wins']} galibiyet, {turf['top4']} tabela yaptı; çim aksiyonu oturmuştur."
        elif turf["runs"] >= 2 and (turf["wins"] >= 1 or (turf["top4"] / turf["runs"]) >= 0.5):
            badge = f"🌿 ÇİM PİST DENEYİMLİ (${turf['wins']}G / ${turf['top4']}T)"
            delta, color = 1, "#10b981"
            desc = f"Çim pistte {turf['runs']} koşuda {turf['wins']}G/{turf['top4']}T elde etti, zemine aşinadır."
        elif turf["runs"] == 0 and (dirt["runs"] >= 3 or syn["runs"] >= 3):
            badge = "⚠️ ÇİMDE İLK KEZ: Kum / Sentetik Atı"
            delta, color = -1, "#f59e0b"
            desc = "Kariyerinde hiç çim koşusu yok, kum/sentetikten çime geçiyor."
        else:
            badge = f"🌿 Çim Pist Uyumlu ({turf['runs']} Koşuda {turf['top4']} Tabela)"
            delta, color = (1 if turf["top4"] >= 2 else 0), "#f3e5ab"
            desc = "Çim pistte tecrübesi mevcut."

    return {"badge": badge, "delta": delta, "color": color, "desc": desc, **stats}


def build_class_drop_analysis(conn, at_id, current_race_class):
    """
    Safkanın geçmiş yarışlarındaki açık/grup (G1, G2, G3, KV-8/9/7) koşularını analiz ederek
    sınıf düşüşü ve üst grup sertliği avantajını belirler.
    """
    if not at_id:
        return None

    rows = conn.execute("""
        SELECT kosu_cinsi, grup, sira, tarih, kilo, handikap, hipodrom_sehir
        FROM gecmis_yarislar
        WHERE at_id = ?
        ORDER BY (substr(tarih, 7, 4) || '-' || substr(tarih, 4, 2) || '-' || substr(tarih, 1, 2)) DESC
        LIMIT 10
    """, (at_id,)).fetchall()

    if not rows:
        return None

    elite_runs = []
    for r in rows:
        c_cinsi = (r["kosu_cinsi"] or "").upper()
        grade = ""
        if "G 1" in c_cinsi or "G1" in c_cinsi:
            grade = "G 1"
        elif "G 2" in c_cinsi or "G2" in c_cinsi:
            grade = "G 2"
        elif "G 3" in c_cinsi or "G3" in c_cinsi or "A 3" in c_cinsi or "A3" in c_cinsi:
            grade = "G 3"
        elif "KV-8" in c_cinsi or "KV-9" in c_cinsi:
            grade = "KV-8/9"
        elif "KV-7" in c_cinsi:
            grade = "KV-7"

        if grade:
            raw_rank = str(r["sira"] or "").strip()
            rank = int(raw_rank) if raw_rank.isdigit() else 99
            elite_runs.append({
                "kosu_cinsi": r["kosu_cinsi"],
                "grade": grade,
                "sira": rank,
                "tarih": r["tarih"],
                "kilo": r["kilo"],
                "handikap": r["handikap"]
            })

    if not elite_runs:
        return None

    curr_lower = (current_race_class or "").lower()
    is_current_elite = any(eg in curr_lower for eg in ["g 1", "g1", "g 2", "g2", "g 3", "g3", "a 3", "a3", "kv-8", "kv-9"])
    is_dropping = not is_current_elite

    grade_order = ["G 1", "G 2", "G 3", "KV-8/9", "KV-7"]
    top_grade = elite_runs[0]["grade"]
    for g in grade_order:
        if any(er["grade"] == g for er in elite_runs):
            top_grade = g
            break

    top_5_in_elite = sum(1 for er in elite_runs if er["sira"] <= 5)

    bonus = 0.0
    if top_grade == "G 1":
        bonus += 4.5
    elif top_grade == "G 2":
        bonus += 4.0
    elif top_grade == "G 3":
        bonus += 3.5
    elif top_grade == "KV-8/9":
        bonus += 3.0
    elif top_grade == "KV-7":
        bonus += 2.0

    if top_5_in_elite > 0:
        bonus += min(2.5, top_5_in_elite * 0.8)

    if is_dropping:
        bonus += 1.0

    final_bonus = round(min(7.0, bonus), 1)

    if is_dropping:
        badge = f"💎 SERT GRUP / SINIF DÜŞÜŞÜ ({top_grade} Tecrübeli +{final_bonus:.0f}P)"
    else:
        badge = f"💎 SINIF GÜCÜ: {top_grade} Yarışçısı (+{final_bonus:.0f}P)"

    unique_grades = list(dict.fromkeys(er["grade"] for er in elite_runs))
    aciklama = f"Safkan son dönemde {len(elite_runs)} kez elit açık/grup ({', '.join(unique_grades)}) koşularda boy gösterdi ({top_5_in_elite} kez ilk 5'te bitirdi). Mevcut grupta belirgin kalite ve tecrübe üstünlüğü vardır."

    return {
        "sinif_dususu": is_dropping,
        "ust_grup_sayisi": len(elite_runs),
        "en_ust_grup": top_grade,
        "grup_tabela_sayisi": top_5_in_elite,
        "class_bonus": final_bonus,
        "badge": badge,
        "aciklama": aciklama
    }


HISTORICAL_FAMOUS_DAMS = {
    'SULTAN ERVA': {'siblings': ['AYDİNÇ', 'EPARVEN'], 'grupGalibi': True, 'text': 'Öz Kardeşi: AYDİNÇ (G 2 / KV Galibi, 5 Birincilik)'},
    'DONG SOCIETY': {'siblings': ['ANGEL OF DEFNE'], 'grupGalibi': True, 'text': 'Öz Kardeşi: ANGEL OF DEFNE (Grup/KV Galibi, 5 Birincilik)'},
    'TOMRİS HATUN': {'siblings': ['ERDİ BEY'], 'grupGalibi': False, 'text': 'Anne Kardeşi: ERDİ BEY (7 Birincilik)'},
    'DÜŞÜMDEKİ': {'siblings': ['GÖKTUĞTAY'], 'grupGalibi': False, 'text': 'Anne Kardeşi: GÖKTUĞTAY (6 Birincilik)'},
    'ZEYNEBİM': {'siblings': ['YEDİKARDEŞLER'], 'grupGalibi': False, 'text': 'Anne Kardeşi: YEDİKARDEŞLER (5 Birincilik)'},
    'KAFKASLIDEVRANI': {'siblings': ['YUSUF KAPTAN'], 'grupGalibi': False, 'text': 'Anne Kardeşi: YUSUF KAPTAN (4 Birincilik)'},
    'RENGİN': {'siblings': ['SANCAR', 'LADY NAZO'], 'grupGalibi': True, 'text': 'Öz Kardeşi: SANCAR (G 3 / Açık Galibi, 14 Birincilik)'},
    'SUZİ GOLD': {'siblings': ['GOLD POWER'], 'grupGalibi': True, 'text': 'Anne Kardeşi: GOLD POWER (G 2 Galibi, 8 Birincilik)'},
    'PLAYA DEL AMOR': {'siblings': ['PLAYA BOY'], 'grupGalibi': True, 'text': 'Anne Kardeşi: PLAYA BOY (KV-8 Galibi, 6 Birincilik)'},
    'EYE IN THE SKY': {'siblings': ['SKYFALL'], 'grupGalibi': True, 'text': 'Anne Kardeşi: SKYFALL (Grup Galibi, 7 Birincilik)'},
    'NIGHTINGALE': {'siblings': ['NIGHT WARRIOR'], 'grupGalibi': True, 'text': 'Anne Kardeşi: NIGHT WARRIOR (KV-9 Galibi, 5 Birincilik)'},
    'AMAZING LOVE': {'siblings': ['LOVELY BOY'], 'grupGalibi': True, 'text': 'Anne Kardeşi: LOVELY BOY (A-3 Galibi, 6 Birincilik)'},
    'KINALI KUZU': {'siblings': ['KUZUBEY'], 'grupGalibi': False, 'text': 'Anne Kardeşi: KUZUBEY (KV Galibi, 4 Birincilik)'},
    'ABAKAY': {'siblings': ['ABAKAYHAN'], 'grupGalibi': False, 'text': 'Anne Kardeşi: ABAKAYHAN (KV Galibi, 5 Birincilik)'},
    'CERENİM': {'siblings': ['CERENBEY'], 'grupGalibi': False, 'text': 'Anne Kardeşi: CERENBEY (Şartlı-5 Galibi, 5 Birincilik)'},
    'DENİZBOZAN': {'siblings': ['BOZANBEY'], 'grupGalibi': False, 'text': 'Anne Kardeşi: BOZANBEY (5 Birincilik, Handikap 80)'},
}


def build_deep_maternal_siblings(conn, horse_name, mother_name):
    """
    Safkanın anne kardeşlerini (Maternal Siblings) 5 yıllık sınır olmaksızın,
    tüm tarihsel veritabanı ve efsane kısrak kayıtlarından derinlemesine analiz eder.
    """
    clean_mother = (mother_name or '').strip().upper()
    clean_horse = (horse_name or '').strip().upper()
    if not clean_mother:
        return {'score': 65, 'hasSiblings': False, 'text': 'Anne kaydı bulunmuyor'}

    for dam, info in HISTORICAL_FAMOUS_DAMS.items():
        if dam in clean_mother:
            score = 96 if info['grupGalibi'] else 88
            return {
                'score': score,
                'hasSiblings': True,
                'grupGalibi': info['grupGalibi'],
                'siblings': info['siblings'],
                'text': info['text'],
                'badge': f"👑 DERİN KAN HATTI ({info['text']})"
            }

    if not conn:
        return {'score': 65, 'hasSiblings': False, 'text': 'Arşiv bağlantısı yok'}

    try:
        foals = conn.execute('''
            SELECT id, at_adi FROM atlar 
            WHERE UPPER(anne_adi) = ? AND UPPER(at_adi) != ?
        ''', (clean_mother, clean_horse)).fetchall()

        if not foals:
            return {'score': 65, 'hasSiblings': False, 'text': 'Arşivde koşan anne kardeşi kaydı yok'}

        sib_ids = [f['id'] for f in foals]
        sib_names = [f['at_adi'] for f in foals]
        placeholders = ','.join('?' for _ in sib_ids)

        races = conn.execute(f'''
            SELECT sira, kosu_cinsi FROM gecmis_yarislar 
            WHERE at_id IN ({placeholders})
        ''', sib_ids).fetchall()

        total_runs = len(races)
        total_wins = sum(1 for r in races if str(r['sira']).strip() == '1')
        grup_wins = sum(1 for r in races if ('G ' in str(r['kosu_cinsi'] or '') or 'KV' in str(r['kosu_cinsi'] or '')) and str(r['sira']).strip() in ('1', '2', '3'))

        if grup_wins >= 2 or (total_wins >= 5 and grup_wins >= 1):
            score = 95
            text = f"Anne Kardeşleri: {', '.join(sib_names[:2])} ({total_wins} Galibiyet, Elit Açık/Grup Başarısı)"
            badge = f"👑 ŞAMPİYON ANNE HATTI ({text})"
        elif total_wins >= 4:
            score = 88
            text = f"Anne Kardeşleri: {', '.join(sib_names[:2])} ({total_wins} Galibiyet)"
            badge = f"💎 KAZANAN ANNE HATTI ({text})"
        elif total_wins >= 1:
            score = 78
            text = f"Anne Kardeşleri: {', '.join(sib_names[:2])} ({total_wins} Galibiyet / {total_runs} Koşu)"
            badge = f"⭐ Tabela Gören Kardeşler ({text})"
        else:
            score = 68
            text = f"Anne Kardeşleri: {', '.join(sib_names[:2])} ({total_runs} Koşu tecrübesi)"
            badge = ""

        return {
            'score': score,
            'hasSiblings': True,
            'grupGalibi': grup_wins > 0,
            'siblings': sib_names,
            'totalWins': total_wins,
            'text': text,
            'badge': badge
        }
    except Exception:
        return {'score': 65, 'hasSiblings': False, 'text': 'Anne kardeşi analizi yapılamadı'}


class TJKScraper:
    def __init__(self, db_path=None, request_delay=0.5, max_retries=3):
        self.db_path = db_path
        self.request_delay = request_delay
        self.max_retries = max_retries
        self.session = requests.Session()
        self.session.headers.update(BASE_HEADERS)
        self.tz = ZoneInfo("Europe/Istanbul")

    def get_turkey_now(self):
        """Europe/Istanbul saat diliminde güncel zamanı döner."""
        return datetime.now(self.tz)

    def _fetch_url_with_retry(self, url, description="URL"):
        """3 kez yeniden deneme mekanizmasıyla URL'yi çeker."""
        for attempt in range(1, self.max_retries + 1):
            try:
                time.sleep(self.request_delay)
                resp = self.session.get(url, timeout=25)
                if resp.status_code == 200:
                    if resp.encoding.lower() not in ['utf-8', 'utf8']:
                        resp.encoding = 'utf-8'
                    return resp.text
                elif resp.status_code == 404:
                    logger.debug(f"{description} bulunamadı (404): {url}")
                    return None
                else:
                    logger.warning(f"[{attempt}/{self.max_retries}] {description} HTTP {resp.status_code}: {url}")
            except Exception as e:
                logger.warning(f"[{attempt}/{self.max_retries}] {description} Bağlantı hatası: {e}")
                time.sleep(attempt * 1.5)

        logger.error(f"❌ {description} {self.max_retries} denemede çekilemedi: {url}")
        return None

    # =========================================================================
    # AŞAMA 1: DÜNÜN / GEÇMİŞ GÜNLERİN SONUÇLARI VE GİDİŞAT VERİSİ
    # =========================================================================
    def discover_active_results_hipodroms_for_date(self, target_date_dmy):
        """
        Belirtilen tarihte sonuçları olan hipodromları dinamik olarak tarar.
        """
        if hasattr(target_date_dmy, 'strftime'):
            target_date_dmy = target_date_dmy.strftime('%d/%m/%Y')
        active_results = []
        q_date = urllib.parse.quote(target_date_dmy)

        FOREIGN_KEYWORDS = [
            'Avustralya', 'Afrika', 'Krallık', 'ABD', 'Arjantin', 'Kanada', 'Karma', 
            'Fransa', 'İrlanda', 'Singapur', 'Hong Kong', 'BAE', 'Şili', 'Almanya',
            'Malezya', 'Selangor', 'Birleşik Krallık', 'G.Afrika', 'Kore', 'Japonya',
            'Uruguay', 'Yeni Zelanda', 'Kempton', 'Chantilly', 'Sha Tin', 'Scottsville'
        ]
        TJK_CITY_MAP = {
            'Adana': 'Adana Yeşiloba Hipodromu',
            'İstanbul': 'İstanbul Veliefendi Hipodromu',
            'İzmir': 'İzmir Şirinyer Hipodromu',
            'Ankara': 'Ankara 75. Yıl Hipodromu',
            'Bursa': 'Bursa Osmangazi Hipodromu',
            'Antalya': 'Antalya Hipodromu',
            'Kocaeli': 'Kocaeli Kartepe Hipodromu',
            'Şanlıurfa': 'Şanlıurfa Hipodromu',
            'Elazığ': 'Elazığ Hipodromu',
            'Diyarbakır': 'Diyarbakır Hipodromu'
        }

        # 1. TJK Günlük Yarış Sonuçları sayfasından şehirleri dinamik tespit et
        main_url = f"https://www.tjk.org/TR/YarisSever/Info/Page/GunlukYarisSonuclari?QueryParameter_Tarih={q_date}"
        main_html = self._fetch_url_with_retry(main_url, description=f"{target_date_dmy} Ana Sonuç Sayfası")

        discovered_cities = []
        if main_html:
            soup = BeautifulSoup(main_html, 'html.parser')
            for a in soup.find_all('a'):
                href = a.get('href', '')
                if '/Info/Sehir/GunlukYarisSonuclari' in href and 'SehirId=' in href:
                    tab_txt = a.get_text(strip=True)
                    if any(k in tab_txt for k in FOREIGN_KEYWORDS):
                        continue
                    parsed = urllib.parse.urlparse(href)
                    qs = urllib.parse.parse_qs(parsed.query)
                    sid = int(qs.get('SehirId', [0])[0])
                    sname = qs.get('SehirAdi', [''])[0]
                    if not sname:
                        sname = tab_txt.split('(')[0].strip()
                    sname = sname.strip()
                    matched_domestic = None
                    for known in TJK_CITY_MAP:
                        if known.lower() == sname.lower() or known.lower() in tab_txt.lower():
                            matched_domestic = known
                            break
                    if not matched_domestic:
                        continue  # Yabancı / simulcast hipodromları dahil etme
                    if sid and not any(x[1] == matched_domestic for x in discovered_cities):
                        discovered_cities.append((sid, matched_domestic, TJK_CITY_MAP[matched_domestic]))

        targets = discovered_cities if discovered_cities else TJK_HIPODROMLAR

        for sehir_id, sehir_adi, hipodrom_adi in targets:
            q_sehir = urllib.parse.quote(sehir_adi)
            url = f"https://www.tjk.org/TR/YarisSever/Info/Sehir/GunlukYarisSonuclari?SehirId={sehir_id}&QueryParameter_Tarih={q_date}&SehirAdi={q_sehir}&Era=yesterday"
            html = self._fetch_url_with_retry(url, description=f"{sehir_adi} Sonuçları")
            if not html:
                continue

            if 'tablesorter' in html or 'gunlukYarisSonuclari' in html or 'Son 800' in html:
                active_results.append({
                    "sehir_id": sehir_id,
                    "sehir_adi": sehir_adi,
                    "hipodrom_adi": hipodrom_adi,
                    "html": html
                })
                logger.info(f"🏆 Yarış Sonuçları Bulundu: {sehir_adi} ({target_date_dmy})")

        return active_results

    def scrape_and_save_race_results(self, target_date_obj):
        """
        Belirtilen tarihin yarış sonuçlarını, gidişat ve fark verilerini toplar.
        Kayıt bazlı kontrol (UNIQUE) yaparak yaris_sonuclari ve gecmis_yarislar'a yazar.
        """
        dmy_str = target_date_obj.strftime("%d/%m/%Y")
        iso_str = target_date_obj.strftime("%Y-%m-%d")
        logger.info(f"\n--- [AŞAMA 1] Yarış Sonuçları ve Gidişat Verileri Çekiliyor: {dmy_str} ---")

        active_results = self.discover_active_results_hipodroms_for_date(dmy_str)
        if not active_results:
            logger.info(f"ℹ️ {dmy_str} tarihi için sonuç sayfası bulunamadı veya koşu yok.")
            return {"tarih": iso_str, "toplam_sonuc": 0, "toplam_kosu": 0}

        conn = get_db_connection(self.db_path) if self.db_path else get_db_connection()
        total_races = 0
        total_results = 0

        for hip in active_results:
            sehir_id = hip["sehir_id"]
            sehir_adi = hip["sehir_adi"]
            hipodrom_adi = hip["hipodrom_adi"]

            with conn:
                upsert_hipodrom(conn, sehir_id, sehir_adi, hipodrom_adi)

            races_results = parse_daily_race_results_html(hip["html"], sehir_id, sehir_adi, iso_str)
            total_races += len(races_results)

            for race in races_results:
                kosu_no = race["kosu_no"]
                for horse_res in race.get("sonuclar", []):
                    at_id = horse_res.get("at_id")
                    if not at_id:
                        continue

                    with conn:
                        # 1. At kaydını önce ekle (Foreign key constraint için şart)
                        upsert_at(conn, {
                            "id": at_id,
                            "at_adi": horse_res.get("at_ismi")
                        })

                        # 2. Ham yarış sonuçları tablosuna ekle
                        upsert_yaris_sonucu(conn, horse_res)
                        total_results += 1

                        # 3. Geçmiş yarış formatında ekle
                        gy_data = {
                            "at_id": at_id,
                            "tarih": iso_str,
                            "hipodrom_sehir": sehir_adi,
                            "mesafe": race.get("mesafe"),
                            "mesafe_raw": str(race.get("mesafe")) if race.get("mesafe") else "",
                            "pist_turu": race.get("pist_turu"),
                            "pist_durumu": "Normal",
                            "pist_raw": race.get("pist_turu"),
                            "sira": horse_res.get("sira"),
                            "sira_raw": horse_res.get("sira_raw"),
                            "derece_raw": horse_res.get("derece_raw"),
                            "derece_saniye": horse_res.get("derece_saniye"),
                            "kilo": None,
                            "jokey_ad": None,
                            "start_no": horse_res.get("start_no"),
                            "taki": None,
                            "ganyan": horse_res.get("ganyan"),
                            "ganyan_raw": str(horse_res.get("ganyan")) if horse_res.get("ganyan") else "",
                            "kosu_no": kosu_no,
                            "kosu_cinsi": race.get("kosu_cinsi"),
                            "fark": str(horse_res.get("fark_boy")) if horse_res.get("fark_boy") is not None else horse_res.get("fark_raw"),
                            "video_url": horse_res.get("video_url")
                        }
                        upsert_gecmis_yaris(conn, gy_data)

            logger.info(f"   ✓ {sehir_adi}: {len(races_results)} koşu, {sum(len(r.get('sonuclar', [])) for r in races_results)} safkan sonucu işlendi.")

        conn.close()
        logger.info(f"✅ Sonuçlar tamamlandı: Toplam {total_races} koşu, {total_results} safkan sonucu arşive eklendi.")
        return {"tarih": iso_str, "toplam_sonuc": total_results, "toplam_kosu": total_races}

    # =========================================================================
    # AŞAMA 2: GÜNLÜK YARIŞ PROGRAMI (BUGÜN VE YARIN)
    # =========================================================================
    def discover_active_hipodroms_for_date(self, target_date_dmy):
        """
        Belirtilen tarihte (örn: '21/11/2026') TJK'da koşusu olan hipodromları dinamik tarar.
        Önce günün ana sayfasından yerli şehir sekmelerini (Adana, İstanbul vb.) dinamik tespit eder.
        """
        if hasattr(target_date_dmy, 'strftime'):
            target_date_dmy = target_date_dmy.strftime('%d/%m/%Y')
        active_hipodroms = []
        q_date = urllib.parse.quote(target_date_dmy)

        FOREIGN_KEYWORDS = [
            'Avustralya', 'Afrika', 'Krallık', 'ABD', 'Arjantin', 'Kanada', 'Karma', 
            'Fransa', 'İrlanda', 'Singapur', 'Hong Kong', 'BAE', 'Şili', 'Almanya',
            'Malezya', 'Selangor', 'Birleşik Krallık', 'G.Afrika', 'Kore', 'Japonya',
            'Uruguay', 'Yeni Zelanda', 'Kempton', 'Chantilly', 'Sha Tin', 'Scottsville'
        ]
        TJK_CITY_MAP = {
            'Adana': 'Adana Yeşiloba Hipodromu',
            'İstanbul': 'İstanbul Veliefendi Hipodromu',
            'İzmir': 'İzmir Şirinyer Hipodromu',
            'Ankara': 'Ankara 75. Yıl Hipodromu',
            'Bursa': 'Bursa Osmangazi Hipodromu',
            'Antalya': 'Antalya Hipodromu',
            'Kocaeli': 'Kocaeli Kartepe Hipodromu',
            'Şanlıurfa': 'Şanlıurfa Hipodromu',
            'Elazığ': 'Elazığ Hipodromu',
            'Diyarbakır': 'Diyarbakır Hipodromu'
        }

        # 1. TJK Günlük Yarış Programı ana sayfasından yerli şehirleri dinamik oku
        main_url = f"https://www.tjk.org/TR/YarisSever/Info/Page/GunlukYarisProgrami?QueryParameter_Tarih={q_date}"
        main_html = self._fetch_url_with_retry(main_url, description=f"{target_date_dmy} Ana Program Sayfası")

        discovered_cities = []
        if main_html:
            soup = BeautifulSoup(main_html, 'html.parser')
            for a in soup.find_all('a'):
                href = a.get('href', '')
                if '/Info/Sehir/GunlukYarisProgrami' in href and 'SehirId=' in href:
                    tab_txt = a.get_text(strip=True)
                    if any(k in tab_txt for k in FOREIGN_KEYWORDS):
                        continue
                    parsed = urllib.parse.urlparse(href)
                    qs = urllib.parse.parse_qs(parsed.query)
                    sid = int(qs.get('SehirId', [0])[0])
                    sname = qs.get('SehirAdi', [''])[0]
                    if not sname:
                        sname = tab_txt.split('(')[0].strip()
                    sname = sname.strip()
                    matched_domestic = None
                    for known in TJK_CITY_MAP:
                        if known.lower() == sname.lower() or known.lower() in tab_txt.lower():
                            matched_domestic = known
                            break
                    if not matched_domestic:
                        continue  # Yabancı / simulcast hipodromları dahil etme
                    if sid and not any(x[1] == matched_domestic for x in discovered_cities):
                        discovered_cities.append((sid, matched_domestic, TJK_CITY_MAP[matched_domestic]))

        targets = discovered_cities if discovered_cities else TJK_HIPODROMLAR
        logger.info(f"📍 {target_date_dmy} için taranacak şehirler: {[c[1] for c in targets]}")

        for sehir_id, sehir_adi, hipodrom_adi in targets:
            q_sehir = urllib.parse.quote(sehir_adi)
            url = f"https://www.tjk.org/TR/YarisSever/Info/Sehir/GunlukYarisProgrami?SehirId={sehir_id}&QueryParameter_Tarih={q_date}&SehirAdi={q_sehir}"
            html = self._fetch_url_with_retry(url, description=f"{sehir_adi} Programı")
            if not html:
                continue

            if 'class="tablesorter"' in html or "gunlukYarisProgramiTable" in html:
                active_hipodroms.append({
                    "sehir_id": sehir_id,
                    "sehir_adi": sehir_adi,
                    "hipodrom_adi": hipodrom_adi,
                    "html": html
                })
                logger.info(f"✅ Yarış Bulundu: {sehir_adi} ({target_date_dmy})")

        return active_hipodroms

    def scrape_program_for_date(self, conn, target_date_obj, day_label="bugun"):
        """
        Tarihin yarış programını çeker, kosular ve program_kayitlari tablolarına kaydeder.
        """
        dmy_str = target_date_obj.strftime("%d/%m/%Y")
        iso_str = target_date_obj.strftime("%Y-%m-%d")

        logger.info(f"\n--- [AŞAMA 2] Yarış Programı Çekiliyor: {day_label.upper()} ({dmy_str}) ---")
        active_hipodroms = self.discover_active_hipodroms_for_date(dmy_str)

        if not active_hipodroms:
            logger.info(f"ℹ️ {dmy_str} ({day_label}) için TJK'da resmî yarış programı bulunamadı.")
            return {"tarih": iso_str, "durum": "PROGRAM_YOK", "horses": []}

        horses_in_program = []
        kosu_count = 0

        for hip in active_hipodroms:
            sehir_id = hip["sehir_id"]
            sehir_adi = hip["sehir_adi"]
            hipodrom_adi = hip["hipodrom_adi"]

            with conn:
                upsert_hipodrom(conn, sehir_id, sehir_adi, hipodrom_adi)

            kosular = parse_daily_race_program_html(hip["html"], sehir_id, sehir_adi, iso_str)
            altili_paketleri = parse_altili_package_starts(hip["html"])
            if altili_paketleri:
                with conn:
                    replace_altili_paketleri(conn, iso_str, sehir_id, altili_paketleri)
                logger.info(
                    "📍 %s: %d koşu, %d altılı paketi (%s) ayrıştırıldı.",
                    sehir_adi, len(kosular), len(altili_paketleri),
                    ", ".join(f"{p['paketNo']}. paket {p['baslangicKosu']}. koşu" for p in altili_paketleri)
                )
            else:
                logger.info(f"📍 {sehir_adi}: {len(kosular)} koşu ayrıştırıldı (resmî altılı işareti bulunamadı).")
            kosu_count += len(kosular)

            for k in kosular:
                with conn:
                    kosu_id = upsert_kosu(conn, k)

                # Resmî TJK İdman Pisti ve Galop Verilerini Çek
                if k.get("kosu_kodu") and k.get("idman_atkodu"):
                    self.scrape_and_save_race_idman(
                        conn, sehir_id, sehir_adi, k["kosu_no"],
                        k["kosu_kodu"], k["idman_atkodu"], iso_str
                    )

                for at_data in k.get("atlar", []):
                    at_id = at_data.get("at_id")
                    at_adi = at_data.get("at_adi")

                    with conn:
                        if at_data.get("jokey_id") and at_data.get("jokey_ad"):
                            upsert_jokey(conn, at_data["jokey_id"], at_data["jokey_ad"])
                        if at_data.get("antrenor_id") and at_data.get("antrenor_ad"):
                            upsert_antrenor(conn, at_data["antrenor_id"], at_data["antrenor_ad"])
                        if at_data.get("sahip_id") and at_data.get("sahip_ad"):
                            upsert_sahip(conn, at_data["sahip_id"], at_data["sahip_ad"])

                        if at_id:
                            upsert_at(conn, {
                                "id": at_id,
                                "at_adi": at_adi,
                                "baba_id": at_data.get("baba_id"),
                                "baba_adi": at_data.get("baba_adi"),
                                "anne_id": at_data.get("anne_id"),
                                "anne_adi": at_data.get("anne_adi"),
                                "kisrak_babasi_adi": at_data.get("kisrak_babasi_adi"),
                                "yas": at_data.get("yas"),
                                "yas_cinsiyet": at_data.get("yas_cinsiyet"),
                                "profil_eksik_mi": False
                            })

                        at_data["kosu_id"] = kosu_id
                        upsert_program_kaydi(conn, at_data)

                    if at_id and (at_id, at_adi) not in horses_in_program:
                        horses_in_program.append((at_id, at_adi))

        logger.info(f"✅ {day_label.capitalize()} programı kaydedildi: {kosu_count} koşu, {len(horses_in_program)} tekil safkan.")
        return {
            "tarih": iso_str,
            "durum": "BASARILI",
            "kosu_count": kosu_count,
            "horses": horses_in_program
        }

    def scrape_and_save_race_idman(self, conn, sehir_id, sehir_adi, kosu_no, kosu_kodu, sample_atkodu, iso_str):
        """
        TJK resmî İdman Pisti sayfasından koşudaki tüm atların galop verilerini çeker ve idman_pist_kayitlari tablosuna kaydeder.
        """
        if not kosu_kodu or not sample_atkodu:
            return {}

        url = f"https://www.tjk.org/TR/YarisSever/Info/idmanpisti/Kosu?KosuKodu={kosu_kodu}&Atkodu={sample_atkodu}"
        html = self._fetch_url_with_retry(url, description=f"{sehir_adi} {kosu_no}. Koşu Resmî İdman/Galop Verisi")
        if not html:
            return {}

        galop_map = parse_tjk_idman_html(html, kosu_no, sehir_id, iso_str, kosu_kodu)
        with conn:
            for at_no, rec in galop_map.items():
                upsert_idman_kaydi(conn, rec)

        return galop_map

    # =========================================================================
    # AŞAMA 3: AT PROFİL VE KARİYER GEÇMİŞİ GÜNCELLEMESİ
    # =========================================================================
    def scrape_horse_profile(self, at_id, at_adi=""):
        """TJK AtKosuBilgileri sayfasından tek bir atın profil ve geçmişini çeker."""
        if not at_id:
            return None

        url = f"https://www.tjk.org/TR/YarisSever/Query/ConnectedPage/AtKosuBilgileri?1=1&QueryParameter_AtId={at_id}&Era=today"
        html = self._fetch_url_with_retry(url, description=f"At Profili ({at_id} - {at_adi})")
        if not html:
            return None

        try:
            profile_data = parse_horse_profile_html(html, at_id)
            if not profile_data.get("at_adi") and at_adi:
                profile_data["at_adi"] = at_adi
            return profile_data
        except Exception as e:
            logger.error(f"At {at_id} ({at_adi}) profil parse hatası: {e}")
            return None

    def update_horse_careers(self, conn, horses_to_fetch):
        """
        Programdaki safkanların kariyer geçmişlerini günceller.
        Bugün önbelleğe alınmamış atları TJK'dan çeker.
        """
        today_iso = self.get_turkey_now().strftime("%Y-%m-%d")
        cached_at_ids = get_cached_at_ids_today(conn, today_iso)
        # Bugün çekilmiş olsa bile kariyer toplamı 0 kalmış atları yeniden dene.
        # Programda son 6 formu olan bir at gerçekte 0 koşulu olamaz; bu durum
        # profil sayfasının geçici olarak eksik ayrıştırıldığını gösterir.
        suspicious_cached_ids = {
            row["at_id"] for row in conn.execute(
                """
                SELECT DISTINCT p.at_id
                FROM program_kayitlari p
                JOIN atlar a ON a.id = p.at_id
                WHERE COALESCE(p.son_6_yaris, '') <> ''
                  AND COALESCE(a.toplam_kosu, 0) = 0
                """
            )
        }
        logger.info(f"\n--- [AŞAMA 3] At Kariyer Geçmişi Güncellemesi ({len(horses_to_fetch)} Safkan) ---")
        logger.info(f"📦 Bugün Önbelleğe Alınmış At Sayısı: {len(cached_at_ids)}")
        if suspicious_cached_ids:
            logger.info(f"🔁 Kariyer toplamı 0 görünen, yeniden denenecek at sayısı: {len(suspicious_cached_ids)}")

        fetched_count = 0
        skipped_count = 0
        failed_count = 0

        for at_id, at_adi in horses_to_fetch:
            if at_id in cached_at_ids and at_id not in suspicious_cached_ids:
                skipped_count += 1
                continue

            profile = self.scrape_horse_profile(at_id, at_adi)
            if profile:
                profile["son_profil_cekilme_tarihi"] = today_iso
                with conn:
                    upsert_at(conn, profile)
                    for yaris in profile.get("gecmis_yarislar", []):
                        upsert_gecmis_yaris(conn, yaris)

                cached_at_ids.add(at_id)
                fetched_count += 1
                if fetched_count % 10 == 0 or fetched_count == len(horses_to_fetch):
                    logger.info(f"   [{fetched_count}/{len(horses_to_fetch)}] {at_adi} geçmişi kaydedildi ({len(profile.get('gecmis_yarislar', []))} koşu).")
            else:
                failed_count += 1
                logger.warning(f"⚠️ At {at_id} ({at_adi}) profili çekilemedi. Eksik veri olarak işaretlendi.")
                with conn:
                    conn.execute("UPDATE atlar SET profil_eksik_mi = 1 WHERE id = ?", (at_id,))
                    conn.execute("UPDATE program_kayitlari SET veri_durumu = 'EKSIK', hata_notu = 'Profil sayfasına ulaşılamadı' WHERE at_id = ?", (at_id,))

        logger.info(f"✅ Kariyer güncellemesi tamamlandı: {fetched_count} yeni çekildi, {skipped_count} önbellekten atlandı, {failed_count} başarısız.")
        return {"fetched": fetched_count, "skipped": skipped_count, "failed": failed_count}

    # =========================================================================
    # AŞAMA 4: RESMÎ OLMAYAN ARA-POZİSYON ÖNBELLEĞİ
    # =========================================================================
    def refresh_accurace_cache(self, conn, horses_to_fetch, max_new_races=400, history_depth=8):
        """Yakın geçmişteki yarış ölçümlerini sınırlı hızda önbelleğe alır.

        Aynı yarışı paylaşan hedef atlar önce işlenir; böylece tek istekle birden
        fazla atın taktik kanıtı toplanır.
        """
        candidates = {}
        for at_id, _at_name in horses_to_fetch:
            rows = conn.execute(
                "SELECT tarih, hipodrom_sehir, kosu_no, mesafe "
                "FROM gecmis_yarislar WHERE at_id = ?",
                (at_id,),
            ).fetchall()
            dated_rows = []
            for row in rows:
                date_iso = parse_race_date(row["tarih"])
                city_slug = normalize_city_slug(row["hipodrom_sehir"])
                if date_iso and city_slug and row["kosu_no"]:
                    dated_rows.append((date_iso, city_slug, int(row["kosu_no"]), row["mesafe"]))
            dated_rows.sort(key=lambda item: item[0], reverse=True)
            for date_iso, city_slug, race_no, distance in dated_rows[:history_depth]:
                key = (date_iso, city_slug, race_no)
                item = candidates.setdefault(key, {"distances": set(), "horses": set()})
                if distance:
                    item["distances"].add(int(distance))
                item["horses"].add(at_id)

        pending = []
        for key, item in candidates.items():
            cached = conn.execute(
                "SELECT status, checked_at FROM accurace_race_cache "
                "WHERE date_iso = ? AND city_slug = ? AND race_no = ?",
                key,
            ).fetchone()
            if cached and cached["status"] == "OK":
                continue
            if cached:
                # Veri yokluğunu 7 gün, 404'ü 30 gün, geçici hatayı 12 saat sonra yeniden dene.
                if cached["status"] == "NO_DATA":
                    retry_window = "-7 days"
                elif cached["status"] == "NOT_FOUND":
                    retry_window = "-30 days"
                else:
                    retry_window = "-12 hours"
                if conn.execute(
                    "SELECT datetime(?) > datetime('now', ?)",
                    (cached["checked_at"], retry_window),
                ).fetchone()[0]:
                    continue
            pending.append((key, item))

        # Paylaşılan yarışlar önce: tek istekte en çok atın kanıtı toplanır.
        pending.sort(key=lambda entry: -len(entry[1]["horses"]))
        selected = pending[:max(0, max_new_races)]
        fetched = 0
        failed = 0
        self.session.headers.update({"Accept": "text/html,application/xhtml+xml"})
        for index, ((date_iso, city_slug, race_no), item) in enumerate(selected, 1):
            if self.request_delay > 0:
                time.sleep(max(self.request_delay, 0.5))
            source_url = f"https://accurace.net/network/{date_iso}/{city_slug}/{race_no}"
            status = "ERROR"
            payload_json = None
            error_message = None
            try:
                race_data = None
                last_exc = None
                # Geçici ağ/5xx/429 hatalarında aynı çalışma içinde kısa backoff ile 2 kez daha dene.
                for attempt in range(3):
                    try:
                        race_data = fetch_race(self.session, date_iso, city_slug, race_no)
                        break
                    except requests.HTTPError as exc:
                        last_exc = exc
                        response = getattr(exc, "response", None)
                        status_code = getattr(response, "status_code", None)
                        if status_code in (429, 500, 502, 503, 504) and attempt < 2:
                            time.sleep(1.5 * (attempt + 1))
                            continue
                        raise
                    except requests.RequestException as exc:
                        last_exc = exc
                        if attempt < 2:
                            time.sleep(1.5 * (attempt + 1))
                            continue
                        raise
                if race_data is None:
                    raise last_exc or RuntimeError("Accurace verisi alınamadı")

                if item["distances"] and race_data.get("distance") not in item["distances"]:
                    raise ValueError(
                        f"Mesafe uyuşmadı: {race_data.get('distance')} not in {sorted(item['distances'])}"
                    )
                if not race_data.get("horses") or not any(h.get("checkpoints") for h in race_data["horses"]):
                    raise ValueError("Sayfada kullanılabilir ara-pozisyon ölçümü yok")
                race_data["city_slug"] = city_slug
                race_data["requested_race_no"] = race_no
                payload_json = json.dumps(race_data, ensure_ascii=False)
                status = "OK"
                fetched += 1
            except requests.HTTPError as exc:
                response = getattr(exc, "response", None)
                status = "NOT_FOUND" if response is not None and response.status_code == 404 else "ERROR"
                error_message = str(exc)[:500]
                failed += 1
            except Exception as exc:
                error_message = str(exc)[:500]
                if any(marker in error_message for marker in (
                    "yarış tablosu bulunamadı",
                    "eşleştirilebilir at bulunamadı",
                    "kullanılabilir ara-pozisyon ölçümü yok",
                )):
                    status = "NO_DATA"
                failed += 1
                logger.warning("Accurace ara-pozisyon verisi alınamadı (%s/%s/%s): %s", date_iso, city_slug, race_no, exc)

            with conn:
                conn.execute(
                    "INSERT INTO accurace_race_cache "
                    "(date_iso, city_slug, race_no, status, payload_json, source_url, error_message, checked_at) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) "
                    "ON CONFLICT(date_iso, city_slug, race_no) DO UPDATE SET "
                    "status=excluded.status, payload_json=excluded.payload_json, "
                    "source_url=excluded.source_url, error_message=excluded.error_message, "
                    "checked_at=CURRENT_TIMESTAMP",
                    (date_iso, city_slug, race_no, status, payload_json, source_url, error_message),
                )
            if index % 25 == 0:
                logger.info(
                    "   Accurace önbellek ilerlemesi: %s/%s (başarılı %s, hatalı %s)",
                    index, len(selected), fetched, failed,
                )

        try:
            cache_summary = {
                row["status"]: row["n"]
                for row in conn.execute(
                    "SELECT status, COUNT(*) AS n FROM accurace_race_cache GROUP BY status"
                ).fetchall()
            }
            logger.info("Accurace önbellek durumu: %s", cache_summary)
        except Exception:
            cache_summary = {}
        logger.info(
            "Accurace önbelleği: %d yeni yarış ölçümü alındı, %d hata, %d sırada bekliyor "
            "(kaynak resmî değildir).", fetched, failed, max(0, len(pending) - len(selected))
        )
        return {
            "fetched": fetched,
            "failed": failed,
            "pending": max(0, len(pending) - len(selected)),
            "cache": cache_summary,
        }

    # =========================================================================
    # AŞAMA 6: CANLI BÜLTEN JSON DOSYALARINI GÜNCELLEME
    # =========================================================================
    def sync_bulten_json_from_db(self, conn, target_date_iso, target_json_path):
        """
        SQLite'daki resmî kosular, program_kayitlari, turev_at_taktikleri,
        turev_kosu_tempolari ve turev_kosu_at_etkileri tablolarından okuyarak
        UI bülten JSON dosyasını (bulten_bugun.json / bulten_yarin.json) eksiksiz senkronize eder.
        """
        cursor = conn.cursor()
        cursor.execute("""
            SELECT k.id, k.kosu_no, k.saat, k.mesafe, k.pist_turu, k.pist_durumu, k.kosu_cinsi,
                   k.ikramiye_1, h.id as hip_id, h.sehir_adi, h.hipodrom_adi
            FROM kosular k
            JOIN hipodromlar h ON k.hipodrom_id = h.id
            WHERE k.tarih = ?
            ORDER BY h.sehir_adi, k.kosu_no
        """, (target_date_iso,))
        kosu_rows = cursor.fetchall()

        if not kosu_rows:
            logger.info(f"ℹ️ {target_date_iso} için veritabanında koşu bulunamadığından {target_json_path} güncellenmedi.")
            return False

        existing_data = {}
        if os.path.exists(target_json_path):
            try:
                with open(target_json_path, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
            except Exception:
                pass

        dt_obj = datetime.strptime(target_date_iso, "%Y-%m-%d")
        dmy_dot = dt_obj.strftime("%d.%m.%Y")
        dmy_slash = dt_obj.strftime("%d/%m/%Y")
        gun_adlari = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"]
        gun_adi = gun_adlari[dt_obj.weekday()]

        hipodrom_map = {}

        # Her şehir için toplam koşu sayısını belirle
        city_races_map = {}
        for r in kosu_rows:
            sehir = r["sehir_adi"]
            city_races_map[sehir] = city_races_map.get(sehir, 0) + 1

        for r in kosu_rows:
            sehir = r["sehir_adi"]
            total_races_in_city = city_races_map[sehir]

            if sehir not in hipodrom_map:
                hip_id_slug = sehir.lower().replace('ş', 's').replace('ı', 'i').replace('ö', 'o').replace('ü', 'u').replace('ç', 'c').replace('ğ', 'g')
                old_hip = next((h for h in existing_data.get("hipodromlar", []) if h.get("sehir") == sehir), {})

                birim_fiyat = 1.25 if sehir in ["İstanbul", "Ankara", "İzmir", "Bursa", "Adana", "Antalya", "Kocaeli"] else 1.00
                birim_label = f"Büyük Şehir Hipodromu ({birim_fiyat:.2f} ₺)" if birim_fiyat == 1.25 else f"Güneydoğu Hipodromu ({birim_fiyat:.2f} ₺)"

                hipodrom_map[sehir] = {
                    "id": hip_id_slug,
                    "isim": r["hipodrom_adi"],
                    "sehir": sehir,
                    "tarih": dmy_dot,
                    "havaDurumu": old_hip.get("havaDurumu", {"temp": 16, "conditionText": "Açık", "humidity": 55, "wind": 10}),
                    "rawTrackInfo": old_hip.get("rawTrackInfo", "Normal"),
                    "cimOlcum": old_hip.get("cimOlcum", "Yarış Yok"),
                    "kumOlcum": old_hip.get("kumOlcum", "Kum (3.7 Normal)"),
                    "sentetikOlcum": old_hip.get("sentetikOlcum", "Yarış Yok"),
                    "birimFiyat": birim_fiyat,
                    "birimFiyatEtiket": birim_label,
                    "asgariKuponTL": 20.0,
                    "altiliPaketleri": get_altili_paketleri(conn, target_date_iso, r["hip_id"]),
                    "kosular": []
                }

            kosu_id = r["id"]
            k_no = r["kosu_no"]

            # Altılı ayağı tespiti: önce TJK'nın resmî paket işaretleri.
            # Birden fazla paket varsa (örn. 1-6 ve 3-8) her koşu için tüm paketler yazılır.
            official_pkgs = hipodrom_map[sehir].get("altiliPaketleri", [])
            race_pkgs = []
            if official_pkgs:
                for pkg in official_pkgs:
                    p_start = int(pkg["baslangicKosu"])
                    p_end = int(pkg["bitisKosu"])
                    if p_start <= k_no <= p_end:
                        race_pkgs.append({
                            "paketNo": int(pkg["paketNo"]),
                            "ayakNo": k_no - p_start + 1
                        })
            else:
                # Resmî işaret yoksa güvenli geri dönüş: son 6 koşu tek paket.
                start_last6 = max(1, total_races_in_city - 5)
                if start_last6 <= k_no <= start_last6 + 5:
                    race_pkgs.append({"paketNo": 1, "ayakNo": k_no - start_last6 + 1})

            primary_pkg = next((p for p in race_pkgs if p["paketNo"] == 1), race_pkgs[0] if race_pkgs else None)
            altili_ayagi = primary_pkg["ayakNo"] if primary_pkg else None

            # Türev tempo senaryosunu çek
            cursor.execute("SELECT * FROM turev_kosu_tempolari WHERE kosu_id = ?", (kosu_id,))
            tempo_row = cursor.fetchone()

            olasi_kacanlar = []
            if tempo_row and tempo_row["olasi_liderler"]:
                try:
                    olasi_kacanlar = json.loads(tempo_row["olasi_liderler"])
                except Exception:
                    olasi_kacanlar = []

            avantajli_stiller = ["Presçi", "Orta Grup"]
            if tempo_row and tempo_row["avantajli_stiller"]:
                avantajli_stiller = [s.strip() for s in tempo_row["avantajli_stiller"].split("ve")]

            tempo_senaryosu = {
                "tempo_sinifi": tempo_row["tahmini_tempo"] if tempo_row else "Dengeli / Normal",
                "tempo_kodu": tempo_row["tempo_kodu"] if tempo_row else "DENGELI",
                "tempo_skoru": tempo_row["tempo_skoru"] if tempo_row else 50.0,
                "liderlik_baskisi_sayisi": tempo_row["kacak_sayisi"] if tempo_row else 0,
                "on_grup_baskisi_sayisi": tempo_row["presci_sayisi"] if tempo_row else 0,
                "avantajli_stiller": avantajli_stiller,
                "senaryo_yorumu": tempo_row["tempo_analiz_yorumu"] if tempo_row else "Dengeli seyir.",
                "olasi_kacanlar": olasi_kacanlar
            }

            # Koşunun resmî TJK idman pisti / galop kayıtlarını çek
            cursor.execute("""
                SELECT * FROM idman_pist_kayitlari
                WHERE tarih = ? AND hipodrom_id = ? AND kosu_no = ?
            """, (target_date_iso, r["hip_id"], k_no))
            idman_rows = cursor.fetchall()
            idman_by_no = {row["at_no"]: row for row in idman_rows}
            idman_by_name = {re.sub(r'\s*\(\d+\)\s*$', '', row["at_adi"]).strip().upper(): row for row in idman_rows}

            # İstanbul Veliefendi Hipodromunda kaba kum yoktur, tüm kum koşuları Sentetik pisttir.
            if sehir == "İstanbul":
                effective_pist = "Çim" if r["pist_turu"] == "Çim" else "Sentetik"
                effective_pist_tipi = "Çim" if r["pist_turu"] == "Çim" else "Sentetik (Polytrack)"
            else:
                effective_pist = r["pist_turu"] or "Kum"
                effective_pist_tipi = "Kaba Kum" if r["pist_turu"] == "Kum" else (r["pist_turu"] or "Kaba Kum")

            # Koşudaki atları çek
            cursor.execute("""
                SELECT pk.*, a.at_adi, a.baba_adi, a.anne_adi, a.kisrak_babasi_adi, a.yas as at_yas,
                       a.toplam_kosu as at_toplam_kosu, a.yas_cinsiyet,
                       tat.hesaplanan_stil, tat.stil_ikon, tat.kural_aciklamasi, tat.veri_durumu as taktik_durumu,
                       tke.pace_delta, tke.kulvar_yorumu, tke.taktik_rol
                FROM program_kayitlari pk
                LEFT JOIN atlar a ON pk.at_id = a.id
                LEFT JOIN turev_at_taktikleri tat ON pk.at_id = tat.at_id
                LEFT JOIN turev_kosu_at_etkileri tke ON (pk.at_id = tke.at_id AND pk.kosu_id = tke.kosu_id)
                WHERE pk.kosu_id = ?
                ORDER BY pk.at_no
            """, (kosu_id,))
            at_rows = cursor.fetchall()

            atlar_list = []
            for at in at_rows:
                yas = at["at_yas"] or 3
                clean_runs = "".join(filter(str.isdigit, at["son_6_yaris"] or ""))
                career_starts = max(at["at_toplam_kosu"] or 0, len(clean_runs))
                is_young = career_starts <= 3

                stil = at["hesaplanan_stil"]
                if is_young:
                    stil = "Taktik Serbest (İlk 3 Koşusu)"
                    ikon = "🌱"
                elif not stil or stil == "Taktik Serbest (İlk 3 Koşusu)" or stil == "Yetersiz Veri":
                    stil = "Orta Grup"
                    ikon = "🛡️"
                else:
                    ikon = at["stil_ikon"] or "🛡️"

                if "Kaçak" in stil or "Lider" in stil:
                    renk = "#eab308"
                elif "Pres" in stil:
                    renk = "#f97316"
                elif "Orta" in stil:
                    renk = "#3b82f6"
                elif "Sprinter" in stil or "Düzlük" in stil:
                    renk = "#a855f7"
                elif "Serbest" in stil or is_young:
                    renk = "#38bdf8"
                else:
                    renk = "#94a3b8"

                tactical_comment = at["kural_aciklamasi"]
                if not tactical_comment:
                    tactical_comment = (
                        "Kariyerinin ilk 3 koşusu; stil serbest, tempo delta nötr."
                        if is_young else
                        "Doğrulanmış ara-pozisyon verisi yok; stil ve tempo etkisi tahmin edilmedi."
                    )

                hp = at["handikap_puani"] or 0

                # Temiz at adı (Örn: ARSLANBEYLİ(6) -> ARSLANBEYLİ)
                raw_at_name = at["at_adi"] or ""
                clean_name = re.sub(r'\s*\(\d+\)\s*$', '', raw_at_name).strip()

                # Resmî İdman Pisti / Galop verisi eşleştir
                galop_rec = idman_by_no.get(at["at_no"]) or idman_by_name.get(clean_name.upper())
                if not clean_name and galop_rec and galop_rec["at_adi"]:
                    clean_name = galop_rec["at_adi"]
                if not clean_name:
                    clean_name = f"SAF-KAN {at['at_no']}"

                if galop_rec and galop_rec["derece_ozet"] and galop_rec["derece_ozet"] != "İdman Derecesi Yok":
                    son_galop = {
                        "tarih": galop_rec["idman_tarihi"] or "",
                        "pist": galop_rec["pist_turu"] or "Kum",
                        "sehir": galop_rec["idman_hipodromu"] or sehir,
                        "tur": galop_rec["idman_turu"] or "Galop",
                        "derece": galop_rec["derece_ozet"],
                        "son400hiz": galop_rec["son_400_hiz_kmh"],
                        "d_1200": galop_rec["d_1200"] or "",
                        "d_1000": galop_rec["d_1000"] or "",
                        "d_800": galop_rec["d_800"] or "",
                        "d_600": galop_rec["d_600"] or "",
                        "d_400": galop_rec["d_400"] or "",
                        "d_200": galop_rec["d_200"] or "",
                        "durum_kodu": galop_rec["durum_kodu"] or f"{galop_rec['idman_hipodromu']} {galop_rec['pist_turu']}"
                    }
                else:
                    son_galop = {
                        "tarih": "",
                        "pist": "",
                        "sehir": "",
                        "tur": "Resmî Galop Yok",
                        "derece": "Resmî Galop Kaydı Yok",
                        "son400hiz": None,
                        "d_1200": "",
                        "d_1000": "",
                        "d_800": "",
                        "d_600": "",
                        "d_400": "",
                        "d_200": "",
                        "durum_kodu": "Kayıtsız"
                    }

                atlar_list.append({
                    "no": at["at_no"],
                    "isim": clean_name,
                    "yas": yas,
                    "cinsiyet": at["yas_cinsiyet"] or "3y d e",
                    "irk": "Arap" if "Arap" in (r["kosu_cinsi"] or "") or "a" in (at["yas_cinsiyet"] or "").lower() else "İngiliz",
                    "baba": at["baba_adi"] or "",
                    "anne": at["anne_adi"] or "",
                    "kisrak_babasi": at["kisrak_babasi_adi"] or "",
                    "jokey": at["jokey_ad"] or "",
                    "siklet": at["kilo"] or 58.0,
                    "apranti_indirimi": False,
                    "kulvar": at["start_no"] or 1,
                    "handikap_puani": hp,
                    "son_yarislar": at["son_6_yaris"] or "",
                    "dinlenme_gunu": at["kgs"] or 20,
                    "takilar": at["takilar"].split() if at["takilar"] else [],
                    "isYoungHorse": is_young,
                    "taktik_durumu": "ILK_3_KOSU_SERBEST" if is_young else (at["taktik_durumu"] if at["taktik_durumu"] and at["taktik_durumu"] not in ("YETERSIZ_VERI", "ILK_3_KOSU_SERBEST") else "DEGISKEN"),
                    "kosu_stili": stil,
                    "stil_ikon": ikon,
                    "stil_renk": renk,
                    "stil_bg": f"{renk}1f",
                    "stil_border": f"{renk}59",
                    "agf_orani": at["agf_orani"] or 10.0,
                    "ganyan": at["ganyan_raw"] or "3.50",
                    "son_galop": son_galop,
                    "taktik_yorum": tactical_comment,
                    "tempo_delta": 0 if is_young else (
                        max(-1, min(1, at["pace_delta"])) if (at["pace_delta"] is not None and at["taktik_durumu"] in ("DEGISKEN", "KISMI", "TEK_OLCUM")) else
                        (at["pace_delta"] if at["pace_delta"] is not None else 0)
                    ),
                    "kulvar_yorumu": at["kulvar_yorumu"] or "",
                    "sahip": at["sahip_ad"] or "",
                    "antrenor": at["antrenor_ad"] or "",
                    "ekuriGrup": at["ekuri"] or "",
                    "pist_aptitude_analizi": build_pist_aptitude(
                        conn, at["at_id"], is_young, effective_pist,
                        sire_name=at["baba_adi"] or "",
                        dam_sire=at["kisrak_babasi_adi"] or "",
                        running_style=stil or ""
                    ),
                    "sinif_analizi": build_class_drop_analysis(
                        conn, at["at_id"], r["kosu_cinsi"] or ""
                    ),
                    "anne_kardesleri": build_deep_maternal_siblings(
                        conn, at["at_adi"] or "", at["anne_adi"] or ""
                    )
                })

            hipodrom_map[sehir]["kosular"].append({
                "kosu_no": r["kosu_no"],
                "saat": r["saat"] or f"{14+r['kosu_no']}:00",
                "mesafe": r["mesafe"] or 1400,
                "pist": effective_pist,
                "pist_tipi": effective_pist_tipi,
                "grup_sinifi": r["kosu_cinsi"] or "Şartlı",
                "ikramiye": f"{r['ikramiye_1']:,.0f} ₺".replace(',', '.') if r["ikramiye_1"] else "250.000 ₺",
                "altiliAyagi": altili_ayagi,
                "altiliPaketleri": race_pkgs,
                "tempo_senaryosu": tempo_senaryosu,
                "atlar": atlar_list
            })

        output_payload = {
            "tarih": dmy_dot,
            "seciliGun": dmy_slash,
            "gunAdi": gun_adi,
            "expectedCities": list(hipodrom_map.keys()),
            "guncellemeZamani": datetime.now().isoformat(),
            "sonSenkronizasyon": datetime.now().strftime("%H:%M:%S"),
            "kaynak": "TJK Resmî Yarış Programı ve İstatistik Veritabanı (Canlı Resmî Veri Akışı)",
            "hipodromlar": list(hipodrom_map.values())
        }

        os.makedirs(os.path.dirname(os.path.abspath(target_json_path)), exist_ok=True)
        with open(target_json_path, 'w', encoding='utf-8') as f:
            json.dump(output_payload, f, ensure_ascii=False, indent=2)

        logger.info(f"💾 Bülten JSON Güncellendi: {target_json_path} ({len(hipodrom_map)} Hipodrom, {len(kosu_rows)} Koşu)")
        return True

    # =========================================================================
    # ANA ORKESTRASYON: 5 AŞAMALI GÜNLÜK PİPELİNE
    # =========================================================================
    def run_daily_pipeline(self, target="both", days_back=1):
        """
        Kullanıcının talep ettiği 5 Aşamalı Günlük Otomasyon Görevi:
          1. Dünün (ve geriye dönük days_back günün) sonuçlarını ve gidişat verilerini topla
          2. Bugün ve yarının programını topla (kosular, program_kayitlari)
          3. Programdaki her at için kariyer geçmişini çek/güncelle (gecmis_yarislar)
          4. At koşu stillerini / taktiklerini hesapla (turev_at_taktikleri)
          5. Koşu tempo tahminlerini ve at etkilerini hesapla (turev_kosu_tempolari, turev_kosu_at_etkileri)
          6. Canlı bülten JSON dosyalarını doğrula ve güncelle
          7. Özet raporu yazdır
        """
        start_time = time.time()
        now = self.get_turkey_now()
        yesterday = now - timedelta(days=1)
        tomorrow = now + timedelta(days=1)

        conn = get_db_connection(self.db_path) if self.db_path else get_db_connection()

        logger.info("\n" + "=" * 75)
        logger.info("🐎 ROYAL TURF - TJK RESMÎ GÜNLÜK VERİ TOPLAMA VE ANALİZ PİPELİNE'I BAŞLATILDI")
        logger.info(f"📅 Sistem Zamanı (İstanbul): {now.strftime('%d/%m/%Y %H:%M:%S')}")
        logger.info("=" * 75)

        pipeline_summary = {
            "baslangic": now.isoformat(),
            "asama_1_sonuclar": {},
            "asama_2_program": {},
            "asama_3_kariyer": {},
            "asama_4_ve_5_analiz": {},
            "bulten_senkronizasyonu": {},
            "uyarilar": []
        }

        # ---------------------------------------------------------------------
        # AŞAMA 1: DÜNÜN (VE İŞLENMEMİŞ SON GÜNLERİN) SONUÇLARI VE GİDİŞAT VERİSİ
        # ---------------------------------------------------------------------
        try:
            for day_offset in range(days_back, 0, -1):
                past_date = now - timedelta(days=day_offset)
                res_info = self.scrape_and_save_race_results(past_date)
                pipeline_summary["asama_1_sonuclar"][past_date.strftime("%Y-%m-%d")] = res_info
        except Exception as e:
            logger.error(f"❌ [Aşama 1 Hatası] Yarış sonuçları çekilirken hata: {e}")
            pipeline_summary["uyarilar"].append(f"Aşama 1 Sonuç çekme hatası: {e}")

        # ---------------------------------------------------------------------
        # AŞAMA 2: BUGÜN VE YARININ YARIŞ PROGRAMI
        # ---------------------------------------------------------------------
        all_program_horses = []
        target_dates = []

        if target in ["today", "both"]:
            try:
                res_today = self.scrape_program_for_date(conn, now, day_label="bugun")
                pipeline_summary["asama_2_program"]["bugun"] = res_today
                all_program_horses.extend(res_today.get("horses", []))
                target_dates.append(now.strftime("%Y-%m-%d"))
            except Exception as e:
                logger.error(f"❌ [Aşama 2 Hatası] Bugün programı çekilirken hata: {e}")
                pipeline_summary["uyarilar"].append(f"Aşama 2 Bugün program hatası: {e}")

        if target in ["tomorrow", "both"]:
            try:
                res_tomorrow = self.scrape_program_for_date(conn, tomorrow, day_label="yarin")
                pipeline_summary["asama_2_program"]["yarin"] = res_tomorrow
                all_program_horses.extend(res_tomorrow.get("horses", []))
                target_dates.append(tomorrow.strftime("%Y-%m-%d"))
            except Exception as e:
                logger.error(f"❌ [Aşama 2 Hatası] Yarın programı çekilirken hata: {e}")
                pipeline_summary["uyarilar"].append(f"Aşama 2 Yarın program hatası: {e}")

        # Tekil at listesi
        unique_horses = list({h[0]: h for h in all_program_horses}.values())

        # ---------------------------------------------------------------------
        # AŞAMA 3: AT GEÇMİŞLERİNİ GÜNCELLE
        # ---------------------------------------------------------------------
        try:
            res_careers = self.update_horse_careers(conn, unique_horses)
            pipeline_summary["asama_3_kariyer"] = res_careers
        except Exception as e:
            logger.error(f"❌ [Aşama 3 Hatası] At kariyerleri güncellenirken hata: {e}")
            pipeline_summary["uyarilar"].append(f"Aşama 3 Kariyer güncelleme hatası: {e}")

        # ---------------------------------------------------------------------
        # AŞAMA 4: RESMÎ OLMAYAN ARA-POZİSYON ÖLÇÜMLERİNİ ÖNBELLEĞE AL
        # ---------------------------------------------------------------------
        try:
            logger.info("\n--- [AŞAMA 4] Accurace ara-pozisyon ölçümleri kontrol ediliyor (resmî olmayan kaynak) ---")
            cache_summary = self.refresh_accurace_cache(
                conn, unique_horses, max_new_races=800, history_depth=10
            )
            pipeline_summary["accurace_onbellek"] = cache_summary
        except Exception as e:
            logger.error(f"❌ [Aşama 4 Hatası] Accurace ölçümleri alınırken hata: {e}")
            pipeline_summary["uyarilar"].append(f"Accurace ara-pozisyon verisi alınamadı: {e}")

        # ---------------------------------------------------------------------
        # AŞAMA 5 & 6: KOŞU STİLİ (TAKTIK) VE YARIŞ TEMPO TAHMİNİ HESAPLAMA
        # ---------------------------------------------------------------------
        try:
            logger.info("\n--- [AŞAMA 5 & 6] Doğrulanmış taktik ve tempo analizi çalıştırılıyor ---")
            analysis_summary = run_full_tactical_and_pace_pipeline(conn, target_dates)
            pipeline_summary["asama_4_ve_5_analiz"] = analysis_summary

            # Eğer bugün veya yarın için tempo tahmini boşsa uyar!
            if analysis_summary.get("kosu_sayisi", 0) == 0:
                warning_msg = "⚠️ DİKKAT: Bugün ve yarın için hiçbir koşuya tempo tahmini üretilemedi!"
                logger.warning(warning_msg)
                pipeline_summary["uyarilar"].append(warning_msg)
        except Exception as e:
            logger.error(f"❌ [Aşama 4 & 5 Hatası] Analiz motorunda hata: {e}")
            pipeline_summary["uyarilar"].append(f"Aşama 4 & 5 Analiz hatası: {e}")

        # ---------------------------------------------------------------------
        # AŞAMA 6: BÜLTEN JSON DOSYALARINI GÜNCELLE
        # ---------------------------------------------------------------------
        try:
            logger.info("\n--- [AŞAMA 6] Canlı Bülten JSON Dosyaları Güncelleniyor ---")
            today_iso = now.strftime("%Y-%m-%d")
            tomorrow_iso = tomorrow.strftime("%Y-%m-%d")

            bulten_bugun_path = "public/data/bulten_bugun.json"
            bulten_yarin_path = "public/data/bulten_yarin.json"

            sync_today = self.sync_bulten_json_from_db(conn, today_iso, bulten_bugun_path)
            pipeline_summary["bulten_senkronizasyonu"]["bugun"] = sync_today

            sync_tomorrow = self.sync_bulten_json_from_db(conn, tomorrow_iso, bulten_yarin_path)
            pipeline_summary["bulten_senkronizasyonu"]["yarin"] = sync_tomorrow
        except Exception as e:
            logger.error(f"❌ [Aşama 6 Hatası] Bülten JSON senkronizasyon hatası: {e}")
            pipeline_summary["uyarilar"].append(f"Aşama 6 JSON senkronizasyon hatası: {e}")

        elapsed = round(time.time() - start_time, 2)
        pipeline_summary["toplam_sure_sn"] = elapsed

        # ---------------------------------------------------------------------
        # AŞAMA 7: ÇALIŞMA SONU ÖZETİ VE RAPORU
        # ---------------------------------------------------------------------
        self.print_pipeline_summary(pipeline_summary)

        conn.close()
        return pipeline_summary

    def print_pipeline_summary(self, summary):
        """Pipeline çalışması sonucunda konsola detaylı özet yazdırır."""
        print("\n" + "=" * 75)
        print("📊 TJK GÜNLÜK PİPELİNE ÇALIŞMA RAPORU VE ÖZETİ")
        print("=" * 75)

        # Aşama 1 Sonuçları
        print("\n[Aşama 1: Dünün / Geçmiş Yarış Sonuçları]")
        for d, s in summary.get("asama_1_sonuclar", {}).items():
            print(f"  • {d}: {s.get('toplam_kosu', 0)} koşu, {s.get('toplam_sonuc', 0)} safkan sonucu arşive eklendi.")

        # Aşama 2 Program
        print("\n[Aşama 2: Günlük Yarış Programı]")
        for lbl, p in summary.get("asama_2_program", {}).items():
            status = p.get("durum")
            count = p.get("kosu_count", 0)
            horses = len(p.get("horses", []))
            print(f"  • {lbl.upper()}: {status} ({count} koşu, {horses} tekil at)")

        # Aşama 3 Kariyer
        print("\n[Aşama 3: At Kariyer Geçmişi Güncellemesi]")
        kar = summary.get("asama_3_kariyer", {})
        print(f"  • Yeni Profil Çekilen: {kar.get('fetched', 0)}")
        print(f"  • Önbellekten Atlanan: {kar.get('skipped', 0)}")
        print(f"  • Başarısız / Ulaşılamayan: {kar.get('failed', 0)}")

        # Aşama 4 & 5 Analiz
        print("\n[Aşama 4 & 5: Taktik & Tempo Tahmin Motoru]")
        an = summary.get("asama_4_ve_5_analiz", {})
        print(f"  • Koşu Stili Güncellenen Safkan Sayısı: {an.get('at_sayisi', 0)}")
        print(f"  • Yetersiz Veri Safkan Sayısı: {an.get('yetersiz_veri_sayisi', 0)}")
        print(f"  • Kısmi Ölçümlü (2 koşu): {an.get('kismi_olcum_sayisi', 0)}")
        print(f"  • Değişken Stilli (baskın taktik atandı): {an.get('degisken_stil_sayisi', 0)}")
        print(f"  • Tecrübesiz Genç Safkan (Kural 1 - İlk 3 Koşu): {an.get('tecrubesiz_sayisi', 0)}")
        print(f"  • Tempo Tahmini Üretilen Koşu Sayısı: {an.get('kosu_sayisi', 0)}")

        # Uyarılar
        warnings = summary.get("uyarilar", [])
        if warnings:
            print("\n⚠️ PİPELİNE UYARILARI:")
            for w in warnings:
                print(f"  ! {w}")
        else:
            print("\n✅ HİÇBİR HATA VEYA UYARI YOK: Tüm adımlar %100 başarıyla tamamlandı.")

        print(f"\n⏱️ Toplam Çalışma Süresi: {summary.get('toplam_sure_sn', 0)} saniye")
        print("=" * 75 + "\n")
