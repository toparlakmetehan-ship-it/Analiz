import json

with open("public/data/tutan_altililar.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for k in data["tutanKuponlar"]:
    print(f"ID: {k['id']}")
    print(f"Tarih: {k['tarih']} ({k['tarihKodu']})")
    print(f"Şehir: {k['sehir']}")
    print(f"Paket: {k['paket']}")
    print(f"Mevcut İkramiye: {k['ikramiyeFormatli']} ({k['ikramiye']})")
    print("Secenekler:")
    for s in k.get("secenekler", []):
        print(f"   Model: {s.get('modelAdi')} | Maliyet: {s.get('maliyetFormatli')} | NetKar: {s.get('netKarFormatli')} | ROI: {s.get('roi')}")
    print("-" * 50)
