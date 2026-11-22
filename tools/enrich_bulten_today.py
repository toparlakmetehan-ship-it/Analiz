import json
import sqlite3
import sys
sys.path.append('.')
from tjk_scraper.scraper import build_pist_aptitude, build_class_drop_analysis

conn = sqlite3.connect('data/tjk_yaris_arsiv.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

with open('public/data/bulten_bugun.json', 'r', encoding='utf-8') as f:
    bulten = json.load(f)

# Build a lookup of horse_name -> at_id from atlar table
horse_rows = cursor.execute("SELECT id, at_adi FROM atlar").fetchall()
horse_name_to_id = {}
for r in horse_rows:
    clean = r["at_adi"].strip().upper()
    horse_name_to_id[clean] = r["id"]

updated_pist = 0
updated_sinif = 0

for h in bulten.get("hipodromlar", []):
    sehir = h.get("sehir")
    for k in h.get("kosular", []):
        effective_pist = k.get("pist") or "Kum"
        grup_sinifi = k.get("grup_sinifi") or "Şartlı"
        for a in k.get("atlar", []):
            name = a.get("isim", "").strip().upper()
            at_id = horse_name_to_id.get(name)
            if not at_id:
                # Try finding in program_kayitlari or gecmis_yarislar
                res = cursor.execute("SELECT at_id FROM program_kayitlari pk JOIN kosular kos ON pk.kosu_id = kos.id JOIN hipodromlar hip ON kos.hipodrom_id = hip.id WHERE hip.sehir_adi = ? AND kos.kosu_no = ? AND pk.at_no = ?", (sehir, k.get("kosu_no"), a.get("no"))).fetchone()
                if res and res["at_id"]:
                    at_id = res["at_id"]
            
            if at_id:
                is_young = a.get("isYoungHorse", False)
                # Compute pist aptitude
                new_apt = build_pist_aptitude(
                    conn, at_id, is_young, effective_pist,
                    sire_name=a.get("baba", ""),
                    dam_sire=a.get("kisrak_babasi", ""),
                    running_style=a.get("kosu_stili", "")
                )
                a["pist_aptitude_analizi"] = new_apt
                updated_pist += 1

                # Compute sinif analizi
                new_sinif = build_class_drop_analysis(conn, at_id, grup_sinifi)
                if new_sinif:
                    a["sinif_analizi"] = new_sinif
                    updated_sinif += 1

print(f"Enriched {updated_pist} horses with pist aptitude, {updated_sinif} with sinif analizi.")

with open('public/data/bulten_bugun.json', 'w', encoding='utf-8') as f:
    json.dump(bulten, f, ensure_ascii=False, indent=2)
print("Saved public/data/bulten_bugun.json successfully.")
