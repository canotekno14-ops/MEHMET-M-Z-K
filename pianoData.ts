import { PianoKeyData } from '../types';

export const PIANO_PEDALS = [
  {
    name: 'Uzatma Pedalı (Damper / Sustain Pedal - Sağ)',
    mechanics: 'Tüm tellerin üzerindeki keçeleri (Damper) yukarı kaldırır.',
    physics: 'Titreşen telin diğer serbest tellerle sempatik rezonansa (Sympathetic Resonance) girmesini sağlar, zengin bir armonik tını halesi oluşturur.',
    technique: 'Senkoplu pedal tekniği (Legato pedal): Akor basıldıktan hemen sonra pedal değiştirilir.',
  },
  {
    name: 'Sostenuto Pedalı (Orta Pedal - Grand Piano)',
    mechanics: 'Yalnızca basıldığı anda tutulmakta olan tuşların keçelerini havada kilitler; sonradan basılan diğer tuşlar normal staccato kalır.',
    physics: 'Bas partisindeki bir org notasını (Pedal Point) uzatırken üst partilerde temiz, kuru staccato pasajlar çalmayı mümkün kılar.',
    technique: 'Debussy, Ravel ve 20. yüzyıl piyano edebiyatında sıkça kullanılır.',
  },
  {
    name: 'Una Corda / Yumuşatma Pedalı (Soft Pedal - Sol)',
    mechanics: 'Kuyruklu piyanoda tüm mekanizmayı (klavye ve çekiçleri) birkaç milimetre sağa kaydırır.',
    physics: 'Çekiç 3 tel yerine 2 tele (veya daha yumuşak kullanılmamış keçe yüzeyine) vurur. Ses seviyesi düşer ve mat, ipeksi, pastel bir tını kazanır.',
    technique: 'Beethoven ve Chopin eserlerinde mistik ve içe dönük pasajlarda kullanılır.',
  },
];

export const PIANO_ANATOMY = [
  {
    part: 'Çift Repitisyon Mekanizması (Double Escapement - Sébastien Érard)',
    role: 'Kuyruklu piyanoların tuşun tamamen yukarı kalkmasını beklemeden, yarı yoldan tekrar çalınabilmesini sağlayan dahi mekanizma.',
    physics: 'Saniyede 15–20 kez hızlı triller ve tekrarlanan notalar (Örn: Ravel Alborada del Gracioso) çalınabilir.',
  },
  {
    part: 'Ses Tahtası (Soundboard - Rezonans Ladini)',
    role: 'Köprüler aracılığıyla tellerin enerjisini havaya akustik ses dalgaları olarak yayan geniş kavisli ahşap plaka.',
    physics: 'Val di Fiemme ladin ağacının hücre yapısı, mekanik enerjiyi havaya %90+ verimle iletir.',
  },
  {
    part: 'Döküm Demir Çerçeve (Cast Iron Plate)',
    role: 'Yaklaşık 230 telin yarattığı devasa 18–20 tonluk toplam çekme kuvvetini taşıyan yekpare iskelet.',
    physics: 'Termal genleşmeyi absorbe ederek akort stabilitesini uzun süre korur.',
  },
  {
    part: 'Çekiçler (Hammers - Yüksek Yoğunluklu Keçe)',
    role: 'Tuşun hareketiyle tele vuran keçe kaplı ahşap çekiçler.',
    physics: 'Keçenin sertliği ve iğnelenme (voicing) durumu piyano tınısının parlak veya mat olmasını belirler.',
  },
];

export const HANON_EXERCISES = [
  {
    id: 1,
    title: 'Hanon No. 1: 5. ve 4. Parmak Bağımsızlığı',
    tempo: '60 - 108 BPM',
    focus: 'Sol el 5-4, Sağ el 1-2 ve 4-5 parmak açılımı ve eşit vuruş kontrolü.',
    description: 'Tüm parmaklar tuş üzerinde kavisli, bilek esnek ve omuz serbest olmalı. Başparmak ve serçe parmağın zayıf bağımsızlığını güçlendirir.',
    pattern: 'Do - Mi - Fa - Sol - La - Sol - Fa - Mi -> Re - Fa - Sol - La - Si...',
  },
  {
    id: 2,
    title: 'Hanon No. 2: 3. ve 4. Parmak Arası Esneklik',
    tempo: '60 - 120 BPM',
    focus: 'Anatomik olarak birbirine bağlı olan 3. ve 4. parmak tendonlarının bağımsızlaştırılması.',
    description: 'Tuşa basarken diğer parmakların gerilmemesi ve havalanmaması esastır. Ağırlık aktarımı (weight transfer).',
    pattern: 'Do - Sol - Fa - Mi - Re - Fa - Mi - Re...',
  },
  {
    id: 5,
    title: 'Hanon No. 5: Tüm Parmakların Senkronizasyonu & Triller',
    tempo: '80 - 132 BPM',
    focus: 'Hızlı süslemeler ve polifonik eşitlik için 5 parmağın kusursuz senkronizasyonu.',
    description: 'Eşit ses hacmi (dynamics) ve kesintisiz legato teması.',
    pattern: 'Do - Mi - Re - Fa - Mi - Sol - Fa - La - Sol...',
  },
];

// Generate 88 Keys (A0 = MIDI 21 to C8 = MIDI 108)
export function generate88Keys(): PianoKeyData[] {
  const keys: PianoKeyData[] = [];
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const solfeges = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
  const germans = ['C', 'Cis', 'D', 'Dis', 'E', 'F', 'Fis', 'G', 'Gis', 'A', 'Ais', 'H'];

  for (let midi = 21; midi <= 108; midi++) {
    const semitoneFromC = (midi - 12) % 12;
    const octave = Math.floor((midi - 12) / 12);
    const pitchName = noteNames[semitoneFromC];
    const isBlack = pitchName.includes('#');
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const note = `${pitchName}${octave}`;

    keys.push({
      note,
      midi,
      freq,
      isBlack,
      octave,
      solfege: `${solfeges[semitoneFromC]}${octave}`,
      german: `${germans[semitoneFromC]}${octave}`,
    });
  }

  return keys;
}
