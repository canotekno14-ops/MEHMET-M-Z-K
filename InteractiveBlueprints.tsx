import React, { useState, useEffect, useRef } from 'react';
import { Language, ClefType } from './types';
import { TRANSLATIONS } from './translations';
import { playPianoNote, playViolinNote, noteToFrequency } from './audio/synth';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  Activity,
  Layers,
  MousePointer,
  Compass,
} from 'lucide-react';
import { ViolinVibratoSimulator } from './ViolinVibratoSimulator';

interface InteractiveBlueprintsProps {
  language: Language;
}

export const InteractiveBlueprints: React.FC<InteractiveBlueprintsProps> = ({ language }) => {
  const [activeBlueprintTab, setActiveBlueprintTab] = useState<'big_note' | 'drag_drop' | 'vibrato_anim'>('big_note');

  // Blueprint 1: Big Isolated Note State
  const [bigNoteKey, setBigNoteKey] = useState<string>('G4');
  const [isNotePulsing, setIsNotePulsing] = useState<boolean>(false);

  // Blueprint 2: Drag and Drop Placement State
  const [placedSlots, setPlacedSlots] = useState<Record<string, string>>({});
  const [selectedDraggableNote, setSelectedDraggableNote] = useState<string | null>(null);
  const [dragScore, setDragScore] = useState<number>(0);
  const [dragFeedback, setDragFeedback] = useState<string | null>(null);

  // Blueprint 3: Fluid Vibrato & Shifting Animation State
  const [vibratoFreq, setVibratoFreq] = useState<number>(5.5); // Hz
  const [vibratoAmplitude, setVibratoAmplitude] = useState<number>(4.5); // Px
  const [currentViolinPosition, setCurrentViolinPosition] = useState<number>(1);
  const [isVibratoActive, setIsVibratoActive] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // 1. Big Note Play & Pulse
  const handlePlayBigNote = (noteName: string) => {
    setBigNoteKey(noteName);
    setIsNotePulsing(true);
    const freq = noteToFrequency(noteName);
    playPianoNote(freq, 1.5, 0.7);
    setTimeout(() => setIsNotePulsing(false), 500);
  };

  // 2. Drag & Drop Staff Slots Definition
  const staffSlots = [
    { id: 'slot_C4', note: 'C4', label: 'Do 4 (Orta Do)', y: 160, isLedger: true },
    { id: 'slot_D4', note: 'D4', label: 'Re 4', y: 145, isLedger: false },
    { id: 'slot_E4', note: 'E4', label: 'Mi 4 (1. Çizgi)', y: 130, isLedger: false, isLine: true },
    { id: 'slot_F4', note: 'F4', label: 'Fa 4 (1. Aralık)', y: 115, isLedger: false },
    { id: 'slot_G4', note: 'G4', label: 'Sol 4 (2. Çizgi)', y: 100, isLedger: false, isLine: true },
    { id: 'slot_A4', note: 'A4', label: 'La 4 (2. Aralık)', y: 85, isLedger: false },
    { id: 'slot_B4', note: 'B4', label: 'Si 4 (3. Çizgi)', y: 70, isLedger: false, isLine: true },
    { id: 'slot_C5', note: 'C5', label: 'Do 5 (3. Aralık)', y: 55, isLedger: false },
  ];

  const availableNotesToPlace = ['C4', 'E4', 'G4', 'B4', 'D4', 'F4', 'A4', 'C5'];

  const handleSlotClick = (slotNote: string) => {
    if (!selectedDraggableNote) {
      setDragFeedback('Önce alttan bir nota seçin!');
      return;
    }

    if (selectedDraggableNote === slotNote) {
      setPlacedSlots((prev) => ({ ...prev, [slotNote]: selectedDraggableNote }));
      setDragScore((s) => s + 15);
      setDragFeedback(`✓ Doğru! ${slotNote} notası doğru çizgiye oturtuldu.`);
      playPianoNote(noteToFrequency(slotNote), 1.2, 0.7);
      setSelectedDraggableNote(null);

      try {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
      } catch {}
    } else {
      setDragFeedback(`✕ Yanlış konum! ${selectedDraggableNote} bu çizgiye ait değil.`);
      playPianoNote(150, 0.2, 0.3); // thud
    }
  };

  // 3. 60 FPS Fluid Vibrato & Shifting Canvas Renderer
  useEffect(() => {
    if (activeBlueprintTab !== 'vibrato_anim') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();

    const render = () => {
      const now = performance.now();
      const elapsedSec = (now - startTime) / 1000;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background Fingerboard
      const fbX = 80;
      const fbWidth = 240;
      const fbHeight = 320;

      // Fingerboard gradient (Ebony wood)
      const grad = ctx.createLinearGradient(fbX, 0, fbX + fbWidth, 0);
      grad.addColorStop(0, '#1c1917');
      grad.addColorStop(0.5, '#292524');
      grad.addColorStop(1, '#0c0a09');
      ctx.fillStyle = grad;
      ctx.fillRect(fbX, 20, fbWidth, fbHeight);

      // Draw 4 Strings (G, D, A, E)
      const stringXs = [fbX + 35, fbX + 90, fbX + 150, fbX + 205];
      const stringNames = ['G3', 'D4', 'A4', 'E5'];
      const stringGauges = [3.5, 2.8, 2.0, 1.2];

      stringXs.forEach((x, idx) => {
        ctx.strokeStyle = '#d6d3d1';
        ctx.lineWidth = stringGauges[idx];
        ctx.beginPath();
        ctx.moveTo(x, 20);
        ctx.lineTo(x, 20 + fbHeight);
        ctx.stroke();

        ctx.fillStyle = '#78716c';
        ctx.font = '10px monospace';
        ctx.fillText(stringNames[idx], x - 7, 15);
      });

      // Target String (A4 String)
      const targetStringX = stringXs[2];

      // Base Y according to violin position (1st pos = Y 90, 3rd pos = Y 160, 5th pos = Y 230)
      let targetBaseY = 90;
      if (currentViolinPosition === 3) targetBaseY = 160;
      if (currentViolinPosition === 5) targetBaseY = 230;

      // Calculate Vibrato sinusoidal oscillation: ΔY = Amp * sin(2π * f * t)
      let vibratoOffsetY = 0;
      if (isVibratoActive) {
        vibratoOffsetY = vibratoAmplitude * Math.sin(2 * Math.PI * vibratoFreq * elapsedSec);
      }

      const fingerY = targetBaseY + vibratoOffsetY;

      // Draw Finger Articulation Contact Ellipse
      ctx.save();
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(targetStringX, fingerY, 14, 10 + Math.abs(vibratoOffsetY) * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Finger Joint & Articulation Bone Vector
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(targetStringX, fingerY);
      ctx.lineTo(targetStringX - 35, fingerY - 25);
      ctx.lineTo(targetStringX - 70, fingerY + 10);
      ctx.stroke();

      // Oscillation wave trace indicator
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let t = 0; t < 60; t++) {
        const traceX = targetStringX + 30 + t * 2.5;
        const traceY = targetBaseY + vibratoAmplitude * Math.sin(2 * Math.PI * vibratoFreq * (elapsedSec - t * 0.015));
        if (t === 0) ctx.moveTo(traceX, traceY);
        else ctx.lineTo(traceX, traceY);
      }
      ctx.stroke();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeBlueprintTab, vibratoFreq, vibratoAmplitude, currentViolinPosition, isVibratoActive]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Blueprint Sub-Nav */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900 p-3 rounded-2xl border border-stone-800">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveBlueprintTab('big_note')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeBlueprintTab === 'big_note' ? 'bg-amber-600 text-white' : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            1. Büyük İzole Animasyonlu Nota
          </button>
          <button
            onClick={() => setActiveBlueprintTab('drag_drop')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeBlueprintTab === 'drag_drop' ? 'bg-amber-600 text-white' : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            2. Notaları Dizeğe Yerleştirme (Drag & Drop)
          </button>
          <button
            onClick={() => setActiveBlueprintTab('vibrato_anim')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeBlueprintTab === 'vibrato_anim' ? 'bg-amber-600 text-white' : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            3. Keman Parmak & Vibrato Simülasyonu
          </button>
        </div>
      </div>

      {/* 1. BIG ISOLATED NOTE BLUEPRINT */}
      {activeBlueprintTab === 'big_note' && (
        <div className="bg-stone-900 p-6 md:p-8 rounded-2xl border border-stone-800 shadow-xl space-y-6">
          <div>
            <h3 className="text-xl font-bold text-stone-100 font-serif">
              Büyük İzole Animasyonlu Nota Görselleştirici (Isolated Note Renderer)
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Yüksek kontrastlı, yay fiziği ve nota başı titreşimiyle dizek üzerinde izole nota icrası.
            </p>
          </div>

          <div className="p-8 bg-stone-950 rounded-2xl border border-stone-800 flex flex-col items-center justify-center space-y-6">
            {/* SVG High-Contrast Staff & Isolated Note */}
            <svg width="450" height="200" viewBox="0 0 450 200" className="overflow-visible">
              {/* 5 Staff Lines */}
              {[60, 80, 100, 120, 140].map((y, idx) => (
                <line
                  key={idx}
                  x1="40"
                  y1={y}
                  x2="410"
                  y2={y}
                  stroke="#3f3f46"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              ))}

              {/* Treble Clef Graphic text */}
              <text x="50" y="132" fill="#d97706" fontSize="55" fontFamily="serif">
                𝄞
              </text>

              {/* Isolated Big Note Head with Pulsing Animation */}
              <g
                className={`cursor-pointer transition-transform duration-300 ${
                  isNotePulsing ? 'scale-125' : 'scale-100'
                }`}
                style={{ transformOrigin: '225px 100px' }}
                onClick={() => handlePlayBigNote(bigNoteKey)}
              >
                {/* Notehead */}
                <ellipse
                  cx="225"
                  cy={bigNoteKey === 'G4' ? 100 : bigNoteKey === 'C4' ? 160 : bigNoteKey === 'E4' ? 140 : 80}
                  rx="18"
                  ry="13"
                  transform={`rotate(-25 225 ${bigNoteKey === 'G4' ? 100 : 120})`}
                  fill={isNotePulsing ? '#10b981' : '#f59e0b'}
                  stroke="#fbbf24"
                  strokeWidth="3"
                />
                {/* Stem */}
                <line
                  x1="240"
                  y1={bigNoteKey === 'G4' ? 100 : 120}
                  x2="240"
                  y2="30"
                  stroke="#fbbf24"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </g>
            </svg>

            {/* Note Quick Selectors */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['C4', 'E4', 'G4', 'B4', 'D5'].map((n) => (
                <button
                  key={n}
                  onClick={() => handlePlayBigNote(n)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    bigNoteKey === n
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                      : 'bg-stone-900 border border-stone-750 text-stone-300 hover:text-white'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{n}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. DRAG AND DROP STAFF PLACEMENT */}
      {activeBlueprintTab === 'drag_drop' && (
        <div className="bg-stone-900 p-6 md:p-8 rounded-2xl border border-stone-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-stone-100 font-serif">
                Notaları Dizeğe Yerleştirme Matrisi (Drag & Snap Staff Game)
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Alttan notayı seçin ve dizek üzerindeki doğru çizgi/aralık hedef yuvasına tıklayarak yerleştirin.
              </p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs font-mono font-bold text-emerald-400">
              Skor: {dragScore} Puan
            </div>
          </div>

          {/* Interactive Droppable Staff Area */}
          <div className="p-6 bg-stone-950 rounded-2xl border border-stone-800 space-y-4">
            <div className="relative w-full max-w-2xl mx-auto h-[200px] border-y border-stone-800 flex flex-col justify-between py-4">
              {staffSlots.map((slot) => {
                const isPlaced = !!placedSlots[slot.note];
                return (
                  <div
                    key={slot.id}
                    onClick={() => handleSlotClick(slot.note)}
                    className={`relative w-full h-5 flex items-center justify-between px-4 cursor-pointer transition rounded-lg ${
                      slot.isLine ? 'border-b border-stone-700' : ''
                    } hover:bg-amber-500/10`}
                  >
                    <span className="text-[10px] font-mono text-stone-500">{slot.label}</span>

                    {isPlaced && (
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 animate-in zoom-in-95">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{slot.note} (Yerleşti)</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Feedback message */}
            {dragFeedback && (
              <div className="text-center text-xs font-bold text-amber-400 animate-in fade-in">
                {dragFeedback}
              </div>
            )}

            {/* Draggable Note Selection Dock */}
            <div className="pt-4 border-t border-stone-800">
              <div className="text-xs text-stone-400 mb-2 text-center font-semibold">
                Yerleştirmek İstediğiniz Notayı Seçin:
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {availableNotesToPlace.map((note) => {
                  const isAlreadyPlaced = !!placedSlots[note];
                  const isSelected = selectedDraggableNote === note;
                  return (
                    <button
                      key={note}
                      disabled={isAlreadyPlaced}
                      onClick={() => setSelectedDraggableNote(note)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                        isAlreadyPlaced
                          ? 'bg-stone-900/50 text-stone-600 border border-stone-850 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-amber-600 text-white ring-2 ring-amber-400 shadow-lg'
                          : 'bg-stone-900 border border-stone-700 text-stone-200 hover:bg-stone-800'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{note}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. FLUID FINGER MOVEMENTS & VIBRATO ANIMATION */}
      {/* 3. VIBRATO, FINGER MOTION & POSITION SHIFTING SIMULATOR */}
      {activeBlueprintTab === 'vibrato_anim' && (
        <div className="space-y-6">
          {/* Full-Fidelity Finger Kinematics & Anatomical Vibrato Simulator */}
          <ViolinVibratoSimulator />

          {/* Position Shifting & Fingerboard Visualizer */}
          <div className="bg-stone-900 p-6 md:p-8 rounded-2xl border border-stone-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-stone-100 font-serif">
                  Tuşe Üzerinde Pozisyon Değişimi & Boyutsal Salınım
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  1. - 5. pozisyon kayma (shifting) animasyonu ve tuşe üzerinde tel temas koordinatları.
                </p>
              </div>

              <button
                onClick={() => playViolinNote(440, 2.5, 0.03)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Sesi Dinle (A4 + Vibrato)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Canvas Stage */}
              <div className="md:col-span-7 flex justify-center bg-stone-950 p-4 rounded-2xl border border-stone-800">
                <canvas ref={canvasRef} width={400} height={340} className="w-full max-w-[400px]" />
              </div>

              {/* Interactive Vector Controls */}
              <div className="md:col-span-5 space-y-4 bg-stone-950 p-5 rounded-2xl border border-stone-800 text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between font-semibold text-stone-300">
                    <span>Vibrato Hızı (Frekans):</span>
                    <span className="text-amber-400 font-mono">{vibratoFreq} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="3.0"
                    max="8.0"
                    step="0.1"
                    value={vibratoFreq}
                    onChange={(e) => setVibratoFreq(parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between font-semibold text-stone-300">
                    <span>Salınım Genliği (Pitch Cent Sapması):</span>
                    <span className="text-amber-400 font-mono">+/- {Math.round(vibratoAmplitude * 5)} Cents</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="8.0"
                    step="0.5"
                    value={vibratoAmplitude}
                    onChange={(e) => setVibratoAmplitude(parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                {/* Shifting Position Trigger */}
                <div className="pt-3 border-t border-stone-800 space-y-2">
                  <span className="font-semibold text-stone-300">Pozisyon Kaydırma (Shifting):</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 3, 5].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setCurrentViolinPosition(pos)}
                        className={`py-2 rounded-xl font-bold transition ${
                          currentViolinPosition === pos
                            ? 'bg-amber-600 text-white'
                            : 'bg-stone-900 border border-stone-750 text-stone-300 hover:text-white'
                        }`}
                      >
                        {pos}. Pozisyon
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
