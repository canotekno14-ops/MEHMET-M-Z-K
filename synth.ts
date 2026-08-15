/**
 * MuseAcademy Audio Synthesis Engine
 * Provides high-fidelity Web Audio synthesis for Piano, Violin, Acoustics Physics,
 * Tuning Intonations, and Metronome timing.
 */

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Convert Note Name (e.g., "A4", "C#5", "Eb3") to Frequency (Hz) with custom A4 tuning
export function noteToFrequency(noteName: string, concertPitch: number = 440): number {
  const noteMap: Record<string, number> = {
    'C': -9, 'C#': -8, 'Db': -8,
    'D': -7, 'D#': -6, 'Eb': -6,
    'E': -5,
    'F': -4, 'F#': -3, 'Gb': -3,
    'G': -2, 'G#': -1, 'Ab': -1,
    'A': 0, 'A#': 1, 'Bb': 1,
    'B': 2
  };

  const match = noteName.match(/^([A-G][#b]?)(-?\d+)$/);
  if (!match) return concertPitch;

  const [, pitch, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const semitonesFromA4 = (noteMap[pitch] || 0) + (octave - 4) * 12;

  return concertPitch * Math.pow(2, semitonesFromA4 / 12);
}

// Map MIDI note number (e.g. 60 for C4, 69 for A4) to Frequency
export function midiToFrequency(midi: number, concertPitch: number = 440): number {
  return concertPitch * Math.pow(2, (midi - 69) / 12);
}

/**
 * High-Fidelity Polyphonic Grand Piano Synthesizer
 * Uses multi-harmonic overtone synthesis with natural acoustic decay & hammer impulse
 */
export function playPianoNote(
  frequency: number,
  duration: number = 1.8,
  volume: number = 0.6,
  sustain: boolean = false
): () => void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const actualDuration = sustain ? Math.max(duration, 3.5) : duration;

  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);

  // Harmonics structure for acoustic piano (Fundamental + 2nd, 3rd, 4th, 5th, 6th partials)
  const partials = [
    { ratio: 1.0, gain: 1.0, decayMult: 1.0 },
    { ratio: 2.001, gain: 0.55, decayMult: 0.8 },
    { ratio: 3.003, gain: 0.28, decayMult: 0.65 },
    { ratio: 4.006, gain: 0.14, decayMult: 0.5 },
    { ratio: 5.01, gain: 0.07, decayMult: 0.4 },
    { ratio: 6.015, gain: 0.03, decayMult: 0.3 },
  ];

  const oscillators: OscillatorNode[] = [];

  partials.forEach((partial) => {
    const osc = ctx.createOscillator();
    const pGain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency * partial.ratio, now);

    // Initial attack & exponential decay
    pGain.gain.setValueAtTime(0.0001, now);
    pGain.gain.exponentialRampToValueAtTime(volume * partial.gain, now + 0.008);
    pGain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + actualDuration * partial.decayMult
    );

    osc.connect(pGain);
    pGain.connect(masterGain);

    osc.start(now);
    osc.stop(now + actualDuration * partial.decayMult + 0.05);
    oscillators.push(osc);
  });

  // Percussive hammer click simulation
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.015, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBuffer.length; i++) {
    output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.003));
  }
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(Math.min(frequency * 3, 4000), now);
  noiseFilter.Q.setValueAtTime(3, now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(volume * 0.18, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);

  noiseSource.start(now);
  noiseSource.stop(now + 0.02);

  // Return stop function for early key release
  return () => {
    try {
      const releaseTime = ctx.currentTime;
      masterGain.gain.cancelScheduledValues(releaseTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, releaseTime);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, releaseTime + 0.25);
    } catch {
      // safe ignore
    }
  };
}

/**
 * High-Fidelity Bowed Violin String Synthesizer
 * Sawtooth oscillator with body formants, LFO vibrato (5.5 Hz) and bow noise
 */
export function playViolinNote(
  frequency: number,
  duration: number = 2.2,
  vibratoDepth: number = 0.02,
  volume: number = 0.5
): () => void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);

  // 1. Primary String Oscillator (Sawtooth waveform rich in odd & even harmonics)
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(frequency, now);

  // 2. Vibrato LFO (5.5 Hz typical of classical violinists)
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.setValueAtTime(5.5, now);
  // Delay vibrato onset slightly for authentic singing tone
  lfoGain.gain.setValueAtTime(0.0001, now);
  lfoGain.gain.linearRampToValueAtTime(frequency * vibratoDepth, now + 0.35);

  lfo.connect(osc.frequency);

  // 3. Violin Wood Body Resonant Formant Filters (Simulating Spruce Top & Maple Back body cavity)
  const bodyFilter1 = ctx.createBiquadFilter();
  bodyFilter1.type = 'bandpass';
  bodyFilter1.frequency.setValueAtTime(480, now); // Main wood resonance (Acoustic cavity)
  bodyFilter1.Q.setValueAtTime(2.5, now);

  const bodyFilter2 = ctx.createBiquadFilter();
  bodyFilter2.type = 'peaking';
  bodyFilter2.frequency.setValueAtTime(2800, now); // Bridge & String brightness
  bodyFilter2.gain.setValueAtTime(6, now);
  bodyFilter2.Q.setValueAtTime(1.8, now);

  // 4. Bow Envelope (Slight gradual rise representing bow hair bite, sustained tone, gentle release)
  const envGain = ctx.createGain();
  envGain.gain.setValueAtTime(0.0001, now);
  envGain.gain.linearRampToValueAtTime(volume * 0.7, now + 0.12);
  envGain.gain.setValueAtTime(volume * 0.7, now + duration - 0.2);
  envGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(bodyFilter1);
  bodyFilter1.connect(bodyFilter2);
  bodyFilter2.connect(envGain);
  envGain.connect(masterGain);

  lfo.start(now);
  osc.start(now);
  lfo.stop(now + duration + 0.1);
  osc.stop(now + duration + 0.1);

  return () => {
    try {
      const releaseTime = ctx.currentTime;
      envGain.gain.cancelScheduledValues(releaseTime);
      envGain.gain.setValueAtTime(envGain.gain.value, releaseTime);
      envGain.gain.exponentialRampToValueAtTime(0.0001, releaseTime + 0.15);
    } catch {
      // safe ignore
    }
  };
}

/**
 * High-Fidelity Violin Synthesizer with Custom Vibrato Rate and Cents Modulation
 */
export function playViolinWithCustomVibrato(
  frequency: number = 440,
  duration: number = 3.0,
  vibratoRateHz: number = 5.5,
  vibratoCents: number = 25,
  volume: number = 0.55
): () => void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(frequency, now);

  // Convert cents to frequency delta: deltaHz = freq * (2^(cents/1200) - 1)
  const deltaHz = frequency * (Math.pow(2, vibratoCents / 1200) - 1);

  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.setValueAtTime(vibratoRateHz, now);
  lfoGain.gain.setValueAtTime(0.0001, now);
  lfoGain.gain.linearRampToValueAtTime(deltaHz, now + 0.15);

  lfo.connect(osc.frequency);

  const bodyFilter1 = ctx.createBiquadFilter();
  bodyFilter1.type = 'bandpass';
  bodyFilter1.frequency.setValueAtTime(480, now);
  bodyFilter1.Q.setValueAtTime(2.5, now);

  const bodyFilter2 = ctx.createBiquadFilter();
  bodyFilter2.type = 'peaking';
  bodyFilter2.frequency.setValueAtTime(2800, now);
  bodyFilter2.gain.setValueAtTime(6, now);
  bodyFilter2.Q.setValueAtTime(1.8, now);

  const envGain = ctx.createGain();
  envGain.gain.setValueAtTime(0.0001, now);
  envGain.gain.linearRampToValueAtTime(volume * 0.7, now + 0.12);
  envGain.gain.setValueAtTime(volume * 0.7, now + duration - 0.2);
  envGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(bodyFilter1);
  bodyFilter1.connect(bodyFilter2);
  bodyFilter2.connect(envGain);
  envGain.connect(masterGain);

  lfo.start(now);
  osc.start(now);
  lfo.stop(now + duration + 0.1);
  osc.stop(now + duration + 0.1);

  return () => {
    try {
      const releaseTime = ctx.currentTime;
      envGain.gain.cancelScheduledValues(releaseTime);
      envGain.gain.setValueAtTime(envGain.gain.value, releaseTime);
      envGain.gain.exponentialRampToValueAtTime(0.0001, releaseTime + 0.15);
    } catch {}
  };
}

/**
 * Pure Tone / Acoustics Waveform Generator
 * For testing Sine, Square, Triangle, Sawtooth wave physics & frequencies
 */
export function playAcousticWave(
  frequency: number,
  waveType: OscillatorType = 'sine',
  duration: number = 2.0,
  volume: number = 0.4
): () => void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = waveType;
  osc.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.05);
  gain.gain.setValueAtTime(volume, now + duration - 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.05);

  return () => {
    try {
      const stopNow = ctx.currentTime;
      gain.gain.cancelScheduledValues(stopNow);
      gain.gain.setValueAtTime(gain.gain.value, stopNow);
      gain.gain.exponentialRampToValueAtTime(0.0001, stopNow + 0.08);
    } catch {}
  };
}

/**
 * Harmonic Series Overtone Synthesizer
 * Plays fundamental + 6 partials with individual controllable amplitudes
 */
export function playHarmonicsSeries(
  fundamentalHz: number,
  harmonicGains: number[], // [h1, h2, h3, h4, h5, h6, h7]
  duration: number = 3.0
): () => void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);

  const activeOscs: OscillatorNode[] = [];

  harmonicGains.forEach((amp, idx) => {
    if (amp <= 0.01) return;
    const harmonicOrder = idx + 1;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(fundamentalHz * harmonicOrder, now);

    const level = (amp * 0.3) / Math.sqrt(harmonicOrder);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(level, now + 0.08);
    gain.gain.setValueAtTime(level, now + duration - 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.05);
    activeOscs.push(osc);
  });

  return () => {
    try {
      const stopNow = ctx.currentTime;
      masterGain.gain.cancelScheduledValues(stopNow);
      masterGain.gain.setValueAtTime(masterGain.gain.value, stopNow);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, stopNow + 0.1);
    } catch {}
  };
}

/**
 * Intonation & Tuning System Dual-Note Comparison
 * Plays two pitches simultaneously to observe acoustic interference / beating
 */
export function playIntonationComparison(
  f1: number,
  f2: number,
  duration: number = 3.0
): () => void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
  gain.gain.setValueAtTime(0.3, now + duration - 0.1);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  gain.connect(ctx.destination);

  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(f1, now);
  osc1.connect(gain);

  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(f2, now);
  osc2.connect(gain);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + duration + 0.05);
  osc2.stop(now + duration + 0.05);

  return () => {
    try {
      const stopNow = ctx.currentTime;
      gain.gain.cancelScheduledValues(stopNow);
      gain.gain.setValueAtTime(gain.gain.value, stopNow);
      gain.gain.exponentialRampToValueAtTime(0.0001, stopNow + 0.05);
    } catch {}
  };
}

/**
 * Metronome Click Sound
 */
export function playMetronomeClick(isAccent: boolean = false): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  if (isAccent) {
    osc.frequency.setValueAtTime(1400, now);
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
  } else {
    osc.frequency.setValueAtTime(900, now);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
  }

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.05);
}

/**
 * Synthesize Clap Sound (Filtered Noise Burst)
 */
export function playClapSound(volume: number = 0.7): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 0.08;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.018));
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1100, now);
  filter.Q.setValueAtTime(1.8, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + 0.09);
}

/**
 * Synthesize Pencil Tap Sound (Wood transient click)
 */
export function playPencilTapSound(volume: number = 0.7): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(2400, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.02);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.03);
}

/**
 * Play Multiple Polyphonic Notes Simultaneously (e.g. for Two-Tone or Three-Tone Chords)
 */
export function playHarmonicChord(
  frequencies: number[],
  duration: number = 2.5,
  volume: number = 0.5
): () => void {
  const stopFns = frequencies.map((freq) => playPianoNote(freq, duration, volume / Math.sqrt(frequencies.length)));
  return () => {
    stopFns.forEach((fn) => fn());
  };
}

