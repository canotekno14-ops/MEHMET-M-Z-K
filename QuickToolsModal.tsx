import React, { useState, useEffect, useRef } from 'react';
import { Language } from './types';
import { TRANSLATIONS } from './translations';
import { playMetronomeClick, playAcousticWave } from './audio/synth';
import { X, Play, Square, Volume2, Timer, RotateCcw } from 'lucide-react';

interface QuickToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'metronome' | 'tuner';
  language: Language;
}

export const QuickToolsModal: React.FC<QuickToolsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'metronome',
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'metronome' | 'tuner'>(initialTab);
  
  // Metronome State
  const [bpm, setBpm] = useState<number>(108);
  const [timeSigBeats, setTimeSigBeats] = useState<number>(4);
  const [isPlayingMetronome, setIsPlayingMetronome] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  
  const metronomeTimerRef = useRef<number | null>(null);
  const tapTimesRef = useRef<number[]>([]);

  // Tuner Drone State
  const [concertPitchA, setConcertPitchA] = useState<number>(440);
  const [selectedDroneNote, setSelectedDroneNote] = useState<string>('A4');
  const [isPlayingDrone, setIsPlayingDrone] = useState<boolean>(false);
  const stopDroneFnRef = useRef<(() => void) | null>(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.tr;

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Metronome Loop
  useEffect(() => {
    if (!isPlayingMetronome) {
      if (metronomeTimerRef.current) {
        window.clearInterval(metronomeTimerRef.current);
        metronomeTimerRef.current = null;
      }
      setCurrentBeat(0);
      return;
    }

    const intervalMs = (60 / bpm) * 1000;
    let beatCount = 0;

    // Play immediate first beat
    playMetronomeClick(true);
    setCurrentBeat(1);

    metronomeTimerRef.current = window.setInterval(() => {
      beatCount = (beatCount + 1) % timeSigBeats;
      const isAccent = beatCount === 0;
      playMetronomeClick(isAccent);
      setCurrentBeat(beatCount + 1);
    }, intervalMs);

    return () => {
      if (metronomeTimerRef.current) {
        window.clearInterval(metronomeTimerRef.current);
      }
    };
  }, [isPlayingMetronome, bpm, timeSigBeats]);

  // Handle Drone Stop on unmount/toggle
  const handleToggleDrone = (noteName: string, freq: number) => {
    if (isPlayingDrone && selectedDroneNote === noteName) {
      if (stopDroneFnRef.current) {
        stopDroneFnRef.current();
        stopDroneFnRef.current = null;
      }
      setIsPlayingDrone(false);
      return;
    }

    if (stopDroneFnRef.current) {
      stopDroneFnRef.current();
    }

    setSelectedDroneNote(noteName);
    setIsPlayingDrone(true);
    stopDroneFnRef.current = playAcousticWave(freq, 'sine', 60, 0.4);
  };

  const handleStopAllDrone = () => {
    if (stopDroneFnRef.current) {
      stopDroneFnRef.current();
      stopDroneFnRef.current = null;
    }
    setIsPlayingDrone(false);
  };

  // Tap Tempo calculation
  const handleTapTempo = () => {
    const now = performance.now();
    tapTimesRef.current.push(now);

    if (tapTimesRef.current.length > 4) {
      tapTimesRef.current.shift();
    }

    if (tapTimesRef.current.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (avgInterval > 0) {
        const calculatedBpm = Math.round(60000 / avgInterval);
        if (calculatedBpm >= 30 && calculatedBpm <= 280) {
          setBpm(calculatedBpm);
        }
      }
    }
  };

  if (!isOpen) return null;

  const tempoNames = [
    { label: 'Largo', range: '40–60' },
    { label: 'Adagio', range: '66–76' },
    { label: 'Andante', range: '76–108' },
    { label: 'Moderato', range: '108–120' },
    { label: 'Allegro', range: '120–156' },
    { label: 'Presto', range: '168–200' },
  ];

  const dronePitches = [
    { name: `A4 (${concertPitchA} Hz)`, note: 'A4', freq: concertPitchA, desc: 'Concert Pitch Diapason' },
    { name: 'E5 (659.25 Hz)', note: 'E5', freq: 659.25, desc: 'Violin 1st String (Mi)' },
    { name: 'A4 (440.00 Hz)', note: 'A4_v', freq: 440.0, desc: 'Violin 2nd String (La)' },
    { name: 'D4 (293.66 Hz)', note: 'D4', freq: 293.66, desc: 'Violin 3rd String (Re)' },
    { name: 'G3 (196.00 Hz)', note: 'G3', freq: 196.0, desc: 'Violin 4th String (Sol)' },
    { name: 'C4 (261.63 Hz)', note: 'C4', freq: 261.63, desc: 'Middle C (Piano Central Do)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-750 text-stone-100 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="flex bg-stone-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('metronome')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'metronome' ? 'bg-amber-600 text-white' : 'text-stone-300 hover:text-white'
                }`}
              >
                <Timer className="w-3.5 h-3.5" />
                {t.btnMetronome}
              </button>
              <button
                onClick={() => setActiveTab('tuner')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'tuner' ? 'bg-amber-600 text-white' : 'text-stone-300 hover:text-white'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                {t.btnDroneTuner}
              </button>
            </div>
          </div>
          <button
            onClick={() => {
              setIsPlayingMetronome(false);
              handleStopAllDrone();
              onClose();
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {activeTab === 'metronome' && (
            <div className="space-y-6">
              {/* Visual Pendulum & Beat Lights */}
              <div className="flex flex-col items-center justify-center p-5 bg-stone-950 rounded-xl border border-stone-800">
                <div className="flex items-center gap-2 mb-3">
                  {Array.from({ length: timeSigBeats }).map((_, i) => {
                    const isCurrent = currentBeat === i + 1;
                    const isFirst = i === 0;
                    return (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-100 ${
                          isCurrent
                            ? isFirst
                              ? 'bg-red-500 text-white scale-125 shadow-lg shadow-red-500/50'
                              : 'bg-amber-500 text-stone-950 scale-110 shadow-md shadow-amber-500/40'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {i + 1}
                      </div>
                    );
                  })}
                </div>
                <div className="text-4xl font-extrabold text-stone-50 font-mono tracking-wider">
                  {bpm} <span className="text-sm font-normal text-stone-400">BPM</span>
                </div>
              </div>

              {/* Slider & Quick BPM adjustments */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="30"
                  max="260"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>30 BPM</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBpm((b) => Math.max(30, b - 5))}
                      className="px-2 py-1 bg-stone-800 rounded hover:bg-stone-700 text-stone-200"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => setBpm((b) => Math.max(30, b - 1))}
                      className="px-2 py-1 bg-stone-800 rounded hover:bg-stone-700 text-stone-200"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => setBpm((b) => Math.min(260, b + 1))}
                      className="px-2 py-1 bg-stone-800 rounded hover:bg-stone-700 text-stone-200"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => setBpm((b) => Math.min(260, b + 5))}
                      className="px-2 py-1 bg-stone-800 rounded hover:bg-stone-700 text-stone-200"
                    >
                      +5
                    </button>
                  </div>
                  <span>260 BPM</span>
                </div>
              </div>

              {/* Time Signatures & Tap Tempo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-400 block mb-1.5">
                    Ölçü Vuruş Sayısı:
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {[2, 3, 4, 6].map((num) => (
                      <button
                        key={num}
                        onClick={() => setTimeSigBeats(num)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition ${
                          timeSigBeats === num
                            ? 'bg-amber-600 text-white'
                            : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                        }`}
                      >
                        {num}/4
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-400 block mb-1.5">
                    Tap Tempo:
                  </label>
                  <button
                    onClick={handleTapTempo}
                    className="w-full py-1.5 rounded-lg text-xs font-bold bg-stone-800 hover:bg-stone-700 text-amber-400 border border-amber-500/30 transition flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Ritme Göre Tıkla (Tap)
                  </button>
                </div>
              </div>

              {/* Play / Stop Button */}
              <button
                id="metronome-toggle-btn"
                onClick={() => setIsPlayingMetronome(!isPlayingMetronome)}
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg ${
                  isPlayingMetronome
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30'
                }`}
              >
                {isPlayingMetronome ? (
                  <>
                    <Square className="w-4 h-4 fill-white" />
                    Metronomu Durdur
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    Metronomu Başlat
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'tuner' && (
            <div className="space-y-5">
              {/* Pitch Frequency Selector */}
              <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-300">
                    Standart Referans Diapazon (A4):
                  </span>
                  <div className="flex gap-1.5">
                    {[440, 442, 432].map((hz) => (
                      <button
                        key={hz}
                        onClick={() => setConcertPitchA(hz)}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          concertPitchA === hz
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                        }`}
                      >
                        {hz} Hz
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-stone-400">
                  440Hz modern standart konser akordu, 442Hz Avrupa orkestra parlaklığı, 432Hz ise akustik pisagorik rezonans frekansıdır.
                </p>
              </div>

              {/* Drone Note List */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-400">
                  Sürekli Referans Tonu (Drone Audio):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {dronePitches.map((p) => {
                    const isCurrentPlaying = isPlayingDrone && selectedDroneNote === p.note;
                    return (
                      <button
                        key={p.note}
                        onClick={() => handleToggleDrone(p.note, p.freq)}
                        className={`p-3 rounded-xl text-left border transition flex flex-col justify-between ${
                          isCurrentPlaying
                            ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                            : 'bg-stone-800/80 border-stone-700/60 text-stone-200 hover:bg-stone-800'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold text-sm">{p.name}</span>
                          <Volume2
                            className={`w-4 h-4 ${
                              isCurrentPlaying ? 'text-emerald-400 animate-pulse' : 'text-stone-500'
                            }`}
                          />
                        </div>
                        <span className="text-[11px] text-stone-400 mt-1">{p.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {isPlayingDrone && (
                <button
                  onClick={handleStopAllDrone}
                  className="w-full py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-semibold text-xs transition"
                >
                  Sesi Kapat (Stop Drone)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
