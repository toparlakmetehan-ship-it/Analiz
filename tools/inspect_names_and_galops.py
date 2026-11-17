import json, re

for fname in ['public/data/bulten_bugun.json', 'public/data/bulten_yarin.json']:
    with open(fname, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"=== Checking {fname} ===")
    total_horses = 0
    suspicious = 0
    for hip in data.get('hipodromlar', []):
        sehir = hip.get('sehir')
        for k in hip.get('kosular', []):
            k_no = k.get('kosu_no')
            for at in k.get('atlar', []):
                total_horses += 1
                isim = at.get('isim', '')
                no = at.get('no')
                # Check suspicious names
                if not isim or 'SAF-KAN' in isim or len(isim.strip()) <= 1 or re.search(r'^\d+$', isim):
                    print(f"  [BAD NAME] {sehir} Koşu:{k_no} No:{no} -> '{isim}'")
                    suspicious += 1
                # Check how name is rendered in UI
                # E.g. eküri numbers, brackets
                if '(' in isim:
                    print(f"  [BRACKET IN NAME] {sehir} Koşu:{k_no} No:{no} -> '{isim}'")
    print(f"Total horses: {total_horses}, Suspicious: {suspicious}")
