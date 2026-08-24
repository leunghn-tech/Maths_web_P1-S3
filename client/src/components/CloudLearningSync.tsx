import { useEffect, useRef, useState } from "react";
import { CircleCheck, Cloud, CloudOff } from "lucide-react";
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
  const [status, setStatus] = useState<"guest" | "syncing" | "saved" | "offline">("guest");
  const migratedFor = useRef<string | null>(null);
  const hydratedFor = useRef<string | null>(null);
  const utils = trpc.useUtils();
  const migrate = trpc.learning.migrateLocal.useMutation();
  const sync = trpc.learning.syncLocal.useMutation();
  const overview = trpc.learning.overview.useQuery(undefined, { enabled: isAuthenticated, refetchOnWindowFocus: true });

  useEffect(() => {
    if (!isAuthenticated || !user) { setStatus("guest"); return; }
    const userKey = String(user.openId ?? user.id);
    if (migratedFor.current === userKey) return;
    migratedFor.current = userKey;
    const snapshot = getLocalLearningSnapshot();
    if (!hasLocalLearningData(snapshot)) { setStatus("saved"); return; }
    setStatus("syncing");
    migrate.mutate(snapshot, {
      onSuccess: () => { markLocalSnapshotMigrated(userKey); void utils.learning.overview.invalidate(); setStatus("saved"); },
      onError: () => setStatus("offline"),
    });
  }, [isAuthenticated, migrate, user, utils]);

  useEffect(() => {
    if (!isAuthenticated || !user || !overview.data) return;
    const userKey = String(user.openId ?? user.id);
    if (hydratedFor.current === userKey) return;
    hydratedFor.current = userKey;
    applyCloudLearningOverview(overview.data);
    setStatus("saved");
  }, [isAuthenticated, overview.data, user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let timer: number | undefined;
    const backup = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!navigator.onLine) { setStatus("offline"); return; }
        setStatus("syncing");
        sync.mutate(getLocalLearningSnapshot(), { onSuccess: () => setStatus("saved"), onError: () => setStatus("offline") });
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

  const detail = status === "guest" ? "未登入：資料保存在這部裝置" : status === "syncing" ? "正在備份學習紀錄…" : status === "saved" ? "雲端已備份" : "離線：稍後會再備份";
  const Icon = status === "saved" ? CircleCheck : status === "offline" ? CloudOff : Cloud;
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold ${status === "saved" ? "border-[#0e8b87]/30 bg-[#e8f5f2] text-[#0e756f]" : status === "offline" ? "border-[#f05a3c]/30 bg-[#fff0e9] text-[#b84c36]" : "border-[#172b3f]/12 bg-white text-[#617286]"}`} aria-live="polite"><Icon className="size-3" /> {detail}</span>;
}
