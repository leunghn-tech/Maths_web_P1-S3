import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, GraduationCap, KeyRound, LogIn, Mail, ShieldCheck, UserPlus, UserRound } from "lucide-react";
import { toast } from "sonner";
import { createUserWithEmailAndPassword, GoogleAuthProvider, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, signOut, updateProfile } from "firebase/auth";
import { useAuth } from "@/_core/hooks/useAuth";
import { firebaseAuth } from "@/lib/firebaseClient";
import { LEGACY_PORTAL_URL } from "@/lib/firebaseHostingTransition";
import { isFirebaseTeacherEmail } from "@/lib/firebaseTeacherAccess";

type Mode = "student-login" | "student-register" | "teacher";
const inputClass = "mt-2 w-full rounded-xl border border-[#172b3f]/14 bg-white px-4 py-3 text-[#172b3f] outline-none transition focus:border-[#f05a3c] focus:ring-2 focus:ring-[#f05a3c]/15";

export default function SignInPage() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("student-login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!loading && user) setLocation(user.role === "admin" ? "/teacher" : "/dashboard");
  }, [loading, setLocation, user]);

  const selectMode = (next: Mode) => {
    setMode(next); setPassword(""); setShowPassword(false);
    if (next !== "student-register") setDisplayName("");
  };

  const submitStudent = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;
    setPending(true);
    try {
      if (mode === "student-register") {
        const credential = await createUserWithEmailAndPassword(firebaseAuth, normalizedEmail, password);
        if (displayName.trim()) await updateProfile(credential.user, { displayName: displayName.trim().slice(0, 80) });
        toast.success("學生帳戶已建立，現在可以開始作答。");
      } else {
        await signInWithEmailAndPassword(firebaseAuth, normalizedEmail, password);
        toast.success("歡迎回來，已取回你的學習紀錄。");
      }
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      if (code.includes("email-already-in-use")) toast.error("這個電郵已建立帳戶，請改用學生登入。");
      else if (code.includes("invalid-credential")) toast.error("電郵或密碼不正確，請再試一次。");
      else if (code.includes("weak-password")) toast.error("密碼最少需要 6 個字元。");
      else toast.error("暫時未能處理帳戶，請稍後再試。");
    } finally { setPending(false); }
  };

  const resetPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) { toast.error("請先輸入你的學生電郵地址。"); return; }
    setPending(true);
    try { await sendPasswordResetEmail(firebaseAuth, normalizedEmail); toast.success("如這個電郵已有帳戶，重設密碼電郵已寄出。請查看收件箱。 "); }
    catch { toast.error("暫時未能寄出重設電郵，請稍後再試。"); }
    finally { setPending(false); }
  };

  const teacherSignIn = async () => {
    setPending(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const credential = await signInWithPopup(firebaseAuth, provider);
      if (!isFirebaseTeacherEmail(credential.user.email)) {
        await signOut(firebaseAuth);
        toast.error("這個 Google 帳戶未獲教師授權。請使用指定的教師帳戶。");
        return;
      }
      toast.success("教師身份已驗證。");
      setLocation("/teacher");
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      if (code.includes("popup-blocked")) { await signInWithRedirect(firebaseAuth, new GoogleAuthProvider()); return; }
      if (!code.includes("popup-closed-by-user")) toast.error("暫時未能使用 Google 教師登入，請稍後再試。");
    } finally { setPending(false); }
  };

  const teacher = mode === "teacher";
  return <main className={`min-h-screen px-5 py-8 sm:p-10 ${teacher ? "bg-[#172b3f] text-white" : "bg-[#f8f5ed] text-[#172b3f]"}`}>
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-white shadow-[12px_12px_0_rgba(23,43,63,.12)] md:grid-cols-[.88fr_1.12fr]">
      <aside className={`p-7 sm:p-10 ${teacher ? "bg-[#f6be5d] text-[#172b3f]" : "bg-[#172b3f] text-white"}`}>
        <Link href="/" className="font-bold hover:opacity-70">← 返回學習地圖</Link>
        <div className="mt-14"><span className={`grid size-14 place-items-center rounded-2xl ${teacher ? "bg-[#172b3f] text-[#f6be5d]" : "bg-[#f05a3c] text-white"}`}>{teacher ? <GraduationCap className="size-7" /> : <UserRound className="size-7" />}</span><p className={`mt-7 font-mono text-[11px] font-bold tracking-[.17em] ${teacher ? "text-[#6b4b10]" : "text-[#80d8cf]"}`}>{teacher ? "TEACHER GOOGLE ACCESS" : "STUDENT LEARNING"}</p><h1 className="mt-3 text-4xl font-black leading-tight">{teacher ? "教師專屬管理" : "用自己的帳戶學習"}</h1><p className={`mt-5 max-w-sm leading-7 ${teacher ? "text-[#533e15]" : "text-white/72"}`}>{teacher ? "只可使用已授權的 Google 教師帳戶，唯讀檢視學生已同步的學習摘要。" : "以電郵建立學生帳戶；完成星星、錯題與每日目標會安全備份到自己的帳戶。"}</p></div>
      </aside>
      <section className="p-7 sm:p-10"><div className="flex rounded-2xl bg-[#f3f0e8] p-1"><button type="button" onClick={() => selectMode("student-login")} className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold ${mode === "student-login" ? "bg-white text-[#172b3f] shadow-sm" : "text-[#617286]"}`}>學生登入</button><button type="button" onClick={() => selectMode("student-register")} className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold ${mode === "student-register" ? "bg-white text-[#172b3f] shadow-sm" : "text-[#617286]"}`}>學生註冊</button><button type="button" onClick={() => selectMode("teacher")} className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold ${teacher ? "bg-[#172b3f] text-white shadow-sm" : "text-[#617286]"}`}>教師</button></div>
        {teacher ? <section className="mt-9"><p className="font-mono text-[11px] font-bold tracking-[.15em] text-[#f05a3c]">TEACHER SIGN IN</p><h2 className="mt-3 text-3xl font-black text-[#172b3f]">使用 Google 教師帳戶</h2><p className="mt-3 text-sm leading-6 text-[#617286]">只有指定 Google 教師帳戶可查看學生的唯讀學習摘要。此登入不使用或保存教師密碼。</p><button type="button" onClick={() => void teacherSignIn()} disabled={pending} className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#172b3f] px-5 py-3.5 font-bold text-white disabled:opacity-60"><ShieldCheck className="size-5" />{pending ? "正在驗證…" : "使用 Google 教師帳戶登入"}</button><p className="mt-5 rounded-xl bg-[#f8f5ed] p-4 text-xs leading-5 text-[#617286]">教師只有讀取權限，不可建立、修改或刪除學生學習資料。</p></section> : <form onSubmit={(event) => void submitStudent(event)} className="mt-9 grid gap-4"><div><p className="font-mono text-[11px] font-bold tracking-[.15em] text-[#f05a3c]">{mode === "student-register" ? "CREATE STUDENT ACCOUNT" : "STUDENT SIGN IN"}</p><h2 className="mt-3 text-3xl font-black">{mode === "student-register" ? "建立學生帳戶" : "歡迎回來"}</h2><p className="mt-3 text-sm leading-6 text-[#617286]">{mode === "student-register" ? "密碼最少需要 6 個字元。密碼只由 Firebase Authentication 處理。" : "輸入註冊電郵和密碼，即可取回自己的學習紀錄。"}</p></div>{mode === "student-register" && <label><span className="text-xs font-bold text-[#617286]">學生暱稱（可選）</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={80} placeholder="例如：數學小探險家" className={inputClass} /></label>}<label><span className="text-xs font-bold text-[#617286]">學生電郵地址</span><input required autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="例如：family@example.com" className={inputClass} /></label><label><span className="text-xs font-bold text-[#617286]">密碼</span><span className="relative mt-2 block"><input required autoComplete={mode === "student-register" ? "new-password" : "current-password"} type={showPassword ? "text" : "password"} minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="輸入密碼" className={`${inputClass} mt-0 pr-14`} /><button type="button" aria-label={showPassword ? "隱藏密碼" : "顯示密碼"} onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-2 grid w-10 place-items-center text-[#617286]">{showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}</button></span></label><button disabled={pending} className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#f05a3c] px-5 py-3 font-bold text-white disabled:opacity-60">{mode === "student-register" ? <UserPlus className="size-4" /> : <LogIn className="size-4" />}{pending ? "正在處理…" : mode === "student-register" ? "建立學生帳戶" : "登入學生帳戶"}</button>{mode === "student-login" && <button type="button" disabled={pending} onClick={() => void resetPassword()} className="text-left text-sm font-bold text-[#0e8b87] underline decoration-[#0e8b87]/40 underline-offset-4"><Mail className="mr-1 inline size-4" />忘記密碼？以電郵重設</button>}</form>}
        {!teacher && <p className="mt-6 rounded-xl bg-[#f8f5ed] p-3 text-xs leading-5 text-[#617286]"><KeyRound className="mr-1 inline size-4 text-[#0e8b87]" />原有用戶名稱帳戶？舊帳戶紀錄搬遷仍在過渡期，可暫時到 <a className="font-bold text-[#0e8b87] underline" href={LEGACY_PORTAL_URL}>舊學習入口</a> 驗證後遷移；舊密碼不會被複製到 Firebase。</p>}
      </section>
    </div>
  </main>;
}
