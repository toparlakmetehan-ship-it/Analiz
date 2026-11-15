# AGENTS.md — Global Model & System Guidelines for ROYAL TURF

## Critical Domain Rules (At Yarışı ve Model Kuralları)

1. **≤ 3 Races Inexperienced Horses Rule (Genç Safkanlar Kuralı)**
   - NEVER assign a tactical running style (Kaçak, Presçi, Orta Grup, Sprinter) to horses in their first 3 career races.
   - They MUST ALWAYS receive `Taktik Serbest (İlk 3 Koşusu)` (`🌱`).
   - Pace adjustment delta MUST be strictly 0 (Neutral).
   - Universal across all hipodroms and dates.

2. **Fidelity to Real Historical Race Tactics (Gerçek Geçmiş Koşu Taktiklerine Sadakat)**
   - Running style MUST reflect the horse's empirical past race in-running tracking position:
     * Frontrunner (Kaçak / Lider): ONLY horses with proven history of taking the early lead (e.g. CHARABANC, SANCAR, BATURALP CAN, AL TAN, GÖK BERK, BOLT NONSTOP, GRİNGA, MAKİNİST, BOZALAN). Never assign closer/sprinter to proven leaders!
     * Stalker (Presçi): Horses that stalk in 2nd-3rd (e.g. EFLAH, WHIZBANG, TONBİ, SUBUTAI, DOĞANTÜRKBEYİ, FELICIA STAR).
     * Midpack (Orta Grup): Horses holding 4th-6th (e.g. SPECIAL MAN, QUEIMADA GRANDE, BLACK PABLO, BALKIBEY).
     * Closer / Stretch Sprinter (Düzlük Sprinteri): Horses that wait off the pace in the rear and explode in the final 400m (e.g. SPEED QUEEN, UZBOYLU, AĞASAÇAN, AMAZING TOUCH, LETS WIN TOGETHER, LUSİA, ESCAPE PATH, LADY NAZO).
   - NEVER assign running style based on horse name (e.g. assuming "Speed" means frontrunner is strictly forbidden!).
   - NEVER infer running style from sire/dam/pedigree, and NEVER infer closer/sprinter from equipment (SK) or galop speeds. All experienced horses are mapped against verified empirical TJK race data.

3. **Pick-6 Knapsack Adaptive Budget Optimization (4-Year Macro Calibration)**
   - Vetted singles only when certainty gap >= 14, score >= 82, and class is stable (4-year macro season accuracy 71.4%).
   - Dual-coverage lock ("Kilit Ayak / Çifte Sigorta") when no banko qualifies (4-year backtest highest yield method at 38.4%).
