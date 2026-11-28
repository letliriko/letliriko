// Browse page: landscape entry cards with album artwork and a readable full-entry view.
const browseRoot = document.getElementById("browseEntries");
const browseModal = document.getElementById("browseModal");
const browseTitle = document.getElementById("browseModalTitle");
const browseSongLabel = browseModal.querySelector(".browse-song");
const browseDate = browseModal.querySelector(".browse-date");
const browseStory = browseModal.querySelector(".browse-story");
const browseAuthor = browseModal.querySelector(".browse-author");
const browseDetailCover = document.getElementById("browseDetailCover");
let browseSongs = [];
let browseEntries = [];
let browseStarted = false;
const coverCache = new Map();

function browseDateText(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("fil-PH", { year: "numeric", month: "long", day: "numeric" }).format(date);
}
function safeBrowseUrl(value) {
  const url = String(value || "").trim();
  return /^(https?:\/\/|data:image\/)/i.test(url) ? url.replace(/["'()\\\s]/g, "") : "";
}
function catalogSong(entry) {
  const id = String(entry.song_id ?? entry.songId ?? "");
  return (typeof SONGS !== "undefined" ? SONGS.find(song => String(song.id) === id) : null);
}
function cloudSong(entry) {
  const id = String(entry.song_id ?? entry.songId ?? "");
  return browseSongs.find(song => String(song.id) === id) || null;
}
function getSongInfo(entry) {
  const catalog = catalogSong(entry);
  const cloud = cloudSong(entry);
  const title = cloud?.title || catalog?.title || entry.song_title || "Song for this story";
  const artist = cloud?.artist || catalog?.artist || entry.song_artist || "";
  return { title, artist, catalog, cloud };
}
function getEntryPhoto(entry) {
  return safeBrowseUrl(entry.bg_url || entry.background_url || entry.bg || entry.photo_url);
}
async function getSongCover(entry) {
  const info = getSongInfo(entry);
  const key = String(entry.song_id ?? entry.songId ?? "") || `${info.title}-${info.artist}`;
  if (coverCache.has(key)) return coverCache.get(key);
  let cover = safeBrowseUrl(info.catalog?.cover || info.catalog?.preview || info.cloud?.cover_url || info.cloud?.album_cover || info.cloud?.artwork_url);
  if (!cover && (info.cloud?.spotify_url || info.catalog?.spotify)) {
    try {
      const response = await fetch("https://open.spotify.com/oembed?url=" + encodeURIComponent(info.cloud?.spotify_url || info.catalog.spotify));
      if (response.ok) cover = safeBrowseUrl((await response.json()).thumbnail_url);
    } catch (_) {}
  }
  if (!cover) {
    try {
      const query = encodeURIComponent(`${info.title} ${info.artist}`);
      const response = await fetch(`https://itunes.apple.com/search?media=music&entity=song&limit=5&country=PH&term=${query}`);
      if (response.ok) {
        const list = (await response.json()).results || [];
        const artistToken = info.artist.toLowerCase().split(/\s+/)[0];
        const match = list.find(item => (item.artistName || "").toLowerCase().includes(artistToken)) || list[0];
        if (match?.artworkUrl100) cover = safeBrowseUrl(match.artworkUrl100.replace("100x100", "600x600"));
      }
    } catch (_) {}
  }
  coverCache.set(key, cover);
  return cover;
}
function setCoverBackground(element, url) {
  if (url) {
    element.style.backgroundImage = `linear-gradient(to bottom, rgba(29,18,43,.03) 20%, rgba(29,18,43,.2) 48%, rgba(29,18,43,.88) 100%), url("${url}")`;
    element.classList.add("has-cover");
  } else {
    element.style.backgroundImage = "linear-gradient(135deg, #7b5ea7, #c9a7eb 58%, #f1d9c7)";
    element.classList.remove("has-cover");
  }
}
function createBrowseCard(entry) {
  const info = getSongInfo(entry);
  const card = document.createElement("button");
  card.type = "button";
  card.className = "browse-card";
  card.setAttribute("aria-label", `Read ${entry.title || info.title}, shared by ${entry.author_name || entry.from || "Anonymous"}`);

  const artwork = document.createElement("span");
  artwork.className = "browse-card-art";
  artwork.setAttribute("aria-hidden", "true");
  const cover = getEntryPhoto(entry) || safeBrowseUrl(info.catalog?.cover || info.cloud?.cover_url || info.cloud?.album_cover || info.cloud?.artwork_url);
  setCoverBackground(artwork, cover);

  const content = document.createElement("span");
  content.className = "browse-card-content";
  const title = document.createElement("strong");
  title.className = "browse-card-title";
  title.textContent = entry.title || info.title || "Untitled story";
  const song = document.createElement("span");
  song.className = "browse-card-song";
  song.textContent = `♫ ${info.title}${info.artist ? ` — ${info.artist}` : ""}`;
  const metadata = document.createElement("span");
  metadata.className = "browse-card-meta";
  metadata.textContent = `${browseDateText(entry.created_at)} · ${entry.author_name || entry.from || "Anonymous"}`;
  const excerpt = document.createElement("span");
  excerpt.className = "browse-card-excerpt";
  const meaning = String(entry.meaning || "").trim();
  excerpt.textContent = meaning.length > 145 ? `${meaning.slice(0, 145).trim()}…` : meaning;
  content.append(title, song, metadata, excerpt);
  card.append(artwork, content);
  card.addEventListener("click", () => showBrowseEntry(entry));
  return card;
}
async function showBrowseEntry(entry) {
  const info = getSongInfo(entry);
  browseTitle.textContent = entry.title || info.title || "Untitled story";
  browseSongLabel.textContent = `♫ ${info.title}${info.artist ? ` — ${info.artist}` : ""}`;
  browseDate.textContent = browseDateText(entry.created_at);
  browseDate.dateTime = entry.created_at || "";
  browseStory.textContent = entry.meaning || "";
  browseAuthor.textContent = `Shared by ${entry.author_name || entry.from || "Anonymous"}`;
  const cover = getEntryPhoto(entry) || await getSongCover(entry);
  setCoverBackground(browseDetailCover, cover);
  browseModal.hidden = false;
  document.body.classList.add("browse-modal-open");
  document.getElementById("browseClose").focus();
}
function closeBrowseModal() {
  browseModal.hidden = true;
  document.body.classList.remove("browse-modal-open");
}
document.getElementById("browseClose").addEventListener("click", closeBrowseModal);
browseModal.addEventListener("click", event => { if (event.target === browseModal) closeBrowseModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && !browseModal.hidden) closeBrowseModal(); });
async function loadBrowseEntries() {
  if (browseStarted || !window.LetLirikoCloud?.getCloudEntries) return;
  browseStarted = true;
  browseRoot.textContent = "Loading stories...";
  try {
    const [entries, songs] = await Promise.all([
      window.LetLirikoCloud.getCloudEntries(),
      window.LetLirikoCloud.getCloudSongs().catch(() => [])
    ]);
    browseEntries = entries || [];
    browseSongs = songs || [];
    if (!browseEntries.length) {
      browseRoot.textContent = "Wala pang stories dito. Be the first to share one!";
      return;
    }
    browseRoot.replaceChildren();
    browseEntries.forEach(entry => browseRoot.append(createBrowseCard(entry)));
    // Fill default album covers after cards have rendered; user-uploaded entry photos stay in front.
    browseEntries.forEach(async entry => {
      if (getEntryPhoto(entry)) return;
      const card = [...browseRoot.children].find(item => item.getAttribute("aria-label") === `Read ${entry.title || getSongInfo(entry).title}, shared by ${entry.author_name || entry.from || "Anonymous"}`);
      if (!card) return;
      const artwork = card.querySelector(".browse-card-art");
      const cover = await getSongCover(entry);
      if (cover) setCoverBackground(artwork, cover);
    });
  } catch (error) {
    console.error("Could not load Browse stories:", error);
    browseRoot.textContent = "Couldn't load stories right now. Please refresh the page.";
    browseStarted = false;
  }
}
window.addEventListener("letliriko-cloud-ready", loadBrowseEntries);
window.addEventListener("load", loadBrowseEntries);
