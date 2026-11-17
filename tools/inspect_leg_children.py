from bs4 import BeautifulSoup

with open('tools/coupon_output_pkg1.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

legs = soup.find_all('div', class_='leg-box')
for idx, leg in enumerate(legs):
    print(f"\n=== LEG {idx+1} ===")
    for child in leg.find_all(recursive=False):
        print(f"Child tag: {child.name}, class: {child.get('class')}")
    # print text of leg
    print(leg.get_text("\n", strip=True))
