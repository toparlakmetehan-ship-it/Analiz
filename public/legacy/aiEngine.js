/**
 * TJK AI ANALİZ VE TAHMİN MOTORU (Comprehensive Mathematical Model)
 * 
 * Türk at yarışçılığındaki tüm mikro ve makro faktörleri analiz eden
 * 100 üzerinden Güç İndeksi, Pace Simülasyonu, Galop ve Bomba Radarı motoru.
 */

const pedigreeEngine = require('./pedigreeEngine');

class TjkAiEngine {
  constructor() {
    this.weights = {
      pistMesafe: 25,
      idmanGalop: 20,
      tempoPace: 15,
      jokeyAntrenor: 15,
      sikletKilo: 10,
      pedigriKanHatti: 10,
      takiKomiser: 5
    };
  }

  analyzeRace(race) {
    const horses = race.atlar || [];
    if (!horses.length) return { analyzedHorses: [], paceScenario: {}, recommendations: {} };

    // 1. Koşu Temposu (Pace Scenario)
    const paceScenario = this.calculatePaceScenario(horses, race);

    // 2. Her at için derin genetik, galop, tempo ve hız puanı hesapla
    const analyzedHorses = horses.map(horse => {
      // Pedigri Analiz Canavarı
      const pedigreeDetails = pedigreeEngine.evaluatePedigree(
        horse.baba,
        horse.anne,
        horse.kisrak_babasi,
        race.pist,
        race.mesafe,
        horse.irk
      );

      const breakdown = this.scoreHorse(horse, race, paceScenario, pedigreeDetails);
      const totalScore = Math.min(100, Math.max(15, Math.round(
        breakdown.pistMesafe +
        breakdown.idmanGalop +
        breakdown.tempoPace +
        breakdown.jokeyAntrenor +
        breakdown.sikletKilo +
        breakdown.pedigriKanHatti +
        breakdown.takiKomiser
      )));

      // Beyer / Hız Puanı (Speed Figure)
      const speedFigure = this.calculateSpeedFigure(horse, race);

      // 6 Boyutlu Radar Metrikleri (At Röntgeni için)
      const radarMetrics = {
        hiz: speedFigure,
        dayaniklilik: pedigreeDetails.distanceSuitability,
        tempo: Math.round(breakdown.tempoPace * (100 / this.weights.tempoPace)),
        galop: Math.round(breakdown.idmanGalop * (100 / this.weights.idmanGalop)),
        orijin: pedigreeDetails.finalScore,
        jokey: Math.round(breakdown.jokeyAntrenor * (100 / this.weights.jokeyAntrenor))
      };

      return {
        ...horse,
        aiScore: totalScore,
        speedFigure,
        pedigreeDetails,
        radarMetrics,
        scoreBreakdown: breakdown,
        paceCategory: horse.kosu_stili || 'Orta Grup',
        badges: []
      };
    });

    // Puanlara göre azalan sırada sırala
    analyzedHorses.sort((a, b) => b.aiScore - a.aiScore);

    // Kazanma yüzdesi ve rozetler
    const totalScoreSum = analyzedHorses.reduce((acc, h) => acc + h.aiScore, 0);
    analyzedHorses.forEach((h, idx) => {
      h.sira = idx + 1;
      h.winProbability = Math.round((h.aiScore / (totalScoreSum || 1)) * 100);
      this.assignBadges(h, paceScenario, analyzedHorses);
    });

    const banko = analyzedHorses.find(h => h.badges.includes('BANKO')) || (analyzedHorses[0].aiScore >= 80 ? analyzedHorses[0] : null);
    const bombalar = analyzedHorses.filter(h => h.badges.includes('BOMBA_RADAR'));
    const surprizler = analyzedHorses.filter(h => h.badges.includes('SURPRIZ_ADAYI'));

    return {
      raceId: race.id,
      kategori: race.grup_sinifi || 'Şartlı',
      paceScenario,
      analyzedHorses,
      recommendations: {
        banko: banko ? { no: banko.no, isim: banko.isim, skor: banko.aiScore, agf: banko.agf_orani } : null,
        bombalar: bombalar.map(b => ({ no: b.no, isim: b.isim, skor: b.aiScore, agf: b.agf_orani })),
        surprizler: surprizler.map(s => ({ no: s.no, isim: s.isim, skor: s.aiScore, agf: s.agf_orani })),
        ilkUc: analyzedHorses.slice(0, 3).map(h => ({ no: h.no, isim: h.isim, skor: h.aiScore }))
      }
    };
  }

  calculatePaceScenario(horses, race) {
    const frontRunners = horses.filter(h => h.kosu_stili === 'Lider/Kaçak' || h.kosu_stili === 'Kaçak');
    const pressers = horses.filter(h => h.kosu_stili === 'Presçi');
    const closers = horses.filter(h => h.kosu_stili === 'Bekleme/Sprint' || h.kosu_stili === 'Sprinter');

    let tempoDescription = 'Dengeli Tempo';
    let tempoCode = 'NORMAL';
    let closerAdvantage = 1.0;
    let frontAdvantage = 1.0;

    if (frontRunners.length >= 3) {
      tempoDescription = 'Çok Sert / Yüksek Tempo (Önde Erken Kapışma)';
      tempoCode = 'VERY_FAST';
      closerAdvantage = 1.25;
      frontAdvantage = 0.75;
    } else if (frontRunners.length === 2) {
      tempoDescription = 'Tempolu Yarış (Presçi ve Kaçaklar Baskıda)';
      tempoCode = 'FAST';
      closerAdvantage = 1.10;
      frontAdvantage = 0.90;
    } else if (frontRunners.length === 1) {
      tempoDescription = 'Düşük / Rölanti Tempo (Önde Boş Kalan At Avantajlı)';
      tempoCode = 'SLOW';
      closerAdvantage = 0.85;
      frontAdvantage = 1.30;
    } else {
      tempoDescription = 'Ağır / Taktiksel Koşu (Lidersiz Koşu)';
      tempoCode = 'TACTICAL';
      closerAdvantage = 1.0;
      frontAdvantage = 1.1;
    }

    return {
      tempoCode,
      tempoDescription,
      frontRunnersCount: frontRunners.length,
      pressersCount: pressers.length,
      closersCount: closers.length,
      closerAdvantage,
      frontAdvantage,
      leadHorse: frontRunners.length === 1 ? frontRunners[0].isim : (frontRunners[0]?.isim || null)
    };
  }

  calculateSpeedFigure(horse, race) {
    let base = 85;
    const g = horse.son_galop || {};
    const son400 = parseFloat(g.son_400) || 25.0;
    if (son400 <= 23.5) base += 12;
    else if (son400 <= 24.2) base += 8;
    else if (son400 <= 25.0) base += 4;
    else if (son400 > 27.0) base -= 6;

    if (horse.jokey_kazanma_orani >= 20) base += 5;
    return Math.min(108, Math.max(65, Math.round(base)));
  }

  scoreHorse(horse, race, paceScenario, pedigreeDetails) {
    let pistScore = 15;
    const pist = (race.pist || '').toLowerCase();
    const olcum = parseFloat(race.pist_olcumu) || 3.3;

    if (pist.includes('çim')) {
      if (olcum >= 3.8) {
        if (horse.agir_pist_yatkinligi || pedigreeDetails.sireType.includes('Dayanıklı')) pistScore += 7;
        else pistScore -= 3;
      } else {
        pistScore += 5;
      }
    } else if (pist.includes('kum')) {
      if (race.pist_durumu?.includes('Islak') || race.pist_durumu?.includes('Sulu')) {
        if (horse.sulu_kum_yatkinligi) pistScore += 7;
      } else {
        pistScore += 5;
      }
    } else if (pist.includes('sentetik')) {
      if (horse.sentetik_yatkinligi) pistScore += 6;
    }

    const kulvar = parseInt(horse.kulvar) || 1;
    const mesafe = parseInt(race.mesafe) || 1400;
    if (mesafe <= 1200 && kulvar <= 4) pistScore += 4;
    else if (mesafe >= 2000 && kulvar >= 9) pistScore -= 2;

    const finalPistMesafe = Math.min(this.weights.pistMesafe, Math.max(5, pistScore));

    let galopScore = 10;
    const galop = horse.son_galop || {};
    const durum = (galop.durum_kodu || '').toUpperCase();
    if (durum.includes('ÇR') || durum === 'ÇOK RAHAT') galopScore += 5;
    else if (durum.includes('R') || durum === 'RAHAT') galopScore += 3;
    else if (durum.includes('HÇ')) galopScore += 1;
    else if (durum.includes('Ç') || durum === 'ÇALIŞARAK') galopScore -= 2;

    const son400 = parseFloat(galop.son_400) || 0;
    const irk = (horse.irk || 'İngiliz').toLowerCase();
    if (son400 > 0) {
      if (irk.includes('arap')) {
        if (son400 <= 26.0) galopScore += 5;
        else if (son400 <= 27.2) galopScore += 3;
        else if (son400 > 29.0) galopScore -= 3;
      } else {
        if (son400 <= 24.0) galopScore += 5;
        else if (son400 <= 25.0) galopScore += 3;
        else if (son400 > 26.5) galopScore -= 3;
      }
    }

    if (galop.idman_jokeyi && horse.jokey && galop.idman_jokeyi.toLowerCase() === horse.jokey.toLowerCase()) {
      galopScore += 3;
    }

    const dinlenme = parseInt(horse.dinlenme_gunu) || 20;
    if (dinlenme >= 14 && dinlenme <= 35) galopScore += 2;
    else if (dinlenme > 120) galopScore -= 4;

    const finalIdmanGalop = Math.min(this.weights.idmanGalop, Math.max(3, galopScore));

    let paceScore = 10;
    const stil = horse.kosu_stili || 'Orta Grup';
    if (stil === 'Lider/Kaçak' || stil === 'Kaçak') paceScore = paceScore * paceScenario.frontAdvantage;
    else if (stil === 'Bekleme/Sprint' || stil === 'Sprinter') paceScore = paceScore * paceScenario.closerAdvantage;
    else paceScore += 2;

    const finalTempoPace = Math.min(this.weights.tempoPace, Math.max(3, Math.round(paceScore)));

    let jokeyScore = 8;
    const jokeyWinRate = parseFloat(horse.jokey_kazanma_orani) || 12;
    if (jokeyWinRate >= 20) jokeyScore += 5;
    else if (jokeyWinRate >= 14) jokeyScore += 3;
    else if (jokeyWinRate < 7) jokeyScore -= 2;

    if (horse.jokey_degisimi_upgrade) jokeyScore += 4;
    const finalJokey = Math.min(this.weights.jokeyAntrenor, Math.max(2, jokeyScore));

    let kiloScore = 6;
    const kiloFarki = parseFloat(horse.kilo_farki) || 0;
    if (kiloFarki <= -2) kiloScore += 3;
    else if (kiloFarki >= 2.5) kiloScore -= 3;

    if (horse.apranti_indirimi && (parseFloat(horse.siklet) || 56) <= 52) kiloScore += 2;
    const finalKilo = Math.min(this.weights.sikletKilo, Math.max(1, kiloScore));

    const finalPedigri = Math.min(this.weights.pedigriKanHatti, Math.max(2, Math.round((pedigreeDetails.finalScore / 100) * 10)));

    let takiScore = 2;
    if (horse.taki_degisimi_pozitif) takiScore += 2;
    if (horse.komiser_raporu_magduru) takiScore += 2;
    const finalTaki = Math.min(this.weights.takiKomiser, Math.max(0, takiScore));

    return {
      pistMesafe: finalPistMesafe,
      idmanGalop: finalIdmanGalop,
      tempoPace: finalTempoPace,
      jokeyAntrenor: finalJokey,
      sikletKilo: finalKilo,
      pedigriKanHatti: finalPedigri,
      takiKomiser: finalTaki
    };
  }

  assignBadges(horse, paceScenario, allHorses) {
    const agf = parseFloat(horse.agf_orani) || 10;

    if (horse.sira === 1 && horse.aiScore >= 80 && (horse.aiScore - allHorses[1]?.aiScore >= 7)) {
      horse.badges.push('BANKO');
    } else if (horse.sira === 1 && horse.aiScore >= 75) {
      horse.badges.push('ALTERNATIF_BANKO');
    }

    if (agf <= 10 && horse.sira <= 3 && horse.aiScore >= 62) {
      horse.badges.push('BOMBA_RADAR');
    } else if (agf <= 8 && horse.aiScore >= 55) {
      horse.badges.push('SURPRIZ_ADAYI');
    }

    if (horse.scoreBreakdown.idmanGalop >= 17) {
      horse.badges.push('GALOP_YILDIZI');
    }

    if (horse.kosu_stili === 'Bekleme/Sprint' && paceScenario.tempoCode === 'VERY_FAST') {
      horse.badges.push('TEMPO_LEHINE');
    } else if ((horse.kosu_stili === 'Lider/Kaçak' || horse.kosu_stili === 'Kaçak') && paceScenario.tempoCode === 'SLOW') {
      horse.badges.push('TEMPO_LEHINE');
    } else if ((horse.kosu_stili === 'Lider/Kaçak' || horse.kosu_stili === 'Kaçak') && paceScenario.tempoCode === 'VERY_FAST') {
      horse.badges.push('TEMPO_RISKI');
    }

    if (horse.jokey_degisimi_upgrade) {
      horse.badges.push('HEDEF_YARIS');
    }

    if (horse.komiser_raporu_magduru) {
      horse.badges.push('KOMISER_RAPORU');
    }

    if (horse.pedigreeDetails?.nickingGrade === 'A+++') {
      horse.badges.push('ORIJIN_DEV');
    }
  }
}

module.exports = new TjkAiEngine();
