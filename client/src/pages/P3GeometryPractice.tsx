import { useState } from "react";
import { Link } from "wouter";
import { Check, RotateCcw, Trophy, Volume2, X } from "lucide-react";
import { markPracticeCompleted } from "@/lib/practiceCompletion";
import { recordDailyPractice } from "@/lib/dailyPractice";
import { recordPracticeMistake } from "@/lib/reviewRecommendations";
import { speakCantonese, speakCorrectEncouragement, speakTryAgain } from "@/lib/speech";

const questions = [
  { text: "同一平面內，兩條永不相交的直線", answer: "平行線", symbol: "＝", hint: "兩條線一直延長，也不會相交。" },
  { text: "兩條相交後形成直角的直線", answer: "垂直線", symbol: "⊥", hint: "直角是 90°。" },
  { text: "長方形的上邊和下邊", answer: "平行線", symbol: "＝", hint: "上邊和下邊不會相交。" },
  { text: "正方形一個角的兩條邊", answer: "垂直線", symbol: "⊥", hint: "正方形的每一個角都是直角。" },
  { text: "方格紙上同方向的兩條橫線", answer: "平行線", symbol: "＝", hint: "兩條橫線的距離處處相等。" },
  { text: "長方形相鄰的兩條邊", answer: "垂直線", symbol: "⊥", hint: "相鄰的兩條邊在角位形成直角。" },
  { text: "直尺畫出的兩條相隔相等的橫線", answer: "平行線", symbol: "＝", hint: "兩條線永不相交。" },
  { text: "一條直立線和一條水平線相交", answer: "垂直線", symbol: "⊥", hint: "相交成直角就是垂直。" },
];
type Result = "idle" | "correct" | "incorrect";

export default function P3GeometryPractice() {
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<Result>("idle");
  const [finished, setFinished] = useState(false);
  const [mistakes, setMistakes] = useState<number[]>([]);
  const question = questions[index];
  const choose = (answer: string) => {
    if (result !== "idle") return;
    if (answer === question.answer) { setResult("correct"); speakCorrectEncouragement(); return; }
    setResult("incorrect"); setMistakes((items) => items.includes(index) ? items : [...items, index]); speakTryAgain();
    recordPracticeMistake({ key: "p3-parallel-perpendicular", grade: "P3", title: "平行線與垂直線", href: "/practice/p3-parallel-perpendicular" });
  };
  const next = () => {
    if (index === 7) { markPracticeCompleted("p3-parallel-perpendicular"); recordDailyPractice("p3-parallel-perpendicular"); setFinished(true); speakCantonese("你完成了八題挑戰，得到一顆完成星星！"); return; }
    setIndex((value) => value + 1); setResult("idle");
  };
  const restart = () => { setIndex(0); setResult("idle"); setFinished(false); setMistakes([]); };
  const review = () => { setFinished(false); setIndex(mistakes[0] ?? 0); setResult("idle"); };
  if (finished) return <main className="grid min-h-screen place-items-center bg-[#f8f5ed] p-6 text-[#172b3f]"><section className="max-w-lg rounded-[30px] border border-[#172b3f]/12 bg-white p-8 text-center shadow-[8px_8px_0_rgba(240,90,60,.14)]"><Trophy className="mx-auto size-14 text-[#c8811e]" /><p className="mt-5 font-mono text-xs font-bold tracking-[.14em] text-[#f05a3c]">P3 · COMPLETE STAR</p><h1 className="mt-3 text-3xl font-black">完成八題挑戰！</h1><p className="mt-3 leading-7 text-[#617286]">你已完成「平行線與垂直線」並獲得完成星星。</p>{mistakes.length > 0 && <button onClick={review} className="mt-5 rounded-xl border border-[#f05a3c]/30 bg-[#fff0e9] px-4 py-3 font-bold text-[#b84c36]">重溫 {mistakes.length} 題錯題</button>}<div className="mt-6 flex flex-wrap justify-center gap-3"><button onClick={restart} className="inline-flex items-center gap-2 rounded-xl border border-[#172b3f]/15 px-4 py-3 font-bold"><RotateCcw className="size-4" /> 再玩一次</button><Link href="/#path" className="rounded-xl bg-[#f05a3c] px-4 py-3 font-bold text-white">返回題目庫</Link></div></section></main>;
  return <main className="min-h-screen bg-[#f8f5ed] p-6 text-[#172b3f]"><div className="mx-auto max-w-3xl"><Link href="/#path" className="font-bold hover:text-[#f05a3c]">← 返回題目庫</Link><header className="mt-8 flex items-end justify-between gap-4"><div><p className="font-mono text-[#4f6eae]">P3 · 幾何互動站</p><h1 className="mt-2 text-4xl font-black">平行線與垂直線</h1></div><p className="rounded-full border bg-white px-4 py-2 font-mono font-bold">第 {index + 1} / 8 題</p></header><section className="mq-practice-card mt-6 rounded-3xl border bg-white p-8 text-center"><div className="flex justify-end"><button onClick={() => speakCantonese(`${question.text}。${question.hint}`)} className="inline-flex items-center gap-1 rounded-full border border-[#172b3f]/12 px-3 py-2 text-xs font-bold"><Volume2 className="size-3" /> 聽題目</button></div><div className="my-7 text-8xl text-[#4f6eae]" aria-hidden="true">{question.symbol}</div><h2 className="text-2xl font-black">{question.text} 是甚麼？</h2><p className="mt-3 text-sm text-[#617286]">選出正確的線條關係。</p><div className="mq-concept-choices mt-8"><button onClick={() => choose("平行線")} disabled={result !== "idle"}>平行線</button><button onClick={() => choose("垂直線")} disabled={result !== "idle"}>垂直線</button></div>{result !== "idle" && <div className={`mx-auto mt-7 max-w-xl rounded-2xl border p-4 font-bold ${result === "correct" ? "border-[#0e8b87]/25 bg-[#e8f5f2] text-[#135d59]" : "border-[#f05a3c]/25 bg-[#fff0e9] text-[#8c3f2e]"}`}>{result === "correct" ? <Check className="mr-2 inline size-5" /> : <X className="mr-2 inline size-5" />}{result === "correct" ? "答對了！" : `再試一次。提示：${question.hint}`}</div>}<div className="mt-6">{result === "correct" ? <button className="mq-start rounded-xl bg-[#f05a3c] px-5 py-3 text-white" onClick={next}>{index === 7 ? "完成挑戰" : "下一題"}</button> : result === "incorrect" ? <button className="mq-start rounded-xl bg-[#f05a3c] px-5 py-3 text-white" onClick={() => setResult("idle")}><RotateCcw className="mr-1 inline size-4" />再試一次</button> : null}</div></section></div></main>;
}
