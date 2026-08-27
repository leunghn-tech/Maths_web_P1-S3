import { useState } from "react";
import { Link } from "wouter";
import { Check, RotateCcw, Trophy, Volume2, X } from "lucide-react";
import { markPracticeCompleted } from "@/lib/practiceCompletion";
import { recordDailyPractice } from "@/lib/dailyPractice";
import { recordPracticeMistake } from "@/lib/reviewRecommendations";
import { speakCantonese, speakCorrectEncouragement, speakTryAgain } from "@/lib/speech";

const routeQuestions = [
  { destination: "花園", moves: "向右走 1 格，再向上走 1 格", answer: "東北", arrow: "↗" }, { destination: "禮堂", moves: "向左走 1 格，再向上走 1 格", answer: "西北", arrow: "↖" },
  { destination: "操場", moves: "向右走 1 格，再向下走 1 格", answer: "東南", arrow: "↘" }, { destination: "食堂", moves: "向左走 1 格，再向下走 1 格", answer: "西南", arrow: "↙" },
  { destination: "校務處", moves: "向右走 2 格", answer: "東", arrow: "→" }, { destination: "音樂室", moves: "向左走 2 格", answer: "西", arrow: "←" },
  { destination: "圖書館", moves: "向上走 2 格", answer: "北", arrow: "↑" }, { destination: "醫療室", moves: "向下走 2 格", answer: "南", arrow: "↓" },
];
export const comparisonQuestions = [{ a: 4, b: 2, unit: 5 }, { a: 3, b: 5, unit: 2 }, { a: 6, b: 4, unit: 2 }, { a: 2, b: 5, unit: 5 }, { a: 5, b: 3, unit: 2 }, { a: 4, b: 6, unit: 5 }, { a: 3, b: 2, unit: 10 }, { a: 5, b: 4, unit: 2 }].map((item) => ({ ...item, answer: Math.abs(item.a - item.b) * item.unit }));
type Result = "idle" | "correct" | "incorrect";
const unique = <T,>(values: T[]) => Array.from(new Set(values));
export const comparisonChoices = (bar: { answer: number; unit: number }) => unique([bar.answer, bar.answer + bar.unit, bar.answer - bar.unit, bar.answer + bar.unit * 2, bar.answer + bar.unit * 3]).filter((value) => value > 0).slice(0, 4).map((value) => `${value} 人`);

export default function P4AdvancedDataPractice() {
  const mode = location.pathname.includes("route") ? "route" : "bar";
  const config = mode === "route" ? { key: "p4-route-planning", title: "八方向路線規劃", detail: "由圖書館出發找方向", href: "/practice/p4-route-planning" } : { key: "p4-bar-compare", title: "棒形圖兩組資料比較", detail: "計算兩組資料的相差數量", href: "/practice/p4-bar-compare" };
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<Result>("idle");
  const [finished, setFinished] = useState(false);
  const [mistakes, setMistakes] = useState<number[]>([]);
  const route = routeQuestions[index];
  const bar = comparisonQuestions[index];
  const answer = mode === "route" ? route.answer : `${bar.answer} 人`;
  const options = mode === "route" ? ["東北", "西北", "東南", "西南", "東", "西", "北", "南"] : comparisonChoices(bar);
  const prompt = mode === "route" ? `小明由圖書館出發，${route.moves}，到達${route.destination}。${route.destination}在圖書館的哪個方向？` : `甲有 ${bar.a} 格，乙有 ${bar.b} 格，每格代表 ${bar.unit} 人。兩組相差多少人？`;
  const choose = (value: string) => { if (result !== "idle") return; if (value === answer) { setResult("correct"); speakCorrectEncouragement(); return; } setResult("incorrect"); setMistakes((items) => items.includes(index) ? items : [...items, index]); speakTryAgain(); recordPracticeMistake({ key: config.key, grade: "P4", title: config.title, href: config.href }); };
  const next = () => { if (index === 7) { markPracticeCompleted(config.key); recordDailyPractice(config.key); setFinished(true); speakCantonese("你完成了八題挑戰，得到一顆完成星星！"); return; } setIndex((value) => value + 1); setResult("idle"); };
  const restart = () => { setIndex(0); setResult("idle"); setFinished(false); setMistakes([]); };
  const review = () => { setFinished(false); setIndex(mistakes[0] ?? 0); setResult("idle"); };
  if (finished) return <main className="grid min-h-screen place-items-center bg-[#f8f5ed] p-6 text-[#172b3f]"><section className="max-w-lg rounded-[30px] border border-[#172b3f]/12 bg-white p-8 text-center shadow-[8px_8px_0_rgba(240,90,60,.14)]"><Trophy className="mx-auto size-14 text-[#c8811e]" /><p className="mt-5 font-mono text-xs font-bold tracking-[.14em] text-[#f05a3c]">P4 · COMPLETE STAR</p><h1 className="mt-3 text-3xl font-black">完成八題挑戰！</h1><p className="mt-3 leading-7 text-[#617286]">你已完成「{config.title}」並獲得完成星星。</p>{mistakes.length > 0 && <button onClick={review} className="mt-5 rounded-xl border border-[#f05a3c]/30 bg-[#fff0e9] px-4 py-3 font-bold text-[#b84c36]">重溫 {mistakes.length} 題錯題</button>}<div className="mt-6 flex flex-wrap justify-center gap-3"><button onClick={restart} className="inline-flex items-center gap-2 rounded-xl border border-[#172b3f]/15 px-4 py-3 font-bold"><RotateCcw className="size-4" /> 再玩一次</button><Link href="/#path" className="rounded-xl bg-[#f05a3c] px-4 py-3 font-bold text-white">返回題目庫</Link></div></section></main>;
  return <main className="min-h-screen bg-[#f8f5ed] p-6 text-[#172b3f]"><div className="mx-auto max-w-3xl"><Link href="/#path" className="font-bold hover:text-[#f05a3c]">← 返回題目庫</Link><header className="mt-8 flex items-end justify-between gap-4"><div><p className="font-mono text-xs font-bold tracking-[.14em] text-[#6c8b4c]">P4 · {config.detail}</p><h1 className="mt-2 text-4xl font-black">{config.title}</h1></div><p className="rounded-full border bg-white px-4 py-2 font-mono font-bold">第 {index + 1} / 8 題</p></header><section className="mq-practice-card mt-6 rounded-3xl border bg-white p-6 text-center shadow-[7px_7px_0_rgba(23,43,63,.05)] sm:p-8"><div className="flex justify-end"><button onClick={() => speakCantonese(prompt)} className="inline-flex items-center gap-1 rounded-full border border-[#172b3f]/12 px-3 py-2 text-xs font-bold"><Volume2 className="size-3" /> 聽題目</button></div>{mode === "route" ? <><div className="my-7 text-8xl text-[#6c8b4c]" aria-hidden="true">{route.arrow}</div><h2 className="mx-auto max-w-xl text-2xl font-black">小明由圖書館出發，{route.moves}，到達{route.destination}。</h2><p className="mt-3">{route.destination}在圖書館的哪個方向？</p></> : <><h2 className="mt-6 text-2xl font-black">甲有 {bar.a} 格，乙有 {bar.b} 格，每格代表 {bar.unit} 人。</h2><div className="my-7 flex h-52 items-end justify-center gap-10"><div><i className="mx-auto block w-14 bg-[#6c8b4c]" style={{ height: bar.a * 24 }} /><p className="mt-2 font-bold">甲</p></div><div><i className="mx-auto block w-14 bg-[#f6be5d]" style={{ height: bar.b * 24 }} /><p className="mt-2 font-bold">乙</p></div></div><p>兩組相差多少人？</p></>}<div className="mq-concept-choices mx-auto mt-8">{options.map((option) => <button key={option} onClick={() => choose(option)} disabled={result !== "idle"}>{option}</button>)}</div>{result !== "idle" && <div className={`mx-auto mt-6 max-w-xl rounded-2xl border p-4 font-bold ${result === "correct" ? "border-[#0e8b87]/25 bg-[#e8f5f2] text-[#135d59]" : "border-[#f05a3c]/25 bg-[#fff0e9] text-[#8c3f2e]"}`}>{result === "correct" ? <Check className="mr-2 inline size-5" /> : <X className="mr-2 inline size-5" />}{result === "correct" ? "答對了！" : mode === "route" ? `再試一次。圖中的箭咀 ${route.arrow} 表示${route.answer}。` : `再試一次。相差 ${Math.abs(bar.a - bar.b)} 格，${Math.abs(bar.a - bar.b)} × ${bar.unit} = ${bar.answer} 人。`}</div>}<div className="mt-6">{result === "correct" ? <button className="mq-start rounded-xl bg-[#f05a3c] px-5 py-3 text-white" onClick={next}>{index === 7 ? "完成挑戰" : "下一題"}</button> : result === "incorrect" ? <button className="mq-start rounded-xl bg-[#f05a3c] px-5 py-3 text-white" onClick={() => setResult("idle")}><RotateCcw className="mr-1 inline size-4" />再試一次</button> : null}</div></section></div></main>;
}
