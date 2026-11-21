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
// ---------- SLUG / EMOJI / KULAY ----------
const slug = t => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const EMOJIS = ["🎵","🌙","⭐","🌸","🎧","💌","🦋","🍓","🎸","💜"];
const COLORS = ["#7b5ea7","#c9a27c","#5b4a8a","#d98ca8","#6b8fb5","#8aa68a"];
// ---------- MGA KANTANG MAY SPOTIFY LINK ----------
// [id, title, artist, album, spotifyId, cover]. Ang cover ay ang album photo ni Spotify: ito ang default background ng entry na walang photo.
const IMG = "https://i.scdn.co/image/ab67616d0000b273";
const LINKED = [
  ["huwag-na-huwag-mong-sasabihin","Huwag Na Huwag Mong Sasabihin","Kitchie Nadal","Kitchie Nadal","4mOjjXKDOR1sel6APULUaN","4699830bfdf6e043cda2d294"],
  ["burnout","Burnout","Sugarfree","Sa Wakas","6Srj2NoAIGgBFORh6r5Whs","089ce120f5b4f793f4fd5ce7"],
  ["libu-libong-buwan","Libu-Libong Buwan (Uuwian)","Kyle Raphael","Libu-Libong Buwan (Uuwian)","3cZUIZ8i74C1Kvnix4xZez","71784b412d5d984fb1cfd880"],
  ["totoong-tayo","Totoong tayo","Jin DC","Totoong tayo","1yMNVkAb74RJSpGrdJj1sU","b3487463d9f1c75305f69c87"],
  ["pangarap-lang-kita","Pangarap Lang Kita","Parokya Ni Edgar, Happee Sy","Middle-Aged Juvenile Novelty Pop Rockers","09WPbmLdcBhJPcJwEJc1Yv","75c10919e3dd9dd00ac1f485"],
  ["saan","Saan?","Maki","Saan?","3o6ylNXak761Dlp5VMe6xw","09987e9b12e08d721653821d"],
  ["tensionado","Tensionado","Soapdish","Soapdish Reloaded","1tVOhTFOtqVMmsDAJoMeja","17cce1483d25c32617ef7399"],
  ["bulong","Bulong","December Avenue","Langit Mong Bughaw","5rV7xueHNNXaZqOLroaUta","d24f561dcce1e3ad344d1597"],
  ["mahal-magmahal","Mahal Magmahal","Esremborak","Mahal Magmahal","2bUvJywMOR7c56E9xdioMm","b4add5793b12cb8a3e86a8f4"],
  ["umaasa","Umaasa","Calein","Umaasa","4AULw1VRyJP17zMvwgTIUs","2d6a3c20c37868408e4ae97f"],
  ["buko","Buko","Jireh Lim","Love And Soul","5uH5Gl7brNoFCpR9Ds9k94","e00864ab4f95a41bb50cf786"],
  ["14","14","Silent Sanctuary","Fuchsiang Pag-Ibig","7KD8oUUpidul2ROxTIhPAw","737bdadd1f88e23968f9783a"],
  ["ere","ERE","juan karlos","ERE","0SuQMjb2TleiKg1ebQSDnX","efb0e42ba1da26bc1fc7b8e7"],
  ["rebound","Rebound","Silent Sanctuary","Fuchsiang Pag-Ibig","6LPOiFTyYprfKQqDZDfZPy","737bdadd1f88e23968f9783a"],
  ["tenchu","Tenchu","Esremborak","Tenchu","16E9xFP8csyjHwFhKmpGMj","006573230bec9490c7225b90"],
  ["blue-sky","Blue Sky","Hale","Hale","5ipVmC4aP3jGpHRa53U1s4","a19b960b94edfffba8705234"],
  ["multo","Multo","Cup of Joe","Multo","4cBm8rv2B5BJWU2pDaHVbF","394048503e3be0e65e962638"],
  ["sino","Sino","Unique Salonga","Grandma","2xCkiGqGMkAIg6fQTag51C","8366d95c69868480c944f63c"],
  ["palayo-sa-mundo","Palayo Sa Mundo","Jolianne, Arthur Nery","Palayo Sa Mundo","4FVZYiCvdLIX8NpcY0lzda","36558a5c77443a73d1e1254b"],
  ["heaven-knows","Heaven Knows - This Angel Has Flown","Orange & Lemons","Strike Whilst the Iron Is Hot","0Qra8Ps4tJAZPqRXyehCjc","e2c44a11d7822e5a6520a686"],
  ["nahuhulog","Nahuhulog","Jed Baruelo","Nahuhulog","1t2gvCG4jH1kYE9sX2PrRs","960b2b0e22a266c56e02f656"],
  ["kailan","Kailan?","Maki","Tanong","3AmeIjZbXzy8qCeoFpWzzS","02e24d0776d17aab39effafe"],
  ["kung-wala-ka","Kung Wala Ka","Hale","Hale","78TqcAgOAUZZoMvRdcQmr6","a19b960b94edfffba8705234"],
  ["beer","Beer","The Itchyworms","Noon Time Show","20gchtRYM7bFiOjYKQB8zZ","ed411655872bb482cc4e1b9c"],
  ["akap","Akap","Imago","Akap","2BPFPvaPh3N675z8qYahIy","4ca21b0b275f4861ab0af89e"],
  ["sa-bawal-sandali","Sa Bawat Sandali","Amiel Sol","Sa Bawat Sandali","06IkOr83qPqa3yYvrIjgxp","6857065ea2fbb0c53710fca1"],
  ["sandali","Sandali","mrld","Sandali","6gbhAe0l2WPXEGFYOBdPOO","ec9d30ea1ea6aad417a0cb6e"],
  ["ako-ang-bagyo","Ako ang Bagyo","SHEAN","Ako ang Bagyo","1EqRuhrJZU5R7aeWyw1z8D","8accea63a5492488f764e8fb"],
  ["dilaw","Dilaw","Maki","Dilaw","2ADSh3Mp744n2586tpUtIW","5d806ce0b1d16932a70aaf16"],
  ["bawat-daan","Bawat Daan","Ebe Dancel","Bawat Daan","1hJtJvPX9knMysNDQw0HDJ","f600a0a2669e7c2044986752"],
  ["romcom","RomCom","Rob Deniel","RomCom","67DEADzgSxkFWI3jVlQUL3","6cfce0ec23c38559e27d0999"],
  ["tingin","Tingin","Cup of Joe, Janine","Tingin","7b89Ffklm3xh4GI37vlZDZ","6bcbaedb68b989329c9bf5a9"],
  ["patutunguhan","Patutunguhan","Cup of Joe","Patutunguhan","1EP2WyCX9Q7y24bKPSZ0tc","67393a2330b3d23453b19dfe"],
  ["cool-off","Cool Off","Session Road","Suntok Sa Buwan","0wqkV6gLdeoHGjJLe4eHIX","de4e6b4f46af575ee29b8e35"],
  ["same-ground","Same Ground","Kitchie Nadal","Kitchie Nadal","5iNGxZ1waiyMFylg4QAHk6","4699830bfdf6e043cda2d294"],
  ["migraine","Migraine","Moonstar88","Todo Combo","7sW3f7PqDV7BQ7qqeVBJIA","4d7fe3074db6968e32b81b4a"],
  ["sana","Sana","Up Dharma Down","Bipolar","5eoI8PRMZvmjzTkQ6QoRH5","1b4d829c139b1901f186dceb"],
  ["indak","Indak","Up Dharma Down","Capacities","68mEGNswpkIWu7TK6QJabn","c37604dd465e90d386feb4bf"],
  ["oo","Oo","Up Dharma Down","Fragmented","062z5ZMd0a0snMBZ75tOco","745a71eda576c9796e6d4d45"],
  ["ewan","Ewan","APO Hiking Society","Ten Years Together","734NcRJGGPAz2bDibBY4rD","0027424fa2fc5a269f4aa0d0"],
  ["the-day-you-said-goodnight","The Day You Said Goodnight","Hale","Hale","08hFNg8Oz3lvaAms7qrIif","89d3628e226a3c7e0d0afbc3"],
  ["ikaw-lamang","Ikaw Lamang","Silent Sanctuary","Fuchsiang Pag-Ibig","0bhzB5PBUVqZSux5Y7t5ED","737bdadd1f88e23968f9783a"],
  ["sundo","Sundo","Imago","Blush","25mXcC6MeDYaJPjVj5GCWu","927d181a33cabcd8449c2b24"],
  ["your-song","Your Song","Parokya Ni Edgar","Bigotilyo","0D1ecMMsSIpJbjPoJMHGkV","cf7889e587d90d75afebef93"],
  ["synesthesia","Synesthesia","Mayonnaise","Pula","3AJtsyopAdzfPEl6KzIG4T","efff2dc505e76779ceb695d0"],
  ["sleep-tonight","Sleep Tonight","December Avenue","December Avenue","0KzB2OAG7oYEPOsNcXf6T6","f3100d7f97da4ad8932db0d7"]
];
LINKED.forEach(([id, title, artist, album, spotifyId, c], i) => SONGS.push({ id, title, artist, album, time: "",
  color: COLORS[i % COLORS.length], emoji: EMOJIS[i % EMOJIS.length], spotifyId, cover: IMG + c }));
// Ang Kathang Isip (taas) ay nasa listahan na. Ang Tadhana at Pare Ko ay kukunan ng album photo ni Spotify kusa (loadCovers).
SONGS.forEach(s => s.spotify = s.spotifyId ? "https://open.spotify.com/track/" + s.spotifyId
  : "https://open.spotify.com/search/" + encodeURIComponent(s.title + " " + s.artist));

// ---------- ALBUM COVERS ----------
// Kusang kinukuha ang album photo sa Spotify (oEmbed, walang API key) at sine-save sa browser.
// Kapag may s.cover na ang kanta, ito ang magiging default background ng entry na walang photo.
const COVER_KEY = "letliriko_covers2";
let coverCache = {};
try { coverCache = JSON.parse(localStorage.getItem(COVER_KEY) || "{}"); } catch (e) {}
SONGS.forEach(s => { const c = coverCache[s.id]; if (c) { s.cover = s.cover || c.cover; s.preview = c.preview; } });

// Spotify oEmbed para sa may spotifyId; iTunes Search (libre, walang API key) para sa iba. Isa-isa para hindi ma-rate limit,
// at naka-save sa browser kaya mabilis na sa susunod na bukas.
async function loadCovers(done) {
  for (const s of SONGS) {
    if (coverCache[s.id] || (s.cover && s.spotifyId)) continue;
    try {
      if (s.spotifyId) {
        const j = await (await fetch("https://open.spotify.com/oembed?url=" + encodeURIComponent(s.spotify))).json();
        if (j.thumbnail_url) s.cover = j.thumbnail_url;
      } else {
        const r = await fetch("https://itunes.apple.com/search?media=music&entity=song&limit=5&country=PH&term=" +
          encodeURIComponent(s.title + " " + s.artist));
        if (!r.ok) break;               // na-limit; itutuloy sa susunod na load
        const list = (await r.json()).results || [];
        const first = s.artist.toLowerCase().split(" ")[0];
        const hit = list.find(x => (x.artistName || "").toLowerCase().includes(first)) || list[0];
        if (hit) { s.cover = hit.artworkUrl100.replace("100x100", "400x400"); s.preview = hit.previewUrl || ""; }
        await new Promise(res => setTimeout(res, 1000));
      }
      coverCache[s.id] = { cover: s.cover || "", preview: s.preview || "" };
      try { localStorage.setItem(COVER_KEY, JSON.stringify(coverCache)); } catch (e) {}
      if (done) done();
    } catch (e) {}
  }
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

// 30 scripted entries (isa bawat bagong kanta). Bawat ikatlo ay walang photo, kaya album photo ng kanta ang lalabas.
const ENTRY_KEYS = Object.keys(ART);
[
  ["Akap","Mitch.R","Hindi ko pa rin kayang bitawan","Ilang taon na pero tuwing tutugtog 'to, parang bumabalik lahat. Hindi ko pa rin alam kung paano bumitaw."],
  ["Libu-Libong Buwan","Kuya Migs","Long distance, libu-libong milya","Nasa abroad ang girlfriend ko. Bawat buwan na lumilipas, mas lalo ko siyang namimiss. Uuwi ka rin, hihintayin kita."],
  ["Sa Bawal Sandali","Tala_","Sikreto lang natin","Para sa taong hindi ko pwedeng mahalin nang hayag. Kahit sandali lang, sapat na sa akin."],
  ["Sandali","Hannah B.","Pahinga muna","Sandali lang, huminga muna. Ito ang pinapakinggan ko tuwing finals week para hindi ako bumigay."],
  ["Ako ang Bagyo","Bagyong Ana","Para sa mga napagod nang magpasensya","Ako 'yung laging nag-iintindi. Minsan kailangan ko ring ipakita na kaya kong magalit, at okay lang 'yon."],
  ["Dilaw","Sunflower Jo","Kulay ng summer namin","Dilaw ang suot niya noong una kaming nagkita. Simula noon, tuwing may dilaw, siya agad ang naiisip ko."],
  ["Saan","Lost&Found","Saan ba tayo papunta?","Graduating na kami pero wala pa akong plano. Ito ang kantang kasama ko tuwing nag-o-overthink ako sa gabi."],
  ["Bawat Daan","Daniel_P","Kasama ka sa bawat daan","Pinapatugtog namin 'to ni Papa sa radyo habang nagda-drive pauwi sa probinsya. Bawat daan, may alaala."],
  ["Romcom","Kiki Kilig","Main character moment","Pinatugtog ko 'to noong nag-confess siya sa akin sa harap ng canteen. Parang pelikula, hindi pa rin ako makapaniwala."],
  ["Tingin","Mata ni Lea","Sa tingin mo pa lang","Hindi na kailangan ng salita. Isang tingin mo lang sa akin, alam ko na agad ang gusto mong sabihin."],
  ["Multo","Gabing Malamig","Hindi ka pa rin umaalis","Wala ka na pero nandito ka pa rin sa isip ko. Tuwing hating-gabi, ikaw pa rin ang naaalala ko."],
  ["Patutunguhan","Wanderer Rey","Hindi ko pa alam kung saan","Bagong lipat ako sa Maynila at mag-isa. Hindi ko pa alam ang patutunguhan ko, pero susubukan ko."],
  ["Cool Off","Tropa ni Jai","Cool off muna tayo","Nag-away kami ng best friend ko kaya nag-cool off kami. Buti na lang nagkabati kami ulit bago mag-semester break."],
  ["Same Ground","Ate Rina","Iisang lupa","Kanta namin ng kapatid ko noong teenager kami. Kahit madalas kaming mag-away, iisang lupa pa rin ang pinanggalingan namin."],
  ["Huwag Na Huwag Mong Sasabihin","Shy Girl 101","Secret lang 'to","Kinakanta ko 'to sa videoke tuwing may nagtatanong kung may crush ako. Huwag na huwag n'yong sasabihin sa kanya!"],
  ["Migraine","Pat Insomnia","Puyat na naman","Tatlong gabi na akong halos hindi natutulog dahil sa thesis. Soundtrack 'to ng sakit ng ulo at kape ko."],
  ["Sana","Hopeful_Ian","Sana ngayon na","Sana mapansin mo rin ako. Kung hindi man ngayon, basta darating din ang araw na 'yon."],
  ["Indak","Tita Lyn","Sayaw tayo!","Pinapatugtog namin 'to sa barangay zumba tuwing umaga. Kahit pagod, sumasayaw pa rin kami."],
  ["Oo","Tadhana Girl","Oo, mahal kita","Ito ang kantang pinatugtog niya noong tinanong ko kung kami na ba. Hindi pa tapos ang kanta, alam ko na ang sagot."],
  ["Ewan","Mr. Hindi Alam","Ewan ko ba","Hindi ko rin alam kung bakit ikaw pa rin. Ewan, basta ikaw."],
  ["The Day You Said Goodnight","Kuya Ben","Huling goodnight","Hindi ko makakalimutan ang gabing 'yon. Ang goodnight mo ang huli kong narinig bago kami nawalan ng contact."],
  ["Ikaw Lamang","Ate Joan","Para sa asawa ko","Dalawampung taon na kaming magkasama at ikaw pa rin ang pinipili ko araw-araw. Ikaw lamang."],
  ["14","Teen Heart","Grade 8 crush","Naalala ko pa noong Grade 8, ikaw ang crush ko. Ngayon college na tayo, pero pagtugtog nito, nandoon pa rin ako."],
  ["Sundo","Ate Cess","Sunduin mo ako","Dati si Mama ang sumusundo sa akin sa school. Ngayon ako na ang sumusundo sa kanya. Salamat, Ma."],
  ["Your Song","Papa Rick","Para sa anak kong dalaga","Kinanta ko 'to sa debut ng anak ko. Sana maalala niyang lagi akong nandito para sa kanya."],
  ["Synesthesia","Pastel Mind","Kulay ng tunog","Nakikita ko ang kulay ng bawat nota. Para sa akin, lila at asul ang kantang 'to."],
  ["Sleep Tonight","Gabi-gabi Lang","Tulog ka na","Pinapatugtog ko 'to para sa bunso kong kapatid tuwing hindi siya makatulog. Tulog ka na, nandito lang ako."],
  ["Rebound","Kuya Dan","Hindi ako rebound","Sana hindi mo lang ako ginamit para makalimot sa dati mo. Ito ang pinapakinggan ko noon habang nagpapagaling."],
  ["Blue Sky","Ulap_09","Bagong simula","Noong natapos ko ang board exam, ito ang unang kantang pinakinggan ko. Blue sky na ulit, sa wakas."],
  ["Kung Wala Ka","Ate Beng","Para kay Lola","Para sa lola kong nag-alaga sa amin. Kung wala ka, hindi ko alam kung nasaan ako ngayon."]
].forEach(([t, from, title, meaning], i) => SAMPLE_ENTRIES.push({
  id: 13 + i, songId: slug(t), title, from, meaning, bg: i % 3 === 1 ? "" : ART[ENTRY_KEYS[i % ENTRY_KEYS.length]]
}));

// Dagdag na realistic na entries para sa mga kantang may Spotify link
[
  ["burnout","Pagod na Nurse","Duty ng 12 hours","Pagkatapos ng double shift, uupo muna ako sa jeep at ito ang ipapatugtog ko. Wala na akong lakas mag-chat o mag-scroll, kantang kasing-pagod ko lang ang kailangan ko."],
  ["totoong-tayo","Mhie_ng_Sampaloc","","Dalawang taon na kami pero ngayon lang kami naging totoo sa isa't isa. Walang filter, walang pagpapanggap. Pinatugtog ko 'to noong sinabi niyang mahal niya pa rin ako kahit nakita na niya ang lahat ng pangit sa akin."],
  ["pangarap-lang-kita","Kuya Ian ng 4-B","Crush ko si seatmate","Pangarap lang talaga kita kasi may boyfriend ka na. Pero okay lang, masaya na ako na katabi kita sa Math class at pinapahiram mo pa ako ng ballpen."],
  ["tensionado","Kaba Queen","Defense day","Tuwing may defense kami, ito ang pinapakinggan ko sa hallway bago pumasok. Tensionado pa rin ako, pero pagkatapos ng limang minuto okay na ulit."],
  ["bulong","Lihim ng Gabi","Bulong ng puso","Hindi ko masabi sa kanya nang diretso, kaya binubulong ko na lang sa unan. Sana isang araw marinig niya nang hindi ko na kailangang bumulong."],
  ["mahal-magmahal","Lola's Boy","Para kay Lola Nena","Kinakanta 'to ni Lola habang nagluluto ng arroz caldo. Noon hindi ko alam ang lyrics, ngayon kabisado ko na. Sana naririnig mo pa rin ako, La."],
  ["umaasa","Pag-asa_Rose","Hindi pa tapos","Umaasa pa rin ako na babalik ka. Hindi ko alam kung tanga ba ako o mahal lang talaga kita. Siguro pareho."],
  ["buko","Jiro&Ellie","Kantang pang-monthsary","Third monthsary namin, kinantahan niya ako nito gamit ang gitara niyang sira ang isang string. Hindi perfect, pero 'yon pa rin ang pinakamagandang regalo ko."],
  ["ere","Dilag ng Probinsya","Sayaw sa kusina","Sinasabayan namin ni Mama habang naghuhugas ng pinggan. Simpleng gabi lang, pero 'yan ang gusto kong tandaan pag nasa Maynila na ako."],
  ["tenchu","Kuya Bogs","","Pang-warm up ko 'to tuwing leg day. Malakas ang bass kaya nagigising ako agad kahit walang kape."],
  ["sino","Ate Pia","Sino ba ako kung hindi estudyante?","Pagkatapos ng graduation, hindi ko alam kung sino ako kung wala na ang school. Ito ang kasama ko sa mga gabing nagtatanong ako sa sarili ko."],
  ["palayo-sa-mundo","Bea at Carlo","Takas muna tayo","Pag stressed na kami sa trabaho, nagro-road trip kami kahit hanggang kabilang bayan lang. Pinapatugtog namin 'to tapos tawa kami nang tawa kahit walang dahilan."],
  ["heaven-knows","Tito Marlon","Prom 2006","Ito ang slow dance namin sa prom. Magkaiba na ang landas namin ngayon, pero tuwing narinig ko 'to, 17 ulit ako."],
  ["nahuhulog","Hulog ng Langit","Sa library nagsimula","Sa library kami unang nag-usap, tungkol lang sa isang libro. Hindi ko namalayan, nahuhulog na pala ako."],
  ["kailan","Tanong ni Jay","Kailan mo ako sasagutin?","Isang taon na akong nanliligaw. Hindi ako nagmamadali, pero sana malaman ko na kung kailan. Ayos lang kahit hindi, basta sabihin mo."],
  ["beer","Tropang Tambay","Pagkatapos ng exams","Hindi naman kami umiinom, softdrinks at fishball lang. Pero kinakanta pa rin namin 'to nang malakas sa tapat ng tindahan hanggang pinagalitan kami."],
  ["multo","Late Night Thoughts","","Blocked ko na siya sa lahat, pero bakit nandito pa rin siya sa isip ko? Parang ako ang multo sa sarili kong bahay."],
  ["heaven-knows","Carla M.","Para sa dating kaibigan","Heaven knows, sinubukan ko naman. Pero minsan, kahit gaano mo pang pinaghirapan, hindi pa rin sapat. Okay lang. Natuto naman ako."],
  ["bulong","Anak ni Mang Tonyo","Radyo sa sasakyan","Pinapatugtog 'to ni Tatay tuwing hinahatid niya ako sa school. Ngayon nasa dorm na ako, kaya ako na lang ang nagpapatugtog para pakiramdam ko malapit pa rin siya."],
  ["saan","Maki Fan 101","Concert night","Sabay-sabay naming kinanta ang chorus sa concert, wala nang tono-tono. Pag-uwi ko, paos na ako pero ang saya."]
].forEach(([songId, from, title, meaning], i) => SAMPLE_ENTRIES.push({
  id: 100 + i, songId, title, from, meaning, bg: i % 3 === 1 ? "" : ART[ENTRY_KEYS[(i + 2) % ENTRY_KEYS.length]]
}));

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