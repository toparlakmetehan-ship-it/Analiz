import os
import json
import sqlite3
import re

DB_PATH = 'data/tjk_yaris_arsiv.db'

def get_db():
    return sqlite3.connect(DB_PATH)

def analyze_horse_class_history(conn, at_adi, current_race_class):
    c = conn.cursor()
    # Normalize horse name
    clean_name = re.sub(r'\s*\(\d+\)\s*$', '', at_adi).strip().upper()
    
    # Find at_id
    c.execute("SELECT id FROM atlar WHERE UPPER(at_adi) = ? OR UPPER(at_adi) LIKE ?", (clean_name, f"{clean_name}%"))
    row = c.fetchone()
    if not row:
        return None
    at_id = row[0]
    
    # Fetch past 10 races ordered by date desc
    c.execute("""
        SELECT kosu_cinsi, grup, sira, tarih, kilo, handikap, hipodrom_sehir
        FROM gecmis_yarislar
        WHERE at_id = ?
        ORDER BY (substr(tarih, 7, 4) || '-' || substr(tarih, 4, 2) || '-' || substr(tarih, 1, 2)) DESC
        LIMIT 10
    """, (at_id,))
    past_races = c.fetchall()
    if not past_races:
        return None
        
    elite_runs = []
    for r in past_races:
        c_cinsi = (r[0] or '').upper()
        # Elite indicators: G 1, G 2, G 3, GRUP, A 3, KV-8, KV-9, KV-7
        is_elite = False
        grade = ''
        if 'G 1' in c_cinsi or 'G1' in c_cinsi:
            is_elite = True
            grade = 'G 1'
        elif 'G 2' in c_cinsi or 'G2' in c_cinsi:
            is_elite = True
            grade = 'G 2'
        elif 'G 3' in c_cinsi or 'G3' in c_cinsi or 'A 3' in c_cinsi or 'A3' in c_cinsi:
            is_elite = True
            grade = 'G 3'
        elif 'KV-8' in c_cinsi or 'KV-9' in c_cinsi:
            is_elite = True
            grade = 'KV-8/9'
        elif 'KV-7' in c_cinsi:
            is_elite = True
            grade = 'KV-7'
            
        if is_elite:
            elite_runs.append({
                'kosu_cinsi': r[0],
                'grade': grade,
                'sira': r[2],
                'tarih': r[3],
                'kilo': r[4],
                'handikap': r[5]
            })
            
    if not elite_runs:
        return None
        
    # Is current race lower class?
    curr_lower = (current_race_class or '').lower()
    is_current_elite = any(eg in curr_lower for eg in ['g 1', 'g1', 'g 2', 'g2', 'g 3', 'g3', 'a 3', 'a3', 'kv-8', 'kv-9'])
    is_dropping = not is_current_elite
    
    # Priority order for grades: G 1 > G 2 > G 3 > KV-8/9 > KV-7
    grade_order = ['G 1', 'G 2', 'G 3', 'KV-8/9', 'KV-7']
    top_grade = elite_runs[0]['grade']
    for g in grade_order:
        if any(er['grade'] == g for er in elite_runs):
            top_grade = g
            break
            
    top_5_in_elite = sum(1 for er in elite_runs if er['sira'] and er['sira'] <= 5)
    
    # KULLANICI KURALI: Üst grupta sadece koşmuş olmak suni puan vermez (İPTAL EDİLDİ).
    # Önemli olan gösterdiği gerçek performans ve tabeladır; ham güç puanına ek puan verilmez (Puan Nötr: 0.0).
    final_bonus = 0.0
    
    if is_dropping:
        badge = f"💎 ÜST GRUP TECRÜBELİ ({top_grade} Koşmuş · Puan Nötr)"
    else:
        badge = f"💎 ÜST GRUP DENEYİMİ ({top_grade} Yarışçısı · Puan Nötr)"
        
    aciklama = f"Safkan geçmişte {len(elite_runs)} kez elit açık/grup ({', '.join(set(er['grade'] for er in elite_runs))}) koşularda boy göstermiştir ({top_5_in_elite} kez ilk 5'te bitirdi). Kural gereği üst grupta koşmuş olmak tek başına puan avantajı sağlamaz; safkanın gerçek form ve tabela performansı esas alınır (Puan Nötr)."
    
    return {
        'sinif_dususu': is_dropping,
        'ust_grup_sayisi': len(elite_runs),
        'en_ust_grup': top_grade,
        'grup_tabela_sayisi': top_5_in_elite,
        'class_bonus': 0.0,
        'badge': badge,
        'aciklama': aciklama
    }
        'class_bonus': final_bonus,
        'badge': badge,
        'aciklama': aciklama
    }

def enrich_bulten_file(file_path):
    if not os.path.exists(file_path):
        return
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    conn = get_db()
    enriched_count = 0
    for hip in data.get('hipodromlar', []):
        for kosu in hip.get('kosular', []):
            curr_cinsi = kosu.get('grup_sinifi', '')
            for at in kosu.get('atlar', []):
                res = analyze_horse_class_history(conn, at.get('isim', ''), curr_cinsi)
                if res:
                    at['sinif_analizi'] = res
                    enriched_count += 1
                else:
                    at['sinif_analizi'] = None
    conn.close()
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Enriched {file_path} with {enriched_count} class drop horses.")

if __name__ == '__main__':
    enrich_bulten_file('public/data/bulten_bugun.json')
    enrich_bulten_file('public/data/bulten_yarin.json')
