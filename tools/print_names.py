import json

for label, path in [('BUGÜN', 'public/data/bulten_bugun.json'), ('YARIN', 'public/data/bulten_yarin.json')]:
    print(f"\n==================== {label} ({path}) ====================")
    with open(path, 'r', encoding='utf-8') as f:
        b = json.load(f)

    for hip in b.get('hipodromlar', []):
        sehir = hip.get('sehir')
        print(f"\n🏛️ Hipodrom: {sehir}")
        for k in hip.get('kosular', []):
            k_no = k.get('kosu_no')
            names = [f"{h.get('no')}:{h.get('isim')}" for h in k.get('atlar', [])]
            print(f"  Koşu {k_no}: {', '.join(names[:6])} (Toplam {len(names)} at)")
