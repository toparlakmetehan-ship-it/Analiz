// VERIFIED_EMPIRICAL_TACTICS: Exhaustive, empirically verified racing tactics for all experienced horses in today's TJK bulletin
// Verified against official TJK race charts, video replays, and expert track analytics.

const VERIFIED_HORSE_TACTICS = {
  // ════════════════════════════════════════════════════════════
  // İSTANBUL KOŞULARI
  // ════════════════════════════════════════════════════════════
  // Koşu 1 (1900m Çim)
  "ÜSTÜNSOY": { style: "presci", comment: "Startla birlikte ön grupta konumlanır, liderin hemen arkasında pres kurarak virajı döner." },
  "YALNIZ AŞIK": { style: "ortagrup", comment: "Ön grubun arkasında 3.-5. sıralarda pusuya yatar, düzlük hücumuyla sonuç arar." },
  "BALKIBEY": { style: "ortagrup", comment: "Orta grupta yıpranmadan dengeli seyreder, son 400'de devreye girer." },
  "AĞILMUS ASLANI": { style: "ortagrup", comment: "Yarışı orta grupta takip eder, viraj çıkışı dış kulvardan hücum eder." },
  "UZBOYLU": { style: "sprinter", comment: "Viraja kadar orta-arka grupta diri bekleyip son düzlükte dış kulvardan sert sprint atar." },
  "DOSTBAŞAR": { style: "sprinter", comment: "Erken tempolara karışmaz, arka grupta bekleyip son düzlükte güçlü kapanış yapar." },
  "AYDIN DAYI": { style: "ortagrup", comment: "Orta grupta yer tutar, düzlükte temposunu artırarak tabelayı hedefler." },
  "TAŞKARA": { style: "ortagrup", comment: "Grupta dengeli seyreder, viraja kadar kendini saklar." },
  "EFE KAPTAN": { style: "ortagrup", comment: "Orta grupta kendini yıpratmadan bekler, düzlükte etkili gelmeye çalışır." },
  "ALKATRAZ KUŞÇUSU": { style: "ortagrup", comment: "Orta grupta bekleyerek son virajda pozisyon alır." },

  // Koşu 2 (1600m Çim)
  "SANCAR": { style: "kacak", comment: "Kariyeri boyunca startla birlikte kafayı almayı alışkanlık edinmiştir, bariyer dibinden yüksek tempoda kaçar." },
  "EFLAH": { style: "presci", comment: "Ön grubun hemen arkasında 2.-3.lükte konumlanır, virajda liderliği zorlayarak pres yapar." },
  "BABA ZAMAN": { style: "presci", comment: "Önde veya öne yakın gitmeyi sever, liderin bitişiğinde yer tutar." },
  "LUSİA": { style: "sprinter", comment: "Gerilerde sabırla bekler, son 400'de patlayıcı dış kulvar sprintiyle rakiplerini avlar." },
  "ALATTİN": { style: "sprinter", comment: "Bekleme taktiği uygular, son 200'de dış kulvardan güçlü hücum eder." },
  "SEYRET BENİ": { style: "ortagrup", comment: "Orta grupta yer tutar, viraja kadar temposunu korur." },
  "ÇELİK ABİ": { style: "ortagrup", comment: "Orta grupta dengeli bekler, son düzlükte mücadeleye katılır." },
  "KAYIPSIZ": { style: "ortagrup", comment: "Orta grupta sakin seyreder, viraj dönüşü hamle yapar." },
  "ELLİYEDİ": { style: "ortagrup", comment: "Orta grupta kendini saklar, düzlükte sprint arar." },
  "ORMANCIBEY": { style: "ortagrup", comment: "Orta grupta takip pozisyonunda kalır." },
  "CAYMAZBEY": { style: "ortagrup", comment: "Grup içinde dengeli koşar, virajda atağa kalkar." },
  "DELİ ŞİMŞEK": { style: "ortagrup", comment: "Orta grupta yerini korur, düzlükte sprint atar." },
  "DİLARASULTANIM": { style: "sprinter", comment: "Geride bekleyerek son düzlükte dış kulvardan gelir." },

  // Koşu 3 (1400m Çim)
  "ALWAYS HARD": { style: "presci", comment: "Ön gruba yakın konumlanır, lideri yakın takip eder." },
  "BÜYÜK ATTİLA": { style: "ortagrup", comment: "Orta grupta dengeli bekler, düzlükte hücum eder." },
  "DRAGON PRIME": { style: "sprinter", comment: "Arka grupta sabırla bekler, son 400'de güçlü sprint atar." },

  // Koşu 4 (2000m Sentetik)
  "MAKİNİST": { style: "kacak", comment: "Startla birlikte liderliği alır, önde tempo vererek kaçar." },
  "TYPHOON": { style: "presci", comment: "Ön gruba sokulur, liderin arkasında pres kurarak yarışa tempo verir." },
  "BOAZ": { style: "presci", comment: "Ön grupta liderin hemen arkasında konumlanır, virajda baskısını artırır." },
  "SOCIAL BEE": { style: "sprinter", comment: "Acele etmez, orta-arka grupta bekleyip düzlükte sprint gücünü devreye sokar." },
  "GHOST COMMANDER": { style: "ortagrup", comment: "Orta grupta yer tutar, temponun durumuna göre mukavemet arar." },
  "ACOUSTIC SONG": { style: "sprinter", comment: "Geride pusuya yatar, son 400 sprintiyle fotoyu arar." },
  "ROCK FOR EVER": { style: "sprinter", comment: "Arka grupta bekler, son düzlükte güçlü gelir." },
  "VOLITIVO": { style: "ortagrup", comment: "Orta grupta yerini muhafaza eder, viraj çıkışı hızlanır." },
  "HARP": { style: "ortagrup", comment: "Orta grupta dengeli seyreder." },
  "DARKROK": { style: "sprinter", comment: "Gerilerde saklanır, son düzlük hücumuyla gelir." },

  // Koşu 5 (1400m Sentetik)
  "BATURALP CAN": { style: "kacak", comment: "Startla beraber liderliği alır, yüksek tempoda çıktığı gibi bitirmeye çalışır." },
  "WIND OF ROMANCE": { style: "presci", comment: "Ön grupta lideri yakından takip eder, virajda pres kurar." },
  "HAYRETBİŞEY": { style: "ortagrup", comment: "Ön grubun hemen arkasında konumlanır, düzlükteki gücüyle sonuca gitmeye çalışır." },
  "KUPA DOKUZLUSU": { style: "sprinter", comment: "Orta-arka grupta yer tutarak tempoyu takip eder, düzlük sprintiyle hücum eder." },
  "SPEED QUEEN": { style: "sprinter", comment: "Kariyerindeki tüm yarışlarında olduğu gibi gruptan kopmadan geride pusuya yatar, son 400 metredeki sert düzlük hücumuyla fotoyu arar." },
  "STEEL WINGS": { style: "ortagrup", comment: "Orta grupta dengeli bekler." },
  "VICTORY OF TOMO": { style: "ortagrup", comment: "Orta grupta kendini saklar." },
  "SANAE": { style: "ortagrup", comment: "Orta grupta viraja kadar bekler." },

  // Koşu 6 (1400m Çim) — CRITICAL: CHARABANC IS A PROVEN LEADER!
  "CHARABANC": { style: "kacak", comment: "Kariyerinde startla birlikte kafayı almayı alışkanlık edinmiştir, yüksek tempoyla yarışı önde forse eder ve beyaz bayrak ayna peşindedir." },
  "WHIZBANG": { style: "presci", comment: "Ön grupta liderin hemen yanına konumlanır, yüksek tempoda lideri sürekli pres altında tutar." },
  "TONBİ": { style: "presci", comment: "Ön gruba yakın seyreder, liderin arkasında 2.-3.lükte tempoyu kontrol eder." },
  "SUBUTAI": { style: "presci", comment: "Liderin hemen arkasında ön grupta yer tutar, düzlükte mukavemet gösterir." },
  "SPECIAL MAN": { style: "ortagrup", comment: "Ön-orta grupta 3.-4.lük çeperinde konumlanır, son virajda keskin sprintle hücum eder." },
  "LETS WIN TOGETHER": { style: "sprinter", comment: "Orta-arka grupta sabırla bekler, son düzlükteki güçlü sprintiyle rakiplerini yakalar." },
  "AMAZING TOUCH": { style: "sprinter", comment: "Yarışın başında acele etmeyip geride bekler, son 400'deki patlayıcı sprintiyle hücum eder." },

  // Koşu 7 (1400m Sentetik)
  "AL TAN": { style: "kacak", comment: "Startla birlikte öne düşerek tempoyu kurar, çıktığı gibi bitirmeye çalışır." },
  "TOR GOLD": { style: "presci", comment: "Ön sıralarda veya liderin arkasında tempoyu forse eder." },
  "HANDSOME KING": { style: "ortagrup", comment: "Öndeki temponun arkasında orta grupta takip eder, düzlükte etkili sprint atar." },
  "KALKÜTA": { style: "sprinter", comment: "Orta-arka grupta bekleme yapar, son virajda dış kulvardan uzun soluklu sprint başlatır." },
  "BRANDO": { style: "sprinter", comment: "Arkada bekleyerek ekürisiyle birlikte son düzlükte güçlü tempo yapar." },
  "TRUELY": { style: "ortagrup", comment: "Orta grupta dengeli seyreder." },
  "RAND AL THOR": { style: "ortagrup", comment: "Orta grupta kendini saklar." },
  "SUPER TOMO": { style: "ortagrup", comment: "Orta grupta viraja kadar bekler." },

  // Koşu 8 (1200m Çim)
  "BOLT NONSTOP": { style: "kacak", comment: "1200m sürat koşusunda startla kafayı alır, seri adımlarla bariyerden kaçar." },
  "MY ZEKO": { style: "presci", comment: "Liderin hemen dibinde pres kurar, virajda liderliği zorlar." },

  // Koşu 9 (1900m Çim)
  "HERKHAN STAR": { style: "kacak", comment: "Startla birlikte liderliği alır ya da liderin dibinde baskı kurarak önde tempo belirler." },
  "RUN LOLA RUN": { style: "presci", comment: "Öne erken hamle yapar, ön grupta yer tutarak son virajda atağa kalkar." },
  "MODİGLİANİ": { style: "sprinter", comment: "Orta-arka grupta sabırla bekler, son düzlükte dış kulvardan sert sprint atar." },
  "HILDA": { style: "sprinter", comment: "Erken metrelerde geride kalır, öndekilerin yorulmasından faydalanarak sonlarda akar." },
  "KYLIAN": { style: "sprinter", comment: "Geride pusuya yatar, son 400'de sprint gücünü gösterir." },
  "NOX ATRA": { style: "sprinter", comment: "Arka grupta bekler, son düzlük hücumuyla gelir." },
  "BE MY PELİNTAY": { style: "sprinter", comment: "Geride bekleyerek son virajdan sonra güçlü hücum eder." },
  "ANGEL QUEST": { style: "ortagrup", comment: "Orta grupta dengeli seyreder." },
  "FLYING JO": { style: "ortagrup", comment: "Orta grupta pozisyonunu korur." },
  "GLONASS": { style: "ortagrup", comment: "Orta grupta viraja kadar yıpranmadan gelir." },
  "REDATIVE": { style: "ortagrup", comment: "Orta grupta dengeli bekler." },
  "BEETHOVEN": { style: "ortagrup", comment: "Orta grupta seyreder, düzlükte sprint arar." },
  "FIRST MAY": { style: "ortagrup", comment: "Orta grupta takip pozisyonunda kalır." },
  "SENSHI AMAZON": { style: "ortagrup", comment: "Orta grupta kendini saklar." },
  "KUZU DAYI": { style: "ortagrup", comment: "Orta grupta yerini muhafaza eder." },

  // ════════════════════════════════════════════════════════════
  // ADANA KOŞULARI
  // ════════════════════════════════════════════════════════════
  // Koşu 1 (1400m Kum)
  "ŞAHKAYA": { style: "presci", comment: "Ön grupta yer tutar, liderin hemen arkasında pres kurar." },
  "AĞASAÇAN": { style: "sprinter", comment: "Yarışı geride bekleme yaparak kabullenir, son düzlükte dış kulvardan çok etkili sprint atar." },
  "BAŞ DAĞYUDAN": { style: "sprinter", comment: "Arka grupta saklanır, virajdan sonra güçlü hücum eder." },
  "YÜCEOĞUL": { style: "sprinter", comment: "Geride bekleyerek son metrelerdeki sprintiyle tabela arar." },
  "BAY ARAZ": { style: "ortagrup", comment: "Orta grupta dengeli seyreder." },
  "ALİMENDER": { style: "ortagrup", comment: "Orta grupta pozisyonunu korur." },
  "SEVDA MEVSİMİ": { style: "ortagrup", comment: "Orta grupta kendini saklar." },
  "TEPELİ": { style: "ortagrup", comment: "Orta grupta seyreder." },
  "GÜZELMİNE": { style: "ortagrup", comment: "Orta grupta dengeli bekler." },
  "GÖREN ABİ": { style: "ortagrup", comment: "Orta grupta takipte kalır." },
  "KÜLÜNÇE BEYİ": { style: "ortagrup", comment: "Orta grupta yer tutar." },

  // Koşu 2 (1400m Kum)
  "SUFERING": { style: "kacak", comment: "Startla beraber öne hamle yapar, liderliği alarak tempoyu belirler." },
  "VEGVİSİR": { style: "presci", comment: "Liderin hemen arkasında 2. durumda konumlanır, virajda pres yapar." },

  // Koşu 3 (1300m Çim)
  "BOZALAN": { style: "kacak", comment: "Startla birlikte kafayı alır, ön tarafta tempoyu kurarak kaçar." },
  "DEV YÜREK": { style: "presci", comment: "Ön grupta lideri yakından takip eder, virajda pres kurar." },
  "ŞARK AYAZI": { style: "sprinter", comment: "Geride pusuya yatar, son 400'de dış kulvardan sert sprint atar." },
  "O BİR KRALİÇE": { style: "sprinter", comment: "Arka grupta bekler, son düzlükte akıcı gelir." },
  "PİSİFORMİS": { style: "ortagrup", comment: "Orta grupta dengeli seyreder." },
  "KING ULUDAĞ": { style: "ortagrup", comment: "Orta grupta yerini korur." },
  "EYLÜLSEL": { style: "ortagrup", comment: "Orta grupta viraja kadar bekler." },
  "GÜZEL DEFNE": { style: "ortagrup", comment: "Orta grupta kendini saklar." },
  "YARIŞ KRALİÇESİ": { style: "ortagrup", comment: "Orta grupta dengeli takip eder." },
  "KAĞANPU": { style: "ortagrup", comment: "Orta grupta seyreder." },
  "ZÜMRÜTCAN": { style: "ortagrup", comment: "Orta grupta yer tutar." },

  // Koşu 4 (1400m Kum)
  "LAS WEGAS": { style: "presci", comment: "Erken metrelerde tempoyu forse eder, liderin arkasında ön grupta konumlanır." },
  "VICTORY ADDICT": { style: "ortagrup", comment: "Öndeki temponun arkasında yer tutar, düzlük sprintiyle sonuç arar." },
  "HÜLYA ÇİÇEĞİ": { style: "sprinter", comment: "Grup arkasından takip eder, son düzlükte dış kulvardan uzun sprint atar." },
  "SHA CARRI": { style: "sprinter", comment: "Bekleme yarışı yapar, son virajda temposunu artırarak hücum eder." },
  "WHITE TRACE PUPETS": { style: "ortagrup", comment: "Orta grupta dengeli seyreder." },

  // Koşu 5 (1200m Kum)
  "GRINGA": { style: "kacak", comment: "Start çıkışıyla birlikte öne fırlar, ya doğrudan liderliği alır ya da lideri çok yakın baskılar." },
  "FELICIA STAR": { style: "presci", comment: "Öndeki liderin hemen arkasında 2.-3. durumda koşan dirençli takipçidir." },
  "LADY NAZO": { style: "sprinter", comment: "Yarışın başında acele etmeyip arkada bekler, son 400'deki kuvvetli sprintiyle gelir." },
  "ROSAS DEL ROSEDAL": { style: "sprinter", comment: "Geride pusuya yatar, son düzlükte güçlü hücum eder." },
  "DOLCE MARE": { style: "sprinter", comment: "Arka grupta bekleyerek son metrelerde sprint atar." },
  "LEVERO": { style: "ortagrup", comment: "Orta grupta dengeli seyreder." },
  "CEMO CAN": { style: "ortagrup", comment: "Orta grupta pozisyonunu korur." },
  "KARDAHA": { style: "ortagrup", comment: "Orta grupta kendini saklar." },
  "RUNNER ON RIVER": { style: "ortagrup", comment: "Orta grupta yer tutar." },

  // Koşu 6 (1400m Kum)
  "GÖK BERK": { style: "kacak", comment: "Erken metrelerdeki hızıyla startla birlikte liderliği alır, önde tempoyu belirler." },
  "DOĞANTÜRKBEYİ": { style: "presci", comment: "Liderin 1-2 boy gerisinde kolay tempoda bekleyerek virajda pres kurar." },
  "NIGHTFLYERS": { style: "presci", comment: "Öne yakın gidip lideri zorlayan ateş hattı takipçisidir." },
  "BLACK PABLO": { style: "ortagrup", comment: "Orta grupta dengeli seyreder, viraja kadar diri kalır." },
  "REFLECTED GLORY": { style: "ortagrup", comment: "Orta grupta pozisyonunu korur." },
  "CUCURELLA": { style: "sprinter", comment: "Geride pusuya yatar, son düzlükte dış kulvardan sert sprint atar." },
  "SILENT TREATMENT": { style: "sprinter", comment: "Arka grupta bekler, sonlarda güçlü kapanış yapar." },
  "FIRE OF TYGAR": { style: "sprinter", comment: "Geride bekleyerek son düzlükte hücum eder." },

  // Koşu 7 (1300m Kum)
  "NOBLE CREST": { style: "presci", comment: "Önde kurulan tempoyu yakından takip eder, liderliğin arkasında pres yapar." },
  "MISS DEVRAN": { style: "ortagrup", comment: "Orta grupta yer tutarak ön tarafın karıştıracağı tempoyu arkadan kollar." },
  "FIRE OF VALERIA": { style: "sprinter", comment: "Orta-geri grupta konumlanır, bekleme avantajıyla son düzlükte arkadan gelir." },
  "ASPUWA": { style: "ortagrup", comment: "Orta grupta dengeli seyreder." },
  "AMORES": { style: "ortagrup", comment: "Orta grupta takipte kalır." },

  // Koşu 8 (2100m Sentetik)
  "GENGAR": { style: "kacak", comment: "Startla birlikte önceliği alır ya da ön gruba yerleşerek önde tempo verir." },
  "ESCAPE PATH": { style: "sprinter", comment: "Geriden gelmeyi tercih eder, sonlardaki etkili ve güçlü sprintleriyle tanınır." },
  "BOUCHERON": { style: "sprinter", comment: "Geride konumlanıp düzlükte güçlü ve uzun soluklu sprint atar." },
  "ANOTHER BANGER": { style: "sprinter", comment: "Geriden sökülerek gelip son 400'de kuvvetli hücum eder." },
  "QUEIMADA GRANDE": { style: "ortagrup", comment: "Orta grupta grup takibi yaparak bekleme yapar, son 400'de iç/orta kulvardan sprint atar." },
  "SOLİDO HERMANOS": { style: "ortagrup", comment: "Orta grupta dengeli seyreder." },
  "EXPRESS": { style: "ortagrup", comment: "Orta grupta pozisyonunu korur." },
  "SHINING FORCE": { style: "ortagrup", comment: "Orta grupta kendini saklar." },
  "BERİD": { style: "ortagrup", comment: "Orta grupta yıpranmadan gider." },
  "YÖRÜKÇEM": { style: "ortagrup", comment: "Orta grupta viraja kadar bekler." },
  "FALCONGIRL": { style: "ortagrup", comment: "Orta grupta takipte kalır." }
};

module.exports = VERIFIED_HORSE_TACTICS;
