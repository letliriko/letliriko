// ==========================================
// LETLIRIKO - SUPABASE CLOUD SERVICES
// ==========================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Keep the existing project credentials. The publishable key is safe for browser use.
const SUPABASE_URL = "https://cbgvihrgbuwfqocuvdod.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_wMe9p0nEk8_Y78hYMD8O2w_ZIEY0bcl";
const STORAGE_BUCKET = "entry-backgrounds";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
window.supabaseClient = supabase;

// Use a reserved, non-deliverable email domain so the public UI can use username/password.
// Email confirmation must be disabled in Supabase Auth for this username-only demo flow.
function usernameToEmail(username) {
  const clean = String(username || "").trim().toLowerCase();
  if (!/^[a-z0-9_]{3,24}$/.test(clean)) {
    throw new Error("Username must be 3–24 characters (letters, numbers, or underscore).");
  }
  return `${clean}@accounts.letliriko.invalid`;
}

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error && error.name !== "AuthSessionMissingError") throw error;
  return data?.user || null;
}

async function signUp(username, password) {
  if (String(password).length < 8) throw new Error("Use at least 8 characters for your password.");
  const { data, error } = await supabase.auth.signUp({
    email: usernameToEmail(username),
    password,
    options: { data: { username: String(username).trim() } }
  });
  if (error) throw error;
  if (!data.session) {
    throw new Error("Account created, but Supabase is still asking for email confirmation. Turn off email confirmation in Supabase Auth settings for this username-only setup.");
  }
  return data.user;
}

async function signIn(username, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password
  });
  if (error) throw error;
  return data.user;
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

async function getCloudEntries() {
  const { data, error } = await supabase.from("entries").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

async function getMyCloudEntries() {
  const user = await getCurrentUser();
  if (!user) return [];
  const { data, error } = await supabase.from("entries").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

async function addCloudEntry(entry) {
  let backgroundUrl = entry.bg || null;
  if (backgroundUrl && backgroundUrl.startsWith("data:")) {
    const response = await fetch(backgroundUrl);
    const blob = await response.blob();
    const extension = (blob.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
    const fileName = `${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, blob, {
      contentType: blob.type, upsert: false
    });
    if (uploadError) throw uploadError;
    const { data: publicData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
    backgroundUrl = publicData.publicUrl;
  }
  const { data: sessionData } = await supabase.auth.getSession();
  const ownerId = sessionData?.session?.user?.id || null;
  const { data, error } = await supabase.from("entries").insert({
    song_id: String(entry.songId), title: entry.title || "", meaning: entry.meaning || "",
    author_name: entry.from || "Anonymous", bg_url: backgroundUrl, user_id: ownerId
  }).select("*").single();
  if (error) throw error;
  return data;
}

async function deleteCloudEntry(entryId) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Mag-log in muna para ma-delete ang sarili mong entry.");
  const { data, error } = await supabase.from("entries").delete().eq("id", entryId).eq("user_id", user.id).select("id").maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Hindi ma-delete ang entry. Make sure na sa'yo ito.");
  return data;
}

async function sendContactMessage(message) {
  const { error } = await supabase.from("contact_messages").insert({
    name: message.name.trim(), email: message.email.trim() || null,
    subject: message.subject.trim(), message: message.message.trim()
  });
  if (error) throw error;
  return true;
}

async function getCloudSongs() {
  const { data, error } = await supabase.from("songs").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

async function addCloudSong(song) {
  const { data, error } = await supabase.from("songs").insert({
    id: String(song.id), title: song.title, artist: song.artist || ""
  }).select().single();
  if (error) throw error;
  return data;
}

function listenForEntryUpdates(callback) {
  return supabase.channel("public-entries").on("postgres_changes", {
    event: "*", schema: "public", table: "entries"
  }, callback).subscribe();
}

async function testSupabaseConnection() {
  const { error } = await supabase.from("entries").select("id").limit(1);
  if (error) { console.error("Supabase connection failed:", error); return false; }
  console.log("LetLiriko is connected to Supabase!");
  return true;
}

window.LetLirikoCloud = {
  getCurrentUser, signUp, signIn, signOut, getCloudEntries, getMyCloudEntries,
  addCloudEntry, deleteCloudEntry, sendContactMessage, getCloudSongs,
  addCloudSong, listenForEntryUpdates, testSupabaseConnection
};
window.dispatchEvent(new CustomEvent("letliriko-cloud-ready"));

supabase.auth.onAuthStateChange((_event, session) => {
  window.LetLirikoUser = session?.user || null;
  window.dispatchEvent(new CustomEvent("letliriko-auth-change", { detail: { user: session?.user || null } }));
});
console.log("LetLiriko cloud services loaded.");
