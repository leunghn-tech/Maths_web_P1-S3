# Firebase-first 遷移與安全評估

## 目前狀態

Firebase 專案 **MathsQuest-Primary**（`mathsquest-primary`）獨立於任何中文科專案。學生新帳戶與學習資料使用 Firebase；新學生使用 [Firebase Hosting](https://mathsquest-primary.web.app)，不需要 Manus 帳戶或 Manus Hosting。

| 區域 | 現行做法 | 保護措施 |
| --- | --- | --- |
| 學生認證 | Firebase Email/Password | 密碼由 Firebase Authentication 處理，前端與 Firestore 不保存密碼 |
| 學生資料 | `studentLearning/{uid}` | 只允許已登入學生讀取、建立及更新自己的 UID 文件；禁止刪除 |
| 教師認證 | Firebase Google | 只有精確電郵 `justsayhi0915@gmail.com` 映射為教師 |
| 教師資料存取 | Firestore 唯讀 | 指定教師可 list/get 學生快照，但沒有 create/update/delete 權限 |
| 前端設定 | Firebase Web config | 設定本來公開；資料存取以 Auth 和 Rules 強制，而非以 API key 保密 |

## 教師資料權限

教師可見的資料限於學生自己同步的暱稱、電郵摘要、完成課題、錯題摘要、每日目標和最後同步時間。教師頁面不顯示密碼、密碼重設資料或其他帳戶安全資訊。這項跨學生唯讀權限由 Firestore 規則強制，屬必要的個人資料存取擴展，已在實作前取得擁有人同意。

## 免費優先與獨立運作範圍

目前沒有啟用 Blaze、Cloud Functions、App Hosting、Analytics、Gemini、電話登入、匿名登入或任何付款設定。Firebase Spark 可在其配額範圍內免付費運作，但沒有雲端平台可以保證永久無限免費。到達配額時應先檢視 Firebase Console 的用量，而非在未知情況下啟用計費。

## 尚餘過渡事項

舊帳戶（用戶名稱／密碼）在原有 MySQL 系統，不能由 Firebase Hosting 直接核對。因此，新學生與教師流程可脫離 Manus，而舊帳戶搬遷仍需一次性的安全處置：保留舊入口一段期限，或以可審核的一次性匯出遷移學習資料。無論採用哪個方案，舊密碼不可遷移。

沙盒重設後，已以公開 HTTP 回應直接核對 `https://mathsquest-primary.web.app/sign-in` 的正式前端資產，確認仍包含學生電郵登入、唯一 Google 教師登入及 `studentLearning` 同步程式。重設同時清除了本沙盒的 Firebase CLI 登入狀態；因此，恢復後的原始碼已完成測試、檢查點及 GitHub 同步，但待重新取得 Firebase CLI 授權後才可再次部署並以真實教師身份測試。

## 維護優先次序

在公開前應定期檢視 Firebase Authentication 使用者數、Firestore 讀寫與 Hosting 流量。日後可評估 Firebase App Check 與 Firebase API key 的應用限制；兩者不應在未確認對現有登入及課堂裝置相容性的情況下直接啟用。
