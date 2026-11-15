/**
 * TJK AT YARIŞÇILIĞI PEDİGRİ & KAN HATTI ANALİZ CANAVARI
 * 
 * Türk at yarışçılığındaki tüm büyük aygırlar (sire), kısrak babaları (broodmare sire),
 * dozaj profilleri (dosage index), kan hattı eşleşmeleri (nicking) ve
 * zemin/mesafe yatkınlıklarını derinlemesine hesaplayan genetik analiz motoru.
 */

class PedigreeEngine {
  constructor() {
    // Türkiye'deki Popüler Aygırlar ve Genetik Profilleri
    this.sires = {
      // ===== İNGİLİZ AYGIRLARI =====
      'NATIVE KHAN': {
        hatt: 'Danzig / Danehill',
        turfScore: 94,
        dirtScore: 68,
        syntheticScore: 88,
        optimalMin: 1200,
        optimalMax: 1800,
        dosajDI: 2.50,
        dosajCD: 0.72,
        tip: 'Sprint / Mil Çim Canavarı',
        basariYuzdesi: 19.8,
        ikiYasliBasari: 22.4,
        agirPistYatkinligi: true
      },
      'TOROK': {
        hatt: "Sadler's Wells / Singspiel",
        turfScore: 92,
        dirtScore: 82,
        syntheticScore: 85,
        optimalMin: 1400,
        optimalMax: 2400,
        dosajDI: 1.40,
        dosajCD: 0.35,
        tip: 'Klasik / Dayanıklı Mesafe Sprinterı',
        basariYuzdesi: 18.2,
        ikiYasliBasari: 16.5,
        agirPistYatkinligi: true
      },
      'BODEMEISTER': {
        hatt: "Unbridled / Empire Maker",
        turfScore: 78,
        dirtScore: 95,
        syntheticScore: 92,
        optimalMin: 1400,
        optimalMax: 2100,
        dosajDI: 2.10,
        dosajCD: 0.60,
        tip: 'Sert Kum & Sentetik Hükümdarı',
        basariYuzdesi: 20.5,
        ikiYasliBasari: 21.0,
        agirPistYatkinligi: true
      },
      'VICTORY GALLOP': {
        hatt: "Fappiano / Cryptoclearance",
        turfScore: 88,
        dirtScore: 96,
        syntheticScore: 90,
        optimalMin: 1600,
        optimalMax: 2400,
        dosajDI: 1.15,
        dosajCD: 0.22,
        tip: 'Efsane Dayanıklılık & Ağır Pist Kralı',
        basariYuzdesi: 21.4,
        ikiYasliBasari: 14.8,
        agirPistYatkinligi: true
      },
      'LUXOR': {
        hatt: "Habitat / Distant Relative",
        turfScore: 92,
        dirtScore: 75,
        syntheticScore: 90,
        optimalMin: 1200,
        optimalMax: 1600,
        dosajDI: 3.20,
        dosajCD: 0.85,
        tip: 'Sürat & Erken Patlama Gücü',
        basariYuzdesi: 17.6,
        ikiYasliBasari: 19.2,
        agirPistYatkinligi: false
      },
      'MENDIP': {
        hatt: "Storm Cat / Harlan's Holiday",
        turfScore: 72,
        dirtScore: 94,
        syntheticScore: 88,
        optimalMin: 1200,
        optimalMax: 1700,
        dosajDI: 2.80,
        dosajCD: 0.78,
        tip: 'Patlayıcı Kum Gücü',
        basariYuzdesi: 18.9,
        ikiYasliBasari: 20.1,
        agirPistYatkinligi: true
      },
      'DAREDEVIL': {
        hatt: "Southern Halo / More Than Ready",
        turfScore: 84,
        dirtScore: 91,
        syntheticScore: 86,
        optimalMin: 1200,
        optimalMax: 1800,
        dosajDI: 2.60,
        dosajCD: 0.70,
        tip: 'Erken Gelişen Tay Sürati',
        basariYuzdesi: 19.2,
        ikiYasliBasari: 24.0,
        agirPistYatkinligi: true
      },
      'KANEKO': {
        hatt: "Pivotist / Longleat",
        turfScore: 95,
        dirtScore: 84,
        syntheticScore: 87,
        optimalMin: 1400,
        optimalMax: 2400,
        dosajDI: 1.30,
        dosajCD: 0.30,
        tip: 'Yerli Efsane / Yumuşak Çim Uzmanı',
        basariYuzdesi: 20.8,
        ikiYasliBasari: 17.5,
        agirPistYatkinligi: true
      },
      'LION HEART': {
        hatt: "Storm Cat / Tale of the Cat",
        turfScore: 82,
        dirtScore: 90,
        syntheticScore: 85,
        optimalMin: 1000,
        optimalMax: 1500,
        dosajDI: 3.50,
        dosajCD: 0.90,
        tip: 'Öncü Kaçak & Kısa Mesafe Bombası',
        basariYuzdesi: 16.8,
        ikiYasliBasari: 21.5,
        agirPistYatkinligi: false
      },
      'SUPER SAVER': {
        hatt: "Maria's Mon / Wavering Monarch",
        turfScore: 80,
        dirtScore: 92,
        syntheticScore: 89,
        optimalMin: 1300,
        optimalMax: 1900,
        dosajDI: 2.00,
        dosajCD: 0.55,
        tip: 'Kentucky Derby Hattı / Dengeli Güç',
        basariYuzdesi: 19.0,
        ikiYasliBasari: 19.8,
        agirPistYatkinligi: true
      },

      // ===== ARAP AYGIRLARI =====
      'KAIZBERT': {
        hatt: 'Rus Kan Hattı (Priwet / Koheilan)',
        turfScore: 98,
        dirtScore: 99,
        syntheticScore: 97,
        optimalMin: 1200,
        optimalMax: 2400,
        dosajDI: 1.80,
        dosajCD: 0.45,
        tip: 'Arap Yarışçılığının Tartışmasız Kralı',
        basariYuzdesi: 32.5,
        ikiYasliBasari: 34.0,
        agirPistYatkinligi: true
      },
      'ÖZGÜNHAN': {
        hatt: 'Hilalüzzaman / Özgün',
        turfScore: 95,
        dirtScore: 92,
        syntheticScore: 96,
        optimalMin: 1400,
        optimalMax: 2400,
        dosajDI: 1.25,
        dosajCD: 0.28,
        tip: 'Karakterli Şampiyon / Uzun Mesafe Gücü',
        basariYuzdesi: 24.2,
        ikiYasliBasari: 18.0,
        agirPistYatkinligi: true
      },
      'TURBO': {
        hatt: 'Berk / Demirkazık',
        turfScore: 93,
        dirtScore: 94,
        syntheticScore: 91,
        optimalMin: 1200,
        optimalMax: 1800,
        dosajDI: 2.90,
        dosajCD: 0.75,
        tip: 'Yüksek Sürat & Kaçış Ekstraktı',
        basariYuzdesi: 23.0,
        ikiYasliBasari: 26.5,
        agirPistYatkinligi: true
      },
      'TAMERİNOĞLU': {
        hatt: 'Kuruş / Tunay',
        turfScore: 94,
        dirtScore: 88,
        syntheticScore: 90,
        optimalMin: 1600,
        optimalMax: 2400,
        dosajDI: 1.10,
        dosajCD: 0.20,
        tip: 'Klasik G1 Koşu Uzmanı',
        basariYuzdesi: 21.0,
        ikiYasliBasari: 15.0,
        agirPistYatkinligi: true
      },
      'CANKARDEŞLER': {
        hatt: 'Yalaz / Karambol',
        turfScore: 92,
        dirtScore: 90,
        syntheticScore: 91,
        optimalMin: 1200,
        optimalMax: 1900,
        dosajDI: 2.10,
        dosajCD: 0.58,
        tip: 'Erken Sprint & Esnek Zemin',
        basariYuzdesi: 20.4,
        ikiYasliBasari: 22.0,
        agirPistYatkinligi: true
      }
    };

    // Popüler Kısrak Babaları (Broodmare Sire)
    this.broodmareSires = {
      'INVINCIBLE SPIRIT': { stamineBonus: 10, sprintBonus: 25, agirPist: true },
      'DEHERE': { stamineBonus: 15, sprintBonus: 20, agirPist: false },
      'PERFECT STORM': { stamineBonus: 22, sprintBonus: 15, agirPist: true },
      'UNACCOUNTED FOR': { stamineBonus: 30, sprintBonus: 10, agirPist: true },
      'SRI PEKAN': { stamineBonus: 20, sprintBonus: 18, agirPist: true },
      'HABERBATUR': { stamineBonus: 28, sprintBonus: 12, agirPist: true },
      'KAIZBERT': { stamineBonus: 32, sprintBonus: 30, agirPist: true },
      'ÖZGÜNHAN': { stamineBonus: 30, sprintBonus: 15, agirPist: true },
      'BİLGİN': { stamineBonus: 25, sprintBonus: 14, agirPist: true },
      'DEMİRKAZIK': { stamineBonus: 24, sprintBonus: 20, agirPist: true }
    };
  }

  /**
   * Safkanın tüm genetik parametrelerini ve zemin/mesafe uyum puanını hesaplar
   */
  evaluatePedigree(baba, anne, kisrakBabasi, pist, mesafe, irk = 'İngiliz') {
    const sireName = (baba || '').toUpperCase().trim();
    const bmsName = (kisrakBabasi || '').toUpperCase().trim();

    const sireProfile = this.sires[sireName] || this.getGenericSire(irk);
    const bmsProfile = this.broodmareSires[bmsName] || { stamineBonus: 15, sprintBonus: 15, agirPist: false };

    // 1. Zemin Yatkınlığı (0 - 100)
    let trackSuitability = 75;
    const p = (pist || '').toLowerCase();
    if (p.includes('çim')) {
      trackSuitability = sireProfile.turfScore;
    } else if (p.includes('kum')) {
      trackSuitability = sireProfile.dirtScore;
    } else if (p.includes('sentetik')) {
      trackSuitability = sireProfile.syntheticScore;
    }

    // 2. Mesafe Uyumu (0 - 100)
    const m = parseInt(mesafe) || 1400;
    let distanceSuitability = 80;
    if (m >= sireProfile.optimalMin && m <= sireProfile.optimalMax) {
      distanceSuitability = 95; // İdeal koridorda
    } else if (m < sireProfile.optimalMin) {
      const diff = sireProfile.optimalMin - m;
      distanceSuitability = Math.max(50, 90 - (diff / 20));
    } else {
      const diff = m - sireProfile.optimalMax;
      distanceSuitability = Math.max(45, 90 - (diff / 25));
    }

    // Kısrak babası dayanıklılık desteği
    if (m >= 1800 && bmsProfile.stamineBonus >= 20) {
      distanceSuitability = Math.min(100, distanceSuitability + 10);
    }

    // 3. Kan Hattı Eşleşme Notu (Nicking Grade)
    let nickingGrade = 'A+';
    let nickingScore = 88;
    if (sireName.includes('KAIZBERT') || sireName.includes('VICTORY GALLOP') || sireName.includes('BODEMEISTER')) {
      nickingGrade = 'A+++';
      nickingScore = 98;
    } else if (sireProfile.basariYuzdesi >= 20) {
      nickingGrade = 'A++';
      nickingScore = 92;
    }

    // 4. Dozaj Profili
    const dosage = {
      DI: sireProfile.dosajDI,
      CD: sireProfile.dosajCD,
      profile: sireProfile.dosajDI > 2.5 ? 'Sprint Odaklı (Süratli)' : sireProfile.dosajDI < 1.5 ? 'Stamina / Dayanıklılık Odaklı' : 'Dengeli Klasik'
    };

    // 5. Nihai Orijin Puanı (100 Üzerinden)
    const finalScore = Math.round(
      (trackSuitability * 0.45) +
      (distanceSuitability * 0.40) +
      (nickingScore * 0.15)
    );

    return {
      sire: sireName,
      dam: anne || 'Bilinmiyor',
      broodmareSire: bmsName,
      sireLine: sireProfile.hatt,
      sireType: sireProfile.tip,
      sireWinRate: `%${sireProfile.basariYuzdesi}`,
      trackSuitability,
      distanceSuitability,
      nickingGrade,
      dosage,
      finalScore: Math.min(100, Math.max(30, finalScore))
    };
  }

  getGenericSire(irk) {
    if ((irk || '').toLowerCase().includes('arap')) {
      return {
        hatt: 'Arap Geleneksel Kan Hattı',
        turfScore: 85,
        dirtScore: 85,
        syntheticScore: 85,
        optimalMin: 1200,
        optimalMax: 2000,
        dosajDI: 2.0,
        dosajCD: 0.5,
        tip: 'Genel Arap Karakteri',
        basariYuzdesi: 16.0,
        ikiYasliBasari: 15.0,
        agirPistYatkinligi: true
      };
    }
    return {
      hatt: 'Northern Dancer / Mr. Prospector',
      turfScore: 82,
      dirtScore: 82,
      syntheticScore: 82,
      optimalMin: 1200,
      optimalMax: 1900,
      dosajDI: 2.2,
      dosajCD: 0.6,
      tip: 'Standart Safkan İngiliz Hattı',
      basariYuzdesi: 15.0,
      ikiYasliBasari: 16.0,
      agirPistYatkinligi: false
    };
  }
}

module.exports = new PedigreeEngine();
