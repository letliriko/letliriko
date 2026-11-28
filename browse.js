const browseRoot = document.getElementById("browseEntries");
let browseSongs = [];
let browseStarted = false;
const browseModal = document.getElementById("browseModal");
const browseTitle = document.getElementById("browseModalTitle");
const browseSong = browseModal.querySelector(".browse-song");
const browseStory = browseModal.querySelector(".browse-story");
const browseAuthor = browseModal.querySelector(".browse-author");
const closeBrowseModal = () => { browseModal.hidden = true; };
document.getElementById("browseClose").addEventListener("click", closeBrowseModal);
browseModal.addEventListener("click", event => { if (event.target === browseModal) closeBrowseModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeBrowseModal(); });

function getSongLabel(entry) {
  const song = browseSongs.find(item => String(item.id) === String(entry.song_id || entry.songId));
  return song ? `${song.title}${song.artist ? " — " + song.artist : ""}` : "A song for this story";
}
function showBrowseEntry(entry) {
  browseTitle.textContent = entry.title || "Untitled story";
  browseSong.textContent = `🎵 ${getSongLabel(entry)}`;
  browseStory.textContent = entry.meaning || "";
  browseAuthor.textContent = `Shared by ${entry.author_name || entry.from || "Anonymous"}`;
  browseModal.hidden = false;
}
async function loadBrowseEntries() {
  try {
    browseSongs = await window.LetLirikoCloud.getCloudSongs().catch(() => []);
    const entries = await window.LetLirikoCloud.getCloudEntries();
    if (!entries.length) { browseRoot.textContent = "Wala pang stories dito. Be the first to share one!"; return; }
    browseRoot.replaceChildren();
    entries.forEach(entry => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "browse-card";
      const title = document.createElement("h2");
      title.textContent = entry.title || "Untitled story";
      const imageUrl = entry.bg_url || entry.background_url || entry.bg;
      if (imageUrl && /^https?:\/\//i.test(imageUrl)) {
        const cover = document.createElement("img");
        cover.src = imageUrl;
        cover.alt = "Entry background";
        cover.loading = "lazy";
        cover.className = "browse-cover";
        card.append(cover);
      }
      const song = document.createElement("p");
      song.className = "browse-song-label";
      song.textContent = `🎵 ${getSongLabel(entry)}`;
      const excerpt = document.createElement("p");
      excerpt.className = "browse-excerpt";
      const meaning = entry.meaning || "";
      excerpt.textContent = meaning.length > 180 ? `${meaning.slice(0, 180).trim()}…` : meaning;
      const author = document.createElement("small");
      author.textContent = `By ${entry.author_name || entry.from || "Anonymous"}`;
      card.append(title, song, excerpt, author);
      card.addEventListener("click", () => showBrowseEntry(entry));
      browseRoot.append(card);
    });
  } catch (error) {
    console.error("Could not load Browse stories:", error);
    browseRoot.textContent = "Couldn't load stories right now. Please refresh the page.";
  }
}
window.addEventListener("letliriko-cloud-ready", loadBrowseEntries);
window.addEventListener("load", () => { if (window.LetLirikoCloud) loadBrowseEntries(); });
