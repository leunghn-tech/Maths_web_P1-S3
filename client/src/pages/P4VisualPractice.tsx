import { useState } from "react";
import { Link } from "wouter";
import { Check, RotateCcw, Trophy, Volume2, X } from "lucide-react";
import { markPracticeCompleted } from "@/lib/practiceCompletion";
import { recordDailyPractice } from "@/lib/dailyPractice";
import { recordPracticeMistake } from "@/lib/reviewRecommendations";
import { speakCantonese, speakCorrectEncouragement, speakTryAgain } from "@/lib/speech";

const gridQuestions = [
  { width: 4, height: 3 }, { width: 5, height: 2 }, { width: 6, height: 3 }, { width: 4, height: 4 },
  { width: 7, height: 2 }, { width: 5, height: 4 }, { width: 3, height: 3 }, { width: 8, height: 2 },
].map((item) => ({ ...item, area: item.width * item.height }));

export const fractionQuestions = [
  { left: 1, right: 2, denominator: 4, answer: "3/4", shaded: 3, choices: ["3/4", "1/4", "2/4", "4/4"] },
  { left: 1, right: 1, denominator: 3, answer: "2/3", shaded: 2, choices: ["2/3", "1/3", "3/3", "1"] },
  { left: 2, right: 1, denominator: 5, answer: "3/5", shaded: 3, choices: ["3/5", "1/5", "2/5", "4/5"] },
  { left: 1, right: 1, denominator: 2, answer: "1", shaded: 2, choices: ["1", "0", "1/2", "3/2"] },
  { left: 2, right: 1, denominator: 4, answer: "3/4", shaded: 3, choices: ["3/4", "1/4", "2/4", "4/4"] },
  { left: 1, right: 2, denominator: 6, answer: "1/2", shaded: 3, choices: ["1/2", "1/6", "2/6", "4/6"] },
  { left: 2, right: 1, denominator: 3, answer: "1", shaded: 3, choices: ["1", "0", "1/3", "4/3"] },
  { left: 1, right: 3, denominator: 5, answer: "4/5", shaded: 4, choices: ["4/5", "1/5", "3/5", "1"] },
];

const chineseDigits = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
const fractionLabel = (value: string) => {
  const match = value.match(/^(\d+)\/(\d+)$/);
  return match ? `${chineseDigits[Number(match[2])] ?? match[2]}分之${chineseDigits[Number(match[1])] ?? match[1]}` : value;
};

type Result = "idle" | "correct" | "incorrect";

export default function P4VisualPractice() {
  const mode = location.pathname.includes("fractions") ? "fraction" : "grid";
  const config = mode === "grid"
    ? { key: "p4-grid-area", title: "方格面積建構", detail: "長方形面積 = 長 × 闊", href: "/practice/p4-grid-area" }
    : { key: "p4-fractions-visual", title: "同分母分數加法", detail: "分母相同，只把分子相加", href: "/practice/p4-fractions-visual" };
  const [index, setIndex] = useState(0);
  const [selectedCells, setSelectedCells] = useState(0);
  const [result, setResult] = useState<Result>("idle");
  const [finished, setFinished] = useState(false);
  const [mistakes, setMistakes] = useState<number[]>([]);
  const grid = gridQuestions[index];
  const fraction = fractionQuestions[index];
  const leftFraction = fractionLabel(`${fraction.left}/${fraction.denominator}`);
  const rightFraction = fractionLabel(`${fraction.right}/${fraction.denominator}`);
  const prompt = mode === "grid"
    ? `用方格建構長 ${grid.width} 格、闊 ${grid.height} 格的長方形。面積是多少平方格？`
    : `${leftFraction} 加 ${rightFraction} 等於多少？`;

  const choose = (value: string | number) => {
    if (result !== "idle") return;
    const answer = mode === "grid" ? grid.area : fraction.answer;
    if (value === answer) {
      setResult("correct");
      speakCorrectEncouragement();
      return;
    }
    setResult("incorrect");
    setMistakes((items) => items.includes(index) ? items : [...items, index]);
    speakTryAgain();
    recordPracticeMistake({ key: config.key, grade: "P4", title: config.title, href: config.href });
  };
  const next = () => {
    if (index === 7) {
      markPracticeCompleted(config.key);
      recordDailyPractice(config.key);
      setFinished(true);
      speakCantonese("你完成了八題挑戰，得到一顆完成星星！");
      return;
    }
    setIndex((value) => value + 1);
    setSelectedCells(0);
    setResult("idle");
  };
  const restart = () => { setIndex(0); setSelectedCells(0); setResult("idle"); setFinished(false); setMistakes([]); };
  const review = () => { setFinished(false); setIndex(mistakes[0] ?? 0); setSelectedCells(0); setResult("idle"); };

  if (finished) return <main className="grid min-h-screen place-items-center bg-[#f8f5ed] p-6 text-[#172b3f]"><section className="max-w-lg rounded-[30px] border border-[#172b3f]/12 bg-white p-8 text-center shadow-[8px_8px_0_rgba(240,90,60,.14)]"><Trophy className="mx-auto size-14 text-[#c8811e]" /><p className="mt-5 font-mono text-xs font-bold tracking-[.14em] text-[#f05a3c]">P4 · COMPLETE STAR</p><h1 className="mt-3 text-3xl font-black">完成八題挑戰！</h1><p className="mt-3 leading-7 text-[#617286]">你已完成「{config.title}」並獲得完成星星。</p>{mistakes.length > 0 && <button onClick={review} className="mt-5 rounded-xl border border-[#f05a3c]/30 bg-[#fff0e9] px-4 py-3 font-bold text-[#b84c36]">重溫 {mistakes.length} 題錯題</button>}<div className="mt-6 flex flex-wrap justify-center gap-3"><button onClick={restart} className="inline-flex items-center gap-2 rounded-xl border border-[#172b3f]/15 px-4 py-3 font-bold"><RotateCcw className="size-4" /> 再玩一次</button><Link href="/#path" className="rounded-xl bg-[#f05a3c] px-4 py-3 font-bold text-white">返回題目庫</Link></div></section></main>;

  return <main className="min-h-screen bg-[#f8f5ed] p-6 text-[#172b3f]"><div className="mx-auto max-w-3xl"><Link href="/#path" className="font-bold hover:text-[#f05a3c]">← 返回題目庫</Link><header className="mt-7 flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-xs font-bold tracking-[.14em] text-[#6c8b4c]">P4 · {config.detail}</p><h1 className="mt-2 text-4xl font-black">{config.title}</h1></div><p className="rounded-full border bg-white px-4 py-2 font-mono font-bold">第 {index + 1} / 8 題</p></header><section className="mq-practice-card mt-6 rounded-3xl border bg-white p-6 text-center shadow-[7px_7px_0_rgba(23,43,63,.05)] sm:p-8"><div className="flex justify-end"><button onClick={() => speakCantonese(prompt)} className="inline-flex items-center gap-1 rounded-full border border-[#172b3f]/12 px-3 py-2 text-xs font-bold"><Volume2 className="size-3" /> 聽題目</button></div>{mode === "grid" ? <><h2 className="mt-5 text-2xl font-black">用方格建構長 {grid.width} 格、闊 {grid.height} 格的長方形</h2><p className="mt-2 text-sm text-[#617286]">面積 = 長 × 闊。請按方格，填滿 {grid.area} 格。</p><div className="mx-auto my-6 grid max-w-md gap-1 border-2 border-dashed border-[#f05a3c] p-2" style={{ gridTemplateColumns: `repeat(${grid.width}, minmax(0, 1fr))` }}>{Array.from({ length: grid.area }, (_, cell) => <button key={cell} onClick={() => { setSelectedCells(cell === selectedCells - 1 ? cell : cell + 1); setResult("idle"); }} className={`aspect-square border ${cell < selectedCells ? "bg-[#6c8b4c]" : "bg-white"}`} aria-label={`第 ${cell + 1} 個方格`} />)}</div><p className="font-bold">已填 {selectedCells} 格</p><button className="mq-start mt-4 rounded-xl bg-[#f05a3c] px-5 py-3 text-white" onClick={() => choose(selectedCells)}>核對面積</button></> : <><h2 className="mt-6 text-4xl font-black">{leftFraction} ＋ {rightFraction} = ?</h2><div className="my-8 flex flex-wrap justify-center gap-2" aria-label={`共 ${fraction.denominator} 等份，合共有 ${fraction.shaded} 份`}><small className="w-full text-sm text-[#617286]">把兩個分數合起來：</small>{Array.from({ length: fraction.denominator }, (_, part) => <i key={part} className={`size-9 rounded-full border ${part < fraction.shaded ? "bg-[#6c8b4c]" : "bg-white"}`} />)}</div><p>分母相同，先把分子相加；如答案等於整體，寫作 1。</p><div className="mq-concept-choices mx-auto mt-6">{fraction.choices.map((choice) => <button key={choice} onClick={() => choose(choice)} disabled={result !== "idle"}>{fractionLabel(choice)}</button>)}</div></>}{result !== "idle" && <div className={`mx-auto mt-6 max-w-xl rounded-2xl border p-4 font-bold ${result === "correct" ? "border-[#0e8b87]/25 bg-[#e8f5f2] text-[#135d59]" : "border-[#f05a3c]/25 bg-[#fff0e9] text-[#8c3f2e]"}`}>{result === "correct" ? <Check className="mr-2 inline size-5" /> : <X className="mr-2 inline size-5" />}{result === "correct" ? "答對了！" : mode === "grid" ? `再試一次。${grid.width} × ${grid.height} = ${grid.area} 平方格。` : `再試一次。${leftFraction} 加 ${rightFraction}。`}</div>}<div className="mt-6">{result === "correct" ? <button className="mq-start rounded-xl bg-[#f05a3c] px-5 py-3 text-white" onClick={next}>{index === 7 ? "完成挑戰" : "下一題"}</button> : result === "incorrect" ? <button className="mq-start rounded-xl bg-[#f05a3c] px-5 py-3 text-white" onClick={() => { setResult("idle"); if (mode === "grid") setSelectedCells(0); }}><RotateCcw className="mr-1 inline size-4" />再試一次</button> : null}</div></section></div></main>;
}
