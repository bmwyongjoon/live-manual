const firebaseConfig = {
  apiKey: "AIzaSyDxbqk2EeoVbJ5BaN7lXkPAPVzQ0GA0hKo",
  authDomain: "bps-live-manual.firebaseapp.com",
  projectId: "bps-live-manual",
  storageBucket: "bps-live-manual.firebasestorage.app",
  messagingSenderId: "374313042951",
  appId: "1:374313042951:web:70fac23d982999010596a2"
};

firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();
