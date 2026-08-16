import React, { useState, useEffect } from 'react';
import { Language, PianoKeyData } from '../types';
import { TRANSLATIONS } from './translations';
import { generate88Keys, PIANO_PEDALS, PIANO_ANATOMY, HANON_EXERCISES } from '../data/pianoData';
import { CHORDS } from '../data/musicTheoryData';
import { playPianoNote, noteToFrequency } from '../audio/synth';
import { Disc, Volume2, Sparkles, Layers, Shield } from 'lucide-react';

interface PianoMasterclassProps {
  language: Language;
}

export const PianoMasterclass: React.FC<PianoMasterclassProps> = ({ language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.tr;

  const [allKeys] = useState<PianoKeyData[]>(() => generate88Keys());
  const [octaveOffset, setOctaveOffset] = useState<number>(3); // Default view C3 to C6
  const [isSustainOn, setIsSustainOn] = useState<boolean>(false);
  const [activeChordId, setActiveChordId] = useState<string>('maj');
  const [chordRootNote, setChordRootNote] = useState<string>('C');
  const [activeTab, setActiveTab] = useState<'keyboard' | 'hanon' | 'pedals'>('keyboard');

  // Filter keys for the visible 3 octaves
  const visibleKeys = allKeys.filter(
    (k) => k.octave >= octaveOffset && k.octave <= octaveOffset + 2
  );

  const activeChord = CHORDS.find((c) => c.id === activeChordId) || CHORDS[0];

  // Calculate active highlighted MIDI notes for selected chord
  const getChordActiveNotes = () => {
    const rootSemitone = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(chordRootNote);
    const baseMidi = 60 + rootSemitone; // Middle octave
    return activeChord.intervals.map((interval) => baseMidi + interval);
  };

  const activeChordMidiNotes = getChordActiveNotes();

  const handlePlayKey = (freq: number) => {
    playPianoNote(freq, isSustainOn ? 3.5 : 1.2, 0.7);
  };

  // Play Full Chord at Once (Arm-weight resonance)
  const handlePlayChord = () => {
    activeChordMidiNotes.forEach((midi) => {
      const keyData = allKeys.find((k) => k.midi === midi);
      if (keyData) {
        playPianoNote(keyData.freq, isSustainOn ? 3.5 : 1.5, 0.6);
      }
    });
  };

  // Keyboard Event Listeners for Computer Keyboard Piano
  useEffect(() => {
    const keyMap: Record<string, number> = {
      a: 60, // C4
      w: 61, // C#4
      s: 62, // D4
      e: 63, // D#4
      d: 64, // E4
      f: 65, // F4
      t: 66, // F#4
      g: 67, // G4
      y: 68, // G#4
      h: 69, // A4
      u: 70, // A#4
      j: 71, // B4
      k: 72, // C5
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSustainOn((prev) => !prev);
        return;
      }
      const midi = keyMap[e.key.toLowerCase()];
      if (midi) {
        const keyData = allKeys.find((k) => k.midi === midi);
        if (keyData) handlePlayKey(keyData.freq);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allKeys, isSustainOn]);

  const whiteKeys = visibleKeys.filter((k) => !k.isBlack);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Intro Header */}
      <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider mb-1">
              <Disc className="w-4 h-4" />
              <span>Section 3: Piyano Pedagojisi & 88-Tuş Klavyatür</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-50 font-serif">
              {t.pianoTitle}
            </h2>
            <p className="text-sm text-stone-400 mt-1 max-w-3xl">
              88-Tuş akustik simülatör, polifonik akor & gam dizilimleri, Hanon No. 1–60 bağımsızlık egzersizleri ve 3 pedal fiziği.
            </p>
          </div>

          {/* Sub Navigation */}
          <div className="flex flex-wrap gap-1.5 bg-stone-950 p-1.5 rounded-xl border border-stone-800">
            <button
              onClick={() => setActiveTab('keyboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'keyboard' ? 'bg-amber-600 text-white' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Disc className="w-3.5 h-3.5" />
              Piyano Klavyesi & Akorlar
            </button>
            <button
              onClick={() => setActiveTab('hanon')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'hanon' ? 'bg-amber-600 text-white' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Hanon Egzersizleri
            </button>
            <button
              onClick={() => setActiveTab('pedals')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'pedals' ? 'bg-amber-600 text-white' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              3 Pedal & Anatomi
            </button>
          </div>
        </div>
      </div>

      {/* 1. INTERACTIVE 88-KEY GRAND PIANO */}
      {activeTab === 'keyboard' && (
        <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-xl space-y-6">
          {/* Controls Bar: Octave, Sustain, Chord Overlay */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-stone-950 rounded-xl border border-stone-800">
            {/* Octave Viewport */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400 font-semibold">Oktav Bölgesi:</span>
              <div className="flex gap-1 bg-stone-900 p-1 rounded-lg border border-stone-800">
                {[1, 2, 3, 4, 5].map((oct) => (
                  <button
                    key={oct}
                    onClick={() => setOctaveOffset(oct)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                      octaveOffset === oct ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    C{oct}–C{oct + 2}
                  </button>
                ))}
              </div>
            </div>

            {/* Chord Highlighter Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400 font-semibold">Akor Seç:</span>
              <select
                value={chordRootNote}
                onChange={(e) => setChordRootNote(e.target.value)}
                className="bg-stone-900 border border-stone-700 text-stone-100 text-xs rounded-lg px-2.5 py-1.5 font-bold focus:outline-none focus:border-amber-500"
              >
                {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>

              <select
                value={activeChordId}
                onChange={(e) => setActiveChordId(e.target.value)}
                className="bg-stone-900 border border-stone-700 text-stone-100 text-xs rounded-lg px-2.5 py-1.5 font-bold focus:outline-none focus:border-amber-500"
              >
                {CHORDS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName ? c.fullName[language] || c.fullName.tr : c.name} ({c.formula})
                  </option>
                ))}
              </select>

              <button
                onClick={handlePlayChord}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-md"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Akoru Çal
              </button>
            </div>

            {/* Sustain Pedal Toggle */}
            <button
              onClick={() => setIsSustainOn(!isSustainOn)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                isSustainOn
                  ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-md shadow-amber-500/20'
                  : 'bg-stone-900 border-stone-700 text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>{t.sustainPedal}:</span>
              <span className={isSustainOn ? 'text-amber-400' : 'text-stone-500'}>
                {isSustainOn ? 'AÇIK (Space)' : 'KAPALI'}
              </span>
            </button>
          </div>

          {/* Piano Keyboard Visual Rendering */}
          <div className="p-6 bg-stone-950 rounded-2xl border border-stone-800 shadow-2xl overflow-x-auto select-none">
            <div className="relative inline-flex h-56 min-w-full justify-center">
              {/* White Keys */}
              {whiteKeys.map((key) => {
                const isHighlighted = activeChordMidiNotes.includes(key.midi);
                return (
                  <button
                    key={key.note}
                    onClick={() => handlePlayKey(key.freq)}
                    className={`relative w-12 h-56 rounded-b-lg border border-stone-300 flex flex-col justify-end items-center pb-3 transition active:bg-stone-200 shadow-md ${
                      isHighlighted
                        ? 'bg-amber-200 text-amber-950 ring-2 ring-amber-500 z-10'
                        : 'bg-white text-stone-900'
                    }`}
                  >
                    <span className="text-[11px] font-bold font-serif">{key.note}</span>
                    <span className="text-[9px] text-stone-500">{key.solfege}</span>
                  </button>
                );
              })}

              {/* Black Keys (Overlayed Absolutely) */}
              <div className="absolute top-0 left-0 right-0 h-36 flex justify-center pointer-events-none">
                {visibleKeys.map((key, idx) => {
                  if (!key.isBlack) return null;
                  const isHighlighted = activeChordMidiNotes.includes(key.midi);

                  // Calculate rough horizontal offset
                  // Find white keys before this note
                  const whiteKeysBefore = visibleKeys
                    .slice(0, idx)
                    .filter((k) => !k.isBlack).length;
                  const leftPx = whiteKeysBefore * 48 - 14;

                  return (
                    <button
                      key={key.note}
                      onClick={() => handlePlayKey(key.freq)}
                      style={{ position: 'absolute', left: `${leftPx}px` }}
                      className={`pointer-events-auto w-7 h-36 rounded-b-md border border-stone-900 flex flex-col justify-end items-center pb-2 z-20 shadow-xl transition active:bg-stone-800 ${
                        isHighlighted
                          ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                          : 'bg-stone-950 text-stone-300'
                      }`}
                    >
                      <span className="text-[9px] font-bold font-serif">{key.note}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Keyboard shortcut legend */}
            <div className="text-center text-[11px] text-stone-500 mt-4">
              Bilgisayar klavyesinden <span className="text-stone-300 font-mono">A, W, S, E, D, F, T, G, Y, H, U, J, K</span> tuşları ile çalabilir, <span className="text-stone-300 font-mono">Space</span> ile Sustain Pedalını açıp kapatabilirsiniz.
            </div>
          </div>

          {/* Chord Fingering & Inversion Analysis */}
          <div className="p-5 bg-stone-950 rounded-xl border border-stone-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-amber-400 mb-1">
                Akor Yapısı & Aralıklar:
              </div>
              <p className="text-xs text-stone-300">
                {activeChord.fullName ? activeChord.fullName[language] || activeChord.fullName.tr : activeChord.name} — Formül: {activeChord.formula} ({activeChord.category})
              </p>
            </div>
            <div>
              <div className="text-xs font-bold text-amber-400 mb-1">
                Klasik Parmak Numaraları (Fingering):
              </div>
              <p className="text-xs text-stone-300 font-mono">
                Sağ El (RH): 1 - 3 - 5 | Sol El (LH): 5 - 3 - 1
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. HANON EXERCISES */}
      {activeTab === 'hanon' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {HANON_EXERCISES.map((ex) => (
              <div
                key={ex.id}
                className="bg-stone-900 p-5 rounded-2xl border border-stone-800 shadow-lg space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-base text-amber-400 font-serif">{ex.title.split(':')[0]}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-950 text-stone-300 border border-stone-800">
                      {ex.tempo}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-stone-200 mb-2">{ex.focus}</div>
                  <p className="text-xs text-stone-400 leading-relaxed mb-3">
                    {ex.description}
                  </p>
                </div>
                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-[11px] font-mono text-amber-300">
                  Model: {ex.pattern}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. PEDALS & ANATOMY */}
      {activeTab === 'pedals' && (
        <div className="space-y-6">
          {/* 3 Pedals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PIANO_PEDALS.map((ped, idx) => (
              <div key={idx} className="bg-stone-900 p-5 rounded-2xl border border-stone-800 shadow-lg space-y-2.5">
                <h4 className="font-bold text-sm text-amber-400 font-serif">{ped.name}</h4>
                <p className="text-xs text-stone-300"><span className="text-stone-500 font-semibold">Mekanik:</span> {ped.mechanics}</p>
                <p className="text-xs text-stone-400 italic"><span className="text-stone-500 font-semibold">Akustik:</span> {ped.physics}</p>
                <div className="pt-2 border-t border-stone-800 text-[11px] text-amber-300/80">
                  <span className="font-semibold text-stone-400">Teknik:</span> {ped.technique}
                </div>
              </div>
            ))}
          </div>

          {/* Anatomy */}
          <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-lg space-y-4">
            <h4 className="font-bold text-base text-stone-100 font-serif">
              Kuyruklu Piyano Akustik Anatomisi (Double Escapement & Soundboard)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PIANO_ANATOMY.map((anat, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5">
                  <span className="font-bold text-xs text-amber-400 block">{anat.part}</span>
                  <p className="text-xs text-stone-300">{anat.role}</p>
                  <p className="text-[11px] text-stone-500 italic">{anat.physics}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
