# AGENTS.md — Global Model & System Guidelines for ROYAL TURF

## Critical Domain Rules (At Yarışı ve Model Kuralları)

1. **≤ 3 Races Inexperienced Horses Rule (Genç Safkanlar Kuralı)**
   - NEVER assign a tactical running style (Kaçak, Presçi, Orta Grup, Sprinter) to horses in their first 3 career races.
   - They MUST ALWAYS receive `Taktik Serbest (İlk 3 Koşusu)` (`🌱`).
   - Pace adjustment delta MUST be strictly 0 (Neutral).
   - Universal across all hipodroms and dates.

2. **Fidelity to Real Historical Race Tactics (Gerçek Geçmiş Koşu Taktiklerine Sadakat)**
   - Running style MUST reflect the horse's empirical past race in-running tracking position:
     * Frontrunner (Kaçak / Lider): ONLY horses with proven history of taking the early lead (e.g. SANCAR). Never fabricate a frontrunner!
     * Stalker (Presçi): Horses that stalk in 2nd-3rd.
     * Midpack (Orta Grup): Horses holding 4th-6th.
     * Closer / Stretch Sprinter (Düzlük Sprinteri): Horses that wait off the pace in the rear and explode in the final 400m (e.g. SPEED QUEEN, UZBOYLU).
   - NEVER assign running style based on horse name (e.g. assuming "Speed" means frontrunner is strictly forbidden!).
   - NEVER infer running style from sire/dam/pedigree.

3. **Pick-6 Knapsack Adaptive Budget Optimization**
   - Vetted singles only when certainty gap >= 14, score >= 82, and class is stable.
   - Dual-coverage lock ("Kilit Ayak / Çifte Sigorta") when no banko qualifies.
