import { useState } from "react";
import { Link } from "wouter";
import { Check, RotateCcw, Trophy, Volume2, X } from "lucide-react";
import { markPracticeCompleted } from "@/lib/practiceCompletion";
import { recordDailyPractice } from "@/lib/dailyPractice";
import { recordPracticeMistake } from "@/lib/reviewRecommendations";
import { speakCantonese, speakCorrectEncouragement, speakTryAgain } from "@/lib/speech";

const quadrilateralQuestions = [
  { feature: "四條邊一樣長，四個角都是直角", answer: "正方形", symbol: "□" }, { feature: "兩組對邊一樣長，四個角都是直角，但四條邊不全相等", answer: "長方形", symbol: "▭" },
  { feature: "兩組對邊分別平行，沒有直角", answer: "平行四邊形", symbol: "▱" }, { feature: "只有一組對邊平行", answer: "梯形", symbol: "⏢" },
  { feature: "四條邊一樣長，四個角都是直角", answer: "正方形", symbol: "□" }, { feature: "兩組對邊一樣長，四個角都是直角，但四條邊不全相等", answer: "長方形", symbol: "▭" },
  { feature: "兩組對邊分別平行，沒有直角", answer: "平行四邊形", symbol: "▱" }, { feature: "只有一組對邊平行", answer: "梯形", symbol: "⏢" },
];
const barQuestions = [{ blocks: 4, unit: 2 }, { blocks: 3, unit: 5 }, { blocks: 5, unit: 2 }, { blocks: 4, unit: 5 }, { blocks: 2, unit: 10 }, { blocks: 3, unit: 10 }, { blocks: 6, unit: 2 }, { blocks: 4, unit: 10 }].map((item) => ({ ...item, answer: item.blocks * item.unit }));
const shoppingQuestions = [
  { text: "一盒牛奶 HK$2.50，加上一個麵包 HK$3.20，共多少錢？", answer: 570 }, { text: "用 HK$10.00 買 HK$4.50 的文具，應找回多少錢？", answer: 550 },
  { text: "一枝鉛筆 HK$1.80，加上一塊擦膠 HK$2.20，共多少錢？", answer: 400 }, { text: "用 HK$8.50 買 HK$3.25 的筆記簿，應找回多少錢？", answer: 525 },
  { text: "一支飲品 HK$4.60，加上一個麵包 HK$1.40，共多少錢？", answer: 600 }, { text: "用 HK$7.20 買 HK$2.10 的尺，應找回多少錢？", answer: 510 },
  { text: "一包餅乾 HK$3.75，加上一盒牛奶 HK$2.25，共多少錢？", answer: 600 }, { text: "用 HK$9.00 買 HK$0.50 的信封，應找回多少錢？", answer: 850 },
];
type Result = "idle" | "correct" | "incorrect";
const money = (cents: number) => `HK$${(cents / 100).toFixed(2)}`;
const unique = <T,>(values: T[]) => Array.from(new Set(values));

export default function P4CompletePractice() {
  const mode = location.pathname.includes("quad") ? "quadrilateral" : location.pathname.includes("bar-chart") ? "bar" : "shop";
  const config = mode === "quadrilateral" ? { key: "p4-quadrilateral-map", title: "四邊形關係", detail: "根據邊和角辨認圖形", href: "/practice/p4-quadrilateral-map" } : mode === "bar" ? { key: "p4-bar-chart", title: "棒形圖倍數刻度", detail: "讀取每格代表的數量", href: "/practice/p4-bar-chart" } : { key: "p4-decimal-shopping", title: "小數購物生活題", detail: "以港幣小數計算金額", href: "/practice/p4-decimal-shopping" };
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<Result>("idle");
  const [finished, setFinished] = useState(false);
  const [mistakes, setMistakes] = useState<number[]>([]);
  const quadrilateral = quadrilateralQuestions[index];
  const bar = barQuestions[index];
  const shop = shoppingQuestions[index];
  const answer = mode === "quadrilateral" ? quadrilateral.answer : mode === "bar" ? `${bar.answer} 人` : money(shop.answer);
  const options = mode === "quadrilateral" ? ["正方形", "長方形", "平行四邊形", "梯形"] : mode === "bar" ? unique([bar.answer, bar.answer + bar.unit, Math.max(bar.unit, bar.answer - bar.unit), bar.blocks]).map((value) => `${value} 人`) : unique([shop.answer, shop.answer + 100, Math.max(0, shop.answer - 100), shop.answer + 200]).map(money);
  const prompt = mode === "quadrilateral" ? `一個四邊形${quadrilateral.feature}，它是甚麼圖形？` : mode === "bar" ? `棒形圖有 ${bar.blocks} 格，每一格代表 ${bar.unit} 人。這項數據代表多少人？` : shop.text;
  const choose = (value: string) => { if (result !== "idle") return; if (value === answer) { setResult("correct"); speakCorrectEncouragement(); return; } setResult("incorrect"); setMistakes((items) => items.includes(index) ? items : [...items, index]); speakTryAgain(); recordPracticeMistake({ key: config.key, grade: "P4", title: config.title, href: config.href }); };
  const next = () => { if (index === 7) { markPracticeCompleted(config.key); recordDailyPractice(config.key); setFinished(true); speakCantonese("你完成了八題挑戰，得到一顆完成星星！"); return; } setIndex((value) => value + 1); setResult("idle"); };
  const restart = () => { setIndex(0); setResult("idle"); setFinished(false); setMistakes([]); };
  const review = () => { setFinished(false); setIndex(mistakes[0] ?? 0); setResult("idle"); };
  if (finished) return <main className="grid min-h-screen place-items-center bg-[#f8f5ed] p-6 text-[#172b3f]"><section className="max-w-lg rounded-[30px] border border-[#172b3f]/12 bg-white p-8 text-center shadow-[8px_8px_0_rgba(240,90,60,.14)]"><Trophy className="mx-auto size-14 text-[#c8811e]" /><p className="mt-5 font-mono text-xs font-bold tracking-[.14em] text-[#f05a3c]">P4 · COMPLETE STAR</p><h1 className="mt-3 text-3xl font-black">完成八題挑戰！</h1><p className="mt-3 leading-7 text-[#617286]">你已完成「{config.title}」並獲得完成星星。</p>{mistakes.length > 0 && <button onClick={review} className="mt-5 rounded-xl border border-[#f05a3c]/30 bg-[#fff0e9] px-4 py-3 font-bold text-[#b84c36]">重溫 {mistakes.length} 題錯題</button>}<div className="mt-6 flex flex-wrap justify-center gap-3"><button onClick={restart} className="inline-flex items-center gap-2 rounded-xl border border-[#172b3f]/15 px-4 py-3 font-bold"><RotateCcw className="size-4" /> 再玩一次</button><Link href="/#path" className="rounded-xl bg-[#f05a3c] px-4 py-3 font-bold text-white">返回題目庫</Link></div></section></main>;
  return <main className="min-h-screen bg-[#f8f5ed] p-6 text-[#172b3f]"><div className="mx-auto max-w-3xl"><Link href="/#path" className="font-bold hover:text-[#f05a3c]">← 返回題目庫</Link><header className="mt-8 flex items-end justify-between gap-4"><div><p className="font-mono text-xs font-bold tracking-[.14em] text-[#6c8b4c]">P4 · {config.detail}</p><h1 className="mt-2 text-4xl font-black">{config.title}</h1></div><p className="rounded-full border bg-white px-4 py-2 font-mono font-bold">第 {index + 1} / 8 題</p></header><section className="mq-practice-card mt-6 rounded-3xl border bg-white p-6 text-center shadow-[7px_7px_0_rgba(23,43,63,.05)] sm:p-8"><div className="flex justify-end"><button onClick={() => speakCantonese(prompt)} className="inline-flex items-center gap-1 rounded-full border border-[#172b3f]/12 px-3 py-2 text-xs font-bold"><Volume2 className="size-3" /> 聽題目</button></div>{mode === "quadrilateral" ? <><div className="my-7 text-8xl text-[#6c8b4c]" aria-hidden="true">{quadrilateral.symbol}</div><h2 className="mx-auto max-w-xl text-2xl font-black">一個四邊形{quadrilateral.feature}。</h2><p className="mt-3">它是甚麼圖形？</p></> : mode === "bar" ? <><h2 className="mt-6 text-2xl font-black">每一格代表 {bar.unit} 人</h2><div className="mx-auto my-7 flex h-60 w-32 flex-col-reverse gap-1 border-x-4 border-b-4 border-[#6c8b4c] p-2">{Array.from({ length: bar.blocks }, (_, block) => <i key={block} className="h-7 bg-[#f6be5d]" />)}</div><p>棒形圖有 {bar.blocks} 格，這項數據代表多少人？</p></> : <><div className="my-7 text-6xl" aria-hidden="true">🛍️</div><h2 className="mx-auto max-w-xl text-2xl font-black">{shop.text}</h2></>}<div className="mq-concept-choices mx-auto mt-8">{options.map((option) => <button key={option} onClick={() => choose(option)} disabled={result !== "idle"}>{option}</button>)}</div>{result !== "idle" && <div className={`mx-auto mt-6 max-w-xl rounded-2xl border p-4 font-bold ${result === "correct" ? "border-[#0e8b87]/25 bg-[#e8f5f2] text-[#135d59]" : "border-[#f05a3c]/25 bg-[#fff0e9] text-[#8c3f2e]"}`}>{result === "correct" ? <Check className="mr-2 inline size-5" /> : <X className="mr-2 inline size-5" />}{result === "correct" ? "答對了！" : mode === "quadrilateral" ? `再試一次。${quadrilateral.feature}。` : mode === "bar" ? `再試一次。${bar.blocks} × ${bar.unit} = ${bar.answer} 人。` : `再試一次。正確答案是 ${money(shop.answer)}。`}</div>}<div className="mt-6">{result === "correct" ? <button className="mq-start rounded-xl bg-[#f05a3c] px-5 py-3 text-white" onClick={next}>{index === 7 ? "完成挑戰" : "下一題"}</button> : result === "incorrect" ? <button className="mq-start rounded-xl bg-[#f05a3c] px-5 py-3 text-white" onClick={() => setResult("idle")}><RotateCcw className="mr-1 inline size-4" />再試一次</button> : null}</div></section></div></main>;
}
