/** Maths Quest interaction sounds — small Web Audio cues, played only after a learner action. */
type Tone = { frequency: number; start: number; duration: number; volume?: number; type?: OscillatorType };

function playTones(tones: Tone[]) {
  if (typeof window === "undefined") return;

  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const now = context.currentTime;

  tones.forEach(({ frequency, start, duration, volume = 0.06, type = "sine" }) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now + start);
    gain.gain.setValueAtTime(0.0001, now + start);
    gain.gain.exponentialRampToValueAtTime(volume, now + start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now + start);
    oscillator.stop(now + start + duration + 0.02);
  });

  window.setTimeout(() => context.close().catch(() => undefined), 1400);
}

export function playCorrectSound() {
  playTones([
    { frequency: 523.25, start: 0, duration: 0.12, type: "triangle" },
    { frequency: 659.25, start: 0.1, duration: 0.16, type: "triangle" },
  ]);
}

export function playWrongSound() {
  playTones([
    { frequency: 220, start: 0, duration: 0.11, volume: 0.045, type: "sine" },
    { frequency: 175, start: 0.11, duration: 0.16, volume: 0.04, type: "sine" },
  ]);
}

export function playCelebrationSound() {
  playTones([
    { frequency: 523.25, start: 0, duration: 0.12, type: "triangle" },
    { frequency: 659.25, start: 0.1, duration: 0.12, type: "triangle" },
    { frequency: 783.99, start: 0.2, duration: 0.14, type: "triangle" },
    { frequency: 1046.5, start: 0.31, duration: 0.3, volume: 0.075, type: "triangle" },
  ]);
}
