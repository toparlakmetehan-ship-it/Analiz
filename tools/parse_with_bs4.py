from bs4 import BeautifulSoup
import re

def analyze_coupon(file_path, pkg_name):
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    print(f"\n=======================================================")
    print(f"ANALİZ: {pkg_name}")
    print(f"=======================================================")
    
    legs = soup.find_all('div', class_='leg-box')
    print(f"Toplam Ayak Sayısı: {len(legs)}")
    
    total_combo = 1
    for idx, leg in enumerate(legs):
        header = leg.find('div', class_='leg-header')
        header_text = header.get_text(" ", strip=True) if header else f"Ayak {idx+1}"
        
        horses = []
        for horse_div in leg.find_all('div', class_='horse-select-row'):
            txt = horse_div.get_text(" ", strip=True)
            # e.g. "4 ALİMENDER 85 P"
            horses.append(txt)
        
        print(f"\n--- {header_text} ({len(horses)} At) ---")
        for h in horses:
            print(f"   {h}")
        if len(horses) > 0:
            total_combo *= len(horses)
            
    math_info = soup.find('div', class_='coupon-math-info')
    print(f"\nKombinasyon Çarpımı: {total_combo}")
    if math_info:
        print(f"Matematik Bilgisi: {math_info.get_text(strip=True)}")

analyze_coupon('tools/coupon_output_pkg1.html', 'ADANA 1. 6\'LI GANYAN')
analyze_coupon('tools/coupon_output_pkg2.html', 'ADANA 2. 6\'LI GANYAN')
