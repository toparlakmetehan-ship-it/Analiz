import json

with open("public/data/tutan_altililar.json", "r", encoding="utf-8") as f:
    d = json.load(f)

for item in d["tutanKuponlar"]:
    print("=" * 60)
    print(f"ID: {item['id']} | {item['tarih']} | {item['sehir']} | {item['paket']}")
    print(f"Mevcut İkramiye: {item['ikramiyeFormatli']}")
    print("Ayaklar:")
    for ayak in item.get("ayaklar", []):
        winner = f"{ayak.get('kazananNo')} {ayak.get('kazananIsim')} (Gny: {ayak.get('ganyan')})"
        horses = [f"{at['no']} {at['isim']}" for at in ayak.get("kuponAtlar", [])]
        print(f"  Ayak {ayak.get('ayakNo')} (Koşu {ayak.get('kosuNo')}): Kazanan: {winner} | Kupon ({len(horses)} at): {', '.join(horses)}")
