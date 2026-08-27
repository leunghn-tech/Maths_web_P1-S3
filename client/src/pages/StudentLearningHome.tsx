import { BookOpenCheck, ChevronRight, CircleAlert, LogOut, Play, Sparkles, Target } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getPriorityReviewItems, getStudentStartHref } from "@/lib/studentDashboard";

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("zh-HK", { month: "short", day: "numeric" }).format(new Date(value));
}

export default function StudentLearningHome() {
  const [, setLocation] = useLocation();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const overview = trpc.learning.overview.useQuery(undefined, { enabled: isAuthenticated && user?.role === "user" });

  useEffect(() => {
    if (!loading && !isAuthenticated) setLocation("/sign-in");
    if (!loading && user?.role === "admin") setLocation("/teacher");
  }, [isAuthenticated, loading, setLocation, user?.role]);

  const progress = overview.data?.progress ?? [];
  const reviews = useMemo(() => getPriorityReviewItems(overview.data?.reviewRecords ?? []), [overview.data?.reviewRecords]);
  const correctAnswers = progress.reduce((total, item) => total + item.bestScore, 0);
  const missedAnswers = (overview.data?.reviewRecords ?? []).reduce((total, item) => total + item.misses, 0);
  const attempts = correctAnswers + missedAnswers;
  const accuracy = attempts ? Math.round((correctAnswers / attempts) * 100) : null;
  const savedGrade = typeof window === "undefined" ? null : window.localStorage.getItem("mq-selected-primary-grade");
  const selectedGrade = /^P[1-6]$/.test(savedGrade ?? "") ? savedGrade! : "P1";
  const defaultStartHref = getStudentStartHref(selectedGrade);
  const startHref = reviews[0]?.href ?? defaultStartHref;
  const displayName = user?.name?.trim() || user?.localUsername || "小探險家";

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("已登出帳戶");
      setLocation("/sign-in");
    } catch {
      toast.error("暫時未能登出，請稍後再試。");
    }
  };

  if (loading || !isAuthenticated || user?.role === "admin") {
    return <main className="grid min-h-screen place-items-center bg-[#f8f5ed] px-5 font-bold text-[#172b3f]">正在準備你的學習首頁…</main>;
  }

  return <main className="min-h-screen bg-[#f8f5ed] px-5 py-6 text-[#172b3f] sm:px-8 sm:py-9">
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/dashboard" className="flex items-center gap-3" aria-label="Maths Quest 個人學習首頁">
          <span className="grid size-11 place-items-center rounded-2xl bg-[#f05a3c] text-white shadow-[0_5px_0_#c84932]"><Sparkles className="size-5" /></span>
          <span><strong className="block text-lg font-black tracking-[-.04em]">Maths Quest</strong><small className="font-mono text-[10px] font-bold tracking-[.14em] text-[#f05a3c]">我的學習首頁</small></span>
        </Link>
        <button type="button" onClick={() => void handleLogout()} className="inline-flex items-center gap-2 rounded-xl border border-[#172b3f]/15 bg-white px-4 py-2.5 text-sm font-bold hover:border-[#f05a3c]"><LogOut className="size-4" />登出</button>
      </header>

      <section className="mt-7 overflow-hidden rounded-[32px] bg-[#172b3f] p-6 text-white shadow-[10px_10px_0_rgba(23,43,63,.1)] sm:p-9">
        <p className="font-mono text-[11px] font-bold tracking-[.16em] text-[#80d8cf]">STUDENT HOME</p>
        <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><h1 className="text-4xl font-black tracking-[-.055em]">你好，{displayName}！</h1><p className="mt-3 max-w-xl leading-7 text-white/75">先看你的進度，再選一個年級和課題開始。錯得較多的課題已放在下面，方便你一步一步重溫。</p></div><Link href={reviews.length ? startHref : "/library#path"} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#f05a3c] px-6 py-4 font-black text-white shadow-[0_4px_0_#c84932] transition hover:-translate-y-0.5"><Play className="size-4 fill-current" />{reviews.length ? "先重溫這一題型" : "選年級開始"}</Link></div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3" aria-label="我的學習進度">
        <Metric icon={<BookOpenCheck className="size-5 text-[#0e8b87]" />} label="已完成課題" value={String(progress.length)} detail="完成後會保留在帳戶內" />
        <Metric icon={<Target className="size-5 text-[#f05a3c]" />} label="作答準確度" value={accuracy === null ? "—" : `${accuracy}%`} detail={attempts ? `${correctAnswers}/${attempts} 題答對` : "先完成第一個練習"} />
        <Metric icon={<CircleAlert className="size-5 text-[#c8811e]" />} label="需要重溫" value={String(reviews.length)} detail={reviews.length ? "先做錯得較多的課題" : "暫時沒有重溫課題"} />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-[28px] border border-[#172b3f]/12 bg-white p-5 shadow-[7px_7px_0_rgba(23,43,63,.05)] sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] font-bold tracking-[.15em] text-[#f05a3c]">REVIEW FIRST</p><h2 className="mt-2 text-2xl font-black">優先重溫</h2><p className="mt-2 text-sm leading-6 text-[#617286]">按答錯次數排列，先處理最需要練習的課題。</p></div><CircleAlert className="size-6 text-[#f05a3c]" /></div>{reviews.length ? <div className="mt-5 grid gap-3">{reviews.map((item) => <Link key={item.href} href={item.href} className="flex items-center gap-4 rounded-2xl border border-[#f05a3c]/20 bg-[#fff3e8] p-4 transition hover:-translate-y-0.5 hover:border-[#f05a3c]"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f05a3c] text-lg font-black text-white">{item.grade}</span><span className="min-w-0 flex-1"><strong className="block text-base font-black">{item.title}</strong><small className="mt-1 block text-[#744230]">答錯 {item.misses} 次 · 最近更新 {formatDate(item.updatedAt)}</small></span><ChevronRight className="size-5 shrink-0 text-[#f05a3c]" /></Link>)}</div> : <div className="mt-5 rounded-2xl bg-[#e8f5f2] p-5 text-[#135d59]"><strong>暫時沒有需要重溫的課題。</strong><p className="mt-1 text-sm">完成練習後，系統會在這裡提醒你重溫答錯較多的課題。</p></div>}</section>
        <aside className="rounded-[28px] border border-[#172b3f]/12 bg-[#fffdf8] p-5 sm:p-7"><p className="font-mono text-[10px] font-bold tracking-[.15em] text-[#0e8b87]">QUICK START</p><h2 className="mt-2 text-2xl font-black">選年級開始</h2><p className="mt-2 text-sm leading-6 text-[#617286]">先選 P1–P6，再從該年級的題目庫選擇想做的課題。</p><div className="mt-5 grid grid-cols-3 gap-2" aria-label="選擇年級題目庫">{["P1", "P2", "P3", "P4", "P5", "P6"].map((grade) => <Link key={grade} href="/library#path" onClick={() => window.localStorage.setItem("mq-selected-primary-grade", grade)} className={`rounded-xl px-3 py-3 text-center font-black transition hover:-translate-y-0.5 ${grade === selectedGrade ? "bg-[#0e8b87] text-white shadow-[0_3px_0_#08716e]" : "border border-[#172b3f]/15 bg-white text-[#172b3f] hover:border-[#0e8b87]"}`}>{grade}</Link>)}</div><Link href={reviews.length ? startHref : "/library#path"} className="mt-4 flex items-center justify-between rounded-2xl bg-[#0e8b87] px-5 py-4 font-black text-white"><span>{reviews.length ? reviews[0].title : `查看 ${selectedGrade} 題目庫`}</span><Play className="size-4 fill-current" /></Link><Link href="/account" className="mt-3 flex items-center justify-between rounded-2xl border border-[#172b3f]/15 bg-white px-5 py-4 font-bold"><span>查看完整進度與同步</span><ChevronRight className="size-4" /></Link></aside>
      </section>
    </div>
  </main>;
}

function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <article className="rounded-2xl border border-[#172b3f]/10 bg-white p-5"><div className="flex items-center gap-2">{icon}<p className="font-mono text-[10px] font-bold tracking-[.12em] text-[#617286]">{label}</p></div><strong className="mt-3 block text-3xl font-black">{value}</strong><p className="mt-1 text-xs text-[#617286]">{detail}</p></article>;
}
