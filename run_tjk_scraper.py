#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ROYAL TURF — TJK Resmî Veri Toplama ve Analiz Veritabanı Servisi
Çalıştırma:
    python run_tjk_scraper.py                 (Bugün ve Yarın için tam çekim)
    python run_tjk_scraper.py --target today  (Sadece bugün)
    python run_tjk_scraper.py --target tomorrow (Sadece yarın)
    python run_tjk_scraper.py --daemon        (Her gün saat 08:00'de otomatik çalışan servis)
"""

import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from tjk_scraper.main import main

if __name__ == "__main__":
    main()
