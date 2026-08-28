/**
 * Firebase Web 設定屬於瀏覽器公開設定；資料保護由 Firebase Authentication
 * 與 Firestore Security Rules 強制執行。切勿在此加入 Admin SDK 或服務帳戶資料。
 */
export const firebaseWebConfig = {
  apiKey: "AIzaSyDVJ8cRwP4HiYjeTNyIhin6zMARqYH-hJA",
  authDomain: "mathsquest-primary.firebaseapp.com",
  projectId: "mathsquest-primary",
  storageBucket: "mathsquest-primary.firebasestorage.app",
  messagingSenderId: "609534588931",
  appId: "1:609534588931:web:8a82c4189211d16241b636",
} as const;
