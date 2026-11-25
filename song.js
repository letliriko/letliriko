
// song.js - LetLiriko with Supabase shared entries

let currentSong = SONGS[0].id;
let pendingPhoto = "";
let songQuery = "";
let currentUser = null;
const $ = id => document.getElementById(id);
const notify = (message, type = "info") => window.showToast ? window.showToast(message, type) : window.alert(message);
function formatEntryDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fil-PH", { year: "numeric", month: "long", day: "numeric" }).format(date);
}

// Combine shared online entries with the original local entries.
const cloudEntries = [];
const localAllEntries = DB.all.bind(DB);

DB.all = function () {
  return [...cloudEntries, ...localAllEntries()];
};

DB.forSong = function (songId) {
  return DB.all().filter(e => String(e.songId) === String(songId));
};

function fromCloudEntry(row) {
  return {
    id: row.id,
    songId: String(row.song_id),
    title: row.title || "",
    meaning: row.meaning || "",
    from: row.author_name || "Anonymous",
    bg: row.bg_url || "",
    created_at: row.created_at || null,
    user_id: row.user_id || null
  };
}

async function loadCloudEntries() {
  if (!window.LetLirikoCloud) return;

  try {
    currentUser = await window.LetLirikoCloud.getCurrentUser();
    const rows = await window.LetLirikoCloud.getCloudEntries();
    cloudEntries.splice(
      0,
      cloudEntries.length,
      ...(rows || []).map(fromCloudEntry)
    );

    renderPreview();
    renderEntries();
  } catch (error) {
    console.error("Could not load shared entries:", error);
  }
}

// Protect the page from user-entered HTML.
function esc(t) {
  const d = document.createElement("div");
  d.textContent = t;
  return d.innerHTML;
}

function shorten(t, n) {
  return t.length > n ? t.slice(0, n).trim() + "..." : t;
}

function safeBg(url) {
  if (!url || !/^(data:image\/|https?:\/\/|images\/)/.test(url)) return "";
  return url.replace(/["'()\s]/g, "");
}

function bgStyle(e, song) {
  const photo = safeBg(e.bg);

  return photo
    ? `background-image:url('${photo}')`
    : (safeBg(song.cover)
      ? `background-image:url('${safeBg(song.cover)}')`
      : `background:${song.color}`);
}

// ---------- 1. PREVIEW ----------
function renderPreview() {
  $("slides").innerHTML = DB.all().filter(e => findSong(e.songId)).map(e => {
    const song = findSong(e.songId);
    const date = formatEntryDate(e.created_at);
    return `<article class="slide" tabindex="0" role="button" aria-label="Read entry by ${esc(e.from)}"
      style="${bgStyle(e, song)}" onclick='openEntry(${JSON.stringify(e.id)})'
      onkeydown='if(event.key==="Enter"||event.key===" " ){event.preventDefault();openEntry(${JSON.stringify(e.id)})}'>
      ${safeBg(e.bg) || safeBg(song.cover) ? "" : `<span class="slide-emoji">${song.emoji}</span>`}
      <div class="slide-text"><small>${esc(e.from)}${date ? ` · ${esc(date)}` : ""}</small>
      <h3>${esc(e.title || song.title)}</h3><p>${esc(shorten(e.meaning, 70))}</p></div>
    </article>`;
  }).join("");
}

function slide(dir) {
  const box = $("slides");
  const w = box.firstElementChild
    ? box.firstElementChild.offsetWidth + 16
    : 300;

  if (dir > 0 && box.scrollLeft + box.clientWidth >= box.scrollWidth - 5) {
    box.scrollTo({ left: 0, behavior: "smooth" });
  } else {
    box.scrollBy({ left: dir * w, behavior: "smooth" });
  }
}

// ---------- ENTRY POPUP ----------
function openEntry(id) {
  const e = DB.all().find(x => String(x.id) === String(id));
  if (!e) return;
  const song = findSong(e.songId);
  if (!song) return;
  const photo = safeBg(e.bg);
  const date = formatEntryDate(e.created_at);
  const canDelete = Boolean(currentUser && e.user_id && currentUser.id === e.user_id);
  $("modalCard").innerHTML = `<button class="modal-x" onclick="closeModal()" aria-label="Close">✕</button>
    <div class="modal-top" style="${bgStyle(e, song)}">${photo || safeBg(song.cover) ? "" : song.emoji}</div>
    <div class="modal-body"><span class="tape"></span><small>${esc(song.title)} - ${esc(song.artist)}</small>
      <h3>${esc(e.title || song.title)}</h3><p class="entry-message">${esc(e.meaning)}</p>
      <small>— ${esc(e.from)}</small>${date ? `<small class="entry-date">Posted ${esc(date)}</small>` : ""}
      <div class="modal-actions"><a class="btn" href="${song.spotify}" target="_blank" rel="noopener">▶ Listen on Spotify</a>
      <button class="btn" onclick="goToSong('${esc(song.id)}')">View song</button>
      ${canDelete ? `<button class="btn btn-danger" onclick='deleteEntry(${JSON.stringify(e.id)})'>Delete my entry</button>` : ""}</div></div>`;
  $("modal").hidden = false;
}

async function deleteEntry(id) {
  if (!currentUser || !window.LetLirikoCloud) {
    notify("Mag-log in muna para ma-delete ang sarili mong entry.", "error");
    return;
  }
  if (!window.confirm("Sure ka bang i-delete itong entry? Hindi na ito maibabalik.")) return;
  try {
    await window.LetLirikoCloud.deleteCloudEntry(id);
    const index = cloudEntries.findIndex(entry => String(entry.id) === String(id));
    if (index >= 0) cloudEntries.splice(index, 1);
    closeModal(); renderPreview(); renderEntries();
    notify("Deleted na ang entry mo.", "success");
  } catch (error) {
    console.error("Entry deletion failed:", error);
    notify(error.message || "Hindi na-delete ang entry. Try again.", "error");
  }
}
window.deleteEntry = deleteEntry;

function closeModal() {
  $("modal").hidden = true;
}

function goToSong(id) {
  closeModal();
  pickSong(id);
  $("songList").scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

// ---------- 2. MUSIC ----------
function renderSongs() {
  const q = songQuery.toLowerCase();

  const shown = SONGS.filter(s =>
    (s.title + " " + s.artist).toLowerCase().includes(q)
  );

  $("spSearch").href =
    "https://open.spotify.com/search/" + encodeURIComponent(songQuery);

  $("spSearch").hidden = !q;

  $("songList").innerHTML = !shown.length
    ? "<p>Walang nakita. Subukan ang 'Hanapin sa Spotify' sa baba, tapos idagdag dito 👇</p>"
    : shown.map(s => `
      <div class="song ${s.id === currentSong ? "active" : ""}"
        onclick="pickSong('${s.id}')">
        <div class="album"
          style="${safeBg(s.cover)
            ? `background:url('${safeBg(s.cover)}') center/cover`
            : `background:${s.color}`}">
          ${safeBg(s.cover) ? "" : s.emoji}
        </div>
        <div class="info">
          <b>${esc(s.title)}</b>
          <span>${esc(s.artist)}</span>
        </div>
        <span class="time">${s.time}</span>
        <button class="play"
          onclick="event.stopPropagation();pickSong('${s.id}');$('player').scrollIntoView({behavior:'smooth',block:'center'})"
          title="I-play dito"
          aria-label="I-play ang ${s.title}">▶</button>
      </div>`).join("");
}

function renderEntries() {
  const list = DB.forSong(currentSong);
  $("entryList").innerHTML = list.length ? list.map(e => {
    const date = formatEntryDate(e.created_at);
    return `<article class="note" tabindex="0" role="button" onclick='openEntry(${JSON.stringify(e.id)})'
      onkeydown='if(event.key==="Enter")openEntry(${JSON.stringify(e.id)})'>
      <b>${esc(e.title || "Untitled story")}</b><p>${esc(shorten(e.meaning, 90))}</p>
      <small>— ${esc(e.from)}${date ? ` · ${esc(date)}` : ""}</small></article>`;
  }).join("") : "<p>No stories yet for this song. Be the first to share one! 💜</p>";
}

function renderCredits() {
  const s = findSong(currentSong);

  $("credits").innerHTML = `Kanta: <b>${s.title}</b> by ${s.artist} ${s.album ? `(${s.album})` : ""}.
    Pakinggan sa <a href="${s.spotify}" target="_blank">Spotify</a>.`;

  $("player").innerHTML = s.spotifyId
    ? `<iframe title="Spotify player"
        src="https://open.spotify.com/embed/track/${s.spotifyId}?theme=0"
        width="100%" height="152" frameborder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen"
        loading="lazy"></iframe>
      <small>Hindi mag-play? <a href="${s.spotify}" target="_blank">Buksan sa Spotify</a></small>`
    : `${/^https:\/\//.test(s.preview || "")
      ? `<audio controls preload="none" src="${s.preview}" style="width:100%"></audio><small>30-second preview lang ito.</small>`
      : ""}
      <small><a href="${s.spotify}" target="_blank">Pakinggan ang buong kanta sa Spotify</a></small>`;

  $("formSong").textContent = `${s.title} - ${s.artist}`;
}

function pickSong(id) {
  currentSong = id;
  renderSongs();
  renderEntries();
  renderCredits();
}

// ---------- 3. FORM + PHOTO ----------
function readPhoto(file) {
  const reader = new FileReader();

  reader.onload = () => {
    const img = new Image();

    img.onload = () => {
      const scale = Math.min(1, 600 / img.width);
      const c = document.createElement("canvas");

      c.width = img.width * scale;
      c.height = img.height * scale;

      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      pendingPhoto = c.toDataURL("image/jpeg", 0.6);

      showPhoto();
    };

    img.src = reader.result;
  };

  reader.readAsDataURL(file);
}

function showPhoto() {
  $("photoPreview").innerHTML = pendingPhoto
    ? `<img src="${pendingPhoto}" alt="Photo preview">
       <button type="button" onclick="clearPhoto()">Tanggalin ang photo</button>`
    : "";
}

function clearPhoto() {
  pendingPhoto = "";
  $("photo").value = "";
  showPhoto();
}

// SAVE ENTRIES TO SUPABASE
async function saveEntry(ev) {
  ev.preventDefault();

  const meaning = $("meaning").value.trim();
  const from = $("from").value.trim();

  if (!meaning || !from) {
    notify(!meaning ? "Uy! Don't forget to write your story muna. 💜" : "Lagyan mo muna ng name or nickname!", "error");
    return;
  }

  const entry = {
    songId: currentSong,
    title: $("title").value.trim(),
    meaning,
    from,
    bg: pendingPhoto
  };

  const submitButton = ev.target.querySelector('button[type="submit"]');

  if (submitButton) submitButton.disabled = true;

  $("msg").textContent = "Saving your story...";

  try {
    if (
      !window.LetLirikoCloud ||
      typeof window.LetLirikoCloud.addCloudEntry !== "function"
    ) {
      throw new Error(
        "Hindi pa handa ang Supabase connection. I-refresh ang page at subukan ulit."
      );
    }

    const savedRow = await window.LetLirikoCloud.addCloudEntry(entry);

    cloudEntries.unshift(fromCloudEntry(savedRow));

    ev.target.reset();
    clearPhoto();

    $("msg").textContent = "";
    notify("Yay! Na-share na ang story mo! 💜", "success");

    renderPreview();
    renderEntries();

  } catch (error) {
    console.error("Entry save failed:", error);

    $("msg").textContent = "";
    notify("Oops! May something went wrong. Try again later.", "error");

  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}

// ---------- 4. ADD SONG ----------

async function addSong(ev) {
  ev.preventDefault();

  const m = $("songLink").value.match(/track\/([A-Za-z0-9]{22})/);

  if (!m) {
    $("songMsg").textContent =
      "Hindi ito Spotify song link. Dapat may 'open.spotify.com/track/...'";
    return;
  }

  const id = "c" + m[1];

  if (findSong(id) || SONGS.some(x => x.spotifyId === m[1])) {
    $("songMsg").textContent = "Nasa list na 'yan!";
    return;
  }

  let title = $("songTitle").value.trim();
  let cover = "";

  try {
    const r = await fetch(
      "https://open.spotify.com/oembed?url=" +
      encodeURIComponent("https://open.spotify.com/track/" + m[1])
    );

    const j = await r.json();

    title = title || j.title;
    cover = j.thumbnail_url || "";
  } catch (err) {}

  if (!title) {
    $("songMsg").textContent = "Ilagay ang title ng kanta.";
    return;
  }

  const song = {
    id,
    title,
    artist: $("songArtist").value.trim() || "OPM",
    album: "",
    time: "",
    color: "#7b5ea7",
    emoji: "🎵",
    spotifyId: m[1],
    spotify: "https://open.spotify.com/track/" + m[1],
    cover,
    custom: true
  };

  const submitButton = ev.target.querySelector('button[type="submit"]');

  if (submitButton) submitButton.disabled = true;

  $("songMsg").textContent = "Sine-save ang kanta online...";

  try {
    if (
      !window.LetLirikoCloud ||
      typeof window.LetLirikoCloud.addCloudSong !== "function"
    ) {
      throw new Error("Hindi pa handa ang Supabase connection. I-refresh ang page.");
    }

    await window.LetLirikoCloud.addCloudSong(song);

    SONGS.push(song);

    ev.target.reset();
    songQuery = "";
    $("songSearch").value = "";

    $("songMsg").textContent = "Nadagdag na online! Makikita na rin ito ng ibang visitors. 🎶";

    pickSong(id);

  } catch (error) {
    console.error("Song save failed:", error);

    $("songMsg").textContent =
      "Hindi na-save online: " + (error.message || "May error sa Supabase.");

  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}


$("songSearch").addEventListener("input", e => {
  songQuery = e.target.value.trim();
  renderSongs();
});

$("songForm").addEventListener("submit", addSong);

pickSong(currentSong);
renderPreview();

loadCovers(() => {
  renderPreview();
  renderSongs();
  renderEntries();
});

$("entryForm").addEventListener("submit", saveEntry);

$("photo").addEventListener("change", e => {
  if (e.target.files[0]) readPhoto(e.target.files[0]);
});

setInterval(() => {
  if ($("modal").hidden) slide(1);
}, 5000);

// Load shared entries after the page and cloud script initialize.
window.addEventListener("load", loadCloudEntries);
window.addEventListener("letliriko-auth-change", event => {
  currentUser = event.detail.user;
  renderPreview();
  renderEntries();
});
