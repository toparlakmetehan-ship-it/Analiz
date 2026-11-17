import os, sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from tjk_scraper.parser import parse_daily_race_program_html, parse_horse_profile_html

# Test Bursa program parsing
with open("tjk_bursa_program.html", "r", encoding="utf-8") as f:
    bursa_html = f.read()

kosular = parse_daily_race_program_html(bursa_html, 4, "Bursa", "2026-11-16")
print(f"Bursa Parsed: {len(kosular)} kosu")
total_horses = sum(len(k["atlar"]) for k in kosular)
print(f"Total horses in Bursa: {total_horses}")
k0 = kosular[0]
print(f"Sample Koşu 1: {k0['kosu_cinsi']} {k0['saat']} {k0['mesafe']}m {k0['pist_turu']}")
h0 = k0["atlar"][0]
print(f"Sample At 1: {h0['at_no']} {h0['at_adi']} (ID: {h0['at_id']}) - Jokey: {h0['jokey_ad']} (ID: {h0['jokey_id']})")
print(f"   Baba: {h0['baba_adi']} (ID: {h0['baba_id']}) - Anne: {h0['anne_adi']} (ID: {h0['anne_id']})")

# Test horse profile parsing
with open("sample_horse_profile.html", "r", encoding="utf-8") as f:
    profile_html = f.read()

profile = parse_horse_profile_html(profile_html, 114754)
print(f"\nProfile Parsed: {profile['at_adi']} Doğum: {profile['dogum_tarihi']} Toplam Kazanç: {profile['toplam_kazanc']}")
print(f"Past races count: {len(profile['gecmis_yarislar'])}")
if profile["gecmis_yarislar"]:
    r0 = profile["gecmis_yarislar"][0]
    print(f"Past race 0: {r0['tarih']} {r0['hipodrom_sehir']} {r0['mesafe']}m Derece: {r0['derece_raw']} ({r0['derece_saniye']} sn) Sıra: {r0['sira']}")
