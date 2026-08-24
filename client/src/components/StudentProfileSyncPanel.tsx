import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, CloudCog, Save, ShieldAlert, UserRound } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

function formatSyncTime(value: Date | string | null | undefined) {
  if (!value) return "尚未完成首次雲端同步";
  return new Intl.DateTimeFormat("zh-HK", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function StudentProfileSyncPanel() {
  const utils = trpc.useUtils();
  const overview = trpc.learning.overview.useQuery();
  const [displayName, setDisplayName] = useState("");
  const [classCode, setClassCode] = useState("");
  const updateProfile = trpc.learning.updateProfile.useMutation({
    onSuccess: (data) => {
      setDisplayName(data.profile.displayName ?? "");
      setClassCode(data.profile.classCode ?? "");
      void utils.learning.overview.invalidate();
      void utils.familyAccess.viewerStudents.invalidate();
      toast.success("學生識別資料已更新。");
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (!overview.data) return;
    setDisplayName(overview.data.profile.displayName ?? "");
    setClassCode(overview.data.profile.classCode ?? "");
  }, [overview.data]);

  const profile = overview.data?.profile;
  const hasChanges = displayName !== (profile?.displayName ?? "") || classCode !== (profile?.classCode ?? "");
  return <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_.95fr]"><div className="rounded-[28px] border border-[#172b3f]/12 bg-white p-6 shadow-[7px_7px_0_rgba(23,43,63,.05)]"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[10px] font-bold tracking-[.15em] text-[#4f6eae]">STUDENT IDENTITY</p><h2 className="mt-2 text-2xl font-black">學生暱稱與班級</h2><p className="mt-2 text-sm leading-6 text-[#617286]">這些資料只會顯示給你主動授權的家長或教師，方便他們在學生清單中辨識你。</p></div><UserRound className="size-8 text-[#4f6eae]" /></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="block"><span className="font-mono text-[10px] font-bold tracking-[.12em] text-[#617286]">STUDENT NICKNAME</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={80} placeholder="例如：數學小探險家" className="mt-2 w-full rounded-xl border border-[#172b3f]/14 bg-[#fffdf8] px-4 py-3 font-bold outline-none transition focus:border-[#4f6eae] focus:ring-2 focus:ring-[#4f6eae]/15" /></label><label className="block"><span className="font-mono text-[10px] font-bold tracking-[.12em] text-[#617286]">CLASS CODE</span><input value={classCode} onChange={(event) => setClassCode(event.target.value.toUpperCase())} maxLength={32} placeholder="例如：3A 或 S2B" className="mt-2 w-full rounded-xl border border-[#172b3f]/14 bg-[#fffdf8] px-4 py-3 font-mono font-bold outline-none transition focus:border-[#4f6eae] focus:ring-2 focus:ring-[#4f6eae]/15" /></label></div><button disabled={!hasChanges || updateProfile.isPending} onClick={() => updateProfile.mutate({ displayName, classCode })} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#4f6eae] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"><Save className="size-4" /> {updateProfile.isPending ? "正在儲存…" : "儲存學生資料"}</button></div><div className="rounded-[28px] border border-[#172b3f]/12 bg-[#172b3f] p-6 text-white"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[10px] font-bold tracking-[.15em] text-[#f6be5d]">CROSS-DEVICE SYNC</p><h2 className="mt-2 text-2xl font-black">雲端同步狀態</h2></div><CloudCog className="size-8 text-[#80d8cf]" /></div><div className="mt-5 rounded-2xl bg-white/10 p-4"><div className="flex items-center gap-2 text-[#80d8cf]"><Clock3 className="size-4" /><span className="text-sm font-bold">最近同步</span></div><strong className="mt-2 block text-lg">{formatSyncTime(profile?.lastSyncedAt)}</strong><small className="mt-1 block text-white/65">同步版本 #{profile?.syncRevision ?? 0}</small></div><div className="mt-4 flex gap-3 rounded-2xl border border-[#f6be5d]/30 bg-[#f6be5d]/10 p-4"><ShieldAlert className="mt-0.5 size-5 shrink-0 text-[#f6be5d]" /><p className="text-sm leading-6 text-white/80"><strong className="text-white">跨裝置有更新時怎麼辦？</strong><br />系統會先取得較新的雲端紀錄，再保留兩部裝置的完成課題、每日練習與釘選；錯題次數以較高值保留，合併後自動再次備份。</p></div>{profile?.lastSyncedAt && <p className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#80d8cf]"><CheckCircle2 className="size-4" /> 這個帳戶的學習資料已連接雲端。</p>}</div></section>;
}
