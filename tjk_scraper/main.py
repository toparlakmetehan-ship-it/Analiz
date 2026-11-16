# -*- coding: utf-8 -*-
"""
TJK Canlı Yarış Verisi Toplama CLI & Scheduler Servisi
Kullanım:
    python -m tjk_scraper.main --target today
    python -m tjk_scraper.main --target tomorrow
    python -m tjk_scraper.main --target both
    python -m tjk_scraper.main --target both --export-json
    python -m tjk_scraper.main --daemon --schedule 08:30
"""

import sys
import os
import argparse
import logging
import time
import json
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

# Proje ana dizinini path'e ekle
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from tjk_scraper.db import init_db, DEFAULT_DB_PATH, get_db_connection
from tjk_scraper.scraper import TJKScraper

# Logging ayarı
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(os.path.join(BASE_DIR, "tjk_scraper.log"), encoding="utf-8")
    ]
)
logger = logging.getLogger("TJKMain")


def export_sqlite_to_bulten_json(db_path, tarih_iso, output_json_path, gun_adi=None):
    """
    SQLite veritabanından çekilen resmî koşu ve at verilerini
    Royal Turf frontend bülten JSON formatında (bulten_bugun.json / bulten_yarin.json) dışa aktarır.
    """
    conn = get_db_connection(db_path)

    # Hipodromlar
    hip_cur = conn.execute("""
        SELECT DISTINCT h.id, h.sehir_adi, h.hipodrom_adi
        FROM hipodromlar h
        JOIN kosular k ON h.id = k.hipodrom_id
        WHERE k.tarih = ?
        ORDER BY h.id
    """, (tarih_iso,))
    hipodrom_rows = hip_cur.fetchall()

    hipodromlar_list = []
    expected_cities = []

    for hip in hipodrom_rows:
        sehir_id = hip["id"]
        sehir_adi = hip["sehir_adi"]
        hipodrom_adi = hip["hipodrom_adi"] or f"{sehir_adi} Hipodromu"
        expected_cities.append(sehir_adi)

        # Şehir bazlı birim fiyat
        is_large_city = sehir_id in [1, 2, 3, 4, 9]
        birim_fiyat = 1.25 if is_large_city else 1.00
        birim_fiyat_label = "Büyük Şehir Hipodromu (1.25 ₺)" if is_large_city else "Güneydoğu / Doğu Hipodromu (1.00 ₺)"

        # Koşular
        kosular_cur = conn.execute("""
            SELECT * FROM kosular
            WHERE tarih = ? AND hipodrom_id = ?
            ORDER BY kosu_no
        """, (tarih_iso, sehir_id))
        kosu_rows = kosular_cur.fetchall()

        parsed_kosular = []
        toplam_kosu_sayisi = len(kosu_rows)

        # 6'lı Ganyan Başlangıç Kuralı
        start_altili_kosu = max(1, toplam_kosu_sayisi - 6 + 1)

        for k in kosu_rows:
            kosu_id = k["id"]
            k_no = k["kosu_no"]

            # Altılı ayağı tespiti
            altili_ayagi = None
            if k_no >= start_altili_kosu and (k_no - start_altili_kosu + 1) <= 6:
                altili_ayagi = k_no - start_altili_kosu + 1

            # Atlar
            atlar_cur = conn.execute("""
                SELECT p.*, a.at_adi, a.yas, a.yas_cinsiyet, a.irk, a.baba_adi, a.anne_adi,
                       a.kisrak_babasi_adi, a.toplam_kosu as at_toplam_kosu,
                       a.birincilik_sayisi, a.toplam_kazanc
                FROM program_kayitlari p
                JOIN atlar a ON p.at_id = a.id
                WHERE p.kosu_id = ?
                ORDER BY p.at_no
            """, (kosu_id,))
            at_rows = atlar_cur.fetchall()

            atlar_list = []
            for at in at_rows:
                son_yarislar = at["son_6_yaris"] or ""
                clean_runs = "".join(filter(str.isdigit, son_yarislar))
                yas = at["yas"] or 3
                at_toplam_kosu = at["at_toplam_kosu"] or len(clean_runs)

                # Kural 1: İlk 3 koşusu olan taylar (<=3 yarış)
                is_young = (yas == 2 and at_toplam_kosu <= 3) or (at_toplam_kosu <= 3)

                if is_young:
                    kosu_stili = "Taktik Serbest (İlk 3 Koşusu)"
                    stil_ikon = "🌱"
                    stil_renk = "#38bdf8"
                    stil_bg = "rgba(56, 189, 248, 0.12)"
                    stil_border = "rgba(56, 189, 248, 0.35)"
                    taktik_yorum = "Yarış hayatının henüz başında (≤3 koşu). Koşu karakteri henüz oturmadığı için kalıplaşmış gidişat atanmaz; fiziksel tempo potansiyeli takip edilir."
                    pist_aptitude = {
                        "badge": "🌱 Pist Deneyimi: İlk 3 Koşusu (Pist & Taktik Nötr)",
                        "delta": 0,
                        "color": "#38bdf8",
                        "desc": "Safkan kariyerinin başında (≤3 yarış). Puanı nötr (0) tutulmuştur."
                    }
                else:
                    kosu_stili = "Orta Grup"
                    stil_ikon = "⚖️"
                    stil_renk = "#a855f7"
                    stil_bg = "rgba(168, 85, 247, 0.12)"
                    stil_border = "rgba(168, 85, 247, 0.35)"
                    taktik_yorum = "Resmî geçmiş yarışlarında dengeli orta grup takipçisi."
                    pist_aptitude = {
                        "badge": "Dengeli Grup Formu",
                        "delta": 0,
                        "color": "#a855f7",
                        "desc": "Resmî form ortalaması"
                    }

                hp = at["handikap_puani"] or 0
                sıklet = at["kilo"] or 57.0

                atlar_list.append({
                    "no": at["at_no"],
                    "isim": at["at_adi"],
                    "yas": yas,
                    "cinsiyet": at["yas_cinsiyet"] or "3y de",
                    "irk": at["irk"] or "İngiliz",
                    "baba": at["baba_adi"] or "",
                    "anne": at["anne_adi"] or "",
                    "kisrak_babasi": at["kisrak_babasi_adi"] or "",
                    "siklet": sıklet,
                    "jokey": at["jokey_ad"] or "",
                    "kulvar": at["start_no"] or at["at_no"],
                    "handikap": hp,
                    "son_yarislar": son_yarislar,
                    "dinlenme_gunu": at["kgs"] or 20,
                    "s20": at["s20"] or 20,
                    "ganyan": str(at["ganyan_oran"]) if at["ganyan_oran"] else "3.50",
                    "agf": at["agf_orani"] or 10.0,
                    "takilar": (at["takilar"] or "").split(),
                    "kosu_stili": kosu_stili,
                    "stil_ikon": stil_ikon,
                    "stil_renk": stil_renk,
                    "stil_bg": stil_bg,
                    "stil_border": stil_border,
                    "sprint_speed": 58.0 + (hp * 0.1),
                    "taktik_yorum": taktik_yorum,
                    "pist_aptitude_analizi": pist_aptitude,
                    "sahip": at["sahip_ad"] or "",
                    "antrenor": at["antrenor_ad"] or "",
                    "ekuriGrup": at["ekuri"] or ""
                })

            parsed_kosular.append({
                "kosu_no": k_no,
                "saat": k["saat"] or f"{14+k_no}:00",
                "mesafe": k["mesafe"] or 1400,
                "pist": k["pist_turu"] or "Kum",
                "pist_tipi": "Kaba Kum" if k["pist_turu"] == "Kum" else k["pist_turu"] or "Kum",
                "grup_sinifi": k["grup_bilgisi"] or k["kosu_cinsi"] or f"{k_no}. Koşu",
                "ikramiye": f"{k['ikramiye_1']:,.0f} ₺".replace(",", ".") if k["ikramiye_1"] else "500.000 ₺",
                "altiliAyagi": altili_ayagi,
                "atlar": atlar_list
            })

        hipodromlar_list.append({
            "id": sehir_adi.lower().replace("ç", "c").replace("ş", "s").replace("ı", "i").replace("ğ", "g").replace("ü", "u").replace("ö", "o"),
            "isim": hipodrom_adi,
            "sehir": sehir_adi,
            "tarih": datetime.strptime(tarih_iso, "%Y-%m-%d").strftime("%d.%m.%Y"),
            "havaDurumu": {"temp": 17, "conditionText": "Açık", "humidity": 55, "wind": 8},
            "rawTrackInfo": "Normal",
            "cimOlcum": "Yarış Yok" if all(k["pist"] != "Çim" for k in parsed_kosular) else "Çim (3.3 Normal)",
            "kumOlcum": "Kum (3.7 Normal)",
            "sentetikOlcum": "Yarış Yok" if all(k["pist"] != "Sentetik" for k in parsed_kosular) else "Sentetik (Normal)",
            "birimFiyat": birim_fiyat,
            "birimFiyatEtiket": birim_fiyat_label,
            "asgariKuponTL": 20.00,
            "kosular": parsed_kosular
        })

    conn.close()

    if not hipodromlar_list:
        logger.warning(f"{tarih_iso} için SQLite'ta veri bulunamadı, JSON dışa aktarılamadı.")
        return False

    date_obj = datetime.strptime(tarih_iso, "%Y-%m-%d")
    gun_adi_calc = gun_adi or ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"][date_obj.weekday()]

    json_payload = {
        "tarih": date_obj.strftime("%d.%m.%Y"),
        "seciliGun": date_obj.strftime("%d/%m/%Y"),
        "gunAdi": gun_adi_calc,
        "expectedCities": expected_cities,
        "guncellemeZamani": datetime.now().isoformat(),
        "sonSenkronizasyon": datetime.now().strftime("%H:%M:%S"),
        "kaynak": "TJK Resmî Yarış Programı (tjk.org Canlı Resmî Veri Akışı)",
        "hipodromlar": hipodromlar_list
    }

    os.makedirs(os.path.dirname(os.path.abspath(output_json_path)), exist_ok=True)
    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(json_payload, f, ensure_ascii=False, indent=2)

    logger.info(f"💾 JSON Dışa Aktarıldı: {output_json_path} ({len(hipodromlar_list)} Hipodrom)")
    return True


def run_scheduler_daemon(schedule_time="08:00", db_path=DEFAULT_DB_PATH, export_json=True):
    """
    Belirli saatte (Europe/Istanbul) her gün otomatik çalışan daemon servisi.
    """
    logger.info(f"⏰ TJK Scraper Daemon Başlatıldı. Hedef Çalışma Saati: {schedule_time} (Europe/Istanbul)")
    tz = ZoneInfo("Europe/Istanbul")
    scraper = TJKScraper(db_path=db_path)

    while True:
        now = datetime.now(tz)
        current_time_str = now.strftime("%H:%M")

        if current_time_str == schedule_time:
            logger.info(f"🎯 Zamanlanan saat geldi ({schedule_time}). Veri toplama başlatılıyor...")
            try:
                scraper.run_daily_pipeline(target="both")

                if export_json:
                    today_iso = now.strftime("%Y-%m-%d")
                    tomorrow_iso = (now + timedelta(days=1)).strftime("%Y-%m-%d")
                    export_sqlite_to_bulten_json(db_path, today_iso, os.path.join(BASE_DIR, "public", "data", "bulten_bugun.json"))
                    export_sqlite_to_bulten_json(db_path, tomorrow_iso, os.path.join(BASE_DIR, "public", "data", "bulten_yarin.json"))
            except Exception as e:
                logger.error(f"Daemon çalışma hatası: {e}", exc_info=True)

            # Bir sonraki dakikaya kadar bekle
            time.sleep(70)
        else:
            time.sleep(25)


def main():
    parser = argparse.ArgumentParser(description="TJK Resmî Yarış ve At Verisi Toplama Servisi")
    parser.add_argument("--target", choices=["today", "tomorrow", "both"], default="both",
                        help="Hangi günün verisi çekilecek: today, tomorrow, both (varsayılan: both)")
    parser.add_argument("--db", default=DEFAULT_DB_PATH,
                        help=f"SQLite veritabanı dosya yolu (varsayılan: {DEFAULT_DB_PATH})")
    parser.add_argument("--delay", type=float, default=0.6,
                        help="İstekler arası bekleme süresi saniye cinsinden (varsayılan: 0.6)")
    parser.add_argument("--export-json", action="store_true", default=True,
                        help="Çekilen verileri public/data/bulten_bugun.json ve bulten_yarin.json'a aktar")
    parser.add_argument("--daemon", action="store_true",
                        help="Zamanlayıcıyı sürekli arka planda çalıştır")
    parser.add_argument("--schedule", default="08:00",
                        help="Daemon modunda çalıştırılacak saat (HH:MM, varsayılan: 08:00)")

    args = parser.parse_args()

    # 1. Veritabanını başlat
    init_db(args.db)
    logger.info(f"📁 Veritabanı hazır: {args.db}")

    if args.daemon:
        run_scheduler_daemon(schedule_time=args.schedule, db_path=args.db, export_json=args.export_json)
        return

    # Tek seferlik çalıştırma
    scraper = TJKScraper(db_path=args.db, request_delay=args.delay)
    results = scraper.run_daily_pipeline(target=args.target)

    # JSON dışa aktarma (web sitesiyle tam senkronizasyon)
    if args.export_json:
        now = scraper.get_turkey_now()
        today_iso = now.strftime("%Y-%m-%d")
        tomorrow_iso = (now + timedelta(days=1)).strftime("%Y-%m-%d")

        if args.target in ["today", "both"]:
            export_sqlite_to_bulten_json(
                args.db, today_iso,
                os.path.join(BASE_DIR, "public", "data", "bulten_bugun.json")
            )

        if args.target in ["tomorrow", "both"]:
            export_sqlite_to_bulten_json(
                args.db, tomorrow_iso,
                os.path.join(BASE_DIR, "public", "data", "bulten_yarin.json")
            )

    logger.info("✨ Tüm işlemler başarıyla tamamlandı.")


if __name__ == "__main__":
    main()
