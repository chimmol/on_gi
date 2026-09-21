/**
 * Synthesizes peaceful ambient audio using Web Audio API
 * No external audio files needed - purely procedural, gentle, and lightweight.
 */

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private currentType: string | null = null;
  private nodes: (AudioNode | number)[] = [];
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.masterGain && this.ctx) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  public playSound(type: 'rain' | 'fireplace' | 'wind' | 'chime' | 'off') {
    this.stop();
    if (type === 'off') {
      this.currentType = null;
      return;
    }

    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      this.currentType = type;

      if (type === 'rain') {
        this.startRain();
      } else if (type === 'fireplace') {
        this.startFireplace();
      } else if (type === 'wind') {
        this.startWind();
      } else if (type === 'chime') {
        this.playSingingBowl();
      }
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  public stop() {
    // Clear scheduled intervals
    this.nodes.forEach((item) => {
      if (typeof item === 'number') {
        window.clearInterval(item);
      } else {
        try {
          (item as any).stop?.();
          item.disconnect();
        } catch {}
      }
    });
    this.nodes = [];
    this.currentType = null;
  }

  public getCurrentType() {
    return this.currentType;
  }

  public playSingingBowl() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const freqs = [216, 432, 648, 864];
    const gains = [0.4, 0.25, 0.1, 0.05];

    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(gains[idx] * 0.5, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 5.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 6.0);
    });
  }

  private startRain() {
    if (!this.ctx || !this.masterGain) return;

    // Pink/white noise buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter for window rain
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.masterGain);

    whiteNoise.start(0);
    this.nodes.push(whiteNoise, filter, rainGain);
  }

  private startWind() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.05;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 3.5;
    filter.frequency.value = 380;

    // LFO to sway wind frequency
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.2; // 5s cycle
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 180;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const windGain = this.ctx.createGain();
    windGain.gain.value = 0.45;

    noise.connect(filter);
    filter.connect(windGain);
    windGain.connect(this.masterGain);

    noise.start(0);
    lfo.start(0);
    this.nodes.push(noise, filter, lfo, lfoGain, windGain);
  }

  private startFireplace() {
    if (!this.ctx || !this.masterGain) return;

    // Warm low-frequency rumble
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 0.35;
    }

    const rumble = this.ctx.createBufferSource();
    rumble.buffer = noiseBuffer;
    rumble.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 250;

    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.value = 0.5;

    rumble.connect(filter);
    filter.connect(rumbleGain);
    rumbleGain.connect(this.masterGain);
    rumble.start(0);
    this.nodes.push(rumble, filter, rumbleGain);

    // Crackle generator interval
    const interval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || this.currentType !== 'fireplace') return;
      if (Math.random() > 0.4) {
        const crackleTime = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const crackleGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800 + Math.random() * 1800, crackleTime);

        crackleGain.gain.setValueAtTime(0.001, crackleTime);
        crackleGain.gain.exponentialRampToValueAtTime(0.08 + Math.random() * 0.12, crackleTime + 0.003);
        crackleGain.gain.exponentialRampToValueAtTime(0.0001, crackleTime + 0.03 + Math.random() * 0.04);

        osc.connect(crackleGain);
        crackleGain.connect(this.masterGain);

        osc.start(crackleTime);
        osc.stop(crackleTime + 0.08);
      }
    }, 120);

    this.nodes.push(interval);
  }
}

export const soundEngine = new AmbientSoundEngine();
