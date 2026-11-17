from bs4 import BeautifulSoup

with open('tjk_bursa_program.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

race_details = soup.find_all('div', class_='race-details')
print(f"Total race-details: {len(race_details)}")

for i, rd in enumerate(race_details):
    print(f"\n--- Race {i+1} Details ---")
    print(rd.get_text(strip=True))
