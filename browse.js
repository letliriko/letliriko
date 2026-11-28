// Browse page: the same landscape scrapbook preview, arranged in a responsive grid.
(() => {
  const browseRoot = document.getElementById("browseEntries");
  const browseModal = document.getElementById("browseModal");
  const browseTitle = document.getElementById("browseModalTitle");
  const browseSongLabel = browseModal?.querySelector(".browse-song");
  const browseDate = browseModal?.querySelector(".browse-date");
  const browseStory = browseModal?.querySelector(".browse-story");
  const browseAuthor = browseModal?.querySelector(".browse-author");
  const browseDetailCover = document.getElementById("browseDetailCover");
  if (!browseRoot || !browseModal) return;

  let browseSongs = [];
  let browseStarted = false;
  const coverCache = new Map();

  function dateText(value) {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat("fil-PH", { year: "numeric", month: "long", day: "numeric" }).format(date);
  }
  function safeUrl(value) {
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
  function songInfo(entry) {
    const catalog = catalogSong(entry);
    const cloud = cloudSong(entry);
    return {
      title: cloud?.title || catalog?.title || entry.song_title || "Song for this story",
      artist: cloud?.artist || catalog?.artist || entry.song_artist || "",
      catalog, cloud
    };
  }
  function entryPhoto(entry) {
    return safeUrl(entry.bg_url || entry.background_url || entry.bg || entry.photo_url);
  }
  function setBackground(el, url) {
    if (url) {
      el.style.backgroundImage = `linear-gradient(to bottom, rgba(29,18,43,.02) 20%, rgba(29,18,43,.12) 48%, rgba(29,18,43,.9) 100%), url("${url}")`;
      el.classList.add("has-cover");
    } else {
      el.style.backgroundImage = "linear-gradient(135deg, #7b5ea7, #c9a7eb 58%, #f1d9c7)";
      el.classList.remove("has-cover");
    }
  }
  async function songCover(entry) {
    const info = songInfo(entry);
    const key = String(entry.song_id ?? entry.songId ?? "") || `${info.title}-${info.artist}`;
    if (coverCache.has(key)) return coverCache.get(key);
    let cover = safeUrl(info.catalog?.cover || info.catalog?.preview || info.cloud?.cover_url || info.cloud?.album_cover || info.cloud?.artwork_url);
    if (!cover && (info.cloud?.spotify_url || info.catalog?.spotify)) {
      try {
        const response = await fetch("https://open.spotify.com/oembed?url=" + encodeURIComponent(info.cloud?.spotify_url || info.catalog.spotify));
        if (response.ok) cover = safeUrl((await response.json()).thumbnail_url);
      } catch (_) {}
    }
    if (!cover) {
      try {
        const term = encodeURIComponent(`${info.title} ${info.artist}`);
        const response = await fetch(`https://itunes.apple.com/search?media=music&entity=song&limit=5&country=PH&term=${term}`);
        if (response.ok) {
          const results = (await response.json()).results || [];
          const artistFirst = info.artist.toLowerCase().split(/\s+/)[0];
          const match = results.find(item => artistFirst && (item.artistName || "").toLowerCase().includes(artistFirst)) || results[0];
          if (match?.artworkUrl100) cover = safeUrl(match.artworkUrl100.replace("100x100", "600x600"));
        }
      } catch (_) {}
    }
    coverCache.set(key, cover);
    return cover;
  }
  function createCard(entry) {
    const info = songInfo(entry);
    const card = document.createElement("button");
    card.type = "button";
    card.className = "browse-card";
    card.setAttribute("aria-label", `Read entry: ${entry.title || info.title}`);

    const art = document.createElement("span");
    art.className = "browse-card-art";
    art.setAttribute("aria-hidden", "true");
    setBackground(art, entryPhoto(entry) || safeUrl(info.catalog?.cover || info.cloud?.cover_url || info.cloud?.album_cover || info.cloud?.artwork_url));

    const content = document.createElement("span");
    content.className = "browse-card-content";
    const title = document.createElement("strong");
    title.className = "browse-card-title";
    title.textContent = entry.title || "Untitled story";
    const song = document.createElement("span");
    song.className = "browse-card-song";
    song.textContent = `♫ ${info.title}${info.artist ? ` — ${info.artist}` : ""}`;
    const meta = document.createElement("span");
    meta.className = "browse-card-meta";
    meta.textContent = dateText(entry.created_at || entry.createdAt || entry.date);
    const excerpt = document.createElement("span");
    excerpt.className = "browse-card-excerpt";
    const story = String(entry.meaning || entry.story || entry.message || "").trim();
    excerpt.textContent = story.length > 135 ? `${story.slice(0, 135).trim()}…` : story;
    content.append(title, song, meta, excerpt);
    card.append(art, content);
    card.addEventListener("click", () => openEntry(entry));
    return card;
  }
  async function openEntry(entry) {
    const info = songInfo(entry);
    browseTitle.textContent = entry.title || "Untitled story";
    browseSongLabel.textContent = `♫ ${info.title}${info.artist ? ` — ${info.artist}` : ""}`;
    const dateValue = entry.created_at || entry.createdAt || entry.date || "";
    browseDate.textContent = dateText(dateValue);
    browseDate.dateTime = dateValue;
    browseStory.textContent = entry.meaning || entry.story || entry.message || "";
    browseAuthor.textContent = `Shared by ${entry.author_name || entry.from || "Anonymous"}`;
    browseModal.hidden = false;
    document.body.classList.add("browse-modal-open");
    setBackground(browseDetailCover, entryPhoto(entry) || await songCover(entry));
    document.getElementById("browseClose")?.focus();
  }
  function closeModal() {
    browseModal.hidden = true;
    document.body.classList.remove("browse-modal-open");
  }
  document.getElementById("browseClose")?.addEventListener("click", closeModal);
  browseModal.addEventListener("click", event => { if (event.target === browseModal) closeModal(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !browseModal.hidden) closeModal(); });

  async function loadEntries() {
    const cloud = window.LetLirikoCloud;
    if (browseStarted || !cloud?.getCloudEntries) return;
    browseStarted = true;
    browseRoot.replaceChildren(Object.assign(document.createElement("p"), { textContent: "Loading stories..." }));
    try {
      const [entries, songs] = await Promise.all([
        cloud.getCloudEntries(),
        cloud.getCloudSongs ? cloud.getCloudSongs().catch(error => { console.warn("Could not load song list:", error); return []; }) : Promise.resolve([])
      ]);
      browseSongs = songs || [];
      const list = Array.isArray(entries) ? entries : [];
      if (!list.length) {
        browseRoot.textContent = "Wala pang stories dito. Be the first to share one!";
        return;
      }
      browseRoot.replaceChildren(...list.map(createCard));
      // Load artwork for cards that don't already have a user photo or catalog cover.
      list.forEach(async (entry, index) => {
        if (entryPhoto(entry)) return;
        const art = browseRoot.children[index]?.querySelector(".browse-card-art");
        if (!art) return;
        const cover = await songCover(entry);
        if (cover && art.isConnected) setBackground(art, cover);
      });
    } catch (error) {
      console.error("Could not load Browse entries:", error);
      browseRoot.replaceChildren(Object.assign(document.createElement("p"), { textContent: "Hindi ma-load ang entries. Check your internet connection and Supabase entries table, then refresh." }));
      browseStarted = false;
    }
  }
  window.addEventListener("letliriko-cloud-ready", loadEntries);
  window.addEventListener("load", loadEntries);
  // Handles pages where the cloud module completed before this script attached its listener.
  if (window.LetLirikoCloud?.getCloudEntries) loadEntries();
})();
