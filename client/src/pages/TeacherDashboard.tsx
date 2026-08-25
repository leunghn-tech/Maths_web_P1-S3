import { useMemo, useState, type FormEvent } from "react";
import { Link } from "wouter";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Clock3,
  GraduationCap,
  KeyRound,
  LogOut,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { saveLocalSession } from "@/lib/localSession";
import { sortTeacherStudents, type StudentSort } from "@/lib/teacherStudentSort";
import { filterStudentsByRegistration, sortStudentsByRegistration, type RegistrationPeriod, type RegistrationSort } from "@/lib/teacherStudentRegistration";

function formatDate(value: Date | string | null) {
  return value ? new Intl.DateTimeFormat("zh-HK", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "尚未同步";
}

export default function TeacherDashboard() {
  const { user, loading, logout } = useAuth();
  const utils = trpc.useUtils();
  const students = trpc.teacher.managedStudents.useQuery(undefined, { enabled: user?.role === "admin" });
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<StudentSort | RegistrationSort>("recentSync");
  const [registrationPeriod, setRegistrationPeriod] = useState<RegistrationPeriod>("all");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const matching = !keyword
      ? students.data ?? []
      : (students.data ?? []).filter((student) => [student.nickname, student.accountName, student.username].some((value) => value?.toLowerCase().includes(keyword)));
    const byRegistrationPeriod = filterStudentsByRegistration(matching, registrationPeriod);
    return sort === "registeredNewest" || sort === "registeredOldest" ? sortStudentsByRegistration(byRegistrationPeriod, sort) : sortTeacherStudents(byRegistrationPeriod, sort);
  }, [registrationPeriod, search, sort, students.data]);

  const changePassword = trpc.auth.changeTeacherPassword.useMutation({
    onSuccess: async (data) => {
      saveLocalSession(data.sessionToken);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await utils.auth.me.invalidate();
      toast.success("教師密碼已更新；其他舊登入已安全登出。");
    },
    onError: (error) => toast.error(error.message),
  });

  const submitPassword = (event: FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("兩次輸入的新密碼不一致。");
      return;
    }
    changePassword.mutate({ currentPassword, newPassword });
  };

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#172b3f] font-mono font-bold text-white">正在驗證教師帳戶…</main>;
  if (!user) return <Gate icon={<GraduationCap className="mx-auto size-12 text-[#f6be5d]" />} title="需要教師登入" href="/sign-in" action="前往登入" dark />;
  if (user.role !== "admin") return <Gate icon={<ShieldCheck className="mx-auto size-12 text-[#f05a3c]" />} title="教師限定頁面" href="/account" action="返回學生帳戶" />;

  const accountName = user.localUsername || "admin";

  return (
    <main className="min-h-screen bg-[#edf1f7] p-5 text-[#172b3f] sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-start justify-between gap-5 rounded-[28px] bg-[#172b3f] p-7 text-white">
          <div>
            <p className="font-mono text-[11px] font-bold tracking-[.17em] text-[#f6be5d]">MATHS QUEST · TEACHER CONSOLE</p>
            <h1 className="mt-3 text-4xl font-black">學生管理</h1>
            <p className="mt-3 text-white/70">搜尋及排序學生，查看唯讀的學習摘要、準確度、完成紀錄和補強重點。</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="rounded-xl border border-white/20 bg-white/8 px-4 py-2.5 text-right">
              <p className="font-mono text-[9px] font-bold tracking-[.14em] text-white/55">目前登入帳戶</p>
              <strong className="mt-1 block text-sm">@{accountName}</strong>
              <p className="mt-2 font-mono text-[9px] font-bold tracking-[.12em] text-white/55">最近成功登入</p>
              <time dateTime={new Date(user.lastSignedIn).toISOString()} className="mt-1 block text-xs text-white/85">{formatDate(user.lastSignedIn)}</time>
            </div>
            <Link href="/" className="rounded-xl border border-white/20 px-4 py-3 text-sm font-bold">學習地圖</Link>
            <button type="button" onClick={() => void logout()} aria-label={`登出目前帳戶 ${accountName}`} className="inline-flex items-center gap-2 rounded-xl bg-[#f6be5d] px-4 py-3 text-sm font-bold text-[#172b3f]"><LogOut className="size-4" />登出</button>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <Metric icon={<UsersRound className="size-5 text-[#4f6eae]" />} label="REGISTERED STUDENTS" value={students.data?.length ?? "—"} detail="已註冊學生帳戶" />
          <Metric icon={<BookOpen className="size-5 text-[#0e8b87]" />} label="SYNC AWARE" value={students.data?.filter((student) => student.lastSyncedAt).length ?? "—"} detail="已有雲端同步紀錄" />
          <Metric icon={<GraduationCap className="size-5 text-[#f05a3c]" />} label="TEACHER ACCOUNT" value={`@${accountName}`} detail="目前登入的教師帳戶" />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.65fr]">
          <form onSubmit={submitPassword} className="rounded-[28px] border border-[#172b3f]/12 bg-white p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#f6be5d] text-[#172b3f]"><KeyRound className="size-5" /></span>
              <div><p className="font-mono text-[10px] font-bold tracking-[.14em] text-[#4f6eae]">ACCOUNT SECURITY</p><h2 className="mt-1 text-xl font-black">修改教師密碼</h2></div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#617286]">目前登入帳戶為 @{accountName}。首次登入後建議立即更改預設密碼；更新後，其他瀏覽器或裝置上的舊登入會自動失效。</p>
            <PasswordInput label="目前密碼" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />
            <PasswordInput label="新密碼" value={newPassword} onChange={setNewPassword} autoComplete="new-password" minLength={6} />
            <PasswordInput label="確認新密碼" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" minLength={6} />
            <button disabled={changePassword.isPending} className="mt-5 w-full rounded-xl bg-[#172b3f] px-5 py-3 font-bold text-white disabled:opacity-60">{changePassword.isPending ? "正在更新…" : "安全更新教師密碼"}</button>
          </form>

          <section className="overflow-hidden rounded-[28px] border border-[#172b3f]/12 bg-white">
            <div className="border-b border-[#172b3f]/10 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div><p className="font-mono text-[10px] font-bold tracking-[.15em] text-[#4f6eae]">STUDENT DIRECTORY</p><h2 className="mt-2 text-2xl font-black">已註冊學生</h2></div>
                <span className="rounded-full bg-[#edf1f7] px-3 py-2 text-xs font-bold">{filteredStudents.length}/{students.data?.length ?? 0} 位</span>
              </div>
              <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
                <label className="relative block"><Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#617286]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜尋學生暱稱、帳戶名稱或用戶名稱" className="w-full rounded-xl border border-[#172b3f]/14 bg-[#fffdf8] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#4f6eae] focus:ring-2 focus:ring-[#4f6eae]/15" /></label>
                <label className="flex items-center gap-2 rounded-xl border border-[#172b3f]/14 bg-[#fffdf8] px-3 text-sm font-bold text-[#617286]"><span className="whitespace-nowrap">排序</span><select value={sort} onChange={(event) => setSort(event.target.value as StudentSort | RegistrationSort)} className="min-w-36 bg-transparent py-3 outline-none"><option value="recentSync">最近同步</option><option value="completion">完成課題最多</option><option value="registeredNewest">註冊日期：最新優先</option><option value="registeredOldest">註冊日期：最早優先</option></select></label>
                <label className="flex items-center gap-2 rounded-xl border border-[#172b3f]/14 bg-[#fffdf8] px-3 text-sm font-bold text-[#617286]"><CalendarDays className="size-4" /><select aria-label="按註冊日期篩選學生" value={registrationPeriod} onChange={(event) => setRegistrationPeriod(event.target.value as RegistrationPeriod)} className="min-w-28 bg-transparent py-3 outline-none"><option value="all">所有註冊日期</option><option value="last7">最近 7 日</option><option value="last30">最近 30 日</option><option value="thisYear">今年註冊</option></select></label>
              </div>
            </div>
            {students.isLoading ? <p className="p-10 text-center text-[#617286]">正在讀取學生…</p> : filteredStudents.length ? <div className="divide-y divide-[#172b3f]/8">{filteredStudents.map((student) => <Link key={student.userId} href={`/teacher/students/${student.userId}`} className="grid gap-4 p-5 transition hover:bg-[#f8f5ed] sm:grid-cols-[1.15fr_.75fr_.9fr_auto] sm:items-center"><div><strong className="block text-lg">{student.nickname || student.accountName || student.username || "學生帳戶"}</strong><small className="font-mono text-[#617286]">@{student.username || "local-student"}</small><small className="mt-1 block text-[#617286]">註冊：{formatDate(student.createdAt)}</small></div><div><strong className="block text-2xl font-black text-[#0e8b87]">{student.accuracy === null ? "—" : `${student.accuracy}%`}</strong><small className="mt-1 block text-[#617286]">準確度 · {student.correctAnswers}/{student.answeredQuestions} 題正確</small><small className="mt-1 block text-[#617286]">完成 {student.completedPractices} 個課題</small></div><div className="flex flex-col gap-1 text-sm text-[#617286]"><span className="flex items-center gap-2"><Clock3 className="size-4 text-[#0e8b87]" />{formatDate(student.lastSyncedAt)}</span></div><ArrowUpRight className="size-5 text-[#4f6eae]" aria-label="查看學生詳情" /></Link>)}</div> : <p className="p-10 text-center text-[#617286]">{search || registrationPeriod !== "all" ? "找不到符合目前搜尋或註冊日期篩選的學生。" : "暫時沒有學生註冊。學生建立帳戶後會自動出現在這裡。"}</p>}
          </section>
        </section>
      </div>
    </main>
  );
}

function PasswordInput({ label, value, onChange, autoComplete, minLength }: { label: string; value: string; onChange: (value: string) => void; autoComplete: string; minLength?: number }) {
  return <label className="mt-4 block"><span className="text-xs font-bold text-[#617286]">{label}</span><input required type="password" autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} minLength={minLength} maxLength={128} className="mt-2 w-full rounded-xl border border-[#172b3f]/14 px-4 py-3 outline-none focus:border-[#f05a3c]" /></label>;
}

function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: React.ReactNode; detail: string }) {
  return <div className="rounded-2xl border border-[#172b3f]/10 bg-white p-5"><div className="flex items-center gap-2">{icon}<span className="font-mono text-[10px] font-bold tracking-[.12em] text-[#617286]">{label}</span></div><strong className="mt-3 block truncate text-3xl font-black">{value}</strong><small className="mt-1 block text-[#617286]">{detail}</small></div>;
}

function Gate({ icon, title, href, action, dark = false }: { icon: React.ReactNode; title: string; href: string; action: string; dark?: boolean }) {
  return <main className={`grid min-h-screen place-items-center p-5 text-center ${dark ? "bg-[#172b3f] text-white" : "bg-[#f8f5ed] text-[#172b3f]"}`}><section>{icon}<h1 className="mt-4 text-3xl font-black">{title}</h1><Link href={href} className={`mt-5 inline-block rounded-xl px-5 py-3 font-bold ${dark ? "bg-[#f6be5d] text-[#172b3f]" : "bg-[#172b3f] text-white"}`}>{action}</Link></section></main>;
}
