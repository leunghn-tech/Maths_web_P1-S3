import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CircleCheck, Cloud, CloudOff, RefreshCw } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { DAILY_PROGRESS_EVENT } from "@/lib/dailyPractice";
import { applyCloudLearningOverview, getLocalLearningSnapshot, hasLocalLearningData, markLocalSnapshotMigrated } from "@/lib/localLearningSnapshot";
import { PINNED_PRACTICES_EVENT } from "@/lib/pinnedPractices";
import { PRACTICE_COMPLETION_EVENT } from "@/lib/practiceCompletion";
import { REVIEW_RECOMMENDATIONS_EVENT } from "@/lib/reviewRecommendations";

/** Keeps guest-first local study intact, then performs idempotent backup after OAuth login. */
export default function CloudLearningSync() {
  const { user, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<"guest" | "syncing" | "saved" | "offline" | "conflict">("guest");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [pendingChanges, setPendingChanges] = useState(false);
  const [recentConflict, setRecentConflict] = useState(false);
  const migratedFor = useRef<string | null>(null);
  const hydratedFor = useRef<string | null>(null);
  const remoteRevision = useRef(0);
  const suppressBackupUntil = useRef(0);
  const utils = trpc.useUtils();
  const migrate = trpc.learning.migrateLocal.useMutation();
  const sync = trpc.learning.syncLocal.useMutation();
  const overview = trpc.learning.overview.useQuery(undefined, { enabled: isAuthenticated, refetchOnWindowFocus: true });

  const captureRemoteState = (data: NonNullable<typeof overview.data>, suppressBackup: boolean) => {
    remoteRevision.current = data.profile.syncRevision;
    setLastSyncedAt(data.profile.lastSyncedAt ? new Date(data.profile.lastSyncedAt) : null);
    if (suppressBackup) suppressBackupUntil.current = Date.now() + 500;
    applyCloudLearningOverview(data);
  };

  useEffect(() => {
    if (!isAuthenticated || !user) { setStatus("guest"); setPendingChanges(false); return; }
    const userKey = String(user.openId ?? user.id);
    if (migratedFor.current === userKey) return;
    migratedFor.current = userKey;
    const snapshot = getLocalLearningSnapshot();
    if (!hasLocalLearningData(snapshot)) { setStatus("saved"); return; }
    setStatus("syncing");
    migrate.mutate(snapshot, {
      onSuccess: (data) => { markLocalSnapshotMigrated(userKey); captureRemoteState(data, true); void utils.learning.overview.invalidate(); setStatus("saved"); },
      onError: () => setStatus("offline"),
    });
  }, [isAuthenticated, migrate, user, utils]);

  useEffect(() => {
    if (!isAuthenticated || !user || !overview.data) return;
    const userKey = String(user.openId ?? user.id);
    if (hydratedFor.current === userKey) return;
    hydratedFor.current = userKey;
    captureRemoteState(overview.data, true);
    setStatus("saved");
  }, [isAuthenticated, overview.data, user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let timer: number | undefined;
    const backup = () => {
      if (Date.now() < suppressBackupUntil.current) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!navigator.onLine) { setStatus("offline"); return; }
        setPendingChanges(true);
        setStatus("syncing");
        sync.mutate({ snapshot: getLocalLearningSnapshot(), expectedSyncRevision: remoteRevision.current }, {
          onSuccess: (result) => {
            if (result.status === "conflict") {
              remoteRevision.current = result.overview.profile.syncRevision;
              setLastSyncedAt(result.overview.profile.lastSyncedAt ? new Date(result.overview.profile.lastSyncedAt) : null);
              applyCloudLearningOverview(result.overview);
              setRecentConflict(true);
              setStatus("conflict");
              window.setTimeout(() => setRecentConflict(false), 8000);
              return;
            }
            remoteRevision.current = result.overview.profile.syncRevision;
            setLastSyncedAt(result.overview.profile.lastSyncedAt ? new Date(result.overview.profile.lastSyncedAt) : new Date());
            setPendingChanges(false);
            setStatus("saved");
          },
          onError: () => setStatus("offline"),
        });
      }, 250);
    };
    const events = [PRACTICE_COMPLETION_EVENT, DAILY_PROGRESS_EVENT, REVIEW_RECOMMENDATIONS_EVENT, PINNED_PRACTICES_EVENT];
    events.forEach((event) => window.addEventListener(event, backup));
    window.addEventListener("online", backup);
    return () => {
      window.clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, backup));
      window.removeEventListener("online", backup);
    };
  }, [isAuthenticated, sync]);

  const syncTime = lastSyncedAt ? new Intl.DateTimeFormat("zh-HK", { dateStyle: "short", timeStyle: "short" }).format(lastSyncedAt) : "尚未同步";
  const detail = status === "guest" ? "未登入：資料保存在這部裝置" : status === "syncing" ? "正在備份這部裝置的變更…" : status === "conflict" ? "偵測到另一部裝置更新，正在安全合併" : status === "saved" ? `雲端已備份 · ${syncTime}` : "離線：變更會在重新連線後備份";
  const Icon = status === "saved" ? CircleCheck : status === "offline" ? CloudOff : status === "conflict" ? AlertTriangle : status === "syncing" ? RefreshCw : Cloud;
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold ${status === "saved" ? "border-[#0e8b87]/30 bg-[#e8f5f2] text-[#0e756f]" : status === "offline" || status === "conflict" ? "border-[#f05a3c]/30 bg-[#fff0e9] text-[#b84c36]" : "border-[#172b3f]/12 bg-white text-[#617286]"}`} aria-live="polite" title={recentConflict ? "已保留兩部裝置的完成紀錄、錯題與釘選項目，合併後會再次備份。" : pendingChanges ? "這部裝置有新的學習變更等待備份。" : detail}><Icon className={`size-3 ${status === "syncing" ? "animate-spin" : ""}`} /> {recentConflict ? "已安全合併跨裝置更新" : pendingChanges && status !== "saved" ? "這部裝置有待備份變更" : detail}</span>;
}
