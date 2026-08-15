import React, { useState } from 'react';
import { Language, ViolinString } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import {
  VIOLIN_LUTHIERS,
  VIOLIN_ANATOMY,
  BOWING_TECHNIQUES,
  VIOLIN_FINGERBOARD_DATA,
} from '../data/violinData';
import { playViolinNote, playAcousticWave } from '../audio/synth';
import { Activity, Volume2, Shield, Flame, BookOpen, Layers, Sparkles } from 'lucide-react';
import { ViolinVibratoSimulator } from './ViolinVibratoSimulator';

interface ViolinMasterclassProps {
  language: Language;
}

export const ViolinMasterclass: React.FC<ViolinMasterclassProps> = ({ language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.tr;

  const [activeTab, setActiveTab] = useState<'fingerboard' | 'bowing' | 'lefthand' | 'luthiers'>('fingerboard');
  const [selectedPosition, setSelectedPosition] = useState<number>(1);
  const [activeNoteInfo, setActiveNoteInfo] = useState<string | null>('A4 (La4 - 440 Hz)');

  const strings: ViolinString[] = ['E', 'A', 'D', 'G'];

  const handlePlayViolinStop = (freq: number, label: string) => {
    setActiveNoteInfo(label);
    playViolinNote(freq, 2.0, 0.5);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Intro Header */}
      <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4" />
              <span>Section 2: Keman Pedagojisi & Virtüözite</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-50 font-serif">
              {t.violinTitle}
            </h2>
            <p className="text-sm text-stone-400 mt-1 max-w-3xl">
              Cremona & Brescia luthier ekolü, 4 telin 1-7. pozisyon haritası, Galamian & Flesch yay teknikleri ve sol el artikülasyonu.
            </p>
          </div>

          {/* Sub Navigation */}
          <div className="flex flex-wrap gap-1.5 bg-stone-950 p-1.5 rounded-xl border border-stone-800">
            <button
              onClick={() => setActiveTab('fingerboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'fingerboard' ? 'bg-amber-600 text-white' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Tuşe Haritası
            </button>
            <button
              onClick={() => setActiveTab('bowing')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'bowing' ? 'bg-amber-600 text-white' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              {t.tabBowing}
            </button>
            <button
              onClick={() => setActiveTab('lefthand')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'lefthand' ? 'bg-amber-600 text-white' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Sol El & Armonikler
            </button>
            <button
              onClick={() => setActiveTab('luthiers')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'luthiers' ? 'bg-amber-600 text-white' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Luthier & Anatomi
            </button>
          </div>
        </div>
      </div>

      {/* 1. INTERACTIVE VIOLIN FINGERBOARD (TUŞE) */}
      {activeTab === 'fingerboard' && (
        <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-stone-50 font-serif">
                İnteraktif Keman Klavyesi (Violin Fingerboard Matrix)
              </h3>
              <p className="text-xs text-stone-400">
                Sol el parmak basışlarına tıklayarak yaylı keman tınısını dinleyin.
              </p>
            </div>

            {/* Position Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-400">Pozisyon:</span>
              <div className="flex gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800">
                {[1, 3, 5, 7].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setSelectedPosition(pos)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      selectedPosition === pos ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {pos}. Pozisyon
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Note Readout */}
          <div className="flex items-center justify-between p-3.5 bg-stone-950 rounded-xl border border-stone-800">
            <span className="text-xs text-stone-400">Aktif Çalınan Nota & Frekans:</span>
            <span className="text-sm font-bold text-amber-400 font-mono flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-500 animate-pulse" />
              {activeNoteInfo}
            </span>
          </div>

          {/* Visual Wooden Fingerboard Grid */}
          <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 shadow-2xl relative overflow-x-auto">
            <div className="min-w-[640px] space-y-4">
              {strings.map((str) => {
                const strNotes = VIOLIN_FINGERBOARD_DATA.filter(
                  (n) => n.string === str && (n.position === selectedPosition || (selectedPosition === 1 && n.finger === 0))
                );

                const stringColors: Record<ViolinString, { line: string; badge: string; name: string }> = {
                  E: { line: 'bg-amber-200', badge: 'text-amber-300 border-amber-500/30', name: 'Mi (E5 - 659.25Hz)' },
                  A: { line: 'bg-amber-400', badge: 'text-amber-400 border-amber-500/30', name: 'La (A4 - 440.00Hz)' },
                  D: { line: 'bg-amber-600', badge: 'text-amber-500 border-amber-500/30', name: 'Re (D4 - 293.66Hz)' },
                  G: { line: 'bg-amber-800', badge: 'text-amber-600 border-amber-500/30', name: 'Sol (G3 - 196.00Hz)' },
                };

                return (
                  <div key={str} className="relative flex items-center gap-4 py-2">
                    {/* String Name Pill */}
                    <div className="w-40 flex items-center justify-between px-3 py-2 bg-stone-900 rounded-xl border border-stone-800">
                      <span className="font-bold text-xs text-stone-200">{str} Teli</span>
                      <span className="text-[10px] text-stone-400 font-mono">{stringColors[str].name.split(' ')[0]}</span>
                    </div>

                    {/* Fretless Fingerboard Line */}
                    <div className="flex-1 relative flex items-center justify-between px-6 py-4 bg-stone-900/60 rounded-xl border border-stone-800/80">
                      {/* String Visual Line */}
                      <div className={`absolute left-0 right-0 h-0.5 ${stringColors[str].line} opacity-40`} />

                      {/* Finger Stop Buttons */}
                      {strNotes.map((noteItem, idx) => {
                        const labelText = `${noteItem.note} (${noteItem.solfege}) - ${noteItem.frequency.toFixed(2)} Hz`;
                        return (
                          <button
                            key={idx}
                            onClick={() => handlePlayViolinStop(noteItem.frequency, labelText)}
                            className="relative z-10 w-12 h-12 rounded-xl bg-stone-950 hover:bg-amber-600 border border-stone-700 hover:border-amber-500 text-stone-200 hover:text-white flex flex-col items-center justify-center transition shadow-lg active:scale-95 group"
                          >
                            <span className="text-xs font-black font-serif group-hover:text-white">
                              {noteItem.note}
                            </span>
                            <span className="text-[9px] font-mono text-amber-400 group-hover:text-amber-200">
                              {noteItem.finger === 0 ? 'Açık' : `${noteItem.finger}. P.`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. BOWING MASTERCLASS GLOSSARY & MECHANICS */}
      {activeTab === 'bowing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BOWING_TECHNIQUES.map((tech) => (
              <div
                key={tech.id}
                className="bg-stone-900 p-5 rounded-2xl border border-stone-800 shadow-lg space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-bold text-base text-stone-100 font-serif">{tech.name}</h4>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-stone-800 text-amber-400">
                      {tech.category}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed mb-3">
                    {tech.description[language] || tech.description.tr}
                  </p>

                  {/* Physics & Mechanics Grid */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-stone-950 rounded-xl border border-stone-800 text-[11px]">
                    <div>
                      <span className="text-stone-500 block">Temas Noktası:</span>
                      <span className="text-stone-300 font-medium">{tech.mechanics.contactPoint}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Yay Hızı:</span>
                      <span className="text-stone-300 font-medium">{tech.mechanics.speed}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Basınç (Weight):</span>
                      <span className="text-stone-300 font-medium">{tech.mechanics.pressure}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Yay Bölgesi:</span>
                      <span className="text-stone-300 font-medium">{tech.mechanics.bowRegion}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-800 text-[11px] text-amber-400/80">
                  <span className="font-semibold text-stone-400">Repertuvar:</span> {tech.repertoireExample}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. LEFT HAND MECHANICS, VIBRATO ANIMATION & HARMONICS */}
      {activeTab === 'lefthand' && (
        <div className="space-y-6">
          {/* Realtime 60 FPS Vibrato Kinematics & Finger Motion Simulator */}
          <ViolinVibratoSimulator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vibrato Mastery Theory */}
            <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-lg space-y-4">
              <h4 className="font-bold text-base text-stone-100 font-serif flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                Vibrato Mekaniği & Akustik Frekans Modülasyonu
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Vibrato, notanın temel frekansı etrafında saniyede 5–6 kez (5.5 Hz) periyodik mikro-frekans salınımı (yaklaşık ±20-30 sent) yapılmasıdır.
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <span className="font-bold text-xs text-amber-400 block">1. Kol Vibratosu (Arm Vibrato):</span>
                  <span className="text-[11px] text-stone-400">Ön kolun dirsekten ileri-geri salınımı; yoğun ve geniş dramatik ton (Bruch, Çaykovski).</span>
                </div>
                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <span className="font-bold text-xs text-amber-400 block">2. Bilek Vibratosu (Wrist Vibrato):</span>
                  <span className="text-[11px] text-stone-400">El ayasının sapa değmeden esnek salınımı; hızlı, parlak ve zarif ton (Mozart, Kreisler).</span>
                </div>
                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <span className="font-bold text-xs text-amber-400 block">3. Parmak Vibratosu (Finger Vibrato):</span>
                  <span className="text-[11px] text-stone-400">Parmak ekleminin mikro-bükülüşü; yüksek pozisyonlarda (5-7. pozisyon) dar ve hassas tonlama.</span>
                </div>
              </div>
            </div>

            {/* Harmonics & Tartini Difference Tones */}
            <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-lg space-y-4">
              <h4 className="font-bold text-base text-stone-100 font-serif flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                Doğal & Yapay Armonikler (Harmonics)
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Telin düğüm noktalarına (nodes) parmağın hafifçe dokundurulmasıyla üretilen flüt benzeri kristal sesler.
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-stone-200">A4 Teli Doğal Oktav Armoniği (A5 - 880 Hz)</span>
                    <span className="text-[10px] text-stone-400 block">Telin tam ortasına (1/2) 4. parmak tüy dokunuşu</span>
                  </div>
                  <button
                    onClick={() => playAcousticWave(880, 'sine', 2.0, 0.4)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
                  >
                    Dinle
                  </button>
                </div>
                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-stone-200">E5 Teli 3. Armonik (B6 - 1975 Hz)</span>
                    <span className="text-[10px] text-stone-400 block">Telin 1/3 düğüm noktasına hafif dokunuş</span>
                  </div>
                  <button
                    onClick={() => playAcousticWave(1975.5, 'sine', 2.0, 0.3)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
                  >
                    Dinle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. HISTORICAL LUTHIERS & ANATOMY */}
      {activeTab === 'luthiers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VIOLIN_LUTHIERS.map((lut, idx) => (
              <div key={idx} className="bg-stone-900 p-5 rounded-2xl border border-stone-800 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-amber-400 font-serif">{lut.name}</h4>
                  <span className="text-[10px] text-stone-400 px-2 py-0.5 bg-stone-950 rounded border border-stone-800">
                    {lut.city}
                  </span>
                </div>
                <div className="text-xs font-semibold text-stone-300">{lut.period}</div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {lut.description[language] || lut.description.tr}
                </p>
              </div>
            ))}
          </div>

          {/* Anatomy Breakdown */}
          <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-lg space-y-4">
            <h4 className="font-bold text-base text-stone-100 font-serif">
              Kemanın İç Akustiği & Mekanik Mimarisi
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {VIOLIN_ANATOMY.map((anat, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5">
                  <span className="font-bold text-xs text-amber-400 block">{anat.part}</span>
                  <p className="text-[11px] text-stone-300">{anat.role}</p>
                  <p className="text-[10px] text-stone-500 italic">{anat.physics}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
