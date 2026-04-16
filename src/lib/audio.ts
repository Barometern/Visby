export function playSuccessfulScanSound() {
  try {
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    const ctx = new AudioContextCtor();

    const bufferSize = ctx.sampleRate * 0.4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(2000, ctx.currentTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.4);
    noiseFilter.Q.value = 2;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.15, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start();

    const chime = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    chime.connect(chimeGain);
    chimeGain.connect(ctx.destination);
    chime.type = "sine";
    chime.frequency.setValueAtTime(523, ctx.currentTime + 0.2);
    chime.frequency.setValueAtTime(659, ctx.currentTime + 0.35);
    chime.frequency.setValueAtTime(784, ctx.currentTime + 0.5);
    chime.frequency.setValueAtTime(1047, ctx.currentTime + 0.65);
    chimeGain.gain.setValueAtTime(0, ctx.currentTime);
    chimeGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.25);
    chimeGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
    chime.start(ctx.currentTime + 0.2);
    chime.stop(ctx.currentTime + 1);

    window.setTimeout(() => {
      const thud = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thud.connect(thudGain);
      thudGain.connect(ctx.destination);
      thud.type = "sine";
      thud.frequency.setValueAtTime(80, ctx.currentTime);
      thud.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.3);
      thudGain.gain.setValueAtTime(0.3, ctx.currentTime);
      thudGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      thud.start();
      thud.stop(ctx.currentTime + 0.3);
    }, 2500);

    window.setTimeout(() => {
      void ctx.close().catch(() => {});
    }, 3200);
  } catch {
    // Optional audio.
  }
}
