# -*- coding: utf-8 -*-
"""
TJK Yarış ve Analiz Veritabanı Modülü (SQLite)
İlişkisel şema, ID bazlı tekilleştirme ve ham veriden ayrı türev veri tabloları.
"""

import sqlite3
import os
import json
from datetime import datetime

DEFAULT_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "tjk_yaris_arsiv.db")

SCHEMA_SQL = """
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- 1. HİPODROMLAR
CREATE TABLE IF NOT EXISTS hipodromlar (
    id INTEGER PRIMARY KEY,             -- TJK SehirId (1=Ankara, 4=Bursa, vb.)
    sehir_adi TEXT NOT NULL,
    hipodrom_adi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. JOKEYLER
CREATE TABLE IF NOT EXISTS jokeyler (
    id INTEGER PRIMARY KEY,             -- TJK JokeyId
    ad_soyad TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ANTRENÖRLER
CREATE TABLE IF NOT EXISTS antrenorler (
    id INTEGER PRIMARY KEY,             -- TJK AntrenorId
    ad_soyad TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. SAHİPLER
CREATE TABLE IF NOT EXISTS sahipler (
    id INTEGER PRIMARY KEY,             -- TJK SahipId
    ad_soyad TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. YETİŞTİRİCİLER
CREATE TABLE IF NOT EXISTS yetistiriciler (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ad_soyad TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. KOŞULAR (Günlük programdaki koşular)
CREATE TABLE IF NOT EXISTS kosular (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tarih TEXT NOT NULL,                -- YYYY-MM-DD
    hipodrom_id INTEGER NOT NULL REFERENCES hipodromlar(id),
    kosu_no INTEGER NOT NULL,
    saat TEXT,                          -- HH:MM
    kosu_cinsi TEXT,                    -- Maiden, Handikap 16, KV-6 vb.
    grup_bilgisi TEXT,                  -- 3 Yaşlı Araplar, 2 Yaşlı İngilizler vb.
    mesafe INTEGER,                     -- metre (örn: 1400)
    pist_turu TEXT,                     -- Çim, Kum, Sentetik
    pist_durumu TEXT,                   -- Islak, Normal, Ağır vb.
    ikramiye_1 REAL,
    ikramiye_2 REAL,
    ikramiye_3 REAL,
    ikramiye_4 REAL,
    ikramiye_5 REAL,
    ikramiye_raw TEXT,
    yetistirici_primi_1 REAL,
    sahip_primi_1 REAL,
    yas_sarti TEXT,
    agirlik_handikap_sarti TEXT,
    eid_sure_raw TEXT,                  -- En iyi derece rekoru
    beklenen_at_sayisi INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tarih, hipodrom_id, kosu_no)
);

-- 7. ATLAR (TJK At Profili Ana Kaydı)
CREATE TABLE IF NOT EXISTS atlar (
    id INTEGER PRIMARY KEY,             -- TJK AtId (QueryParameter_AtId)
    at_adi TEXT NOT NULL,
    dogum_tarihi TEXT,                  -- YYYY-MM-DD veya DD.MM.YYYY
    yas_cinsiyet TEXT,                  -- örn: 2y de
    yas INTEGER,
    cinsiyet TEXT,                      -- Erkek, Dişi
    irk TEXT,                           -- İngiliz, Arap
    don_renk TEXT,                      -- Doru, Al, Kır, Yağız
    baba_id INTEGER,
    baba_adi TEXT,
    anne_id INTEGER,
    anne_adi TEXT,
    kisrak_babasi_adi TEXT,
    gercek_sahip TEXT,
    yetistirici TEXT,
    toplam_kosu INTEGER,
    birincilik_sayisi INTEGER,
    ikincilik_sayisi INTEGER,
    ucunculuk_sayisi INTEGER,
    dordunculuk_sayisi INTEGER,
    besincilik_sayisi INTEGER,
    toplam_kazanc REAL,
    toplam_kazanc_raw TEXT,
    cim_performans TEXT,
    kum_performans TEXT,
    sentetik_performans TEXT,
    profil_eksik_mi BOOLEAN DEFAULT 0,
    son_profil_cekilme_tarihi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. PROGRAM KAYITLARI (Koşudaki atların bülten verisi)
CREATE TABLE IF NOT EXISTS program_kayitlari (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kosu_id INTEGER NOT NULL REFERENCES kosular(id),
    at_id INTEGER NOT NULL REFERENCES atlar(id),
    at_no INTEGER NOT NULL,
    start_no INTEGER,                   -- Kulvar (St)
    kilo REAL,                          -- Parse edilmiş kilo
    kilo_raw TEXT,                      -- Ham metin
    jokey_id INTEGER REFERENCES jokeyler(id),
    jokey_ad TEXT,
    antrenor_id INTEGER REFERENCES antrenorler(id),
    antrenor_ad TEXT,
    sahip_id INTEGER REFERENCES sahipler(id),
    sahip_ad TEXT,
    handikap_puani INTEGER,
    handikap_raw TEXT,
    takilar TEXT,                       -- KG, DB, SK vb.
    agf_orani REAL,
    agf_raw TEXT,
    ganyan_oran REAL,
    ganyan_raw TEXT,
    son_6_yaris TEXT,
    kgs INTEGER,                        -- Koşmadığı gün sayısı
    s20 INTEGER,                        -- Son 20 koşu skoru
    en_iyi_derece_raw TEXT,
    ekuri TEXT,
    forma_img_url TEXT,
    veri_durumu TEXT DEFAULT 'TAM',     -- 'TAM', 'EKSIK'
    hata_notu TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(kosu_id, at_no)
);

-- 9. GEÇMİŞ YARIŞLAR (Her atın profilindeki geçmiş koşuları - HAM VERİ)
CREATE TABLE IF NOT EXISTS gecmis_yarislar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    at_id INTEGER NOT NULL REFERENCES atlar(id),
    tarih TEXT NOT NULL,                -- YYYY-MM-DD veya DD.MM.YYYY
    hipodrom_sehir TEXT NOT NULL,
    mesafe INTEGER,
    mesafe_raw TEXT,
    pist_turu TEXT,                     -- Çim, Kum, Sentetik
    pist_durumu TEXT,
    pist_raw TEXT,
    sira INTEGER,                       -- Varış sırası (1, 2, 3...)
    sira_raw TEXT,
    derece_raw TEXT,                    -- '1.17.37'
    derece_saniye REAL,                 -- 77.37 (saniye cinsinden sayısal)
    kilo REAL,
    kilo_raw TEXT,
    jokey_ad TEXT,
    start_no INTEGER,
    taki TEXT,
    ganyan REAL,
    ganyan_raw TEXT,
    grup TEXT,
    kosu_no INTEGER,
    kosu_cinsi TEXT,
    antrenor_ad TEXT,
    sahip_ad TEXT,
    handikap INTEGER,
    handikap_raw TEXT,
    ikramiye REAL,
    ikramiye_raw TEXT,
    s20 INTEGER,
    fark TEXT,
    video_url TEXT,
    raw_satir_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(at_id, tarih, kosu_no, hipodrom_sehir)
);

-- 10. RESMÎ YARIŞ SONUÇLARI VE GİDİŞAT BİLGİSİ (HAM VERİ)
CREATE TABLE IF NOT EXISTS yaris_sonuclari (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tarih TEXT NOT NULL,                -- YYYY-MM-DD
    hipodrom_id INTEGER NOT NULL REFERENCES hipodromlar(id),
    sehir_adi TEXT NOT NULL,
    kosu_no INTEGER NOT NULL,
    kosu_kodu INTEGER,                  -- TJK KosuKodu (örn: 228581)
    at_id INTEGER NOT NULL REFERENCES atlar(id),
    at_no INTEGER,
    at_ismi TEXT NOT NULL,
    sira INTEGER,                       -- Varış sırası (1, 2, 3...)
    sira_raw TEXT,
    derece_raw TEXT,
    derece_saniye REAL,
    fark_raw TEXT,                      -- 'Yarım Boy', '1 Boy', 'Boyun', 'Baş', 'Burun'
    fark_boy REAL,                      -- Sayısal boy: 0.5, 1.0, 0.25, 0.1, 0.05 vb.
    gec_cikis_raw TEXT,                 -- '2 Boy', '3 Boy'
    gec_cikis_boy REAL,                 -- Sayısal geç çıkış boyu
    ganyan REAL,
    agf TEXT,
    start_no INTEGER,
    hp INTEGER,
    son_800_raw TEXT,                   -- '0.58.20-0.58.38'
    son_800_saniye REAL,                -- İlk süre saniyeye çevrilmiş (örn: 58.20)
    video_url TEXT,
    accurace_url TEXT,
    fotofinish_url TEXT,
    komiser_raporu_url TEXT,
    gidisat_yorumu TEXT,                -- Komiser veya TJK resmi gidiş notu
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tarih, hipodrom_id, kosu_no, at_id)
);

-- ══════════════════════════════════════════════════════════════════════════════
-- HESAPLANAN (TÜREV) VERİLER — HAM VERİ TABLOLARINDAN TAMAMEN AYRI TUTULUR
-- ══════════════════════════════════════════════════════════════════════════════

-- 11. TÜREV: AT BAZINDA KOŞU STİLİ VE TAKTİĞİ (TÜREV VERİ)
CREATE TABLE IF NOT EXISTS turev_at_taktikleri (
    at_id INTEGER PRIMARY KEY REFERENCES atlar(id),
    at_ismi TEXT NOT NULL,
    toplam_kosu_sayisi INTEGER DEFAULT 0,
    analiz_edilen_kosu_sayisi INTEGER DEFAULT 0,
    hesaplanan_stil TEXT NOT NULL,      -- 'Kaçak / Lider', 'Presçi', 'Orta Grup', 'Düzlük Sprinteri', 'Taktik Serbest (İlk 3 Koşusu)', 'Yetersiz Veri'
    stil_kodu TEXT NOT NULL,            -- 'KACAK', 'PRESCI', 'ORTA_GRUP', 'SPRINTER', 'SERBEST', 'YETERSIZ'
    stil_ikon TEXT NOT NULL,            -- '⚡', '🏹', '🛡️', '🚀', '🌱', '❓'
    onde_gitme_orani REAL DEFAULT 0.0,  -- % liderlik/ön grup
    pres_orani REAL DEFAULT 0.0,        -- % presçi takip
    orta_orani REAL DEFAULT 0.0,        -- % orta grup
    bekleme_orani REAL DEFAULT 0.0,     -- % arka grup bekleme
    kural_aciklamasi TEXT,              -- Hangi matematiksel kural ile hesaplandığı
    veri_durumu TEXT NOT NULL,          -- 'GUNCEL', 'KISMI', 'TEK_OLCUM', 'DEGISKEN', 'ILK_3_KOSU_SERBEST', 'YETERSIZ_VERI'
    hesaplanma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. TÜREV: YARIŞ BAZINDA TEMPO TAHMİNİ (TÜREV VERİ)
CREATE TABLE IF NOT EXISTS turev_kosu_tempolari (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tarih TEXT NOT NULL,                -- YYYY-MM-DD
    hipodrom_id INTEGER NOT NULL REFERENCES hipodromlar(id),
    kosu_no INTEGER NOT NULL,
    kosu_id INTEGER REFERENCES kosular(id),
    mesafe INTEGER,
    pist_turu TEXT,
    tahmini_tempo TEXT NOT NULL,        -- 'Çok Hızlı / Yüksek Baskı', 'Süratli / Tempolu', 'Dengeli / Normal', 'Ağır / Yavaş'
    tempo_kodu TEXT NOT NULL,           -- 'COK_HIZLI', 'SURATLI', 'DENGELI', 'YAVAS'
    tempo_skoru REAL,                   -- 0 - 100 tempo baskı endeksi
    kacak_sayisi INTEGER DEFAULT 0,
    presci_sayisi INTEGER DEFAULT 0,
    orta_grup_sayisi INTEGER DEFAULT 0,
    sprinter_sayisi INTEGER DEFAULT 0,
    tecrubesiz_sayisi INTEGER DEFAULT 0,
    olasi_liderler TEXT,                -- JSON listesi [ { "no": 1, "isim": "SANCAR" } ]
    olasi_presciler TEXT,               -- JSON listesi
    avantajli_stiller TEXT,             -- Örn: 'Düzlük Sprinteri ve Dengeli Orta Grup'
    tempo_analiz_yorumu TEXT,           -- Detaylı taktiksel senaryo analizi
    veri_durumu TEXT NOT NULL,          -- 'TAMAMLANDI', 'BOS_UYARI', 'YETERSIZ_VERI'
    hesaplanma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tarih, hipodrom_id, kosu_no)
);

-- 13. TÜREV: ATIN KOŞUYA ÖZEL TEMPO DELTASI VE ROLÜ (TÜREV VERİ)
CREATE TABLE IF NOT EXISTS turev_kosu_at_etkileri (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kosu_id INTEGER NOT NULL REFERENCES kosular(id),
    at_id INTEGER NOT NULL REFERENCES atlar(id),
    at_no INTEGER,
    at_ismi TEXT,
    hesaplanan_stil TEXT,
    pace_delta INTEGER DEFAULT 0,       -- +2, +1, 0, -1, -2
    start_kapisi INTEGER,
    kulvar_yorumu TEXT,
    taktik_rol TEXT,                    -- 'Lider Adayı', 'Presçi', 'Pusu Sprinter', 'Taktik Serbest'
    hesaplanma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(kosu_id, at_id)
);

-- 14. ÜÇÜNCÜ TARAF ARA POZİSYON ÖNBELLEĞİ (RESMÎ OLMAYAN TÜREV GİRDİ)
CREATE TABLE IF NOT EXISTS accurace_race_cache (
    date_iso TEXT NOT NULL,
    city_slug TEXT NOT NULL,
    race_no INTEGER NOT NULL,
    status TEXT NOT NULL,               -- 'OK', 'NO_DATA', 'NOT_FOUND', 'ERROR'
    payload_json TEXT,
    source_url TEXT,
    error_message TEXT,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(date_iso, city_slug, race_no)
);

-- 15. SCRAPING VE DOĞRULAMA LOGLARI
CREATE TABLE IF NOT EXISTS scraping_loglari (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    calisma_tarihi TEXT NOT NULL,
    hedef_gun TEXT NOT NULL,            -- 'dunun_sonuclari', 'bugun', 'yarin', 'gunluk_pipeline'
    tarih_str TEXT NOT NULL,            -- YYYY-MM-DD
    hipodrom_sayisi INTEGER,
    kosu_sayisi INTEGER,
    at_sayisi INTEGER,
    gecmis_yaris_sayisi INTEGER,
    eksik_at_sayisi INTEGER,
    uyarilar TEXT,
    durum TEXT,                         -- 'BASARILI', 'UYARI', 'HATA'
    calisma_suresi_sn REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. RESMÎ TJK İDMAN PİSTİ VE GALOP VERİLERİ (HAM VERİ - ASLA UYDURULMAZ)
CREATE TABLE IF NOT EXISTS idman_pist_kayitlari (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tarih TEXT NOT NULL,                -- YYYY-MM-DD (Koşu tarihi)
    hipodrom_id INTEGER NOT NULL REFERENCES hipodromlar(id),
    kosu_no INTEGER NOT NULL,
    kosu_kodu INTEGER,
    at_id INTEGER REFERENCES atlar(id),
    at_no INTEGER NOT NULL,
    at_adi TEXT NOT NULL,
    d_1200 TEXT,
    d_1000 TEXT,
    d_800 TEXT,
    d_600 TEXT,
    d_400 TEXT,
    d_200 TEXT,
    idman_tarihi TEXT,
    pist_turu TEXT,                     -- Kum, Çim, Sentetik
    idman_turu TEXT,                    -- Galop, Sprint, Kenter vb.
    idman_hipodromu TEXT,               -- Bursa, Kocaeli, İstanbul vb.
    derece_ozet TEXT,                   -- Örn: '800: 0.50.60 / 400: 0.24.60'
    son_400_hiz_kmh REAL,               -- Resmî 400m derecesinden hesaplanan sprint hızı
    durum_kodu TEXT,                    -- 'Kocaeli Kum' vb.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tarih, hipodrom_id, kosu_no, at_no)
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_kosular_tarih ON kosular(tarih);
CREATE INDEX IF NOT EXISTS idx_program_kosu ON program_kayitlari(kosu_id);
CREATE INDEX IF NOT EXISTS idx_gecmis_at ON gecmis_yarislar(at_id);
CREATE INDEX IF NOT EXISTS idx_gecmis_tarih ON gecmis_yarislar(tarih);
CREATE INDEX IF NOT EXISTS idx_yaris_sonuclari_tarih ON yaris_sonuclari(tarih);
CREATE INDEX IF NOT EXISTS idx_yaris_sonuclari_at ON yaris_sonuclari(at_id);
CREATE INDEX IF NOT EXISTS idx_turev_tempolar_tarih ON turev_kosu_tempolari(tarih);
CREATE INDEX IF NOT EXISTS idx_accurace_cache_status ON accurace_race_cache(status, checked_at);
"""

def get_db_connection(db_path=DEFAULT_DB_PATH):
    """Veritabanı bağlantısı açar ve foreign key desteğini etkinleştirir."""
    os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
    conn = sqlite3.connect(db_path, timeout=30.0)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.row_factory = sqlite3.Row
    return conn


def init_db(db_path=DEFAULT_DB_PATH):
    """Tüm veritabanı şemasını oluşturur ve şema güncellemelerini uygular."""
    conn = get_db_connection(db_path)
    with conn:
        conn.executescript(SCHEMA_SQL)
        # Sütun güncellemeleri
        cols = [c[1] for c in conn.execute("PRAGMA table_info(gecmis_yarislar);").fetchall()]
        if "video_url" not in cols:
            try:
                conn.execute("ALTER TABLE gecmis_yarislar ADD COLUMN video_url TEXT;")
            except Exception:
                pass
    conn.close()


def upsert_hipodrom(conn, sehir_id, sehir_adi, hipodrom_adi=None):
    sql = """
    INSERT INTO hipodromlar (id, sehir_adi, hipodrom_adi)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        sehir_adi = excluded.sehir_adi,
        hipodrom_adi = COALESCE(excluded.hipodrom_adi, hipodromlar.hipodrom_adi);
    """
    conn.execute(sql, (sehir_id, sehir_adi, hipodrom_adi))


def upsert_jokey(conn, jokey_id, ad_soyad):
    if not jokey_id or not ad_soyad:
        return
    sql = """
    INSERT INTO jokeyler (id, ad_soyad) VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET ad_soyad = excluded.ad_soyad;
    """
    conn.execute(sql, (jokey_id, ad_soyad.strip()))


def upsert_antrenor(conn, antrenor_id, ad_soyad):
    if not antrenor_id or not ad_soyad:
        return
    sql = """
    INSERT INTO antrenorler (id, ad_soyad) VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET ad_soyad = excluded.ad_soyad;
    """
    conn.execute(sql, (antrenor_id, ad_soyad.strip()))


def upsert_sahip(conn, sahip_id, ad_soyad):
    if not sahip_id or not ad_soyad:
        return
    sql = """
    INSERT INTO sahipler (id, ad_soyad) VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET ad_soyad = excluded.ad_soyad;
    """
    conn.execute(sql, (sahip_id, ad_soyad.strip()))


def upsert_kosu(conn, k):
    sql = """
    INSERT INTO kosular (
        tarih, hipodrom_id, kosu_no, saat, kosu_cinsi, grup_bilgisi,
        mesafe, pist_turu, pist_durumu, ikramiye_1, ikramiye_2, ikramiye_3,
        ikramiye_4, ikramiye_5, ikramiye_raw, yetistirici_primi_1, sahip_primi_1,
        yas_sarti, agirlik_handikap_sarti, eid_sure_raw, beklenen_at_sayisi, updated_at
    ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, CURRENT_TIMESTAMP
    )
    ON CONFLICT(tarih, hipodrom_id, kosu_no) DO UPDATE SET
        saat = COALESCE(excluded.saat, kosular.saat),
        kosu_cinsi = excluded.kosu_cinsi,
        grup_bilgisi = excluded.grup_bilgisi,
        mesafe = excluded.mesafe,
        pist_turu = excluded.pist_turu,
        pist_durumu = excluded.pist_durumu,
        ikramiye_1 = excluded.ikramiye_1,
        ikramiye_raw = excluded.ikramiye_raw,
        beklenen_at_sayisi = excluded.beklenen_at_sayisi,
        updated_at = CURRENT_TIMESTAMP;
    """
    cur = conn.execute(sql, (
        k.get("tarih"), k.get("hipodrom_id"), k.get("kosu_no"), k.get("saat"),
        k.get("kosu_cinsi"), k.get("grup_bilgisi"), k.get("mesafe"),
        k.get("pist_turu"), k.get("pist_durumu"),
        k.get("ikramiye_1"), k.get("ikramiye_2"), k.get("ikramiye_3"),
        k.get("ikramiye_4"), k.get("ikramiye_5"), k.get("ikramiye_raw"),
        k.get("yetistirici_primi_1"), k.get("sahip_primi_1"),
        k.get("yas_sarti"), k.get("agirlik_handikap_sarti"),
        k.get("eid_sure_raw"), k.get("beklenen_at_sayisi")
    ))

    cur2 = conn.execute(
        "SELECT id FROM kosular WHERE tarih = ? AND hipodrom_id = ? AND kosu_no = ?",
        (k.get("tarih"), k.get("hipodrom_id"), k.get("kosu_no"))
    )
    row = cur2.fetchone()
    return row["id"] if row else cur.lastrowid


def upsert_at(conn, a):
    sql = """
    INSERT INTO atlar (
        id, at_adi, dogum_tarihi, yas_cinsiyet, yas, cinsiyet, irk, don_renk,
        baba_id, baba_adi, anne_id, anne_adi, kisrak_babasi_adi, gercek_sahip,
        yetistirici, toplam_kosu, birincilik_sayisi, ikincilik_sayisi,
        ucunculuk_sayisi, dordunculuk_sayisi, besincilik_sayisi, toplam_kazanc,
        toplam_kazanc_raw, cim_performans, kum_performans, sentetik_performans,
        profil_eksik_mi, son_profil_cekilme_tarihi, updated_at
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, CURRENT_TIMESTAMP
    )
    ON CONFLICT(id) DO UPDATE SET
        at_adi = excluded.at_adi,
        dogum_tarihi = COALESCE(excluded.dogum_tarihi, atlar.dogum_tarihi),
        yas_cinsiyet = COALESCE(excluded.yas_cinsiyet, atlar.yas_cinsiyet),
        yas = COALESCE(excluded.yas, atlar.yas),
        cinsiyet = COALESCE(excluded.cinsiyet, atlar.cinsiyet),
        baba_id = COALESCE(excluded.baba_id, atlar.baba_id),
        baba_adi = COALESCE(excluded.baba_adi, atlar.baba_adi),
        anne_id = COALESCE(excluded.anne_id, atlar.anne_id),
        anne_adi = COALESCE(excluded.anne_adi, atlar.anne_adi),
        toplam_kosu = COALESCE(excluded.toplam_kosu, atlar.toplam_kosu),
        toplam_kazanc = COALESCE(excluded.toplam_kazanc, atlar.toplam_kazanc),
        profil_eksik_mi = excluded.profil_eksik_mi,
        son_profil_cekilme_tarihi = COALESCE(excluded.son_profil_cekilme_tarihi, atlar.son_profil_cekilme_tarihi),
        updated_at = CURRENT_TIMESTAMP;
    """
    conn.execute(sql, (
        a.get("id"), a.get("at_adi"), a.get("dogum_tarihi"), a.get("yas_cinsiyet"),
        a.get("yas"), a.get("cinsiyet"), a.get("irk"), a.get("don_renk"),
        a.get("baba_id"), a.get("baba_adi"), a.get("anne_id"), a.get("anne_adi"),
        a.get("kisrak_babasi_adi"), a.get("gercek_sahip"), a.get("yetistirici"),
        a.get("toplam_kosu"), a.get("birincilik_sayisi"), a.get("ikincilik_sayisi"),
        a.get("ucunculuk_sayisi"), a.get("dordunculuk_sayisi"), a.get("besincilik_sayisi"),
        a.get("toplam_kazanc"), a.get("toplam_kazanc_raw"),
        a.get("cim_performans"), a.get("kum_performans"), a.get("sentetik_performans"),
        1 if a.get("profil_eksik_mi") else 0,
        a.get("son_profil_cekilme_tarihi")
    ))


def upsert_program_kaydi(conn, p):
    sql = """
    INSERT INTO program_kayitlari (
        kosu_id, at_id, at_no, start_no, kilo, kilo_raw, jokey_id, jokey_ad,
        antrenor_id, antrenor_ad, sahip_id, sahip_ad, handikap_puani,
        handikap_raw, takilar, agf_orani, agf_raw, ganyan_oran, ganyan_raw,
        son_6_yaris, kgs, s20, en_iyi_derece_raw, ekuri, forma_img_url,
        veri_durumu, hata_notu, updated_at
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, CURRENT_TIMESTAMP
    )
    ON CONFLICT(kosu_id, at_no) DO UPDATE SET
        at_id = excluded.at_id,
        start_no = excluded.start_no,
        kilo = excluded.kilo,
        kilo_raw = excluded.kilo_raw,
        jokey_id = excluded.jokey_id,
        jokey_ad = excluded.jokey_ad,
        antrenor_id = excluded.antrenor_id,
        antrenor_ad = excluded.antrenor_ad,
        sahip_id = excluded.sahip_id,
        sahip_ad = excluded.sahip_ad,
        handikap_puani = excluded.handikap_puani,
        handikap_raw = excluded.handikap_raw,
        takilar = excluded.takilar,
        agf_orani = excluded.agf_orani,
        agf_raw = excluded.agf_raw,
        ganyan_oran = excluded.ganyan_oran,
        ganyan_raw = excluded.ganyan_raw,
        son_6_yaris = excluded.son_6_yaris,
        kgs = excluded.kgs,
        s20 = excluded.s20,
        en_iyi_derece_raw = excluded.en_iyi_derece_raw,
        ekuri = excluded.ekuri,
        forma_img_url = excluded.forma_img_url,
        veri_durumu = excluded.veri_durumu,
        hata_notu = excluded.hata_notu,
        updated_at = CURRENT_TIMESTAMP;
    """
    conn.execute(sql, (
        p.get("kosu_id"), p.get("at_id"), p.get("at_no"), p.get("start_no"),
        p.get("kilo"), p.get("kilo_raw"), p.get("jokey_id"), p.get("jokey_ad"),
        p.get("antrenor_id"), p.get("antrenor_ad"), p.get("sahip_id"), p.get("sahip_ad"),
        p.get("handikap_puani"), p.get("handikap_raw"), p.get("takilar"),
        p.get("agf_orani"), p.get("agf_raw"), p.get("ganyan_oran"), p.get("ganyan_raw"),
        p.get("son_6_yaris"), p.get("kgs"), p.get("s20"), p.get("en_iyi_derece_raw"),
        p.get("ekuri"), p.get("forma_img_url"), p.get("veri_durumu", "TAM"), p.get("hata_notu")
    ))


def upsert_gecmis_yaris(conn, g):
    """Geçmiş koşu satırını ekler (kayıt bazında tekilleştirme)."""
    sql = """
    INSERT INTO gecmis_yarislar (
        at_id, tarih, hipodrom_sehir, mesafe, mesafe_raw, pist_turu,
        pist_durumu, pist_raw, sira, sira_raw, derece_raw, derece_saniye,
        kilo, kilo_raw, jokey_ad, start_no, taki, ganyan, ganyan_raw,
        grup, kosu_no, kosu_cinsi, antrenor_ad, sahip_ad, handikap,
        handikap_raw, ikramiye, ikramiye_raw, s20, fark, video_url, raw_satir_json
    ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT(at_id, tarih, kosu_no, hipodrom_sehir) DO UPDATE SET
        sira = excluded.sira,
        derece_raw = excluded.derece_raw,
        derece_saniye = excluded.derece_saniye,
        ganyan = excluded.ganyan,
        handikap = excluded.handikap,
        ikramiye = excluded.ikramiye,
        fark = COALESCE(excluded.fark, gecmis_yarislar.fark),
        video_url = COALESCE(excluded.video_url, gecmis_yarislar.video_url);
    """
    conn.execute(sql, (
        g.get("at_id"), g.get("tarih"), g.get("hipodrom_sehir"),
        g.get("mesafe"), g.get("mesafe_raw"), g.get("pist_turu"),
        g.get("pist_durumu"), g.get("pist_raw"), g.get("sira"), g.get("sira_raw"),
        g.get("derece_raw"), g.get("derece_saniye"), g.get("kilo"), g.get("kilo_raw"),
        g.get("jokey_ad"), g.get("start_no"), g.get("taki"),
        g.get("ganyan"), g.get("ganyan_raw"), g.get("grup"), g.get("kosu_no"),
        g.get("kosu_cinsi"), g.get("antrenor_ad"), g.get("sahip_ad"),
        g.get("handikap"), g.get("handikap_raw"), g.get("ikramiye"), g.get("ikramiye_raw"),
        g.get("s20"), g.get("fark"), g.get("video_url"), g.get("raw_satir_json")
    ))


def upsert_yaris_sonucu(conn, s):
    """Resmî koşu sonucunu ve gidişat verisini yaris_sonuclari tablosuna ekler."""
    sql = """
    INSERT INTO yaris_sonuclari (
        tarih, hipodrom_id, sehir_adi, kosu_no, kosu_kodu, at_id, at_no,
        at_ismi, sira, sira_raw, derece_raw, derece_saniye, fark_raw, fark_boy,
        gec_cikis_raw, gec_cikis_boy, ganyan, agf, start_no, hp,
        son_800_raw, son_800_saniye, video_url, accurace_url, fotofinish_url,
        komiser_raporu_url, gidisat_yorumu
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?
    )
    ON CONFLICT(tarih, hipodrom_id, kosu_no, at_id) DO UPDATE SET
        sira = excluded.sira,
        sira_raw = excluded.sira_raw,
        derece_raw = excluded.derece_raw,
        derece_saniye = excluded.derece_saniye,
        fark_raw = excluded.fark_raw,
        fark_boy = excluded.fark_boy,
        gec_cikis_raw = excluded.gec_cikis_raw,
        gec_cikis_boy = excluded.gec_cikis_boy,
        ganyan = excluded.ganyan,
        agf = excluded.agf,
        start_no = excluded.start_no,
        hp = excluded.hp,
        son_800_raw = COALESCE(excluded.son_800_raw, yaris_sonuclari.son_800_raw),
        son_800_saniye = COALESCE(excluded.son_800_saniye, yaris_sonuclari.son_800_saniye),
        video_url = COALESCE(excluded.video_url, yaris_sonuclari.video_url),
        accurace_url = COALESCE(excluded.accurace_url, yaris_sonuclari.accurace_url),
        fotofinish_url = COALESCE(excluded.fotofinish_url, yaris_sonuclari.fotofinish_url),
        komiser_raporu_url = COALESCE(excluded.komiser_raporu_url, yaris_sonuclari.komiser_raporu_url),
        gidisat_yorumu = COALESCE(excluded.gidisat_yorumu, yaris_sonuclari.gidisat_yorumu);
    """
    conn.execute(sql, (
        s.get("tarih"), s.get("hipodrom_id"), s.get("sehir_adi"), s.get("kosu_no"),
        s.get("kosu_kodu"), s.get("at_id"), s.get("at_no"), s.get("at_ismi"),
        s.get("sira"), s.get("sira_raw"), s.get("derece_raw"), s.get("derece_saniye"),
        s.get("fark_raw"), s.get("fark_boy"), s.get("gec_cikis_raw"), s.get("gec_cikis_boy"),
        s.get("ganyan"), s.get("agf"), s.get("start_no"), s.get("hp"),
        s.get("son_800_raw"), s.get("son_800_saniye"), s.get("video_url"),
        s.get("accurace_url"), s.get("fotofinish_url"), s.get("komiser_raporu_url"),
        s.get("gidisat_yorumu")
    ))


def upsert_turev_at_taktigi(conn, t):
    """Hesaplanan at koşu stilini ve taktiğini ayrı türev tablosuna kaydeder."""
    sql = """
    INSERT INTO turev_at_taktikleri (
        at_id, at_ismi, toplam_kosu_sayisi, analiz_edilen_kosu_sayisi,
        hesaplanan_stil, stil_kodu, stil_ikon, onde_gitme_orani,
        pres_orani, orta_orani, bekleme_orani, kural_aciklamasi,
        veri_durumu, hesaplanma_tarihi
    ) VALUES (
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, CURRENT_TIMESTAMP
    )
    ON CONFLICT(at_id) DO UPDATE SET
        at_ismi = excluded.at_ismi,
        toplam_kosu_sayisi = excluded.toplam_kosu_sayisi,
        analiz_edilen_kosu_sayisi = excluded.analiz_edilen_kosu_sayisi,
        hesaplanan_stil = excluded.hesaplanan_stil,
        stil_kodu = excluded.stil_kodu,
        stil_ikon = excluded.stil_ikon,
        onde_gitme_orani = excluded.onde_gitme_orani,
        pres_orani = excluded.pres_orani,
        orta_orani = excluded.orta_orani,
        bekleme_orani = excluded.bekleme_orani,
        kural_aciklamasi = excluded.kural_aciklamasi,
        veri_durumu = excluded.veri_durumu,
        hesaplanma_tarihi = CURRENT_TIMESTAMP;
    """
    conn.execute(sql, (
        t.get("at_id"), t.get("at_ismi"), t.get("toplam_kosu_sayisi", 0),
        t.get("analiz_edilen_kosu_sayisi", 0), t.get("hesaplanan_stil"),
        t.get("stil_kodu"), t.get("stil_ikon"),
        t.get("onde_gitme_orani", 0.0), t.get("pres_orani", 0.0),
        t.get("orta_orani", 0.0), t.get("bekleme_orani", 0.0),
        t.get("kural_aciklamasi"), t.get("veri_durumu")
    ))


def upsert_turev_kosu_temposu(conn, k):
    """Hesaplanan yarış tempo senaryosunu ayrı türev tablosuna kaydeder."""
    sql = """
    INSERT INTO turev_kosu_tempolari (
        tarih, hipodrom_id, kosu_no, kosu_id, mesafe, pist_turu,
        tahmini_tempo, tempo_kodu, tempo_skoru, kacak_sayisi, presci_sayisi,
        orta_grup_sayisi, sprinter_sayisi, tecrubesiz_sayisi, olasi_liderler,
        olasi_presciler, avantajli_stiller, tempo_analiz_yorumu, veri_durumu, hesaplanma_tarihi
    ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, CURRENT_TIMESTAMP
    )
    ON CONFLICT(tarih, hipodrom_id, kosu_no) DO UPDATE SET
        kosu_id = excluded.kosu_id,
        mesafe = excluded.mesafe,
        pist_turu = excluded.pist_turu,
        tahmini_tempo = excluded.tahmini_tempo,
        tempo_kodu = excluded.tempo_kodu,
        tempo_skoru = excluded.tempo_skoru,
        kacak_sayisi = excluded.kacak_sayisi,
        presci_sayisi = excluded.presci_sayisi,
        orta_grup_sayisi = excluded.orta_grup_sayisi,
        sprinter_sayisi = excluded.sprinter_sayisi,
        tecrubesiz_sayisi = excluded.tecrubesiz_sayisi,
        olasi_liderler = excluded.olasi_liderler,
        olasi_presciler = excluded.olasi_presciler,
        avantajli_stiller = excluded.avantajli_stiller,
        tempo_analiz_yorumu = excluded.tempo_analiz_yorumu,
        veri_durumu = excluded.veri_durumu,
        hesaplanma_tarihi = CURRENT_TIMESTAMP;
    """
    olasi_liderler_json = json.dumps(k.get("olasi_liderler", []), ensure_ascii=False) if isinstance(k.get("olasi_liderler"), (list, dict)) else k.get("olasi_liderler")
    olasi_presciler_json = json.dumps(k.get("olasi_presciler", []), ensure_ascii=False) if isinstance(k.get("olasi_presciler"), (list, dict)) else k.get("olasi_presciler")

    conn.execute(sql, (
        k.get("tarih"), k.get("hipodrom_id"), k.get("kosu_no"), k.get("kosu_id"),
        k.get("mesafe"), k.get("pist_turu"), k.get("tahmini_tempo"),
        k.get("tempo_kodu"), k.get("tempo_skoru"),
        k.get("kacak_sayisi", 0), k.get("presci_sayisi", 0),
        k.get("orta_grup_sayisi", 0), k.get("sprinter_sayisi", 0),
        k.get("tecrubesiz_sayisi", 0), olasi_liderler_json,
        olasi_presciler_json, k.get("avantajli_stiller"),
        k.get("tempo_analiz_yorumu"), k.get("veri_durumu")
    ))


def upsert_turev_kosu_at_etkisi(conn, e):
    """Koşuya özel atın tempo delta ve taktik rolünü kaydeder."""
    sql = """
    INSERT INTO turev_kosu_at_etkileri (
        kosu_id, at_id, at_no, at_ismi, hesaplanan_stil, pace_delta,
        start_kapisi, kulvar_yorumu, taktik_rol, hesaplanma_tarihi
    ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, CURRENT_TIMESTAMP
    )
    ON CONFLICT(kosu_id, at_id) DO UPDATE SET
        at_no = excluded.at_no,
        at_ismi = excluded.at_ismi,
        hesaplanan_stil = excluded.hesaplanan_stil,
        pace_delta = excluded.pace_delta,
        start_kapisi = excluded.start_kapisi,
        kulvar_yorumu = excluded.kulvar_yorumu,
        taktik_rol = excluded.taktik_rol,
        hesaplanma_tarihi = CURRENT_TIMESTAMP;
    """
    conn.execute(sql, (
        e.get("kosu_id"), e.get("at_id"), e.get("at_no"), e.get("at_ismi"),
        e.get("hesaplanan_stil"), e.get("pace_delta", 0), e.get("start_kapisi"),
        e.get("kulvar_yorumu"), e.get("taktik_rol")
    ))


def upsert_idman_kaydi(conn, rec):
    """Resmî TJK idman pisti ve galop verisini ekler veya günceller."""
    sql = """
    INSERT INTO idman_pist_kayitlari (
        tarih, hipodrom_id, kosu_no, kosu_kodu, at_id, at_no, at_adi,
        d_1200, d_1000, d_800, d_600, d_400, d_200, idman_tarihi,
        pist_turu, idman_turu, idman_hipodromu, derece_ozet, son_400_hiz_kmh, durum_kodu
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT(tarih, hipodrom_id, kosu_no, at_no) DO UPDATE SET
        at_adi = excluded.at_adi,
        kosu_kodu = excluded.kosu_kodu,
        at_id = COALESCE(excluded.at_id, idman_pist_kayitlari.at_id),
        d_1200 = excluded.d_1200,
        d_1000 = excluded.d_1000,
        d_800 = excluded.d_800,
        d_600 = excluded.d_600,
        d_400 = excluded.d_400,
        d_200 = excluded.d_200,
        idman_tarihi = excluded.idman_tarihi,
        pist_turu = excluded.pist_turu,
        idman_turu = excluded.idman_turu,
        idman_hipodromu = excluded.idman_hipodromu,
        derece_ozet = excluded.derece_ozet,
        son_400_hiz_kmh = excluded.son_400_hiz_kmh,
        durum_kodu = excluded.durum_kodu;
    """
    conn.execute(sql, (
        rec.get("tarih"), rec.get("hipodrom_id"), rec.get("kosu_no"),
        rec.get("kosu_kodu"), rec.get("at_id"), rec.get("at_no"), rec.get("at_adi"),
        rec.get("d_1200"), rec.get("d_1000"), rec.get("d_800"), rec.get("d_600"),
        rec.get("d_400"), rec.get("d_200"), rec.get("idman_tarihi"),
        rec.get("pist_turu"), rec.get("idman_turu"), rec.get("idman_hipodromu"),
        rec.get("derece_ozet"), rec.get("son_400_hiz_kmh"), rec.get("durum_kodu")
    ))


def get_cached_at_ids_today(conn, bugun_str):
    """Bugün zaten profili çekilmiş at ID'lerinin set'ini döner."""
    cur = conn.execute(
        "SELECT id FROM atlar WHERE son_profil_cekilme_tarihi = ? AND profil_eksik_mi = 0",
        (bugun_str,)
    )
    return {row["id"] for row in cur.fetchall()}


def check_gecmis_yaris_exists(conn, at_id, tarih, kosu_no, hipodrom_sehir):
    """Kayıt bazında tekil geçmiş yarış kontrolü."""
    cur = conn.execute(
        "SELECT id FROM gecmis_yarislar WHERE at_id = ? AND tarih = ? AND kosu_no = ? AND hipodrom_sehir = ?",
        (at_id, tarih, kosu_no, hipodrom_sehir)
    )
    return cur.fetchone() is not None


def check_yaris_sonucu_exists(conn, tarih, hipodrom_id, kosu_no, at_id):
    """Kayıt bazında tekil yarış sonucu kontrolü."""
    cur = conn.execute(
        "SELECT id FROM yaris_sonuclari WHERE tarih = ? AND hipodrom_id = ? AND kosu_no = ? AND at_id = ?",
        (tarih, hipodrom_id, kosu_no, at_id)
    )
    return cur.fetchone() is not None


def log_scrape_run(conn, log_data):
    """Çalışma sonucunu kaydeder."""
    sql = """
    INSERT INTO scraping_loglari (
        calisma_tarihi, hedef_gun, tarih_str, hipodrom_sayisi, kosu_sayisi,
        at_sayisi, gecmis_yaris_sayisi, eksik_at_sayisi, uyarilar, durum, calisma_suresi_sn
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """
    uyarilar_val = log_data.get("uyarilar", "")
    if isinstance(uyarilar_val, (list, tuple)):
        uyarilar_val = "\n".join(str(u) for u in uyarilar_val)

    conn.execute(sql, (
        datetime.now().isoformat(),
        log_data.get("hedef_gun"),
        log_data.get("tarih_str"),
        log_data.get("hipodrom_sayisi", 0),
        log_data.get("kosu_sayisi", 0),
        log_data.get("at_sayisi", 0),
        log_data.get("gecmis_yaris_sayisi", 0),
        log_data.get("eksik_at_sayisi", 0),
        uyarilar_val,
        log_data.get("durum", "BASARILI"),
        log_data.get("calisma_suresi_sn", 0.0)
    ))
