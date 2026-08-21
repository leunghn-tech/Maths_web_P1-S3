/**
 * Maths Quest — P1「20 以內加減法」：像手帳上的一個學習站，提供低負荷、即時回饋的單題作答流程。
 */
import { Link } from "wouter";
import { useEffect, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, Check, Lightbulb, Moon, RotateCcw, Sparkles, Star, Sun, Trophy, Volume2, VolumeX, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { playCelebrationSound, playCorrectSound, playWrongSound } from "@/lib/sounds";
import { markPracticeCompleted } from "@/lib/practiceCompletion";

type Question = {
  first: number;
  operator: "+" | "−";
  second: number;
  answer: number;
  story: string;
  color: string;
};

const questions: Question[] = [
  { first: 7, operator: "+", second: 5, answer: 12, story: "7 個積木，再放上 5 個。", color: "#f05a3c" },
  { first: 13, operator: "−", second: 4, answer: 9, story: "13 顆星星，拿走 4 顆。", color: "#0e8b87" },
  { first: 8, operator: "+", second: 6, answer: 14, story: "8 支鉛筆，再添 6 支。", color: "#c8811e" },
  { first: 16, operator: "−", second: 7, answer: 9, story: "16 粒珠子，送出 7 粒。", color: "#4f6eae" },
  { first: 9, operator: "+", second: 9, answer: 18, story: "9 朵花，再種 9 朵。", color: "#b15979" },
];

type ResultState = "idle" | "correct" | "incorrect";

function CountTokens({ question }: { question: Question }) {
  const total = question.operator === "+" ? question.first + question.second : question.first;
  const removed = question.operator === "−" ? question.second : 0;

  return (
    <div className="mq-token-row" aria-label={question.story}>
      {Array.from({ length: total }).map((_, index) => (
        <span key={index} className={`mq-token ${index >= total - removed ? "mq-token-removed" : ""}`} style={{ backgroundColor: question.color }} />
      ))}
    </div>
  );
}

export default function P1Practice() {
  const { theme, toggleTheme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<ResultState>("idle");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [streak, setStreak] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [wrongIndices, setWrongIndices] = useState<number[]>([]);
  const [reviewMode, setReviewMode] = useState(false);

  const activeIndices = reviewMode ? wrongIndices : questions.map((_, index) => index);
  const question = questions[activeIndices[currentIndex]];
  const progress = Math.round(((currentIndex + (result === "correct" ? 1 : 0)) / activeIndices.length) * 100);
  const stars = score >= activeIndices.length ? 3 : score >= Math.ceil(activeIndices.length * 0.6) ? 2 : score >= 1 ? 1 : 0;
  const timeLabel = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  useEffect(() => {
    if (finished) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [finished]);

  const addDigit = (digit: string) => {
    if (result !== "idle" || answer.length >= 2) return;
    setAnswer((previous) => `${previous}${digit}`);
  };

  const checkAnswer = () => {
    if (!answer || result !== "idle") return;
    if (Number(answer) === question.answer) {
      setResult("correct");
      setScore((previous) => previous + 1);
      setStreak((previous) => previous + 1);
      if (soundEnabled) playCorrectSound();
    } else {
      setResult("incorrect");
      setStreak(0);
      setWrongIndices((indices) => indices.includes(activeIndices[currentIndex]) ? indices : [...indices, activeIndices[currentIndex]]);
      if (soundEnabled) playWrongSound();
    }
  };

  const nextQuestion = () => {
    if (currentIndex === activeIndices.length - 1) {
      setFinished(true);
      if (!reviewMode) markPracticeCompleted("p1-add-subtract");
      if (soundEnabled) playCelebrationSound();
      return;
    }
    setCurrentIndex((previous) => previous + 1);
    setAnswer("");
    setResult("idle");
  };

  const restart = () => {
    setCurrentIndex(0);
    setAnswer("");
    setResult("idle");
    setScore(0);
    setFinished(false);
    setSeconds(0);
    setStreak(0);
    setReviewMode(false);
  };

  const startWrongReview = () => {
    setCurrentIndex(0);
    setAnswer("");
    setResult("idle");
    setScore(0);
    setSeconds(0);
    setStreak(0);
    setFinished(false);
    setReviewMode(true);
  };

  return (
    <div className="mq-practice min-h-screen bg-[#f8f5ed] text-[#172b3f] dark:bg-[#101b27] dark:text-[#f4f7f4]">
      <header className="mq-practice-header sticky top-0 z-50 border-b border-[#172b3f]/10 bg-[#f8f5ed]/92 backdrop-blur-xl dark:border-white/10 dark:bg-[#111c28]/92">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 lg:px-8">
          <Link href="/" className="group flex items-center gap-3" aria-label="返回 Maths Quest 首頁">
            <span className="grid size-10 place-items-center rounded-[14px] bg-[#f05a3c] shadow-[0_6px_0_#c84932] transition-transform duration-200 group-hover:-translate-y-0.5">
              <img src="/manus-storage/maths-quest-logo_cf7e4a6a.png" alt="" className="size-6 brightness-0 invert" />
            </span>
            <span className="leading-none"><strong className="block text-[16px] font-extrabold tracking-[-0.04em]">Maths Quest</strong><small className="mt-1 block font-mono text-[9px] font-bold tracking-[0.14em] text-[#f05a3c]">P1 練習站 · 01</small></span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden font-mono text-[11px] font-bold tracking-[0.1em] text-[#617286] dark:text-[#b7c8ce] sm:block">20 以內加減法</span>
            <button onClick={() => setSoundEnabled((enabled) => !enabled)} className="mq-theme-switch grid size-10 place-items-center rounded-full border border-[#172b3f]/15 bg-white/70 text-[#172b3f] transition hover:-translate-y-0.5 hover:border-[#f05a3c] hover:text-[#f05a3c] dark:border-white/15 dark:bg-white/10 dark:text-white" aria-label={soundEnabled ? "關閉答題音效" : "開啟答題音效"} title={soundEnabled ? "答題音效：開啟" : "答題音效：關閉"}>
              {soundEnabled ? <Volume2 className="size-[17px]" /> : <VolumeX className="size-[17px]" />}
            </button>
            <button onClick={toggleTheme} className="mq-theme-switch grid size-10 place-items-center rounded-full border border-[#172b3f]/15 bg-white/70 text-[#172b3f] transition hover:-translate-y-0.5 hover:border-[#f05a3c] hover:text-[#f05a3c] dark:border-white/15 dark:bg-white/10 dark:text-white" aria-label={theme === "light" ? "切換至深色模式" : "切換至淺色模式"}>
              {theme === "light" ? <Moon className="size-[17px]" /> : <Sun className="size-[18px]" />}
            </button>
            <Link href="/#path" className="mq-library-link inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-3 py-2 text-sm font-extrabold transition-colors hover:border-[#f05a3c] hover:text-[#f05a3c] dark:border-white/15"><ArrowLeft className="size-4" /><span>返回題目庫</span></Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-5 py-8 lg:px-8 lg:py-10">
        <div className="mq-route-ruler" aria-hidden="true"><span>起點</span><i /><span>P1.01</span><i /><span>解題站</span></div>
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.16em] text-[#f05a3c]"><span className="size-2 rounded-full bg-[#f05a3c]" /> P1 · 學習站 01</div>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.055em] sm:text-4xl">20 以內的加減法</h1>
            <p className="mt-2 text-sm leading-6 text-[#617286] dark:text-[#b7c8ce]">看清題目、輸入答案，逐題建立你的數感。</p>
          </div>
          <div className="mq-progress-label rounded-2xl border border-[#172b3f]/10 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-[#172737]">
            <span className="font-mono text-[10px] font-bold tracking-[0.12em] text-[#f05a3c]">今日學習路徑</span>
            <p className="mt-1 font-extrabold">{reviewMode ? "重溫" : "已完成"} {Math.min(currentIndex + (result === "correct" ? 1 : 0), activeIndices.length)} / {activeIndices.length} 題 <span className="mx-1 text-[#f05a3c]">·</span> {timeLabel}</p>
          </div>
        </div>

        <div className="mq-practice-grid grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="mq-practice-sidebar order-2 lg:order-1">
            <div className="rounded-[24px] border border-[#172b3f]/10 bg-[#172b3f] p-5 text-white shadow-[0_10px_0_#0e1d2a] dark:border-white/10 dark:bg-[#1b3042] dark:shadow-[0_10px_0_#0b131d]">
              <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-[#f6be5d]">本次任務</p>
              <h2 className="mt-3 text-xl font-black leading-7">{reviewMode ? "逐題重溫錯題。" : "完成 5 個計算站。"}</h2>
              <p className="mt-3 text-sm leading-6 text-white/75">{reviewMode ? "這次只會出現你剛才答錯的題目。" : "每題都可以慢慢想。答錯了也會看到提示，再試一次。"}</p>
              <div className="mq-mission-steps mt-5" aria-label="五個題目的完成進度">
                {activeIndices.map((_, index) => <span key={index} className={index < currentIndex + (result === "correct" ? 1 : 0) ? "mq-mission-step-done" : index === currentIndex ? "mq-mission-step-current" : ""}>{index + 1}</span>)}
              </div>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#f05a3c] transition-[width] duration-500" style={{ width: `${progress}%` }} /></div>
              <div className="mt-3 flex justify-between font-mono text-[10px] font-bold text-white/65"><span>PROGRESS</span><span>{progress}%</span></div>
              <div className="mq-stars mt-5" aria-label={`本次已獲得 ${stars} 顆星`}>
                {[1, 2, 3].map((star) => <Star key={star} className={`size-5 ${star <= stars ? "mq-star-earned fill-[#f6be5d] text-[#f6be5d]" : "text-white/20"}`} />)}
                <span className="ml-2 text-xs font-extrabold text-white/75">連續答對 {streak} 題</span>
              </div>
            </div>
            <div className="mq-tip mt-5 rounded-2xl border border-[#172b3f]/10 bg-[#fff3e8] p-4 dark:border-white/10 dark:bg-[#3a2f2b]">
              <div className="flex items-center gap-2 text-[#f05a3c]"><Lightbulb className="size-4" /><span className="font-mono text-[10px] font-bold tracking-[0.12em]">小提示</span></div>
              <p className="mt-2 text-sm font-bold leading-6 text-[#744230] dark:text-[#ffe6d6]">加法是「合起來」，減法是「拿走」或「剩下」。</p>
            </div>
          </aside>

          <section className="mq-practice-card order-1 min-h-[540px] overflow-hidden rounded-[28px] border border-[#172b3f]/10 bg-white p-5 shadow-[0_16px_35px_rgba(23,43,63,0.07)] dark:border-white/10 dark:bg-[#172737] md:p-8 lg:order-2">
            {!finished ? (
              <>
                <div className="mq-question-head relative flex items-center justify-between border-b border-[#172b3f]/10 pb-5 dark:border-white/10">
                  <div><p className="font-mono text-[10px] font-bold tracking-[0.14em] text-[#f05a3c]">第 {currentIndex + 1} 題 · 計算站 {String(currentIndex + 1).padStart(2, "0")}</p><p className="mt-1 text-sm font-bold text-[#617286] dark:text-[#b7c8ce]">現在請看看圖示，算出答案。</p></div>
                  <span className="grid size-10 place-items-center rounded-full bg-[#fff0e9] font-mono text-xs font-black text-[#f05a3c] dark:bg-[#3a2f2b]">{currentIndex + 1}</span>
                </div>

                <div className="flex min-h-[220px] flex-col items-center justify-center py-8 text-center">
                  <div className="mq-question-note"><span className="font-mono">算式提示</span><span>{question.story}</span></div>
                  <CountTokens question={question} />
                  <div className="mt-7 flex items-center justify-center gap-3 font-mono text-[clamp(3.5rem,8vw,5.5rem)] font-medium leading-none tracking-[-0.08em]">
                    <span>{question.first}</span><span className="text-[#f05a3c]">{question.operator}</span><span>{question.second}</span><span className="text-[#617286] dark:text-[#b7c8ce]">=</span>
                    <span className={`mq-answer-input grid min-w-[92px] place-items-center rounded-2xl border-2 ${result === "correct" ? "mq-answer-correct border-[#0e8b87] text-[#0e8b87]" : result === "incorrect" ? "mq-answer-incorrect border-[#f05a3c] text-[#f05a3c]" : "border-[#172b3f]/15 text-[#172b3f] dark:border-white/20 dark:text-white"}`}>{answer || "?"}</span>
                  </div>
                </div>

                {result !== "idle" && (
                  <div className={`mq-feedback mb-5 flex items-start gap-3 rounded-2xl border p-4 ${result === "correct" ? "border-[#0e8b87]/25 bg-[#e8f5f2] text-[#135d59] dark:bg-[#173d42] dark:text-[#c9f4ec]" : "border-[#f05a3c]/25 bg-[#fff0e9] text-[#8c3f2e] dark:bg-[#3a2f2b] dark:text-[#ffe2d8]"}`}>
                    <span className={`grid size-8 shrink-0 place-items-center rounded-full ${result === "correct" ? "bg-[#0e8b87]" : "bg-[#f05a3c]"} text-white`}>{result === "correct" ? <Check className="size-4" /> : <X className="size-4" />}</span>
                    <div><p className="font-extrabold">{result === "correct" ? "答對了！你找到了正確答案。" : `接近了，正確答案是 ${question.answer}。`}</p><p className="mt-1 text-sm leading-6 opacity-80">{result === "correct" ? "準備好就到下一個學習站。" : "試著用上面的圓點重新數一次。"}</p></div>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px]">
                  <div className="mq-keypad grid grid-cols-5 gap-2" aria-label="數字鍵盤">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit) => <button key={digit} onClick={() => addDigit(String(digit))} disabled={result !== "idle"} className="mq-key rounded-xl border border-[#172b3f]/10 bg-[#fcfbf7] py-3 text-lg font-black transition disabled:cursor-default disabled:opacity-45 dark:border-white/10 dark:bg-[#1c3041]">{digit}</button>)}
                    <button onClick={() => setAnswer("")} disabled={result !== "idle" || !answer} className="mq-key col-span-2 rounded-xl border border-[#172b3f]/10 bg-[#fcfbf7] py-3 text-sm font-extrabold transition disabled:cursor-default disabled:opacity-45 dark:border-white/10 dark:bg-[#1c3041]">清除</button>
                    <button onClick={() => setAnswer((value) => value.slice(0, -1))} disabled={result !== "idle" || !answer} className="mq-key col-span-3 rounded-xl border border-[#172b3f]/10 bg-[#fcfbf7] py-3 text-sm font-extrabold transition disabled:cursor-default disabled:opacity-45 dark:border-white/10 dark:bg-[#1c3041]">刪除一個數字</button>
                  </div>
                  <div className="flex flex-col justify-end gap-2">
                    {result === "idle" ? <button onClick={checkAnswer} disabled={!answer} className="mq-start min-h-14 rounded-2xl bg-[#f05a3c] px-5 text-sm font-extrabold text-white shadow-[0_5px_0_#c84932] transition disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none">檢查答案</button> : result === "incorrect" ? <button onClick={() => { setAnswer(""); setResult("idle"); }} className="mq-start min-h-14 rounded-2xl bg-[#f05a3c] px-5 text-sm font-extrabold text-white shadow-[0_5px_0_#c84932] transition"><RotateCcw className="mr-1 inline size-4" /> 再試一次</button> : <button onClick={nextQuestion} className="mq-start min-h-14 rounded-2xl bg-[#f05a3c] px-5 text-sm font-extrabold text-white shadow-[0_5px_0_#c84932] transition">{currentIndex === activeIndices.length - 1 ? "查看結果" : "下一題"} <ArrowRight className="ml-1 inline size-4" /></button>}
                    <p className="text-center font-mono text-[10px] font-bold tracking-[0.08em] text-[#8390a0] dark:text-[#9eb4bd]">按數字輸入答案</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
                <span className="grid size-20 place-items-center rounded-[26px] bg-[#fff0e9] text-[#f05a3c] shadow-[0_10px_0_rgba(240,90,60,0.16)] dark:bg-[#3a2f2b]"><Trophy className="size-10" /></span>
                <div className="mq-celebration-burst" aria-hidden="true">{Array.from({ length: 12 }).map((_, index) => <span key={index} style={{ "--burst": `${index * 30}deg` } as CSSProperties} />)}</div>
                <p className="mt-7 font-mono text-[11px] font-bold tracking-[0.16em] text-[#f05a3c]">{reviewMode ? "錯題重溫完成" : "完成學習站"}</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">{reviewMode ? "你已重新走完錯題路徑！" : "你完成了這段路徑！"}</h2>
                <div className="mq-finish-stars mt-4">{[1, 2, 3].map((star) => <Star key={star} className={`size-7 ${star <= stars ? "fill-[#f6be5d] text-[#f6be5d]" : "text-[#e8e3d9] dark:text-[#2a4051]"}`} />)}</div>
                <p className="mt-3 max-w-sm text-[15px] leading-7 text-[#617286] dark:text-[#b7c8ce]">這次答對了 {score} / {activeIndices.length} 題，用時 {timeLabel}。每一題都是更熟練的一步。</p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">{!reviewMode && wrongIndices.length > 0 && <button onClick={startWrongReview} className="mq-review inline-flex items-center gap-2 rounded-full border border-[#f05a3c]/40 px-5 py-3 text-sm font-extrabold text-[#f05a3c] transition"><Sparkles className="size-4" /> 重溫 {wrongIndices.length} 題錯題</button>}<button onClick={restart} className="mq-start inline-flex items-center gap-2 rounded-full bg-[#f05a3c] px-5 py-3 text-sm font-extrabold text-white shadow-[0_4px_0_#c84932] transition"><RotateCcw className="size-4" /> 再做一次</button><Link href="/#path" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-5 py-3 text-sm font-extrabold dark:border-white/15">返回題目庫 <ArrowRight className="size-4" /></Link></div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
