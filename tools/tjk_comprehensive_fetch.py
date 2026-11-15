"""
TJK Kapsamlı Veri Çekici
========================
TJK.org'dan tüm faktörleri çeker:
- At detayları (soy ağacı: baba, ana, kardeşler)
- Pist & hava durumu
- Jokey & antrenör istatistikleri
- Son form (son 5-10 yarış)
- Rakip analizi
- Hipodrom özellikleri
- Çalış sonuçları (galop)
"""

import os, json, time, re, requests
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# ── Dizinler ──
BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR   = os.path.join(BASE, "public", "data", "tjk_live")
HORSE_DIR  = os.path.join(DATA_DIR, "horses")
RACE_DIR   = os.path.join(DATA_DIR, "races")
JOCKEY_DIR = os.path.join(DATA_DIR, "jockeys")

for d in [DATA_DIR, HORSE_DIR, RACE_DIR, JOCKEY_DIR]:
    os.makedirs(d, exist_ok=True)

HEADERS = {
    "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                       "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept":          "application/json, text/html, */*",
    "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
    "Referer":         "https://www.tjk.org/TR/YarisSever/Info/Page/ProgramSayfa",
    "X-Requested-With":"XMLHttpRequest",
}

def session():
    s = requests.Session()
    r = Retry(total=4, backoff_factor=1.5, status_forcelist=[429,500,502,503,504])
    s.mount("https://", HTTPAdapter(max_retries=r))
    s.headers.update(HEADERS)
    return s

def get(url, timeout=25, as_json=False):
    s = session()
    try:
        resp = s.get(url, timeout=timeout)
        resp.raise_for_status()
        return resp.json() if as_json else resp.text
    except Exception as e:
        print(f"  ⚠ GET hatası [{url[:60]}…]: {e}")
        return None

# ══════════════════════════════════════════════════════
# 1. BUGÜNÜN YARIŞ PROGRAMI
# ══════════════════════════════════════════════════════
def fetch_today_program(date_str=None):
    """date_str: 'dd.mm.yyyy'. Varsayılan: bugün."""
    date_str = date_str or datetime.now().strftime("%d.%m.%Y")
    print(f"\n📅 Program çekiliyor: {date_str}")

    # TJK program endpoint'leri (deneme sırası)
    urls = [
        f"https://www.tjk.org/TR/YarisSever/Query/DataRows/Program?QueryParameter_Tarih={date_str}",
        f"https://www.tjk.org/TR/YarisSever/Query/DataRows/AtListesi?QueryParameter_Tarih={date_str}",
        f"https://www.tjk.org/TR/YarisSever/Info/Page/ProgramSayfa?QueryParameter_Tarih={date_str}",
    ]
    for url in urls:
        data = get(url, as_json=False)
        if data and len(data) > 100:
            # JSON mu HTML mi?
            try:
                parsed = json.loads(data)
                print(f"  ✅ JSON program alındı ({len(parsed)} kayıt)")
                out = os.path.join(RACE_DIR, f"program_{date_str.replace('.','')}.json")
                with open(out,"w",encoding="utf-8") as f:
                    json.dump(parsed, f, ensure_ascii=False, indent=2)
                return parsed
            except:
                # HTML ise BeautifulSoup ile parse et
                soup = BeautifulSoup(data, "html.parser")
                tables = soup.find_all("table")
                if tables:
                    print(f"  📄 HTML tablo bulundu, parse ediliyor…")
                    return parse_program_html(soup, date_str)
    print("  ❌ Program alınamadı.")
    return []

def parse_program_html(soup, date_str):
    """HTML sayfasından yarış programını çıkar."""
    races = []
    for table in soup.find_all("table"):
        rows = table.find_all("tr")
        if len(rows) < 2:
            continue
        headers = [th.get_text(strip=True) for th in rows[0].find_all(["th","td"])]
        for row in rows[1:]:
            cells = [td.get_text(strip=True) for td in row.find_all(["td","th"])]
            if cells:
                races.append(dict(zip(headers, cells)))
    out = os.path.join(RACE_DIR, f"program_{date_str.replace('.','')}.json")
    with open(out,"w",encoding="utf-8") as f:
        json.dump(races, f, ensure_ascii=False, indent=2)
    print(f"  ✅ {len(races)} satır HTML'den çıkarıldı.")
    return races

# ══════════════════════════════════════════════════════
# 2. AT DETAYI (soy ağacı dahil)
# ══════════════════════════════════════════════════════
def fetch_horse_detail(horse_id_or_name):
    """Bir atın tüm detaylarını çeker: soy, form, galop."""
    print(f"  🐎 At detayı çekiliyor: {horse_id_or_name}")
    urls = [
        f"https://www.tjk.org/TR/YarisSever/Query/DataRows/AtDetay?QueryParameter_AtId={horse_id_or_name}",
        f"https://www.tjk.org/TR/YarisSever/Query/DataRows/AtBilgi?QueryParameter_AtIsmi={horse_id_or_name}",
    ]
    for url in urls:
        data = get(url)
        if data and len(data) > 50:
            try:
                parsed = json.loads(data)
                return parsed
            except:
                pass
    return None

# ══════════════════════════════════════════════════════
# 3. SOY AĞACI (Pedigree)
# ══════════════════════════════════════════════════════
def fetch_pedigree(horse_id):
    """Atın baba, ana, dede, büyükanne bilgilerini çeker."""
    url = f"https://www.tjk.org/TR/YarisSever/Query/DataRows/AtSoySec?QueryParameter_AtId={horse_id}"
    data = get(url)
    if data:
        try:
            return json.loads(data)
        except:
            pass
    return {}

# ══════════════════════════════════════════════════════
# 4. JOKEY İSTATİSTİKLERİ
# ══════════════════════════════════════════════════════
def fetch_jockey_stats(jockey_name=None, year=None):
    """Jokey kazanma oranları, pist bazlı istatistikler."""
    year = year or datetime.now().year
    url = f"https://www.tjk.org/TR/YarisSever/Query/DataRows/JokeyIstatistik?QueryParameter_Yil={year}"
    if jockey_name:
        url += f"&QueryParameter_JokeyAdi={requests.utils.quote(jockey_name)}"
    data = get(url)
    if data:
        try:
            return json.loads(data)
        except:
            pass
    return []

# ══════════════════════════════════════════════════════
# 5. ANTRENÖR İSTATİSTİKLERİ
# ══════════════════════════════════════════════════════
def fetch_trainer_stats(year=None):
    year = year or datetime.now().year
    url = f"https://www.tjk.org/TR/YarisSever/Query/DataRows/AntrenorIstatistik?QueryParameter_Yil={year}"
    data = get(url)
    if data:
        try:
            return json.loads(data)
        except:
            pass
    return []

# ══════════════════════════════════════════════════════
# 6. ÇALIŞ SONUÇLARI (Galop)
# ══════════════════════════════════════════════════════
def fetch_galop_results(date_str=None):
    date_str = date_str or datetime.now().strftime("%d.%m.%Y")
    url = f"https://www.tjk.org/TR/YarisSever/Query/DataRows/CalisListesi?QueryParameter_Tarih={date_str}"
    data = get(url)
    if data:
        try:
            return json.loads(data)
        except:
            pass
    return []

# ══════════════════════════════════════════════════════
# 7. YARIŞ SONUÇLARI (Son N gün)
# ══════════════════════════════════════════════════════
def fetch_recent_results(days=14):
    print(f"\n📊 Son {days} günün sonuçları çekiliyor…")
    all_results = []
    today = datetime.now()
    cities = ["Istanbul","Ankara","Izmir","Adana","Bursa","Kocaeli","Antalya","Sanliurfa","Diyarbakir","Elazig"]
    for delta in range(days):
        d = today - timedelta(days=delta)
        year = d.year
        ym = f"{d.year}-{d.month:02d}"
        ds = d.strftime("%d.%m.%Y")
        for city in cities:
            csv_url = (
                f"https://medya-cdn.tjk.org/raporftp/TJKPDF/{year}/{ym}/CSV/"
                f"GunlukYarisSonuclari/{ds}-{city}-GunlukYarisSonuclari-TR.csv"
            )
            try:
                r = requests.get(csv_url, timeout=15)
                if r.status_code == 200 and len(r.content) > 100:
                    fname = f"{d.strftime('%Y%m%d')}_{city}.csv"
                    fpath = os.path.join(RACE_DIR, fname)
                    with open(fpath,"wb") as f:
                        f.write(r.content)
                    print(f"  ✅ {city} - {ds}")
                    all_results.append({"date":ds,"city":city,"file":fname})
                    time.sleep(0.3)
            except Exception as e:
                pass
    out = os.path.join(RACE_DIR, "recent_results_index.json")
    with open(out,"w",encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    return all_results

# ══════════════════════════════════════════════════════
# 8. HAVA DURUMU (OpenMeteo – ücretsiz, açık API)
# ══════════════════════════════════════════════════════
HIPODROM_COORDS = {
    "Istanbul":    (41.0421, 29.0132),
    "Ankara":      (39.9334, 32.8597),
    "Izmir":       (38.4192, 27.1287),
    "Adana":       (37.0000, 35.3213),
    "Bursa":       (40.1885, 29.0610),
    "Kocaeli":     (40.7654, 29.9408),
    "Antalya":     (36.8969, 30.7133),
    "Sanliurfa":   (37.1591, 38.7969),
    "Diyarbakir":  (37.9144, 40.2306),
    "Elazig":      (38.6810, 39.2264),
}

def fetch_weather(city="Istanbul"):
    lat, lon = HIPODROM_COORDS.get(city, (41.0421, 29.0132))
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,"
        f"precipitation,weather_code,surface_pressure"
        f"&hourly=temperature_2m,precipitation_probability,wind_speed_10m"
        f"&timezone=Europe%2FIstanbul&forecast_days=1"
    )
    try:
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            return r.json()
    except Exception as e:
        print(f"  ⚠ Hava durumu alınamadı: {e}")
    return {}

# ══════════════════════════════════════════════════════
# 9. ANALİZ MOTORU — Tüm Faktörleri Puanla
# ══════════════════════════════════════════════════════
def analyze_horse(horse, weather=None, jockey_stats=None, trainer_stats=None, pedigree=None):
    """
    Atı 0-100 arası toplam skorla değerlendir.
    Faktörler:
      - Form (son yarışlar)         %25
      - Jokey performansı           %20
      - Soy / Pedigree              %15
      - Pist uyumu                  %15
      - Hava / kondisyon            %10
      - Antrenör başarısı           %10
      - Fiziksel durum (ağırlık vb) %5
    """
    scores = {}

    # Form skoru
    ft = horse.get("finish_time", 90)
    pft = horse.get("predicted_finish_time", 90)
    form_score = max(0, 100 - abs(ft - pft) * 10)
    scores["form"] = round(form_score, 1)

    # Jokey skoru
    jp = horse.get("jockey_recent_performance", 50)
    scores["jockey"] = round(min(100, jp), 1)

    # Pist uyumu
    track = horse.get("track_type","Sand")
    # Çim pistte daha iyi performans varsayımı
    track_bonus = 10 if track == "Grass" else 0
    scores["track_fit"] = round(50 + track_bonus + (horse.get("distance",1200)/20), 1)
    scores["track_fit"] = min(100, scores["track_fit"])

    # Hava skoru
    weather_score = 70  # varsayılan
    if weather and "current" in weather:
        cur = weather["current"]
        temp = cur.get("temperature_2m", 20)
        wind = cur.get("wind_speed_10m", 10)
        precip = cur.get("precipitation", 0)
        # Atlara ideal: 15-22°C, düşük rüzgar, yağmur yok
        weather_score = 100
        weather_score -= abs(temp - 18) * 2
        weather_score -= wind * 1.5
        weather_score -= precip * 10
        weather_score = max(0, min(100, weather_score))
    scores["weather"] = round(weather_score, 1)

    # Pedigree skoru (soy kalitesi)
    ped_score = 60  # varsayılan
    if pedigree:
        # Bilinen büyük aygırların bonus puanı
        famous_sires = ["Galileo","Frankel","Dubawi","Sea The Stars","Kingman","Lope de Vega"]
        sire = str(pedigree.get("sire","")).strip()
        if any(fs.lower() in sire.lower() for fs in famous_sires):
            ped_score = 90
        elif sire:
            ped_score = 70
    scores["pedigree"] = ped_score

    # Antrenör skoru
    trainer_score = 60
    if trainer_stats:
        total = trainer_stats.get("total_races", 1)
        wins  = trainer_stats.get("wins", 0)
        trainer_score = min(100, (wins/total)*100 + 20) if total > 0 else 60
    scores["trainer"] = round(trainer_score, 1)

    # Fiziksel durum
    weight = horse.get("weight", 480)
    # 450-500 kg ideal
    phys_score = 100 - abs(weight - 475) * 0.5
    scores["physical"] = round(max(0, min(100, phys_score)), 1)

    # Ağırlıklı toplam
    total = (
        scores["form"]     * 0.25 +
        scores["jockey"]   * 0.20 +
        scores["pedigree"] * 0.15 +
        scores["track_fit"]* 0.15 +
        scores["weather"]  * 0.10 +
        scores["trainer"]  * 0.10 +
        scores["physical"] * 0.05
    )
    scores["total"] = round(total, 1)
    scores["risk"] = round(1 - total/100, 3)
    return scores

# ══════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════
def main():
    print("=" * 60)
    print("TJK Kapsamlı Veri Çekici — Başlıyor")
    print("=" * 60)

    # 1. Hava durumu (İstanbul için)
    print("\n🌤  Hava durumu çekiliyor…")
    weather = {}
    for city in ["Istanbul","Ankara","Izmir","Adana","Bursa"]:
        w = fetch_weather(city)
        if w:
            weather[city] = w
            print(f"  ✅ {city}")
        time.sleep(0.3)
    out = os.path.join(DATA_DIR, "weather.json")
    with open(out,"w",encoding="utf-8") as f:
        json.dump(weather, f, ensure_ascii=False, indent=2)

    # 2. Bugünün programı
    program = fetch_today_program()

    # 3. Son yarış sonuçları (CSV)
    results = fetch_recent_results(days=14)

    # 4. Mevcut at verilerini analiz et
    print("\n🔬 At analizi yapılıyor…")
    with_risk_dir = os.path.join(BASE,"public","data","with_risk")
    analyzed = []
    if os.path.exists(with_risk_dir):
        files = sorted(os.listdir(with_risk_dir))[:200]
        for fn in files:
            if not fn.endswith(".json"): continue
            with open(os.path.join(with_risk_dir,fn),encoding="utf-8") as f:
                horse = json.load(f)
            # İstanbul hava durumunu kullan (varsayılan)
            w = weather.get("Istanbul",{})
            scores = analyze_horse(horse, weather=w)
            horse["analysis"] = scores
            horse["total_score"] = scores["total"]
            analyzed.append(horse)

    # Toplam skora göre sırala
    analyzed.sort(key=lambda x: x.get("total_score",0), reverse=True)

    # Çıktıları kaydet
    out_all = os.path.join(DATA_DIR, "analyzed_horses.json")
    with open(out_all,"w",encoding="utf-8") as f:
        json.dump(analyzed, f, ensure_ascii=False, indent=2)
    print(f"  ✅ {len(analyzed)} at analiz edildi → {out_all}")

    # Özet rapor
    summary = {
        "generated_at":  datetime.now().isoformat(),
        "total_horses":  len(analyzed),
        "top10":         [{"id":h["horse_id"],"name":h["name"],"score":h["total_score"]} for h in analyzed[:10]],
        "weather_cities":list(weather.keys()),
        "results_fetched":len(results),
        "program_fetched":len(program),
    }
    out_sum = os.path.join(DATA_DIR,"summary.json")
    with open(out_sum,"w",encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print("\n" + "="*60)
    print("✅ TAMAMLANDI")
    print(f"   At sayısı  : {len(analyzed)}")
    print(f"   Hava verisi: {list(weather.keys())}")
    print(f"   CSV sonuçlar: {len(results)}")
    print("="*60)

if __name__ == "__main__":
    main()
