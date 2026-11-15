// song.js - gumagana ang services.html
let currentSong = SONGS[0].id;
let pendingPhoto = "";
let songQuery = "";   // photo na pinili ng user (bago i-post)
const $ = id => document.getElementById(id);

// proteksyon para hindi masira ng nilagay ng user ang page
function esc(t) {
  const d = document.createElement("div");
  d.textContent = t;
  return d.innerHTML;
}
function shorten(t, n) { return t.length > n ? t.slice(0, n).trim() + "..." : t; }
// photo lang na safe ang papayagan
function safeBg(url) {
  if (!url || !/^(data:image\/|https?:\/\/)/.test(url)) return "";
  return url.replace(/["'()\s]/g, "");
}
// background: photo ng user, o kung wala, album color ng kanta
function bgStyle(e, song) {
  const photo = safeBg(e.bg);
  return photo ? `background-image:url('${photo}')` : (safeBg(song.cover) ? `background-image:url('${safeBg(song.cover)}')` : `background:${song.color}`);
}

// ---------- 1. PREVIEW (slide cards, clickable) ----------
function renderPreview() {
  $("slides").innerHTML = DB.all().map(e => {
    const song = findSong(e.songId);
    return `<article class="slide" tabindex="0" role="button" aria-label="Basahin ang entry ni ${esc(e.from)}"
      style="${bgStyle(e, song)}" onclick="openEntry(${e.id})"
      onkeydown="if(event.key==='Enter')openEntry(${e.id})">
      ${safeBg(e.bg) || safeBg(song.cover) ? "" : `<span class="slide-emoji">${song.emoji}</span>`}
      <div class="slide-text">
        <small>${esc(e.from)}</small>
        <h3>${esc(e.title || song.title)}</h3>
        <p>${esc(shorten(e.meaning, 70))}</p>
      </div></article>`;
  }).join("");
}
function slide(dir) {
  const box = $("slides");
  const w = box.firstElementChild ? box.firstElementChild.offsetWidth + 16 : 300;
  if (dir > 0 && box.scrollLeft + box.clientWidth >= box.scrollWidth - 5) box.scrollTo({ left: 0, behavior: "smooth" });
  else box.scrollBy({ left: dir * w, behavior: "smooth" });
}

// ---------- popup ng buong entry ----------
function openEntry(id) {
  const e = DB.all().find(x => x.id === id);
  if (!e) return;
  const s = findSong(e.songId);
  const photo = safeBg(e.bg);
  $("modalCard").innerHTML = `
    <button class="modal-x" onclick="closeModal()" aria-label="Isara">✕</button>
    <div class="modal-top" style="${bgStyle(e, s)}">${photo || safeBg(s.cover) ? "" : s.emoji}</div>
    <div class="modal-body"><span class="tape"></span>
      <small>${esc(s.title)} - ${esc(s.artist)}</small>
      <h3>${esc(e.title || s.title)}</h3>
      <p>${esc(e.meaning)}</p>
      <small>— ${esc(e.from)}</small><br>
      <a class="btn" href="${s.spotify}" target="_blank">▶ Pakinggan</a>
      <button class="btn" onclick="goToSong('${s.id}')">Tingnan ang kanta</button>
    </div>`;
  $("modal").hidden = false;
}
function closeModal() { $("modal").hidden = true; }
function goToSong(id) {
  closeModal(); pickSong(id);
  $("songList").scrollIntoView({ behavior: "smooth", block: "start" });
}
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

// ---------- 2. MUSIC: tatlong section ----------
function renderSongs() {
  const q = songQuery.toLowerCase();
  const shown = SONGS.filter(s => (s.title + " " + s.artist).toLowerCase().includes(q));
  $("spSearch").href = "https://open.spotify.com/search/" + encodeURIComponent(songQuery);
  $("spSearch").hidden = !q;
  $("songList").innerHTML = !shown.length ? "<p>Walang nakita. Subukan ang 'Hanapin sa Spotify' sa baba, tapos idagdag dito 👇</p>" : shown.map(s => `
    <div class="song ${s.id === currentSong ? "active" : ""}" onclick="pickSong('${s.id}')">
      <div class="album" style="${safeBg(s.cover) ? `background:url('${safeBg(s.cover)}') center/cover` : `background:${s.color}`}">${safeBg(s.cover) ? "" : s.emoji}</div>
      <div class="info"><b>${s.title}</b><span>${s.artist}</span></div>
      <span class="time">${s.time}</span>
      <button class="play" onclick="event.stopPropagation();pickSong('${s.id}');$('player').scrollIntoView({behavior:'smooth',block:'center'})" title="I-play dito" aria-label="I-play ang ${s.title}">▶</button>
    </div>`).join("");
}
function renderEntries() {
  const list = DB.forSong(currentSong);
  $("entryList").innerHTML = list.length
    ? list.map(e => `<div class="note" style="cursor:pointer" onclick="openEntry(${e.id})"><b>${esc(e.title || "Walang title")}</b>
        <p>${esc(shorten(e.meaning, 90))}</p><small>— ${esc(e.from)}</small></div>`).join("")
    : "<p>Wala pang entry dito. Ikaw na ang una! 💜</p>";
}
function renderCredits() {
  const s = findSong(currentSong);
  $("credits").innerHTML = `Kanta: <b>${s.title}</b> by ${s.artist} ${s.album ? `(${s.album})` : ""}.
    Pakinggan sa <a href="${s.spotify}" target="_blank">Spotify</a>.`;
  $("player").innerHTML = `<iframe title="Spotify player" src="https://open.spotify.com/embed/track/${s.spotifyId}?theme=0"
    width="100%" height="152" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen" loading="lazy"></iframe>
    <small>Hindi mag-play? <a href="${s.spotify}" target="_blank">Buksan sa Spotify</a></small>`;
  $("formSong").textContent = `${s.title} - ${s.artist}`;
}
function pickSong(id) {
  currentSong = id;
  renderSongs(); renderEntries(); renderCredits();
}

// ---------- 3. FORM + PHOTO ----------
// pinaliliit ang photo para hindi mapuno ang storage
function readPhoto(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 700 / img.width);
      const c = document.createElement("canvas");
      c.width = img.width * scale; c.height = img.height * scale;
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      pendingPhoto = c.toDataURL("image/jpeg", 0.7);
      showPhoto();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}
function showPhoto() {
  $("photoPreview").innerHTML = pendingPhoto
    ? `<img src="${pendingPhoto}" alt="Photo preview"><button type="button" onclick="clearPhoto()">Tanggalin ang photo</button>` : "";
}
function clearPhoto() { pendingPhoto = ""; $("photo").value = ""; showPhoto(); }

function saveEntry(ev) {
  ev.preventDefault();
  const meaning = $("meaning").value.trim();
  const from = $("from").value.trim();
  if (!meaning || !from) { $("msg").textContent = "Lagay ka muna ng kwento at codename ha."; return; }
  try {
    DB.add({ songId: currentSong, title: $("title").value.trim(), meaning, from, bg: pendingPhoto });
  } catch (err) {
    $("msg").textContent = "Puno na ang storage. Subukan ang mas maliit na photo.";
    return;
  }
  ev.target.reset(); clearPhoto();
  $("msg").textContent = "Na-post na! Thank you sa pag-share 💜";
  renderPreview(); renderEntries();
}

// ---------- 4. SEARCH + MAGDAGDAG NG KANTA ----------
async function addSong(ev) {
  ev.preventDefault();
  const m = $("songLink").value.match(/track\/([A-Za-z0-9]{22})/);
  if (!m) { $("songMsg").textContent = "Hindi ito Spotify song link. Dapat may 'open.spotify.com/track/...'"; return; }
  const id = "c" + m[1];
  if (findSong(id) || SONGS.some(x => x.spotifyId === m[1])) { $("songMsg").textContent = "Nasa list na 'yan!"; return; }
  let title = $("songTitle").value.trim(), cover = "";
  try {   // kusang kinukuha ang title at album photo sa Spotify
    const r = await fetch("https://open.spotify.com/oembed?url=" + encodeURIComponent("https://open.spotify.com/track/" + m[1]));
    const j = await r.json(); title = title || j.title; cover = j.thumbnail_url || "";
  } catch (err) {}
  if (!title) { $("songMsg").textContent = "Ilagay ang title ng kanta."; return; }
  const song = { id, title, artist: $("songArtist").value.trim() || "OPM", album: "", time: "", color: "#7b5ea7", emoji: "🎵",
    spotifyId: m[1], spotify: "https://open.spotify.com/track/" + m[1], cover, custom: true };
  DB.addSong(song);
  ev.target.reset(); songQuery = ""; $("songSearch").value = "";
  $("songMsg").textContent = "Nadagdag na! 🎶";
  pickSong(id);
}
$("songSearch").addEventListener("input", e => { songQuery = e.target.value.trim(); renderSongs(); });
$("songForm").addEventListener("submit", addSong);

pickSong(currentSong);
renderPreview();
$("entryForm").addEventListener("submit", saveEntry);
$("photo").addEventListener("change", e => { if (e.target.files[0]) readPhoto(e.target.files[0]); });
setInterval(() => { if ($("modal").hidden) slide(1); }, 5000);