// ==========================================
// LETLIRIKO - SUPABASE CLOUD DATABASE
// ==========================================

import { createClient } from
  "https://esm.sh/@supabase/supabase-js@2";

// 1. PASTE YOUR SUPABASE CREDENTIALS HERE
const SUPABASE_URL = "https://cbgvihrgbuwfqocuvdod.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_wMe9p0nEk8_Y78hYMD8O2w_ZIEY0bcl";

// 2. STORAGE BUCKET NAME
const STORAGE_BUCKET = "entry-backgrounds";

// 3. CONNECT TO SUPABASE
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// Make Supabase available for other scripts
window.supabaseClient = supabase;


// ==========================================
// CLOUD ENTRIES
// ==========================================

async function getCloudEntries() {
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading entries:", error);
    throw error;
  }

  return data || [];
}


// ==========================================
// ADD A NEW ENTRY
// ==========================================

async function addCloudEntry(entry) {
  let backgroundUrl = entry.bg || null;

  // Upload background photo if it is a data URL
  if (
    backgroundUrl &&
    backgroundUrl.startsWith("data:")
  ) {
    const response = await fetch(backgroundUrl);
    const blob = await response.blob();

    const extension =
      blob.type.split("/")[1] || "jpg";

    const fileName =
      `${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .upload(fileName, blob, {
        contentType: blob.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Photo upload failed:", uploadError);
      throw uploadError;
    }

    const { data: publicData } = supabase
      .storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    backgroundUrl = publicData.publicUrl;
  }

  const { data, error } = await supabase
    .from("entries")
    .insert({
      song_id: String(entry.songId),
      title: entry.title || "",
      meaning: entry.meaning || "",
      author_name: entry.from || "Anonymous",
      bg_url: backgroundUrl
    })
    .select()
    .single();

  if (error) {
    console.error("Entry submission failed:", error);
    throw error;
  }

  return data;
}


// ==========================================
// LOAD CUSTOM SONGS
// ==========================================

async function getCloudSongs() {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading songs:", error);
    throw error;
  }

  return data || [];
}


// ==========================================
// ADD A CUSTOM SONG
// ==========================================

async function addCloudSong(song) {
  const { data, error } = await supabase
    .from("songs")
    .insert({
      id: String(song.id),
      title: song.title,
      artist: song.artist || ""
    })
    .select()
    .single();

  if (error) {
    console.error("Song submission failed:", error);
    throw error;
  }

  return data;
}


// ==========================================
// REALTIME UPDATES
// ==========================================

function listenForEntryUpdates(callback) {
  return supabase
    .channel("public-entries")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "entries"
      },
      callback
    )
    .subscribe();
}


// ==========================================
// CHECK CONNECTION
// ==========================================

async function testSupabaseConnection() {
  const { error } = await supabase
    .from("entries")
    .select("id")
    .limit(1);

  if (error) {
    console.error("Supabase connection failed:", error);
    return false;
  }

  console.log("LetLiriko is connected to Supabase!");
  return true;
}


// ==========================================
// EXPORT FUNCTIONS
// ==========================================

window.LetLirikoCloud = {
  getCloudEntries,
  addCloudEntry,
  getCloudSongs,
  addCloudSong,
  listenForEntryUpdates,
  testSupabaseConnection
};

console.log("LetLiriko cloud.js loaded!");