// Web Audio API based nostalgic synthesizer & music player
// Zero external audio files required, runs 100% reliably in any browser!

class NostalgicAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentVolume: number = 0.65;
  private timerId: number | null = null;
  private step: number = 0;
  private trackMood: 'piano' | 'lofi' | 'musicbox' = 'piano';
  private onBeatCallback: ((beatNumber: number) => void) | null = null;
  private customAudio: HTMLAudioElement | null = null;
  private isCustomAudio: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setOnBeat(cb: (beatNumber: number) => void) {
    this.onBeatCallback = cb;
  }

  public setMood(mood: 'piano' | 'lofi' | 'musicbox') {
    this.trackMood = mood;
  }

  public setVolume(val: number) {
    this.currentVolume = Math.max(0, Math.min(1, val));
    if (this.customAudio) {
      this.customAudio.volume = this.currentVolume;
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public async play(): Promise<void> {
    if (this.isPlaying) return;
    this.initContext();

    if (this.isCustomAudio && this.customAudio) {
      try {
        await this.customAudio.play();
        this.isPlaying = true;
        return;
      } catch (err) {
        console.warn("Custom audio play error:", err);
      }
    }

    this.isPlaying = true;
    this.scheduleNotes();
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public playCustomFile(file: File) {
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio.src = '';
    }
    const url = URL.createObjectURL(file);
    this.customAudio = new Audio(url);
    this.customAudio.loop = true;
    this.customAudio.volume = this.currentVolume;
    this.isCustomAudio = true;
    this.customAudio.play().then(() => {
      this.isPlaying = true;
    }).catch(err => console.warn(err));
  }

  public useBuiltInMusic() {
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio = null;
    }
    this.isCustomAudio = false;
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  }

  private scheduleNotes() {
    if (!this.isPlaying || !this.ctx) return;

    // Chord progressions in F Major / D minor (Sweet & Nostalgic)
    // Fmaj7 -> Dm7 -> Bbmaj7 -> C7sus4
    const chords: { baseFreq: number; chord: number[]; bpm: number }[] = [
      { baseFreq: 174.61, chord: [349.23, 440.0, 523.25, 659.25], bpm: 72 }, // Fmaj7
      { baseFreq: 146.83, chord: [293.66, 349.23, 440.0, 523.25], bpm: 72 }, // Dm7
      { baseFreq: 116.54, chord: [233.08, 349.23, 440.0, 587.33], bpm: 72 }, // Bbmaj7
      { baseFreq: 130.81, chord: [261.63, 349.23, 392.0, 523.25], bpm: 72 }  // C7sus4
    ];

    const currentChordObj = chords[Math.floor(this.step / 4) % chords.length];
    const noteInArp = currentChordObj.chord[this.step % currentChordObj.chord.length];

    // Trigger sound
    this.playTone(noteInArp, this.trackMood);

    // If beat 0 of bar, also play bass note
    if (this.step % 4 === 0) {
      this.playTone(currentChordObj.baseFreq, 'bass');
    }

    if (this.onBeatCallback) {
      this.onBeatCallback(this.step);
    }

    this.step = (this.step + 1) % 64;

    // Interval between notes (roughly 420ms for smooth 72bpm quarter/eighth feel)
    const delay = this.trackMood === 'musicbox' ? 460 : 420;
    this.timerId = window.setTimeout(() => {
      this.scheduleNotes();
    }, delay);
  }

  private playTone(freq: number, style: 'piano' | 'lofi' | 'musicbox' | 'bass') {
    if (!this.ctx || this.currentVolume <= 0) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      let dur = 1.4;

      if (style === 'musicbox') {
        osc.type = 'sine';
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.35 * this.currentVolume, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        dur = 1.3;
      } else if (style === 'lofi') {
        osc.type = 'triangle';
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(850, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.4 * this.currentVolume, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
        dur = 1.6;
      } else if (style === 'bass') {
        osc.type = 'sine';
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.5 * this.currentVolume, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
        dur = 1.9;
      } else {
        // 'piano' nostalgic ambient Rhodes feel
        osc.type = 'sine';
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.38 * this.currentVolume, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
        dur = 1.7;
      }

      osc.frequency.setValueAtTime(freq, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + dur);
    } catch {
      // Audio node cleanup safe
    }
  }
}

export const audioEngine = new NostalgicAudioEngine();
