import { useState } from "react";
import { Link } from "wouter";
import { Check, RotateCcw, Trophy, Volume2, X } from "lucide-react";
import { markPracticeCompleted } from "@/lib/practiceCompletion";
import { recordDailyPractice } from "@/lib/dailyPractice";
import { recordPracticeMistake } from "@/lib/reviewRecommendations";
import { speakCantonese, speakCorrectEncouragement, speakTryAgain } from "@/lib/speech";

const calculationQuestions = [
  { expression: "6 + (3 × 4)", answer: 18, hint: "先算括號內的乘法：3 × 4 = 12，然後算 6 + 12。" }, { expression: "(20 − 8) ÷ 3", answer: 4, hint: "先算括號內的減法：20 − 8 = 12，然後算 12 ÷ 3。" },
  { expression: "5 × (7 − 3)", answer: 20, hint: "先算括號內的減法：7 − 3 = 4，然後算 5 × 4。" }, { expression: "(12 + 6) ÷ 3", answer: 6, hint: "先算括號內的加法：12 + 6 = 18，然後算 18 ÷ 3。" },
  { expression: "4 + (6 × 2)", answer: 16, hint: "先算括號內的乘法：6 × 2 = 12，然後算 4 + 12。" }, { expression: "(15 − 3) ÷ 2", answer: 6, hint: "先算括號內的減法：15 − 3 = 12，然後算 12 ÷ 2。" },
  { expression: "3 × (5 + 2)", answer: 21, hint: "先算括號內的加法：5 + 2 = 7，然後算 3 × 7。" }, { expression: "(18 ÷ 3) + 4", answer: 10, hint: "先算括號內的除法：18 ÷ 3 = 6，然後算 6 + 4。" },
];
const shapeQuestions = [
  { text: "有兩組對邊分別平行", answer: "平行四邊形", symbol: "▱", hint: "平行四邊形有兩組對邊分別平行。" }, { text: "只有一組對邊平行", answer: "梯形", symbol: "⏢", hint: "梯形只有一組對邊平行。" },
  { text: "對邊一樣長，而且分別平行", answer: "平行四邊形", symbol: "▱", hint: "平行四邊形的對邊一樣長，而且分別平行。" }, { text: "上邊和下邊平行，另外一組對邊不平行", answer: "梯形", symbol: "⏢", hint: "這是梯形的一組對邊平行。" },
  { text: "有兩組平行邊的四邊形", answer: "平行四邊形", symbol: "▱", hint: "兩組對邊分別平行的是平行四邊形。" }, { text: "有一組平行邊的四邊形", answer: "梯形", symbol: "⏢", hint: "只有一組對邊平行的是梯形。" },
  { text: "兩組對邊分別平行的四邊形", answer: "平行四邊形", symbol: "▱", hint: "兩組對邊分別平行是平行四邊形的特性。" }, { text: "四邊形中只有一組對邊平行", answer: "梯形", symbol: "⏢", hint: "梯形只有一組對邊平行。" },
];
type Result = "idle" | "correct" | "incorrect";
function choicesFor(answer: number) { return Array.from(new Set([answer, Math.max(1, answer - 2), answer + 2, answer + 4])); }

export default function P3CorePractice() {
  const mode = location.pathname.includes("mixed") ? "calculation" : "shape";
  const config = mode === "calculation" ? { key: "p3-mixed-steps", title: "四則混合計算", detail: "先算括號內的運算", href: "/practice/p3-mixed-steps" } : { key: "p3-parallelogram-trapezium", title: "平行四邊形與梯形", detail: "辨認四邊形的平行邊", href: "/practice/p3-parallelogram-trapezium" };
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<Result>("idle");
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);
  const [mistakes, setMistakes] = useState<number[]>([]);
  const calculation = calculationQuestions[index];
  const shape = shapeQuestions[index];
  const answer = mode === "calculation" ? calculation.answer : shape.answer;
  const options = mode === "calculation" ? choicesFor(calculation.answer) : ["平行四邊形", "梯形"];
  const prompt = mode === "calculation" ? `${calculation.expression} 等於多少？${calculation.hint}` : `${shape.text}，是甚麼圖形？${shape.hint}`;
  const choose = (option: string | number) => {
    if (result !== "idle") return;
    if (option === answer) { setResult("correct"); speakCorrectEncouragement(); return; }
    setResult("incorrect"); setMistakes((items) => items.includes(index) ? items : [...items, index]); speakTryAgain();
    recordPracticeMistake({ key: config.key, grade: "P3", title: config.title, href: config.href });
  };
  const next = () => {
    if (index === 7) { markPracticeCompleted(config.key); recordDailyPractice(config.key); setFinished(true); speakCantonese("你完成了八題挑戰，得到一顆完成星星！"); return; }
    setIndex((value) => value + 1); setResult("idle"); setShowHint(false);
  };
  const restart = () => { setIndex(0); setResult("idle"); setShowHint(false); setFinished(false); setMistakes([]); };
  const review = () => { setFinished(false); setIndex(mistakes[0] ?? 0); setResult("idle"); setShowHint(true); };
  if (finished) return <main className="grid min-h-screen place-items-center bg-[#f8f5ed] p-6 text-[#172b3f]"><section className="max-w-lg rounded-[30px] border border-[#172b3f]/12 bg-white p-8 text-center shadow-[8px_8px_0_rgba(240,90,60,.14)]"><Trophy className="mx-auto size-14 text-[#c8811e]" /><p className="mt-5 font-mono text-xs font-bold tracking-[.14em] text-[#f05a3c]">P3 · COMPLETE STAR</p><h1 className="mt-3 text-3xl font-black">完成八題挑戰！</h1><p className="mt-3 leading-7 text-[#617286]">你已完成「{config.title}」並獲得完成星星。</p>{mistakes.length > 0 && <button onClick={review} className="mt-5 rounded-xl border border-[#f05a3c]/30 bg-[#fff0e9] px-4 py-3 font-bold text-[#b84c36]">重溫 {mistakes.length} 題錯題</button>}<div className="mt-6 flex flex-wrap justify-center gap-3"><button onClick={restart} className="inline-flex items-center gap-2 rounded-xl border border-[#172b3f]/15 px-4 py-3 font-bold"><RotateCcw className="size-4" /> 再玩一次</button><Link href="/#path" className="rounded-xl bg-[#f05a3c] px-4 py-3 font-bold text-white">返回題目庫</Link></div></section></main>;
  return <main className="min-h-screen bg-[#f8f5ed] p-6 text-[#172b3f]"><div className="mx-auto max-w-3xl"><Link href="/#path" className="font-bold hover:text-[#f05a3c]">← 返回題目庫</Link><header className="mt-7 flex flex-wrap items-end justify-between gap-3"><div><p className="font-mono text-xs font-bold tracking-[.14em] text-[#4f6eae]">P3 · {config.detail}</p><h1 className="mt-2 text-4xl font-black">{config.title}</h1></div><p className="rounded-full border bg-white px-4 py-2 font-mono font-bold">第 {index + 1} / 8 題</p></header><section className="mq-practice-card mt-6 rounded-3xl border bg-white p-8 text-center"><div className="flex justify-end"><button onClick={() => speakCantonese(prompt)} className="inline-flex items-center gap-1 rounded-full border border-[#172b3f]/12 px-3 py-2 text-xs font-bold"><Volume2 className="size-3" /> 聽題目</button></div><div className="my-8 grid place-items-center text-6xl text-[#4f6eae]">{mode === "calculation" ? <><i className="mb-2 font-mono text-xs not-italic text-[#f05a3c]">( ) 先算</i>{calculation.expression}</> : shape.symbol}</div><h2 className="text-2xl font-black">{mode === "calculation" ? "答案是多少？" : `${shape.text}，是甚麼圖形？`}</h2>{mode === "calculation" && <><button className="mt-4 rounded-xl border border-dashed border-[#f05a3c] px-4 py-2 font-bold" onClick={() => setShowHint((value) => !value)}>看步驟提示</button>{showHint && <p className="mt-3 font-bold text-[#c8811e]">解題提示：{calculation.hint}</p>}</>}<div className="mq-concept-choices mt-8">{options.map((option) => <button key={option} onClick={() => choose(option)} disabled={result !== "idle"}>{option}</button>)}</div>{result !== "idle" && <div className={`mx-auto mt-6 max-w-xl rounded-2xl border p-4 font-bold ${result === "correct" ? "border-[#0e8b87]/25 bg-[#e8f5f2] text-[#135d59]" : "border-[#f05a3c]/25 bg-[#fff0e9] text-[#8c3f2e]"}`}>{result === "correct" ? <Check className="mr-2 inline size-5" /> : <X className="mr-2 inline size-5" />}{result === "correct" ? "答對了！" : `再試一次。提示：${mode === "calculation" ? calculation.hint : shape.hint}`}</div>}<div className="mt-6">{result === "correct" ? <button className="mq-start rounded-xl bg-[#f05a3c] px-5 py-3 text-white" onClick={next}>{index === 7 ? "完成挑戰" : "下一題"}</button> : result === "incorrect" ? <button className="mq-start rounded-xl bg-[#f05a3c] px-5 py-3 text-white" onClick={() => setResult("idle")}><RotateCcw className="mr-1 inline size-4" />再試一次</button> : null}</div></section></div></main>;
}
