// firebase-config.js — Firebase initialization (Firestore + Auth)
(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyBSxrDJ-oVSQUjWswLkm_n9DpB8wIU8jCw",
    authDomain: "chepelovskyi-site.firebaseapp.com",
    projectId: "chepelovskyi-site",
    storageBucket: "chepelovskyi-site.firebasestorage.app",
    messagingSenderId: "842651562800",
    appId: "1:842651562800:web:5f986d50fc9eefd519cef5",
    measurementId: "G-CNZ0RBXKPL"
  };

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    window.db = firebase.firestore();
    window.storage = firebase.storage();
    if (typeof firebase.analytics === 'function') { firebase.analytics(); }
  } catch(e) {
    console.warn('Firebase init failed:', e.message);
    window.db = null;
    window.storage = null;
  }

  // ── Firestore helpers ──────────────────────────
  // Read with 4s timeout — returns null if Firestore unreachable
  window.fsGet = async function (collection, docId) {
    if (!window.db) return null;
    try {
      const result = await Promise.race([
        db.collection(collection).doc(docId).get(),
        new Promise(function(_, reject) { setTimeout(function() { reject(new Error('timeout')); }, 4000); })
      ]);
      return result.exists ? result.data() : null;
    } catch (e) {
      console.warn('Firestore read failed:', collection + '/' + docId, e.message);
      return null;
    }
  };

  // Write (merge) a document
  window.fsSet = async function (collection, docId, data) {
    if (!window.db) throw new Error('Firestore not initialized');
    await db.collection(collection).doc(docId).set(data, { merge: true });
  };
})();
