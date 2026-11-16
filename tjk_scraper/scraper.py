# -*- coding: utf-8 -*-
"""
TJK Web Scraper Ana Motoru
Bugün ve yarının resmî yarış programını ve programdaki her atın
geçmiş koşularını TJK.org'dan çeker, ilişkisel veritabanına kaydeder.
"""

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
    get_cached_at_ids_today,
    log_scrape_run
)
from .parser import (
    parse_daily_race_program_html,
    parse_horse_profile_html
)
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


class TJKScraper:
    def __init__(self, db_path=None, request_delay=0.6, max_retries=3):
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
                resp = self.session.get(url, timeout=15)
                # TJK bazen 500 veya 404 dönebilir
                if resp.status_code == 200:
                    # Charset kontrolü (TJK genelde utf-8 kullanır)
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

    def discover_active_hipodroms_for_date(self, target_date_dmy):
        """
        Belirtilen tarihte (örn: '16/11/2026') TJK'da koşusu olan hipodromları tarar.
        (sehir_id, sehir_adi, hipodrom_adi, html_content) listesi döner.
        """
        active_hipodroms = []
        q_date = urllib.parse.quote(target_date_dmy)

        for sehir_id, sehir_adi, hipodrom_adi in TJK_HIPODROMLAR:
            q_sehir = urllib.parse.quote(sehir_adi)
            url = f"https://www.tjk.org/TR/YarisSever/Info/Sehir/GunlukYarisProgrami?SehirId={sehir_id}&QueryParameter_Tarih={q_date}&SehirAdi={q_sehir}"
            html = self._fetch_url_with_retry(url, description=f"{sehir_adi} Programı")
            if not html:
                continue

            # Eğer sayfada yarış tablosu (tablesorter) varsa yarış vardır
            if 'class="tablesorter"' in html or "gunlukYarisProgramiTable" in html:
                active_hipodroms.append({
                    "sehir_id": sehir_id,
                    "sehir_adi": sehir_adi,
                    "hipodrom_adi": hipodrom_adi,
                    "html": html
                })
                logger.info(f"✅ Yarış Bulundu: {sehir_adi} ({target_date_dmy})")

        return active_hipodroms

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

    def run_sync_for_date(self, target_date_obj, day_label="bugun"):
        """
        Belirtilen bir tarih için tüm süreci baştan sona işletir:
        1. Aktif hipodromları keşfet
        2. Günlük program koşu ve at kayıtlarını veritabanına ekle
        3. Programdaki her atın tüm geçmiş koşularını profilinden çekip kaydet
        4. Doğrulama ve raporlama yap
        """
        start_time = time.time()
        dmy_str = target_date_obj.strftime("%d/%m/%Y")
        iso_str = target_date_obj.strftime("%Y-%m-%d")

        logger.info(f"\n{'='*60}")
        logger.info(f"🚀 TJK VERİ TOPLAMA BAŞLATILDI: {day_label.upper()} ({dmy_str})")
        logger.info(f"{'='*60}")

        conn = get_db_connection(self.db_path) if self.db_path else get_db_connection()

        # 1. Hipodromları Tara
        active_hipodroms = self.discover_active_hipodroms_for_date(dmy_str)
        if not active_hipodroms:
            if day_label == "yarin":
                logger.info(f"ℹ️ {dmy_str} (Yarın) için henüz TJK tarafından resmî yarış programı açıklanmamış. İşlem temiz sonlandırıldı.")
            else:
                logger.warning(f"⚠️ {dmy_str} ({day_label}) için koşu programı bulunamadı.")
            conn.close()
            return {
                "tarih": iso_str,
                "durum": "PROGRAM_YOK",
                "mesaj": "Resmî program bulunamadı"
            }

        # Önbellek: Bugün zaten profili başarıyla çekilmiş atların listesi
        bugun_iso = self.get_turkey_now().strftime("%Y-%m-%d")
        cached_at_ids = get_cached_at_ids_today(conn, bugun_iso)
        logger.info(f"📦 Önbellekteki At Sayısı: {len(cached_at_ids)} (Tekrar çekilmeyecek)")

        total_races_count = 0
        total_horses_in_program = 0
        horses_to_fetch_profile = []

        # 2. Günlük Programı Parse ve DB'ye Kaydet
        for hip in active_hipodroms:
            sehir_id = hip["sehir_id"]
            sehir_adi = hip["sehir_adi"]
            hipodrom_adi = hip["hipodrom_adi"]

            with conn:
                upsert_hipodrom(conn, sehir_id, sehir_adi, hipodrom_adi)

            kosular = parse_daily_race_program_html(hip["html"], sehir_id, sehir_adi, iso_str)
            logger.info(f"📍 {sehir_adi}: {len(kosular)} koşu ayrıştırıldı.")
            total_races_count += len(kosular)

            for k in kosular:
                with conn:
                    kosu_id = upsert_kosu(conn, k)

                for at_data in k.get("atlar", []):
                    total_horses_in_program += 1
                    at_id = at_data.get("at_id")
                    at_adi = at_data.get("at_adi")

                    # İlişkili kişileri kaydet
                    with conn:
                        if at_data.get("jokey_id") and at_data.get("jokey_ad"):
                            upsert_jokey(conn, at_data["jokey_id"], at_data["jokey_ad"])
                        if at_data.get("antrenor_id") and at_data.get("antrenor_ad"):
                            upsert_antrenor(conn, at_data["antrenor_id"], at_data["antrenor_ad"])
                        if at_data.get("sahip_id") and at_data.get("sahip_ad"):
                            upsert_sahip(conn, at_data["sahip_id"], at_data["sahip_ad"])

                        # At temel kaydı (profil öncesi)
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

                        # Program kaydı (koşudaki performansı)
                        at_data["kosu_id"] = kosu_id
                        upsert_program_kaydi(conn, at_data)

                    if at_id and at_id not in horses_to_fetch_profile:
                        horses_to_fetch_profile.append((at_id, at_adi))

        # 3. Her Atın Profil ve Tüm Geçmiş Yarışlarını Çek
        logger.info(f"\n🏇 Toplam {len(horses_to_fetch_profile)} tekil safkan için profil ve geçmiş yarış taraması başlıyor...")

        fetched_profile_count = 0
        skipped_cache_count = 0
        failed_profile_count = 0

        for at_id, at_adi in horses_to_fetch_profile:
            if at_id in cached_at_ids:
                skipped_cache_count += 1
                continue

            profile = self.scrape_horse_profile(at_id, at_adi)
            if profile:
                profile["son_profil_cekilme_tarihi"] = bugun_iso
                with conn:
                    upsert_at(conn, profile)
                    # Geçmiş koşuları kaydet
                    for yaris in profile.get("gecmis_yarislar", []):
                        upsert_gecmis_yaris(conn, yaris)

                cached_at_ids.add(at_id)
                fetched_profile_count += 1
                if fetched_profile_count % 10 == 0 or fetched_profile_count == len(horses_to_fetch_profile):
                    logger.info(f"   [{fetched_profile_count}/{len(horses_to_fetch_profile)}] {at_adi} geçmiş koşuları kaydedildi ({len(profile.get('gecmis_yarislar', []))} yarış).")
            else:
                failed_profile_count += 1
                logger.warning(f"⚠️ At {at_id} ({at_adi}) profil sayfasına ulaşılamadı. Eksik veri olarak işaretlendi.")
                with conn:
                    conn.execute("UPDATE atlar SET profil_eksik_mi = 1 WHERE id = ?", (at_id,))
                    conn.execute("UPDATE program_kayitlari SET veri_durumu = 'EKSIK', hata_notu = 'Profil sayfasına ulaşılamadı' WHERE at_id = ?", (at_id,))

        elapsed = round(time.time() - start_time, 2)
        logger.info(f"🏁 Veri çekme tamamlandı ({elapsed} sn). Yeni çekilen: {fetched_profile_count}, Önbellekten atlanan: {skipped_cache_count}, Başarısız: {failed_profile_count}")

        # 4. Doğrulama ve Raporlama
        summary = validate_database_integrity(conn, iso_str)
        print_validation_report(summary)

        # Log tablosuna yaz
        summary["hedef_gun"] = day_label
        summary["tarih_str"] = iso_str
        summary["calisma_suresi_sn"] = elapsed
        with conn:
            log_scrape_run(conn, summary)

        conn.close()
        return summary

    def run_daily_pipeline(self, target="both"):
        """
        Günlük otomatik pipeline:
        target: 'today', 'tomorrow', 'both'
        """
        now = self.get_turkey_now()
        tomorrow = now + timedelta(days=1)

        results = {}
        if target in ["today", "both"]:
            results["today"] = self.run_sync_for_date(now, day_label="bugun")

        if target in ["tomorrow", "both"]:
            results["tomorrow"] = self.run_sync_for_date(tomorrow, day_label="yarin")

        return results
