import React, { useState, useEffect, useRef } from 'react';
import { playViolinWithCustomVibrato } from './audio/synth';
import {
  Play,
  Square,
  Activity,
  Sliders,
  Sparkles,
  Info,
} from 'lucide-react';

export type VibratoType = 'arm' | 'wrist' | 'finger';

const VIBRATO_TYPES = [
  {
    id: 'wrist' as const,
    title: '1. Bilek Vibratosu (Wrist Vibrato)',
    desc: 'El ayasının bilek ekseninde esnek salınımı. Parlak, zarif ve lirik ton (Kreisler & Heifetz ekolü).',
    speed: 5.5,
  },
  {
    id: 'arm' as const,
    title: '2. Kol Vibratosu (Arm Vibrato)',
    desc: 'Tüm ön kolun dirsekten ileri-geri salınımı. Güçlü, geniş ve dramatik ton (Oistrakh & Perlman ekolü).',
    speed: 4.8,
  },
  {
    id: 'finger' as const,
    title: '3. Parmak Vibratosu (Finger Vibrato)',
    desc: 'Yalnızca parmak eklemlerinin mikro-bükülüşü. Yüksek 5-7. pozisyonlarda dar ve hassas intonasyon.',
    speed: 6.2,
  },
] as const;

const STRING_NOTES = [
  { name: 'La 4 (A4 - 440 Hz)', freq: 440 },
  { name: 'Mi 5 (E5 - 659 Hz)', freq: 659.25 },
  { name: 'Re 4 (D4 - 293 Hz)', freq: 293.66 },
  { name: 'Sol 3 (G3 - 196 Hz)', freq: 196.0 },
] as const;

export const ViolinVibratoSimulator: React.FC = () => {
  const [vibratoType, setVibratoType] = useState<VibratoType>('wrist');
  const [vibratoSpeedHz, setVibratoSpeedHz] = useState<number>(5.5);
  const [vibratoCents, setVibratoCents] = useState<number>(25);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [selectedStringNote, setSelectedStringNote] = useState<{ name: string; freq: number }>({
    name: 'La 4 (A4 - 440 Hz)',
    freq: 440,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const stopAudioRef = useRef<(() => void) | null>(null);

  const handleTogglePlayAudio = () => {
    if (isPlayingAudio) {
      if (stopAudioRef.current) stopAudioRef.current();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const stopFn = playViolinWithCustomVibrato(
        selectedStringNote.freq,
        4.5,
        vibratoSpeedHz,
        vibratoCents,
        0.6
      );
      stopAudioRef.current = stopFn;

      setTimeout(() => {
        setIsPlayingAudio(false);
      }, 4500);
    }
  };

  useEffect(() => {
    return () => {
      if (stopAudioRef.current) stopAudioRef.current();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();

    const render = () => {
      const now = performance.now();
      const elapsedSec = (now - startTime) / 1000;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Fingerboard & String
      const fbTopY = height - 60;
      const stringY = fbTopY - 4;

      const fbGrad = ctx.createLinearGradient(0, fbTopY, 0, height);
      fbGrad.addColorStop(0, '#1c1917');
      fbGrad.addColorStop(0.3, '#292524');
      fbGrad.addColorStop(1, '#0c0a09');
      ctx.fillStyle = fbGrad;
      ctx.fillRect(20, fbTopY, width - 40, 50);

      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(20, fbTopY, width - 40, 50);

      ctx.strokeStyle = '#e7e5e4';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(20, stringY);
      ctx.lineTo(width - 20, stringY);
      ctx.stroke();

      ctx.fillStyle = '#a8a29e';
      ctx.font = '10px monospace';
      ctx.fillText('A4 Teli (Keman Tuşesi)', 30, fbTopY + 25);

      // Vibrato Kinematics
      const phase = Math.sin(2 * Math.PI * vibratoSpeedHz * elapsedSec);
      const ampNormalized = vibratoCents / 40;

      const contactBaseX = width / 2;
      const contactBaseY = stringY;

      let fingerRollX = 0;
      let fingerAngleOffset = 0;
      let jointFlexOffset = 0;
      let armOffsetDeltaX = 0;

      if (vibratoType === 'finger') {
        fingerRollX = phase * 9 * ampNormalized;
        fingerAngleOffset = phase * 0.18 * ampNormalized;
        jointFlexOffset = -phase * 6 * ampNormalized;
        armOffsetDeltaX = 0;
      } else if (vibratoType === 'wrist') {
        fingerRollX = phase * 14 * ampNormalized;
        fingerAngleOffset = phase * 0.28 * ampNormalized;
        jointFlexOffset = -phase * 10 * ampNormalized;
        armOffsetDeltaX = phase * 8 * ampNormalized;
      } else {
        fingerRollX = phase * 18 * ampNormalized;
        fingerAngleOffset = phase * 0.32 * ampNormalized;
        jointFlexOffset = -phase * 12 * ampNormalized;
        armOffsetDeltaX = phase * 22 * ampNormalized;
      }

      const tipX = contactBaseX + fingerRollX;
      const tipY = contactBaseY;

      // Contact Cushion Rolling Pad
      ctx.save();
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(tipX, tipY, 11 + Math.abs(phase) * 2, 7, fingerAngleOffset * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Finger Anatomy Vectors
      const dipX = tipX - 18 + fingerRollX * 0.3;
      const dipY = tipY - 38 + jointFlexOffset;

      const pipX = dipX - 42 + armOffsetDeltaX * 0.5;
      const pipY = dipY - 45 - jointFlexOffset * 0.6;

      const mcpX = pipX - 55 + armOffsetDeltaX;
      const mcpY = pipY - 35;

      const wristX = mcpX - 60 + armOffsetDeltaX * 1.2;
      const wristY = mcpY - 15;

      const armX = wristX - 70 + (vibratoType === 'arm' ? armOffsetDeltaX * 1.5 : 0);
      const armY = wristY + 10;

      // Flesh Contour
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.25)';
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(armX, armY);
      ctx.lineTo(wristX, wristY);
      ctx.lineTo(mcpX, mcpY);
      ctx.lineTo(pipX, pipY);
      ctx.lineTo(dipX, dipY);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      // Phalanges Skeleton
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(armX, armY);
      ctx.lineTo(wristX, wristY);
      ctx.lineTo(mcpX, mcpY);
      ctx.lineTo(pipX, pipY);
      ctx.lineTo(dipX, dipY);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      // Anatomical Joint Points
      const joints = [
        { x: tipX, y: tipY, r: 6, color: '#f59e0b' },
        { x: dipX, y: dipY, r: 5.5, color: '#fbbf24' },
        { x: pipX, y: pipY, r: 6.5, color: '#fbbf24' },
        { x: mcpX, y: mcpY, r: 7.5, color: '#d97706' },
        { x: wristX, y: wristY, r: 8.5, color: '#b45309' },
      ];

      joints.forEach((j) => {
        ctx.fillStyle = j.color;
        ctx.beginPath();
        ctx.arc(j.x, j.y, j.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Waveform Display Box
      const currentCentsOffset = Math.round(phase * vibratoCents);
      const isPitchFlat = currentCentsOffset < 0;

      const waveBoxX = width - 170;
      const waveBoxY = 25;
      const waveBoxW = 150;
      const waveBoxH = 65;

      ctx.fillStyle = 'rgba(12, 10, 9, 0.85)';
      ctx.fillRect(waveBoxX, waveBoxY, waveBoxW, waveBoxH);
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 1;
      ctx.strokeRect(waveBoxX, waveBoxY, waveBoxW, waveBoxH);

      ctx.strokeStyle = '#71717a';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(waveBoxX, waveBoxY + waveBoxH / 2);
      ctx.lineTo(waveBoxX + waveBoxW, waveBoxY + waveBoxH / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < waveBoxW; x++) {
        const tOffset = (x / waveBoxW) * (2 / vibratoSpeedHz);
        const waveVal = Math.sin(2 * Math.PI * vibratoSpeedHz * (elapsedSec - tOffset));
        const plotY = waveBoxY + waveBoxH / 2 - waveVal * (waveBoxH * 0.38) * ampNormalized;
        if (x === 0) ctx.moveTo(waveBoxX + x, plotY);
        else ctx.lineTo(waveBoxX + x, plotY);
      }
      ctx.stroke();

      ctx.fillStyle = isPitchFlat ? '#38bdf8' : '#fbbf24';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(
        `${currentCentsOffset >= 0 ? '+' : ''}${currentCentsOffset} Cents`,
        waveBoxX + 10,
        waveBoxY + 18
      );

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '9px monospace';
      ctx.fillText(`Frekans: ${(selectedStringNote.freq * Math.pow(2, currentCentsOffset / 1200)).toFixed(1)} Hz`, waveBoxX + 10, waveBoxY + 56);

      // Pitch Center Indicator
      ctx.strokeStyle = phase > 0 ? '#10b981' : '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const arrowStartX = contactBaseX - 35;
      const arrowEndX = contactBaseX + 35;
      ctx.moveTo(arrowStartX, contactBaseY + 20);
      ctx.lineTo(arrowEndX, contactBaseY + 20);
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(contactBaseX, contactBaseY + 20, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#71717a';
      ctx.font = '9px monospace';
      ctx.fillText('Doğal Akort Merkezi', contactBaseX - 45, contactBaseY + 33);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [vibratoType, vibratoSpeedHz, vibratoCents, selectedStringNote]);

  return (
    <div className="bg-stone-900 p-6 md:p-8 rounded-2xl border border-stone-800 shadow-xl space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Keman Pedagojisi & 60 FPS Biyomekanik Animasyon</span>
          </div>
          <h3 className="text-xl font-bold text-stone-100 font-serif">
            Vibrato Parmak, Bilek & Kol Hareketi Simülatörü
          </h3>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl">
            Sol el parmak yastığının tuşe üzerindeki mikro-yuvarlanışı, eklem esnemeleri ve akustik frekans modülasyonu ($f \pm \Delta f$).
          </p>
        </div>

        <button
          onClick={handleTogglePlayAudio}
          className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg ${
            isPlayingAudio
              ? 'bg-amber-500 text-stone-950 shadow-amber-500/30 animate-pulse'
              : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
          }`}
        >
          {isPlayingAudio ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>Vibratolu Sesi Durdur</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Vibratolu Sesi Dinle ({vibratoSpeedHz} Hz)</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {VIBRATO_TYPES.map((type) => {
          const isActive = vibratoType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => {
                setVibratoType(type.id);
                setVibratoSpeedHz(type.speed);
              }}
              className={`p-4 rounded-xl text-left border transition flex flex-col justify-between space-y-2 ${
                isActive
                  ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-md shadow-amber-600/10 ring-1 ring-amber-500'
                  : 'bg-stone-950 border-stone-800 text-stone-400 hover:bg-stone-850 hover:text-stone-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-100">{type.title}</span>
                {isActive && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">{type.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 bg-stone-950 p-4 rounded-2xl border border-stone-800 shadow-inner flex flex-col items-center justify-center">
          <canvas
            ref={canvasRef}
            width={580}
            height={320}
            className="w-full max-w-[580px] h-auto rounded-xl"
          />
          <div className="w-full flex items-center justify-between px-3 pt-3 text-[11px] text-stone-400 border-t border-stone-855">
            <span>🔴 Kırmızı Nokta: Sabit Akort Merkezi ($f_0$)</span>
            <span>🟡 Sarı Alan: Yuvarlanan Parmak Ucu Yastığı</span>
            <span className="font-mono text-amber-400">FPS: 60 (Gerçek Zamanlı Fizik)</span>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4 bg-stone-950 p-5 rounded-2xl border border-stone-800 text-xs">
          <div className="flex items-center gap-2 text-stone-200 font-bold border-b border-stone-800 pb-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Fiziksel Parametre Ayarları</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold text-stone-300">
              <span>Vibrato Hızı (Salınım/Sn):</span>
              <span className="text-amber-400 font-mono font-bold">{vibratoSpeedHz.toFixed(1)} Hz</span>
            </div>
            <input
              type="range"
              min="3.0"
              max="7.5"
              step="0.1"
              value={vibratoSpeedHz}
              onChange={(e) => setVibratoSpeedHz(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500">
              <span>3.0 Hz (Geniş/Yavaş)</span>
              <span>5.5 Hz (Klasik)</span>
              <span>7.5 Hz (Hızlı/Gergin)</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold text-stone-300">
              <span>Salınım Genliği (Cent Sapması):</span>
              <span className="text-amber-400 font-mono font-bold">±{vibratoCents} Sent</span>
            </div>
            <input
              type="range"
              min="10"
              max="40"
              step="2"
              value={vibratoCents}
              onChange={(e) => setVibratoCents(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500">
              <span>±10 Sent (Dar)</span>
              <span>±25 Sent (İdeal)</span>
              <span>±40 Sent (Geniş)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-800 space-y-2">
            <span className="font-semibold text-stone-300 block">Telin Referans Notası:</span>
            <div className="grid grid-cols-2 gap-2">
              {STRING_NOTES.map((n) => (
                <button
                  key={n.name}
                  onClick={() => setSelectedStringNote(n)}
                  className={`p-2 rounded-lg text-center font-mono font-bold transition text-[11px] ${
                    selectedStringNote.name === n.name
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                  }`}
                >
                  {n.name.split(' ')[0]} {n.name.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 bg-stone-950 rounded-xl border border-stone-800 space-y-3 text-xs text-stone-300">
        <div className="flex items-center gap-2 font-bold text-amber-400">
          <Info className="w-4 h-4" />
          <span>Pedagojik Vibrato Kuralı (Ivan Galamian & Carl Flesch):</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed text-stone-400">
          <div className="p-3 bg-stone-900/60 rounded-lg border border-stone-800">
            <span className="font-bold text-stone-200 block mb-1">1. Salınım Yönü Kuralı:</span>
            Vibrato hareketi, parmağın tuşe üzerindeki doğru notasından <strong>asla yukarıya (tize) taşmamalıdır</strong>. Parmak geriye (pese) doğru yuvarlanır ve yeniden gerçek notanın merkezine döner.
          </div>
          <div className="p-3 bg-stone-900/60 rounded-lg border border-stone-800">
            <span className="font-bold text-stone-200 block mb-1">2. Başparmak ve El Ayası Serbestliği:</span>
            Vibrato sırasında sol el başparmağı keman sapını sıkmamalıdır. El ayası (MCP eklemi altı) keman gövdesine veya sapına yapışmamalı, serbestçe salınım yapabilecek hava boşluğu bırakmalıdır.
          </div>
        </div>
      </div>
    </div>
  );
};
