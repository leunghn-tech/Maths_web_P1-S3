import { useState } from "react";
import { Link } from "wouter";
import { Check, RotateCcw, Trophy, Volume2, X } from "lucide-react";
import { markPracticeCompleted } from "@/lib/practiceCompletion";
import { recordDailyPractice } from "@/lib/dailyPractice";
import { recordPracticeMistake } from "@/lib/reviewRecommendations";
import { speakCantonese, speakCorrectEncouragement, speakTryAgain } from "@/lib/speech";

const decimalQuestions = [
  { value: "0.5", prompt: "5 個十分之一寫作哪個小數？" }, { value: "1.2", prompt: "1 個一和 2 個十分之一寫作哪個小數？" },
  { value: "2.75", prompt: "HK$2 和 75 仙寫作哪個小數？" }, { value: "3.4", prompt: "3 個一和 4 個十分之一寫作哪個小數？" },
  { value: "4.05", prompt: "HK$4 和 5 仙寫作哪個小數？" }, { value: "5.6", prompt: "5 個一和 6 個十分之一寫作哪個小數？" },
  { value: "6.25", prompt: "HK$6 和 25 仙寫作哪個小數？" }, { value: "7.8", prompt: "7 個一和 8 個十分之一寫作哪個小數？" },
];
const triangleQuestions = [
  { text: "三條邊一樣長", answer: "等邊三角形", symbol: "△" }, { text: "有兩條邊一樣長", answer: "等腰三角形", symbol: "△" },
  { text: "有一個直角", answer: "直角三角形", symbol: "◢" }, { text: "三個角一樣大，三條邊一樣長", answer: "等邊三角形", symbol: "△" },
  { text: "兩個底角一樣大", answer: "等腰三角形", symbol: "△" }, { text: "一個角是 90°", answer: "直角三角形", symbol: "◢" },
  { text: "三條邊的長度相同", answer: "等邊三角形", symbol: "△" }, { text: "其中兩條邊互相垂直", answer: "直角三角形", symbol: "◢" },
];
const directionQuestions = [
  { destination: "花園", move: "向右 1 格、向上 1 格", answer: "東北", arrow: "↗" }, { destination: "禮堂", move: "向左 1 格、向上 1 格", answer: "西北", arrow: "↖" },
  { destination: "操場", move: "向右 1 格、向下 1 格", answer: "東南", arrow: "↘" }, { destination: "食堂", move: "向左 1 格、向下 1 格", answer: "西南", arrow: "↙" },
  { destination: "校務處", move: "向右 2 格", answer: "東", arrow: "→" }, { destination: "音樂室", move: "向左 2 格", answer: "西", arrow: "←" },
  { destination: "圖書館", move: "向上 2 格", answer: "北", arrow: "↑" }, { destination: "醫療室", move: "向下 2 格", answer: "南", arrow: "↓" },
];
type Result = "idle" | "correct" | "incorrect";
const decimalChoices = (answer: string) => [answer, ...["0.05", "0.5", "1.2", "1.5", "2.75", "3.4", "4.05", "5.6", "6.25", "7.8", "0.8", "2.5"].filter((value) => value !== answer)].slice(0, 4);

export default function P4ConceptPractice() {
  const mode = location.pathname.includes("decimals") ? "decimal" : location.pathname.includes("triangles") ? "triangle" : "direction";
  const config = mode === "decimal" ? { key: "p4-decimals-line", title: "小數初步", detail: "讀寫小數與港幣金額", href: "/practice/p4-decimals-line" } : mode === "triangle" ? { key: "p4-triangles", title: "三角形分類", detail: "根據邊和角辨認三角形", href: "/practice/p4-triangles" } : { key: "p4-eight-directions", title: "八方向地圖", detail: "以圖書館為起點辨認方向", href: "/practice/p4-eight-directions" };
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<Result>("idle");
  const [finished, setFinished] = useState(false);
  const [mistakes, setMistakes] = useState<number[]>([]);
  const decimal = decimalQuestions[index];
  const triangle = triangleQuestions[index];
  const direction = directionQuestions[index];
  const answer = mode === "decimal" ? decimal.value : mode === "triangle" ? triangle.answer : direction.answer;
  const options = mode === "decimal" ? decimalChoices(decimal.value) : mode === "triangle" ? ["等邊三角形", "等腰三角形", "直角三角形"] : ["東北", "西北", "東南", "西南", "東", "西", "北", "南"];
  const prompt = mode === "decimal" ? decimal.prompt : mode === "triangle" ? `一個三角形${triangle.text}，它是甚麼三角形？` : `由圖書館出發，${direction.move} 到${direction.destination}。${direction.destination}在圖書館的哪個方向？`;
  const choose = (value: string) => {
    if (result !== "idle") return;
    if (value === answer) { setResult("correct"); speakCorrectEncouragement(); return; }
    setResult("incorrect"); setMistakes((items) => items.includes(index) ? items : [...items, index]); speakTryAgain();
    recordPracticeMistake({ key: config.key, grade: "P4", title: config.title, href: config.href });
  };
  const next = () => { if (index === 7) { markPracticeCompleted(config.key); recordDailyPractice(config.key); setFinished(true); speakCantonese("你完成了八題挑戰，得到一顆完成星星！"); return; } setIndex((value) => value + 1); setResult("idle"); };
  const restart = () => { setIndex(0); setResult("idle"); setFinished(false); setMistakes([]); };
  const review = () => { setFinished(false); setIndex(mistakes[0] ?? 0); setResult("idle"); };
  if (finished) return <main className="grid min-h-screen place-items-center bg-[#f8f5ed] p-6 text-[#172b3f]"><section className="max-w-lg rounded-[30px] border border-[#172b3f]/12 bg-white p-8 text-center shadow-[8px_8px_0_rgba(240,90,60,.14)]"><Trophy className="mx-auto size-14 text-[#c8811e]" /><p className="mt-5 font-mono text-xs font-bold tracking-[.14em] text-[#f05a3c]">P4 · COMPLETE STAR</p><h1 className="mt-3 text-3xl font-black">完成八題挑戰！</h1><p className="mt-3 leading-7 text-[#617286]">你已完成「{config.title}」並獲得完成星星。</p>{mistakes.length > 0 && <button onClick={review} className="mt-5 rounded-xl border border-[#f05a3c]/30 bg-[#fff0e9] px-4 py-3 font-bold text-[#b84c36]">重溫 {mistakes.length} 題錯題</button>}<div className="mt-6 flex flex-wrap justify-center gap-3"><button onClick={restart} className="inline-flex items-center gap-2 rounded-xl border border-[#172b3f]/15 px-4 py-3 font-bold"><RotateCcw className="size-4" /> 再玩一次</button><Link href="/#path" className="rounded-xl bg-[#f05a3c] px-4 py-3 font-bold text-white">返回題目庫</Link></div></section></main>;
  return <main className="min-h-screen bg-[#f8f5ed] p-6 text-[#172b3f]"><div className="mx-auto max-w-3xl"><Link href="/#path" className="font-bold hover:text-[#f05a3c]">← 返回題目庫</Link><header className="mt-8 flex items-end justify-between gap-4"><div><p className="font-mono text-xs font-bold tracking-[.14em] text-[#6c8b4c]">P4 · {config.detail}</p><h1 className="mt-2 text-4xl font-black">{config.title}</h1></div><p className="rounded-full border bg-white px-4 py-2 font-mono font-bold">第 {index + 1} / 8 題</p></header><section className="mq-practice-card mt-6 rounded-3xl border bg-white p-6 text-center shadow-[7px_7px_0_rgba(23,43,63,.05)] sm:p-8"><div className="flex justify-end"><button onClick={() => speakCantonese(prompt)} className="inline-flex items-center gap-1 rounded-full border border-[#172b3f]/12 px-3 py-2 text-xs font-bold"><Volume2 className="size-3" /> 聽題目</button></div>{mode === "decimal" ? <><h2 className="mx-auto mt-7 max-w-xl text-2xl font-black">{decimal.prompt}</h2><div className="mx-auto my-8 max-w-xl border-t-4 border-[#6c8b4c] pt-3 font-mono text-sm">0.0　─　1.0　─　2.0　─　3.0　─　4.0　─　5.0　─　6.0　─　7.0　─　8.0</div><p className="text-sm text-[#617286]">小數點左邊是個位，右邊可表示十分位和百分位。</p></> : mode === "triangle" ? <><div className="my-7 text-8xl text-[#6c8b4c]" aria-hidden="true">{triangle.symbol}</div><h2 className="text-2xl font-black">一個三角形{triangle.text}，它是甚麼三角形？</h2></> : <><div className="my-7 text-8xl text-[#6c8b4c]" aria-hidden="true">{direction.arrow}</div><h2 className="mx-auto max-w-xl text-2xl font-black">由圖書館出發，{direction.move} 到{direction.destination}。</h2><p className="mt-3">{direction.destination}在圖書館的哪個方向？</p></>}<div className="mq-concept-choices mx-auto mt-8">{options.map((option) => <button key={option} onClick={() => choose(option)} disabled={result !== "idle"}>{option}</button>)}</div>{result !== "idle" && <div className={`mx-auto mt-6 max-w-xl rounded-2xl border p-4 font-bold ${result === "correct" ? "border-[#0e8b87]/25 bg-[#e8f5f2] text-[#135d59]" : "border-[#f05a3c]/25 bg-[#fff0e9] text-[#8c3f2e]"}`}>{result === "correct" ? <Check className="mr-2 inline size-5" /> : <X className="mr-2 inline size-5" />}{result === "correct" ? "答對了！" : mode === "decimal" ? `再試一次。正確的小數是 ${decimal.value}。` : mode === "triangle" ? `再試一次。${triangle.text}。` : `再試一次。${direction.arrow} 表示${direction.answer}。`}</div>}<div className="mt-6">{result === "correct" ? <button className="mq-start rounded-xl bg-[#f05a3c] px-5 py-3 text-white" onClick={next}>{index === 7 ? "完成挑戰" : "下一題"}</button> : result === "incorrect" ? <button className="mq-start rounded-xl bg-[#f05a3c] px-5 py-3 text-white" onClick={() => setResult("idle")}><RotateCcw className="mr-1 inline size-4" />再試一次</button> : null}</div></section></div></main>;
}
