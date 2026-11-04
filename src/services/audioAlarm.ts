/**
 * Procedural Web Audio API sound synthesizer for Datacenter Early Warning System.
 * Generates warning chirps, emergency industrial sirens, and UI feedback without external audio files.
 */

class AudioAlarmService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.4;
  private activeSirenOsc: OscillatorNode | null = null;
  private activeSirenGain: GainNode | null = null;
  private sirenLfo: OscillatorNode | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAlarm();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.activeSirenGain && this.ctx) {
      this.activeSirenGain.gain.setValueAtTime(this.volume * 0.35, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Play a short tactile notification ping (e.g. for selection or acknowledging)
   */
  public playClick(freq = 880) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Play a dual-tone warning beep (yellow warning state)
   */
  public playWarningBeep() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(880, now + 0.12); // A5

      gain.gain.setValueAtTime(this.volume * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Continuous industrial emergency siren for Critical Red state
   */
  public startEmergencySiren() {
    if (this.isMuted || this.activeSirenOsc) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const carrier = this.ctx.createOscillator();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      const masterGain = this.ctx.createGain();

      carrier.type = 'sawtooth';
      carrier.frequency.setValueAtTime(750, now);

      // LFO modulates frequency between 600Hz and 1000Hz (wailing siren)
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(1.8, now); // 1.8 Hz cycle
      lfoGain.gain.setValueAtTime(250, now);

      lfo.connect(lfoGain);
      lfoGain.connect(carrier.frequency);

      masterGain.gain.setValueAtTime(this.volume * 0.2, now);

      carrier.connect(masterGain);
      masterGain.connect(this.ctx.destination);

      carrier.start(now);
      lfo.start(now);

      this.activeSirenOsc = carrier;
      this.sirenLfo = lfo;
      this.activeSirenGain = masterGain;
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Stop the continuous emergency siren
   */
  public stopAlarm() {
    if (this.activeSirenOsc) {
      try {
        this.activeSirenOsc.stop();
        this.activeSirenOsc.disconnect();
      } catch {}
      this.activeSirenOsc = null;
    }
    if (this.sirenLfo) {
      try {
        this.sirenLfo.stop();
        this.sirenLfo.disconnect();
      } catch {}
      this.sirenLfo = null;
    }
    if (this.activeSirenGain) {
      try {
        this.activeSirenGain.disconnect();
      } catch {}
      this.activeSirenGain = null;
    }
  }
}

export const audioAlarm = new AudioAlarmService();
