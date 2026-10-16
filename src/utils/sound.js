// Audio file playback with fallback to Web Audio API
let audioCtx = null;
let matchAudio = null;
let victoryAudio = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Flip sound (subtle click)
export function playFlipSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    // Audio context error or blocked
  }
}

// 2. Match sound: plays /sounds/match.mp3 (generated via ffmpeg)
export function playMatchSound() {
  try {
    if (!matchAudio && typeof Audio !== 'undefined') {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const soundPath = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}sounds/match.mp3`;
      matchAudio = new Audio(soundPath);
      matchAudio.volume = 0.85;
    }
    if (matchAudio) {
      matchAudio.currentTime = 0;
      const promise = matchAudio.play();
      if (promise !== undefined) {
        promise.catch(() => {
          playSynthesizedMatch();
        });
      }
      return;
    }
  } catch (e) {
    // Fallback below
  }
  playSynthesizedMatch();
}

function playSynthesizedMatch() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1318.5, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
}

// 3. Mismatch sound
export function playMismatchSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // Audio context error
  }
}

// 4. Victory fanfare: plays /sounds/victory.mp3 (generated via ffmpeg, 3 ascending notes)
export function playWinSound() {
  try {
    if (!victoryAudio && typeof Audio !== 'undefined') {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const soundPath = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}sounds/victory.mp3`;
      victoryAudio = new Audio(soundPath);
      victoryAudio.volume = 0.9;
    }
    if (victoryAudio) {
      victoryAudio.currentTime = 0;
      const promise = victoryAudio.play();
      if (promise !== undefined) {
        promise.catch(() => {
          playSynthesizedWin();
        });
      }
      return;
    }
  } catch (e) {
    // Fallback below
  }
  playSynthesizedWin();
}

function playSynthesizedWin() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [
      { freq: 523.25, time: 0 },
      { freq: 659.25, time: 0.22 },
      { freq: 1046.50, time: 0.44 },
    ];
    notes.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + time);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + 0.4);
    });
  } catch (e) {}
}
