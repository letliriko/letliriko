// entries.js - "database" ng Letliriko (nasa browser, walang login)
// Sample lang ang mga ito. Pwede kang magdagdag ng kanta sa SONGS.
const SONGS = [
  { id: "tadhana", title: "Tadhana", artist: "Up Dharma Down", album: "Capacities", time: "3:42",
    color: "#7b5ea7", emoji: "🌙", spotifyId: "6FIEuf1JIzmCtach0gXpeG" },
  { id: "kathang-isip", title: "Kathang Isip", artist: "Ben&Ben", album: "Kathang Isip (single)", time: "4:00",
    color: "#c9a27c", emoji: "✏️", spotifyId: "3WUEs51GpcvlgU7lehLgLh" },
  { id: "pare-ko", title: "Pare Ko", artist: "Eraserheads", album: "Ultraelectromagneticpop!", time: "5:24",
    color: "#5b4a8a", emoji: "🎸", spotifyId: "7uuirrtCr8O8fz7kQS6VUR" }
];
// para sa bagong kanta: Spotify > Share > Copy link, tapos kunin ang code sa pagitan ng /track/ at ?
SONGS.forEach(s => s.spotify = "https://open.spotify.com/track/" + s.spotifyId);

// ---------- ALBUM COVERS ----------
// Kusang kinukuha ang album photo sa Spotify (oEmbed, walang API key) at sine-save sa browser.
// Kapag may s.cover na ang kanta, ito ang magiging default background ng entry na walang photo.
const COVER_KEY = "letliriko_covers";
let coverCache = {};
try { coverCache = JSON.parse(localStorage.getItem(COVER_KEY) || "{}"); } catch (e) {}
SONGS.forEach(s => { if (!s.cover && coverCache[s.spotifyId]) s.cover = coverCache[s.spotifyId]; });

function loadCovers(done) {
  const missing = SONGS.filter(s => !s.cover && s.spotifyId);
  if (!missing.length) return;
  Promise.all(missing.map(s =>
    fetch("https://open.spotify.com/oembed?url=" + encodeURIComponent(s.spotify))
      .then(r => r.json())
      .then(j => { if (j.thumbnail_url) { s.cover = j.thumbnail_url; coverCache[s.spotifyId] = s.cover; } })
      .catch(() => {})
  )).then(() => {
    try { localStorage.setItem(COVER_KEY, JSON.stringify(coverCache)); } catch (e) {}
    if (done) done();
  });
}

// ---------- AESTHETIC BACKGROUNDS (para sa fake entries) ----------
// Gumagawa ng pastel na gradient image. Pwede mo ring palitan ng sarili mong photo:
// ilagay sa folder na "images/" tapos bg: "images/pangalan.jpg"
function bgArt(c1, c2, c3) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440"><defs>` +
    `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>` +
    `<rect width="640" height="440" fill="url(#g)"/>` +
    `<circle cx="510" cy="80" r="120" fill="${c3}" opacity=".45"/><circle cx="100" cy="370" r="150" fill="${c3}" opacity=".3"/>` +
    `<circle cx="330" cy="200" r="45" fill="${c3}" opacity=".35"/></svg>`;
  return "data:image/svg+xml;base64," + btoa(svg);
}
const ART = {
  sunset: bgArt("#f4b6c9", "#c9a7eb", "#fff3c4"),
  dusk:   bgArt("#3d2a63", "#7b5ea7", "#f4b6c9"),
  matcha: bgArt("#cfe8d5", "#f0e2cb", "#a8d5ba"),
  peach:  bgArt("#ffd6c0", "#f7d774", "#ffffff"),
  ocean:  bgArt("#b8d4f0", "#c9b8f0", "#ffffff"),
  rose:   bgArt("#f9c5d1", "#fbf8f3", "#c9a7eb")
};

// Sample users (codename) at entries nila. Ang bg: "" = album photo ng kanta ang gagamitin.
const SAMPLE_ENTRIES = [
  { id: 1, songId: "tadhana", title: "Para sa kaibigang lumayo", from: "Kuya Mochi", bg: ART.dusk,
    meaning: "Tuwing naririnig ko 'to, naaalala ko yung gabi na nag-usap tayo hanggang madaling araw. Miss na kita." },
  { id: 2, songId: "tadhana", title: "", from: "Bituin23", bg: "",
    meaning: "Kanta namin 'to ng lola ko. Kahit wala na siya, nandito pa rin siya sa bawat linya." },
  { id: 3, songId: "kathang-isip", title: "Sa crush kong hindi alam", from: "Lihim ni Mara", bg: ART.rose,
    meaning: "Sana isang araw, hindi na lang kathang isip ang lahat ng 'to. Salamat sa ngiti mo kahapon." },
  { id: 4, songId: "pare-ko", title: "Barkada forever", from: "Tropang Kape", bg: "",
    meaning: "Para sa tropa namin noong high school. Kahit magkakalayo na tayo, tropa pa rin." },
  { id: 5, songId: "tadhana", title: "Biyahe pauwi", from: "Jeepney Girl", bg: ART.ocean,
    meaning: "Pinapakinggan ko 'to tuwing biyahe pauwi galing school. Kahit pagod, gumagaan ang pakiramdam ko." },
  { id: 6, songId: "kathang-isip", title: "Para kay bunso", from: "Ate Dani", bg: ART.peach,
    meaning: "Pinapatulog ko si bunso gamit ang kantang 'to. Sana paglaki niya, maalala niyang kinakantahan ko siya." },
  { id: 7, songId: "pare-ko", title: "Last day of school", from: "Pandesal Boy", bg: ART.matcha,
    meaning: "Pinatugtog namin 'to sa classroom noong last day. Walang umiyak, daw. Pero nagsinungaling kaming lahat." },
  { id: 8, songId: "tadhana", title: "Hindi ko na sinabi", from: "Mang Ruel Jr.", bg: ART.sunset,
    meaning: "Hindi ko nasabi sa'yo noon. Pero kung maririnig mo 'to, sana alam mong ikaw 'yon." },
  { id: 9, songId: "kathang-isip", title: "", from: "Luntiang Gabi", bg: "",
    meaning: "Kapag hindi ako makatulog, ito ang pinapatugtog ko. Parang may yakap kahit mag-isa lang." },
  { id: 10, songId: "pare-ko", title: "Sa mga kabarkada kong IT", from: "Debug Squad", bg: ART.dusk,
    meaning: "Puyatan, bug, deadline, pero okay lang kasi tropa. Pare ko, kaya natin 'to!" },
  { id: 11, songId: "kathang-isip", title: "Anniversary namin", from: "Mimi & Jun", bg: ART.rose,
    meaning: "Ito ang unang kantang sinayaw namin. Hanggang ngayon, tuwing tutugtog 'to, nagkakatinginan pa rin kami." },
  { id: 12, songId: "tadhana", title: "Para sa sarili ko", from: "Anonymous Star", bg: ART.ocean,
    meaning: "Paalala sa sarili: okay lang magpahinga. Hindi mo kailangang maging malakas palagi." }
];

const KEY = "letliriko_entries";

const DB = {
  // kunin lahat ng entries (kung wala pa, ilagay muna ang samples)
  all() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (saved && saved.length) return saved;
    } catch (e) {}
    localStorage.setItem(KEY, JSON.stringify(SAMPLE_ENTRIES));
    return SAMPLE_ENTRIES.slice();
  },
  forSong(songId) { return DB.all().filter(e => e.songId === songId); },
  add(entry) {
    const list = DB.all();
    entry.id = Date.now();
    list.unshift(entry);
    localStorage.setItem(KEY, JSON.stringify(list));
    return entry;
  },
  reset() { localStorage.removeItem(KEY); }
};

function findSong(id) { return SONGS.find(s => s.id === id); }

// mga kantang dinagdag ng users (saved sa browser; kung may cloud.js, saved online)
const SONG_KEY = "letliriko_songs";
try { JSON.parse(localStorage.getItem(SONG_KEY) || "[]").forEach(s => SONGS.push(s)); } catch (err) {}
DB.addSong = function (s) {
  SONGS.push(s);
  localStorage.setItem(SONG_KEY, JSON.stringify(SONGS.filter(x => x.custom)));
};