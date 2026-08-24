# Maths Quest 登入系統工程準備

## 目的與範圍

目前網站採用 **guest-first** 模式，所有完成星星、每日練習、錯題推薦與釘選課題均保存在同一部裝置的 `localStorage`。下一階段應升級為具備 Manus OAuth、受保護資料庫程序及帳戶專屬進度同步的全端專案；登入並不應阻礙未登入學生立即開始練習。

> 首次登入時，系統應先顯示「將這部裝置的學習紀錄同步至帳戶」確認流程；成功寫入雲端前，不自動清除本機資料。

## 現有資料與遷移範圍

| 現有功能 | 本機鍵值 | 雲端資料表 | 匯入規則 |
|---|---|---|---|
| 已完成課題與星星 | `maths-quest:completed-practices` | `student_practice_progress` | 以 `userId + practiceKey` 去重；保留最早完成時間。 |
| 每日練習與連續打卡 | `maths-quest:daily-practice` | `student_daily_records` | 以 `userId + practicedOn + practiceKey` 去重。 |
| 每日目標 | `maths-quest:daily-target` | `student_learning_profiles` | 採用本機有效值（1–6）作首次帳戶偏好。 |
| 錯題推薦 | `maths-quest:review-recommendations` | `student_review_records` | 同一課題累加 `misses`，取較新的 `updatedAt`。 |
| 釘選課題 | `maths-quest:pinned-practices` | `student_pinned_practices` | 保留本機排序，重複項合併。 |

已加入 `client/src/lib/localLearningSnapshot.ts`。該模組會安全解析上述資料，輸出版本化快照，並只在雲端匯入確認後寫入本機遷移標記；它不會自行刪除學生資料。

## 建議資料模型

| 資料表 | 核心欄位 | 用途 |
|---|---|---|
| `student_learning_profiles` | `userId`, `dailyTarget`, `migrationVersion`, `createdAt`, `updatedAt` | 儲存帳戶層級的學習偏好及遷移狀態。 |
| `student_practice_progress` | `userId`, `practiceKey`, `completedAt`, `bestScore`, `perfectRun` | 支援完成星星、課題卡與成就顯示。 |
| `student_daily_records` | `userId`, `practicedOn`, `practiceKey` | 支援每日目標與連續打卡，日期以 UTC 儲存、前端按香港時區展示。 |
| `student_review_records` | `userId`, `practiceKey`, `grade`, `title`, `href`, `misses`, `updatedAt` | 支援個人化錯題推薦。 |
| `student_pinned_practices` | `userId`, `practiceKey`, `position` | 支援個人化 Recommended Route 排序。 |

所有學生資料表均應以 `userId` 作外鍵，並為常用的 `userId + practiceKey` 或 `userId + practicedOn` 組合加上唯一索引。課題鍵維持現行字串格式，例如 `s3-trig` 或 `p4-fractions`，以免改動既有路由與題站資料。

## 建議介面流程

| 情境 | 學生看見的介面 | 系統行為 |
|---|---|---|
| 未登入 | 首頁保留「開始練習」，右上角顯示「登入以同步進度」。 | 仍照常使用本機練習功能。 |
| OAuth 回來後首次登入 | 小型確認卡：「找到這部裝置的學習紀錄，要同步嗎？」 | 讀取版本化本機快照，送至受保護匯入程序。 |
| 同步成功 | 「已同步 X 個完成課題」與「此裝置資料仍會保留」提示。 | 寫入遷移標記，重新載入帳戶進度。 |
| 多裝置登入 | 進度頁顯示最近同步時間。 | 以伺服器資料為準，並用非破壞式合併處理衝突。 |
| 登出 | 回到 guest-first 模式。 | 不刪除帳戶資料，也不覆寫本機資料。 |

## 全端實作順序

1. 先將專案升級為 `web-db-user`，保留現有公開練習路由與視覺系統。
2. 在 `drizzle/schema.ts` 加入五個學習資料表，產生並審閱 migration，再套用 SQL。
3. 在 `server/db.ts` 建立資料存取助手，並以 `protectedProcedure` 建立 `learningProfile`、`practiceProgress`、`review`、`pin` 與 `migration` 路由。
4. 首頁使用 `useAuth()` 處理登入、登出與同步提示；登入動作只能由按鈕事件觸發。
5. 將現有本機讀寫函式改為「本機即時寫入 + 已登入時背景同步」；離線時仍可練習，恢復連線後再提交。
6. 為未登入、首次遷移、重複匯入、帳戶同步、登出及錯誤回復編寫測試，最後進行手機與桌面回歸測試。

## 驗收準則

登入系統完成後，學生必須可在不登入的情況下完成任一 P1–S3 題站。首次登入後，現有星星、錯題、每日目標與釘選課題必須可選擇性匯入，並在重新登入同一帳戶時維持一致。任何同步失敗均不得清除本機紀錄；家長／教師資料頁只可讀取被授權學生的帳戶資料。
