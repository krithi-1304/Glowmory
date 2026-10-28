let context: AudioContext | null = null;
let windSource: AudioBufferSourceNode | null = null;
let windGain: GainNode | null = null;
let waterSource: AudioBufferSourceNode | null = null;
let waterGain: GainNode | null = null;
let chirpTimer = 0;
let fadeOutTimer = 0;

function audioContext() {
  if (!context) context = new AudioContext();
  return context;
}

export function playTone(frequency = 440, duration = 0.18, volume = 0.12) {
  const audio = audioContext();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(volume, audio.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + duration + 0.03);
}

export function playChime(volume = 0.3) {
  playTone(523.25, 0.25, volume * 0.18);
  window.setTimeout(() => playTone(659.25, 0.35, volume * 0.14), 90);
}

function scheduleFireflyChirp(volume: number, calmMode: boolean) {
  window.clearTimeout(chirpTimer);
  const delay =
    (calmMode ? 10_000 : 5_000) + Math.random() * (calmMode ? 8_000 : 7_000);
  chirpTimer = window.setTimeout(() => {
    if (!context || context.state === 'closed') return;
    const audio = context;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const start = audio.currentTime;
    const pitch = 1350 + Math.random() * 550;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(pitch, start);
    oscillator.frequency.exponentialRampToValueAtTime(
      pitch * 1.08,
      start + 0.11,
    );
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume * 0.035, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.16);
    scheduleFireflyChirp(volume, calmMode);
  }, delay);
}

export function startNightAmbience(volume: number, calmMode: boolean) {
  const audio = audioContext();
  void audio.resume();
  window.clearTimeout(fadeOutTimer);

  if (!windSource || !waterSource) {
    const buffer = audio.createBuffer(
      1,
      audio.sampleRate * 2,
      audio.sampleRate,
    );
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < channel.length; i += 1) {
      channel[i] = (Math.random() * 2 - 1) * 0.28;
    }
    const makeNoiseLayer = (low: number, high: number) => {
      const source = audio.createBufferSource();
      const lowPass = audio.createBiquadFilter();
      const highPass = audio.createBiquadFilter();
      const gain = audio.createGain();
      source.buffer = buffer;
      source.loop = true;
      lowPass.type = 'lowpass';
      lowPass.frequency.value = low;
      highPass.type = 'highpass';
      highPass.frequency.value = high;
      gain.gain.setValueAtTime(0.0001, audio.currentTime);
      source
        .connect(lowPass)
        .connect(highPass)
        .connect(gain)
        .connect(audio.destination);
      source.start();
      return { source, gain };
    };
    const wind = makeNoiseLayer(620, 90);
    const water = makeNoiseLayer(1500, 260);
    windSource = wind.source;
    windGain = wind.gain;
    waterSource = water.source;
    waterGain = water.gain;
  }

  if (windGain) {
    windGain.gain.cancelScheduledValues(audio.currentTime);
    windGain.gain.setTargetAtTime(
      volume * (calmMode ? 0.024 : 0.042),
      audio.currentTime,
      0.8,
    );
  }
  if (waterGain) {
    waterGain.gain.cancelScheduledValues(audio.currentTime);
    waterGain.gain.setTargetAtTime(
      volume * (calmMode ? 0.01 : 0.018),
      audio.currentTime,
      1.2,
    );
  }
  scheduleFireflyChirp(volume, calmMode);
}

export function stopNightAmbience() {
  window.clearTimeout(chirpTimer);
  if (!context || (!windSource && !waterSource)) return;
  windGain?.gain.cancelScheduledValues(context.currentTime);
  windGain?.gain.setTargetAtTime(0.0001, context.currentTime, 0.16);
  waterGain?.gain.cancelScheduledValues(context.currentTime);
  waterGain?.gain.setTargetAtTime(0.0001, context.currentTime, 0.22);
  fadeOutTimer = window.setTimeout(() => {
    windSource?.stop();
    windSource?.disconnect();
    windGain?.disconnect();
    windSource = null;
    windGain = null;
    waterSource?.stop();
    waterSource?.disconnect();
    waterGain?.disconnect();
    waterSource = null;
    waterGain = null;
  }, 800);
}
