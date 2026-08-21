/**
 * Maths Quest — P2「九九乘法表」：以分組點陣與選擇題協助學生把重複加法連結成乘法。
 */
import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Check, Lightbulb, Moon, RotateCcw, Star, Sun, Trophy, Volume2, VolumeX, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { playCelebrationSound, playCorrectSound, playWrongSound } from "@/lib/sounds";
import { markPracticeCompleted } from "@/lib/practiceCompletion";

type OperationMode = "multiply" | "divide" | "mixed";
type MultiplicationQuestion = { groups: number; each: number; expression: string; answer: number; choices: number[]; note: string; color: string };
type ResultState = "idle" | "correct" | "incorrect";

const questionSets: Record<OperationMode, MultiplicationQuestion[]> = {
  multiply: [
    { groups: 3, each: 4, expression: "3 × 4", answer: 12, choices: [7, 12, 14, 16], note: "3 組，每組有 4 個。", color: "#0e8b87" },
    { groups: 5, each: 2, expression: "5 × 2", answer: 10, choices: [8, 10, 12, 15], note: "5 組，每組有 2 個。", color: "#c8811e" },
    { groups: 4, each: 3, expression: "4 × 3", answer: 12, choices: [9, 10, 12, 14], note: "4 組，每組有 3 個。", color: "#4f6eae" },
    { groups: 2, each: 6, expression: "2 × 6", answer: 12, choices: [8, 10, 12, 14], note: "2 組，每組有 6 個。", color: "#b15979" },
    { groups: 3, each: 5, expression: "3 × 5", answer: 15, choices: [12, 14, 15, 18], note: "3 組，每組有 5 個。", color: "#f05a3c" },
  ],
  divide: [
    { groups: 3, each: 4, expression: "12 ÷ 3", answer: 4, choices: [3, 4, 6, 9], note: "12 個平均分成 3 組。", color: "#0e8b87" },
    { groups: 2, each: 5, expression: "10 ÷ 2", answer: 5, choices: [2, 4, 5, 8], note: "10 個平均分成 2 組。", color: "#c8811e" },
    { groups: 4, each: 3, expression: "12 ÷ 4", answer: 3, choices: [2, 3, 4, 6], note: "12 個平均分成 4 組。", color: "#4f6eae" },
    { groups: 3, each: 5, expression: "15 ÷ 3", answer: 5, choices: [3, 4, 5, 6], note: "15 個平均分成 3 組。", color: "#b15979" },
    { groups: 2, each: 6, expression: "12 ÷ 2", answer: 6, choices: [3, 4, 5, 6], note: "12 個平均分成 2 組。", color: "#f05a3c" },
  ],
  mixed: [
    { groups: 3, each: 4, expression: "3 × 4 + 2", answer: 14, choices: [12, 13, 14, 16], note: "先算 3 組 4，再加 2。", color: "#0e8b87" },
    { groups: 4, each: 3, expression: "4 × 3 − 2", answer: 10, choices: [8, 9, 10, 12], note: "先算 4 組 3，再減 2。", color: "#c8811e" },
    { groups: 3, each: 5, expression: "15 ÷ 3 + 4", answer: 9, choices: [5, 7, 9, 12], note: "先平均分組，再加 4。", color: "#4f6eae" },
    { groups: 2, each: 6, expression: "12 ÷ 2 − 1", answer: 5, choices: [4, 5, 6, 7], note: "先平均分組，再減 1。", color: "#b15979" },
    { groups: 2, each: 5, expression: "2 × 5 + 5", answer: 15, choices: [10, 12, 15, 20], note: "先算 2 組 5，再加 5。", color: "#f05a3c" },
  ],
};

function GroupBoard({ groups, each, color }: MultiplicationQuestion) {
  return (
    <div className="mq-multiply-groups" aria-label={`${groups} 組，每組 ${each} 個`}>
      {Array.from({ length: groups }).map((_, groupIndex) => (
        <div className="mq-multiply-group" key={groupIndex}>
          {Array.from({ length: each }).map((_, dotIndex) => <span key={dotIndex} style={{ backgroundColor: color }} />)}
        </div>
      ))}
    </div>
  );
}

function CelebrationBurst() {
  return <div className="mq-celebration-burst" aria-hidden="true">
    {Array.from({ length: 12 }).map((_, index) => <span key={index} style={{ "--burst": `${index * 30}deg` } as CSSProperties} />)}
  </div>;
}

export default function P2Practice() {
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState<OperationMode>("multiply");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<ResultState>("idle");
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [finished, setFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [wrongIndices, setWrongIndices] = useState<number[]>([]);
  const [reviewMode, setReviewMode] = useState(false);

  const questions = questionSets[mode];
  const activeIndices = reviewMode ? wrongIndices : questions.map((_, index) => index);
  const question = questions[activeIndices[currentIndex]];
  const answer = question.answer;
  const completed = currentIndex + (result === "correct" ? 1 : 0);
  const progress = Math.round((completed / activeIndices.length) * 100);
  const stars = score >= activeIndices.length ? 3 : score >= Math.ceil(activeIndices.length * 0.6) ? 2 : score >= 1 ? 1 : 0;
  const timeLabel = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  useEffect(() => {
    if (finished) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [finished]);

  const choose = (choice: number) => {
    if (result !== "idle") return;
    setSelected(choice);
    if (choice === answer) {
      setResult("correct");
      setScore((value) => value + 1);
      setStreak((value) => value + 1);
      if (soundEnabled) playCorrectSound();
      return;
    }
    setResult("incorrect");
    setStreak(0);
    setWrongIndices((indices) => indices.includes(activeIndices[currentIndex]) ? indices : [...indices, activeIndices[currentIndex]]);
    if (soundEnabled) playWrongSound();
  };

  const nextQuestion = () => {
    if (currentIndex === activeIndices.length - 1) {
      setFinished(true);
      if (!reviewMode) markPracticeCompleted(`p2-${mode}`);
      if (soundEnabled) playCelebrationSound();
      return;
    }
    setCurrentIndex((value) => value + 1);
    setResult("idle");
    setSelected(null);
  };

  const retry = () => { setResult("idle"); setSelected(null); };
  const restart = () => { setCurrentIndex(0); setResult("idle"); setSelected(null); setScore(0); setStreak(0); setSeconds(0); setFinished(false); setReviewMode(false); };
  const changeMode = (nextMode: OperationMode) => { setMode(nextMode); setWrongIndices([]); restart(); };
  const startWrongReview = () => { setCurrentIndex(0); setResult("idle"); setSelected(null); setScore(0); setStreak(0); setSeconds(0); setFinished(false); setReviewMode(true); };
  const modeLabel = mode === "multiply" ? "九九乘法表" : mode === "divide" ? "平均分組除法" : "乘除混合運算";

  return (
    <div className="mq-practice min-h-screen bg-[#f8f5ed] text-[#172b3f] dark:bg-[#101b27] dark:text-[#f4f7f4]">
      <header className="mq-practice-header sticky top-0 z-50 border-b border-[#172b3f]/10 bg-[#f8f5ed]/92 backdrop-blur-xl dark:border-white/10 dark:bg-[#111c28]/92">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 lg:px-8">
          <Link href="/" className="group flex items-center gap-3" aria-label="返回 Maths Quest 首頁">
            <span className="grid size-10 place-items-center rounded-[14px] bg-[#f05a3c] shadow-[0_6px_0_#c84932] transition-transform duration-200 group-hover:-translate-y-0.5"><img src="/manus-storage/maths-quest-logo_cf7e4a6a.png" alt="" className="size-6 brightness-0 invert" /></span>
            <span className="leading-none"><strong className="block text-[16px] font-extrabold tracking-[-0.04em]">Maths Quest</strong><small className="mt-1 block font-mono text-[9px] font-bold tracking-[0.14em] text-[#f05a3c]">P2 乘法站 · 01</small></span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden font-mono text-[11px] font-bold tracking-[0.1em] text-[#617286] dark:text-[#b7c8ce] sm:block">{modeLabel}</span>
            <button onClick={() => setSoundEnabled((value) => !value)} className="mq-theme-switch grid size-10 place-items-center rounded-full border border-[#172b3f]/15 bg-white/70 text-[#172b3f] transition hover:-translate-y-0.5 hover:border-[#f05a3c] hover:text-[#f05a3c] dark:border-white/15 dark:bg-white/10 dark:text-white" aria-label={soundEnabled ? "關閉答題音效" : "開啟答題音效"}>{soundEnabled ? <Volume2 className="size-[17px]" /> : <VolumeX className="size-[17px]" />}</button>
            <button onClick={toggleTheme} className="mq-theme-switch grid size-10 place-items-center rounded-full border border-[#172b3f]/15 bg-white/70 text-[#172b3f] transition hover:-translate-y-0.5 hover:border-[#f05a3c] hover:text-[#f05a3c] dark:border-white/15 dark:bg-white/10 dark:text-white" aria-label={theme === "light" ? "切換至深色模式" : "切換至淺色模式"}>{theme === "light" ? <Moon className="size-[17px]" /> : <Sun className="size-[18px]" />}</button>
            <Link href="/#path" className="mq-library-link inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-3 py-2 text-sm font-extrabold transition-colors hover:border-[#f05a3c] hover:text-[#f05a3c] dark:border-white/15"><ArrowLeft className="size-4" /><span>返回題目庫</span></Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-5 py-8 lg:px-8 lg:py-10">
        <div className="mq-route-ruler" aria-hidden="true"><span>起點</span><i /><span>P2.01</span><i /><span>乘法站</span></div>
        <div className="mq-mode-switch mb-5" aria-label="選擇 P2 練習題型">
          <button onClick={() => changeMode("multiply")} aria-pressed={mode === "multiply"}>乘法表</button>
          <button onClick={() => changeMode("divide")} aria-pressed={mode === "divide"}>除法</button>
          <button onClick={() => changeMode("mixed")} aria-pressed={mode === "mixed"}>混合運算</button>
        </div>
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div><div className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.16em] text-[#c8811e]"><span className="size-2 rounded-full bg-[#c8811e]" /> P2 · 練習站 01</div><h1 className="mt-3 text-3xl font-black tracking-[-0.055em] sm:text-4xl">{modeLabel}</h1><p className="mt-2 text-sm leading-6 text-[#617286] dark:text-[#b7c8ce]">{mode === "multiply" ? "看清每一組有多少，再把相同的數量乘起來。" : mode === "divide" ? "把物件平均分成幾組，找出每一組的數量。" : "先完成乘或除，再進行下一步運算。"}</p></div>
          <div className="mq-progress-label rounded-2xl border border-[#172b3f]/10 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-[#172737]"><span className="font-mono text-[10px] font-bold tracking-[0.12em] text-[#f05a3c]">今日學習路徑</span><p className="mt-1 font-extrabold">{reviewMode ? "重溫" : "已完成"} {completed} / {activeIndices.length} 題 <span className="mx-1 text-[#f05a3c]">·</span> {timeLabel}</p></div>
        </div>

        <div className="mq-practice-grid grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="mq-practice-sidebar order-2 lg:order-1">
            <div className="rounded-[24px] border border-[#172b3f]/10 bg-[#172b3f] p-5 text-white shadow-[0_10px_0_#0e1d2a] dark:border-white/10 dark:bg-[#1b3042]">
              <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-[#f6be5d]">本次任務</p><h2 className="mt-3 text-xl font-black leading-7">{reviewMode ? "逐題重溫錯題。" : `完成 5 個 ${mode === "multiply" ? "乘法" : mode === "divide" ? "除法" : "混合運算"}站。`}</h2><p className="mt-3 text-sm leading-6 text-white/75">{reviewMode ? "現在只顯示本題型中你剛才答錯的題目。" : mode === "mixed" ? "記得先做乘法或除法，再完成加減。" : "先數清楚圖示，再選出正確的答案。"}</p>
              <div className="mq-mission-steps mt-5">{activeIndices.map((_, index) => <span key={index} className={index < completed ? "mq-mission-step-done" : index === currentIndex ? "mq-mission-step-current" : ""}>{index + 1}</span>)}</div>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#f05a3c] transition-[width] duration-500" style={{ width: `${progress}%` }} /></div>
              <div className="mq-stars mt-5" aria-label={`本次已獲得 ${stars} 顆星`}>{[1, 2, 3].map((star) => <Star key={star} className={`size-5 ${star <= stars ? "mq-star-earned fill-[#f6be5d] text-[#f6be5d]" : "text-white/20"}`} />)}<span className="ml-2 text-xs font-extrabold text-white/75">連續答對 {streak} 題</span></div>
            </div>
            <div className="mq-tip mt-5 rounded-2xl border border-[#172b3f]/10 bg-[#fff3e8] p-4 dark:border-white/10 dark:bg-[#3a2f2b]"><div className="flex items-center gap-2 text-[#c8811e]"><Lightbulb className="size-4" /><span className="font-mono text-[10px] font-bold tracking-[0.12em]">小提示</span></div><p className="mt-2 text-sm font-bold leading-6 text-[#744230] dark:text-[#ffe6d6]">{mode === "multiply" ? "3 × 4 是 3 組 4，亦即 4 + 4 + 4。" : mode === "divide" ? "12 ÷ 3 是把 12 個平均分成 3 組。" : "混合運算要先做乘法和除法。"}</p></div>
          </aside>

          <section className="mq-practice-card mq-p2-card order-1 min-h-[540px] overflow-hidden rounded-[28px] border border-[#172b3f]/10 bg-white p-5 shadow-[0_16px_35px_rgba(23,43,63,0.07)] dark:border-white/10 dark:bg-[#172737] md:p-8 lg:order-2">
            {!finished ? <>
              <div className="mq-question-head relative flex items-center justify-between border-b border-[#172b3f]/10 pb-5 dark:border-white/10"><div><p className="font-mono text-[10px] font-bold tracking-[0.14em] text-[#c8811e]">第 {currentIndex + 1} 題 · {mode === "multiply" ? "乘法" : mode === "divide" ? "除法" : "混合運算"}站 {String(currentIndex + 1).padStart(2, "0")}</p><p className="mt-1 text-sm font-bold text-[#617286] dark:text-[#b7c8ce]">{mode === "mixed" ? "先看清運算次序，再選擇答案。" : "用圖示協助你一步一步思考。"}</p></div><span className="grid size-10 place-items-center rounded-full bg-[#fff7e9] font-mono text-xs font-black text-[#c8811e] dark:bg-[#3a3325]">{currentIndex + 1}</span></div>
              <div className="flex min-h-[245px] flex-col items-center justify-center py-7 text-center"><div className="mq-question-note"><span className="font-mono">{mode === "mixed" ? "運算提示" : "分組提示"}</span><span>{question.note}</span></div><GroupBoard {...question} /><div className="mt-6 flex items-center justify-center gap-3 font-mono text-[clamp(3rem,7vw,5rem)] font-medium leading-none tracking-[-0.08em]"><span className="tracking-[-0.1em]">{question.expression}</span><span className="text-[#617286] dark:text-[#b7c8ce]">=</span><span className="mq-answer-input grid min-w-[88px] place-items-center rounded-2xl border-2 border-[#172b3f]/15 text-[#172b3f] dark:border-white/20 dark:text-white">{selected ?? "?"}</span></div></div>
              {result !== "idle" && <div className={`mq-feedback mb-5 flex items-start gap-3 rounded-2xl border p-4 ${result === "correct" ? "border-[#0e8b87]/25 bg-[#e8f5f2] text-[#135d59] dark:bg-[#173d42] dark:text-[#c9f4ec]" : "border-[#f05a3c]/25 bg-[#fff0e9] text-[#8c3f2e] dark:bg-[#3a2f2b] dark:text-[#ffe2d8]"}`}><span className={`grid size-8 shrink-0 place-items-center rounded-full ${result === "correct" ? "bg-[#0e8b87]" : "bg-[#f05a3c]"} text-white`}>{result === "correct" ? <Check className="size-4" /> : <X className="size-4" />}</span><div><p className="font-extrabold">{result === "correct" ? "答對了！你已找到這組的總數。" : `再看一看，每組 ${question.each} 個，共有 ${question.groups} 組。`}</p><p className="mt-1 text-sm leading-6 opacity-80">{result === "correct" ? "準備好就到下一個乘法站。" : "重新數一次圓點，再試一次。"}</p></div></div>}
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px]"><div className="grid grid-cols-2 gap-3">{question.choices.map((choice, index) => <button key={choice} data-answer={String.fromCharCode(65 + index)} onClick={() => choose(choice)} disabled={result !== "idle"} className={`mq-choice rounded-2xl border py-4 text-xl font-black transition disabled:cursor-default ${selected === choice ? result === "correct" ? "border-[#0e8b87] bg-[#e8f5f2] text-[#0e8b87] dark:bg-[#173d42]" : "border-[#f05a3c] bg-[#fff0e9] text-[#f05a3c] dark:bg-[#3a2f2b]" : "border-[#172b3f]/10 bg-[#fcfbf7] dark:border-white/10 dark:bg-[#1c3041]"}`}>{choice}</button>)}</div><div className="flex flex-col justify-end gap-2">{result === "idle" ? <p className="rounded-2xl border border-dashed border-[#172b3f]/15 p-4 text-center text-sm font-bold leading-6 text-[#617286] dark:border-white/15 dark:text-[#b7c8ce]">選一個答案，系統會立即告訴你結果。</p> : result === "incorrect" ? <button onClick={retry} className="mq-start min-h-14 rounded-2xl bg-[#f05a3c] px-5 text-sm font-extrabold text-white shadow-[0_5px_0_#c84932] transition"><RotateCcw className="mr-1 inline size-4" /> 再試一次</button> : <button onClick={nextQuestion} className="mq-start min-h-14 rounded-2xl bg-[#f05a3c] px-5 text-sm font-extrabold text-white shadow-[0_5px_0_#c84932] transition">{currentIndex === activeIndices.length - 1 ? "查看結果" : "下一題"} <ArrowRight className="ml-1 inline size-4" /></button>}<p className="text-center font-mono text-[10px] font-bold tracking-[0.08em] text-[#8390a0] dark:text-[#9eb4bd]">選擇正確答案</p></div></div>
            </> : <div className="flex min-h-[500px] flex-col items-center justify-center text-center"><span className="grid size-20 place-items-center rounded-[26px] bg-[#fff7e9] text-[#c8811e] shadow-[0_10px_0_rgba(200,129,30,0.16)] dark:bg-[#3a3325]"><Trophy className="size-10" /></span><CelebrationBurst /><p className="mt-7 font-mono text-[11px] font-bold tracking-[0.16em] text-[#c8811e]">{reviewMode ? "錯題重溫完成" : "完成乘法站"}</p><h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">{reviewMode ? "你已重溫這些錯題！" : `${modeLabel}完成了！`}</h2><div className="mq-finish-stars mt-4">{[1, 2, 3].map((star) => <Star key={star} className={`size-7 ${star <= stars ? "fill-[#f6be5d] text-[#f6be5d]" : "text-[#e8e3d9] dark:text-[#2a4051]"}`} />)}</div><p className="mt-3 max-w-sm text-[15px] leading-7 text-[#617286] dark:text-[#b7c8ce]">這次答對了 {score} / {activeIndices.length} 題，用時 {timeLabel}。你已經完成這個題型的練習。</p><div className="mt-7 flex flex-wrap justify-center gap-3">{!reviewMode && wrongIndices.length > 0 && <button onClick={startWrongReview} className="mq-review inline-flex items-center gap-2 rounded-full border border-[#f05a3c]/40 px-5 py-3 text-sm font-extrabold text-[#f05a3c] transition"><RotateCcw className="size-4" /> 重溫 {wrongIndices.length} 題錯題</button>}<button onClick={restart} className="mq-start inline-flex items-center gap-2 rounded-full bg-[#f05a3c] px-5 py-3 text-sm font-extrabold text-white shadow-[0_4px_0_#c84932] transition"><RotateCcw className="size-4" /> 再做一次</button><Link href="/#path" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-5 py-3 text-sm font-extrabold dark:border-white/15">返回題目庫 <ArrowRight className="size-4" /></Link></div></div>}
          </section>
        </div>
      </main>
    </div>
  );
}
