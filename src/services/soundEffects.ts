// Synthesized audio engine using Web Audio API to prevent broken external mp3 links
class SoundEffectsService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private volume: number = 0.8;

  constructor() {
    // Lazily init AudioContext upon first user interaction to satisfy browser autoplay policies
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Triumphant fanfare sound for GOAL notification
   */
  public playGoalSound() {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.35 * this.volume, now);
      masterGain.connect(ctx.destination);

      // Fanfare sequence: C4, E4, G4, C5 (Chord arpeggio) + stadium pulse
      const notes = [
        { freq: 261.63, start: 0, dur: 0.12 },     // C4
        { freq: 329.63, start: 0.1, dur: 0.12 },    // E4
        { freq: 392.00, start: 0.2, dur: 0.16 },    // G4
        { freq: 523.25, start: 0.32, dur: 0.6 },    // C5
        { freq: 659.25, start: 0.38, dur: 0.55 },   // E5 harmony
        { freq: 783.99, start: 0.44, dur: 0.5 }     // G5 high note
      ];

      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        // Brass/stadium synth harmonics
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(note.freq, now + note.start);

        // Lowpass filter for warm stadium brass
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, now + note.start);
        filter.frequency.exponentialRampToValueAtTime(800, now + note.start + note.dur);

        noteGain.gain.setValueAtTime(0.001, now + note.start);
        noteGain.gain.linearRampToValueAtTime(0.28, now + note.start + 0.03);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.dur);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now + note.start);
        osc.stop(now + note.start + note.dur + 0.05);
      });

      // Whistle sweep at the end
      setTimeout(() => {
        this.playWhistleSound(false);
      }, 550);
    } catch {
      // Audio playback catch-all to prevent errors
    }
  }

  /**
   * Realistic referee whistle sound (dual modulated high frequencies)
   */
  public playWhistleSound(isFinalWhistle: boolean = false) {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const whistleBlasts = isFinalWhistle ? [0, 0.4, 0.85] : [0];
      const blastDuration = isFinalWhistle ? 0.32 : 0.45;

      whistleBlasts.forEach((blastOffset) => {
        const now = ctx.currentTime + blastOffset;
        const whistleGain = ctx.createGain();
        whistleGain.gain.setValueAtTime(0.001, now);
        whistleGain.gain.linearRampToValueAtTime(0.22 * this.volume, now + 0.04);
        whistleGain.gain.exponentialRampToValueAtTime(0.001, now + blastDuration);
        whistleGain.connect(ctx.destination);

        // Dual frequencies create the iconic pea whistle beating
        [2850, 3120].forEach((freq) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          // Fast vibrato
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(32, now); // 32 Hz fluttering pea
          lfoGain.gain.setValueAtTime(45, now);
          lfo.connect(osc.frequency);
          lfo.start(now);
          lfo.stop(now + blastDuration);

          osc.connect(whistleGain);
          osc.start(now);
          osc.stop(now + blastDuration);
        });
      });
    } catch {
      // Audio error catch-all
    }
  }
}

export const soundService = new SoundEffectsService();

/**
 * Native Browser Notification Dispatcher
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  return await Notification.requestPermission();
}

export function sendBrowserNotification(title: string, body: string, tag: string = 'football-goal') {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        tag,
        icon: '⚽',
        silent: true, // We provide high quality synthesized audio via soundService
      });
    } catch {
      // In some sandboxed iframes, Notification constructor may throw, fallback cleanly
    }
  }
}
