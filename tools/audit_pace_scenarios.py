import json

with open('public/data/bulten_bugun.json', 'r', encoding='utf-8') as f:
    b = json.load(f)

for h in b['hipodromlar']:
    print(f"\n==================== {h['sehir'].upper()} ====================")
    for k in h['kosular']:
        ts = k.get('tempo_senaryosu', {})
        styles = [a.get('kosu_stili') for a in k.get('atlar', [])]
        style_counts = {}
        for s in styles:
            style_counts[s] = style_counts.get(s, 0) + 1
        
        kacanlar = ts.get('olasi_kacanlar', [])
        
        # Check delta alignment
        deltas = [f"{a.get('isim')}({a.get('kosu_stili')}: {a.get('tempo_delta'):+d})" for a in k.get('atlar', [])[:4]]

        print(f"\n[Koşu {k['kosu_no']}] {k.get('mesafe')}m {k.get('pist')} ({k.get('grup_sinifi')}) - {len(k.get('atlar', []))} At")
        print(f"  • Tempo: {ts.get('tempo_sinifi')} (Kod: {ts.get('tempo_kodu')}, Skor: {ts.get('tempo_skoru')})")
        print(f"  • Lider Adayları: {kacanlar}")
        print(f"  • Avantajlı Stiller: {ts.get('avantajli_stiller')}")
        print(f"  • Stiller: {style_counts}")
        print(f"  • Örnek Deltalar: {', '.join(deltas)}")
        print(f"  • Senaryo: {ts.get('senaryo_yorumu')}")
