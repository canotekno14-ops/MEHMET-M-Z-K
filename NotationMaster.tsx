import React, { useState } from 'react';
import { Language, ClefType } from './types';
import { TRANSLATIONS } from './translations';
import { NOTE_VALUES, TIME_SIGNATURES } from './data/musicTheoryData';
import { MusicStaff } from './MusicStaff';
import { playMetronomeClick, playPianoNote } from './audio/synth';
import { Clock, Music, CheckCircle2, RotateCcw } from 'lucide-react';

interface NotationMasterProps {
  language: Language;
}

export const NotationMaster: React.FC<NotationMasterProps> = ({ language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.tr;

  const [selectedNoteValue, setSelectedNoteValue] = useState<string>('crotchet');
  const [selectedClef, setSelectedClef] = useState<ClefType>('treble');
  const [selectedTimeSig, setSelectedTimeSig] = useState<string>('4/4');

  // Interactive Rhythm Tap Game State
  const [isTapping, setIsTapping] = useState<boolean>(false);
  const [tapScore, setTapScore] = useState<number | null>(null);
  const [tapHistory, setTapHistory] = useState<string[]>([]);
  const tapStartTimeRef = React.useRef<number | null>(null);
  const tapCountRef = React.useRef<number>(0);

  const activeNote = NOTE_VALUES.find((n) => n.id === selectedNoteValue) || NOTE_VALUES[3];

  const handleStartTapTrainer = () => {
    setIsTapping(true);
    setTapScore(null);
    setTapHistory([]);
    tapCountRef.current = 0;
    tapStartTimeRef.current = performance.now();

    playMetronomeClick(true);
  };

  const handleUserTap = () => {
    if (!isTapping || !tapStartTimeRef.current) return;

    playPianoNote(523.25, 0.2); // C5 percussive note feedback
    tapCountRef.current += 1;
    const now = performance.now();
    const elapsed = now - tapStartTimeRef.current;
    const expectedTime = tapCountRef.current * 600; // 100 BPM = 600ms per beat
    const diff = Math.abs(elapsed - expectedTime);

    let rating = 'Mükemmel (Perfect)';
    if (diff < 40) rating = '🎯 Kusursuz (+/- 30ms)';
    else if (diff < 90) rating = '👍 İyi (+/- 80ms)';
    else rating = '⚡ Erken / Geç (+/- ' + Math.round(diff) + 'ms)';

    setTapHistory((prev) => [rating, ...prev.slice(0, 4)]);

    if (tapCountRef.current >= 8) {
      setIsTapping(false);
      setTapScore(94);
    }
  };

  // Demo notes on staff for selected clef
  const clefSampleNotes: Record<ClefType, Array<{ name: string; label: string }>> = {
    treble: [
      { name: 'C4', label: 'Do4 (Orta Do)' },
      { name: 'E4', label: 'Mi4 (1. Çizgi)' },
      { name: 'G4', label: 'Sol4 (2. Çizgi)' },
      { name: 'B4', label: 'Si4 (3. Çizgi)' },
      { name: 'D5', label: 'Re5 (4. Çizgi)' },
      { name: 'F5', label: 'Fa5 (5. Çizgi)' },
    ],
    bass: [
      { name: 'G2', label: 'Sol2 (1. Çizgi)' },
      { name: 'B2', label: 'Si2 (2. Çizgi)' },
      { name: 'D3', label: 'Re3 (3. Çizgi)' },
      { name: 'F3', label: 'Fa3 (4. Çizgi)' },
      { name: 'A3', label: 'La3 (5. Çizgi)' },
      { name: 'C4', label: 'Do4 (Orta Do)' },
    ],
    alto: [
      { name: 'F3', label: 'Fa3 (1. Çizgi)' },
      { name: 'A3', label: 'La3 (2. Çizgi)' },
      { name: 'C4', label: 'Do4 (3. Çizgi - Merkez)' },
      { name: 'E4', label: 'Mi4 (4. Çizgi)' },
      { name: 'G4', label: 'Sol4 (5. Çizgi)' },
    ],
    tenor: [
      { name: 'D3', label: 'Re3 (1. Çizgi)' },
      { name: 'F3', label: 'Fa3 (2. Çizgi)' },
      { name: 'A3', label: 'La3 (3. Çizgi)' },
      { name: 'C4', label: 'Do4 (4. Çizgi - Merkez)' },
      { name: 'E4', label: 'Mi4 (5. Çizgi)' },
    ],
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Intro Header */}
      <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-xl">
        <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider mb-1">
          <Clock className="w-4 h-4" />
          <span>Section 1.2: Nota Değerleri & Ritmik Morfoloji</span>
        </div>
        <h2 className="text-2xl font-bold text-stone-50 font-serif">
          {t.notationTitle}
        </h2>
        <p className="text-sm text-stone-400 mt-1 max-w-3xl">
          Breve\'den Altmışdörtlüğe tüm süre birimleri, esler, bileşik & aksak ölçü zamanları ve 4 temel anahtarın (Sol, Fa, Alto, Tenor) analizi.
        </p>
      </div>

      {/* Note Values & Durations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Duration Cards */}
        <div className="lg:col-span-7 bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-lg space-y-4">
          <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
            <Music className="w-4 h-4 text-amber-500" />
            Tüm Nota Değerleri ve Süre Oranları
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {NOTE_VALUES.map((nv) => {
              const isSelected = selectedNoteValue === nv.id;
              return (
                <button
                  key={nv.id}
                  onClick={() => setSelectedNoteValue(nv.id)}
                  className={`p-3 rounded-xl text-left border transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-md'
                      : 'bg-stone-950/70 border-stone-800 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-400">{nv.fraction}</span>
                    <span className="text-xs text-stone-400 font-mono">{nv.beats} vuruş</span>
                  </div>
                  <div className="text-xs font-bold mt-2 text-stone-100 line-clamp-1">
                    {nv.name[language] || nv.name.tr}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-1">
                    {nv.restName[language] || nv.restName.tr}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Note Deep Dive Card */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-amber-400">
                {activeNote.name[language] || activeNote.name.tr}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 bg-stone-800 text-stone-300 rounded">
                Değer: {activeNote.beats} Vuruş ({activeNote.fraction})
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {activeNote.description[language] || activeNote.description.tr}
            </p>
          </div>
        </div>

        {/* Right: Interactive Rhythm Tap Trainer */}
        <div className="lg:col-span-5 bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-stone-100 text-sm">
                Ritim Vuruş & İç Nabız Eğitmeni (Tap Trainer)
              </h3>
              <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                100 BPM
              </span>
            </div>
            <p className="text-xs text-stone-400 mb-4">
              Metronom nabzını yakalayın ve düğmeye eşit aralıklarla basarak iç ritim duyunuzu test edin.
            </p>

            {/* Interactive Tap Area */}
            <div className="p-6 bg-stone-950 rounded-xl border border-stone-800 flex flex-col items-center justify-center text-center space-y-3">
              {isTapping ? (
                <button
                  onClick={handleUserTap}
                  className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 font-black text-base shadow-xl shadow-amber-600/40 active:scale-95 transition flex flex-col items-center justify-center cursor-pointer select-none"
                >
                  <span>VUR!</span>
                  <span className="text-[10px] font-mono mt-0.5">({tapCountRef.current}/8)</span>
                </button>
              ) : (
                <button
                  onClick={handleStartTapTrainer}
                  className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-lg flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Ritim Testini Başlat
                </button>
              )}

              {/* Tap Log */}
              <div className="min-h-[60px] w-full flex flex-col items-center justify-center">
                {tapHistory.length > 0 ? (
                  <div className="text-xs font-semibold text-emerald-400 animate-in fade-in">
                    {tapHistory[0]}
                  </div>
                ) : (
                  <div className="text-xs text-stone-500">
                    {isTapping ? 'Eşit aralıklarla düğmeye basın!' : 'Başlat düğmesine basarak testi başlatın.'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {tapScore !== null && (
            <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">Ritmik Hassasiyet Skoru:</span>
              <span className="text-base font-black text-emerald-400 font-mono">%{tapScore}</span>
            </div>
          )}
        </div>
      </div>

      {/* Time Signatures & Aksak Rhythms Matrix */}
      <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-lg space-y-4">
        <h3 className="text-base font-bold text-stone-100 font-serif">
          Ölçü Zamanları (Time Signatures) & Aksak Usuller
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {TIME_SIGNATURES.map((ts) => (
            <div
              key={ts.id}
              className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex flex-col justify-between space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-amber-400 font-serif tracking-tight">{ts.id}</span>
                <span className="text-[11px] font-semibold text-stone-400 px-2 py-0.5 bg-stone-800 rounded">
                  {ts.type}
                </span>
              </div>
              <div className="text-xs text-stone-300 font-mono font-semibold">
                Sayım: {ts.count}
              </div>
              <p className="text-[11px] text-stone-400">
                {ts.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Clef Visualization with Real Music Staff */}
      <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-100 font-serif">
              4 Temel Portre Anahtarı (Clefs Comparison)
            </h3>
            <p className="text-xs text-stone-400">
              Sol (Treble), Fa (Bass), Do-3 (Alto/Viyola) ve Do-4 (Tenor/Çello) anahtarlarında nota konumları.
            </p>
          </div>

          <div className="flex gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800">
            {(['treble', 'bass', 'alto', 'tenor'] as ClefType[]).map((c) => (
              <button
                key={c}
                onClick={() => setSelectedClef(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  selectedClef === c ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Music Staff Display */}
        <div className="flex justify-center">
          <MusicStaff
            clef={selectedClef}
            notes={clefSampleNotes[selectedClef]}
            width={600}
            height={160}
          />
        </div>
      </div>
    </div>
  );
};
