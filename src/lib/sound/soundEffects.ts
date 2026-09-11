"use client";

// Web Audio API based Sound Synthesizer for Mechanical Keyboard and Game Events

export type SoundTheme = "mechanical" | "typewriter" | "bubble" | "mute";

let audioCtx: AudioContext | null = null;
let currentSoundTheme: SoundTheme = "mechanical";
let isMuted: boolean = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundTheme(theme: SoundTheme) {
  currentSoundTheme = theme;
  if (typeof window !== "undefined") {
    localStorage.setItem("typerush_sound_theme", theme);
  }
}

export function getSoundTheme(): SoundTheme {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("typerush_sound_theme") as SoundTheme;
    if (saved) currentSoundTheme = saved;
  }
  return currentSoundTheme;
}

export function toggleMute(): boolean {
  isMuted = !isMuted;
  if (typeof window !== "undefined") {
    localStorage.setItem("typerush_muted", isMuted ? "true" : "false");
  }
  return isMuted;
}

export function getIsMuted(): boolean {
  if (typeof window !== "undefined") {
    isMuted = localStorage.getItem("typerush_muted") === "true";
  }
  return isMuted;
}

export function playKeySound(type: "press" | "space" | "backspace" | "error" = "press") {
  if (getIsMuted() || currentSoundTheme === "mute") return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (type === "error") {
    // Subtle low buzz
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.1);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
    return;
  }

  if (currentSoundTheme === "mechanical") {
    // Crisp mechanical switch click (click + bottom-out thock)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = type === "space" ? 350 : 600 + Math.random() * 80;
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);

    // High click component
    const noise = ctx.createOscillator();
    const noiseGain = ctx.createGain();
    noise.type = "square";
    noise.frequency.setValueAtTime(1800 + Math.random() * 400, now);
    noiseGain.gain.setValueAtTime(0.04, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.015);
  } else if (currentSoundTheme === "typewriter") {
    // Metallic punch
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1200 + Math.random() * 200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  } else if (currentSoundTheme === "bubble") {
    // Water drop / bubble pop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export function playSoundEffect(effect: "countdown" | "go" | "finish" | "record") {
  if (getIsMuted() || currentSoundTheme === "mute") return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (effect === "countdown") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now); // A4
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (effect === "go") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now); // A5 (higher)
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  } else if (effect === "finish" || effect === "record") {
    // Chord fanfare
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C E G C
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now + idx * 0.08);
      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.35);
    });
  }
}
