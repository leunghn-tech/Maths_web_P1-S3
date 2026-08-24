import { useMemo } from "react";
import { Link } from "wouter";
import { Cloud, LogIn } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import StudentProfileSyncPanel from "@/components/StudentProfileSyncPanel";
import ParentLearningSummary from "@/components/ParentLearningSummary";

function Metric({ label, value, detail }: { label: string; value: string | number; detail: string }) { return <div className="rounded-2xl border border-[#172b3f]/12 bg-white p-4 shadow-[3px_3px_0_rgba(23,43,63,.05)]"><p className="font-mono text-[10px] font-bold tracking-[.12em] text-[#f05a3c]">{label}</p><strong className="mt-2 block text-3xl font-black">{value}</strong><small className="mt-1 block text-xs font-bold text-[#617286]">{detail}</small></div>; }

export default function AccountHub() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const overview = trpc.learning.overview.useQuery(undefined, { enabled: isAuthenticated });
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayPractices = overview.data?.dailyRecords.filter((record) => new Date(record.practicedOn).toISOString().slice(0, 10) === today).length ?? 0;
  if (loading) return <main className="grid min-h-screen place-items-center bg-[#f8f5ed] text-[#172b3f]"><p className="font-mono text-sm font-bold">正在讀取帳戶…</p></main>;
  if (!isAuthenticated) return <main className="grid min-h-screen place-items-center bg-[#f8f5ed] p-5 text-[#172b3f]"><section className="max-w-md rounded-[28px] border border-[#172b3f]/12 bg-white p-8 text-center shadow-[8px_8px_0_rgba(240,90,60,.12)]"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#f05a3c] text-white"><Cloud className="size-7" /></span><p className="mt-5 font-mono text-xs font-bold tracking-[.15em] text-[#f05a3c]">MATHS QUEST · ACCOUNT</p><h1 className="mt-3 text-3xl font-black">登入以備份你的學習地圖</h1><p className="mt-4 leading-7 text-[#617286]">完成星星、錯題、每日目標和釘選課題會安全同步到你的帳戶；未登入也可以繼續做練習。</p><Link href="/sign-in" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#f05a3c] px-5 py-3 font-bold text-white"><LogIn className="size-4" /> 學生登入／註冊</Link><Link href="/" className="mt-5 block text-sm font-bold text-[#617286] hover:text-[#f05a3c]">返回首頁</Link></section></main>;
  return <main className="min-h-screen bg-[#f8f5ed] px-5 py-7 text-[#172b3f] sm:px-7"><div className="mx-auto max-w-6xl"><header className="flex flex-wrap items-start justify-between gap-5"><div><Link href="/" className="font-bold hover:text-[#f05a3c]">← 返回學習地圖</Link><p className="mt-7 font-mono text-[11px] font-bold tracking-[.15em] text-[#f05a3c]">ACCOUNT · CLOUD LEARNING</p><h1 className="mt-2 text-4xl font-black tracking-[-.05em]">{user?.name || "我的"}學習帳戶</h1><p className="mt-3 max-w-2xl leading-7 text-[#617286]">你的完成星星、錯題、每日目標與釘選課題會持續安全備份到你的學生帳戶。</p></div><button onClick={() => void logout()} className="rounded-xl border border-[#172b3f]/15 bg-white px-4 py-3 text-sm font-bold text-[#617286]">登出</button></header><section className="mt-8 grid gap-4 sm:grid-cols-3"><Metric label="CLOUD STARS" value={overview.data?.progress.length ?? "—"} detail="已同步的完成課題" /><Metric label="TODAY" value={`${todayPractices}/${overview.data?.profile.dailyTarget ?? 3}`} detail="今日已備份練習" /><Metric label="REVIEW" value={overview.data?.reviewRecords.length ?? "—"} detail="等待補強的錯題站" /></section><ParentLearningSummary /><StudentProfileSyncPanel /></div></main>;
}
