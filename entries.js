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

// Sample users (codename) at entries nila
const SAMPLE_ENTRIES = [
  { id: 1, songId: "tadhana", title: "Para sa kaibigang lumayo", from: "Kuya Mochi", bg: "",
    meaning: "Tuwing naririnig ko 'to, naaalala ko yung gabi na nag-usap tayo hanggang madaling araw. Miss na kita." },
  { id: 2, songId: "tadhana", title: "", from: "Bituin23", bg: "",
    meaning: "Kanta namin 'to ng lola ko. Kahit wala na siya, nandito pa rin siya sa bawat linya." },
  { id: 3, songId: "kathang-isip", title: "Sa crush kong hindi alam", from: "Lihim ni Mara", bg: "",
    meaning: "Sana isang araw, hindi na lang kathang isip ang lahat ng 'to. Salamat sa ngiti mo kahapon." },
  { id: 4, songId: "pare-ko", title: "Barkada forever", from: "Tropang Kape", bg: "",
    meaning: "Para sa tropa namin noong high school. Kahit magkakalayo na tayo, tropa pa rin." }
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