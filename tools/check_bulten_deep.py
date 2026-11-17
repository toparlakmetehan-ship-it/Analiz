import json

for fn in ['public/data/bulten_bugun.json', 'public/data/bulten_yarin.json']:
    with open(fn, 'r', encoding='utf-8') as f:
        b = json.load(f)
    print(f"=== {fn} ===")
    for hip in b.get('hipodromlar', []):
        sehir = hip.get('sehir')
        print(f"Hipodrom: {sehir}")
        for k in hip.get('kosular', []):
            k_no = k.get('kosu_no')
            atlar = k.get('atlar', [])
            empty_isim = [h for h in atlar if not h.get('isim')]
            empty_jokey = [h for h in atlar if not h.get('jokey')]
            if empty_isim:
                print(f"  Koşu {k_no}: {len(empty_isim)} at ismi BOŞ!")
            if empty_jokey:
                print(f"  Koşu {k_no}: {len(empty_jokey)} jokey BOŞ!")
            for h in atlar:
                isim = h.get('isim', '')
                if '(' in isim and ')' in isim:
                    print(f"  [PARANTEZLİ İSİM] K:{k_no} No:{h.get('no')} -> {isim}")
