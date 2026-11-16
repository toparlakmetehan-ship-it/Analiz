# -*- coding: utf-8 -*-
"""
TJK Veri Doğrulama ve Bütünlük Kontrol Modülü (Validator)
Her scrape işlemi sonunda çekilen verileri denetler:
- Koşudaki at sayısı uyuşmazlığı
- Boş veya mükerrer isimler
- Bozuk karakterler (, Ã, Ä± vb.)
- Geçmiş yarış sayısı 0 olan atların analizi (ilk koşusu mu, çekim hatası mı)
- Kapsamlı özet raporlama
"""

import re
import sqlite3


CORRUPT_CHAR_PATTERN = re.compile(r'[\ufffd]|Ã[A-Za-z0-9]|Ä±|ÅŸ|Ã§|Ã¶|Ã¼|Ã–|Ãœ|Ã‡|Ä°|\?{2,}')


def validate_database_integrity(conn, tarih_str):
    """
    Belirli bir tarihteki veritabanı kayıtlarını doğrular ve uyarı listesi ile özet döner.
    """
    warnings = []
    anomalies = {
        "at_sayisi_uyusmazliklari": [],
        "bos_isimler": [],
        "tekrar_eden_isimler": [],
        "bozuk_karakterler": [],
        "sifir_yarisi_olan_atlar": [],
        "eksik_veri_atlar": []
    }

    # 1. Koşulardaki at sayılarını karşılaştır
    kosular_cur = conn.execute("""
        SELECT k.id, k.kosu_no, k.saat, h.sehir_adi, k.beklenen_at_sayisi,
               COUNT(p.id) as gercek_kayitli_at_sayisi
        FROM kosular k
        JOIN hipodromlar h ON k.hipodrom_id = h.id
        LEFT JOIN program_kayitlari p ON k.id = p.kosu_id
        WHERE k.tarih = ?
        GROUP BY k.id
    """, (tarih_str,))

    kosu_rows = kosular_cur.fetchall()
    for row in kosu_rows:
        beklenen = row["beklenen_at_sayisi"]
        kayitli = row["gercek_kayitli_at_sayisi"]
        if beklenen and beklenen != kayitli:
            msg = f"Koşu At Sayısı Uyuşmazlığı: {row['sehir_adi']} Koşu {row['kosu_no']} (Beklenen: {beklenen}, Kaydedilen: {kayitli})"
            warnings.append(msg)
            anomalies["at_sayisi_uyusmazliklari"].append(msg)

    # 2. Boş isimler, mükerrer at isimleri ve bozuk karakterler
    program_cur = conn.execute("""
        SELECT p.kosu_id, k.kosu_no, h.sehir_adi, p.at_no, a.id as at_id, a.at_adi,
               p.jokey_ad, p.antrenor_ad, p.sahip_ad, p.veri_durumu, p.hata_notu
        FROM program_kayitlari p
        JOIN kosular k ON p.kosu_id = k.id
        JOIN hipodromlar h ON k.hipodrom_id = h.id
        JOIN atlar a ON p.at_id = a.id
        WHERE k.tarih = ?
    """, (tarih_str,))

    program_rows = program_cur.fetchall()
    seen_names_by_race = {}

    for row in program_rows:
        at_adi = row["at_adi"] or ""
        kosu_key = f"{row['sehir_adi']}_K{row['kosu_no']}"

        # Boş isim kontrolü
        if not at_adi.strip():
            msg = f"Boş At İsmi: {row['sehir_adi']} Koşu {row['kosu_no']} At No: {row['at_no']} (At ID: {row['at_id']})"
            warnings.append(msg)
            anomalies["bos_isimler"].append(msg)

        # Mükerrer isim kontrolü (Aynı koşuda tekrar eden isim)
        if kosu_key not in seen_names_by_race:
            seen_names_by_race[kosu_key] = set()

        if at_adi in seen_names_by_race[kosu_key]:
            msg = f"Aynı Koşuda Tekrar Eden At İsmi: '{at_adi}' -> {row['sehir_adi']} Koşu {row['kosu_no']}"
            warnings.append(msg)
            anomalies["tekrar_eden_isimler"].append(msg)
        else:
            seen_names_by_race[kosu_key].add(at_adi)

        # Bozuk karakter kontrolü
        for field_name, val in [("At", at_adi), ("Jokey", row["jokey_ad"]), ("Antrenör", row["antrenor_ad"]), ("Sahip", row["sahip_ad"])]:
            if val and CORRUPT_CHAR_PATTERN.search(val):
                msg = f"Bozuk Karakter Tespiti ({field_name}): '{val}' -> {row['sehir_adi']} Koşu {row['kosu_no']}"
                warnings.append(msg)
                anomalies["bozuk_karakterler"].append(msg)

        # Eksik veri kontrolü
        if row["veri_durumu"] == "EKSIK":
            msg = f"Eksik Veri (Profil Alınamadı): At No {row['at_no']} {at_adi} (Not: {row['hata_notu']})"
            warnings.append(msg)
            anomalies["eksik_veri_atlar"].append(msg)

    # 3. Geçmiş yarış sayısı 0 olan atlar (İlk yarışı mı, yoksa çekim hatası mı?)
    zero_race_cur = conn.execute("""
        SELECT a.id, a.at_adi, a.dogum_tarihi, a.yas, p.son_6_yaris, k.kosu_cinsi, h.sehir_adi, k.kosu_no,
               COUNT(g.id) as gecmis_kayit_sayisi
        FROM program_kayitlari p
        JOIN kosular k ON p.kosu_id = k.id
        JOIN hipodromlar h ON k.hipodrom_id = h.id
        JOIN atlar a ON p.at_id = a.id
        LEFT JOIN gecmis_yarislar g ON a.id = g.at_id
        WHERE k.tarih = ?
        GROUP BY a.id, k.id
        HAVING gecmis_kayit_sayisi = 0
    """, (tarih_str,))

    zero_rows = zero_race_cur.fetchall()
    for row in zero_rows:
        son_6 = row["son_6_yaris"] or ""
        clean_runs = re.sub(r'[^0-9]', '', son_6)
        # Eğer koşu cinsi Şartlı 1 / Maiden ise ve son koşusu yoksa bu ilk yarışını koşan bir taydır
        kosu_cinsi = (row["kosu_cinsi"] or "").lower()
        is_first_timer = ("şartlı 1" in kosu_cinsi) or ("maiden" in kosu_cinsi and len(clean_runs) == 0) or (row["yas"] == 2 and len(clean_runs) == 0)

        durum_aciklama = "🌱 İLK YARIŞINI KOŞAN TAY (Normal Durum)" if is_first_timer else "⚠️ DİKKAT: Eski koşuları var görünüyor ancak profil tablosu boş (Kontrol Edilmeli)"
        info = {
            "at_id": row["id"],
            "at_adi": row["at_adi"],
            "sehir": row["sehir_adi"],
            "kosu_no": row["kosu_no"],
            "yas": row["yas"],
            "son_6_yaris": son_6,
            "teshis": durum_aciklama
        }
        anomalies["sifir_yarisi_olan_atlar"].append(info)
        if not is_first_timer:
            warnings.append(f"Geçmiş Yarış Boş (Olası Çekim Hatası): {row['at_adi']} (ID: {row['id']}) - {durum_aciklama}")

    # 4. Genel İstatistikler
    stats_cur = conn.execute("""
        SELECT 
            COUNT(DISTINCT k.hipodrom_id) as toplam_hipodrom,
            COUNT(DISTINCT k.id) as toplam_kosu,
            COUNT(DISTINCT p.id) as toplam_program_ati,
            COUNT(DISTINCT a.id) as toplam_tekil_at,
            (SELECT COUNT(*) FROM gecmis_yarislar WHERE at_id IN (SELECT at_id FROM program_kayitlari WHERE kosu_id IN (SELECT id FROM kosular WHERE tarih = ?))) as toplam_gecmis_yaris
        FROM kosular k
        LEFT JOIN program_kayitlari p ON k.id = p.kosu_id
        LEFT JOIN atlar a ON p.at_id = a.id
        WHERE k.tarih = ?
    """, (tarih_str, tarih_str))
    stats = stats_cur.fetchone()

    summary = {
        "tarih": tarih_str,
        "hipodrom_sayisi": stats["toplam_hipodrom"] or 0,
        "kosu_sayisi": stats["toplam_kosu"] or 0,
        "toplam_at_sayisi": stats["toplam_program_ati"] or 0,
        "tekil_at_sayisi": stats["toplam_tekil_at"] or 0,
        "gecmis_yaris_sayisi": stats["toplam_gecmis_yaris"] or 0,
        "eksik_veri_at_sayisi": len(anomalies["eksik_veri_atlar"]),
        "uyari_sayisi": len(warnings),
        "uyarilar": warnings,
        "anomaliler": anomalies,
        "durum": "BASARILI" if len(warnings) == 0 else "UYARI"
    }

    return summary


def print_validation_report(summary):
    """Doğrulama özetini konsola biçimlendirilmiş olarak basar."""
    print("\n" + "=" * 70)
    print(f"📊 TJK RESMÎ VERİ TOPLAMA VE DOĞRULAMA RAPORU ({summary['tarih']})")
    print("=" * 70)
    print(f"  • Hipodrom Sayısı:        {summary['hipodrom_sayisi']}")
    print(f"  • Toplam Koşu Sayısı:     {summary['kosu_sayisi']}")
    print(f"  • Programdaki At Sayısı:  {summary['toplam_at_sayisi']} (Tekil: {summary['tekil_at_sayisi']})")
    print(f"  • Çekilen Geçmiş Yarış:   {summary['gecmis_yaris_sayisi']}")
    print(f"  • Eksik Verili At Sayısı: {summary['eksik_veri_at_sayisi']}")
    print(f"  • Toplam Uyarı:           {summary['uyari_sayisi']}")
    print(f"  • Doğrulama Durumu:       {summary['durum']}")
    print("-" * 70)

    anom = summary["anomaliler"]
    if anom["at_sayisi_uyusmazliklari"]:
        print("\n❌ KOŞU AT SAYISI UYUŞMAZLIKLARI:")
        for u in anom["at_sayisi_uyusmazliklari"]:
            print(f"   - {u}")

    if anom["bos_isimler"]:
        print("\n❌ BOŞ İSİMLER:")
        for b in anom["bos_isimler"]:
            print(f"   - {b}")

    if anom["tekrar_eden_isimler"]:
        print("\n❌ AYNI KOŞUDA TEKRAR EDEN İSİMLER:")
        for t in anom["tekrar_eden_isimler"]:
            print(f"   - {t}")

    if anom["bozuk_karakterler"]:
        print("\n⚠️ BOZUK KARAKTERLER (UTF-8 Hatası):")
        for c in anom["bozuk_karakterler"]:
            print(f"   - {c}")

    if anom["sifir_yarisi_olan_atlar"]:
        print(f"\n🌱 GEÇMİŞ YARIŞI OLMAYAN ATLAR ({len(anom['sifir_yarisi_olan_atlar'])} Safkan):")
        for z in anom["sifir_yarisi_olan_atlar"][:10]:
            print(f"   - {z['at_adi']} ({z['sehir']} K{z['kosu_no']}): {z['teshis']}")
        if len(anom["sifir_yarisi_olan_atlar"]) > 10:
            print(f"   ... ve {len(anom['sifir_yarisi_olan_atlar']) - 10} tay daha.")

    print("=" * 70 + "\n")
