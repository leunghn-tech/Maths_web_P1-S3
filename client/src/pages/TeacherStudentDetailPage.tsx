import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { AlertCircle, ArrowLeft, BookOpen, Clock3, GraduationCap, ShieldCheck, Target, UserRound } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { loadFirebaseTeacherStudents, type FirebaseTeacherStudent } from "@/lib/firebaseTeacherLearning";

function formatDate(value: number | null) { return value ? new Intl.DateTimeFormat("zh-HK", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "尚未同步"; }

export default function TeacherStudentDetailPage() {
  const { user, loading, isFirebaseUser } = useAuth();
  const [, params] = useRoute("/teacher/students/:studentId");
  const studentId = params?.studentId ? decodeURIComponent(params.studentId) : "";
  const [student, setStudent] = useState<FirebaseTeacherStudent | null | undefined>(undefined);

  useEffect(() => {
    if (!isFirebaseUser || user?.role !== "admin" || !studentId) return;
    let active = true;
    void loadFirebaseTeacherStudents().then((items) => { if (active) setStudent(items.find((item) => item.uid === studentId) ?? null); }).catch(() => { if (active) setStudent(null); });
    return () => { active = false; };
  }, [isFirebaseUser, studentId, user?.role]);

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#172b3f] font-mono font-bold text-white">正在驗證教師身份…</main>;
  if (!user) return <Gate icon={<GraduationCap className="size-12 text-[#f6be5d]" />} title="需要教師登入" detail="請使用已授權 Google 帳戶登入。" href="/sign-in" action="前往登入" dark />;
  if (!isFirebaseUser || user.role !== "admin") return <Gate icon={<ShieldCheck className="size-12 text-[#f05a3c]" />} title="教師限定頁面" detail="學生帳戶不能查看其他學生資料。" href="/sign-in" action="返回登入頁" />;
  if (!studentId) return <Gate icon={<AlertCircle className="size-12 text-[#f05a3c]" />} title="學生資料連結無效" detail="請返回學生清單重新選擇。" href="/teacher" action="返回學生清單" />;
  if (student === undefined) return <main className="grid min-h-screen place-items-center bg-[#edf1f7] font-mono font-bold text-[#172b3f]">正在讀取學生唯讀摘要…</main>;
  if (!student) return <Gate icon={<AlertCircle className="size-12 text-[#f05a3c]" />} title="找不到學生資料" detail="這位學生可能尚未同步學習快照。" href="/teacher" action="返回學生清單" />;

  return <main className="min-h-screen bg-[#edf1f7] p-5 text-[#172b3f] sm:p-8"><div className="mx-auto max-w-6xl"><Link href="/teacher" className="inline-flex items-center gap-2 font-bold text-[#4f6eae] hover:text-[#172b3f]"><ArrowLeft className="size-4" />返回學生清單</Link>
    <header className="mt-5 flex flex-wrap items-start justify-between gap-5 rounded-[28px] bg-[#172b3f] p-7 text-white"><div className="flex items-start gap-4"><span className="grid size-12 place-items-center rounded-2xl bg-[#f6be5d] text-[#172b3f]"><UserRound className="size-6" /></span><div><p className="font-mono text-[10px] font-bold tracking-[.16em] text-[#f6be5d]">FIREBASE · READ-ONLY DETAIL</p><h1 className="mt-2 text-3xl font-black">{student.displayName}</h1><p className="mt-2 text-white/70">{student.email || "未提供電郵摘要"}</p></div></div><div className="rounded-xl border border-white/15 px-4 py-3 text-sm"><Clock3 className="mr-2 inline size-4 text-[#80d8cf]" />最近同步：{formatDate(student.lastSyncedAt)}</div></header>
    <section className="mt-6 grid gap-4 sm:grid-cols-3"><Metric icon={<BookOpen className="size-5 text-[#4f6eae]" />} label="完成課題" value={student.completedPractices} detail="學生已同步的完成紀錄" /><Metric icon={<Target className="size-5 text-[#f05a3c]" />} label="重溫課題" value={student.reviewCount} detail={`共 ${student.totalMisses} 次錯題紀錄`} /><Metric icon={<Clock3 className="size-5 text-[#0e8b87]" />} label="每日目標" value={student.dailyTarget} detail="學生設定的每天課題數" /></section>
    <section className="mt-6 rounded-[28px] border border-[#172b3f]/12 bg-white p-6"><p className="font-mono text-[10px] font-bold tracking-[.15em] text-[#4f6eae]">P1–P6 COMPLETION</p><h2 className="mt-2 text-2xl font-black">各年級完成課題</h2><div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">{Object.entries(student.gradeCompletion).map(([grade, count]) => <div key={grade} className="rounded-2xl bg-[#f8f5ed] p-4"><small className="font-mono font-bold text-[#617286]">{grade}</small><strong className="mt-2 block text-3xl font-black text-[#0e8b87]">{count}</strong><small className="text-[#617286]">個完成課題</small></div>)}</div></section>
    <section className="mt-6 overflow-hidden rounded-[28px] border border-[#172b3f]/12 bg-white"><header className="border-b border-[#172b3f]/10 p-6"><p className="font-mono text-[10px] font-bold tracking-[.15em] text-[#f05a3c]">REVIEW RECORDS</p><h2 className="mt-2 text-2xl font-black">補強中的錯題</h2><p className="mt-2 text-sm text-[#617286]">只顯示學生自行同步的錯題摘要；教師不能修改或刪除任何資料。</p></header><div className="p-6">{student.document.reviewRecords.length ? <div className="divide-y divide-[#172b3f]/8">{student.document.reviewRecords.slice().sort((first, second) => second.updatedAt - first.updatedAt).map((record) => <div key={record.key} className="flex items-start justify-between gap-4 py-4"><div><small className="font-mono font-bold text-[#4f6eae]">{record.grade}</small><strong className="mt-1 block">{record.title}</strong><small className="mt-1 block text-[#617286]">最近更新：{formatDate(record.updatedAt)}</small></div><span className="rounded-full bg-[#fff0ed] px-3 py-1 text-xs font-bold text-[#b64229]">{record.misses} 次錯題</span></div>)}</div> : <p className="rounded-xl bg-[#f8f5ed] p-5 text-center text-sm text-[#617286]">暫時沒有需要補強的錯題。</p>}</div></section>
    <p className="mt-6 rounded-2xl border border-[#172b3f]/10 bg-white px-5 py-4 text-sm leading-6 text-[#617286]">此頁不顯示密碼、重設資料或其他帳戶安全資訊。Firebase 規則只容許指定教師帳戶唯讀學生學習快照。</p>
  </div></main>;
}

function Gate({ icon, title, detail, href, action, dark = false }: { icon: React.ReactNode; title: string; detail: string; href: string; action: string; dark?: boolean }) { return <main className={`grid min-h-screen place-items-center p-5 text-center ${dark ? "bg-[#172b3f] text-white" : "bg-[#f8f5ed] text-[#172b3f]"}`}><section className="max-w-md"><div className="mx-auto">{icon}</div><h1 className="mt-4 text-3xl font-black">{title}</h1><p className={`mt-3 leading-7 ${dark ? "text-white/70" : "text-[#617286]"}`}>{detail}</p><Link href={href} className={`mt-5 inline-block rounded-xl px-5 py-3 font-bold ${dark ? "bg-[#f6be5d] text-[#172b3f]" : "bg-[#172b3f] text-white"}`}>{action}</Link></section></main>; }
function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: React.ReactNode; detail: string }) { return <article className="rounded-2xl border border-[#172b3f]/10 bg-white p-5"><div className="flex items-center gap-2">{icon}<span className="font-mono text-[10px] font-bold tracking-[.12em] text-[#617286]">{label}</span></div><strong className="mt-3 block text-3xl font-black">{value}</strong><small className="mt-1 block text-[#617286]">{detail}</small></article>; }
