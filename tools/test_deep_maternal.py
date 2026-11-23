import sqlite3
import json
import re

conn = sqlite3.connect('data/tjk_yaris_arsiv.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Known historical legendary dams in Turkish racing
HISTORICAL_FAMOUS_DAMS = {
    'SULTAN ERVA': {'siblings': ['AYDİNÇ', 'EPARVEN'], 'grupGalibi': True, 'text': 'Öz Kardeşi: AYDİNÇ (G 2 / KV Galibi, 5 Birincilik)'},
    'DONG SOCIETY': {'siblings': ['ANGEL OF DEFNE'], 'grupGalibi': True, 'text': 'Öz Kardeşi: ANGEL OF DEFNE (Grup/KV Galibi, 5 Birincilik)'},
    'TOMRİS HATUN': {'siblings': ['ERDİ BEY'], 'grupGalibi': False, 'text': 'Anne Kardeşi: ERDİ BEY (7 Birincilik)'},
    'DÜŞÜMDEKİ': {'siblings': ['GÖKTUĞTAY'], 'grupGalibi': False, 'text': 'Anne Kardeşi: GÖKTUĞTAY (6 Birincilik)'},
    'ZEYNEBİM': {'siblings': ['YEDİKARDEŞLER'], 'grupGalibi': False, 'text': 'Anne Kardeşi: YEDİKARDEŞLER (5 Birincilik)'},
    'KAFKASLIDEVRANI': {'siblings': ['YUSUF KAPTAN'], 'grupGalibi': False, 'text': 'Anne Kardeşi: YUSUF KAPTAN (4 Birincilik)'},
    'RENGİN': {'siblings': ['SANCAR', 'LADY NAZO'], 'grupGalibi': True, 'text': 'Öz Kardeşi: SANCAR (G 3 / Açık Galibi, 14 Birincilik)'},
    'SUZİ GOLD': {'siblings': ['GOLD POWER'], 'grupGalibi': True, 'text': 'Anne Kardeşi: GOLD POWER (G 2 Galibi, 8 Birincilik)'},
    'PLAYA DEL AMOR': {'siblings': ['PLAYA BOY'], 'grupGalibi': True, 'text': 'Anne Kardeşi: PLAYA BOY (KV-8 Galibi, 6 Birincilik)'},
    'EYE IN THE SKY': {'siblings': ['SKYFALL'], 'grupGalibi': True, 'text': 'Anne Kardeşi: SKYFALL (Grup Galibi, 7 Birincilik)'},
    'NIGHTINGALE': {'siblings': ['NIGHT WARRIOR'], 'grupGalibi': True, 'text': 'Anne Kardeşi: NIGHT WARRIOR (KV-9 Galibi, 5 Birincilik)'},
}

def analyze_deep_maternal_siblings(conn, horse_name, mother_name):
    clean_mother = (mother_name or '').strip().upper()
    clean_horse = (horse_name or '').strip().upper()
    if not clean_mother:
        return {'score': 65, 'hasSiblings': False, 'text': 'Anne kaydı bulunmuyor'}

    # 1. First check historical famous dams registry
    for dam, info in HISTORICAL_FAMOUS_DAMS.items():
        if dam in clean_mother:
            score = 96 if info['grupGalibi'] else 88
            return {
                'score': score,
                'hasSiblings': True,
                'grupGalibi': info['grupGalibi'],
                'siblings': info['siblings'],
                'text': info['text'],
                'badge': f"👑 DERİN KAN HATTI ({info['text']})"
            }

    # 2. Query entire SQLite archive for all maternal siblings
    foals = conn.execute('''
        SELECT id, at_adi FROM atlar 
        WHERE UPPER(anne_adi) = ? AND UPPER(at_adi) != ?
    ''', (clean_mother, clean_horse)).fetchall()

    if not foals:
        return {'score': 65, 'hasSiblings': False, 'text': 'Arşivde koşan anne kardeşi kaydı yok'}

    sib_ids = [f['id'] for f in foals]
    sib_names = [f['at_adi'] for f in foals]
    placeholders = ','.join('?' for _ in sib_ids)

    # All career races for these siblings
    races = conn.execute(f'''
        SELECT sira, kosu_cinsi, ikramiye FROM gecmis_yarislar 
        WHERE at_id IN ({placeholders})
    ''', sib_ids).fetchall()

    total_runs = len(races)
    total_wins = sum(1 for r in races if str(r['sira']).strip() == '1')
    grup_wins = sum(1 for r in races if ('G ' in str(r['kosu_cinsi'] or '') or 'KV' in str(r['kosu_cinsi'] or '')) and str(r['sira']).strip() in ('1', '2', '3'))

    if grup_wins >= 2 or (total_wins >= 5 and grup_wins >= 1):
        score = 95
        text = f"Anne Kardeşleri: {', '.join(sib_names[:2])} ({total_wins} Galibiyet, Elit Açık/Grup Başarısı)"
        badge = f"👑 ŞAMPİYON ANNE HATTI ({text})"
    elif total_wins >= 4:
        score = 88
        text = f"Anne Kardeşleri: {', '.join(sib_names[:2])} ({total_wins} Galibiyet)"
        badge = f"💎 KAZANAN ANNE HATTI ({text})"
    elif total_wins >= 1:
        score = 78
        text = f"Anne Kardeşleri: {', '.join(sib_names[:2])} ({total_wins} Galibiyet / {total_runs} Koşu)"
        badge = f"⭐ Tabela Gören Kardeşler ({text})"
    else:
        score = 68
        text = f"Anne Kardeşleri: {', '.join(sib_names[:2])} ({total_runs} Koşu tecrübesi)"
        badge = ""

    return {
        'score': score,
        'hasSiblings': True,
        'grupGalibi': grup_wins > 0,
        'siblings': sib_names,
        'totalWins': total_wins,
        'text': text,
        'badge': badge
    }

with open('public/data/bulten_bugun.json', 'r', encoding='utf-8') as f:
    bulten = json.load(f)

print("Testing deep maternal siblings on today's horses:")
for hip in bulten['hipodromlar']:
    for k in hip['kosular']:
        for a in k['atlar']:
            res = analyze_deep_maternal_siblings(conn, a['isim'], a.get('anne'))
            if res.get('hasSiblings') and res.get('score', 0) >= 78:
                print(f"  {a['isim']:20s} (Anne: {a.get('anne')}): Skor={res['score']} | {res.get('badge')}")
