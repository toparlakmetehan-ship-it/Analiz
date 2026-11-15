# AGENTS.md — Global Model & System Guidelines for ROYAL TURF

## Critical Domain Rules (At Yarışı ve Model Kuralları)

1. **≤ 3 Races Inexperienced Horses Rule (Genç Safkanlar Kuralı)**
   - NEVER assign a tactical running style (Kaçak, Presçi, Orta Grup, Sprinter) to horses in their first 3 career races or 2-year-olds without established racing history.
   - They MUST ALWAYS receive `Taktik Serbest (İlk 3 Koşusu)` (`🌱`).
   - Pace adjustment delta MUST be strictly 0 (Neutral).
   - This rule is universally enforced across all races, hipodroms, and dates.

2. **No Pedigree-Based Running Style Assignment (Soy Kütüğünden Gidişat Yasağı)**
   - Never infer running style from sire (`baba`), dam (`anne`), or dam sire (`kisrak_babasi`).
   - Only evaluate the horse's empirical past race running lines (`runningLine`), weighted towards recent races.
   - Never hardcode horse names in running style regex rules.

3. **Pick-6 Knapsack Adaptive Budget Optimization**
   - Vetted singles only when certainty gap >= 14 and class is stable.
   - Dual-coverage lock ("Kilit Ayak / Çifte Sigorta") when no banko qualifies.
