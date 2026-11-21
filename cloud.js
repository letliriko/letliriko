// cloud.js - online database ng LetLiriko gamit ang Firebase Firestore (libre, walang server na kailangan).
// Kapag wala pang config sa baba, localStorage lang muna ang gagamitin ng site (gaya ng dati).
//
// SETUP (mga 10 minutes):
// 1. console.firebase.google.com > Add project > (i-off ang Analytics okay lang)
// 2. Build > Firestore Database > Create database (production mode)
// 3. Project settings (gear icon) > Your apps > Web (</>) > Register app > kopyahin ang firebaseConfig sa baba
// 4. Firestore > Rules > i-paste ang rules na nasa dulo ng file na ito > Publish
// 5. Buksan ang site gamit ang Live Server (hindi double-click sa file), kasi type="module" ito.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "PASTE_HERE",
  authDomain: "PASTE_HERE",
  projectId: "PASTE_HERE",
  storageBucket: "PASTE_HERE",
  messagingSenderId: "PASTE_HERE",
  appId: "PASTE_HERE"
};

if (firebaseConfig.apiKey === "PASTE_HERE") {
  console.warn("cloud.js: wala pang Firebase config, localStorage muna ang gamit.");
} else {
  const db = getFirestore(initializeApp(firebaseConfig));
  let cloudEntries = [];

  // entries: ang fake samples ay laging nandiyan, tapos ang totoong posts mula sa Firestore
  DB.all = () => cloudEntries.concat(SAMPLE_ENTRIES);
  DB.add = entry => {
    entry.id = Date.now();            // number, para gumana ang openEntry(id)
    addDoc(collection(db, "entries"), entry).catch(err => {
      console.error(err);
      alert("Hindi na-save online. Subukan ulit.");
    });
    return entry;
  };

  // songs na dinagdag ng users
  DB.addSong = song => {
    SONGS.push(song);                 // lalabas agad sa list
    addDoc(collection(db, "songs"), song).catch(console.error);
  };

  // live updates: kapag may nag-post, lalabas agad sa lahat
  onSnapshot(collection(db, "entries"), snap => {
    cloudEntries = snap.docs.map(d => d.data()).sort((a, b) => b.id - a.id);
    renderPreview(); renderEntries();
  });
  onSnapshot(collection(db, "songs"), snap => {
    let added = false;
    snap.docs.forEach(d => {
      const s = d.data();
      if (!SONGS.some(x => x.id === s.id || x.spotifyId === s.spotifyId)) { SONGS.push(s); added = true; }
    });
    if (added) { renderSongs(); renderPreview(); renderEntries(); }
  });
}

/* FIRESTORE RULES (i-paste sa Firebase console > Firestore > Rules):

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /entries/{id} {
      allow read: if true;
      allow create: if request.resource.data.meaning is string
                    && request.resource.data.meaning.size() <= 400
                    && request.resource.data.from is string
                    && request.resource.data.from.size() <= 25;
      allow update, delete: if false;
    }
    match /songs/{id} {
      allow read: if true;
      allow create: if request.resource.data.spotifyId is string;
      allow update, delete: if false;
    }
  }
}
*/