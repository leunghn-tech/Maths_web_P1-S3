/**
 * Maths Quest — P4 分數與小數：用分段模型連結同分母分數、小數及互化概念。
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Check, Lightbulb, Moon, RotateCcw, Sparkles, Star, Sun, Trophy, Volume2, VolumeX, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { playCelebrationSound, playCorrectSound, playWrongSound } from "@/lib/sounds";
import { markPracticeCompleted } from "@/lib/practiceCompletion";
import { DAILY_TARGET, getDailyPracticeProgress, recordDailyPractice } from "@/lib/dailyPractice";

type Mode = "fractions" | "decimals" | "convert";
type Question = { expression: string; answer: string; choices: string[]; note: string; parts: number; shaded: number; color: string };

const questionSets: Record<Mode, Question[]> = {
  fractions: [
    { expression: "1/4 + 2/4", answer: "3/4", choices: ["2/4", "3/4", "3/8", "4/4"], note: "分母相同，只需要把分子相加。", parts: 4, shaded: 3, color: "#b15979" },
    { expression: "5/6 − 2/6", answer: "3/6", choices: ["3/6", "3/12", "7/6", "2/6"], note: "分母相同，5 減 2，分母仍然是 6。", parts: 6, shaded: 3, color: "#b15979" },
    { expression: "3/8 + 4/8", answer: "7/8", choices: ["7/8", "7/16", "1/8", "8/8"], note: "把同樣大小的分段合起來。", parts: 8, shaded: 7, color: "#b15979" },
    { expression: "1/3 + 1/3", answer: "2/3", choices: ["2/3", "2/6", "1/3", "3/3"], note: "分母保持 3，只把分子相加。", parts: 3, shaded: 2, color: "#b15979" },
    { expression: "7/8 − 3/8", answer: "4/8", choices: ["4/8", "4/16", "10/8", "3/8"], note: "同分母相減，7 減 3 是 4。", parts: 8, shaded: 4, color: "#b15979" },
    { expression: "2/5 + 1/5", answer: "3/5", choices: ["3/5", "3/10", "2/5", "1/5"], note: "五分之二加五分之一是五分之三。", parts: 5, shaded: 3, color: "#b15979" },
    { expression: "9/10 − 4/10", answer: "5/10", choices: ["5/10", "5/20", "13/10", "4/10"], note: "十分之九減十分之四，剩下十分之五。", parts: 10, shaded: 5, color: "#b15979" },
    { expression: "4/7 + 2/7", answer: "6/7", choices: ["6/7", "6/14", "2/7", "5/7"], note: "分母是 7 不變，4 加 2 是 6。", parts: 7, shaded: 6, color: "#b15979" },
  ],
  decimals: [
    { expression: "0.3 + 0.4", answer: "0.7", choices: ["0.34", "0.7", "0.12", "7.0"], note: "把十分位對齊：3 個十分之一加 4 個十分之一。", parts: 10, shaded: 7, color: "#0e8b87" },
    { expression: "0.9 − 0.2", answer: "0.7", choices: ["0.7", "0.11", "0.2", "0.9"], note: "9 個十分之一減去 2 個十分之一。", parts: 10, shaded: 7, color: "#0e8b87" },
    { expression: "1.5 + 0.3", answer: "1.8", choices: ["1.2", "1.8", "1.53", "0.18"], note: "先把小數點對齊，再加十分位。", parts: 10, shaded: 8, color: "#0e8b87" },
    { expression: "0.6 + 0.2", answer: "0.8", choices: ["0.8", "0.62", "0.4", "0.08"], note: "6 個十分之一加 2 個十分之一。", parts: 10, shaded: 8, color: "#0e8b87" },
    { expression: "1.0 − 0.4", answer: "0.6", choices: ["0.6", "0.14", "0.4", "1.4"], note: "10 個十分之一減 4 個十分之一。", parts: 10, shaded: 6, color: "#0e8b87" },
    { expression: "1.2 + 0.5", answer: "1.7", choices: ["1.7", "1.25", "0.7", "1.3"], note: "把十分位的 2 和 5 相加。", parts: 10, shaded: 7, color: "#0e8b87" },
    { expression: "0.8 − 0.3", answer: "0.5", choices: ["0.5", "0.11", "0.3", "0.8"], note: "8 個十分之一減去 3 個十分之一。", parts: 10, shaded: 5, color: "#0e8b87" },
    { expression: "2.1 + 0.6", answer: "2.7", choices: ["2.7", "2.16", "1.5", "2.6"], note: "個位和十分位分開對齊計算。", parts: 10, shaded: 7, color: "#0e8b87" },
  ],
  convert: [
    { expression: "3/4 = ?", answer: "0.75", choices: ["0.34", "0.75", "0.4", "0.8"], note: "四分之三等於 75 個百分之一。", parts: 4, shaded: 3, color: "#4f6eae" },
    { expression: "0.5 = ?", answer: "1/2", choices: ["1/5", "1/2", "2/5", "5/1"], note: "0.5 是 5 個十分之一，也就是一半。", parts: 2, shaded: 1, color: "#4f6eae" },
    { expression: "0.25 = ?", answer: "1/4", choices: ["1/2", "1/4", "2/5", "4/1"], note: "0.25 是 25 個百分之一，即四分之一。", parts: 4, shaded: 1, color: "#4f6eae" },
    { expression: "1/2 = ?", answer: "0.5", choices: ["0.5", "0.2", "0.25", "2.0"], note: "二分之一就是一半，即 0.5。", parts: 2, shaded: 1, color: "#4f6eae" },
    { expression: "0.8 = ?", answer: "4/5", choices: ["4/5", "8/5", "1/8", "5/4"], note: "0.8 是十分之八，約成五分之四。", parts: 5, shaded: 4, color: "#4f6eae" },
    { expression: "3/10 = ?", answer: "0.3", choices: ["0.3", "0.13", "3.0", "0.7"], note: "十分之三就是 0.3。", parts: 10, shaded: 3, color: "#4f6eae" },
    { expression: "0.6 = ?", answer: "3/5", choices: ["3/5", "6/5", "1/6", "5/3"], note: "0.6 是十分之六，約成五分之三。", parts: 5, shaded: 3, color: "#4f6eae" },
    { expression: "2/5 = ?", answer: "0.4", choices: ["0.4", "0.2", "0.25", "2.5"], note: "五分之二等於 4 個十分之一。", parts: 5, shaded: 2, color: "#4f6eae" },
  ],
};

type ResultState = "idle" | "correct" | "incorrect";

function FractionModel({ parts, shaded, color }: Pick<Question, "parts" | "shaded" | "color">) {
  return <div className="mq-fraction-model" aria-label={`共 ${parts} 等份，已顯示 ${shaded} 份`}>{Array.from({ length: parts }).map((_, index) => <span key={index} style={index < shaded ? { backgroundColor: color } : undefined} />)}</div>;
}

export default function P4Practice() {
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState<Mode>("fractions");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<ResultState>("idle");
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [finished, setFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [wrongIndices, setWrongIndices] = useState<number[]>([]);
  const [reviewMode, setReviewMode] = useState(false);
  const [dailyProgress, setDailyProgress] = useState(() => getDailyPracticeProgress());

  const questions = questionSets[mode];
  const activeIndices = reviewMode ? wrongIndices : questions.map((_, index) => index);
  const question = questions[activeIndices[currentIndex]];
  const completed = currentIndex + (result === "correct" ? 1 : 0);
  const progress = Math.round((completed / activeIndices.length) * 100);
  const stars = score >= activeIndices.length ? 3 : score >= Math.ceil(activeIndices.length * 0.67) ? 2 : score >= 1 ? 1 : 0;
  const timeLabel = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  const modeLabel = mode === "fractions" ? "分數加減" : mode === "decimals" ? "小數初步" : "分數與小數互化";

  useEffect(() => {
    if (finished) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [finished]);

  const choose = (choice: string) => {
    if (result !== "idle") return;
    setSelected(choice);
    if (choice === question.answer) {
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
      if (!reviewMode) { markPracticeCompleted(`p4-${mode}`); setDailyProgress(recordDailyPractice(`p4-${mode}`)); }
      if (soundEnabled) playCelebrationSound();
      return;
    }
    setCurrentIndex((value) => value + 1);
    setResult("idle");
    setSelected(null);
  };

  const restart = () => { setCurrentIndex(0); setResult("idle"); setSelected(null); setScore(0); setStreak(0); setSeconds(0); setFinished(false); setReviewMode(false); };
  const changeMode = (nextMode: Mode) => { setMode(nextMode); setWrongIndices([]); restart(); };
  const retry = () => { setResult("idle"); setSelected(null); };
  const startWrongReview = () => { setCurrentIndex(0); setResult("idle"); setSelected(null); setScore(0); setStreak(0); setSeconds(0); setFinished(false); setReviewMode(true); };

  return <div className={`mq-practice mq-p4-practice ${reviewMode ? "mq-review-mode" : ""} min-h-screen bg-[#f8f5ed] text-[#172b3f] dark:bg-[#101b27] dark:text-[#f4f7f4]`}>
    <header className="mq-practice-header sticky top-0 z-50 border-b border-[#172b3f]/10 bg-[#f8f5ed]/92 backdrop-blur-xl dark:border-white/10 dark:bg-[#111c28]/92"><div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 lg:px-8"><Link href="/" className="group flex items-center gap-3" aria-label="返回 Maths Quest 首頁"><span className="grid size-10 place-items-center rounded-[14px] bg-[#f05a3c] shadow-[0_6px_0_#c84932] transition-transform duration-200 group-hover:-translate-y-0.5"><img src="/manus-storage/maths-quest-logo_cf7e4a6a.png" alt="" className="size-6 brightness-0 invert" /></span><span className="leading-none"><strong className="block text-[16px] font-extrabold tracking-[-0.04em]">Maths Quest</strong><small className="mt-1 block font-mono text-[9px] font-bold tracking-[0.14em] text-[#f05a3c]">P4 分數站 · 01</small></span></Link><div className="flex items-center gap-2 sm:gap-4"><span className="hidden font-mono text-[11px] font-bold tracking-[0.1em] text-[#617286] dark:text-[#b7c8ce] sm:block">{modeLabel}</span><button onClick={() => setSoundEnabled((value) => !value)} className="mq-theme-switch grid size-10 place-items-center rounded-full border border-[#172b3f]/15 bg-white/70 text-[#172b3f] dark:border-white/15 dark:bg-white/10 dark:text-white" aria-label={soundEnabled ? "關閉答題音效" : "開啟答題音效"}>{soundEnabled ? <Volume2 className="size-[17px]" /> : <VolumeX className="size-[17px]" />}</button><button onClick={toggleTheme} className="mq-theme-switch grid size-10 place-items-center rounded-full border border-[#172b3f]/15 bg-white/70 text-[#172b3f] dark:border-white/15 dark:bg-white/10 dark:text-white" aria-label={theme === "light" ? "切換至深色模式" : "切換至淺色模式"}>{theme === "light" ? <Moon className="size-[17px]" /> : <Sun className="size-[18px]" />}</button><Link href="/#path" className="mq-library-link inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-3 py-2 text-sm font-extrabold dark:border-white/15"><ArrowLeft className="size-4" /><span>返回題目庫</span></Link></div></div></header>
    <main className="mx-auto max-w-[1280px] px-5 py-8 lg:px-8 lg:py-10"><div className="mq-route-ruler" aria-hidden="true"><span>起點</span><i /><span>P4.01</span><i /><span>分數站</span></div><div className="mq-mode-switch mb-5" aria-label="選擇 P4 練習題型"><button onClick={() => changeMode("fractions")} aria-pressed={mode === "fractions"}>分數加減</button><button onClick={() => changeMode("decimals")} aria-pressed={mode === "decimals"}>小數初步</button><button onClick={() => changeMode("convert")} aria-pressed={mode === "convert"}>互化</button></div><div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><div className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.16em] text-[#b15979]"><span className="size-2 rounded-full bg-[#b15979]" /> P4 · 分數與小數站</div><h1 className="mt-3 text-3xl font-black tracking-[-0.055em] sm:text-4xl">{modeLabel}</h1><p className="mt-2 text-sm leading-6 text-[#617286] dark:text-[#b7c8ce]">{reviewMode ? "現在只會重溫剛才答錯的題目。" : "用分段圖示看懂數量關係，再選出正確答案。"}</p></div><div className="mq-progress-label rounded-2xl border border-[#172b3f]/10 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-[#172737]"><span className="font-mono text-[10px] font-bold tracking-[0.12em] text-[#f05a3c]">{reviewMode ? "錯題重溫" : "今日學習路徑"}</span><p className="mt-1 font-extrabold">{reviewMode ? "重溫" : "已完成"} {completed} / {activeIndices.length} 題 <span className="mx-1 text-[#f05a3c]">·</span> {timeLabel}</p></div></div>
      <div className="mq-practice-grid grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]"><aside className="mq-practice-sidebar order-2 lg:order-1"><div className="rounded-[24px] border border-[#172b3f]/10 bg-[#172b3f] p-5 text-white shadow-[0_10px_0_#0e1d2a] dark:border-white/10 dark:bg-[#1b3042]"><p className="font-mono text-[10px] font-bold tracking-[0.16em] text-[#f6be5d]">本次任務</p><h2 className="mt-3 text-xl font-black leading-7">{reviewMode ? "逐題重溫錯題。" : "完成 3 個分數站。"}</h2><p className="mt-3 text-sm leading-6 text-white/75">{reviewMode ? "看懂分段圖示後，再試一次。" : "分數與小數都在描述「整體的一部分」。"}</p><div className="mq-mission-steps mt-5">{activeIndices.map((_, index) => <span key={index} className={index < completed ? "mq-mission-step-done" : index === currentIndex ? "mq-mission-step-current" : ""}>{index + 1}</span>)}</div><div className="mt-6 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#f05a3c] transition-[width] duration-500" style={{ width: `${progress}%` }} /></div><div className="mq-stars mt-5" aria-label={`本次已獲得 ${stars} 顆星`}>{[1, 2, 3].map((star) => <Star key={star} className={`size-5 ${star <= stars ? "mq-star-earned fill-[#f6be5d] text-[#f6be5d]" : "text-white/20"}`} />)}<span className="ml-2 text-xs font-extrabold text-white/75">連續答對 {streak} 題</span></div></div><div className="mq-tip mt-5 rounded-2xl border border-[#172b3f]/10 bg-[#fff3e8] p-4 dark:border-white/10 dark:bg-[#3a2f2b]"><div className="flex items-center gap-2 text-[#b15979]"><Lightbulb className="size-4" /><span className="font-mono text-[10px] font-bold tracking-[0.12em]">小提示</span></div><p className="mt-2 text-sm font-bold leading-6 text-[#744230] dark:text-[#ffe6d6]">分母相同時，分數加減只需要處理分子。</p></div></aside>
        <section className="mq-practice-card mq-p4-card order-1 min-h-[540px] overflow-hidden rounded-[28px] border border-[#172b3f]/10 bg-white p-5 shadow-[0_16px_35px_rgba(23,43,63,0.07)] dark:border-white/10 dark:bg-[#172737] md:p-8 lg:order-2">{!finished ? <><div className="mq-question-head relative flex items-center justify-between border-b border-[#172b3f]/10 pb-5 dark:border-white/10"><div><p className="font-mono text-[10px] font-bold tracking-[0.14em] text-[#b15979]">第 {currentIndex + 1} 題 · {modeLabel}站 {String(currentIndex + 1).padStart(2, "0")}</p><p className="mt-1 text-sm font-bold text-[#617286] dark:text-[#b7c8ce]">先看分段圖示，找出它所表示的數量。</p></div><span className="grid size-10 place-items-center rounded-full bg-[#f8edf2] font-mono text-xs font-black text-[#b15979] dark:bg-[#3c2935]">{currentIndex + 1}</span></div><div className="flex min-h-[245px] flex-col items-center justify-center py-7 text-center"><div className="mq-question-note"><span className="font-mono">分段提示</span><span>{question.note}</span></div><FractionModel parts={question.parts} shaded={question.shaded} color={question.color} /><div className="mt-7 flex items-center justify-center gap-3 font-mono text-[clamp(2.9rem,7vw,5rem)] font-medium leading-none tracking-[-0.08em]"><span className="tracking-[-0.12em]">{question.expression}</span><span className="text-[#617286] dark:text-[#b7c8ce]">=</span><span className="mq-answer-input grid min-w-[95px] place-items-center rounded-2xl border-2 border-[#172b3f]/15 text-[#172b3f] dark:border-white/20 dark:text-white">{selected ?? "?"}</span></div></div>{result !== "idle" && <div className={`mq-feedback mb-5 flex items-start gap-3 rounded-2xl border p-4 ${result === "correct" ? "border-[#0e8b87]/25 bg-[#e8f5f2] text-[#135d59] dark:bg-[#173d42] dark:text-[#c9f4ec]" : "border-[#f05a3c]/25 bg-[#fff0e9] text-[#8c3f2e] dark:bg-[#3a2f2b] dark:text-[#ffe2d8]"}`}><span className={`grid size-8 shrink-0 place-items-center rounded-full ${result === "correct" ? "bg-[#0e8b87]" : "bg-[#f05a3c]"} text-white`}>{result === "correct" ? <Check className="size-4" /> : <X className="size-4" />}</span><div><p className="font-extrabold">{result === "correct" ? "答對了！你已看懂這個部分與整體的關係。" : `再看一看，正確答案是 ${question.answer}。`}</p><p className="mt-1 text-sm leading-6 opacity-80">{result === "correct" ? "準備好就到下一個分數站。" : "依提示重新觀察分段模型，再試一次。"}</p></div></div>}<div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px]"><div className="grid grid-cols-2 gap-3">{question.choices.map((choice, index) => <button key={choice} data-answer={String.fromCharCode(65 + index)} onClick={() => choose(choice)} disabled={result !== "idle"} className={`mq-choice rounded-2xl border py-4 text-xl font-black transition disabled:cursor-default ${selected === choice ? result === "correct" ? "border-[#0e8b87] bg-[#e8f5f2] text-[#0e8b87] dark:bg-[#173d42]" : "border-[#f05a3c] bg-[#fff0e9] text-[#f05a3c] dark:bg-[#3a2f2b]" : "border-[#172b3f]/10 bg-[#fcfbf7] dark:border-white/10 dark:bg-[#1c3041]"}`}>{choice}</button>)}</div><div className="flex flex-col justify-end gap-2">{result === "idle" ? <p className="rounded-2xl border border-dashed border-[#172b3f]/15 p-4 text-center text-sm font-bold leading-6 text-[#617286] dark:border-white/15 dark:text-[#b7c8ce]">選出正確答案，系統會立即給你回饋。</p> : result === "incorrect" ? <button onClick={retry} className="mq-start min-h-14 rounded-2xl bg-[#f05a3c] px-5 text-sm font-extrabold text-white shadow-[0_5px_0_#c84932] transition"><RotateCcw className="mr-1 inline size-4" /> 再試一次</button> : <button onClick={nextQuestion} className="mq-start min-h-14 rounded-2xl bg-[#f05a3c] px-5 text-sm font-extrabold text-white shadow-[0_5px_0_#c84932] transition">{currentIndex === activeIndices.length - 1 ? "查看結果" : "下一題"} <ArrowRight className="ml-1 inline size-4" /></button>}<p className="text-center font-mono text-[10px] font-bold tracking-[0.08em] text-[#8390a0] dark:text-[#9eb4bd]">選擇正確答案</p></div></div></> : <div className="flex min-h-[500px] flex-col items-center justify-center text-center"><span className="grid size-20 place-items-center rounded-[26px] bg-[#f8edf2] text-[#b15979] shadow-[0_10px_0_rgba(177,89,121,0.16)] dark:bg-[#3c2935]"><Trophy className="size-10" /></span><p className="mt-7 font-mono text-[11px] font-bold tracking-[0.16em] text-[#f05a3c]">{reviewMode ? "錯題重溫完成" : "完成分數站"}</p><h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">{reviewMode ? "你已重新走完錯題路徑！" : `${modeLabel}完成了！`}</h2><div className="mq-finish-stars mt-4">{[1, 2, 3].map((star) => <Star key={star} className={`size-7 ${star <= stars ? "fill-[#f6be5d] text-[#f6be5d]" : "text-[#e8e3d9] dark:text-[#2a4051]"}`} />)}</div><p className="mt-3 max-w-sm text-[15px] leading-7 text-[#617286] dark:text-[#b7c8ce]">這次答對了 {score} / {activeIndices.length} 題，用時 {timeLabel}。分數與小數的關係更清楚了。</p>{!reviewMode && <p className="mq-daily-finish mt-3 font-bold">{dailyProgress.reachedGoal ? `今日目標完成！已連續打卡 ${dailyProgress.streak} 天。` : `今日目標：${dailyProgress.completed} / ${DAILY_TARGET} 個練習站`}</p>}<div className="mt-7 flex flex-wrap justify-center gap-3">{!reviewMode && wrongIndices.length > 0 && <button onClick={startWrongReview} className="mq-review inline-flex items-center gap-2 rounded-full border border-[#f05a3c]/40 px-5 py-3 text-sm font-extrabold text-[#f05a3c] transition"><Sparkles className="size-4" /> 重溫 {wrongIndices.length} 題錯題</button>}<button onClick={restart} className="mq-start inline-flex items-center gap-2 rounded-full bg-[#f05a3c] px-5 py-3 text-sm font-extrabold text-white shadow-[0_4px_0_#c84932] transition"><RotateCcw className="size-4" /> 再做一次</button><Link href="/#path" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-5 py-3 text-sm font-extrabold dark:border-white/15">返回題目庫 <ArrowRight className="size-4" /></Link></div></div>}</section></div></main>
  </div>;
}
