import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Check, RotateCcw, Volume2 } from "lucide-react";
import { markPracticeCompleted } from "@/lib/practiceCompletion";
import { recordDailyPractice } from "@/lib/dailyPractice";
import { getReviewRecords, recordPracticeMistake } from "@/lib/reviewRecommendations";
import { speakCantonese, speakCorrectEncouragement, speakTryAgain } from "@/lib/speech";

type Station = "capacity" | "hour" | "weights";
type Question = { prompt: string; answer: string | number; options?: string[]; hint: string };

const capacityQuestions: Question[] = [
  { prompt: "倒水至 250 mL", answer: 250, hint: "量杯每條刻度是 50 mL。" }, { prompt: "倒水至 500 mL", answer: 500, hint: "500 mL 是半升。" },
  { prompt: "倒水至 750 mL", answer: 750, hint: "由 500 mL 再加 250 mL。" }, { prompt: "倒水至 1000 mL", answer: 1000, hint: "1000 mL 就是 1 L。" },
  { prompt: "倒水至 350 mL", answer: 350, hint: "由 300 mL 再加一格。" }, { prompt: "倒水至 650 mL", answer: 650, hint: "600 mL 再加一格。" },
  { prompt: "倒水至 900 mL", answer: 900, hint: "離 1 L 還差 100 mL。" }, { prompt: "倒水至 450 mL", answer: 450, hint: "400 mL 再加一格。" },
];
const hourQuestions: Question[] = [
  { prompt: "下午 3 時", answer: "15:00", options: ["03:00", "12:00", "15:00", "18:00"], hint: "下午 3 時加上 12 小時。" }, { prompt: "晚上 8 時", answer: "20:00", options: ["08:00", "18:00", "20:00", "22:00"], hint: "晚上 8 時是 20:00。" },
  { prompt: "上午 9 時", answer: "09:00", options: ["09:00", "19:00", "12:00", "21:00"], hint: "上午的時間不用加 12。" }, { prompt: "中午 12 時", answer: "12:00", options: ["00:00", "12:00", "13:00", "22:00"], hint: "中午 12 時是 12:00。" },
  { prompt: "晚上 11 時", answer: "23:00", options: ["11:00", "21:00", "23:00", "01:00"], hint: "晚上 11 時加上 12 小時。" }, { prompt: "凌晨 1 時", answer: "01:00", options: ["01:00", "11:00", "13:00", "00:00"], hint: "凌晨 1 時在 24 小時制寫作 01:00。" },
  { prompt: "下午 6 時", answer: "18:00", options: ["06:00", "16:00", "18:00", "20:00"], hint: "下午 6 時加上 12 小時。" }, { prompt: "上午 11 時", answer: "11:00", options: ["23:00", "12:00", "11:00", "01:00"], hint: "上午 11 時保持 11:00。" },
];
const weightQuestions: Question[] = [
  { prompt: "用法碼湊出 500 g", answer: 500, hint: "可以用 500 g，或兩個 250 g。" }, { prompt: "用法碼湊出 750 g", answer: 750, hint: "試試 500 g 加 250 g。" },
  { prompt: "用法碼湊出 1000 g", answer: 1000, hint: "1000 g 是 1 kg。" }, { prompt: "用法碼湊出 1250 g", answer: 1250, hint: "先湊 1000 g，再加 250 g。" },
  { prompt: "用法碼湊出 600 g", answer: 600, hint: "500 g 加一個 100 g。" }, { prompt: "用法碼湊出 900 g", answer: 900, hint: "可用 500 g 加四個 100 g。" },
  { prompt: "用法碼湊出 1400 g", answer: 1400, hint: "先湊 1000 g，再加四個 100 g。" }, { prompt: "用法碼湊出 1750 g", answer: 1750, hint: "1500 g 再加 250 g。" },
];

const stationInfo: Record<Station, { key: string; title: string; accent: string; icon: string; questions: Question[]; detail: string }> = {
  capacity: { key: "p3-capacity", title: "容量：升與毫升", accent: "#4f6eae", icon: "🥛", questions: capacityQuestions, detail: "虛擬量杯讀刻度及換算" },
  hour: { key: "p3-24hour", title: "24 小時制時鐘", accent: "#c8811e", icon: "🕒", questions: hourQuestions, detail: "12 小時制與 24 小時制轉換" },
  weights: { key: "p3-weight-builder", title: "多法碼天平", accent: "#0e8b87", icon: "⚖️", questions: weightQuestions, detail: "選擇多個法碼湊出目標重量" },
};

export default function P3ProgressPractice() {
  const station = useMemo<Station>(() => location.pathname.includes("capacity") ? "capacity" : location.pathname.includes("24hour") ? "hour" : "weights", []);
  const info = stationInfo[station];
  const [index, setIndex] = useState(0);
  const [water, setWater] = useState(0);
  const [weights, setWeights] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [completed, setCompleted] = useState(false);
  const question = info.questions[index];
  const weightTotal = weights.reduce((total, value) => total + value, 0);
  const practiceHref = `/practice/${station === "capacity" ? "p3-capacity" : station === "hour" ? "p3-24hour" : "p3-weight-builder"}`;
  const historicalMisses = getReviewRecords().find((record) => record.key === info.key)?.misses ?? 0;

  const moveNext = () => {
    if (index === info.questions.length - 1) {
      markPracticeCompleted(info.key); recordDailyPractice(info.key); setCompleted(true); speakCantonese("你完成了八題挑戰，得到一顆完成星星！"); return;
    }
    setIndex((value) => value + 1); setWater(0); setWeights([]); setFeedback(null);
  };
  const recordIncorrect = () => {
    setFeedback("incorrect"); setMistakes((current) => current.includes(index) ? current : [...current, index]); speakTryAgain(); recordPracticeMistake({ key: info.key, grade: "P3", title: info.title, href: practiceHref });
  };
  const checkAnswer = (answer: string | number) => {
    if (answer === question.answer) { setFeedback("correct"); speakCorrectEncouragement(); } else recordIncorrect();
  };
  const resetCurrent = () => { setWater(0); setWeights([]); setFeedback(null); };
  const reviewMistakes = () => { setCompleted(false); setIndex(mistakes[0] ?? 0); resetCurrent(); speakCantonese("我們一起重溫答錯的題目。先聽提示，再慢慢試一次。"); };

  if (completed) return <main className="grid min-h-screen place-items-center bg-[#f8f5ed] p-6 text-[#172b3f]"><section className="max-w-lg rounded-[30px] border border-[#172b3f]/12 bg-white p-8 text-center shadow-[8px_8px_0_rgba(240,90,60,.14)]"><div className="text-6xl">🏆</div><p className="mt-5 font-mono text-xs font-bold tracking-[.14em] text-[#f05a3c]">P3 · COMPLETE STAR</p><h1 className="mt-3 text-3xl font-black">完成八題挑戰！</h1><p className="mt-3 leading-7 text-[#617286]">你已完成「{info.title}」並獲得完成星星。系統已為你更新每日練習紀錄。</p>{mistakes.length > 0 && <div className="mt-5 rounded-2xl bg-[#fff0e9] p-4 text-left text-[#b84c36]"><strong>錯題重溫 · {mistakes.length} 題</strong><p className="mt-1 text-sm">按下按鈕回到第一題答錯題目；每題會保留解題提示與朗讀。</p><button onClick={reviewMistakes} className="mt-3 rounded-xl bg-[#f05a3c] px-4 py-3 font-bold text-white">帶我重溫錯題</button></div>}<div className="mt-6 flex flex-wrap justify-center gap-3"><button onClick={() => { setCompleted(false); setIndex(0); setMistakes([]); resetCurrent(); }} className="inline-flex items-center gap-2 rounded-xl border border-[#172b3f]/15 px-4 py-3 font-bold"><RotateCcw className="size-4" /> 再玩一次</button><Link href="/#path" className="rounded-xl bg-[#f05a3c] px-4 py-3 font-bold text-white">返回題目庫</Link></div></section></main>;

  return <main className="min-h-screen bg-[#f8f5ed] px-5 py-7 text-[#172b3f] sm:px-7"><div className="mx-auto max-w-3xl"><Link href="/#path" className="font-bold hover:text-[#f05a3c]">← 返回題目庫</Link><header className="mt-7 flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-xs font-bold tracking-[.14em]" style={{ color: info.accent }}>P3 · {info.detail}</p><h1 className="mt-2 text-4xl font-black">{info.icon} {info.title}</h1></div><div className="flex items-center gap-2"><div className="rounded-full border border-[#172b3f]/12 bg-white px-4 py-2 font-mono text-sm font-bold">第 {index + 1} / 8 題</div>{historicalMisses > 0 && <span className="rounded-full bg-[#fff0e9] px-3 py-2 text-xs font-bold text-[#b84c36]">錯題紀錄 {historicalMisses}</span>}</div></header><section className="mt-6 rounded-[30px] border border-[#172b3f]/12 bg-white p-6 text-center shadow-[7px_7px_0_rgba(23,43,63,.05)] sm:p-8"><div className="flex items-center justify-between gap-4"><p className="font-mono text-[10px] font-bold tracking-[.14em]" style={{ color: info.accent }}>QUESTION {String(index + 1).padStart(2, "0")}</p><button onClick={() => speakCantonese(`${question.prompt}。${question.hint}`)} className="inline-flex items-center gap-1 rounded-full border border-[#172b3f]/12 px-3 py-2 text-xs font-bold"><Volume2 className="size-3" /> 聽題目</button></div><h2 className="mt-6 text-3xl font-black">{question.prompt}</h2><p className="mt-3 text-sm text-[#617286]">{station === "capacity" ? "拖動量杯刻度，再按核對。" : station === "weights" ? "可重複點選不同法碼，然後核對總重量。" : "點選正確的 24 小時制時間。"}</p>

  {station === "capacity" && <div className="mx-auto mt-7 max-w-sm"><div className="relative mx-auto flex h-64 w-40 items-end overflow-hidden rounded-b-[32px] border-4 bg-[#eef3fb]" style={{ borderColor: info.accent }}><div className="w-full bg-[#58bddc] transition-[height] duration-200" style={{ height: `${water / 10}%` }} /></div><input aria-label="量杯刻度" type="range" min="0" max="1000" step="50" value={water} onChange={(event) => { setWater(Number(event.target.value)); setFeedback(null); }} className="mt-5 w-full accent-[#f05a3c]" /><p className="mt-2 font-mono text-xl font-black">{water} mL</p><button onClick={() => checkAnswer(water)} className="mt-4 rounded-xl bg-[#f05a3c] px-5 py-3 font-bold text-white">核對刻度</button></div>}
  {station === "hour" && <div className="mt-7 grid gap-3 sm:grid-cols-2">{question.options?.map((option) => <button key={option} onClick={() => checkAnswer(option)} className="rounded-2xl border-2 border-[#172b3f]/12 bg-[#fffdf8] px-5 py-5 text-2xl font-black transition hover:-translate-y-0.5 hover:border-[#c8811e] hover:bg-[#fff8e9]">{option}</button>)}</div>}
  {station === "weights" && <div className="mt-7"><div className="rounded-2xl bg-[#eef7f5] p-5"><p className="font-mono text-xs font-bold text-[#0e756f]">已選法碼</p><strong className="mt-2 block text-4xl font-black">{weightTotal} g</strong><div className="mt-4 flex min-h-10 flex-wrap justify-center gap-2">{weights.length ? weights.map((weight, weightIndex) => <span key={`${weight}-${weightIndex}`} className="rounded-lg bg-white px-3 py-2 font-mono font-bold shadow-sm">{weight} g</span>) : <span className="text-sm text-[#617286]">尚未選擇法碼</span>}</div></div><div className="mt-5 grid grid-cols-3 gap-3">{[100, 250, 500].map((weight) => <button key={weight} onClick={() => { setWeights((current) => [...current, weight]); setFeedback(null); }} className="rounded-2xl border-2 border-[#0e8b87]/20 bg-[#f2fbf9] px-3 py-5 text-xl font-black transition hover:-translate-y-0.5 hover:border-[#0e8b87]">+ {weight} g</button>)}</div><div className="mt-4 flex flex-wrap justify-center gap-3"><button onClick={() => checkAnswer(weightTotal)} className="rounded-xl bg-[#f05a3c] px-5 py-3 font-bold text-white">核對重量</button><button onClick={resetCurrent} className="rounded-xl border border-[#172b3f]/15 px-5 py-3 font-bold">清除法碼</button></div></div>}

  {feedback && <div className={`mt-7 rounded-2xl p-5 ${feedback === "correct" ? "bg-[#e9f7f2] text-[#0e756f]" : "bg-[#fff0e9] text-[#b84c36]"}`}>{feedback === "correct" ? <><strong className="text-xl">答對了！</strong><p className="mt-1">{index === 3 ? "已完成第 4 題，喝口水再繼續吧！" : "你已找對答案。"}</p><button onClick={moveNext} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#0e8b87] px-4 py-3 font-bold text-white">{index === 7 ? <><Check className="size-4" /> 完成挑戰</> : "下一題 →"}</button></> : <><strong className="text-xl">再試一次</strong><p className="mt-1">提示：{question.hint}</p><button onClick={resetCurrent} className="mt-3 rounded-xl border border-current/25 px-4 py-2 font-bold">重設這題</button></>}</div>}</section></div></main>;
}
