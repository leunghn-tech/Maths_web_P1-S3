import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { GraduationCap, KeyRound, LogIn, ShieldCheck, UserPlus, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

type Mode = "student-login" | "student-register" | "teacher";

export default function SignInPage() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const [mode, setMode] = useState<Mode>("student-login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const afterLogin = async (destination: string) => { await utils.auth.me.invalidate(); setLocation(destination); };
  const studentLogin = trpc.auth.loginStudent.useMutation({ onSuccess: () => void afterLogin("/account"), onError: (error) => toast.error(error.message) });
  const studentRegister = trpc.auth.registerStudent.useMutation({ onSuccess: () => void afterLogin("/account"), onError: (error) => toast.error(error.message) });
  const teacherLogin = trpc.auth.loginTeacher.useMutation({ onSuccess: () => void afterLogin("/teacher"), onError: (error) => toast.error(error.message) });

  useEffect(() => { if (user) setLocation(user.role === "admin" ? "/teacher" : "/account"); }, [setLocation, user]);
  const pending = studentLogin.isPending || studentRegister.isPending || teacherLogin.isPending;
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === "teacher") teacherLogin.mutate({ username, password });
    else if (mode === "student-register") studentRegister.mutate({ username, password, displayName });
    else studentLogin.mutate({ username, password });
  };

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#f8f5ed] font-mono font-bold text-[#172b3f]">正在準備登入…</main>;
  const isTeacher = mode === "teacher";
  return <main className={`min-h-screen px-5 py-8 sm:p-10 ${isTeacher ? "bg-[#172b3f] text-white" : "bg-[#f8f5ed] text-[#172b3f]"}`}><div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-white shadow-[12px_12px_0_rgba(23,43,63,.12)] md:grid-cols-[.88fr_1.12fr]"><aside className={`p-7 sm:p-10 ${isTeacher ? "bg-[#f6be5d] text-[#172b3f]" : "bg-[#172b3f] text-white"}`}><Link href="/" className="font-bold hover:opacity-70">← 返回學習地圖</Link><div className="mt-14"><span className={`grid size-14 place-items-center rounded-2xl ${isTeacher ? "bg-[#172b3f] text-[#f6be5d]" : "bg-[#f05a3c] text-white"}`}>{isTeacher ? <GraduationCap className="size-7" /> : <UserRound className="size-7" />}</span><p className={`mt-7 font-mono text-[11px] font-bold tracking-[.17em] ${isTeacher ? "text-[#6b4b10]" : "text-[#80d8cf]"}`}>{isTeacher ? "TEACHER CONSOLE" : "STUDENT LEARNING"}</p><h1 className="mt-3 text-4xl font-black leading-tight">{isTeacher ? "教師專屬管理" : "用自己的帳戶學習"}</h1><p className={`mt-5 max-w-sm leading-7 ${isTeacher ? "text-[#533e15]" : "text-white/72"}`}>{isTeacher ? "登入後可檢視已註冊學生的暱稱、班級、同步時間與學習進度。" : "學生不用 Google 帳戶。註冊後，完成星星、錯題與每日目標會安全備份。"}</p></div></aside><section className="p-7 sm:p-10"><div className="flex rounded-2xl bg-[#f3f0e8] p-1"><button onClick={() => setMode("student-login")} className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold ${mode === "student-login" ? "bg-white text-[#172b3f] shadow-sm" : "text-[#617286]"}`}>學生登入</button><button onClick={() => setMode("student-register")} className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold ${mode === "student-register" ? "bg-white text-[#172b3f] shadow-sm" : "text-[#617286]"}`}>學生註冊</button><button onClick={() => setMode("teacher")} className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold ${mode === "teacher" ? "bg-[#172b3f] text-white shadow-sm" : "text-[#617286]"}`}>教師</button></div><div className="mt-9"><p className="font-mono text-[11px] font-bold tracking-[.15em] text-[#f05a3c]">{isTeacher ? "TEACHER SIGN IN" : mode === "student-register" ? "CREATE STUDENT ACCOUNT" : "STUDENT SIGN IN"}</p><h2 className="mt-3 text-3xl font-black">{isTeacher ? "教師登入" : mode === "student-register" ? "建立學生帳戶" : "歡迎回來"}</h2><p className="mt-3 text-sm leading-6 text-[#617286]">{isTeacher ? "請使用教師專屬帳戶登入。學生帳戶不可開啟教師管理頁。" : mode === "student-register" ? "用戶名稱只可使用英文小寫字母、數字與 . _ -；密碼最少 6 個字元。" : "輸入你的學生帳戶，即可取回同步的學習紀錄。"}</p></div><form onSubmit={submit} className="mt-7 grid gap-4">{mode === "student-register" && <label><span className="text-xs font-bold text-[#617286]">學生暱稱</span><input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={80} placeholder="例如：數學小探險家" className="mt-2 w-full rounded-xl border border-[#172b3f]/14 px-4 py-3 outline-none focus:border-[#f05a3c] focus:ring-2 focus:ring-[#f05a3c]/15" /></label>}<label><span className="text-xs font-bold text-[#617286]">用戶名稱</span><input required autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value.toLowerCase())} placeholder={isTeacher ? "教師帳戶" : "例如：maths.chan"} className="mt-2 w-full rounded-xl border border-[#172b3f]/14 px-4 py-3 font-mono outline-none focus:border-[#f05a3c] focus:ring-2 focus:ring-[#f05a3c]/15" /></label><label><span className="text-xs font-bold text-[#617286]">密碼</span><input required autoComplete={mode === "student-register" ? "new-password" : "current-password"} type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={mode === "student-register" ? 6 : 1} maxLength={128} placeholder="輸入密碼" className="mt-2 w-full rounded-xl border border-[#172b3f]/14 px-4 py-3 outline-none focus:border-[#f05a3c] focus:ring-2 focus:ring-[#f05a3c]/15" /></label><button disabled={pending} className={`mt-2 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold text-white disabled:opacity-60 ${isTeacher ? "bg-[#172b3f]" : "bg-[#f05a3c]"}`}>{isTeacher ? <ShieldCheck className="size-4" /> : mode === "student-register" ? <UserPlus className="size-4" /> : <LogIn className="size-4" />}{pending ? "正在處理…" : isTeacher ? "登入教師管理頁" : mode === "student-register" ? "建立學生帳戶" : "登入學生帳戶"}</button></form><p className="mt-6 flex items-start gap-2 rounded-xl bg-[#f8f5ed] p-3 text-xs leading-5 text-[#617286]"><KeyRound className="mt-0.5 size-4 shrink-0 text-[#0e8b87]" />帳密只在伺服器端以安全雜湊方式驗證；密碼不會被寫入前端或公開程式碼。</p></section></div></main>;
}
