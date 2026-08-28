import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CircleCheck, Cloud, CloudOff, RefreshCw } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { DAILY_PROGRESS_EVENT } from "@/lib/dailyPractice";
import { applyCloudLearningOverview, getLocalLearningSnapshot, hasLocalLearningData, markLocalSnapshotMigrated, type CloudLearningOverview } from "@/lib/localLearningSnapshot";
import { PINNED_PRACTICES_EVENT } from "@/lib/pinnedPractices";
import { PRACTICE_COMPLETION_EVENT } from "@/lib/practiceCompletion";
import { REVIEW_RECOMMENDATIONS_EVENT } from "@/lib/reviewRecommendations";
import { loadFirebaseLearning, syncFirebaseLearning, toCloudLearningOverview } from "@/lib/firebaseLearning";

export function shouldSyncFirebaseLearning(isAuthenticated: boolean, isFirebaseUser: boolean, user: { role?: "user" | "admin" } | null) {
  return isAuthenticated && isFirebaseUser && user?.role !== "admin";
}

/** Firebase students sync direct to their own UID document; legacy accounts retain the existing tRPC transition path. */
export default function CloudLearningSync() {
  const { user, isAuthenticated, isFirebaseUser } = useAuth();
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
  const overview = trpc.learning.overview.useQuery(undefined, { enabled: isAuthenticated && !isFirebaseUser, refetchOnWindowFocus: true });
  const firebaseStudent = shouldSyncFirebaseLearning(isAuthenticated, isFirebaseUser, user);
  const firebaseTeacher = isFirebaseUser && user?.role === "admin";

  const captureRemoteState = (data: CloudLearningOverview, suppressBackup: boolean) => {
    remoteRevision.current = data.profile.syncRevision;
    setLastSyncedAt(data.profile.lastSyncedAt ? new Date(data.profile.lastSyncedAt) : null);
    if (suppressBackup) suppressBackupUntil.current = Date.now() + 500;
    applyCloudLearningOverview(data);
  };

  useEffect(() => {
    if (!firebaseStudent || !user) return;
    const userKey = String(user.openId ?? user.id);
    if (migratedFor.current === userKey) return;
    migratedFor.current = userKey;
    let active = true;
    setStatus("syncing");
    void (async () => {
      try {
        const remote = await loadFirebaseLearning(userKey);
        if (!active) return;
        if (remote) captureRemoteState(toCloudLearningOverview(remote), true);
        const saved = await syncFirebaseLearning({ uid: userKey, email: user.email ?? null, displayName: user.name ?? null }, getLocalLearningSnapshot());
        if (!active) return;
        captureRemoteState(saved, true);
        markLocalSnapshotMigrated(userKey);
        setStatus("saved");
      } catch { if (active) setStatus("offline"); }
    })();
    return () => { active = false; };
  }, [firebaseStudent, user]);

  useEffect(() => {
    if (!isAuthenticated || !user || isFirebaseUser) { if (!isAuthenticated || !user) { setStatus("guest"); setPendingChanges(false); } return; }
    const userKey = String(user.openId ?? user.id);
    if (migratedFor.current === userKey) return;
    migratedFor.current = userKey;
    const snapshot = getLocalLearningSnapshot();
    if (!hasLocalLearningData(snapshot)) { setStatus("saved"); return; }
    setStatus("syncing");
    migrate.mutate(snapshot, { onSuccess: (data) => { markLocalSnapshotMigrated(userKey); captureRemoteState(data, true); void utils.learning.overview.invalidate(); setStatus("saved"); }, onError: () => setStatus("offline") });
  }, [isAuthenticated, isFirebaseUser, migrate, user, utils]);

  useEffect(() => {
    if (!isAuthenticated || !user || !overview.data || isFirebaseUser) return;
    const userKey = String(user.openId ?? user.id);
    if (hydratedFor.current === userKey) return;
    hydratedFor.current = userKey;
    captureRemoteState(overview.data, true);
    setStatus("saved");
  }, [isAuthenticated, isFirebaseUser, overview.data, user]);

  useEffect(() => {
    if (!isAuthenticated || firebaseTeacher) return;
    let timer: number | undefined;
    const backup = () => {
      if (Date.now() < suppressBackupUntil.current) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!navigator.onLine) { setStatus("offline"); return; }
        setPendingChanges(true); setStatus("syncing");
        if (firebaseStudent && user) {
          void syncFirebaseLearning({ uid: String(user.openId ?? user.id), email: user.email ?? null, displayName: user.name ?? null }, getLocalLearningSnapshot()).then((saved) => { captureRemoteState(saved, false); setPendingChanges(false); setStatus("saved"); }).catch(() => setStatus("offline"));
          return;
        }
        sync.mutate({ snapshot: getLocalLearningSnapshot(), expectedSyncRevision: remoteRevision.current }, {
          onSuccess: (result) => {
            if (result.status === "conflict") { remoteRevision.current = result.overview.profile.syncRevision; setLastSyncedAt(result.overview.profile.lastSyncedAt ? new Date(result.overview.profile.lastSyncedAt) : null); applyCloudLearningOverview(result.overview); setRecentConflict(true); setStatus("conflict"); window.setTimeout(() => setRecentConflict(false), 8000); return; }
            remoteRevision.current = result.overview.profile.syncRevision; setLastSyncedAt(result.overview.profile.lastSyncedAt ? new Date(result.overview.profile.lastSyncedAt) : new Date()); setPendingChanges(false); setStatus("saved");
          }, onError: () => setStatus("offline"),
        });
      }, 250);
    };
    const events = [PRACTICE_COMPLETION_EVENT, DAILY_PROGRESS_EVENT, REVIEW_RECOMMENDATIONS_EVENT, PINNED_PRACTICES_EVENT];
    events.forEach((event) => window.addEventListener(event, backup));
    window.addEventListener("online", backup);
    return () => { window.clearTimeout(timer); events.forEach((event) => window.removeEventListener(event, backup)); window.removeEventListener("online", backup); };
  }, [firebaseStudent, firebaseTeacher, isAuthenticated, sync, user]);

  if (firebaseTeacher) return null;
  const syncTime = lastSyncedAt ? new Intl.DateTimeFormat("zh-HK", { dateStyle: "short", timeStyle: "short" }).format(lastSyncedAt) : "尚未同步";
  const detail = status === "guest" ? "未登入：資料保存在這部裝置" : status === "syncing" ? "正在備份這部裝置的變更…" : status === "conflict" ? "偵測到另一部裝置更新，正在安全合併" : status === "saved" ? `雲端已備份 · ${syncTime}` : "離線：變更會在重新連線後備份";
  const Icon = status === "saved" ? CircleCheck : status === "offline" ? CloudOff : status === "conflict" ? AlertTriangle : status === "syncing" ? RefreshCw : Cloud;
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold ${status === "saved" ? "border-[#0e8b87]/30 bg-[#e8f5f2] text-[#0e756f]" : status === "offline" || status === "conflict" ? "border-[#f05a3c]/30 bg-[#fff0e9] text-[#b84c36]" : "border-[#172b3f]/12 bg-white text-[#617286]"}`} aria-live="polite" title={recentConflict ? "已保留兩部裝置的完成紀錄、錯題與釘選項目，合併後會再次備份。" : pendingChanges ? "這部裝置有新的學習變更等待備份。" : detail}><Icon className={`size-3 ${status === "syncing" ? "animate-spin" : ""}`} /> {recentConflict ? "已安全合併跨裝置更新" : pendingChanges && status !== "saved" ? "這部裝置有待備份變更" : detail}</span>;
}
