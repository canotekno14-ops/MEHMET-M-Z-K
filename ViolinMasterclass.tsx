import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Activity, 
  Sliders, 
  Music, 
  BookOpen, 
  Info, 
  Volume2, 
  VolumeX,
  Layers,
  Zap
} from 'lucide-react';

// ==========================================
// 1. VIOLIN VIBRATO SIMULATOR (60 FPS + WEB AUDIO API)
// ==========================================
export const ViolinVibratoSimulator: React.FC = () => {
  const [type, setType] = useState<'wrist' | 'arm' | 'finger'>('wrist');
  const [frequency, setFrequency] = useState<number>(5.5); // Hz (3 - 8 Hz)
  const [amplitude, setAmplitude] = useState<number>(25);  // Cents (±5 - 50 cents)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Web Audio Synth Setup (A4 - 440Hz Violin Tone + Frequency Modulated LFO)
  useEffect(() => {
    if (!audioEnabled) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    // Carrier Oscillator (Keman A4 440Hz Ana Tonu)
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 440;

    // Sıcak Keman Rezonansı için Lowpass Filtre
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1800;

    // Vibrato LFO (Low Frequency Oscillator)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = frequency;

    const lfoGain = ctx.createGain();
    // Cent biriminden Hz sapmasına dönüşüm (440Hz etrafında cent dalgalanması)
    const pitchShiftHz = 440 * (Math.pow(2, amplitude / 1200) - 1);
    lfoGain.gain.value = pitchShiftHz;

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    const masterGain = ctx.createGain();
    masterGain.gain.value = isPlaying ? 0.2 : 0;

    osc.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    osc.start();
    lfo.start();

    oscRef.current = osc;
    lfoRef.current = lfo;
    lfoGainRef.current = lfoGain;
    masterGainRef.current = masterGain;

    return () => {
      osc.stop();
      lfo.stop();
      ctx.close();
    };
  }, [audioEnabled]);

  // Dinamik Frekans ve Genlik Güncellemesi
  useEffect(() => {
    if (lfoRef.current && lfoGainRef.current && audioCtxRef.current) {
      lfoRef.current.frequency.setTargetAtTime(frequency, audioCtxRef.current.currentTime, 0.05);
      const gainVal = 440 * (Math.pow(2, amplitude / 1200) - 1);
      lfoGainRef.current.gain.setTargetAtTime(gainVal, audioCtxRef.current.currentTime, 0.05);
    }
  }, [frequency, amplitude]);

  // Sesi Oynat / Durdur Tetikleyicisi
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      const targetGain = isPlaying ? 0.2 : 0;
      masterGainRef.current.gain.setTargetAtTime(targetGain, audioCtxRef.current.currentTime, 0.05);
    }
  }, [isPlaying]);

  // Canvas 60 FPS Görselleştirici Animasyon
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Arka Plan Izgarası
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Merkez Referans Çizgisi (A4 440Hz Hedef Entonasyon)
      const centerY = canvas.height / 2;
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(canvas.width, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Dalga Formunu Çiz (Modüle Edilmiş Frekans/Cent Eğrisi)
      ctx.beginPath();
      ctx.lineWidth = 3;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#6366f1');
      gradient.addColorStop(0.5, '#a855f7');
      gradient.addColorStop(1, '#ec4899');
      ctx.strokeStyle = gradient;

      const waveSpeed = isPlaying ? (frequency * 0.08) : 0;
      phase += waveSpeed;

      for (let x = 0; x < canvas.width; x++) {
        const yOffset = Math.sin((x * 0.02) - phase) * (amplitude * 0.8);
        const y = centerY + yOffset;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Sol El Parmak Biyomekanik İbre İşaretçisi
      const markerX = canvas.width * 0.75;
      const markerY = centerY + Math.sin((markerX * 0.02) - phase) * (amplitude * 0.8);

      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(markerX, markerY, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(236, 72, 153, 0.3)';
      ctx.beginPath();
      ctx.arc(markerX, markerY, 15, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [frequency, amplitude, isPlaying, type]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100">
      {/* Üst Başlık & Kontroller */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
              Biyomekanik Vibrato Simülatörü (60 FPS)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sol el vibrato mekaniği, frekans modülasyonu ve entonasyon salınım analizi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              audioEnabled 
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4" />}
            {audioEnabled ? 'Ses Açık' : 'Sesi Etkinleştir'}
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all shadow-lg ${
              isPlaying
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 font-bold'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Durdur' : 'Simülasyonu Başlat'}
          </button>
        </div>
      </div>

      {/* Canvas Görselleştirici */}
      <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 mb-6">
        <canvas
          ref={canvasRef}
          width={700}
          height={180}
          className="w-full h-44 block"
        />
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-md border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-3">
          <span>Hedef: <strong className="text-indigo-400">A4 (440 Hz)</strong></span>
          <span>Genlik: <strong className="text-pink-400">±{amplitude} cent</strong></span>
          <span>Hız: <strong className="text-emerald-400">{frequency} Hz</strong></span>
        </div>
      </div>

      {/* Parametre Sürgüleri & Seçenekler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vibrato Tipi */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <label className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" /> Vibrato Tipi
          </label>
          <div className="space-y-2">
            {[
              { id: 'wrist', label: 'Bilek Vibratosu', desc: 'Esnek ve dengeli genlik salınımı' },
              { id: 'arm', label: 'Kol Vibratosu', desc: 'Geniş, tutkulu ve yoğun ses' },
              { id: 'finger', label: 'Parmak Vibratosu', desc: 'Hızlı, dar ve hassas süsleme' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setType(item.id as 'wrist' | 'arm' | 'finger')}
                className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                  type === item.id
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-medium'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-slate-200">{item.label}</div>
                <div className="text-[10px] text-slate-400">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Frekans / Hız Sürgüsü */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Salınım Hızı (Frekans)
              </label>
              <span className="text-xs font-mono font-bold text-amber-400">{frequency} Hz</span>
            </div>
            <input
              type="range"
              min="3"
              max="8"
              step="0.1"
              value={frequency}
              onChange={(e) => setFrequency(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer my-4"
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            {frequency < 4.5 ? 'Ağır & Lirik: Genellikle yavaş tempolu, derin melodik pasajlarda tercih edilir.' :
             frequency <= 6.5 ? 'Standart İdeal: Keman sololarında en çok kullanılan doğal salınım frekansı.' :
             'Hızlı & Yoğun: Dramatik climax ve staccato geçişlerinde kullanılır.'}
          </p>
        </div>

        {/* Genlik Sürgüsü */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-pink-400" /> Salınım Genliği (Genişlik)
              </label>
              <span className="text-xs font-mono font-bold text-pink-400">±{amplitude} cent</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={amplitude}
              onChange={(e) => setAmplitude(parseInt(e.target.value))}
              className="w-full accent-pink-500 bg-slate-800 h-2 rounded-lg cursor-pointer my-4"
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            Entonasyon kuralı: Vibrato salınımı <strong>ana notadan geriye doğru</strong> yapılmalıdır.
          </p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. ANA VIOLIN MASTERCLASS BİLEŞENİ
// ==========================================
export default function ViolinMasterclass() {
  const [activeTab, setActiveTab] = useState<'left-hand' | 'bowing' | 'anatomy'>('left-hand');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Başlık */}
      <header className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-3">
            <Music className="w-3.5 h-3.5" /> MuseAcademy Pedagoji Modülü
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            Keman Masterclass & Biyomekanik Analiz
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Sol el vibrato dinamiği, tuşe entonasyon analizi ve arşe fiziğini interaktif simülasyonlarla inceleyin.
          </p>
        </div>
      </header>

      {/* Sekmeler */}
      <nav className="flex items-center gap-2 border-b border-slate-800/80 pb-2 overflow-x-auto">
        {[
          { id: 'left-hand', label: 'Sol El & Armonikler', icon: Activity },
          { id: 'bowing', label: 'Arşe Teknikleri & Ses Üretimi', icon: Sliders },
          { id: 'anatomy', label: 'Enstrüman Anatomisi', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'left-hand' | 'bowing' | 'anatomy')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Sekme İçerikleri */}
      <main className="space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'left-hand' && (
            <motion.div
              key="left-hand"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Entegre Edilmiş Vibrato Simülatörü */}
              <ViolinVibratoSimulator />

              {/* Pedagoji Bilgi Kartları */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-2">
                    <Info className="w-4 h-4" /> Vibrato Egzersiz Reçetesi
                  </div>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
                    <li>Metronom eşliğinde 60 BPM hızında 1/4 ve 1/8 salınımlarla başlayın.</li>
                    <li>Sol el başparmağının klavyeye baskı yapmadığından emin olun.</li>
                    <li>Bilek vibratosunda hareketin temeli ön kolun üst eklem noktasıdır.</li>
                  </ul>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-2">
                    <Info className="w-4 h-4" /> Doğal Armonik Fizik Kuralları
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tel uzunluğunun tam düğüm noktalarına (1/2, 1/3, 1/4) hafifçe dokunulduğunda tel bölünerek saf armonik frekanslar üretir.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'bowing' && (
            <motion.div
              key="bowing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 text-sm"
            >
              <h3 className="text-lg font-bold text-white mb-2">Arşe Dağılımı ve Telsel Temas Temelleri</h3>
              <p className="text-xs text-slate-400">
                Arşe hızı, ağırlığı ve köprüye olan mesafe (Soundpoint) ses rengini belirleyen 3 ana parametredir.
              </p>
            </motion.div>
          )}

          {activeTab === 'anatomy' && (
            <motion.div
              key="anatomy"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 text-sm"
            >
              <h3 className="text-lg font-bold text-white mb-2">Keman Anatomisi & Salyangoz / Eşik Yapısı</h3>
              <p className="text-xs text-slate-400">
                Ladin üst kapak ve akçaağaç arka kapak titreşimi can direği (Soundpost) aracılığıyla aktarır.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
