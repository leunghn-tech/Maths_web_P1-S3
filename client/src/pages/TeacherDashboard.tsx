import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUpRight, BookOpen, Clock3, GraduationCap, LogOut, Search, ShieldCheck, UsersRound } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { loadFirebaseTeacherStudents, type FirebaseTeacherStudent } from "@/lib/firebaseTeacherLearning";

function formatDate(value: number | null) { return value ? new Intl.DateTimeFormat("zh-HK", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "尚未同步"; }

export default function TeacherDashboard() {
  const [, setLocation] = useLocation();
  const { user, loading, isFirebaseUser, logout } = useAuth();
  const [students, setStudents] = useState<FirebaseTeacherStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isFirebaseUser || user?.role !== "admin") return;
    let active = true;
    setLoadingStudents(true); setLoadError(null);
    void loadFirebaseTeacherStudents().then((items) => { if (active) setStudents(items); }).catch(() => { if (active) setLoadError("暫時未能讀取學生同步摘要，請重新整理後再試。"); }).finally(() => { if (active) setLoadingStudents(false); });
    return () => { active = false; };
  }, [isFirebaseUser, user?.role]);

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return keyword ? students.filter((student) => [student.displayName, student.email].some((value) => value?.toLowerCase().includes(keyword))) : students;
  }, [search, students]);
  const handleLogout = async () => { await logout(); setLocation("/sign-in"); };

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#172b3f] font-mono font-bold text-white">正在驗證教師身份…</main>;
  if (!user) return <Gate icon={<GraduationCap className="size-12 text-[#f6be5d]" />} title="需要教師登入" detail="請使用已授權的 Google 教師帳戶登入。" href="/sign-in" action="前往教師登入" dark />;
  if (!isFirebaseUser || user.role !== "admin") return <Gate icon={<ShieldCheck className="size-12 text-[#f05a3c]" />} title="教師限定頁面" detail="只有指定的 Google 教師帳戶可唯讀查看學生同步摘要。" href="/sign-in" action="返回登入頁" />;

  return <main className="min-h-screen bg-[#edf1f7] p-5 text-[#172b3f] sm:p-8"><div className="mx-auto max-w-6xl">
    <header className="flex flex-wrap items-start justify-between gap-5 rounded-[28px] bg-[#172b3f] p-7 text-white"><div><p className="font-mono text-[11px] font-bold tracking-[.17em] text-[#f6be5d]">MATHS QUEST · FIREBASE TEACHER</p><h1 className="mt-3 text-4xl font-black">學生學習摘要</h1><p className="mt-3 max-w-2xl text-white/70">只顯示已同步的學生暱稱、電郵、完成課題、錯題摘要、每日目標及最後同步時間。</p></div><div className="flex items-center gap-3"><div className="rounded-xl border border-white/20 bg-white/8 px-4 py-2.5 text-right"><p className="font-mono text-[9px] font-bold tracking-[.14em] text-white/55">已驗證教師</p><strong className="mt-1 block text-sm">{user.email}</strong><p className="mt-1 text-[10px] text-white/65">唯讀 · 無學生資料寫入權限</p></div><button type="button" onClick={() => void handleLogout()} className="inline-flex items-center gap-2 rounded-xl bg-[#f6be5d] px-4 py-3 text-sm font-bold text-[#172b3f]"><LogOut className="size-4" />登出</button></div></header>
    <section className="mt-6 grid gap-4 sm:grid-cols-3"><Metric icon={<UsersRound className="size-5 text-[#4f6eae]" />} label="SYNCED STUDENTS" value={loadingStudents ? "—" : students.length} detail="已建立 Firebase 學習快照" /><Metric icon={<BookOpen className="size-5 text-[#0e8b87]" />} label="COMPLETED PRACTICES" value={loadingStudents ? "—" : students.reduce((total, item) => total + item.completedPractices, 0)} detail="全部已同步完成課題" /><Metric icon={<Clock3 className="size-5 text-[#f05a3c]" />} label="LAST SYNC" value={loadingStudents ? "—" : formatDate(students[0]?.lastSyncedAt ?? null)} detail="按最近同步排序" /></section>
    <section className="mt-6 overflow-hidden rounded-[28px] border border-[#172b3f]/12 bg-white"><header className="border-b border-[#172b3f]/10 p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-[10px] font-bold tracking-[.15em] text-[#4f6eae]">STUDENT DIRECTORY · READ ONLY</p><h2 className="mt-2 text-2xl font-black">已同步學生</h2></div><span className="rounded-full bg-[#edf1f7] px-3 py-2 text-xs font-bold">{filteredStudents.length}/{students.length} 位</span></div><label className="relative mt-5 block"><Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#617286]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜尋學生暱稱或電郵" className="w-full rounded-xl border border-[#172b3f]/14 bg-[#fffdf8] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#4f6eae] focus:ring-2 focus:ring-[#4f6eae]/15" /></label></header>
      {loadingStudents ? <p className="p-10 text-center text-[#617286]">正在讀取已同步學生…</p> : loadError ? <p className="p-10 text-center text-[#b64229]">{loadError}</p> : filteredStudents.length ? <div className="divide-y divide-[#172b3f]/8">{filteredStudents.map((student) => <Link key={student.uid} href={`/teacher/students/${encodeURIComponent(student.uid)}`} className="grid gap-4 p-5 transition hover:bg-[#f8f5ed] sm:grid-cols-[1.2fr_.8fr_.9fr_auto] sm:items-center"><div><strong className="block text-lg">{student.displayName}</strong><small className="mt-1 block text-[#617286]">{student.email || "未提供電郵摘要"}</small></div><div><strong className="block text-2xl font-black text-[#0e8b87]">{student.completedPractices}</strong><small className="mt-1 block text-[#617286]">已完成課題 · {student.reviewCount} 個重溫課題</small></div><div className="text-sm text-[#617286]"><span className="flex items-center gap-2"><Clock3 className="size-4 text-[#0e8b87]" />{formatDate(student.lastSyncedAt)}</span><small className="mt-1 block">每日目標：{student.dailyTarget} 個課題</small></div><ArrowUpRight className="size-5 text-[#4f6eae]" aria-label="查看學生唯讀詳情" /></Link>)}</div> : <p className="p-10 text-center text-[#617286]">{search ? "找不到符合搜尋的已同步學生。" : "暫時沒有學生學習快照。學生完成首次登入同步後會出現在這裡。"}</p>}</section>
    <p className="mt-6 rounded-2xl border border-[#172b3f]/10 bg-white px-5 py-4 text-sm leading-6 text-[#617286]">此頁不顯示密碼或任何帳戶安全資料；教師只能讀取學生自己同步的學習快照，不能建立、修改或刪除資料。</p>
  </div></main>;
}

function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: React.ReactNode; detail: string }) { return <div className="rounded-2xl border border-[#172b3f]/10 bg-white p-5"><div className="flex items-center gap-2">{icon}<span className="font-mono text-[10px] font-bold tracking-[.12em] text-[#617286]">{label}</span></div><strong className="mt-3 block truncate text-2xl font-black">{value}</strong><small className="mt-1 block text-[#617286]">{detail}</small></div>; }
function Gate({ icon, title, detail, href, action, dark = false }: { icon: React.ReactNode; title: string; detail: string; href: string; action: string; dark?: boolean }) { return <main className={`grid min-h-screen place-items-center p-5 text-center ${dark ? "bg-[#172b3f] text-white" : "bg-[#f8f5ed] text-[#172b3f]"}`}><section className="max-w-md"><div className="mx-auto">{icon}</div><h1 className="mt-4 text-3xl font-black">{title}</h1><p className={`mt-3 leading-7 ${dark ? "text-white/70" : "text-[#617286]"}`}>{detail}</p><Link href={href} className={`mt-5 inline-block rounded-xl px-5 py-3 font-bold ${dark ? "bg-[#f6be5d] text-[#172b3f]" : "bg-[#172b3f] text-white"}`}>{action}</Link></section></main>; }
