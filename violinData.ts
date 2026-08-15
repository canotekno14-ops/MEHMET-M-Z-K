import { BowingTechnique, ViolinPositionNote } from '../types';

export const VIOLIN_LUTHIERS = [
  {
    name: 'Gasparo da Salò (1540–1609)',
    city: 'Brescia, İtalya',
    period: 'Erken Rönesans / Barok Başlangıcı',
    description: {
      tr: 'Modern keman ailesinin öncülerinden. Büyük boyutlu, koyu, derin ve rezonanslı tonlarıyla ünlüdür.',
      en: 'Pioneer of the modern violin family from the Brescian school, renowned for deep, sonorous dark timbre.',
      de: 'Pionier der Geigenbaukunst der Brescianer Schule mit tiefem, warmem Klang.',
      ru: 'Один из основоположников скрипичного мастерства брешианской школы.',
      ja: 'ブレシア派の巨匠。深く力強い低音の響きで知られる現代ヴァイオリンの祖。',
      ar: 'رائد مدرسة بريشيا وأحد مؤسسي عائلة الكمان الحديثة.',
      fa: 'پیشگام مکتب برشا و از پایه‌گذاران اصلی خانواده سازهای زهی آرشه‌ای.',
    },
  },
  {
    name: 'Andrea Amati (1505–1577)',
    city: 'Cremona, İtalya',
    period: 'Cremona Ekolünün Kurucusu',
    description: {
      tr: 'Cremona keman yapım geleneğinin babası. 4 telli kemanın standart oranlarını, kavislerini ve asil verniğini belirlemiştir.',
      en: 'Founding father of the Cremonese violin making school, codified the proportions of the modern 4-string violin.',
      de: 'Gründer der Cremoneser Schule, definierte die klassischen Proportionen der Violine.',
      ru: 'Основатель кремонской школы, определивший форму и пропорции классической скрипки.',
      ja: 'クレモナ派の創始者。4弦ヴァイオリンの黄金比率と優美なアーチを確立。',
      ar: 'مؤسس مدرسة كريمونا الإيطالية ومحدد المقاييس القياسية للكمان ذي الأوتار الأربعة.',
      fa: 'پدر مکتب کرمونا که تناسبات طلایی و انحناهای استاندارد ویولن را تعریف کرد.',
    },
  },
  {
    name: 'Antonio Stradivari (1644–1737)',
    city: 'Cremona, İtalya',
    period: 'Altın Çağ (Golden Period 1700–1725)',
    description: {
      tr: 'Tarihin en büyük luthieri. "Messiah", "Betts", "Soil" gibi başyapıtları eşsiz parlaklık, konser salonunu dolduran akustik projeksiyon ve zengin armonik spektruma sahiptir.',
      en: 'The pinnacle of violin craftsmanship. Famous for unparalleled acoustic projection, crystalline brilliance, and rich overtones.',
      de: 'Der unübertroffene Meister des Geigenbaus. Legendäre Tragfähigkeit und strahlender Klang.',
      ru: 'Величайший мастер всех времен, создатель эталона акустической проекции и тембра.',
      ja: '人類史上最高のヴァイオリン製作者。圧倒的な遠達性と輝かしい倍音の響き。',
      ar: 'أعظم صانع كمان في التاريخ، تميزت آلاته بنقاء صوتي نادر وقدرة هائلة على ملء القاعات الكبرى.',
      fa: 'بزرگ‌ترین لوتیر تاریخ، سازهای دوره طلایی او دارای شفافیت خیره‌کننده و پرتاب صدای بی‌نظیر هستند.',
    },
  },
  {
    name: 'Giuseppe Guarneri "del Gesù" (1698–1744)',
    city: 'Cremona, İtalya',
    period: 'Geç Barok / Paganini "Il Cannone"',
    description: {
      tr: 'Niccolò Paganini\'nin efsanevi kemanı "Il Cannone"nin yaratıcısı. Stradivari\'den daha kalın kapak yapısı, vahşi güç, yoğun karanlık ve dramatik tenor tınısı ile tanınır.',
      en: 'Maker of Paganini\'s famed "Il Cannone". Thicker plates, immense acoustic power, earthy dark depth, and dramatic visceral response.',
      de: 'Erbauer von Paganinis "Il Cannone", berühmt für kraftvollen, dunklen und leidenschaftlichen Ton.',
      ru: 'Создатель скрипки Паганини "Il Cannone", отличающейся мощным, глубоким и страстным звуком.',
      ja: 'パガニーニ愛奏の「イル・カノーネ」の作者。野性的なパワーと深遠なダークトーン。',
      ar: 'صانع كمان باغانيني الشهير "إيل كانوني"، اشتهر بصوت جهوري قوي ومؤثر للغاية.',
      fa: 'سازنده ویولن افسانه‌ای پاگانینی، دارای صدایی تاریک، قدرتمند و فوق‌العاده دراماتیک.',
    },
  },
];

export const VIOLIN_ANATOMY = [
  {
    part: 'Salyangoz (Scroll) & Burguluk (Pegbox)',
    role: 'Estetik taç ve akort burgularının (Pegs) yer aldığı kafa mekanizması.',
    physics: 'Baş kısmın kütlesi, sapın rezonans modlarını ve enstrümanın genel dengesini etkiler.',
  },
  {
    part: 'Tuşe (Fingerboard - Abanoz)',
    role: 'Perdesiz abanoz klavye; sol el parmaklarının telleri kısalttığı yüzey.',
    physics: 'Abanoz ağacının yoğunluğu parmak hassasiyetini ve sesin iletim hızını artırır.',
  },
  {
    part: 'Ses Delikleri (F-Holes)',
    role: 'Gövde içindeki havanın dışarıya rezone olarak çıkmasını sağlayan f şeklindeki yarıklar.',
    physics: 'Helmholtz rezonans frekansını (yaklaşık 270–290 Hz, A0 hava modu) belirler.',
  },
  {
    part: 'Köprü (Bridge - Akçaağaç)',
    role: 'Tellerin titreşimini gövde kapağına ileten kavisli ayaklı köprü.',
    physics: 'Akustik bir mekanik filtre görevi görür; 2.5–3 kHz aralığındaki solist parlaklığını güçlendirir.',
  },
  {
    part: 'Can Direği (Soundpost / L\'Âme - Ruh)',
    role: 'Üst ladin kapak ile alt akçaağaç dip tahta arasına köprünün sağ ayağı altına sıkıştırılan çam silindir.',
    physics: 'Kemanın "ruhu" kabul edilir. Konumu 0.5 mm değişse bile enstrümanın tını dengesi tamamen değişir.',
  },
  {
    part: 'Bas Balkon (Bass Bar)',
    role: 'Üst kapağın altına sol ayak boyunca yapıştırılan ladin kiriş.',
    physics: 'Düşük frekansları (Sol ve Re telleri) gövdeye yayar ve kapağa mekanik mukavemet sağlar.',
  },
  {
    part: 'Yay (Bow - Pernambuco & At Kılı)',
    role: 'Telleri sürtünme ile titreştiren çubuk (Pernambuco ağacı) ve at kuyruğu kılından oluşan mekanizma.',
    physics: 'Çekme-bırakma (Stick-Slip) Helmholtz hareketi üreterek sürekli kararlı tel titreşimi oluşturur.',
  },
];

export const BOWING_TECHNIQUES: BowingTechnique[] = [
  {
    id: 'detache',
    name: 'Détaché (Düz / Ayrı Yay)',
    origin: 'Fransızca: Ayrılmış',
    category: 'on-string',
    description: {
      tr: 'Temel yay çekişi. Her nota ayrı bir yay hareketiyle (çekiş veya itiş), telden ayrılmadan pürüzsüz ve akıcı icra edilir.',
      en: 'The fundamental on-string bowing stroke. Notes are smoothly separated with clear, even sound production.',
      de: 'Grundlegender Strich auf der Saite. Jeder Ton wird mit einem separaten Strich klar getrennt.',
      ru: 'Основной штрих без отрыва смычка от струны, слитный и ровный.',
      ja: '弓を弦から離さずに1音ずつ滑らかに弾き分ける基本奏法。',
      ar: 'حركة القوس الأساسية على الوتر بفصل كل نغمة بنعومة وسلاسة.',
      fa: 'آرشه‌کشی پایه پیوسته روی سیم که هر نت با یک جهت آرشه به نرمی نواخته می‌شود.',
    },
    mechanics: {
      contactPoint: 'Kreisler Noktası (Köprü ile Tuşe arası orta bölge)',
      speed: 'Orta ve dengeli yay hızı',
      pressure: 'Sabit işaret parmağı basıncı',
      bowRegion: 'Orta ve Üst Yay (Galamian kuralı)',
    },
    repertoireExample: 'Suzuki Book 1, Kreutzer Etude No. 2, Bach E Majör Konçerto',
  },
  {
    id: 'martele',
    name: 'Martelé (Çekiç Darbeli Yay)',
    origin: 'Fransızca: Çekiçlenmiş',
    category: 'on-string',
    description: {
      tr: 'Her notanın başında işaret parmağıyla anlık "ısırık" (bite/attaque) uygulanır ve aniden serbest bırakılarak keskin, enerjik bir vurgu elde edilir.',
      en: 'An accented, hammered stroke. Initiated with a crisp finger "bite" and released immediately with sudden bow speed.',
      de: 'Gehämmerter Strich mit deutlichem Anfangsakzent (Biss) und scharfer Trennung.',
      ru: 'Акцентированный штрих с резкой атакой («укусом») в начале каждого звука.',
      ja: '弓の毛で弦を噛むようなアタック（バイト）をかけて鋭く発音する奏法。',
      ar: 'ضربة قوية مطرقية تبدأ بعضة حادة من القوس ثم تحرير سريع.',
      fa: 'آرشه‌کشی چکشی با تأکید ناگهانی در ابتدای هر نت و رهاسازی سریع.',
    },
    mechanics: {
      contactPoint: 'Köprüye biraz daha yakın',
      speed: 'Patlayıcı başlangıç hızı, ardından duruş',
      pressure: 'Başta yüksek (bite), çekiş anında rahatlama',
      bowRegion: 'Genellikle yayın üst yarısı veya ucu (Tip)',
    },
    repertoireExample: 'Kreutzer Etude No. 7, Vivaldi Yaz (Presto), Bruch Keman Konçertosu',
  },
  {
    id: 'spiccato',
    name: 'Spiccato (Zıplayan Yay)',
    origin: 'İtalyanca: Ayrılmış, fırlatılmış',
    category: 'off-string',
    description: {
      tr: 'Yayın kendi doğal esnekliği ve bilek hareketi kullanılarak havadan tele düşürülüp geri sektirilmesi tekniği. Hızlı ve kıvrak staccato pasajlar için.',
      en: 'A controlled bouncing stroke off the string utilizing the bow\'s natural center of gravity and supple wrist motion.',
      de: 'Gesteuerter Springbogen, bei dem der Bogen durch Handgelenksbewegung abprallt.',
      ru: 'Прыгающий штрих, при котором смычок падает на струну и отскакивает за счет эластичности трости.',
      ja: '弓の反発力を利用して弦の上で弓を跳ねさせる軽快な奏法。',
      ar: 'تقنية القفز بالقوس على الوتر بحركة معصم مرنة وسريعة.',
      fa: 'تکنیک پرش کنترل‌شده آرشه روی سیم به کمک خاصیت ارتجاعی چوب آرشه و انعطاف مچ.',
    },
    mechanics: {
      contactPoint: 'Tuşeye yakın veya orta bölge',
      speed: 'Kısa, dikey-yatay bilek salınımı',
      pressure: 'Sıfır ek baskı, sadece yerçekimi ve yay esnekliği',
      bowRegion: 'Ağırlık dengesi noktası (Balance Point / Orta kısım)',
    },
    repertoireExample: 'Mendelssohn Keman Konçertosu (3. Bölüm), Sarasate Zigeunerweisen',
  },
  {
    id: 'sautille',
    name: 'Sautillé (Hızlı Kendiliğinden Zıplayan Yay)',
    origin: 'Fransızca: Sıçrayan',
    category: 'off-string',
    description: {
      tr: 'Çok yüksek tempolarda (16lık notalar) el kontrolü yerine yayın ahşap çubuğunun (Pernambuco) kendi kendine mikro-zıplama yapması.',
      en: 'Very rapid bouncing stroke where the elasticity of the stick rebounds autonomously at high speed.',
      de: 'Sehr schneller Spiccato-Strich, bei dem die Bogenstange automatisch vibriert und springt.',
      ru: 'Мелкий виртуозный отскакивающий штрих в быстром темпе.',
      ja: '非常に速いテンポで弓竿自体の弾性により自然に跳躍する高度な奏法。',
      ar: 'قفز سريع جداً وتلقائي للقوس في السرعات العالية.',
      fa: 'پرش خودکار و بسیار سریع چوب آرشه در تمپوهای بالا بدون دخالت مستقیم دست.',
    },
    mechanics: {
      contactPoint: 'Köprüye yakın dengeli alan',
      speed: 'Çok hızlı mikro détaché hareketi',
      pressure: 'Hafif ve gevşek parmak tutuşu',
      bowRegion: 'Yayın tam ortası (Center)',
    },
    repertoireExample: 'Bazzini La Ronde des Lutins, Saint-Saëns Rondo Capriccioso',
  },
  {
    id: 'ricochet',
    name: 'Ricochet / Jeté (Fırlatma Yay)',
    origin: 'Fransızca: Sekme',
    category: 'off-string',
    description: {
      tr: 'Yayın tek bir itiş veya çekişte tele fırlatılması ve ardışık 2, 3, 4 veya daha fazla kez kendiliğinden sekmesi.',
      en: 'The bow is thrown onto the string and allowed to bounce several times in a single bow stroke.',
      de: 'Wurfbogen: Der Bogen wird geworfen und springt mehrfach hintereinander ab.',
      ru: 'Брошенный смычок, отскакивающий несколько раз подряд на одном движении.',
      ja: '弓を弦に投げ落とし、1回のストロークで複数回連続して跳ねさせる奏法。',
      ar: 'رمي القوس على الوتر ليرتد عدة مرات متتالية في حركة واحدة.',
      fa: 'پرتاب آرشه روی سیم به طوری که در یک حرکت چندین بار متوالی کمانه کند.',
    },
    mechanics: {
      contactPoint: 'Köprü ile tuşe arası',
      speed: 'Tek yönlü hızlı fırlatma',
      pressure: 'Fırlatıldıktan sonra serbest salınım',
      bowRegion: 'Üst yarı veya orta',
    },
    repertoireExample: 'Paganini Caprice No. 1 ve Caprice No. 9',
  },
  {
    id: 'sul_ponticello',
    name: 'Sul Ponticello (Köprü Üstünde)',
    origin: 'İtalyanca: Köprüye yakın',
    category: 'special-effects',
    description: {
      tr: 'Yayı doğrudan köprünün hemen bitişiğinde çekerek temel frekansı zayıflatıp yüksek camımsı, metalik ve gizemli doğuşkanları (overtones) ortaya çıkarma tekniği.',
      en: 'Bowing directly next to the bridge, producing a glassy, eerie, high-harmonic shimmer.',
      de: 'Strich dicht am Steg, erzeugt einen metallischen, schillernden Obertonklang.',
      ru: 'Игра у самой подставки, дающая шелестящий, металлический тембр.',
      ja: '駒のすぐ近くを擦ることで、金属性の超高音倍音を強調する特殊奏法。',
      ar: 'العزف بالقرب الشديد من المشط لإنتاج صوت معدني شبحي غني بالهارمونيكس.',
      fa: 'نواختن دقیقاً در مجاورت خرک که صدایی شیشه‌ای، فلزی و سرشار از فرکانس‌های بالا ایجاد می‌کند.',
    },
    mechanics: {
      contactPoint: 'Köprüden 2-3 mm mesafe',
      speed: 'Hızlı ve hafif çekiş',
      pressure: 'Çok hafif (tel boğulmamalı)',
      bowRegion: 'Tam yay boyu',
    },
    repertoireExample: 'Bartók Yaylı Dörtlüleri, Ravel Tzigane, Sibelius Konçerto',
  },
  {
    id: 'sul_tasto',
    name: 'Sul Tasto / Flautando (Tuşe Üstünde)',
    origin: 'İtalyanca: Klavyenin üzerinde',
    category: 'special-effects',
    description: {
      tr: 'Yayın tuşenin (abanoz klavyenin) üzerine getirilerek hızlı ve tüy gibi hafif çekilmesi; flüt benzeri (flautando), yumuşak ve eterik bir ses üretir.',
      en: 'Bowing over the fingerboard with light pressure, creating a soft, flute-like ethereal tone.',
      de: 'Strich über dem Griffbrett für einen weichen, flötenartigen Ton.',
      ru: 'Игра над грифом, создающая мягкий, матовый, флейтовый звук.',
      ja: '指板の上で弓を軽く動かし、フルートのような柔らかく幻想的な音を出す奏法。',
      ar: 'العزف فوق الزند لإنتاج صوت خافت ناعم يشبه الناي.',
      fa: 'آرشه‌کشی بر روی گریف با فشار بسیار ملایم که صدایی شبیه فلوت و اثیری پدید می‌آورد.',
    },
    mechanics: {
      contactPoint: 'Tuşenin 2-5 cm içerisi',
      speed: 'Hızlı yay akışı',
      pressure: 'Minimum tüy hafifliği',
      bowRegion: 'Orta ve uç',
    },
    repertoireExample: 'Debussy Keman Sonatı, Ravel Daphnis et Chloé',
  },
  {
    id: 'col_legno',
    name: 'Col Legno (Ahşap Çubukla Vuruş)',
    origin: 'İtalyanca: Ahşap ile',
    category: 'special-effects',
    description: {
      tr: 'Yayın kılları yerine tahta çubuğu (stick) tele vurularak perküsyona benzer kuru, tıkırtılı ve tekinsiz bir vuruş sesi çıkarılır.',
      en: 'Striking the string with the wooden stick of the bow rather than the hair.',
      de: 'Schlagen der Saite mit dem Holz der Bogenstange.',
      ru: 'Удар по струне древком смычка вместо волоса.',
      ja: '弓の毛ではなく木部（スティック）で弦を叩いて打楽器的な音を出す技法。',
      ar: 'ضرب الأوتار بخشب القوس بدلاً من الشعر لإحداث صوت إيقاعي شبحي.',
      fa: 'کوبیدن چوب آرشه بر روی سیم‌ها به جای موی آرشه برای تولید افکت کوبه‌ای.',
    },
    mechanics: {
      contactPoint: 'Tuşe ortası',
      speed: 'Dikey vur-çek darbesi (Battuto)',
      pressure: 'Hafif darbe (yay çubuğunu korumak için)',
      bowRegion: 'Orta kısım',
    },
    repertoireExample: 'Berlioz Symphonie Fantastique (Witches\' Sabbath), Holst Gezegenler (Mars)',
  },
];

// Complete 1st to 7th Position Note Mapping for Violin (4 Strings)
export const VIOLIN_FINGERBOARD_DATA: ViolinPositionNote[] = [
  // G String (Sol Teli - 196 Hz)
  { string: 'G', finger: 0, position: 1, note: 'G3', frequency: 196.00, solfege: 'Sol3 (Açık Tel)', german: 'G' },
  { string: 'G', finger: 1, position: 1, note: 'A3', frequency: 220.00, solfege: 'La3', german: 'A' },
  { string: 'G', finger: 2, position: 1, note: 'B3', frequency: 246.94, solfege: 'Si3', german: 'H' },
  { string: 'G', finger: 3, position: 1, note: 'C4', frequency: 261.63, solfege: 'Do4', german: 'C' },
  { string: 'G', finger: 4, position: 1, note: 'D4', frequency: 293.66, solfege: 'Re4', german: 'D' },

  // G String - 3rd Position
  { string: 'G', finger: 1, position: 3, note: 'C4', frequency: 261.63, solfege: 'Do4 (1. Parmak)', german: 'C' },
  { string: 'G', finger: 2, position: 3, note: 'D4', frequency: 293.66, solfege: 'Re4', german: 'D' },
  { string: 'G', finger: 3, position: 3, note: 'E4', frequency: 329.63, solfege: 'Mi4', german: 'E' },
  { string: 'G', finger: 4, position: 3, note: 'F4', frequency: 349.23, solfege: 'Fa4', german: 'F' },

  // G String - 5th Position
  { string: 'G', finger: 1, position: 5, note: 'E4', frequency: 329.63, solfege: 'Mi4', german: 'E' },
  { string: 'G', finger: 2, position: 5, note: 'F4', frequency: 349.23, solfege: 'Fa4', german: 'F' },
  { string: 'G', finger: 3, position: 5, note: 'G4', frequency: 392.00, solfege: 'Sol4', german: 'G' },
  { string: 'G', finger: 4, position: 5, note: 'A4', frequency: 440.00, solfege: 'La4', german: 'A' },

  // D String (Re Teli - 293.66 Hz)
  { string: 'D', finger: 0, position: 1, note: 'D4', frequency: 293.66, solfege: 'Re4 (Açık Tel)', german: 'D' },
  { string: 'D', finger: 1, position: 1, note: 'E4', frequency: 329.63, solfege: 'Mi4', german: 'E' },
  { string: 'D', finger: 2, position: 1, note: 'F#4', frequency: 369.99, solfege: 'Fa#4', german: 'Fis' },
  { string: 'D', finger: 3, position: 1, note: 'G4', frequency: 392.00, solfege: 'Sol4', german: 'G' },
  { string: 'D', finger: 4, position: 1, note: 'A4', frequency: 440.00, solfege: 'La4', german: 'A' },

  // D String - 3rd Position
  { string: 'D', finger: 1, position: 3, note: 'G4', frequency: 392.00, solfege: 'Sol4 (1. Parmak)', german: 'G' },
  { string: 'D', finger: 2, position: 3, note: 'A4', frequency: 440.00, solfege: 'La4', german: 'A' },
  { string: 'D', finger: 3, position: 3, note: 'B4', frequency: 493.88, solfege: 'Si4', german: 'H' },
  { string: 'D', finger: 4, position: 3, note: 'C5', frequency: 523.25, solfege: 'Do5', german: 'C' },

  // A String (La Teli - 440.00 Hz)
  { string: 'A', finger: 0, position: 1, note: 'A4', frequency: 440.00, solfege: 'La4 (Kammerton A)', german: 'A' },
  { string: 'A', finger: 1, position: 1, note: 'B4', frequency: 493.88, solfege: 'Si4', german: 'H' },
  { string: 'A', finger: 2, position: 1, note: 'C#5', frequency: 554.37, solfege: 'Do#5', german: 'Cis' },
  { string: 'A', finger: 3, position: 1, note: 'D5', frequency: 587.33, solfege: 'Re5', german: 'D' },
  { string: 'A', finger: 4, position: 1, note: 'E5', frequency: 659.25, solfege: 'Mi5', german: 'E' },

  // A String - 3rd Position
  { string: 'A', finger: 1, position: 3, note: 'D5', frequency: 587.33, solfege: 'Re5 (1. Parmak)', german: 'D' },
  { string: 'A', finger: 2, position: 3, note: 'E5', frequency: 659.25, solfege: 'Mi5', german: 'E' },
  { string: 'A', finger: 3, position: 3, note: 'F#5', frequency: 739.99, solfege: 'Fa#5', german: 'Fis' },
  { string: 'A', finger: 4, position: 3, note: 'G5', frequency: 783.99, solfege: 'Sol5', german: 'G' },

  // E String (Mi Teli - 659.25 Hz - En Tiz Tel)
  { string: 'E', finger: 0, position: 1, note: 'E5', frequency: 659.25, solfege: 'Mi5 (Açık Tel)', german: 'E' },
  { string: 'E', finger: 1, position: 1, note: 'F#5', frequency: 739.99, solfege: 'Fa#5', german: 'Fis' },
  { string: 'E', finger: 2, position: 1, note: 'G#5', frequency: 830.61, solfege: 'Sol#5', german: 'Gis' },
  { string: 'E', finger: 3, position: 1, note: 'A5', frequency: 880.00, solfege: 'La5', german: 'A' },
  { string: 'E', finger: 4, position: 1, note: 'B5', frequency: 987.77, solfege: 'Si5', german: 'H' },

  // E String - 3rd Position
  { string: 'E', finger: 1, position: 3, note: 'A5', frequency: 880.00, solfege: 'La5 (1. Parmak)', german: 'A' },
  { string: 'E', finger: 2, position: 3, note: 'B5', frequency: 987.77, solfege: 'Si5', german: 'H' },
  { string: 'E', finger: 3, position: 3, note: 'C6', frequency: 1046.50, solfege: 'Do6', german: 'C' },
  { string: 'E', finger: 4, position: 3, note: 'D6', frequency: 1174.66, solfege: 'Re6', german: 'D' },

  // E String - 5th Position
  { string: 'E', finger: 1, position: 5, note: 'C6', frequency: 1046.50, solfege: 'Do6', german: 'C' },
  { string: 'E', finger: 2, position: 5, note: 'D6', frequency: 1174.66, solfege: 'Re6', german: 'D' },
  { string: 'E', finger: 3, position: 5, note: 'E6', frequency: 1318.51, solfege: 'Mi6', german: 'E' },
  { string: 'E', finger: 4, position: 5, note: 'F6', frequency: 1396.91, solfege: 'Fa6', german: 'F' },

  // E String - 7th Position (Yüksek Virtüöz Bölgesi)
  { string: 'E', finger: 1, position: 7, note: 'E6', frequency: 1318.51, solfege: 'Mi6 (7. Pozisyon)', german: 'E' },
  { string: 'E', finger: 2, position: 7, note: 'F#6', frequency: 1479.98, solfege: 'Fa#6', german: 'Fis' },
  { string: 'E', finger: 3, position: 7, note: 'G#6', frequency: 1661.22, solfege: 'Sol#6', german: 'Gis' },
  { string: 'E', finger: 4, position: 7, note: 'A6', frequency: 1760.00, solfege: 'La6 (3 Oktav Üstü)', german: 'A' },
];
