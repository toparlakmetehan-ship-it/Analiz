# -*- coding: utf-8 -*-
"""
TJK Yarış ve Analiz Veritabanı Modülü (SQLite)
İlişkisel şema, ID bazlı tekilleştirme ve idempotent upsert işlemleri.
"""

import sqlite3
import os
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
    cim_performans TEXT,                -- JSON veya string özet
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

-- 9. GEÇMİŞ YARIŞLAR (Her atın kariyerindeki tüm geçmiş koşuları)
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
    raw_satir_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(at_id, tarih, kosu_no, hipodrom_sehir)
);

-- 10. SCRAPING VE DOĞRULAMA LOGLARI
CREATE TABLE IF NOT EXISTS scraping_loglari (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    calisma_tarihi TEXT NOT NULL,
    hedef_gun TEXT NOT NULL,            -- 'bugun' veya 'yarin'
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

CREATE INDEX IF NOT EXISTS idx_kosular_tarih ON kosular(tarih);
CREATE INDEX IF NOT EXISTS idx_program_kosu ON program_kayitlari(kosu_id);
CREATE INDEX IF NOT EXISTS idx_gecmis_at ON gecmis_yarislar(at_id);
CREATE INDEX IF NOT EXISTS idx_gecmis_tarih ON gecmis_yarislar(tarih);
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
    """Tüm tabloları ve indeksleri başlatır."""
    conn = get_db_connection(db_path)
    with conn:
        conn.executescript(SCHEMA_SQL)
    conn.close()
    return db_path


def upsert_hipodrom(conn, sehir_id, sehir_adi, hipodrom_adi=None):
    """Hipodrom kaydını ekler veya günceller."""
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
    INSERT INTO jokeyler (id, ad_soyad)
    VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET
        ad_soyad = excluded.ad_soyad;
    """
    conn.execute(sql, (jokey_id, ad_soyad))


def upsert_antrenor(conn, antrenor_id, ad_soyad):
    if not antrenor_id or not ad_soyad:
        return
    sql = """
    INSERT INTO antrenorler (id, ad_soyad)
    VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET
        ad_soyad = excluded.ad_soyad;
    """
    conn.execute(sql, (antrenor_id, ad_soyad))


def upsert_sahip(conn, sahip_id, ad_soyad):
    if not sahip_id or not ad_soyad:
        return
    sql = """
    INSERT INTO sahipler (id, ad_soyad)
    VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET
        ad_soyad = excluded.ad_soyad;
    """
    conn.execute(sql, (sahip_id, ad_soyad))


def upsert_kosu(conn, k):
    """Koşu kaydını ekler ve kosu_id döner."""
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
        saat = excluded.saat,
        kosu_cinsi = excluded.kosu_cinsi,
        grup_bilgisi = excluded.grup_bilgisi,
        mesafe = excluded.mesafe,
        pist_turu = excluded.pist_turu,
        pist_durumu = COALESCE(excluded.pist_durumu, kosular.pist_durumu),
        ikramiye_1 = excluded.ikramiye_1,
        ikramiye_2 = excluded.ikramiye_2,
        ikramiye_3 = excluded.ikramiye_3,
        ikramiye_4 = excluded.ikramiye_4,
        ikramiye_5 = excluded.ikramiye_5,
        ikramiye_raw = excluded.ikramiye_raw,
        yetistirici_primi_1 = excluded.yetistirici_primi_1,
        sahip_primi_1 = excluded.sahip_primi_1,
        yas_sarti = excluded.yas_sarti,
        agirlik_handikap_sarti = excluded.agirlik_handikap_sarti,
        eid_sure_raw = excluded.eid_sure_raw,
        beklenen_at_sayisi = excluded.beklenen_at_sayisi,
        updated_at = CURRENT_TIMESTAMP;
    """
    conn.execute(sql, (
        k.get("tarih"), k.get("hipodrom_id"), k.get("kosu_no"), k.get("saat"),
        k.get("kosu_cinsi"), k.get("grup_bilgisi"), k.get("mesafe"),
        k.get("pist_turu"), k.get("pist_durumu"),
        k.get("ikramiye_1"), k.get("ikramiye_2"), k.get("ikramiye_3"),
        k.get("ikramiye_4"), k.get("ikramiye_5"), k.get("ikramiye_raw"),
        k.get("yetistirici_primi_1"), k.get("sahip_primi_1"),
        k.get("yas_sarti"), k.get("agirlik_handikap_sarti"),
        k.get("eid_sure_raw"), k.get("beklenen_at_sayisi")
    ))

    # ID'yi çek
    cur = conn.execute(
        "SELECT id FROM kosular WHERE tarih = ? AND hipodrom_id = ? AND kosu_no = ?",
        (k.get("tarih"), k.get("hipodrom_id"), k.get("kosu_no"))
    )
    row = cur.fetchone()
    return row["id"] if row else None


def upsert_at(conn, a):
    """At profil kaydını günceller veya ekler."""
    sql = """
    INSERT INTO atlar (
        id, at_adi, dogum_tarihi, yas_cinsiyet, yas, cinsiyet, irk, don_renk,
        baba_id, baba_adi, anne_id, anne_adi, kisrak_babasi_adi, gercek_sahip,
        yetistirici, toplam_kosu, birincilik_sayisi, ikincilik_sayisi, ucunculuk_sayisi,
        dordunculuk_sayisi, besincilik_sayisi, toplam_kazanc, toplam_kazanc_raw,
        cim_performans, kum_performans, sentetik_performans, profil_eksik_mi,
        son_profil_cekilme_tarihi, updated_at
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, CURRENT_TIMESTAMP
    )
    ON CONFLICT(id) DO UPDATE SET
        at_adi = excluded.at_adi,
        dogum_tarihi = COALESCE(excluded.dogum_tarihi, atlar.dogum_tarihi),
        yas_cinsiyet = COALESCE(excluded.yas_cinsiyet, atlar.yas_cinsiyet),
        yas = COALESCE(excluded.yas, atlar.yas),
        cinsiyet = COALESCE(excluded.cinsiyet, atlar.cinsiyet),
        irk = COALESCE(excluded.irk, atlar.irk),
        don_renk = COALESCE(excluded.don_renk, atlar.don_renk),
        baba_id = COALESCE(excluded.baba_id, atlar.baba_id),
        baba_adi = COALESCE(excluded.baba_adi, atlar.baba_adi),
        anne_id = COALESCE(excluded.anne_id, atlar.anne_id),
        anne_adi = COALESCE(excluded.anne_adi, atlar.anne_adi),
        kisrak_babasi_adi = COALESCE(excluded.kisrak_babasi_adi, atlar.kisrak_babasi_adi),
        gercek_sahip = COALESCE(excluded.gercek_sahip, atlar.gercek_sahip),
        yetistirici = COALESCE(excluded.yetistirici, atlar.yetistirici),
        toplam_kosu = COALESCE(excluded.toplam_kosu, atlar.toplam_kosu),
        birincilik_sayisi = COALESCE(excluded.birincilik_sayisi, atlar.birincilik_sayisi),
        ikincilik_sayisi = COALESCE(excluded.ikincilik_sayisi, atlar.ikincilik_sayisi),
        ucunculuk_sayisi = COALESCE(excluded.ucunculuk_sayisi, atlar.ucunculuk_sayisi),
        dordunculuk_sayisi = COALESCE(excluded.dordunculuk_sayisi, atlar.dordunculuk_sayisi),
        besincilik_sayisi = COALESCE(excluded.besincilik_sayisi, atlar.besincilik_sayisi),
        toplam_kazanc = COALESCE(excluded.toplam_kazanc, atlar.toplam_kazanc),
        toplam_kazanc_raw = COALESCE(excluded.toplam_kazanc_raw, atlar.toplam_kazanc_raw),
        cim_performans = COALESCE(excluded.cim_performans, atlar.cim_performans),
        kum_performans = COALESCE(excluded.kum_performans, atlar.kum_performans),
        sentetik_performans = COALESCE(excluded.sentetik_performans, atlar.sentetik_performans),
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
    """Koşudaki at kaydını ekler veya günceller."""
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
    """Geçmiş koşu satırını ekler (varsa güncellemez veya tamamlar)."""
    sql = """
    INSERT INTO gecmis_yarislar (
        at_id, tarih, hipodrom_sehir, mesafe, mesafe_raw, pist_turu,
        pist_durumu, pist_raw, sira, sira_raw, derece_raw, derece_saniye,
        kilo, kilo_raw, jokey_ad, start_no, taki, ganyan, ganyan_raw,
        grup, kosu_no, kosu_cinsi, antrenor_ad, sahip_ad, handikap,
        handikap_raw, ikramiye, ikramiye_raw, s20, fark, raw_satir_json
    ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT(at_id, tarih, kosu_no, hipodrom_sehir) DO UPDATE SET
        sira = excluded.sira,
        derece_raw = excluded.derece_raw,
        derece_saniye = excluded.derece_saniye,
        ganyan = excluded.ganyan,
        handikap = excluded.handikap,
        ikramiye = excluded.ikramiye;
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
        g.get("s20"), g.get("fark"), g.get("raw_satir_json")
    ))


def get_cached_at_ids_today(conn, bugun_str):
    """Bugün zaten profili çekilmiş at ID'lerinin set'ini döner (önbellek)."""
    cur = conn.execute(
        "SELECT id FROM atlar WHERE son_profil_cekilme_tarihi = ? AND profil_eksik_mi = 0",
        (bugun_str,)
    )
    return {row["id"] for row in cur.fetchall()}


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
