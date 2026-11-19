import json
import sqlite3
import unittest

from tjk_scraper.accurace import classify_race_style, match_horse_result
from tjk_scraper.analytics import calculate_horse_tactical_style


class TacticalAnalysisTests(unittest.TestCase):
    def setUp(self):
        self.conn = sqlite3.connect(":memory:")
        self.conn.row_factory = sqlite3.Row
        self.conn.executescript("""
            CREATE TABLE atlar (id INTEGER PRIMARY KEY, at_adi TEXT, toplam_kosu INTEGER);
            CREATE TABLE gecmis_yarislar (
                at_id INTEGER, tarih TEXT, hipodrom_sehir TEXT, kosu_no INTEGER,
                mesafe INTEGER, sira INTEGER, at_adi TEXT
            );
            CREATE TABLE accurace_race_cache (
                date_iso TEXT, city_slug TEXT, race_no INTEGER, status TEXT,
                payload_json TEXT, PRIMARY KEY(date_iso, city_slug, race_no)
            );
            CREATE TABLE turev_at_taktikleri (
                at_id INTEGER PRIMARY KEY, at_ismi TEXT, toplam_kosu_sayisi INTEGER,
                analiz_edilen_kosu_sayisi INTEGER, hesaplanan_stil TEXT, stil_kodu TEXT,
                stil_ikon TEXT, onde_gitme_orani REAL, pres_orani REAL,
                orta_orani REAL, bekleme_orani REAL, kural_aciklamasi TEXT,
                veri_durumu TEXT, hesaplanma_tarihi TEXT DEFAULT CURRENT_TIMESTAMP
            );
        """)

    def tearDown(self):
        self.conn.close()

    def _add_horse(self, starts, observations=0):
        self.conn.execute("INSERT INTO atlar VALUES (1, 'TEST HORSE', ?)", (starts,))
        for i in range(observations):
            date_iso = f"2026-10-{20 - i:02d}"
            race_data = {
                "date": date_iso,
                "city_slug": "BURSA",
                "requested_race_no": 1,
                "distance": 1400,
                "horses": [
                    {"name": "TEST HORSE", "finish": 5, "checkpoints": [
                        {"meter": 100, "position": 3},
                        {"meter": 300, "position": 2},
                        {"meter": 500, "position": 3},
                        {"meter": 700, "position": 3},
                        {"meter": 900, "position": 3},
                        {"meter": 1100, "position": 4},
                    ]},
                    *[
                        {"name": f"OTHER {n}", "finish": n, "checkpoints": [
                            {"meter": 100, "position": n}, {"meter": 300, "position": n},
                            {"meter": 500, "position": n}, {"meter": 700, "position": n},
                            {"meter": 900, "position": n}, {"meter": 1100, "position": n},
                        ]}
                        for n in range(1, 8) if n != 5
                    ],
                ],
            }
            self.conn.execute(
                "INSERT INTO gecmis_yarislar VALUES (1, ?, 'Bursa', 1, 1400, 5, 'TEST HORSE')",
                (f"{20-i:02d}.10.2026",),
            )
            self.conn.execute(
                "INSERT INTO accurace_race_cache VALUES (?, 'BURSA', 1, 'OK', ?)",
                (date_iso, json.dumps(race_data)),
            )

    def test_position_measurements_drive_style_not_finish_or_draw(self):
        horse = {
            "name": "TEST HORSE", "finish": 5,
            "checkpoints": [
                {"meter": 100, "position": 3}, {"meter": 300, "position": 2},
                {"meter": 500, "position": 3}, {"meter": 700, "position": 3},
                {"meter": 900, "position": 3}, {"meter": 1100, "position": 4},
            ],
        }
        self.assertEqual(classify_race_style(horse, 8, 1400), "PRESCI")
        self.assertIsNone(match_horse_result(
            {"horses": [horse]}, "TEST HORSE", 2
        ))

    def test_first_three_starts_remain_free_even_with_positions(self):
        self._add_horse(starts=3, observations=3)
        result = calculate_horse_tactical_style(self.conn, 1)
        self.assertEqual(result["stil_kodu"], "SERBEST")
        self.assertEqual(result["analiz_edilen_kosu_sayisi"], 3)

    def test_two_consistent_measurements_give_limited_style(self):
        self._add_horse(starts=8, observations=2)
        result = calculate_horse_tactical_style(self.conn, 1)
        self.assertEqual(result["stil_kodu"], "PRESCI")
        self.assertEqual(result["veri_durumu"], "KISMI")
        self.assertIn("Sınırlı örneklem", result["kural_aciklamasi"])

    def test_single_measurement_gives_directional_style(self):
        self._add_horse(starts=8, observations=1)
        result = calculate_horse_tactical_style(self.conn, 1)
        self.assertEqual(result["stil_kodu"], "PRESCI")
        self.assertEqual(result["veri_durumu"], "TEK_OLCUM")

    def test_conflicting_measurements_get_dominant_style(self):
        self._add_horse(starts=8, observations=2)
        row = self.conn.execute(
            "SELECT payload_json FROM accurace_race_cache WHERE date_iso = '2026-10-20'"
        ).fetchone()
        race_data = json.loads(row["payload_json"])
        race_data["horses"][0]["checkpoints"] = [
            {"meter": 100, "position": 1}, {"meter": 300, "position": 1},
            {"meter": 500, "position": 1}, {"meter": 700, "position": 1},
            {"meter": 900, "position": 1}, {"meter": 1100, "position": 1},
        ]
        self.conn.execute(
            "UPDATE accurace_race_cache SET payload_json = ? WHERE date_iso = '2026-10-20'",
            (json.dumps(race_data),),
        )
        result = calculate_horse_tactical_style(self.conn, 1)
        self.assertEqual(result["stil_kodu"], "KACAK")
        self.assertEqual(result["veri_durumu"], "DEGISKEN")
        self.assertIn("değişkenlik", result["kural_aciklamasi"])

    def test_repeated_measured_positions_produce_empirical_style(self):
        self._add_horse(starts=8, observations=4)
        result = calculate_horse_tactical_style(self.conn, 1)
        self.assertEqual(result["stil_kodu"], "PRESCI")
        self.assertEqual(result["analiz_edilen_kosu_sayisi"], 4)
        self.assertIn("resmî olmayan", result["kural_aciklamasi"])


if __name__ == "__main__":
    unittest.main()


class SurfaceAptitudeTests(unittest.TestCase):
    def setUp(self):
        self.conn = sqlite3.connect(":memory:")
        self.conn.row_factory = sqlite3.Row
        self.conn.executescript("""
            CREATE TABLE gecmis_yarislar (
                at_id INTEGER, pist_turu TEXT, sira INTEGER
            );
        """)

    def tearDown(self):
        self.conn.close()

    def _runs(self, surface, ranks):
        for rank in ranks:
            self.conn.execute(
                "INSERT INTO gecmis_yarislar VALUES (1, ?, ?)", (surface, rank)
            )

    def test_kum_specialist_gets_positive_delta(self):
        from tjk_scraper.scraper import build_pist_aptitude
        self._runs("Kum", [1, 2])
        result = build_pist_aptitude(self.conn, 1, False, "Kum", "TOROK")
        self.assertEqual(result["delta"], 4)
        self.assertEqual(result["dirtStats"]["runs"], 2)
        self.assertEqual(result["dirtStats"]["wins"], 1)

    def test_young_horse_surface_delta_is_zero(self):
        from tjk_scraper.scraper import build_pist_aptitude
        self._runs("Kum", [1, 1, 2])
        result = build_pist_aptitude(self.conn, 1, True, "Kum", "")
        self.assertEqual(result["delta"], 0)
        self.assertEqual(result["dirtStats"]["runs"], 3)

    def test_synthetic_horse_moving_to_dirt_gets_penalty(self):
        from tjk_scraper.scraper import build_pist_aptitude
        self._runs("Sentetik", [1, 2, 3])
        result = build_pist_aptitude(self.conn, 1, False, "Kum", "")
        self.assertEqual(result["delta"], -5)
        self.assertEqual(result["synStats"]["runs"], 3)

    def test_synthetic_horse_with_kum_pedigree_and_kacak_exempt_from_kickback(self):
        from tjk_scraper.scraper import build_pist_aptitude
        self._runs("Sentetik", [1, 2, 3])
        # Kum pedigree (OVA) + Kaçak running style -> 0 delta, kickback exemption
        result = build_pist_aptitude(self.conn, 1, False, "Kum", sire_name="OVA", dam_sire="SANCAKBEYI", running_style="Kaçak / Lider")
        self.assertEqual(result["delta"], 0)
        self.assertIn("Kickback Muafiyeti", result["badge"])

    def test_synthetic_horse_with_kum_pedigree_and_pres(self):
        from tjk_scraper.scraper import build_pist_aptitude
        self._runs("Sentetik", [1, 2, 3])
        # Kum pedigree (HABERBATUR) + Pres -> -1 delta
        result = build_pist_aptitude(self.conn, 1, False, "Kum", sire_name="HABERBATUR", dam_sire="", running_style="Presçi")
        self.assertEqual(result["delta"], -1)

    def test_synthetic_horse_with_kum_pedigree_and_sprinter(self):
        from tjk_scraper.scraper import build_pist_aptitude
        self._runs("Sentetik", [1, 2, 3])
        # Kum pedigree (ÖZGÜNHAN) + Sprinter -> -2 delta (kickback riski var ama genetik kum güçlü)
        result = build_pist_aptitude(self.conn, 1, False, "Kum", sire_name="ÖZGÜNHAN", dam_sire="ALTAHA", running_style="Düzlük Sprinteri")
        self.assertEqual(result["delta"], -2)
        self.assertIn("Kickback Riski", result["badge"])

    def test_no_history_stays_neutral(self):
        from tjk_scraper.scraper import build_pist_aptitude
        result = build_pist_aptitude(self.conn, 1, False, "Kum", "")
        self.assertEqual(result["delta"], 0)
        self.assertEqual(result["dirtStats"]["runs"], 0)


class AltiliPackageTests(unittest.TestCase):
    def test_two_official_package_markers_are_parsed(self):
        from tjk_scraper.parser import parse_altili_package_starts
        html = """
        <div class="races-panes">
          <div><div>1. Koşu 18.00</div>
            <div class="bahisTipiGridContainer"><div class="bahisTipiCard">
              <h4>1. 6'LI GANYAN Bu koşudan başlar</h4>
            </div></div>
          </div>
          <div><div>2. Koşu 18.30</div></div>
          <div><div>3. Koşu 19.00</div>
            <div class="bahisTipiGridContainer"><div class="bahisTipiCard">
              <h4>2. 6'LI GANYAN Bu koşudan başlar</h4>
            </div></div>
          </div>
        </div>
        """
        self.assertEqual(
            parse_altili_package_starts(html),
            [
                {"paketNo": 1, "baslangicKosu": 1},
                {"paketNo": 2, "baslangicKosu": 3},
            ],
        )

    def test_single_package_marker_is_parsed(self):
        from tjk_scraper.parser import parse_altili_package_starts
        html = """
        <div class="races-panes">
          <div><div>2. Koşu 18.30</div>
            <div class="bahisTipiGridContainer"><div class="bahisTipiCard">
              <h4>1. 6'LI GANYAN Bu koşudan başlar</h4>
            </div></div>
          </div>
        </div>
        """
        self.assertEqual(
            parse_altili_package_starts(html),
            [{"paketNo": 1, "baslangicKosu": 2}],
        )

    def test_single_package_without_number_is_parsed(self):
        from tjk_scraper.parser import parse_altili_package_starts
        html = """
        <div class="races-panes">
          <div><div>2. Koşu 18.30</div>
            <div class="bahisTipiGridContainer"><div class="bahisTipiCard">
              <h4>6'LI GANYAN Bu koşudan başlar</h4>
            </div></div>
          </div>
        </div>
        """
        self.assertEqual(
            parse_altili_package_starts(html),
            [{"paketNo": 1, "baslangicKosu": 2}],
        )

    def test_no_marker_returns_empty(self):
        from tjk_scraper.parser import parse_altili_package_starts
        self.assertEqual(parse_altili_package_starts("<div>1. Koşu 18.00</div>"), [])
