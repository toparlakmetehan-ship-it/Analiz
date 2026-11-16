# -*- coding: utf-8 -*-
"""
TJK Analitik ve Türev Veri Motoru
1. At bazında empirik koşu stili ve taktik tespiti (Ham veriden ayrı 'turev_at_taktikleri' tablosu).
2. Yarış bazında start kapısı, kaçak/presçi sayısı ve mesafeye göre tempo senaryosu tahmini ('turev_kosu_tempolari').
3. Koşuya özel at tempo deltası ('turev_kosu_at_etkileri').

KRİTİK SİSTEM KURALLARI:
- Kural 1: Kariyerinde <= 3 koşusu olan safkanlara ASLA kalıplaşmış stil atanmaz.
  Her zaman 'Taktik Serbest (İlk 3 Koşusu)' (🌱) atanır ve tempo deltası kesinlikle 0 (Nötr) olur.
- Kural 2: Tecrübeli atlarda taktik yalnızca doğrulanmış yarış içi ara-pozisyonlarından çıkarılır.
  Ara-pozisyon kaynağı Accurace'tir ve resmî olmayan ölçüm olarak açıkça işaretlenir.
  Bitiriş sırası, kulvar, isim, soy, ekipman ve idman derecesi taktik kanıtı sayılmaz.
- Hesaplanan türev veriler asla ham veri tablolarına karıştırılmaz.
"""

import json
import logging
from .accurace import classify_race_style, collect_horse_observations
from .db import (
    upsert_turev_at_taktigi,
    upsert_turev_kosu_temposu,
    upsert_turev_kosu_at_etkisi
)

logger = logging.getLogger("TJKAnalytics")

def calculate_horse_tactical_style(conn, at_id, at_name=""):
    """
    Bir atın tüm geçmiş koşularını analiz ederek koşu stilini ve taktiğini belirler.
    Türev tablo olan 'turev_at_taktikleri'ne yazar.
    """
    if not at_id:
        return None

    # Atın temel bilgilerini al
    cur_at = conn.execute("SELECT at_adi, toplam_kosu FROM atlar WHERE id = ?", (at_id,))
    row_at = cur_at.fetchone()
    if row_at:
        at_name = row_at["at_adi"]
        toplam_kosu_sayisi = row_at["toplam_kosu"] or 0
    else:
        toplam_kosu_sayisi = 0

    # Takvim biçimlerine göre metin sıralaması güvenilir değil; tarihleri gerçek sıraya koy.
    cur_past = conn.execute(
        "SELECT * FROM gecmis_yarislar WHERE at_id = ?",
        (at_id,)
    )
    past_races = cur_past.fetchall()
    analiz_edilen_kosu_sayisi = len(past_races)

    # Toplam yarış sayısını kesinleştir
    effective_starts = max(toplam_kosu_sayisi, analiz_edilen_kosu_sayisi)

    # ══════════════════════════════════════════════════════════════════════════
    # KURAL 1: İLK 3 KOŞUSUNU KOŞAN GENÇ SAFKANLAR (≤ 3 KOŞU)
    # Asla kalıplaşmış koşu stili atanmaz! Daima Taktik Serbest (İlk 3 Koşusu)
    # ══════════════════════════════════════════════════════════════════════════
    if effective_starts <= 3:
        record = {
            "at_id": at_id,
            "at_ismi": at_name,
            "toplam_kosu_sayisi": effective_starts,
            "analiz_edilen_kosu_sayisi": analiz_edilen_kosu_sayisi,
            "hesaplanan_stil": "Taktik Serbest (İlk 3 Koşusu)",
            "stil_kodu": "SERBEST",
            "stil_ikon": "🌱",
            "onde_gitme_orani": 0.0,
            "pres_orani": 0.0,
            "orta_orani": 0.0,
            "bekleme_orani": 0.0,
            "kural_aciklamasi": "Kariyerinde 3 veya daha az koşusu bulunan safkan (Genç Safkanlar Kuralı 1). Karakter henüz oturmadığı için serbest gelişim stili atanır (0 Puan Nötr).",
            "veri_durumu": "ILK_3_KOSU_SERBEST"
        }
        upsert_turev_at_taktigi(conn, record)
        return record

    # Yetersiz veri kontrolü (Atın geçmiş koşu kaydı yoksa)
    if analiz_edilen_kosu_sayisi == 0:
        record = {
            "at_id": at_id,
            "at_ismi": at_name,
            "toplam_kosu_sayisi": effective_starts,
            "analiz_edilen_kosu_sayisi": 0,
            "hesaplanan_stil": "Yetersiz Veri",
            "stil_kodu": "YETERSIZ",
            "stil_ikon": "❓",
            "onde_gitme_orani": 0.0,
            "pres_orani": 0.0,
            "orta_orani": 0.0,
            "bekleme_orani": 0.0,
            "kural_aciklamasi": "Atın veritabanında henüz incelenebilecek geçmiş koşu kaydı bulunmuyor.",
            "veri_durumu": "YETERSIZ_VERI"
        }
        upsert_turev_at_taktigi(conn, record)
        return record

    # ══════════════════════════════════════════════════════════════════════════
    # KURAL 2: Yalnızca ölçülmüş ara-pozisyonları taktik kanıtıdır.
    # Sabit isim haritaları ve bitiriş/kulvar temelli çıkarımlar özellikle devre dışıdır.
    # ══════════════════════════════════════════════════════════════════════════
    observations = collect_horse_observations(conn, at_id, past_races)
    observations.sort(key=lambda item: item["date"], reverse=True)
    observations = observations[:8]

    style_counts = {"KACAK": 0, "PRESCI": 0, "ORTA_GRUP": 0, "SPRINTER": 0}
    style_sequence = []
    for observation in observations:
        code = classify_race_style(
            observation["horse"],
            observation["field_size"],
            observation["distance"],
        )
        if code in style_counts:
            style_counts[code] += 1
            style_sequence.append((observation["date"], code))

    total = sum(style_counts.values())
    if total == 0:
        record = {
            "at_id": at_id,
            "at_ismi": at_name,
            "toplam_kosu_sayisi": effective_starts,
            "analiz_edilen_kosu_sayisi": 0,
            "hesaplanan_stil": "Yetersiz Veri",
            "stil_kodu": "YETERSIZ",
            "stil_ikon": "❓",
            "onde_gitme_orani": 0.0,
            "pres_orani": 0.0,
            "orta_orani": 0.0,
            "bekleme_orani": 0.0,
            "kural_aciklamasi": (
                "Geçmiş koşular için doğrulanmış ara-pozisyon ölçümü bulunamadı. "
                "Kaynak: Accurace (resmî olmayan ölçüm)."
            ),
            "veri_durumu": "YETERSIZ_VERI",
        }
        upsert_turev_at_taktigi(conn, record)
        return record

    ranked_styles = sorted(style_counts.items(), key=lambda item: item[1], reverse=True)
    winning_count = ranked_styles[0][1]
    tied_codes = [code for code, count in ranked_styles if count == winning_count]
    # Eşitlikte en güncel ölçümün stilini baskın kabul et.
    winning_code = next(
        code for _date, code in style_sequence if code in tied_codes
    )
    consistency = winning_count / total
    unique_winner = len(tied_codes) == 1

    if total >= 3 and consistency >= 0.60 and unique_winner:
        veri_durumu = "GUNCEL"
    elif total == 2 and consistency == 1.0:
        veri_durumu = "KISMI"
    elif total == 1:
        veri_durumu = "TEK_OLCUM"
    else:
        # Ölçümler birden fazla stili gösteriyorsa atı veri yok sayma;
        # en sık/en güncel stili baskın taktik olarak sınırlı güvenle ata.
        veri_durumu = "DEGISKEN"

    style_labels = {
        "KACAK": ("Kaçak / Lider", "⚡"),
        "PRESCI": ("Presçi", "🏹"),
        "ORTA_GRUP": ("Orta Grup", "🛡️"),
        "SPRINTER": ("Düzlük Sprinteri", "🚀"),
    }
    stil, ikon = style_labels[winning_code]
    style_ratios = {code: round(100.0 * count / total, 1) for code, count in style_counts.items()}
    if veri_durumu == "GUNCEL":
        aciklama = (
            f"Son {total} sınıflandırılabilir geçmiş koşunun {winning_count} tanesinde "
            f"(%{style_ratios[winning_code]}) yarış içi ara-pozisyon ölçümleri {stil} stilini gösterdi. "
            "Kaynak: Accurace, resmî olmayan 100 m ara-pozisyon ölçümleri; TJK yarış kaydıyla "
            "tarih, şehir, koşu, at adı ve bitiriş sırası üzerinden eşleştirildi."
        )
    elif veri_durumu == "KISMI":
        aciklama = (
            f"Son {total} ölçümlü koşunun ikisinde de ara-pozisyonlar {stil} stilini gösterdi. "
            "Sınırlı örneklem (2 koşu); tempo etkisi yarı ağırlıkla uygulanır. "
            "Kaynak: Accurace (resmî olmayan ölçüm)."
        )
    elif veri_durumu == "DEGISKEN":
        aciklama = (
            f"Son {total} ölçümlü koşuda stiller değişkenlik gösterdi; en sık görülen stil "
            f"{stil} (%{style_ratios[winning_code]}). Baskın taktik {stil} kabul edildi, "
            "tempo etkisi sınırlandırıldı. Kaynak: Accurace (resmî olmayan ölçüm)."
        )
    else:
        aciklama = (
            f"Yalnızca 1 ölçümlü koşuda ara-pozisyonlar {stil} stilini gösterdi. "
            "Taktik yön göstergesidir; tempo etkisi yarı ağırlıkla uygulanır. "
            "Kaynak: Accurace (resmî olmayan ölçüm)."
        )

    record = {
        "at_id": at_id,
        "at_ismi": at_name,
        "toplam_kosu_sayisi": effective_starts,
        "analiz_edilen_kosu_sayisi": total,
        "hesaplanan_stil": stil,
        "stil_kodu": winning_code,
        "stil_ikon": ikon,
        "onde_gitme_orani": style_ratios["KACAK"],
        "pres_orani": style_ratios["PRESCI"],
        "orta_orani": style_ratios["ORTA_GRUP"],
        "bekleme_orani": style_ratios["SPRINTER"],
        "kural_aciklamasi": aciklama,
        "veri_durumu": veri_durumu,
    }

    upsert_turev_at_taktigi(conn, record)
    return record


def calculate_race_pace_scenario(conn, kosu_id):
    """
    Belirli bir koşudaki tüm atların taktiklerini, start kapılarını, mesafeyi
    ve pisti birleştirerek koşunun olası temposunu ve öne çıkan atları hesaplar.
    Sonucu 'turev_kosu_tempolari' ve 'turev_kosu_at_etkileri' tablolarına kaydeder.
    """
    cur_k = conn.execute("SELECT * FROM kosular WHERE id = ?", (kosu_id,))
    kosu = cur_k.fetchone()
    if not kosu:
        return None

    tarih = kosu["tarih"]
    hipodrom_id = kosu["hipodrom_id"]
    kosu_no = kosu["kosu_no"]
    mesafe = kosu["mesafe"] or 1400
    pist_turu = kosu["pist_turu"] or "Kum"

    # Koşudaki atları çek
    cur_p = conn.execute("""
        SELECT p.*, a.at_adi, a.toplam_kosu
        FROM program_kayitlari p
        JOIN atlar a ON p.at_id = a.id
        WHERE p.kosu_id = ?
        ORDER BY p.at_no ASC
    """, (kosu_id,))
    horses = cur_p.fetchall()

    if not horses:
        logger.warning(f"⚠️ Koşu ID {kosu_id} ({tarih} Hip:{hipodrom_id} K:{kosu_no}) için at kaydı bulunamadı! Tempo tahmini boş bırakıldı.")
        empty_rec = {
            "tarih": tarih,
            "hipodrom_id": hipodrom_id,
            "kosu_no": kosu_no,
            "kosu_id": kosu_id,
            "mesafe": mesafe,
            "pist_turu": pist_turu,
            "tahmini_tempo": "Yetersiz Veri / Boş Koşu",
            "tempo_kodu": "BOS_UYARI",
            "tempo_skoru": 0.0,
            "kacak_sayisi": 0,
            "presci_sayisi": 0,
            "orta_grup_sayisi": 0,
            "sprinter_sayisi": 0,
            "tecrubesiz_sayisi": 0,
            "olasi_liderler": [],
            "olasi_presciler": [],
            "avantajli_stiller": "Belirlenemedi",
            "tempo_analiz_yorumu": "Koşuda kayıtlı safkan bulunmadığından tempo simülasyonu yapılamadı.",
            "veri_durumu": "BOS_UYARI"
        }
        upsert_turev_kosu_temposu(conn, empty_rec)
        return empty_rec

    # Her atın stilini ölçülmüş taktik verisinden hesapla.
    horses_with_styles = []
    for h in horses:
        at_id = h["at_id"]
        at_name = h["at_adi"]
        taktik = calculate_horse_tactical_style(conn, at_id, at_name)

        horses_with_styles.append({
            "at_id": at_id,
            "at_no": h["at_no"],
            "at_ismi": at_name,
            "start_no": h["start_no"],
            "kilo": h["kilo"],
            "taktik": taktik
        })

    # Taktiksel gruplama
    kacaklar = [h for h in horses_with_styles if h["taktik"]["stil_kodu"] == "KACAK"]
    presciler = [h for h in horses_with_styles if h["taktik"]["stil_kodu"] == "PRESCI"]
    ortagrup = [h for h in horses_with_styles if h["taktik"]["stil_kodu"] == "ORTA_GRUP"]
    sprinterler = [h for h in horses_with_styles if h["taktik"]["stil_kodu"] == "SPRINTER"]
    tecrubesizler = [h for h in horses_with_styles if h["taktik"]["stil_kodu"] == "SERBEST"]

    kacak_sayisi = len(kacaklar)
    presci_sayisi = len(presciler)
    orta_grup_sayisi = len(ortagrup)
    sprinter_sayisi = len(sprinterler)
    tecrubesiz_sayisi = len(tecrubesizler)
    classified_horses = kacak_sayisi + presci_sayisi + orta_grup_sayisi + sprinter_sayisi
    eligible_horses = max(0, len(horses_with_styles) - tecrubesiz_sayisi)

    # Taktiği ölçümle bilinmeyen atlar varsa yarış temposu da yeterli kapsam
    # bulunana kadar bilinmiyor kalır; sıfır kaçak, yavaş tempo kanıtı değildir.
    if classified_horses < 3 or (eligible_horses and classified_horses / eligible_horses < 0.50):
        unknown_rec = {
            "tarih": tarih,
            "hipodrom_id": hipodrom_id,
            "kosu_no": kosu_no,
            "kosu_id": kosu_id,
            "mesafe": mesafe,
            "pist_turu": pist_turu,
            "tahmini_tempo": "Yetersiz Veri",
            "tempo_kodu": "YETERSIZ_VERI",
            "tempo_skoru": 0.0,
            "kacak_sayisi": kacak_sayisi,
            "presci_sayisi": presci_sayisi,
            "orta_grup_sayisi": orta_grup_sayisi,
            "sprinter_sayisi": sprinter_sayisi,
            "tecrubesiz_sayisi": tecrubesiz_sayisi,
            "olasi_liderler": [],
            "olasi_presciler": [],
            "avantajli_stiller": "Yeterli taktik ölçümü yok",
            "tempo_analiz_yorumu": (
                f"Ara-pozisyon ölçümüyle sınıflandırılan {classified_horses}/{eligible_horses} "
                "tecrübeli safkan (%50 kapsam ve en az 3 sınıflandırılmış safkan gerekli). "
                "Tempo ve at deltaları nötr bırakıldı. Kaynak: Accurace (resmî olmayan ölçüm)."
            ),
            "veri_durumu": "YETERSIZ_VERI",
        }
        upsert_turev_kosu_temposu(conn, unknown_rec)
        style_roles = {
            "KACAK": "Lider Adayı (ara-pozisyon ölçümü)",
            "PRESCI": "Presçi (ara-pozisyon ölçümü)",
            "ORTA_GRUP": "Dengeli Takipçi (ara-pozisyon ölçümü)",
            "SPRINTER": "Pusu Sprinteri (ara-pozisyon ölçümü)",
            "SERBEST": "Taktik Serbest (ilk 3 koşu)",
        }
        for h in horses_with_styles:
            taktik = h["taktik"]
            upsert_turev_kosu_at_etkisi(conn, {
                "kosu_id": kosu_id,
                "at_id": h["at_id"],
                "at_no": h["at_no"],
                "at_ismi": h["at_ismi"],
                "hesaplanan_stil": taktik["hesaplanan_stil"],
                "pace_delta": 0,
                "start_kapisi": h["start_no"] or 1,
                "kulvar_yorumu": "Taktik ölçümü var; yarış toplam temposu için kapsam yetersiz",
                "taktik_rol": style_roles.get(taktik["stil_kodu"], "Taktik bilinmiyor"),
            })
        return unknown_rec

    # Mesafe katsayısı (Kısa mesafe tempolu, uzun mesafe temkinli)
    if mesafe <= 1300:
        dist_factor = 1.15
    elif mesafe >= 1900:
        dist_factor = 0.85
    else:
        dist_factor = 1.0

    raw_pressure = (kacak_sayisi * 32.0) + (presci_sayisi * 14.0) + (orta_grup_sayisi * 5.0)
    tempo_skoru = min(99.0, max(20.0, round(raw_pressure * dist_factor, 1)))

    olasi_liderler = [{"no": h["at_no"], "isim": h["at_ismi"], "st": h["start_no"]} for h in kacaklar]
    olasi_presciler = [{"no": h["at_no"], "isim": h["at_ismi"], "st": h["start_no"]} for h in presciler]

    # Tempo Sınıflandırması ve Yorumu: baskı skoru ile etiket aynı kaynaktan üretilir.
    lider_isimleri = ", ".join(f"#{h['at_no']} {h['at_ismi']}" for h in kacaklar)
    presci_isimleri = ", ".join(f"#{h['at_no']} {h['at_ismi']}" for h in presciler[:3]) or "presçiler"

    if kacak_sayisi >= 3 or (kacak_sayisi >= 2 and mesafe <= 1400):
        tahmini_tempo = "Çok Hızlı / Yüksek Baskı"
        tempo_kodu = "COK_HIZLI"
        avantajli_stiller = "Düzlük Sprinteri (🚀) ve Sabırlı Orta Grup (🛡️)"
        if kacak_sayisi:
            tempo_analiz_yorumu = (
                f"Önde liderlik mücadelesine girişecek {kacak_sayisi} kaçak safkan ({lider_isimleri}) "
                f"ve arkalarında {presci_sayisi} presçi bulunuyor. Erken temponun ilk metrelerden "
                "itibaren çok süratli olması ve ön grubun yıpranması beklenir. Arka hatta diri bekleyen "
                "Düzlük Sprinterleri ve sabırlı Orta Grup safkanları son 400 metrede avantajlıdır."
            )
        else:
            tempo_analiz_yorumu = (
                f"Belirgin bir kaçak safkan yok; ancak {presci_sayisi} presçi ({presci_isimleri}) "
                "ön grubu sürekli baskı altında tutacak. Yüksek ön grup baskısı ön koşanları yıpratır, "
                "arkadan gelen sprinterlere düzlükte avantaj sağlar."
            )
        deltas = {"KACAK": -2, "PRESCI": -1, "ORTA_GRUP": +1, "SPRINTER": +2, "SERBEST": 0, "YETERSIZ": 0}

    elif kacak_sayisi == 2 or (kacak_sayisi == 1 and presci_sayisi >= 3) or (kacak_sayisi == 0 and presci_sayisi >= 6):
        tahmini_tempo = "Süratli / Tempolu"
        tempo_kodu = "SURATLI"
        avantajli_stiller = "Düzlük Sprinteri (🚀) ve Diri Presçi (🏹)"
        if kacak_sayisi:
            tempo_analiz_yorumu = (
                f"Önde {lider_isimleri} tempolu başlayacak ve hemen arkasında {presci_isimleri} "
                "pres uygulayacaktır. Tempolu akış, viraja kadar diri kalan sprinterleri düzlükte "
                "yarışa ortak eder."
            )
        else:
            tempo_analiz_yorumu = (
                f"Kaçak safkan bulunmuyor; {presci_sayisi} presçi ({presci_isimleri}) tempoyu "
                "kontrollü ama süratli tutacak. Ön grupta yer tutanlar düzlüğe yıpranmadan girerse avantajlıdır."
            )
        deltas = {"KACAK": -1, "PRESCI": 0, "ORTA_GRUP": 0, "SPRINTER": +1, "SERBEST": 0, "YETERSIZ": 0}

    elif kacak_sayisi == 1 or presci_sayisi >= 3:
        tahmini_tempo = "Dengeli / Normal"
        tempo_kodu = "DENGELI"
        avantajli_stiller = "Tek Doğal Lider (⚡) ve Takipçi Presçi (🏹)"
        if kacak_sayisi == 1:
            lider = kacaklar[0]
            tempo_analiz_yorumu = (
                f"Yarışta #{lider['at_no']} {lider['at_ismi']} tek doğal lider pozisyonundadır. "
                "Startla kafayı alıp kendi temposunu kabul ettirirse virajı avantajlı dönebilir. "
                "Arkada dengeli takip eden presçiler düzlüğe diri çıkacaktır."
            )
        else:
            tempo_analiz_yorumu = (
                f"Belirgin kaçak yok; {presci_sayisi} presçi ve {orta_grup_sayisi} orta grup safkan "
                "tempo dengesini koruyacak. Büyük bir erken hız çekişmesi beklenmiyor."
            )
        deltas = {"KACAK": +1, "PRESCI": +1, "ORTA_GRUP": 0, "SPRINTER": 0, "SERBEST": 0, "YETERSIZ": 0}

    else:
        tahmini_tempo = "Ağır / Yavaş"
        tempo_kodu = "YAVAS"
        avantajli_stiller = "Ön Grup Presçileri (🏹) ve Bariyer Tutanlar"
        tempo_analiz_yorumu = (
            f"Yarışta belirgin bir kaçak safkan bulunmuyor. {presci_sayisi} presçi ön grupta yer tutsa da "
            "liderlik için sert bir erken hız çekişmesi yok; tempo ilk metrelerden itibaren ağır kalabilir. "
            "Koşunun son 400 metrede taktiksel bir sprinte dönüşmesi ve ön grupta yer tutan safkanların "
            "virajı yıpranmadan dönmesi beklenir."
        )
        deltas = {"KACAK": 0, "PRESCI": +2, "ORTA_GRUP": +1, "SPRINTER": -2, "SERBEST": 0, "YETERSIZ": 0}

    # Baskı skorunu seçilen tempo bandına kalibre et: aynı yarışta hem "yavaş"
    # etiketi hem 90+ baskı skoru görünmesini engeller.
    if tempo_kodu == "COK_HIZLI":
        tempo_skoru = max(85.0, tempo_skoru)
    elif tempo_kodu == "SURATLI":
        tempo_skoru = min(84.0, max(65.0, tempo_skoru))
    elif tempo_kodu == "DENGELI":
        tempo_skoru = min(64.0, max(45.0, tempo_skoru))
    else:
        tempo_skoru = min(44.0, max(20.0, tempo_skoru))

    # Türev Kosu Temposunu Kaydet
    tam_olcum = sum(1 for h in horses_with_styles if h["taktik"]["veri_durumu"] == "GUNCEL")
    sinirli_olcum = classified_horses - tam_olcum
    tempo_analiz_yorumu += (
        f" Taktik kanıtı: {tam_olcum} at tam (3+ ölçüm), "
        f"{sinirli_olcum} at sınırlı (1-2 ölçüm) ara-pozisyon verisine dayanıyor."
    )
    rec_tempo = {
        "tarih": tarih,
        "hipodrom_id": hipodrom_id,
        "kosu_no": kosu_no,
        "kosu_id": kosu_id,
        "mesafe": mesafe,
        "pist_turu": pist_turu,
        "tahmini_tempo": tahmini_tempo,
        "tempo_kodu": tempo_kodu,
        "tempo_skoru": tempo_skoru,
        "kacak_sayisi": kacak_sayisi,
        "presci_sayisi": presci_sayisi,
        "orta_grup_sayisi": orta_grup_sayisi,
        "sprinter_sayisi": sprinter_sayisi,
        "tecrubesiz_sayisi": tecrubesiz_sayisi,
        "olasi_liderler": olasi_liderler,
        "olasi_presciler": olasi_presciler,
        "avantajli_stiller": avantajli_stiller,
        "tempo_analiz_yorumu": tempo_analiz_yorumu,
        "veri_durumu": "TAMAMLANDI"
    }
    upsert_turev_kosu_temposu(conn, rec_tempo)

    # Koşudaki her at için tempo deltasını ve kulvar etkisini kaydet
    for h in horses_with_styles:
        s_kod = h["taktik"]["stil_kodu"]
        p_delta = deltas.get(s_kod, 0)
        # Tam profile göre daha az ölçümlü atlarda tempo etkisi ±1 ile sınırlanır.
        if h["taktik"]["veri_durumu"] in ("KISMI", "TEK_OLCUM", "DEGISKEN"):
            p_delta = max(-1, min(1, p_delta))
        st = h["start_no"] or 1

        # Kulvar etkisi yorumu
        if st <= 3:
            kulvar_yorumu = "Bariyer dibi avantajlı (Erken yer tutma kolaylığı)"
        elif st >= 8:
            kulvar_yorumu = "Dış kulvar (Dışarıdan dolanma veya erken sprint riski)"
        else:
            kulvar_yorumu = "Orta kulvar dengeli"

        # Taktiksel rol
        if s_kod == "KACAK":
            taktik_rol = "Lider Adayı (Kafada Kaçar)"
        elif s_kod == "PRESCI":
            taktik_rol = "Presçi (Liderin Arkasında Baskı Yapar)"
        elif s_kod == "ORTA_GRUP":
            taktik_rol = "Dengeli Takipçi (4.-6. Sırada Bekler)"
        elif s_kod == "SPRINTER":
            taktik_rol = "Pusu Sprinteri (Son 400m Patlayıcı)"
        else:
            taktik_rol = "Taktik Serbest (İlk 3 Koşusu / Gelişim)"
        if h["taktik"]["veri_durumu"] in ("KISMI", "TEK_OLCUM", "DEGISKEN"):
            taktik_rol += " - sınırlı ölçüm"

        upsert_turev_kosu_at_etkisi(conn, {
            "kosu_id": kosu_id,
            "at_id": h["at_id"],
            "at_no": h["at_no"],
            "at_ismi": h["at_ismi"],
            "hesaplanan_stil": h["taktik"]["hesaplanan_stil"],
            "pace_delta": p_delta,
            "start_kapisi": st,
            "kulvar_yorumu": kulvar_yorumu,
            "taktik_rol": taktik_rol
        })

    return rec_tempo


def run_full_tactical_and_pace_pipeline(conn, target_dates_list):
    """
    Veritabanındaki hedef tarihler için:
    1. Tüm atların koşu stillerini hesaplar ('turev_at_taktikleri')
    2. Tüm koşuların tempo senaryolarını hesaplar ('turev_kosu_tempolari')
    Özet istatistik döner.
    """
    total_horses_processed = 0
    total_races_processed = 0
    insufficient_data_horses = 0
    young_horses_count = 0
    partial_measurement_horses = 0
    single_measurement_horses = 0
    variable_style_horses = 0
    empty_races_warnings = []

    logger.info(f"\n🧠 TÜREV VERİ VE TEMPO MOTORU ÇALIŞTIRILIYOR (Hedef Tarihler: {target_dates_list})...")

    # 1. Hedef tarihlerdeki koşuları bul
    placeholders = ",".join("?" for _ in target_dates_list)
    cur_k = conn.execute(
        f"SELECT id, tarih, hipodrom_id, kosu_no FROM kosular WHERE tarih IN ({placeholders}) ORDER BY tarih, hipodrom_id, kosu_no",
        target_dates_list
    )
    kosular = cur_k.fetchall()

    if not kosular:
        logger.warning(f"⚠️ {target_dates_list} tarihlerinde henüz koşu programı kaydı yok.")
        return {
            "at_sayisi": 0,
            "kosu_sayisi": 0,
            "yetersiz_veri_sayisi": 0,
            "tecrubesiz_sayisi": 0,
            "bos_uyari_sayisi": 0,
            "uyarilar": [f"{target_dates_list} tarihlerinde koşu bulunamadı."]
        }

    # 2. Bu koşulardaki tüm tekil atları topla ve stillerini hesapla
    cur_at = conn.execute(f"""
        SELECT DISTINCT a.id, a.at_adi, a.toplam_kosu
        FROM program_kayitlari p
        JOIN kosular k ON p.kosu_id = k.id
        JOIN atlar a ON p.at_id = a.id
        WHERE k.tarih IN ({placeholders})
    """, target_dates_list)
    horses = cur_at.fetchall()

    for h in horses:
        at_id = h["id"]
        at_name = h["at_adi"]
        taktik = calculate_horse_tactical_style(conn, at_id, at_name)
        total_horses_processed += 1
        if taktik["veri_durumu"] == "YETERSIZ_VERI":
            insufficient_data_horses += 1
        elif taktik["veri_durumu"] == "ILK_3_KOSU_SERBEST":
            young_horses_count += 1
        elif taktik["veri_durumu"] == "KISMI":
            partial_measurement_horses += 1
        elif taktik["veri_durumu"] == "TEK_OLCUM":
            single_measurement_horses += 1
        elif taktik["veri_durumu"] == "DEGISKEN":
            variable_style_horses += 1

    # 3. Tüm koşuların tempo senaryolarını hesapla
    for k in kosular:
        res = calculate_race_pace_scenario(conn, k["id"])
        total_races_processed += 1
        if not res or res["veri_durumu"] == "BOS_UYARI":
            empty_races_warnings.append(f"Koşu {k['tarih']} Hip:{k['hipodrom_id']} K:{k['kosu_no']}")

    conn.commit()

    logger.info(f"✅ Analitik Tamamlandı: {total_horses_processed} at stili güncellendi, {total_races_processed} koşu işlendi.")
    if young_horses_count > 0:
        logger.info(f"🌱 Kural 1 Kapsamında {young_horses_count} genç safkana 'Taktik Serbest (İlk 3 Koşusu)' atandı.")
    if insufficient_data_horses > 0:
        logger.info(f"❓ Ölçüm bulunamadığı için {insufficient_data_horses} at 'Yetersiz Veri' olarak işaretlendi.")
    if partial_measurement_horses or single_measurement_horses:
        logger.info(
            "📊 Sınırlı ölçümle stil atanan atlar: %s (2 koşu), %s (tek koşu).",
            partial_measurement_horses, single_measurement_horses,
        )
    if variable_style_horses:
        logger.info(
            "🔀 Ölçümleri değişkenlik gösteren %s ata baskın stil atandı.",
            variable_style_horses,
        )
    if empty_races_warnings:
        logger.warning(f"⚠️ DİKKAT: {len(empty_races_warnings)} koşuda tempo tahmini boş kaldı: {empty_races_warnings}")

    return {
        "at_sayisi": total_horses_processed,
        "kosu_sayisi": total_races_processed,
        "yetersiz_veri_sayisi": insufficient_data_horses,
        "tecrubesiz_sayisi": young_horses_count,
        "kismi_olcum_sayisi": partial_measurement_horses,
        "tek_olcum_sayisi": single_measurement_horses,
        "degisken_stil_sayisi": variable_style_horses,
        "bos_uyari_sayisi": len(empty_races_warnings),
        "uyarilar": empty_races_warnings
    }
