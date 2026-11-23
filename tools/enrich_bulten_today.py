import json
import sqlite3
import sys
sys.path.append('.')
from tjk_scraper.scraper import build_pist_aptitude, build_class_drop_analysis, build_deep_maternal_siblings

conn = sqlite3.connect('data/tjk_yaris_arsiv.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

horse_rows = cursor.execute("SELECT id, at_adi FROM atlar").fetchall()
horse_name_to_id = {}
for r in horse_rows:
    clean = r["at_adi"].strip().upper()
    horse_name_to_id[clean] = r["id"]

def enrich_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        bulten = json.load(f)

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
                    res = cursor.execute(
                        "SELECT at_id FROM program_kayitlari pk "
                        "JOIN kosular kos ON pk.kosu_id = kos.id "
                        "JOIN hipodromlar hip ON kos.hipodrom_id = hip.id "
                        "WHERE hip.sehir_adi = ? AND kos.kosu_no = ? AND pk.at_no = ?",
                        (sehir, k.get("kosu_no"), a.get("no"))
                    ).fetchone()
                    if res and res["at_id"]:
                        at_id = res["at_id"]
                
                if at_id:
                    is_young = a.get("isYoungHorse", False)
                    new_apt = build_pist_aptitude(
                        conn, at_id, is_young, effective_pist,
                        sire_name=a.get("baba", ""),
                        dam_sire=a.get("kisrak_babasi", ""),
                        running_style=a.get("kosu_stili", "")
                    )
                    a["pist_aptitude_analizi"] = new_apt
                    updated_pist += 1

                    new_sinif = build_class_drop_analysis(conn, at_id, grup_sinifi)
                    if new_sinif:
                        a["sinif_analizi"] = new_sinif
                        updated_sinif += 1

                # Anne kardeşleri analizi (5 yıllık sınır olmaksızın tüm tarihsel arşiv)
                anne_adi = a.get("anne", "")
                a["anne_kardesleri"] = build_deep_maternal_siblings(conn, name, anne_adi)

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(bulten, f, ensure_ascii=False, indent=2)
    print(f"{file_path}: Enriched {updated_pist} horses with pist aptitude, {updated_sinif} with sinif analizi.")

enrich_file('public/data/bulten_bugun.json')
enrich_file('public/data/bulten_yarin.json')
