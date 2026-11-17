from bs4 import BeautifulSoup
import re

def parse_adana_results():
    with open('tjk_adana_sonuclar.html', 'r', encoding='utf-8') as f:
        html = f.read()

    soup = BeautifulSoup(html, 'html.parser')
    
    # Each race has h3.race-config followed by the results table
    race_headers = soup.find_all('h3', class_='race-config')
    print(f"Found {len(race_headers)} race headers")

    for idx, rh in enumerate(race_headers):
        race_text = rh.get_text(" ", strip=True)
        # Find video, accurace, fotofinish links
        video_a = rh.find('a', href=lambda h: h and 'KosuKodu' in h)
        video_url = video_a['href'] if video_a else None
        
        accurace_a = rh.find('a', href=lambda h: h and 'accurace' in h)
        accurace_url = accurace_a['href'] if accurace_a else None

        foto_a = rh.find('a', href=lambda h: h and 'fotoftp' in h)
        fotofinish_url = foto_a['href'] if foto_a else None

        pdf_a = rh.find('a', href=lambda h: h and 'raporftp' in h and '.pdf' in h)
        pdf_url = pdf_a['href'] if pdf_a else None

        print(f"\n--- Race {idx+1} ---")
        print(f"Header: {race_text[:120]}")
        print(f"Video: {video_url}, Accurace: {accurace_url}, Foto: {fotofinish_url}")

        # Next table is the results table
        table = rh.find_next('table')
        if table:
            rows = table.find_all('tr')[1:] # skip th
            print(f"Horses in race: {len(rows)}")
            for r in rows[:3]:
                tds = r.find_all('td')
                if len(tds) >= 14:
                    sira = tds[1].get_text(strip=True)
                    at_a = tds[2].find('a', href=lambda h: h and 'AtId=' in h)
                    at_id = None
                    if at_a:
                        m = re.search(r'QueryParameter_AtId=(\d+)', at_a['href'])
                        if m: at_id = int(m.group(1))
                        at_name = at_a.get_text(strip=True)
                    else:
                        at_name = tds[2].get_text(strip=True)

                    derece = tds[9].get_text(strip=True)
                    gny = tds[10].get_text(strip=True)
                    agf = tds[11].get_text(strip=True)
                    st = tds[12].get_text(strip=True)
                    fark = tds[13].get_text(strip=True)
                    gec_cikis = tds[14].get_text(strip=True) if len(tds) > 14 else ""
                    print(f"  #{sira} AtId: {at_id} {at_name} | Derece: {derece} | Gny: {gny} | Fark: '{fark}' | Geç Çık: '{gec_cikis}' | St: {st}")

        # Check son 800 below table
        # Let's find son 800 between this table and the next h3
        next_rh = race_headers[idx+1] if idx+1 < len(race_headers) else None
        # search for text 'Son 800'
        curr = table
        son800_text = None
        while curr and curr != next_rh:
            if hasattr(curr, 'get_text') and 'Son 800' in curr.get_text():
                m = re.search(r'Son 800\s*:\s*([\d\.\-]+)', curr.get_text())
                if m:
                    son800_text = m.group(1).strip()
                    break
            curr = curr.next_sibling
        print(f"Son 800: {son800_text}")

parse_adana_results()
