import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const email = process.env.DEMO_EMAIL ?? "demo@toph.local";
const password = process.env.DEMO_PASSWORD;
const farmId = "10000000-0000-0000-0000-000000000001";
if (!url || !secret || !password) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, and DEMO_PASSWORD first.");

const supabase = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: listed, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
if (listError) throw listError;
let user = listed.users.find((candidate) => candidate.email === email);
if (!user) {
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { display_name: "Bays Ranch Admin" } });
  if (error) throw error;
  user = data.user;
} else {
  const { error } = await supabase.auth.admin.updateUserById(user.id, { password, email_confirm: true });
  if (error) throw error;
}

const { error: profileError } = await supabase.from("profiles").upsert({ user_id: user.id, display_name: "Bays Ranch Admin" });
if (profileError) throw profileError;
const { error: membershipError } = await supabase.from("farm_memberships").upsert({ farm_id: farmId, user_id: user.id, role: "owner" });
if (membershipError) throw membershipError;

function makeDemoWave() {
  const sampleRate = 8_000;
  const durationSeconds = 12;
  const samples = sampleRate * durationSeconds;
  const buffer = Buffer.alloc(44 + samples * 2);
  buffer.write("RIFF", 0); buffer.writeUInt32LE(36 + samples * 2, 4); buffer.write("WAVEfmt ", 8);
  buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24); buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34); buffer.write("data", 36);
  buffer.writeUInt32LE(samples * 2, 40);
  for (let index = 0; index < samples; index += 1) {
    const time = index / sampleRate;
    const syllable = Math.max(0, Math.sin(time * Math.PI * 2.1));
    const envelope = Math.min(1, time * 5) * Math.min(1, (durationSeconds - time) * 5);
    const voice = Math.sin(2 * Math.PI * (155 + 16 * Math.sin(time * 1.7)) * time);
    const overtone = Math.sin(2 * Math.PI * 310 * time) * 0.22;
    const value = Math.max(-1, Math.min(1, (voice + overtone) * syllable * envelope * 0.23));
    buffer.writeInt16LE(value * 32767, 44 + index * 2);
  }
  return buffer;
}

const storagePath = `${farmId}/demo-recording.wav`;
const { error: uploadError } = await supabase.storage.from("recordings").upload(storagePath, makeDemoWave(), {
  contentType: "audio/wav",
  cacheControl: "31536000",
  upsert: true,
});
if (uploadError) throw uploadError;
const { error: recordingError } = await supabase.from("recordings").update({ storage_path: storagePath }).is("storage_path", null);
if (recordingError) throw recordingError;
console.log(`Demo user ready: ${email}`);
