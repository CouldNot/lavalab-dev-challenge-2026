const sampleRate = 8_000;
const durationSeconds = 12;

function writeAscii(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index));
}

function makeDemoWave() {
  const samples = sampleRate * durationSeconds;
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + samples * 2, true);
  writeAscii(view, 8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, samples * 2, true);

  for (let index = 0; index < samples; index += 1) {
    const time = index / sampleRate;
    const syllable = Math.max(0, Math.sin(time * Math.PI * 2.1));
    const envelope = Math.min(1, time * 5) * Math.min(1, (durationSeconds - time) * 5);
    const voice = Math.sin(2 * Math.PI * (155 + 16 * Math.sin(time * 1.7)) * time);
    const overtone = Math.sin(2 * Math.PI * 310 * time) * 0.22;
    const value = Math.max(-1, Math.min(1, (voice + overtone) * syllable * envelope * 0.23));
    view.setInt16(44 + index * 2, value * 32767, true);
  }
  return buffer;
}

export function GET() {
  return new Response(makeDemoWave(), {
    headers: {
      "Content-Type": "audio/wav",
      "Content-Length": String(44 + sampleRate * durationSeconds * 2),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
