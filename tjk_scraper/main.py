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
    SQLite veritabanındaki resmî program ve türev taktik/tempo tablolarını
    kullanarak bülten JSON'unu üretir.

    Taktik ataması burada yapılmaz; yalnızca turev_at_taktikleri,
    turev_kosu_tempolari ve turev_kosu_at_etkileri tablolarındaki
    doğrulanmış sonuçlar aktarılır.
    """
    conn = get_db_connection(db_path)
    try:
        scraper = TJKScraper(db_path=db_path)
        return scraper.sync_bulten_json_from_db(conn, tarih_iso, output_json_path)
    finally:
        conn.close()


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
                        help="Hangi günün programı çekilecek: today, tomorrow, both (varsayılan: both)")
    parser.add_argument("--days-back", type=int, default=1,
                        help="Geriye dönük kaç günlük yarış sonucu ve gidişat verisi çekilecek (varsayılan: 1 - dün)")
    parser.add_argument("--db", default=DEFAULT_DB_PATH,
                        help=f"SQLite veritabanı dosya yolu (varsayılan: {DEFAULT_DB_PATH})")
    parser.add_argument("--delay", type=float, default=0.5,
                        help="İstekler arası bekleme süresi saniye cinsinden (varsayılan: 0.5)")
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

    # Tek seferlik 5 aşamalı günlük pipeline çalıştırma
    scraper = TJKScraper(db_path=args.db, request_delay=args.delay)
    results = scraper.run_daily_pipeline(target=args.target, days_back=args.days_back)

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
