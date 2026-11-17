const fs = require('fs');
const b = require('../public/data/bulten_bugun.json');

function isYoungInexperiencedHorse(at) {
  if (!at) return false;
  if (at.isFirstTimeStarter) return true;
  if (at.careerSummary && typeof at.careerSummary.toplamKosu === 'number') {
    return at.careerSummary.toplamKosu <= 3;
  }
  const pastClean = (at.son_yarislar || '').replace(/[^0-9]/g, '');
  return pastClean.length <= 3;
}

function estimateRacePace(kosu) {
  const atlar = (kosu.atlar || []).filter(h => !h.isKosmaz);
  const kacaklar = atlar.filter(h => (h.kosu_stili || '').includes('Kaçak'));
  const presciler = atlar.filter(h => (h.kosu_stili || '').includes('Pres'));
  if (kacaklar.length >= 2 || (kacaklar.length === 1 && presciler.length >= 2)) return { type: 'FAST' };
  if (kacaklar.length === 1 && presciler.length <= 1) return { type: 'SLOW' };
  if (kacaklar.length === 0 && presciler.length <= 2) return { type: 'SLOW' };
  return { type: 'BALANCED' };
}

function calculatePowerIndexCalibrated(horse, raceHorses = []) {
  let formScore = 55;
  const past = horse.son_yarislar || '';
  if (past) {
    let pts = 0, counted = 0;
    for (let i = 0; i < Math.min(past.length, 5); i++) {
      const ch = past[i];
      if (ch === '1') pts += 98;
      else if (ch === '2') pts += 85;
      else if (ch === '3') pts += 72;
      else if (ch === '4') pts += 60;
      else if (ch === '5') pts += 46;
      else pts += 20;
      counted++;
    }
    formScore = Math.round(counted > 0 ? pts / counted : 55);
  }
  if (horse.accelerationType && horse.accelerationType.includes('Hızlanan')) formScore = Math.min(99, formScore + 6);

  let sireScore = 65;
  const eliteSires = ['NATIVE KHAN', 'TOROK', 'LUXOR', 'VICTORY GALLOP', 'PAPA CLEM', 'KANEKO', 'DAREDEVIL', 'BODEMEISTER', 'KAIZBERT', 'ÖZHABER', 'SERHANTAY', 'MYBOYCHARLIE', 'TİZWAY', 'LION HEART', 'MENDIP', "FAST 'N' FAMOUS", 'JOKER'];
  const eliteBroodmare = ['BATYSKAF', 'UNACCOUNTED FOR', 'ALWAY A CLASSIC', 'SRI PEKAN', 'ROYAL ABJAR', 'HABERBATUR', 'DEMİRKAZIK', 'BİRADER'];
  const sireMatch = eliteSires.some(s => (horse.baba || '').toUpperCase().includes(s));
  const mareSireMatch = eliteBroodmare.some(s => (horse.kisrak_babasi || '').toUpperCase().includes(s));
  if (sireMatch && mareSireMatch) sireScore = 95;
  else if (sireMatch) sireScore = 88;
  else if (mareSireMatch) sireScore = 80;

  let siblingScore = 65;
  if (horse.anne_kardesleri && horse.anne_kardesleri.score) siblingScore = horse.anne_kardesleri.score;

  let surfaceDelta = 0;
  if (horse.pist_aptitude_analizi && horse.pist_aptitude_analizi.delta !== undefined) surfaceDelta = horse.pist_aptitude_analizi.delta;
  else if (horse.pist_genetik_analizi && horse.pist_genetik_analizi.delta) surfaceDelta = horse.pist_genetik_analizi.delta;

  const rawPed = Math.round((sireScore * 0.45) + (siblingScore * 0.55));
  const pedScore = Math.min(99, Math.max(30, rawPed + surfaceDelta));

  const allHps = raceHorses.length > 0 ? raceHorses.map(h => h.handikap_puani || 40) : [40, 60];
  const maxHp = Math.max(...allHps);
  const minHp = Math.min(...allHps);
  const hp = horse.handikap_puani || 40;
  let handikapScore = 60;
  if (maxHp > minHp) handikapScore = Math.round(35 + ((hp - minHp) / (maxHp - minHp)) * 60);
  else handikapScore = Math.min(96, Math.max(38, hp));

  let kgsScore = 75;
  const kgs = horse.dinlenme_gunu || 21;
  if (kgs >= 14 && kgs <= 35) kgsScore = 96;
  else if (kgs >= 7 && kgs < 14) kgsScore = 80;
  else if (kgs > 35 && kgs <= 70) kgsScore = 72;
  else if (kgs > 120) kgsScore = 48;
  else if (kgs < 7) kgsScore = 55;

  let galopScore = 62;
  if (horse.son_galop && horse.son_galop.son400hiz) {
    const speed = horse.son_galop.son400hiz;
    galopScore = Math.min(99, Math.max(35, Math.round(30 + (speed - 46) * 7.2)));
  }

  const siklet = horse.siklet || 56;
  let sikletScore = Math.min(96, Math.max(45, Math.round(96 - (siklet - 50) * 3.8)));

  const eliteJockeys = ['H.KARATAŞ', 'Ö.YILDIRIM', 'A.SÖZEN', 'V.ABİŞ', 'A.KURŞUN', 'G.ÖZÇELİK', 'H.ÇİZİK', 'A.YILDIZ', 'M.KAYA', 'S.KAYA', 'S.BOYRAZ', 'E.AKTUĞ', 'M.AKYAVUZ'];
  const jWinRate = horse.jokey_kazanma_orani || 10;
  let jokeyScore = 52;
  if (eliteJockeys.some(j => (horse.jokey || '').toUpperCase().includes(j))) {
    jokeyScore = Math.round(85 + Math.min(14, jWinRate * 0.6));
  } else if (horse.apranti_indirimi) {
    jokeyScore = Math.round(58 + Math.min(18, jWinRate));
  } else {
    jokeyScore = Math.round(48 + Math.min(30, jWinRate * 1.2));
  }

  let trackScore = 70;
  const kulvar = horse.kulvar || horse.no || 5;
  if (kulvar >= 1 && kulvar <= 4) trackScore = 92;
  else if (kulvar <= 8) trackScore = 76;
  else trackScore = 58;

  let takiScore = 65;
  const takilar = horse.takilar || [];
  if (takilar.includes('KG') && takilar.includes('DB') && takilar.includes('SK')) takiScore = 95;
  else if (takilar.includes('KG') && takilar.includes('DB')) takiScore = 90;
  else if (takilar.length >= 2) takiScore = 82;
  else if (takilar.length === 1) takiScore = 72;

  // CALIBRATED WEIGHTS: 27, 20, 14, 9, 8, 7, 8, 4, 3
  const royalScore = Math.round(
    (formScore * 0.27) +
    (pedScore * 0.20) +
    (handikapScore * 0.14) +
    (jokeyScore * 0.08) +
    (kgsScore * 0.09) +
    (galopScore * 0.08) +
    (sikletScore * 0.07) +
    (trackScore * 0.04) +
    (takiScore * 0.03)
  );

  return { royalScore: Math.min(99, Math.max(35, royalScore)), formScore, pedScore, handikapScore, jokeyScore, kgsScore, galopScore, sikletScore, trackScore, takiScore };
}

function calculatePaceAdjustmentCalibrated(horse, kosu, baseScore) {
  if (isYoungInexperiencedHorse(horse) || horse.isYoungHorse) {
    return { delta: 0, label: '🌱 İlk 3 Koşusu / Taktik Serbest (0 Puan Nötr)', color: '#38bdf8' };
  }
  const pace = estimateRacePace(kosu);
  const stil = horse.kosu_stili || '';
  const sprintSpeed = horse.son_galop?.son400hiz || 52;
  const mesafe = parseInt(kosu.mesafe) || 1600;

  let delta = 0;
  let label = '';
  let color = '#94a3b8';

  if (pace.type === 'FAST') {
    if (stil.includes('Kaçak')) {
      delta = -1;
      label = '⚠️ Erken liderlik mücadelesi tempoyu artırır (-1 Puan)';
      color = '#ef4444';
    } else if (stil.includes('Pres')) {
      delta = 0;
      label = '🏹 Yüksek ön grup temposunu yakın takip (0 Puan)';
      color = '#38bdf8';
    } else if (stil.includes('Orta')) {
      delta = +1;
      label = '🛡️ Yıpranmadan son viraja gelme avantajı (+1 Puan)';
      color = '#3b82f6';
    } else if (stil.includes('Sprinter')) {
      if (sprintSpeed >= 53.5 && mesafe >= 1400) {
        delta = +2;
        label = `🚀 Yüksek tempo & elit son 400 sprinti (${sprintSpeed} km/h) (+2 Puan)`;
        color = '#a855f7';
      } else {
        delta = +1;
        label = '🚀 Yüksek tempoda düzlük hücumu şansı (+1 Puan)';
        color = '#a855f7';
      }
    }
  } else if (pace.type === 'SLOW') {
    if (stil.includes('Kaçak')) {
      delta = (horse.handikap_puani >= 60 || baseScore >= 75) ? +2 : +1;
      label = `👑 Yalnız lider rölanti tempoyu bitirebilir (+${delta} Puan)`;
      color = '#10b981';
    } else if (stil.includes('Pres')) {
      delta = +1;
      label = '🏹 Liderin arkasında rahat takip (+1 Puan)';
      color = '#10b981';
    } else if (stil.includes('Orta')) {
      delta = (baseScore >= 80 || sprintSpeed >= 54) ? 0 : -1;
      label = delta === 0 ? '🛡️ Dengeli takip ve düzlük hücumu (0 Puan)' : '🛡️ Yavaş tempoda öndekileri yakalamak zor (-1 Puan)';
      color = delta === 0 ? '#38bdf8' : '#f59e0b';
    } else if (stil.includes('Sprinter')) {
      // CLASS & DISTANCE & SPRINT SPEED DAMPER:
      // Elite sprinters (Speed >= 54 km/h or Mesafe >= 1800m or Class >= 82 P) DO NOT get -2 penalty!
      if (mesafe >= 1800 && (sprintSpeed >= 53.5 || baseScore >= 82)) {
        delta = 0;
        label = `🚀 Uzun mesafe (${mesafe}m) ve güçlü sprint (${sprintSpeed} km/h) ile tempo dezavantajını sıfırlar (0 Puan)`;
        color = '#a855f7';
      } else if (sprintSpeed >= 53.5 || baseScore >= 82) {
        delta = -1;
        label = `⚠️ Rölanti tempo, ancak yüksek son 400 sprinti (${sprintSpeed} km/h) ile sınırlı etki (-1 Puan)`;
        color = '#f59e0b';
      } else {
        delta = -2;
        label = '⚠️ Ön grup diri kalır, sprinte mesafe yetmeyebilir (-2 Puan)';
        color = '#ef4444';
      }
    }
  } else {
    // BALANCED
    if (stil.includes('Kaçak') || stil.includes('Pres')) {
      delta = +1;
      label = '🏹 Dengeli tempoda ideal takip (+1 Puan)';
      color = '#10b981';
    } else if (stil.includes('Sprinter')) {
      delta = (sprintSpeed >= 54) ? +1 : 0;
      label = (delta > 0) ? '🚀 Güçlü son 400 ivmesi (+1 Puan)' : '🛡️ Dengeli koşu (0 Puan)';
      color = (delta > 0) ? '#a855f7' : '#94a3b8';
    }
  }

  return { delta, label, color, paceType: pace.type };
}

const hip = b.hipodromlar.find(h => h.sehir === 'İstanbul');
const r5 = hip.kosular[4];
const list = r5.atlar.map(a => {
  const power = calculatePowerIndexCalibrated(a, r5.atlar);
  const adj = calculatePaceAdjustmentCalibrated(a, r5, power.royalScore);
  return {
    no: a.no,
    name: a.isim,
    style: a.kosu_stili,
    handikap: a.handikap_puani,
    jokey: a.jokey,
    base: power.royalScore,
    adj: adj.delta,
    final: power.royalScore + adj.delta
  };
}).sort((a,b) => b.final - a.final);

console.log('CALIBRATED MODEL RANKING IN ISTANBUL RACE 5:');
list.forEach((h, i) => {
  console.log(`#${i+1} [No ${h.no}] ${h.name} (${h.style}) - Base: ${h.base} Adj: ${h.adj >= 0 ? '+' + h.adj : h.adj} Final: ${h.final} (HP: ${h.handikap}, ${h.jokey})`);
});
