let context: AudioContext | null = null;
let master: GainNode | null = null;
let voices: { oscillator: OscillatorNode; breath: OscillatorNode; nodes: AudioNode[] }[] = [];
let fadeOutTimer = 0;
const accents = new Set<OscillatorNode>();

function audioContext() {
  if (!context) context = new AudioContext();
  return context;
}

// Gentle attacks avoid the click/sharp chirp of the previous short tones.
export function playTone(frequency = 261.63, duration = 1.4, volume = 0.025) {
  const audio = audioContext();
  void audio.resume();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  const now = audio.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(Math.max(0, Math.min(volume, 0.05)), now + 0.25);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(gain).connect(audio.destination);
  accents.add(oscillator);
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); accents.delete(oscillator); };
  oscillator.start();
  oscillator.stop(now + duration + 0.05);
}

export function playChime(volume = 0.3) {
  playTone(261.63, 1.6, volume * 0.045);
  playTone(392, 2.1, volume * 0.025);
}

export function startNightAmbience(volume: number, calmMode: boolean) {
  const audio = audioContext();
  void audio.resume();
  window.clearTimeout(fadeOutTimer);
  if (!master) {
    master = audio.createGain();
    master.gain.value = 0;
    master.connect(audio.destination);
    // An open, consonant G/D/A pad. Four quiet voices breathe independently;
    // no percussion, random high chirps, noise loops or network audio assets.
    voices = [196, 293.66, 392, 440].map((pitch, index) => {
      const oscillator = audio.createOscillator();
      const breath = audio.createOscillator();
      const depth = audio.createGain();
      const gain = audio.createGain();
      const pan = audio.createStereoPanner();
      oscillator.type = 'sine';
      oscillator.frequency.value = pitch;
      oscillator.detune.value = index % 2 ? 1.5 : -1.5;
      gain.gain.value = index === 3 ? 0.12 : 0.22;
      breath.frequency.value = 0.035 + index * 0.009;
      depth.gain.value = 0.025;
      pan.pan.value = (index - 1.5) * 0.16;
      breath.connect(depth).connect(gain.gain);
      oscillator.connect(gain).connect(pan).connect(master!);
      oscillator.start();
      breath.start();
      return { oscillator, breath, nodes: [depth, gain, pan] };
    });
  }
  master.gain.cancelScheduledValues(audio.currentTime);
  master.gain.setTargetAtTime(Math.max(0, Math.min(volume, 1)) * (calmMode ? 0.045 : 0.06), audio.currentTime, 1.5);
}

export function stopNightAmbience() {
  window.clearTimeout(fadeOutTimer);
  accents.forEach(oscillator => { oscillator.stop(); });
  if (!context || !master) return;
  master.gain.cancelScheduledValues(context.currentTime);
  master.gain.setTargetAtTime(0, context.currentTime, 0.2);
  fadeOutTimer = window.setTimeout(() => {
    voices.forEach(({ oscillator, breath, nodes }) => {
      oscillator.stop(); breath.stop();
      oscillator.disconnect(); breath.disconnect();
      nodes.forEach(node => node.disconnect());
    });
    voices = [];
    master?.disconnect();
    master = null;
  }, 1000);
}
