import json
import sqlite3

conn = sqlite3.connect('data/tjk_yaris_arsiv.db')
c = conn.cursor()

with open('public/data/bulten_bugun.json', 'r', encoding='utf-8') as f:
    bulten = json.load(f)

found_siblings = 0
for hip in bulten['hipodromlar']:
    for k in hip['kosular']:
        for a in k['atlar']:
            mother = (a.get('anne') or '').strip().upper()
            if not mother: continue
            
            # Find all foals of this mother in atlar
            foals = c.execute('''
                SELECT id, at_adi, baba_adi 
                FROM atlar 
                WHERE UPPER(anne_adi) = ? AND UPPER(at_adi) != ?
            ''', (mother, a.get('isim', '').strip().upper())).fetchall()
            
            if foals:
                found_siblings += 1
                sibling_names = [f[1] for f in foals]
                sib_ids = [f[0] for f in foals]
                placeholders = ','.join('?' for _ in sib_ids)
                wins = c.execute(f'''
                    SELECT COUNT(*) FROM gecmis_yarislar 
                    WHERE at_id IN ({placeholders}) AND sira = 1
                ''', sib_ids).fetchone()[0]
                grup_wins = c.execute(f'''
                    SELECT COUNT(*) FROM gecmis_yarislar 
                    WHERE at_id IN ({placeholders}) AND (kosu_cinsi LIKE '%G %' OR kosu_cinsi LIKE '%KV%') AND sira <= 3
                ''', sib_ids).fetchone()[0]
                if wins > 0:
                    print(f"{a.get('isim')} (Anne: {mother}) -> Kardeşler: {sibling_names}, Galibiyet: {wins}, Grup/KV: {grup_wins}")

print(f"Total horses with archive siblings: {found_siblings}")
