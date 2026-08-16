import React, { useState, useEffect, useRef } from 'react';
import { Language } from './types';
import { TRANSLATIONS } from './translations';
import {
  playAcousticWave,
  playHarmonicsSeries,
  playIntonationComparison,
} from '../audio/synth';
import { Play, Square, Activity, Waves, Sliders, Volume2 } from 'lucide-react';

interface AcousticsLabProps {
  language: Language;
}

export const AcousticsLab: React.FC<AcousticsLabProps> = ({ language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.tr;

  // Waveform state
  const [selectedWave, setSelectedWave] = useState<OscillatorType>('sine');
  const [frequency, setFrequency] = useState<number>(440);
  const [isPlayingWave, setIsPlayingWave] = useState<boolean>(false);
  const stopWaveFnRef = useRef<(() => void) | null>(null);

  // Harmonics Mixer state (7 Partials)
  const [harmonicGains, setHarmonicGains] = useState<number[]>([1.0, 0.6, 0.4, 0.25, 0.15, 0.08, 0.04]);
  const [isPlayingHarmonics, setIsPlayingHarmonics] = useState<boolean>(false);
  const stopHarmonicsFnRef = useRef<(() => void) | null>(null);

  // Tuning System Comparison State
  const [selectedInterval, setSelectedInterval] = useState<'majorThird' | 'fifth' | 'neutralThird'>('majorThird');
  const [isPlayingTuning, setIsPlayingTuning] = useState<boolean>(false);

  // Canvas Oscilloscope Animation Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const wavePhaseRef = useRef<number>(0);

  // Animate oscilloscope wave
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.fillStyle = '#0c0a09';
      ctx.fillRect(0, 0, width, height);

      // Draw Grid Lines
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      for (let x = 0; x < width; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      ctx.stroke();

      // Draw Dynamic Waveform
      ctx.strokeStyle = isPlayingWave || isPlayingHarmonics ? '#f59e0b' : '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = isPlayingWave || isPlayingHarmonics ? 'rgba(245, 158, 11, 0.6)' : 'rgba(56, 189, 248, 0.4)';
      ctx.beginPath();

      const numPoints = width;
      const waveFreqFactor = (frequency / 220) * 4;
      const speed = isPlayingWave || isPlayingHarmonics ? 0.08 : 0.02;
      wavePhaseRef.current += speed;

      for (let x = 0; x < numPoints; x++) {
        const normalizedX = (x / width) * Math.PI * 2 * waveFreqFactor + wavePhaseRef.current;
        let yValue = 0;

        if (isPlayingHarmonics) {
          harmonicGains.forEach((gain, idx) => {
            const n = idx + 1;
            yValue += (gain * 35 * Math.sin(n * normalizedX)) / Math.sqrt(n);
          });
        } else {
          switch (selectedWave) {
            case 'sine':
              yValue = 45 * Math.sin(normalizedX);
              break;
            case 'triangle':
              yValue = 45 * (2 / Math.PI) * Math.asin(Math.sin(normalizedX));
              break;
            case 'sawtooth':
              yValue = 45 * (2 * ((normalizedX / (2 * Math.PI)) % 1) - 1);
              break;
            case 'square':
              yValue = 45 * (Math.sin(normalizedX) >= 0 ? 0.85 : -0.85);
              break;
          }
        }

        const y = centerY - yValue;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.shadowBlur = 0;

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [selectedWave, frequency, isPlayingWave, isPlayingHarmonics, harmonicGains]);

  const handleToggleWave = () => {
    if (isPlayingWave) {
      if (stopWaveFnRef.current) {
        stopWaveFnRef.current();
        stopWaveFnRef.current = null;
      }
      setIsPlayingWave(false);
      return;
    }

    if (stopHarmonicsFnRef.current) {
      stopHarmonicsFnRef.current();
      setIsPlayingHarmonics(false);
    }

    setIsPlayingWave(true);
    stopWaveFnRef.current = playAcousticWave(frequency, selectedWave, 10, 0.4);
    setTimeout(() => setIsPlayingWave(false), 10000);
  };

  const handleToggleHarmonics = () => {
    if (isPlayingHarmonics) {
      if (stopHarmonicsFnRef.current) {
        stopHarmonicsFnRef.current();
        stopHarmonicsFnRef.current = null;
      }
      setIsPlayingHarmonics(false);
      return;
    }

    if (stopWaveFnRef.current) {
      stopWaveFnRef.current();
      setIsPlayingWave(false);
    }

    setIsPlayingHarmonics(true);
    stopHarmonicsFnRef.current = playHarmonicsSeries(frequency, harmonicGains, 8);
    setTimeout(() => setIsPlayingHarmonics(false), 8000);
  };

  const handlePlayTuningDemo = (type: 'equal' | 'pure' | 'both') => {
    setIsPlayingTuning(true);
    const rootHz = 261.63; // C4
    let f2 = 329.63;

    if (selectedInterval === 'majorThird') {
      if (type === 'equal') f2 = rootHz * Math.pow(2, 4 / 12);
      if (type === 'pure') f2 = rootHz * (5 / 4);
      if (type === 'both') {
        playIntonationComparison(rootHz * Math.pow(2, 4 / 12), rootHz * (5 / 4), 4.0);
        setTimeout(() => setIsPlayingTuning(false), 4000);
        return;
      }
    } else if (selectedInterval === 'fifth') {
      if (type === 'equal') f2 = rootHz * Math.pow(2, 7 / 12);
      if (type === 'pure') f2 = rootHz * (3 / 2);
      if (type === 'both') {
        playIntonationComparison(rootHz * Math.pow(2, 7 / 12), rootHz * (3 / 2), 4.0);
        setTimeout(() => setIsPlayingTuning(false), 4000);
        return;
      }
    } else if (selectedInterval === 'neutralThird') {
      if (type === 'equal') f2 = rootHz * Math.pow(2, 3 / 12);
      if (type === 'pure') f2 = rootHz * Math.pow(2, 3.55 / 12);
      if (type === 'both') {
        playIntonationComparison(rootHz * Math.pow(2, 3 / 12), rootHz * Math.pow(2, 3.55 / 12), 4.0);
        setTimeout(() => setIsPlayingTuning(false), 4000);
        return;
      }
    }

    playAcousticWave(f2, 'sine', 2.5, 0.4);
    setTimeout(() => setIsPlayingTuning(false), 2500);
  };

  const waveTypes: { id: OscillatorType; name: string; desc: string; icon: string }[] = [
    { id: 'sine', name: 'Sinüs (Sine Wave)', desc: 'Saf temel frekans, sıfır üst doğuşkan (Flüt/Diyapazon)', icon: '∿' },
    { id: 'sawtooth', name: 'Testere (Sawtooth Wave)', desc: 'Tüm tek ve çift harmonikler, zengin yaylı tınısı (Keman)', icon: '⩘' },
    { id: 'triangle', name: 'Üçgen (Triangle Wave)', desc: 'Sadece tek harmonikler (1/n² sönüm), yumuşak flüt tınısı', icon: '∧' },
    { id: 'square', name: 'Kare (Square Wave)', desc: 'Sadece tek harmonikler (1/n sönüm), kamışlı tını (Klarnet)', icon: '⊓' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Module Intro */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-950 p-6 rounded-2xl border border-stone-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4" />
              <span>Section 1.1: Akustik & Ses Fiziği</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-50 font-serif">
              {t.acousticsTitle}
            </h2>
            <p className="text-sm text-stone-400 mt-1 max-w-3xl">
              {t.acousticsDesc}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-stone-950/80 px-4 py-3 rounded-xl border border-stone-800">
            <span className="text-xs text-stone-400">A4 Standart:</span>
            <span className="text-xl font-bold text-amber-400 font-mono">440.00 Hz</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Oscilloscope & Wave Control */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Oscilloscope Screen */}
        <div className="lg:col-span-7 bg-stone-900 p-6 rounded-2xl border border-stone-800 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Waves className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-stone-100 text-sm">
                  Gerçek Zamanlı Ses Dalgası Osiloskobu (Live Waveform)
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-stone-950 border border-stone-800 text-sky-400">
                {frequency} Hz
              </span>
            </div>

            {/* Canvas Screen */}
            <div className="relative rounded-xl overflow-hidden border border-stone-800 bg-stone-950 shadow-inner">
              <canvas
                ref={canvasRef}
                width={560}
                height={200}
                className="w-full h-48 block"
              />
              <div className="absolute bottom-2 left-3 text-[10px] text-stone-500 font-mono">
                f(t) = A · sin(2π · {frequency}t + φ)
              </div>
            </div>
          </div>

          {/* Waveform Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            {waveTypes.map((w) => (
              <button
                key={w.id}
                onClick={() => setSelectedWave(w.id)}
                className={`p-2.5 rounded-xl text-left border transition ${
                  selectedWave === w.id
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="text-base font-bold mb-0.5">{w.icon}</div>
                <div className="text-xs font-semibold text-stone-200">{w.name.split(' ')[0]}</div>
                <div className="text-[10px] text-stone-400 line-clamp-1">{w.desc.split(',')[0]}</div>
              </button>
            ))}
          </div>

          {/* Frequency Slider & Play Button */}
          <div className="mt-4 pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-2/3 space-y-1">
              <div className="flex justify-between text-xs text-stone-400 font-medium">
                <span>Frekans (Pitch):</span>
                <span className="font-mono text-amber-400 font-bold">{frequency} Hz</span>
              </div>
              <input
                type="range"
                min="110"
                max="880"
                step="1"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full h-2 bg-stone-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <button
              onClick={handleToggleWave}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md ${
                isPlayingWave
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {isPlayingWave ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-white" />
                  {t.stopAudio}
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  {t.playWave}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Harmonic Overtone Series Mixer */}
        <div className="lg:col-span-5 bg-stone-900 p-6 rounded-2xl border border-stone-800 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-stone-100 text-sm">
                  {t.overtoneHarmonics} (Doğuşkanlar Mikseri)
                </h3>
              </div>
              <span className="text-[11px] text-stone-400">f₀ = {frequency} Hz</span>
            </div>
            <p className="text-xs text-stone-400 mb-4">
              Tını (Timbre) her enstrümanda doğuşkanların genlik oranlarıyla şekillenir.
            </p>

            {/* Harmonic Gain Sliders */}
            <div className="grid grid-cols-7 gap-2 p-3 bg-stone-950 rounded-xl border border-stone-800">
              {harmonicGains.map((gain, idx) => {
                const harmonicNum = idx + 1;
                const harmonicHz = Math.round(frequency * harmonicNum);
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-mono text-stone-400">{Math.round(gain * 100)}%</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={gain}
                      onChange={(e) => {
                        const newGains = [...harmonicGains];
                        newGains[idx] = Number(e.target.value);
                        setHarmonicGains(newGains);
                      }}
                      className="h-28 w-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                    />
                    <span className="text-[10px] font-bold text-amber-400">h{harmonicNum}</span>
                    <span className="text-[9px] font-mono text-stone-500">{harmonicHz}Hz</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-stone-800 flex items-center justify-between">
            <div className="text-[11px] text-stone-400">
              {isPlayingHarmonics ? 'Harmonik polifoni çalıyor...' : 'Tüm katları aynı anda sentezleyin.'}
            </div>
            <button
              onClick={handleToggleHarmonics}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
                isPlayingHarmonics
                  ? 'bg-red-600 text-white'
                  : 'bg-stone-800 hover:bg-stone-700 text-amber-400 border border-amber-500/30'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              {isPlayingHarmonics ? 'Durdur' : 'Harmonik Sesi Dinle'}
            </button>
          </div>
        </div>
      </div>

      {/* Section: Tuning Systems */}
      <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-stone-100 font-serif">
              {t.tuningSystems}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Pisagor akordu, Saf Doğal Akort (Just Intonation), Eşit Düzen ve Türk Müziği 53-TET karşılaştırması.
            </p>
          </div>

          {/* Interval Selector */}
          <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => setSelectedInterval('majorThird')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedInterval === 'majorThird' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Büyük 3lü (C4-E4)
            </button>
            <button
              onClick={() => setSelectedInterval('fifth')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedInterval === 'fifth' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Tam 5li (C4-G4)
            </button>
            <button
              onClick={() => setSelectedInterval('neutralThird')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedInterval === 'neutralThird' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Segah Koması (Makam)
            </button>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: 12-TET */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-stone-100">{t.equalTemp}</span>
              <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                {selectedInterval === 'majorThird' ? '400 Cents' : selectedInterval === 'fifth' ? '700 Cents' : '300 Cents'}
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Oktavı 12 eşit logaritmik parçaya böler ($2^{1/12}$). Tüm tonlarda modülasyon serbesttir ancak üçlüler +14 cent tizdir.
            </p>
            <button
              onClick={() => handlePlayTuningDemo('equal')}
              disabled={isPlayingTuning}
              className="w-full py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <Play className="w-3 h-3 text-amber-400" />
              12-TET Sesini Dinle
            </button>
          </div>

          {/* Card 2: Just Intonation */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-stone-100">{t.justIntonation}</span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                {selectedInterval === 'majorThird' ? '386.3 Cents (5:4)' : selectedInterval === 'fifth' ? '701.95 Cents (3:2)' : '355 Cents (Segah)'}
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Tam harmonik tam sayı oranları ($5/4$, $3/2$). Sıfır akustik dalgalanma (beating), kristal saflıkta koro ve yaylı rezonansı.
            </p>
            <button
              onClick={() => handlePlayTuningDemo('pure')}
              disabled={isPlayingTuning}
              className="w-full py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <Play className="w-3 h-3 text-emerald-400" />
              Doğal Saf Sesi Dinle
            </button>
          </div>

          {/* Card 3: Comparison Demo */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-stone-100">Akustik Vuru (Beating) Analizi</span>
                <span className="text-xs font-mono text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-500/30">
                  A/B Test
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-2">
                12-TET ile Saf Akort arasındaki frekans farkından oluşan akustik genlik dalgalanmasını (vuru/interferans) bizzat duyun.
              </p>
            </div>
            <button
              onClick={() => handlePlayTuningDemo('both')}
              disabled={isPlayingTuning}
              className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-md"
            >
              <Play className="w-3 h-3 fill-white" />
              İki Sistemi Karşılaştırmalı Dinle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
