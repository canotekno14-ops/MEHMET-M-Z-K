import React, { useState, useEffect } from 'react';
import { Language, ClefType } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { INTERVALS, SCALES } from '../data/musicTheoryData';
import { MusicStaff } from './MusicStaff';
import { playPianoNote, noteToFrequency, playAcousticWave } from '../audio/synth';
import confetti from 'canvas-confetti';
import { Trophy, Flame, Play, Volume2, Sparkles, HelpCircle, Check, X } from 'lucide-react';

interface SolfegeSightReadingProps {
  language: Language;
}

export const SolfegeSightReading: React.FC<SolfegeSightReadingProps> = ({ language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.tr;

  const [activeTab, setActiveTab] = useState<'sightReading' | 'earTraining' | 'scales'>('sightReading');

  // Sight Reading Game State
  const [clef, setClef] = useState<ClefType>('treble');
  const [currentNote, setCurrentNote] = useState<string>('C4');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Interval Ear Training Game State
  const [earInterval, setEarInterval] = useState<string>('P5');
  const [rootPitch, setRootPitch] = useState<number>(261.63); // C4
  const [earPlaybackMode, setEarPlaybackMode] = useState<'melodic' | 'harmonic'>('melodic');
  const [earFeedback, setEarFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [earScore, setEarScore] = useState<number>(0);

  // Scale Explorer State
  const [selectedScaleId, setSelectedScaleId] = useState<string>('major');
  const [scaleRootNote, setScaleRootNote] = useState<string>('C4');
  const [isPlayingScale, setIsPlayingScale] = useState<boolean>(false);

  // Generate random sight-reading note
  const generateNewSightNote = () => {
    const trebleNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'];
    const bassNotes = ['E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'];
    const altoNotes = ['F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    const tenorNotes = ['D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4'];

    const pool =
      clef === 'treble'
        ? trebleNotes
        : clef === 'bass'
        ? bassNotes
        : clef === 'alto'
        ? altoNotes
        : tenorNotes;

    const next = pool[Math.floor(Math.random() * pool.length)];
    setCurrentNote(next);
    setFeedback(null);
  };

  // Generate random interval
  const generateNewInterval = () => {
    const randomInterval = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
    const randomRoots = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0];
    const newRoot = randomRoots[Math.floor(Math.random() * randomRoots.length)];

    setEarInterval(randomInterval.id);
    setRootPitch(newRoot);
    setEarFeedback(null);

    // Play immediately
    playIntervalSound(newRoot, randomInterval.semitones, earPlaybackMode);
  };

  const playIntervalSound = (root: number, semitones: number, mode: 'melodic' | 'harmonic') => {
    const targetFreq = root * Math.pow(2, semitones / 12);
    if (mode === 'melodic') {
      playPianoNote(root, 1.0);
      setTimeout(() => {
        playPianoNote(targetFreq, 1.4);
      }, 700);
    } else {
      playPianoNote(root, 1.8);
      playPianoNote(targetFreq, 1.8);
    }
  };

  useEffect(() => {
    generateNewSightNote();
  }, [clef]);

  const handleAnswerSightReading = (answeredLetter: string) => {
    const noteLetter = currentNote[0];
    const isCorrect = noteLetter === answeredLetter;

    // Play audio of note
    const freq = noteToFrequency(currentNote);
    playPianoNote(freq, 1.2);

    if (isCorrect) {
      setFeedback('correct');
      setScore((s) => s + 10);
      const newStreak = streak + 1;
      setStreak(newStreak);

      if (newStreak > 0 && newStreak % 5 === 0) {
        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
        } catch {}
      }

      setTimeout(() => {
        generateNewSightNote();
      }, 600);
    } else {
      setFeedback('wrong');
      setStreak(0);
    }
  };

  const handleAnswerInterval = (chosenId: string) => {
    if (chosenId === earInterval) {
      setEarFeedback('correct');
      setEarScore((s) => s + 10);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch {}
      setTimeout(() => {
        generateNewInterval();
      }, 1000);
    } else {
      setEarFeedback('wrong');
    }
  };

  // Play Scale Sequentially
  const handlePlayScale = () => {
    if (isPlayingScale) return;
    setIsPlayingScale(true);

    const scaleDef = SCALES.find((s) => s.id === selectedScaleId) || SCALES[0];
    const rootHz = noteToFrequency(scaleRootNote);

    scaleDef.intervals.forEach((semitoneOffset, idx) => {
      setTimeout(() => {
        let noteHz = rootHz * Math.pow(2, semitoneOffset / 12);
        // Apply microtonal comma offset if exists
        if (scaleDef.microtonalOffsets && scaleDef.microtonalOffsets[idx]) {
          const centOffset = scaleDef.microtonalOffsets[idx];
          noteHz = noteHz * Math.pow(2, centOffset / 1200);
        }
        playPianoNote(noteHz, 0.9, 0.7);

        if (idx === scaleDef.intervals.length - 1) {
          setTimeout(() => setIsPlayingScale(false), 1000);
        }
      }, idx * 450);
    });
  };

  const noteButtons = [
    { letter: 'C', solfege: 'Do' },
    { letter: 'D', solfege: 'Re' },
    { letter: 'E', solfege: 'Mi' },
    { letter: 'F', solfege: 'Fa' },
    { letter: 'G', solfege: 'Sol' },
    { letter: 'A', solfege: 'La' },
    { letter: 'B', solfege: 'Si' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900 p-3 rounded-2xl border border-stone-800">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('sightReading')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'sightReading' ? 'bg-amber-600 text-white' : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t.gameSightReading}
          </button>
          <button
            onClick={() => {
              setActiveTab('earTraining');
              generateNewInterval();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'earTraining' ? 'bg-amber-600 text-white' : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            {t.gameEarTrain}
          </button>
          <button
            onClick={() => setActiveTab('scales')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'scales' ? 'bg-amber-600 text-white' : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            {t.tabScalesModes}
          </button>
        </div>

        {activeTab === 'sightReading' && (
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1 text-amber-400 font-bold font-mono">
              <Flame className="w-4 h-4" />
              <span>{t.streak}: {streak}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 font-bold font-mono">
              <Trophy className="w-4 h-4" />
              <span>{t.score}: {score}</span>
            </div>
          </div>
        )}
      </div>

      {/* 1. SIGHT READING FLASHCARD GAME */}
      {activeTab === 'sightReading' && (
        <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-stone-50 font-serif">
                Hızlı Nota Deşifre Eğitmeni (Flashcards)
              </h3>
              <p className="text-xs text-stone-400">
                Portedeki notayı tanıyın ve altındaki doğru nota ismine basın.
              </p>
            </div>

            {/* Clef Selector */}
            <div className="flex gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800">
              {(['treble', 'bass', 'alto', 'tenor'] as ClefType[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setClef(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                    clef === c ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Musical Staff Note Display */}
          <div className="flex justify-center p-4">
            <MusicStaff
              clef={clef}
              notes={[{ name: currentNote, highlight: true }]}
              width={340}
              height={140}
            />
          </div>

          {/* Feedback Indicator */}
          <div className="h-6 flex items-center justify-center">
            {feedback === 'correct' && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-4 h-4" /> {t.correct}!
              </span>
            )}
            {feedback === 'wrong' && (
              <span className="text-xs font-bold text-red-400 flex items-center gap-1.5 animate-in fade-in">
                <X className="w-4 h-4" /> {t.incorrect}!
              </span>
            )}
          </div>

          {/* Answer Buttons */}
          <div className="grid grid-cols-7 gap-2 max-w-2xl mx-auto">
            {noteButtons.map((btn) => (
              <button
                key={btn.letter}
                onClick={() => handleAnswerSightReading(btn.letter)}
                className="py-4 rounded-xl bg-stone-950 hover:bg-amber-600 hover:text-white border border-stone-800 text-stone-200 font-bold transition flex flex-col items-center justify-center gap-1 shadow-md active:scale-95"
              >
                <span className="text-lg font-serif">{btn.letter}</span>
                <span className="text-[11px] font-sans text-stone-400 hover:text-stone-100">{btn.solfege}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. INTERVAL EAR TRAINING GAME */}
      {activeTab === 'earTraining' && (
        <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-stone-50 font-serif">
                İşitsel Aralık Tanıma Oyunu (Ear Training)
              </h3>
              <p className="text-xs text-stone-400">
                Çalınan iki nota arasındaki aralığı dinleyip doğru aralığı seçin.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800">
                <button
                  onClick={() => setEarPlaybackMode('melodic')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    earPlaybackMode === 'melodic' ? 'bg-amber-600 text-white' : 'text-stone-400'
                  }`}
                >
                  Melodik (Sırayla)
                </button>
                <button
                  onClick={() => setEarPlaybackMode('harmonic')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    earPlaybackMode === 'harmonic' ? 'bg-amber-600 text-white' : 'text-stone-400'
                  }`}
                >
                  Armonik (Birlikte)
                </button>
              </div>

              <button
                onClick={() => {
                  const target = INTERVALS.find((i) => i.id === earInterval);
                  if (target) playIntervalSound(rootPitch, target.semitones, earPlaybackMode);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Tekrar Dinle
              </button>
            </div>
          </div>

          {/* Feedback */}
          <div className="h-6 flex items-center justify-center">
            {earFeedback === 'correct' && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Doğru! Harika işitsel algı.
              </span>
            )}
            {earFeedback === 'wrong' && (
              <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                <X className="w-4 h-4" /> Yanlış! Tekrar dinleyip deneyin.
              </span>
            )}
          </div>

          {/* Interval Choice Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {INTERVALS.map((inv) => (
              <button
                key={inv.id}
                onClick={() => handleAnswerInterval(inv.id)}
                className="p-3 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-xl text-left transition flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-400 font-mono">{inv.shortName}</span>
                  <span className="text-[10px] text-stone-500">{inv.semitones} Yarım</span>
                </div>
                <div className="text-xs font-bold text-stone-200 mt-1 line-clamp-1">
                  {inv.name[language] || inv.name.tr}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. SCALES, MODES & MAKAMS EXPLORER */}
      {activeTab === 'scales' && (
        <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-stone-50 font-serif">
                Diziler, Kilise Modları & Türk Müziği Makamları
              </h3>
              <p className="text-xs text-stone-400">
                Gam yapıları, aralık formülleri ve sesli çalma simülasyonu.
              </p>
            </div>

            <button
              onClick={handlePlayScale}
              disabled={isPlayingScale}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
                isPlayingScale
                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/30'
              }`}
            >
              <Play className="w-4 h-4 fill-white" />
              {isPlayingScale ? 'Dizi Çalınıyor...' : 'Diziyi Sesli Dinle'}
            </button>
          </div>

          {/* Scale Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {SCALES.map((scale) => {
              const isSelected = selectedScaleId === scale.id;
              return (
                <button
                  key={scale.id}
                  onClick={() => setSelectedScaleId(scale.id)}
                  className={`p-4 rounded-xl text-left border transition flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-md'
                      : 'bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-stone-100">
                      {scale.name[language] || scale.name.tr}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-stone-800 text-stone-400">
                      {scale.type}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    {scale.description[language] || scale.description.tr}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
