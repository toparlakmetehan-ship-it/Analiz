import json

with open('public/data/bulten_bugun.json', 'r', encoding='utf-8') as f:
    b1 = json.load(f)
with open('public/data/bulten_yarin.json', 'r', encoding='utf-8') as f:
    b2 = json.load(f)

for label, b in [('BUGUN', b1), ('YARIN', b2)]:
    for hip in b.get('hipodromlar', []):
        sehir = hip.get('sehir')
        for k in hip.get('kosular', []):
            k_no = k.get('kosu_no')
            for h in k.get('atlar', []):
                name = h.get('isim')
                no = h.get('no')
                if not name or name.strip() == '':
                    print(f"EMPTY NAME: {label} {sehir} K:{k_no} No:{no}")
                elif name.startswith('SAF-KAN') or name.startswith('SAF-KAN'):
                    print(f"PLACEHOLDER NAME: {label} {sehir} K:{k_no} No:{no} -> {name}")

print("Deep name check finished.")
