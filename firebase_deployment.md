# Maths Quest Primary — Firebase 部署指引

本專案的 **新學生** 流程可由 Firebase 獨立提供：Firebase Hosting 提供靜態網站、Firebase Authentication 處理學生電郵／密碼與教師 Google 登入、Cloud Firestore 保存學生自己的學習快照。正式網址為 [https://mathsquest-primary.web.app](https://mathsquest-primary.web.app)。

## 已啟用範圍

| 項目 | 設定 |
| --- | --- |
| Firebase 專案 | `mathsquest-primary`（MathsQuest-Primary） |
| Hosting | SPA rewrite 至 `/index.html` |
| 學生登入 | Firebase Email/Password；密碼最少 6 個字元 |
| 教師登入 | Google；只有 `justsayhi0915@gmail.com` 有教師唯讀角色 |
| 學習資料 | `studentLearning/{uid}` 單一學生快照文件 |
| Firestore 地區 | Hong Kong `asia-east2` |
| 付費服務 | 未啟用 Blaze、Cloud Functions、App Hosting、Analytics、Gemini、Phone Auth 或 Anonymous Auth |

## 發布

在已登入 Firebase CLI、且選定 `mathsquest-primary` 的環境中執行：

```bash
pnpm test
pnpm run firebase:deploy
```

這個指令會先建置前端，再發布 `dist/public`、`firestore.rules` 和 `firestore.indexes.json`。Firebase Web config 是瀏覽器公開設定；安全邊界由 Firebase Authentication 和 Firestore Security Rules 提供。請勿加入 Firebase Admin SDK、服務帳戶 JSON、CLI token 或任何帳戶密碼到 GitHub。

## 運作與限制

Firebase Spark 是免綁帳單、免費優先的方案，但並非「永久且無限制免費」承諾。若使用量超出免費配額，Firebase 產品可能在該配額週期內受限，而非自動扣款。使用前應參考 [Firebase Spark 計劃](https://firebase.google.com/pricing) 與 [Cloud Firestore 用量與限制](https://firebase.google.com/docs/firestore/quotas)。

舊「用戶名稱＋密碼」帳戶的資料仍存於原有 MySQL 系統。純靜態 Firebase Hosting 無法安全地核對該系統的舊密碼，因此舊帳戶搬遷必須保留短暫過渡入口，或另行規劃一次性、受控的匯出；舊密碼絕不可讀取、複製或遷移至 Firebase。
