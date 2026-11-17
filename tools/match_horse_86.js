const fs = require('fs');
const bulten = require('../public/data/bulten_bugun.json');

// Let's test with the weights
function testHorse(h, raceHorses) {
  // past form
  let formScore = 55;
  const past = h.son_yarislar || '';
  if (past) {
    let pts = 0; let counted = 0;
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
  if (h.accelerationType && h.accelerationType.includes('Hızlanan')) formScore = Math.min(99, formScore + 6);

  let sireScore = 65;
  const eliteSires = ['NATIVE KHAN', 'TOROK', 'LUXOR', 'VICTORY GALLOP', 'PAPA CLEM', 'KANEKO', 'DAREDEVIL', 'BODEMEISTER', 'KAIZBERT', 'ÖZHABER', 'SERHANTAY', 'MYBOYCHARLIE', 'TİZWAY', 'LION HEART', 'MENDIP', "FAST 'N' FAMOUS", 'JOKER'];
  const eliteBroodmare = ['BATYSKAF', 'UNACCOUNTED FOR', 'ALWAY A CLASSIC', 'SRI PEKAN', 'ROYAL ABJAR', 'HABERBATUR', 'DEMİRKAZIK', 'BİRADER'];
  if (eliteSires.some(s => (h.baba || '').toUpperCase().includes(s)) && eliteBroodmare.some(s => (h.kisrak_babasi || '').toUpperCase().includes(s))) sireScore = 95;
  else if (eliteSires.some(s => (h.baba || '').toUpperCase().includes(s))) sireScore = 88;
  else if (eliteBroodmare.some(s => (h.kisrak_babasi || '').toUpperCase().includes(s))) sireScore = 80;

  let siblingScore = (h.anne_kardesleri && h.anne_kardesleri.score) || 65;
  let surfaceDelta = (h.pist_genetik_analizi && h.pist_genetik_analizi.delta) || 0;
  const pedScore = Math.min(99, Math.max(30, Math.round((sireScore * 0.45) + (siblingScore * 0.55)) + surfaceDelta));

  const allHps = raceHorses.map(x => x.handikap_puani || 40);
  const maxHp = Math.max(...allHps);
  const minHp = Math.min(...allHps);
  let handikapScore = 60;
  if (maxHp > minHp) handikapScore = Math.round(35 + (((h.handikap_puani || 40) - minHp) / (maxHp - minHp)) * 60);

  let kgsScore = 75;
  const kgs = h.dinlenme_gunu || 21;
  if (kgs >= 14 && kgs <= 35) kgsScore = 96;
  else if (kgs >= 7 && kgs < 14) kgsScore = 80;
  else if (kgs > 35 && kgs <= 70) kgsScore = 72;
  else if (kgs > 120) kgsScore = 48;
  else if (kgs < 7) kgsScore = 55;

  let galopScore = 62;
  if (h.son_galop && h.son_galop.son400hiz) galopScore = Math.min(99, Math.max(35, Math.round(30 + (h.son_galop.son400hiz - 46) * 7.2)));

  const siklet = h.siklet || 56;
  let sikletScore = Math.min(96, Math.max(45, Math.round(96 - (siklet - 50) * 3.8)));

  const eliteJockeys = ['H.KARATAŞ', 'Ö.YILDIRIM', 'A.SÖZEN', 'V.ABİŞ', 'A.KURŞUN', 'G.ÖZÇELİK', 'H.ÇİZİK', 'A.YILDIZ', 'M.KAYA', 'S.KAYA', 'S.BOYRAZ', 'E.AKTUĞ', 'M.AKYAVUZ'];
  const jWinRate = h.jokey_kazanma_orani || 10;
  let jokeyScore = 52;
  if (eliteJockeys.some(j => (h.jokey || '').toUpperCase().includes(j))) jokeyScore = Math.round(84 + Math.min(14, jWinRate * 0.6));
  else if (h.apranti_indirimi) jokeyScore = Math.round(58 + Math.min(18, jWinRate));
  else jokeyScore = Math.round(48 + Math.min(30, jWinRate * 1.2));

  let trackScore = 70;
  const kulvar = h.kulvar || h.no || 5;
  if (kulvar >= 1 && kulvar <= 4) trackScore = 92;
  else if (kulvar <= 8) trackScore = 76;
  else trackScore = 58;

  let takiScore = 65;
  const takilar = h.takilar || [];
  if (takilar.includes('KG') && takilar.includes('DB') && takilar.includes('SK')) takiScore = 95;
  else if (takilar.includes('KG') && takilar.includes('DB')) takiScore = 90;
  else if (takilar.length >= 2) takiScore = 82;
  else if (takilar.length === 1) takiScore = 72;

  // Old weights
  const oldScore = Math.round(
    (formScore * 0.26) + (pedScore * 0.20) + (handikapScore * 0.14) +
    (kgsScore * 0.10) + (galopScore * 0.09) + (sikletScore * 0.08) +
    (jokeyScore * 0.06) + (trackScore * 0.04) + (takiScore * 0.03)
  );

  // New weights
  const newScore = Math.round(
    (formScore * 0.28) + (pedScore * 0.22) + (handikapScore * 0.12) +
    (kgsScore * 0.09) + (galopScore * 0.08) + (sikletScore * 0.08) +
    (jokeyScore * 0.06) + (trackScore * 0.04) + (takiScore * 0.03)
  );

  return { oldScore, newScore };
}

bulten.hipodromlar.forEach(hip => {
  hip.kosular.forEach((k, kIdx) => {
    k.atlar.forEach(a => {
      const { oldScore, newScore } = testHorse(a, k.atlar);
      if (oldScore === 86 || newScore === 86) {
        console.log(`[${hip.sehir} Koşu ${kIdx+1}] #${a.no} ${a.isim} -> old: ${oldScore}, new: ${newScore}, takilar: ${JSON.stringify(a.takilar)}, sprint: ${a.son_galop?.son400hiz}, baba: ${a.baba}`);
      }
    });
  });
});
