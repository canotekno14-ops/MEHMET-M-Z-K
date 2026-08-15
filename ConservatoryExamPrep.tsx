import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import {
  playPianoNote,
  playHarmonicChord,
  playClapSound,
  playPencilTapSound,
  noteToFrequency,
} from '../audio/synth';
import confetti from 'canvas-confetti';
import {
  Play,
  Square,
  Volume2,
  Mic,
  Timer,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Trophy,
  RotateCcw,
  Music,
  Radio,
  Sliders,
  Flame,
  Zap,
} from 'lucide-react';

interface ConservatoryExamPrepProps {
  language: Language;
}

type ExamType = 'single_tone' | 'two_tone' | 'three_tone' | 'melody' | 'rhythm';

interface ScaleDefinition {
  name: string;
  tonality: string;
  notes: Array<{ name: string; solfege: string; freq: number }>;
}

const CONSERVATORY_SCALES: ScaleDefinition[] = [
  {
    name: 'Do Majör (C Major)',
    tonality: 'Tonal Majör (Do-Re-Mi-Fa-Sol-La-Si-Do)',
    notes: [
      { name: 'C4', solfege: 'Do 4', freq: 261.63 },
      { name: 'D4', solfege: 'Re 4', freq: 293.66 },
      { name: 'E4', solfege: 'Mi 4', freq: 329.63 },
      { name: 'F4', solfege: 'Fa 4', freq: 349.23 },
      { name: 'G4', solfege: 'Sol 4', freq: 392.0 },
      { name: 'A4', solfege: 'La 4', freq: 440.0 },
      { name: 'B4', solfege: 'Si 4', freq: 493.88 },
      { name: 'C5', solfege: 'Do 5', freq: 523.25 },
    ],
  },
  {
    name: 'Sol Majör (G Major)',
    tonality: '1 Diyezli Tonal Majör (Fa#)',
    notes: [
      { name: 'G3', solfege: 'Sol 3', freq: 196.0 },
      { name: 'A3', solfege: 'La 3', freq: 220.0 },
      { name: 'B3', solfege: 'Si 3', freq: 246.94 },
      { name: 'C4', solfege: 'Do 4', freq: 261.63 },
      { name: 'D4', solfege: 'Re 4', freq: 293.66 },
      { name: 'E4', solfege: 'Mi 4', freq: 329.63 },
      { name: 'F#4', solfege: 'Fa# 4', freq: 369.99 },
      { name: 'G4', solfege: 'Sol 4', freq: 392.0 },
      { name: 'A4', solfege: 'La 4', freq: 440.0 },
    ],
  },
  {
    name: 'Fa Majör (F Major)',
    tonality: '1 Bemollü Tonal Majör (Sib)',
    notes: [
      { name: 'F3', solfege: 'Fa 3', freq: 174.61 },
      { name: 'G3', solfege: 'Sol 3', freq: 196.0 },
      { name: 'A3', solfege: 'La 3', freq: 220.0 },
      { name: 'Bb3', solfege: 'Sib 3', freq: 233.08 },
      { name: 'C4', solfege: 'Do 4', freq: 261.63 },
      { name: 'D4', solfege: 'Re 4', freq: 293.66 },
      { name: 'E4', solfege: 'Mi 4', freq: 329.63 },
      { name: 'F4', solfege: 'Fa 4', freq: 349.23 },
    ],
  },
  {
    name: 'La Minör Armonik (A Harmonic Minor)',
    tonality: 'Doğal/Armonik Minör (Sol#)',
    notes: [
      { name: 'A3', solfege: 'La 3', freq: 220.0 },
      { name: 'B3', solfege: 'Si 3', freq: 246.94 },
      { name: 'C4', solfege: 'Do 4', freq: 261.63 },
      { name: 'D4', solfege: 'Re 4', freq: 293.66 },
      { name: 'E4', solfege: 'Mi 4', freq: 329.63 },
      { name: 'F4', solfege: 'Fa 4', freq: 349.23 },
      { name: 'G#4', solfege: 'Sol# 4', freq: 415.3 },
      { name: 'A4', solfege: 'La 4', freq: 440.0 },
      { name: 'B4', solfege: 'Si 4', freq: 493.88 },
    ],
  },
  {
    name: 'Re Minör Armonik (D Harmonic Minor)',
    tonality: '1 Bemollü Armonik Minör (Sib & Do#)',
    notes: [
      { name: 'D4', solfege: 'Re 4', freq: 293.66 },
      { name: 'E4', solfege: 'Mi 4', freq: 329.63 },
      { name: 'F4', solfege: 'Fa 4', freq: 349.23 },
      { name: 'G4', solfege: 'Sol 4', freq: 392.0 },
      { name: 'A4', solfege: 'La 4', freq: 440.0 },
      { name: 'Bb4', solfege: 'Sib 4', freq: 466.16 },
      { name: 'C#5', solfege: 'Do# 5', freq: 554.37 },
      { name: 'D5', solfege: 'Re 5', freq: 587.33 },
    ],
  },
  {
    name: 'Mi Minör (E Minor)',
    tonality: '1 Diyezli Minör (Fa# & Re#)',
    notes: [
      { name: 'E3', solfege: 'Mi 3', freq: 164.81 },
      { name: 'F#3', solfege: 'Fa# 3', freq: 185.0 },
      { name: 'G3', solfege: 'Sol 3', freq: 196.0 },
      { name: 'A3', solfege: 'La 3', freq: 220.0 },
      { name: 'B3', solfege: 'Si 3', freq: 246.94 },
      { name: 'C4', solfege: 'Do 4', freq: 261.63 },
      { name: 'D#4', solfege: 'Re# 4', freq: 311.13 },
      { name: 'E4', solfege: 'Mi 4', freq: 329.63 },
    ],
  },
];

export const ConservatoryExamPrep: React.FC<ConservatoryExamPrepProps> = ({ language }) => {
  const [activeTest, setActiveTest] = useState<ExamType>('single_tone');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPausedWaiting, setIsPausedWaiting] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [totalPauseTime, setTotalPauseTime] = useState<number>(3); // seconds

  // Duration configuration requested by user (5s, 6s, 7s, 8s, 10s, 12s)
  const [melodyDuration, setMelodyDuration] = useState<number>(6); // seconds
  const [rhythmDuration, setRhythmDuration] = useState<number>(6); // seconds

  const [testScore, setTestScore] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [revealedAnswer, setRevealedAnswer] = useState<string | null>(null);
  const [revealedDetails, setRevealedDetails] = useState<string | null>(null);
  const [userFeedback, setUserFeedback] = useState<'success' | 'retry' | null>(null);

  // Rhythm Dictation Settings
  const [rhythmSound, setRhythmSound] = useState<'clap' | 'pencil'>('pencil');
  const [userTaps, setUserTaps] = useState<number[]>([]);

  // Generated state
  const [currentSingleNote, setCurrentSingleNote] = useState<{ name: string; freq: number } | null>(null);
  const [currentTwoNotes, setCurrentTwoNotes] = useState<{
    note1: { name: string; freq: number };
    note2: { name: string; freq: number };
    interval: string;
  } | null>(null);
  const [currentThreeChord, setCurrentThreeChord] = useState<{
    root: string;
    type: string;
    notes: string[];
    freqs: number[];
  } | null>(null);
  const [currentMelody, setCurrentMelody] = useState<{
    title: string;
    tonality: string;
    durationSec: number;
    notes: Array<{ name: string; solfege: string; freq: number; durationMs: number; beat: string }>;
  } | null>(null);
  const [currentRhythmPattern, setCurrentRhythmPattern] = useState<{
    tempoBpm: number;
    durationSec: number;
    pattern: Array<{ type: 'hit' | 'rest'; durationMs: number; label: string; figure: string }>;
  } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scheduledTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Cleanup all scheduled note audio timeouts
  const clearAllScheduledNotes = () => {
    scheduledTimeoutsRef.current.forEach((t) => clearTimeout(t));
    scheduledTimeoutsRef.current = [];
  };

  // Set default pause times based on test requirements
  useEffect(() => {
    stopCurrentTest();
    if (activeTest === 'single_tone') setTotalPauseTime(3);
    else if (activeTest === 'two_tone') setTotalPauseTime(5);
    else if (activeTest === 'three_tone') setTotalPauseTime(8);
    else if (activeTest === 'melody') setTotalPauseTime(12);
    else if (activeTest === 'rhythm') setTotalPauseTime(12);
  }, [activeTest]);

  const stopCurrentTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    clearAllScheduledNotes();
    setIsPlaying(false);
    setIsPausedWaiting(false);
    setRemainingTime(0);
    setRevealedAnswer(null);
    setRevealedDetails(null);
    setUserFeedback(null);
    setUserTaps([]);
  };

  // 1. GENERATE & PLAY: SINGLE TONE (Tek Ses)
  const runSingleToneTest = () => {
    stopCurrentTest();
    setIsPlaying(true);

    const notePool = [
      'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3',
      'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4',
      'C5', 'D5', 'E5', 'F5', 'G5', 'A5',
    ];
    const pickedNote = notePool[Math.floor(Math.random() * notePool.length)];
    const freq = noteToFrequency(pickedNote);
    setCurrentSingleNote({ name: pickedNote, freq });

    playPianoNote(freq, 1.8, 0.7);

    const t = setTimeout(() => {
      setIsPlaying(false);
      startPauseCountdown(totalPauseTime, () => {
        setRevealedAnswer(`Çalınan Nota: ${pickedNote} (${Math.round(freq)} Hz)`);
        setRevealedDetails('Duyduğunuz frekansı diyafram desteğiyle "Na" veya "La" hecesiyle doğru tınlattığınızdan emin olun.');
      });
    }, 1800);
    scheduledTimeoutsRef.current.push(t);
  };

  // 2. GENERATE & PLAY: TWO-TONE HARMONY (İki Ses)
  const runTwoToneTest = () => {
    stopCurrentTest();
    setIsPlaying(true);

    const intervals = [
      { semitones: 1, name: 'Küçük 2\'li (Minor 2nd)' },
      { semitones: 2, name: 'Büyük 2\'li (Major 2nd)' },
      { semitones: 3, name: 'Küçük 3\'lü (Minor 3rd)' },
      { semitones: 4, name: 'Büyük 3\'lü (Major 3rd)' },
      { semitones: 5, name: 'Tam 4\'lü (Perfect 4th)' },
      { semitones: 6, name: 'Artmış 4 / Eksilmiş 5 (Tritone)' },
      { semitones: 7, name: 'Tam 5\'li (Perfect 5th)' },
      { semitones: 8, name: 'Küçük 6\'lı (Minor 6th)' },
      { semitones: 9, name: 'Büyük 6\'lı (Major 6th)' },
      { semitones: 12, name: 'Tam Oktav (Octave P8)' },
    ];

    const roots = ['C4', 'D4', 'Eb4', 'E4', 'F4', 'G4', 'A4'];
    const chosenRoot = roots[Math.floor(Math.random() * roots.length)];
    const chosenInterval = intervals[Math.floor(Math.random() * intervals.length)];

    const f1 = noteToFrequency(chosenRoot);
    const f2 = f1 * Math.pow(2, chosenInterval.semitones / 12);

    setCurrentTwoNotes({
      note1: { name: chosenRoot, freq: f1 },
      note2: { name: `+${chosenInterval.semitones}st`, freq: f2 },
      interval: chosenInterval.name,
    });

    playHarmonicChord([f1, f2], 2.2, 0.6);

    const t = setTimeout(() => {
      setIsPlaying(false);
      startPauseCountdown(totalPauseTime, () => {
        setRevealedAnswer(`Duyurulan Aralık: ${chosenInterval.name}`);
        setRevealedDetails(`Kök Nota: ${chosenRoot} | Üst Nota: +${chosenInterval.semitones} Yarım Ses. Önce pes sesi, ardından tiz sesi ayrı ayrı seslendirin.`);
      });
    }, 2200);
    scheduledTimeoutsRef.current.push(t);
  };

  // 3. GENERATE & PLAY: THREE-TONE CHORD (Üç Ses Akor)
  const runThreeToneTest = () => {
    stopCurrentTest();
    setIsPlaying(true);

    const chordTypes = [
      { type: 'Majör Akor (Major Triad)', intervals: [0, 4, 7] },
      { type: 'Minör Akor (Minor Triad)', intervals: [0, 3, 7] },
      { type: 'Eksilmiş Akor (Diminished Triad)', intervals: [0, 3, 6] },
      { type: 'Artmış Akor (Augmented Triad)', intervals: [0, 4, 8] },
    ];

    const roots = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4'];
    const chosenRoot = roots[Math.floor(Math.random() * roots.length)];
    const chosenChord = chordTypes[Math.floor(Math.random() * chordTypes.length)];

    const rootHz = noteToFrequency(chosenRoot);
    const freqs = chosenChord.intervals.map((st) => rootHz * Math.pow(2, st / 12));

    setCurrentThreeChord({
      root: chosenRoot,
      type: chosenChord.type,
      notes: [chosenRoot, '3. Derece', '5. Derece'],
      freqs,
    });

    playHarmonicChord(freqs, 2.8, 0.65);

    const t = setTimeout(() => {
      setIsPlaying(false);
      startPauseCountdown(totalPauseTime, () => {
        setRevealedAnswer(`Akor Tipi: ${chosenChord.type}`);
        setRevealedDetails(`Kök: ${chosenRoot} | Ses Sıralaması: 1. Bas (Kök), 2. Tiz (5. Derece), 3. Orta Ses (3. Derece).`);
      });
    }, 2800);
    scheduledTimeoutsRef.current.push(t);
  };

  // 4. GENERATE & PLAY: DYNAMIC PROCEDURAL MELODIC DICTATION (Melodi Tekrarı)
  // Generates unique melodies matching user-selected duration (5s, 6s, 7s, 8s, 10s, 12s)
  const runMelodyTest = () => {
    stopCurrentTest();
    setIsPlaying(true);

    const targetTotalMs = melodyDuration * 1000;
    const chosenScale = CONSERVATORY_SCALES[Math.floor(Math.random() * CONSERVATORY_SCALES.length)];
    const scaleNotes = chosenScale.notes;

    // Procedural Melody Generation Algorithm
    const generatedNotes: Array<{
      name: string;
      solfege: string;
      freq: number;
      durationMs: number;
      beat: string;
    }> = [];

    let currentIdx = [0, 2, 4][Math.floor(Math.random() * 3)]; // Start on Tonic, 3rd, or 5th
    let accumulatedMs = 0;
    let beatCounter = 1;

    while (accumulatedMs < targetTotalMs - 1200) {
      // Determine note length (Quarter 500-600ms, Eighth 250-300ms, Dotted Quarter 750-900ms)
      const durationOptions = [500, 600, 300, 300, 750];
      let noteMs = durationOptions[Math.floor(Math.random() * durationOptions.length)];

      if (accumulatedMs + noteMs > targetTotalMs - 1200) {
        noteMs = targetTotalMs - 1200 - accumulatedMs;
        if (noteMs < 250) noteMs = 250;
      }

      const noteObj = scaleNotes[currentIdx];
      generatedNotes.push({
        name: noteObj.name,
        solfege: noteObj.solfege,
        freq: noteObj.freq,
        durationMs: noteMs,
        beat: `${beatCounter}. Vuruş`,
      });

      accumulatedMs += noteMs;
      beatCounter++;

      // Melodic Step / Leap movement
      const rand = Math.random();
      if (rand < 0.65) {
        // Stepwise motion (+1 or -1)
        const dir = Math.random() < 0.5 ? 1 : -1;
        currentIdx = Math.max(0, Math.min(scaleNotes.length - 1, currentIdx + dir));
      } else if (rand < 0.9) {
        // Third leap (+2 or -2)
        const dir = Math.random() < 0.5 ? 2 : -2;
        currentIdx = Math.max(0, Math.min(scaleNotes.length - 1, currentIdx + dir));
      } else {
        // Return to Dominant (4) or Tonic (0)
        currentIdx = Math.random() < 0.5 ? 0 : 4;
      }
    }

    // Final Cadence Resolution on Tonic note (Duration ~1000 - 1200ms)
    const tonicNote = scaleNotes[0];
    const finalDurationMs = Math.max(800, targetTotalMs - accumulatedMs);
    generatedNotes.push({
      name: tonicNote.name,
      solfege: tonicNote.solfege,
      freq: tonicNote.freq,
      durationMs: finalDurationMs,
      beat: 'Karar (Tonic Final)',
    });
    accumulatedMs += finalDurationMs;

    const melodyData = {
      title: `${chosenScale.name} - Özgün Sınav Deseni`,
      tonality: chosenScale.tonality,
      durationSec: melodyDuration,
      notes: generatedNotes,
    };
    setCurrentMelody(melodyData);

    // Play melody notes sequentially
    let playbackOffset = 0;
    generatedNotes.forEach((item) => {
      const t = setTimeout(() => {
        playPianoNote(item.freq, (item.durationMs / 1000) * 1.15, 0.65);
      }, playbackOffset);
      scheduledTimeoutsRef.current.push(t);
      playbackOffset += item.durationMs;
    });

    const completionTimeout = setTimeout(() => {
      setIsPlaying(false);
      startPauseCountdown(totalPauseTime, () => {
        const noteSequence = generatedNotes.map((n) => n.solfege).join(' → ');
        setRevealedAnswer(`Melodi Dizisi (${melodyDuration} sn): ${noteSequence}`);
        setRevealedDetails(`Makam/Tonalite: ${chosenScale.name} (${chosenScale.tonality}) | Toplam ${generatedNotes.length} Nota.`);
      });
    }, playbackOffset + 350);
    scheduledTimeoutsRef.current.push(completionTimeout);
  };

  // 5. GENERATE & PLAY: DYNAMIC PROCEDURAL RHYTHMIC DICTATION (Ritim Tekrarı)
  // Generates rich unique rhythm patterns matching selected duration (5s, 6s, 7s, 8s, 10s, 12s)
  const runRhythmTest = () => {
    stopCurrentTest();
    setIsPlaying(true);
    setUserTaps([]);

    const targetTotalMs = rhythmDuration * 1000;
    const tempoBpm = 84;
    const beatMs = Math.round((60 / tempoBpm) * 1000); // ~714ms per quarter beat

    // Diverse Rhythmic Building Blocks
    const rhythmicMotifs = [
      // 1. Dörtlük (Single Quarter)
      () => [
        { type: 'hit' as const, durationMs: beatMs, label: 'Dörtlük (Ta)', figure: '♩' },
      ],
      // 2. Sekizlik Çifti (Two Eighths)
      () => [
        { type: 'hit' as const, durationMs: Math.round(beatMs / 2), label: 'Sekizlik (Ta)', figure: '♪' },
        { type: 'hit' as const, durationMs: Math.round(beatMs / 2), label: 'Sekizlik (Te)', figure: '♪' },
      ],
      // 3. Noktalı Sekizlik + 16'lık (Dotted Eighth + 16th)
      () => [
        { type: 'hit' as const, durationMs: Math.round(beatMs * 0.75), label: 'Noktalı Sekizlik (Taa)', figure: '♪.' },
        { type: 'hit' as const, durationMs: Math.round(beatMs * 0.25), label: 'Onaltılık (ke)', figure: '𝅘𝅥𝅯' },
      ],
      // 4. Dört Onaltılık (Four 16ths)
      () => [
        { type: 'hit' as const, durationMs: Math.round(beatMs / 4), label: '16\'lık (Ta)', figure: '𝅘𝅥𝅯' },
        { type: 'hit' as const, durationMs: Math.round(beatMs / 4), label: '16\'lık (ka)', figure: '𝅘𝅥𝅯' },
        { type: 'hit' as const, durationMs: Math.round(beatMs / 4), label: '16\'lık (te)', figure: '𝅘𝅥𝅯' },
        { type: 'hit' as const, durationMs: Math.round(beatMs / 4), label: '16\'lık (ke)', figure: '𝅘𝅥𝅯' },
      ],
      // 5. Sekizlik Es + Sekizlik Vuruş (Eighth Rest + Eighth Hit)
      () => [
        { type: 'rest' as const, durationMs: Math.round(beatMs / 2), label: 'Sekizlik Es', figure: '𝄾' },
        { type: 'hit' as const, durationMs: Math.round(beatMs / 2), label: 'Sekizlik (Ta)', figure: '♪' },
      ],
      // 6. Senkop Deseni (Syncopation)
      () => [
        { type: 'hit' as const, durationMs: Math.round(beatMs / 2), label: 'Sekizlik', figure: '♪' },
        { type: 'hit' as const, durationMs: beatMs, label: 'Senkop Dörtlük', figure: '♩' },
        { type: 'hit' as const, durationMs: Math.round(beatMs / 2), label: 'Sekizlik', figure: '♪' },
      ],
    ];

    const generatedPattern: Array<{
      type: 'hit' | 'rest';
      durationMs: number;
      label: string;
      figure: string;
    }> = [];

    let accumulatedMs = 0;

    while (accumulatedMs < targetTotalMs - beatMs) {
      const pickedMotif = rhythmicMotifs[Math.floor(Math.random() * rhythmicMotifs.length)];
      const motifItems = pickedMotif();
      const motifDuration = motifItems.reduce((acc, curr) => acc + curr.durationMs, 0);

      if (accumulatedMs + motifDuration <= targetTotalMs - beatMs) {
        generatedPattern.push(...motifItems);
        accumulatedMs += motifDuration;
      } else {
        // Fill remaining with quarter or eighth
        const singleHitMs = targetTotalMs - beatMs - accumulatedMs;
        if (singleHitMs >= 200) {
          generatedPattern.push({
            type: 'hit',
            durationMs: singleHitMs,
            label: 'Vuruş',
            figure: '♩',
          });
          accumulatedMs += singleHitMs;
        }
        break;
      }
    }

    // Final Accented Cadence Beat
    const finalBeatMs = Math.max(500, targetTotalMs - accumulatedMs);
    generatedPattern.push({
      type: 'hit',
      durationMs: finalBeatMs,
      label: 'Karar Vuruşu (Final)',
      figure: '♩ (Bitim)',
    });
    accumulatedMs += finalBeatMs;

    const rhythmData = {
      tempoBpm,
      durationSec: rhythmDuration,
      pattern: generatedPattern,
    };
    setCurrentRhythmPattern(rhythmData);

    // Play rhythm sequential hits
    let playbackOffset = 0;
    generatedPattern.forEach((item) => {
      if (item.type === 'hit') {
        const t = setTimeout(() => {
          if (rhythmSound === 'clap') playClapSound(0.85);
          else playPencilTapSound(0.85);
        }, playbackOffset);
        scheduledTimeoutsRef.current.push(t);
      }
      playbackOffset += item.durationMs;
    });

    const completionTimeout = setTimeout(() => {
      setIsPlaying(false);
      startPauseCountdown(totalPauseTime, () => {
        const figures = generatedPattern.map((p) => (p.type === 'hit' ? p.figure : '𝄾 (Es)')).join('  ');
        const labels = generatedPattern.map((p) => p.label).join(' | ');
        setRevealedAnswer(`Ritim Deseni (${rhythmDuration} sn): ${figures}`);
        setRevealedDetails(`Vuruş Açılımı: ${labels} (${generatedPattern.filter((p) => p.type === 'hit').length} Vuruş, Tempo: ${tempoBpm} BPM).`);
      });
    }, playbackOffset + 400);
    scheduledTimeoutsRef.current.push(completionTimeout);
  };

  // Countdown Timer Handler
  const startPauseCountdown = (seconds: number, onComplete: () => void) => {
    setIsPausedWaiting(true);
    setRemainingTime(seconds);

    let timeLeft = seconds;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      timeLeft -= 1;
      setRemainingTime(timeLeft);
      if (timeLeft <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsPausedWaiting(false);
        onComplete();
      }
    }, 1000);
  };

  // User Tap Capture for Rhythm Test
  const handleRhythmTapButton = () => {
    if (!isPausedWaiting && !isPlaying) return;
    if (rhythmSound === 'clap') playClapSound(0.6);
    else playPencilTapSound(0.6);

    const now = performance.now();
    setUserTaps((prev) => [...prev, now]);
  };

  // Self Evaluation & Scoring
  const handleScoreResponse = (isCorrect: boolean) => {
    setTotalAttempts((prev) => prev + 1);
    if (isCorrect) {
      setTestScore((prev) => prev + 10);
      setUserFeedback('success');
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch {}
    } else {
      setUserFeedback('retry');
    }
  };

  const handleStartActiveTest = () => {
    if (activeTest === 'single_tone') runSingleToneTest();
    else if (activeTest === 'two_tone') runTwoToneTest();
    else if (activeTest === 'three_tone') runThreeToneTest();
    else if (activeTest === 'melody') runMelodyTest();
    else if (activeTest === 'rhythm') runRhythmTest();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>SECTION 4: Konservatuvar Sınavlarına Hazırlık Modülü</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-50 font-serif">
            İşitsel Duyuş, Melodi & Ritim Sınav Simülatörü
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl">
            Devlet Konservatuvarı ve Güzel Sanatlar yetenek sınavları standartları: Tek Ses, İki Ses, Üç Ses Akor, Dinamik Melodi ve Ritim Dikte Simülasyonu.
          </p>
        </div>

        {/* Global Score & Accuracy */}
        <div className="flex items-center gap-4 bg-stone-950 p-3 rounded-xl border border-stone-800 self-start md:self-auto">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-[10px] text-stone-400 uppercase font-semibold">Toplam Puan</div>
              <div className="text-base font-bold font-mono text-amber-400">{testScore}</div>
            </div>
          </div>
          <div className="h-8 w-px bg-stone-800" />
          <div>
            <div className="text-[10px] text-stone-400 uppercase font-semibold">Deneme</div>
            <div className="text-base font-bold font-mono text-stone-200">{totalAttempts}</div>
          </div>
        </div>
      </div>

      {/* 5 Core Test Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {[
          { id: 'single_tone', label: '1. Tek Ses', desc: 'Rastgele 1 Perde' },
          { id: 'two_tone', label: '2. İki Ses (Armoni)', desc: '2 Ses Armonik Aralık' },
          { id: 'three_tone', label: '3. Üç Ses (Akor)', desc: 'Majör / Minör Triad' },
          { id: 'melody', label: '4. Melodi Tekrarı', desc: 'Süresi Seçilebilir Tonal Ezgi' },
          { id: 'rhythm', label: '5. Ritim Tekrarı', desc: 'Süresi Seçilebilir Vuruşlar' },
        ].map((t) => {
          const isActive = activeTest === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveTest(t.id as ExamType);
              }}
              className={`p-3.5 rounded-xl text-left border transition flex flex-col justify-between space-y-1 ${
                isActive
                  ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-md shadow-amber-600/10'
                  : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800'
              }`}
            >
              <span className="font-bold text-xs text-stone-100">{t.label}</span>
              <span className="text-[10px] text-stone-400 line-clamp-1">{t.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage Box */}
      <div className="bg-stone-900 p-6 md:p-8 rounded-2xl border border-stone-800 shadow-xl space-y-6">
        {/* Stage Controls & Configurable Timer Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            {/* Start Button */}
            <button
              id="exam-start-btn"
              onClick={handleStartActiveTest}
              disabled={isPlaying}
              className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-lg ${
                isPlaying
                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30 active:scale-95'
              }`}
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isPausedWaiting ? 'Testi Yeniden Çal' : 'Yeni Sınav Testi Başlat'}</span>
            </button>

            {/* Stop Button */}
            <button
              id="exam-stop-btn"
              onClick={stopCurrentTest}
              className="px-4 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Durdur (Stop)</span>
            </button>
          </div>

          {/* Custom Pause Timer Field */}
          <div className="flex items-center gap-3 bg-stone-950 px-4 py-2 rounded-xl border border-stone-800 text-xs">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-stone-300 font-semibold">Cevaplama Süresi:</span>
            <div className="flex items-center gap-1.5">
              <input
                id="exam-timer-input"
                type="number"
                min={1}
                max={20}
                value={totalPauseTime}
                onChange={(e) => setTotalPauseTime(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-stone-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-stone-400 text-[11px]">Sn</span>
            </div>
          </div>
        </div>

        {/* DURATION SELECTOR FOR TEST 4: MELODY DICTATION */}
        {activeTest === 'melody' && (
          <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-stone-200">Melodi Çalma Süresi (Uzunluk):</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {[4, 5, 6, 7, 8, 10, 12].map((dur) => (
                <button
                  key={dur}
                  onClick={() => setMelodyDuration(dur)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                    melodyDuration === dur
                      ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                      : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                  }`}
                >
                  {dur} sn
                </button>
              ))}
            </div>
          </div>
        )}

        {/* DURATION & SOUND SELECTOR FOR TEST 5: RHYTHM DICTATION */}
        {activeTest === 'rhythm' && (
          <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-3 animate-in fade-in">
            {/* Duration Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-850 pb-3">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-stone-200">Ritim Çalma Süresi (Uzunluk):</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[4, 5, 6, 7, 8, 10, 12].map((dur) => (
                  <button
                    key={dur}
                    onClick={() => setRhythmDuration(dur)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                      rhythmDuration === dur
                        ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                        : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                    }`}
                  >
                    {dur} sn
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-stone-200">Ritim Ses Seçeneği:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRhythmSound('pencil')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    rhythmSound === 'pencil'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-stone-900 text-stone-400 hover:text-white'
                  }`}
                >
                  ✏️ Kalem Vurma (Pencil Tap)
                </button>
                <button
                  onClick={() => setRhythmSound('clap')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    rhythmSound === 'clap'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-stone-900 text-stone-400 hover:text-white'
                  }`}
                >
                  👏 Alkış (Clap)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Realtime Feedback & Visual Timer Stage */}
        <div className="p-8 bg-stone-950 rounded-2xl border border-stone-800 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[240px]">
          {/* Audio Playing State */}
          {isPlaying && (
            <div className="flex flex-col items-center justify-center space-y-3 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-amber-600/20 border-2 border-amber-500 flex items-center justify-center animate-pulse">
                <Volume2 className="w-8 h-8 text-amber-400" />
              </div>
              <div className="text-base font-bold text-amber-300 font-serif">
                Sistem Sesi Çalıyor, Dikkatle Dinleyin...
              </div>
              <p className="text-xs text-stone-400 max-w-md">
                {activeTest === 'melody' && `Özgün ${melodyDuration} saniyelik ezgi çalınıyor. Notaların aralıklarını ve ritmik sürelerini zihninizde tutun.`}
                {activeTest === 'rhythm' && `Özgün ${rhythmDuration} saniyelik ritmik motif çalınıyor. Vuruşları ve esleri sayın.`}
                {activeTest !== 'melody' && activeTest !== 'rhythm' && 'Kulaklığınızdan gelen armoniyi zihninizde kaydedin.'}
              </p>
            </div>
          )}

          {/* Pause / Vocal Repeat State with Countdown Timer */}
          {isPausedWaiting && !isPlaying && (
            <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in">
              <div className="w-20 h-20 rounded-full bg-emerald-950/60 border-2 border-emerald-500 flex flex-col items-center justify-center shadow-lg shadow-emerald-950">
                <Mic className="w-6 h-6 text-emerald-400 mb-0.5 animate-bounce" />
                <span className="text-xl font-black font-mono text-emerald-300">{remainingTime}s</span>
              </div>

              <div>
                <div className="text-base font-bold text-emerald-300 font-serif">
                  {activeTest === 'rhythm'
                    ? 'Şimdi Ritmi Aşağıdaki Butona Vurarak Tekrar Edin!'
                    : 'Şimdi Duyduğunuz Sesi/Melodiyi Sesli Olarak (Vokal) Tekrar Edin!'}
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  Konservatuvar jürisi önündeymiş gibi nefesinizi alıp sesi "Na" veya "La" hecesiyle tınlatın.
                </p>
              </div>

              {/* Rhythm Tap Pad for Test 5 */}
              {activeTest === 'rhythm' && (
                <button
                  onClick={handleRhythmTapButton}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-stone-950 font-black text-lg shadow-2xl shadow-amber-600/40 active:scale-90 transition flex flex-col items-center justify-center cursor-pointer select-none"
                >
                  <span>RİTME VUR!</span>
                  <span className="text-xs font-mono mt-1 font-semibold">({userTaps.length} Vuruş)</span>
                </button>
              )}
            </div>
          )}

          {/* Idle / Ready State */}
          {!isPlaying && !isPausedWaiting && !revealedAnswer && (
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400">
                <Timer className="w-6 h-6 text-amber-500" />
              </div>
              <div className="text-sm font-bold text-stone-300">
                Test Hazır — Başlatmak için yukarıdaki "Yeni Sınav Testi Başlat" butonuna basın
              </div>
              <p className="text-xs text-stone-500 max-w-md">
                Ses çalındıktan sonra otomatik olarak {totalPauseTime} saniyelik cevaplama süresi başlayacaktır.
              </p>
            </div>
          )}

          {/* Revealed Answer & Self-Scoring */}
          {revealedAnswer && (
            <div className="w-full max-w-xl space-y-4 animate-in zoom-in-95">
              <div className="p-5 rounded-xl bg-stone-900 border border-amber-500/40 space-y-2.5 text-left">
                <div className="flex items-center justify-between text-amber-400 text-xs font-bold uppercase">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Doğru Cevap & Müzikal Analiz</span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">Konservatuvar Sınav Protokolü</span>
                </div>
                <div className="text-base font-bold text-stone-100 font-serif leading-relaxed">
                  {revealedAnswer}
                </div>
                {revealedDetails && (
                  <p className="text-xs text-stone-400 border-t border-stone-800 pt-2 leading-relaxed">
                    {revealedDetails}
                  </p>
                )}
              </div>

              {/* Verification Buttons */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => handleScoreResponse(true)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Doğru Tekrar Ettim (+10 Puan)</span>
                </button>
                <button
                  onClick={() => handleScoreResponse(false)}
                  className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs flex items-center gap-2 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Tam Tutmadı (Tekrar Dene)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theoretical Exam Guide for Students */}
        <div className="p-5 bg-stone-950/60 rounded-xl border border-stone-800 space-y-2 text-xs text-stone-400">
          <div className="flex items-center gap-2 font-bold text-stone-200">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Konservatuvar Sınav İpucu:</span>
          </div>
          <p className="leading-relaxed">
            Sınavlarda melodi diktesinde ilk notanın kök notasını (tonik) tespit edip melodi hareketinin basamak basamak mı (stepwise) yoksa aralıklarla mı (leaps) ilerlediğini zihninizde şema haline getirin. Ritim sınavında ise metronomik iç sayımı (1-ve-2-ve) hiç durdurmadan el veya kalem vuruşlarını net artiküle edin.
          </p>
        </div>
      </div>
    </div>
  );
};
