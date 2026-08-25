import { useState } from "react";
import { Link } from "wouter";
import { Check, RotateCcw, Trophy, Volume2, X } from "lucide-react";
import { markPracticeCompleted } from "@/lib/practiceCompletion";
import { recordDailyPractice } from "@/lib/dailyPractice";
import { recordPracticeMistake } from "@/lib/reviewRecommendations";
import { speakCantonese, speakCorrectEncouragement, speakTryAgain } from "@/lib/speech";

type Question = { text: string; answer: number; unit: string };
const areaQuestions: Question[] = [
  { text: "長 4 格、闊 3 格", answer: 12, unit: "平方格" }, { text: "長 5 格、闊 2 格", answer: 10, unit: "平方格" }, { text: "長 6 格、闊 3 格", answer: 18, unit: "平方格" }, { text: "長 4 格、闊 4 格", answer: 16, unit: "平方格" },
  { text: "長 7 格、闊 2 格", answer: 14, unit: "平方格" }, { text: "長 5 格、闊 4 格", answer: 20, unit: "平方格" }, { text: "長 3 格、闊 3 格", answer: 9, unit: "平方格" }, { text: "長 8 格、闊 2 格", answer: 16, unit: "平方格" },
];
const storyQuestions: Question[] = [
  { text: "媽媽買了 2 包鉛筆，每包有 3 枝，再加 4 枝，一共有多少枝？", answer: 10, unit: "枝" }, { text: "有 3 盒餅乾，每盒有 4 塊，吃了 2 塊，還剩多少塊？", answer: 10, unit: "塊" },
  { text: "有 5 袋蘋果，每袋有 2 個，再買 3 個，一共有多少個？", answer: 13, unit: "個" }, { text: "有 4 杯水，每杯有 300 mL，倒去 200 mL，還有多少 mL？", answer: 1000, unit: "mL" },
  { text: "有 6 包卡，每包有 2 張，加 1 張，一共有多少張？", answer: 13, unit: "張" }, { text: "有 3 排椅子，每排有 5 張，搬走 2 張，還剩多少張？", answer: 13, unit: "張" },
  { text: "有 2 盒糖，每盒有 6 粒，加 4 粒，一共有多少粒？", answer: 16, unit: "粒" }, { text: "有 5 袋橙，每袋有 3 個，再送 1 個，一共有多少個？", answer: 16, unit: "個" },
];
const shopQuestions: Question[] = [
  { text: "2 瓶牛奶，每瓶有 500 mL，共有多少 mL？", answer: 1000, unit: "mL" }, { text: "3 包麵粉，每包有 250 g，共有多少 g？", answer: 750, unit: "g" },
  { text: "1 L 果汁加 500 mL 果汁，共有多少 mL？", answer: 1500, unit: "mL" }, { text: "2 kg 米加 500 g 米，共有多少 g？", answer: 2500, unit: "g" },
  { text: "4 罐湯，每罐有 250 mL，共有多少 mL？", answer: 1000, unit: "mL" }, { text: "3 包糖，每包有 1 kg，共有多少 g？", answer: 3000, unit: "g" },
  { text: "500 g 朱古力加 500 g 餅乾，共有多少 g？", answer: 1000, unit: "g" }, { text: "2 L 水加 1 L 水，共有多少 mL？", answer: 3000, unit: "mL" },
];
const dimensions = [[4, 3], [5, 2], [6, 3], [4, 4], [7, 2], [5, 4], [3, 3], [8, 2]];
type Result = "idle" | "correct" | "incorrect";
function choicesFor(question: Question) { const step = question.answer >= 100 ? Math.max(100, question.answer === 750 ? 250 : 500) : 2; return Array.from(new Set([question.answer, Math.max(1, question.answer - step), question.answer + step, question.answer + step * 2])); }

export default function P3FinalPractice() {
  const mode = location.pathname.includes("perimeter") ? "area" : location.pathname.includes("mixed-stories") ? "story" : "shop";
  const config = mode === "area" ? { key: "p3-perimeter-area", title: "長方形面積", detail: "在方格紙上數面積", href: "/practice/p3-perimeter-area" } : mode === "story" ? { key: "p3-mixed-stories", title: "混合計算生活題", detail: "把文字轉成算式", href: "/practice/p3-mixed-stories" } : { key: "p3-shopping-measure", title: "超市重量與容量", detail: "統一單位後計算", href: "/practice/p3-shopping-measure" };
  const data = mode === "area" ? areaQuestions : mode === "story" ? storyQuestions : shopQuestions;
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<Result>("idle");
  const [finished, setFinished] = useState(false);
  const [mistakes, setMistakes] = useState<number[]>([]);
  const question = data[index];
  const [width, height] = dimensions[index];
  const prompt = mode === "area" ? `${question.text}，這個長方形的面積是多少平方格？` : question.text;
  const choose = (value: number) => {
    if (result !== "idle") return;
    if (value === question.answer) { setResult("correct"); speakCorrectEncouragement(); return; }
    setResult("incorrect"); setMistakes((items) => items.includes(index) ? items : [...items, index]); speakTryAgain();
    recordPracticeMistake({ key: config.key, grade: "P3", title: config.title, href: config.href });
  };
  const next = () => {
    if (index === 7) { markPracticeCompleted(config.key); recordDailyPractice(config.key); setFinished(true); speakCantonese("你完成了八題挑戰，得到一顆完成星星！"); return; }
    setIndex((value) => value + 1); setResult("idle");
  };
  const restart = () => { setIndex(0); setResult("idle"); setFinished(false); setMistakes([]); };
  const review = () => { setFinished(false); setIndex(mistakes[0] ?? 0); setResult("idle"); };
  if (finished) return <main className="grid min-h-screen place-items-center bg-[#f8f5ed] p-6 text-[#172b3f]"><section className="max-w-lg rounded-[30px] border border-[#172b3f]/12 bg-white p-8 text-center shadow-[8px_8px_0_rgba(240,90,60,.14)]"><Trophy className="mx-auto size-14 text-[#c8811e]" /><p className="mt-5 font-mono text-xs font-bold tracking-[.14em] text-[#f05a3c]">P3 · COMPLETE STAR</p><h1 className="mt-3 text-3xl font-black">完成八題挑戰！</h1><p className="mt-3 leading-7 text-[#617286]">你已完成「{config.title}」並獲得完成星星。</p>{mistakes.length > 0 && <button onClick={review} className="mt-5 rounded-xl border border-[#f05a3c]/30 bg-[#fff0e9] px-4 py-3 font-bold text-[#b84c36]">重溫 {mistakes.length} 題錯題</button>}<div className="mt-6 flex flex-wrap justify-center gap-3"><button onClick={restart} className="inline-flex items-center gap-2 rounded-xl border border-[#172b3f]/15 px-4 py-3 font-bold"><RotateCcw className="size-4" /> 再玩一次</button><Link href="/#path" className="rounded-xl bg-[#f05a3c] px-4 py-3 font-bold text-white">返回題目庫</Link></div></section></main>;
  return <main className="min-h-screen bg-[#f8f5ed] p-6 text-[#172b3f]"><div className="mx-auto max-w-3xl"><Link href="/#path" className="font-bold hover:text-[#f05a3c]">← 返回題目庫</Link><header className="mt-8 flex items-end justify-between gap-4"><div><p className="font-mono text-[#4f6eae]">P3 · {config.detail}</p><h1 className="mt-2 text-4xl font-black">{config.title}</h1></div><p className="rounded-full border bg-white px-4 py-2 font-mono font-bold">第 {index + 1} / 8 題</p></header><section className="mq-practice-card mt-6 rounded-3xl border bg-white p-8 text-center"><div className="flex justify-end"><button onClick={() => speakCantonese(prompt)} className="inline-flex items-center gap-1 rounded-full border border-[#172b3f]/12 px-3 py-2 text-xs font-bold"><Volume2 className="size-3" /> 聽題目</button></div>{mode === "area" ? <><div className="mx-auto my-8 grid max-w-full bg-[linear-gradient(#dbe5f4_1px,transparent_1px),linear-gradient(90deg,#dbe5f4_1px,transparent_1px)] bg-[size:32px_32px]" style={{ height: height * 32, width: width * 32 }} /><h2 className="text-2xl font-black">{question.text}</h2><p className="mt-2">這個長方形的面積是多少平方格？</p></> : <><div className="my-8 text-6xl" aria-hidden="true">{mode === "story" ? "🧮" : "🛒"}</div><h2 className="mx-auto max-w-xl text-2xl font-black">{question.text}</h2></>}<div className="mq-concept-choices mx-auto mt-8">{choicesFor(question).map((choice) => <button key={choice} onClick={() => choose(choice)} disabled={result !== "idle"}>{choice} {question.unit}</button>)}</div>{result !== "idle" && <div className={`mx-auto mt-6 max-w-xl rounded-2xl border p-4 font-bold ${result === "correct" ? "border-[#0e8b87]/25 bg-[#e8f5f2] text-[#135d59]" : "border-[#f05a3c]/25 bg-[#fff0e9] text-[#8c3f2e]"}`}>{result === "correct" ? <Check className="mr-2 inline size-5" /> : <X className="mr-2 inline size-5" />}{result === "correct" ? "答對了！" : mode === "area" ? "再試一次。面積 = 長 × 闊。" : mode === "shop" ? "再試一次。先把 kg 換成 g，或把 L 換成 mL。" : "再看清題目中的數量和單位。"}</div>}<div className="mt-6">{result === "correct" ? <button className="mq-start rounded-xl bg-[#f05a3c] px-5 py-3 text-white" onClick={next}>{index === 7 ? "完成挑戰" : "下一題"}</button> : result === "incorrect" ? <button className="mq-start rounded-xl bg-[#f05a3c] px-5 py-3 text-white" onClick={() => setResult("idle")}><RotateCcw className="mr-1 inline size-4" />再試一次</button> : null}</div></section></div></main>;
}
