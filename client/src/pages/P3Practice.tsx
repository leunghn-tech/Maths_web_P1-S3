/**
 * Maths Quest — P3 四則混合計算：以三個逐步解鎖的計算關卡，培養運算次序與策略。
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Lightbulb, Lock, Moon, RotateCcw, Star, Sun, Trophy, Volume2, VolumeX, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { playCelebrationSound, playCorrectSound, playWrongSound } from "@/lib/sounds";
import { markPracticeCompleted } from "@/lib/practiceCompletion";
import { recordDailyPractice } from "@/lib/dailyPractice";

type Level = 1 | 2 | 3;
type Question = { expression: string; answer: number; choices: number[]; note: string };

const levels: Record<Level, { title: string; description: string; badge: string; questions: Question[] }> = {
  1: {
    title: "基礎運算路徑",
    description: "先完成乘法或除法，再計算加減。",
    badge: "LEVEL 1 · 基礎",
    questions: [
      { expression: "8 + 3 × 2", answer: 14, choices: [11, 14, 16, 22], note: "先算 3 × 2，再加 8。" },
      { expression: "18 ÷ 3 + 4", answer: 10, choices: [6, 8, 10, 12], note: "先算 18 ÷ 3，再加 4。" },
      { expression: "5 × 3 − 2", answer: 13, choices: [8, 10, 13, 15], note: "先算 5 × 3，再減 2。" },
    ],
  },
  2: {
    title: "策略運算路徑",
    description: "在兩個運算步驟中保持清晰的次序。",
    badge: "LEVEL 2 · 進階",
    questions: [
      { expression: "24 ÷ 4 + 6 × 2", answer: 18, choices: [12, 16, 18, 24], note: "先完成除法和乘法，再把結果相加。" },
      { expression: "7 × 4 − 16 ÷ 2", answer: 20, choices: [12, 16, 20, 24], note: "先算 7 × 4 和 16 ÷ 2，再相減。" },
      { expression: "30 − 3 × 7", answer: 9, choices: [7, 9, 12, 21], note: "先算 3 × 7，不能從左到右直接減。" },
    ],
  },
  3: {
    title: "挑戰運算路徑",
    description: "用穩定的運算次序完成綜合挑戰。",
    badge: "LEVEL 3 · 挑戰",
    questions: [
      { expression: "48 ÷ 6 + 5 × 3", answer: 23, choices: [13, 20, 23, 39], note: "先算 48 ÷ 6 和 5 × 3，再相加。" },
      { expression: "36 ÷ 4 × 3", answer: 27, choices: [3, 9, 12, 27], note: "乘除法同級，從左至右：36 ÷ 4，再 × 3。" },
      { expression: "40 − 24 ÷ 3 + 2", answer: 34, choices: [18, 26, 30, 34], note: "先算 24 ÷ 3，再依序減和加。" },
    ],
  },
};

function choicesFor(answer: number) { return Array.from(new Set([answer, answer + 2, Math.max(1, answer - 2), answer + 4])).sort(() => Math.random() - 0.5); }
function generateLevelQuestions(level: Level): Question[] {
  const cap = level === 1 ? 6 : level === 2 ? 9 : 12;
  return Array.from({ length: 3 }, (_, index) => {
    const a = 2 + Math.floor(Math.random() * cap);
    const b = 2 + Math.floor(Math.random() * Math.max(2, cap - 1));
    const extra = 1 + Math.floor(Math.random() * Math.max(2, cap - 1));
    if (level === 1) { const answer = a + b * 2; return { expression: `${a} + ${b} × 2`, answer, choices: choicesFor(answer), note: `先算 ${b} × 2，再加 ${a}。` }; }
    if (level === 2) { const answer = a * b - extra; return { expression: `${a} × ${b} − ${extra}`, answer, choices: choicesFor(answer), note: `先算 ${a} × ${b}，再減 ${extra}。` }; }
    const divisor = 2 + Math.floor(Math.random() * 5);
    const quotient = 2 + Math.floor(Math.random() * 8);
    const answer = quotient + a * 2;
    return { expression: `${quotient * divisor} ÷ ${divisor} + ${a} × 2`, answer, choices: choicesFor(answer), note: "先完成除法和乘法，再把兩個結果相加。" };
  });
}

type ResultState = "idle" | "correct" | "incorrect";

export default function P3Practice() {
  const { theme, toggleTheme } = useTheme();
  const [selectedLevel, setSelectedLevel] = useState<Level>(1);
  const [unlockedLevel, setUnlockedLevel] = useState<Level>(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<ResultState>("idle");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [levelScore, setLevelScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [levelFinished, setLevelFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [wrongIndices, setWrongIndices] = useState<number[]>([]);
  const [reviewMode, setReviewMode] = useState(false);
  const [session, setSession] = useState<Question[]>(() => generateLevelQuestions(1));

  const level = { ...levels[selectedLevel], questions: session };
  const activeIndices = reviewMode ? wrongIndices : level.questions.map((_, index) => index);
  const question = level.questions[activeIndices[currentIndex]];
  const completed = currentIndex + (result === "correct" ? 1 : 0);
  const progress = Math.round((completed / activeIndices.length) * 100);
  const stars = levelScore >= activeIndices.length ? 3 : levelScore >= Math.ceil(activeIndices.length * 0.67) ? 2 : levelScore >= 1 ? 1 : 0;
  const passed = levelScore >= 2;
  const timeLabel = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  useEffect(() => {
    if (levelFinished) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [levelFinished, selectedLevel]);

  const resetLevel = (nextLevel: Level) => {
    setSelectedLevel(nextLevel);
    setSession(generateLevelQuestions(nextLevel));
    setCurrentIndex(0);
    setResult("idle");
    setSelectedAnswer(null);
    setLevelScore(0);
    setStreak(0);
    setSeconds(0);
    setLevelFinished(false);
    setWrongIndices([]);
    setReviewMode(false);
  };

  const choose = (choice: number) => {
    if (result !== "idle") return;
    setSelectedAnswer(choice);
    if (choice === question.answer) {
      setResult("correct");
      setLevelScore((value) => value + 1);
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
      const justPassed = levelScore >= 2;
      if (!reviewMode && justPassed && selectedLevel < 3) setUnlockedLevel((value) => Math.max(value, (selectedLevel + 1) as Level) as Level);
      if (!reviewMode && justPassed) { markPracticeCompleted(`p3-level-${selectedLevel}`); recordDailyPractice(`p3-level-${selectedLevel}`); }
      setLevelFinished(true);
      if (soundEnabled) playCelebrationSound();
      return;
    }
    setCurrentIndex((value) => value + 1);
    setResult("idle");
    setSelectedAnswer(null);
  };

  const retry = () => { setResult("idle"); setSelectedAnswer(null); };
  const startWrongReview = () => { setCurrentIndex(0); setResult("idle"); setSelectedAnswer(null); setLevelScore(0); setStreak(0); setSeconds(0); setLevelFinished(false); setReviewMode(true); };

  return (
    <div className="mq-practice mq-p3-practice min-h-screen bg-[#f8f5ed] text-[#172b3f] dark:bg-[#101b27] dark:text-[#f4f7f4]">
      <header className="mq-practice-header sticky top-0 z-50 border-b border-[#172b3f]/10 bg-[#f8f5ed]/92 backdrop-blur-xl dark:border-white/10 dark:bg-[#111c28]/92">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 lg:px-8">
          <Link href="/" className="group flex items-center gap-3" aria-label="返回 Maths Quest 首頁"><span className="grid size-10 place-items-center rounded-[14px] bg-[#f05a3c] shadow-[0_6px_0_#c84932] transition-transform duration-200 group-hover:-translate-y-0.5"><img src="/manus-storage/maths-quest-logo_cf7e4a6a.png" alt="" className="size-6 brightness-0 invert" /></span><span className="leading-none"><strong className="block text-[16px] font-extrabold tracking-[-0.04em]">Maths Quest</strong><small className="mt-1 block font-mono text-[9px] font-bold tracking-[0.14em] text-[#f05a3c]">P3 運算站 · 01</small></span></Link>
          <div className="flex items-center gap-2 sm:gap-4"><span className="hidden font-mono text-[11px] font-bold tracking-[0.1em] text-[#617286] dark:text-[#b7c8ce] sm:block">四則混合計算</span><button onClick={() => setSoundEnabled((value) => !value)} className="mq-theme-switch grid size-10 place-items-center rounded-full border border-[#172b3f]/15 bg-white/70 text-[#172b3f] transition hover:-translate-y-0.5 hover:border-[#f05a3c] hover:text-[#f05a3c] dark:border-white/15 dark:bg-white/10 dark:text-white" aria-label={soundEnabled ? "關閉答題音效" : "開啟答題音效"}>{soundEnabled ? <Volume2 className="size-[17px]" /> : <VolumeX className="size-[17px]" />}</button><button onClick={toggleTheme} className="mq-theme-switch grid size-10 place-items-center rounded-full border border-[#172b3f]/15 bg-white/70 text-[#172b3f] transition hover:-translate-y-0.5 hover:border-[#f05a3c] hover:text-[#f05a3c] dark:border-white/15 dark:bg-white/10 dark:text-white" aria-label={theme === "light" ? "切換至深色模式" : "切換至淺色模式"}>{theme === "light" ? <Moon className="size-[17px]" /> : <Sun className="size-[18px]" />}</button><Link href="/#path" className="mq-library-link inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-3 py-2 text-sm font-extrabold transition-colors hover:border-[#f05a3c] hover:text-[#f05a3c] dark:border-white/15"><ArrowLeft className="size-4" /><span>返回題目庫</span></Link></div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-5 py-8 lg:px-8 lg:py-10">
        <div className="mq-route-ruler" aria-hidden="true"><span>起點</span><i /><span>P3.0{selectedLevel}</span><i /><span>過關站</span></div>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><div className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.16em] text-[#4f6eae]"><span className="size-2 rounded-full bg-[#4f6eae]" /> P3 · 分級運算站</div><h1 className="mt-3 text-3xl font-black tracking-[-0.055em] sm:text-4xl">四則混合計算</h1><p className="mt-2 text-sm leading-6 text-[#617286] dark:text-[#b7c8ce]">完成每一級 3 題，答對至少 2 題即可解鎖下一條運算路徑。</p></div><div className="mq-progress-label rounded-2xl border border-[#172b3f]/10 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-[#172737]"><span className="font-mono text-[10px] font-bold tracking-[0.12em] text-[#f05a3c]">目前關卡</span><p className="mt-1 font-extrabold">L{selectedLevel} · {timeLabel}</p></div></div>

        <div className="mq-level-select" aria-label="選擇 P3 難度關卡">{([1, 2, 3] as Level[]).map((item) => <button key={item} onClick={() => item <= unlockedLevel && resetLevel(item)} disabled={item > unlockedLevel} aria-pressed={item === selectedLevel} className={item > unlockedLevel ? "mq-level-locked" : ""}>{item > unlockedLevel ? <Lock className="size-4" /> : <span className="font-mono">0{item}</span>}<span><strong>Level {item}</strong><small>{item === 1 ? "基礎" : item === 2 ? "進階" : "挑戰"}</small></span>{item < 3 && <ChevronRight className="ml-auto size-4 opacity-40" />}</button>)}</div>
        <button onClick={() => resetLevel(selectedLevel)} className="mq-randomize mt-4"><RotateCcw className="size-4" /> 換一組 Level {selectedLevel} 隨機題</button>
        {!reviewMode && wrongIndices.length > 0 && <button onClick={startWrongReview} className="mq-review mt-4 inline-flex items-center gap-2 rounded-full border border-[#f05a3c]/40 px-4 py-2 text-sm font-extrabold text-[#f05a3c] transition"><RotateCcw className="size-4" /> 重溫本關 {wrongIndices.length} 題錯題</button>}

        <div className="mq-practice-grid mt-5 grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="mq-practice-sidebar order-2 lg:order-1"><div className="rounded-[24px] border border-[#172b3f]/10 bg-[#172b3f] p-5 text-white shadow-[0_10px_0_#0e1d2a] dark:border-white/10 dark:bg-[#1b3042]"><p className="font-mono text-[10px] font-bold tracking-[0.16em] text-[#f6be5d]">過關任務</p><h2 className="mt-3 text-xl font-black leading-7">答對 2 題即可過關。</h2><p className="mt-3 text-sm leading-6 text-white/75">每題先看清乘、除、加、減的運算次序。</p><div className="mq-mission-steps mt-5">{level.questions.map((_, index) => <span key={index} className={index < completed ? "mq-mission-step-done" : index === currentIndex ? "mq-mission-step-current" : ""}>{index + 1}</span>)}</div><div className="mt-6 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#f05a3c] transition-[width] duration-500" style={{ width: `${progress}%` }} /></div><div className="mq-stars mt-5" aria-label={`本關已獲得 ${stars} 顆星`}>{[1, 2, 3].map((star) => <Star key={star} className={`size-5 ${star <= stars ? "mq-star-earned fill-[#f6be5d] text-[#f6be5d]" : "text-white/20"}`} />)}<span className="ml-2 text-xs font-extrabold text-white/75">連續答對 {streak} 題</span></div></div><div className="mq-tip mt-5 rounded-2xl border border-[#172b3f]/10 bg-[#fff3e8] p-4 dark:border-white/10 dark:bg-[#3a2f2b]"><div className="flex items-center gap-2 text-[#4f6eae]"><Lightbulb className="size-4" /><span className="font-mono text-[10px] font-bold tracking-[0.12em]">運算次序</span></div><p className="mt-2 text-sm font-bold leading-6 text-[#744230] dark:text-[#ffe6d6]">先算乘法和除法；同級運算則由左至右。</p></div></aside>

          <section className="mq-practice-card mq-p3-card order-1 min-h-[540px] overflow-hidden rounded-[28px] border border-[#172b3f]/10 bg-white p-5 shadow-[0_16px_35px_rgba(23,43,63,0.07)] dark:border-white/10 dark:bg-[#172737] md:p-8 lg:order-2">{!levelFinished ? <><div className="mq-question-head relative flex items-center justify-between border-b border-[#172b3f]/10 pb-5 dark:border-white/10"><div><p className="font-mono text-[10px] font-bold tracking-[0.14em] text-[#4f6eae]">{level.badge} · 第 {currentIndex + 1} 題</p><p className="mt-1 text-sm font-bold text-[#617286] dark:text-[#b7c8ce]">{level.description}</p></div><span className="grid size-10 place-items-center rounded-full bg-[#eef1fb] font-mono text-xs font-black text-[#4f6eae] dark:bg-[#27324d]">{currentIndex + 1}</span></div><div className="flex min-h-[245px] flex-col items-center justify-center py-7 text-center"><div className="mq-question-note"><span className="font-mono">解題提示</span><span>{question.note}</span></div><div className="mq-operation-lane"><span>×</span><i /><span>÷</span><i /><span>+</span><i /><span>−</span></div><div className="mt-5 flex items-center justify-center gap-3 font-mono text-[clamp(2.45rem,6vw,4.65rem)] font-medium leading-none tracking-[-0.08em]"><span className="tracking-[-0.12em]">{question.expression}</span><span className="text-[#617286] dark:text-[#b7c8ce]">=</span><span className="mq-answer-input grid min-w-[88px] place-items-center rounded-2xl border-2 border-[#172b3f]/15 text-[#172b3f] dark:border-white/20 dark:text-white">{selectedAnswer ?? "?"}</span></div></div>{result !== "idle" && <div className={`mq-feedback mb-5 flex items-start gap-3 rounded-2xl border p-4 ${result === "correct" ? "border-[#0e8b87]/25 bg-[#e8f5f2] text-[#135d59] dark:bg-[#173d42] dark:text-[#c9f4ec]" : "border-[#f05a3c]/25 bg-[#fff0e9] text-[#8c3f2e] dark:bg-[#3a2f2b] dark:text-[#ffe2d8]"}`}><span className={`grid size-8 shrink-0 place-items-center rounded-full ${result === "correct" ? "bg-[#0e8b87]" : "bg-[#f05a3c]"} text-white`}>{result === "correct" ? <Check className="size-4" /> : <X className="size-4" />}</span><div><p className="font-extrabold">{result === "correct" ? "答對了！你的運算次序很清楚。" : "再看一次提示，先完成乘法或除法。"}</p><p className="mt-1 text-sm leading-6 opacity-80">{result === "correct" ? "繼續前進，向下一個過關站出發。" : "重新想一想後，按「再試一次」。"}</p></div></div>}<div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px]"><div className="grid grid-cols-2 gap-3">{question.choices.map((choice, index) => <button key={choice} data-answer={String.fromCharCode(65 + index)} onClick={() => choose(choice)} disabled={result !== "idle"} className={`mq-choice rounded-2xl border py-4 text-xl font-black transition disabled:cursor-default ${selectedAnswer === choice ? result === "correct" ? "border-[#0e8b87] bg-[#e8f5f2] text-[#0e8b87] dark:bg-[#173d42]" : "border-[#f05a3c] bg-[#fff0e9] text-[#f05a3c] dark:bg-[#3a2f2b]" : "border-[#172b3f]/10 bg-[#fcfbf7] dark:border-white/10 dark:bg-[#1c3041]"}`}>{choice}</button>)}</div><div className="flex flex-col justify-end gap-2">{result === "idle" ? <p className="rounded-2xl border border-dashed border-[#172b3f]/15 p-4 text-center text-sm font-bold leading-6 text-[#617286] dark:border-white/15 dark:text-[#b7c8ce]">選出最合理的答案，再檢查你的運算步驟。</p> : result === "incorrect" ? <button onClick={retry} className="mq-start min-h-14 rounded-2xl bg-[#f05a3c] px-5 text-sm font-extrabold text-white shadow-[0_5px_0_#c84932] transition"><RotateCcw className="mr-1 inline size-4" /> 再試一次</button> : <button onClick={nextQuestion} className="mq-start min-h-14 rounded-2xl bg-[#f05a3c] px-5 text-sm font-extrabold text-white shadow-[0_5px_0_#c84932] transition">{currentIndex === level.questions.length - 1 ? "查看過關結果" : "下一題"} <ArrowRight className="ml-1 inline size-4" /></button>}<p className="text-center font-mono text-[10px] font-bold tracking-[0.08em] text-[#8390a0] dark:text-[#9eb4bd]">完成本關以解鎖下一級</p></div></div></> : <div className="flex min-h-[500px] flex-col items-center justify-center text-center"><span className={`grid size-20 place-items-center rounded-[26px] ${passed ? "bg-[#fff0e9] text-[#f05a3c] shadow-[0_10px_0_rgba(240,90,60,0.16)]" : "bg-[#eef1fb] text-[#4f6eae]"} dark:bg-[#3a2f2b]`}><Trophy className="size-10" /></span><p className="mt-7 font-mono text-[11px] font-bold tracking-[0.16em] text-[#f05a3c]">{passed ? "關卡已通過" : "再挑戰一次"}</p><h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">{passed ? `${level.title}完成！` : "差一點就過關了。"}</h2><div className="mq-finish-stars mt-4">{[1, 2, 3].map((star) => <Star key={star} className={`size-7 ${star <= stars ? "fill-[#f6be5d] text-[#f6be5d]" : "text-[#e8e3d9] dark:text-[#2a4051]"}`} />)}</div><p className="mt-3 max-w-sm text-[15px] leading-7 text-[#617286] dark:text-[#b7c8ce]">本關答對 {levelScore} / {level.questions.length} 題，用時 {timeLabel}。{passed ? selectedLevel < 3 ? "你已獲得解鎖下一關的過關印章。" : "你已完成所有挑戰關卡。" : "答對至少 2 題即可解鎖下一級。"}</p><div className="mt-7 flex flex-wrap justify-center gap-3">{passed && selectedLevel < 3 ? <button onClick={() => resetLevel((selectedLevel + 1) as Level)} className="mq-start inline-flex items-center gap-2 rounded-full bg-[#f05a3c] px-5 py-3 text-sm font-extrabold text-white shadow-[0_4px_0_#c84932] transition">解鎖 Level {selectedLevel + 1} <ArrowRight className="size-4" /></button> : <button onClick={() => resetLevel(selectedLevel)} className="mq-start inline-flex items-center gap-2 rounded-full bg-[#f05a3c] px-5 py-3 text-sm font-extrabold text-white shadow-[0_4px_0_#c84932] transition"><RotateCcw className="size-4" /> {passed ? "再做一次" : "重新挑戰"}</button>}<Link href="/#path" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-5 py-3 text-sm font-extrabold dark:border-white/15">返回題目庫 <ArrowRight className="size-4" /></Link></div></div>}</section>
        </div>
      </main>
    </div>
  );
}
