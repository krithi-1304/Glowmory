let context: AudioContext | null = null;
export function playTone(frequency = 440, duration = 0.18, volume = 0.12) {
  if (!context) context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(volume, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    context.currentTime + duration,
  );
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration + 0.03);
}
export function playChime(volume = 0.3) {
  playTone(523.25, 0.25, volume * 0.18);
  window.setTimeout(() => playTone(659.25, 0.35, volume * 0.14), 90);
}
