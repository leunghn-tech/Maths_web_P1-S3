import { useState } from "react";
import { Link } from "wouter";
import { Check, RotateCcw, Trophy, Volume2, X } from "lucide-react";
import { markPracticeCompleted } from "@/lib/practiceCompletion";
import { recordDailyPractice } from "@/lib/dailyPractice";
import { recordPracticeMistake } from "@/lib/reviewRecommendations";
import { speakCantonese, speakCorrectEncouragement, speakTryAgain } from "@/lib/speech";

const numberComparisons = [
  { left: 4826, right: 4946 }, { left: 15320, right: 15020 }, { left: 29041, right: 29141 }, { left: 47680, right: 47480 },
  { left: 12005, right: 12105 }, { left: 34012, right: 33912 }, { left: 50876, right: 51076 }, { left: 69124, right: 68924 },
].map((question) => ({ ...question, answer: question.left > question.right ? "＞" : "＜" }));
const barTargets = [4, 6, 3, 5, 7, 2, 8, 4];
type Result = "idle" | "correct" | "incorrect";
const formatNumber = (value: number) => value.toLocaleString("en-US");

export default function P3DataPractice() {
  const mode = location.pathname.includes("large-numbers") ? "number" : "chart";
  const config = mode === "number"
    ? { key: "p3-large-numbers", title: "四位數與五位數", detail: "在數線上比較大數", href: "/practice/p3-large-numbers" }
    : { key: "p3-charts", title: "方塊圖與棒形圖", detail: "每格代表 1 個單位", href: "/practice/p3-charts" };
  const [index, setIndex] = useState(0);
  const [blocks, setBlocks] = useState(0);
  const [result, setResult] = useState<Result>("idle");
  const [finished, setFinished] = useState(false);
  const [mistakes, setMistakes] = useState<number[]>([]);
  const [firstData, setFirstData] = useState(4);
  const [secondData, setSecondData] = useState(6);
  const comparison = numberComparisons[index];
  const target = barTargets[index];
  const minimum = Math.max(0, Math.floor(Math.min(comparison.left, comparison.right) / 1000) * 1000 - 1000);
  const maximum = Math.ceil(Math.max(comparison.left, comparison.right) / 1000) * 1000 + 1000;
  const span = maximum - minimum;
  const position = (value: number) => `${8 + ((value - minimum) / span) * 84}%`;
  const prompt = mode === "number" ? `${formatNumber(comparison.left)} 和 ${formatNumber(comparison.right)}，哪一個比較符號正確？` : `用方塊做出 ${target} 格的棒形圖。每一格代表 1 個單位。`;

  const choose = (value: string | number) => {
    if (result !== "idle") return;
    const answer = mode === "number" ? comparison.answer : target;
    if (value === answer) { setResult("correct"); speakCorrectEncouragement(); return; }
    setResult("incorrect"); setMistakes((items) => items.includes(index) ? items : [...items, index]); speakTryAgain();
    recordPracticeMistake({ key: config.key, grade: "P3", title: config.title, href: config.href });
  };
  const next = () => {
    if (index === 7) { markPracticeCompleted(config.key); recordDailyPractice(config.key); setFinished(true); speakCantonese("你完成了八題挑戰，得到一顆完成星星！"); return; }
    setIndex((current) => current + 1); setBlocks(0); setResult("idle");
  };
  const retry = () => { setBlocks(0); setResult("idle"); };
  const restart = () => { setIndex(0); setBlocks(0); setResult("idle"); setFinished(false); setMistakes([]); };
  const reviewMistakes = () => { setFinished(false); setIndex(mistakes[0] ?? 0); setBlocks(0); setResult("idle"); };

  if (finished) return <main className="grid min-h-screen place-items-center bg-[#f8f5ed] p-6 text-[#172b3f]"><section className="max-w-lg rounded-[30px] border border-[#172b3f]/12 bg-white p-8 text-center shadow-[8px_8px_0_rgba(240,90,60,.14)]"><Trophy className="mx-auto size-14 text-[#c8811e]" /><p className="mt-5 font-mono text-xs font-bold tracking-[.14em] text-[#f05a3c]">P3 · COMPLETE STAR</p><h1 className="mt-3 text-3xl font-black">完成八題挑戰！</h1><p className="mt-3 leading-7 text-[#617286]">你已完成「{config.title}」並獲得完成星星。</p>{mistakes.length > 0 && <button onClick={reviewMistakes} className="mt-5 rounded-xl border border-[#f05a3c]/30 bg-[#fff0e9] px-4 py-3 font-bold text-[#b84c36]">重溫 {mistakes.length} 題錯題</button>}<div className="mt-6 flex flex-wrap justify-center gap-3"><button onClick={restart} className="inline-flex items-center gap-2 rounded-xl border border-[#172b3f]/15 px-4 py-3 font-bold"><RotateCcw className="size-4" /> 再玩一次</button><Link href="/#path" className="rounded-xl bg-[#f05a3c] px-4 py-3 font-bold text-white">返回題目庫</Link></div></section></main>;

  return <main className="min-h-screen bg-[#f8f5ed] px-5 py-7 text-[#172b3f] sm:px-7"><div className="mx-auto max-w-3xl"><Link href="/#path" className="font-bold hover:text-[#f05a3c]">← 返回題目庫</Link><header className="mt-7 flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-xs font-bold tracking-[.14em] text-[#4f6eae]">P3 · {config.detail}</p><h1 className="mt-2 text-4xl font-black">{mode === "number" ? "四位數與五位數" : "方塊圖與棒形圖"}</h1></div><div className="rounded-full border border-[#172b3f]/12 bg-white px-4 py-2 font-mono text-sm font-bold">第 {index + 1} / 8 題</div></header><section className="mq-practice-card mt-6 rounded-3xl border bg-white p-6 text-center shadow-[7px_7px_0_rgba(23,43,63,.05)] sm:p-8"><div className="flex items-center justify-between gap-4"><p className="font-mono text-[10px] font-bold tracking-[.14em] text-[#4f6eae]">QUESTION {String(index + 1).padStart(2, "0")}</p><button onClick={() => speakCantonese(prompt)} className="inline-flex items-center gap-1 rounded-full border border-[#172b3f]/12 px-3 py-2 text-xs font-bold"><Volume2 className="size-3" /> 聽題目</button></div>
    {mode === "number" ? <><h2 className="mt-6 text-3xl font-black">{formatNumber(comparison.left)}　__　{formatNumber(comparison.right)}</h2><div className="mq-p2-numberline mx-auto my-10 max-w-2xl"><span className="mq-line-label left">{formatNumber(minimum)}</span><span className="mq-line-label right">{formatNumber(maximum)}</span><i /><b style={{ left: position(comparison.left) }}>{formatNumber(comparison.left)}</b><b style={{ left: position(comparison.right) }}>{formatNumber(comparison.right)}</b></div><p>在數線上比較兩個數，選出正確符號。</p><div className="mq-concept-choices mt-6"><button onClick={() => choose("＞")}>＞</button><button onClick={() => choose("＜")}>＜</button></div></> : <><h2 className="mt-6 text-2xl font-black">用方塊做出 {target} 格的棒形圖</h2><p className="mt-2 text-sm text-[#617286]">每一格代表 1 個單位。</p><div className="mx-auto my-8 flex h-60 w-28 flex-col-reverse gap-1 border-x-4 border-b-4 border-[#4f6eae] p-2">{Array.from({ length: blocks }, (_, item) => <i key={item} className="h-6 bg-[#f6be5d]" />)}</div><div className="flex flex-wrap justify-center gap-2"><button className="rounded-xl border px-4 py-2 font-bold" onClick={() => { setBlocks((value) => Math.min(10, value + 1)); setResult("idle"); }}>加入一格 ＋</button><button className="rounded-xl border px-4 py-2" onClick={() => { setBlocks((value) => Math.max(0, value - 1)); setResult("idle"); }}>移走一格</button></div><p className="mt-3">已放 {blocks} 格</p><button className="mq-start mt-4 rounded-xl bg-[#f05a3c] px-5 py-3 text-white" onClick={() => choose(blocks)}>核對棒形圖</button><div className="mt-8 border-t pt-5"><b>自訂資料小工房</b><div className="mt-3 flex justify-center gap-3"><label>甲 <input type="number" min="0" max="10" value={firstData} onChange={(event) => setFirstData(Number(event.target.value))} /></label><label>乙 <input type="number" min="0" max="10" value={secondData} onChange={(event) => setSecondData(Number(event.target.value))} /></label></div><div className="mt-3 flex h-28 items-end justify-center gap-6" aria-label={`甲有 ${firstData} 個單位，乙有 ${secondData} 個單位`}><i className="w-10 bg-[#f6be5d]" style={{ height: `${firstData * 10}px` }} /><i className="w-10 bg-[#4f6eae]" style={{ height: `${secondData * 10}px` }} /></div></div></>}
    {result !== "idle" && <div className={`mx-auto mt-6 flex max-w-xl items-center justify-center gap-2 rounded-2xl border p-4 font-bold ${result === "correct" ? "border-[#0e8b87]/25 bg-[#e8f5f2] text-[#135d59]" : "border-[#f05a3c]/25 bg-[#fff0e9] text-[#8c3f2e]"}`}>{result === "correct" ? <Check className="size-5" /> : <X className="size-5" />}{result === "correct" ? "答對了！" : mode === "number" ? "再看一看，數線右邊的數較大。" : "再數一數已放的方塊。"}</div>}<div className="mt-6">{result === "correct" ? <button className="mq-start rounded-xl bg-[#f05a3c] px-5 py-3 text-white" onClick={next}>{index === 7 ? "完成挑戰" : "下一題"}</button> : result === "incorrect" ? <button className="mq-start rounded-xl bg-[#f05a3c] px-5 py-3 text-white" onClick={retry}><RotateCcw className="mr-1 inline size-4" />再試一次</button> : null}</div></section></div></main>;
}
