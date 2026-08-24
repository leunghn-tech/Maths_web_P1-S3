// @ts-nocheck
import { useState } from "react";
import { Link } from "wouter";
import { recordPracticeMistake } from "@/lib/reviewRecommendations";

const circleQuestions = [
  ["半徑 7 cm，圓周是多少？（π＝22/7）", "44 cm"], ["半徑 5 cm，圓面積是多少？（π＝3.14）", "78.5 cm²"], ["直徑 12 cm，半徑是多少？", "6 cm"], ["圓周 62.8 cm，半徑是多少？（π＝3.14）", "10 cm"], ["半徑 3 cm，圓面積是多少？（π＝3.14）", "28.26 cm²"], ["直徑 20 cm，圓周是多少？（π＝3.14）", "62.8 cm"], ["半徑 4 cm，直徑是多少？", "8 cm"], ["圓形面積公式是？", "πr²"],
];
const netsQuestions = [
  ["正方體平切，截面可能是？", "正方形"], ["正方體斜切，截面可能是？", "三角形"], ["正方體展開圖有多少個正方形？", "6"], ["長方體表面有多少個面？", "6"], ["圓柱展開圖的側面是？", "長方形"], ["圓柱有多少個圓形底面？", "2"], ["正方體的每個面是？", "正方形"], ["長方體垂直切，截面可能是？", "長方形"],
];
const coordinateQuestions = [
  ["點 (3, 5) 的橫坐標是？", "3"], ["點 (4, 2) 的縱坐標是？", "2"], ["由 (1,1) 向右 3 格、向上 2 格，到哪裡？", "(4,3)"], ["由 (2,4) 向下 3 格，到哪裡？", "(2,1)"], ["點 (0,6) 在哪條軸上？", "縱軸"], ["由 (5,2) 向左 2 格，到哪裡？", "(3,2)"], ["點 (7, 1) 的縱坐標是？", "1"], ["第一象限的 x、y 是？", "都是正數"],
];
const banks = {
  circle: { title: "圓形量度工房", tag: "圓周・圓面積", questions: circleQuestions },
  nets: { title: "立體截面與展開圖", tag: "截面・摺紙圖樣", questions: netsQuestions },
  coordinates: { title: "第一象限坐標定位", tag: "坐標幾何・方向", questions: coordinateQuestions },
};

export default function P6CompletePractice() {
  const path = location.pathname;
  const mode = path.includes("circle") ? "circle" : path.includes("nets") ? "nets" : "coordinates";
  const station = banks[mode];
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(false);
  const question = station.questions[index];
  const answer = question[1];
  const options = [answer, "4", "圓形", "長方形"].filter((value, position, all) => all.indexOf(value) === position);
  const choose = (value) => { const ok = value === answer; setCorrect(ok); if (!ok) recordPracticeMistake({ key: `p6-${mode}`, grade: "P6", title: station.title, href: path }); };
  const next = () => { setCorrect(false); setIndex(index === 7 ? 0 : index + 1); };
  const artifact = mode === "circle" ? <div className="relative grid size-32 place-items-center rounded-full border-4 border-[#172b3f] bg-[#fffaf5]"><i className="absolute -top-2 left-5 h-8 w-16 rounded-t-full border-t-2 border-dashed border-[#f05a3c]" /><span className="font-mono text-sm font-black">πr²</span><small className="absolute bottom-3 right-3 font-mono text-[9px] text-[#f05a3c]">r</small></div> : mode === "nets" ? <div className="grid grid-cols-4 gap-1">{Array.from({ length: 6 }, (_, cell) => <i key={cell} className={`size-8 border-2 border-dashed border-[#172b3f] ${cell === 1 || cell === 4 ? "bg-[#f6be5d]" : "bg-[#4f6eae]"}`} />)}<small className="col-span-4 font-mono text-[9px] text-[#f05a3c]">FOLD ┈ ┈ ┈</small></div> : <div className="relative size-32 border-b-2 border-l-2 border-[#172b3f]">{Array.from({ length: 4 }, (_, tick) => <i key={tick} className="absolute bottom-0 h-1 w-px bg-[#172b3f]" style={{ left: `${20 + tick * 22}%` }} />)}<i className="absolute left-14 top-7 size-3 rounded-full bg-[#f05a3c]" /><span className="absolute left-16 top-3 font-mono text-[10px]">(3,5)</span><small className="absolute bottom-1 right-1 font-mono text-[8px]">x →</small><small className="absolute left-1 top-1 font-mono text-[8px]">y ↑</small></div>;
  const hint = mode === "circle" ? "先找半徑或直徑，再沿公式提示計算。" : mode === "nets" ? "先沿虛線想像摺起來，再看會成為哪個面。" : "先看橫軸 x，再看縱軸 y，沿著格線定位。";
  return <main className="min-h-screen bg-[#f8f5ed] p-6 text-[#172b3f]"><Link href="/#path">← 返回題目庫</Link><header className="mt-7 flex flex-wrap items-center gap-3 font-mono text-xs"><b className="rounded-full bg-[#f05a3c] px-3 py-2 text-white">Q↗</b><strong className="tracking-[.16em]">MATHS QUEST</strong><span className="border-b-2 border-dotted border-[#f05a3c] pb-1">Q-PATH · {station.tag}</span></header><div className="mt-3 flex max-w-sm items-center gap-2 font-mono text-[9px] font-bold text-[#617286]"><span className="rounded bg-[#f05a3c] px-2 py-1 text-white">01 觀察</span><i className="h-px flex-1 border-t-2 border-dotted border-[#f05a3c]"/><span>02 解題</span><i className="h-px flex-1 border-t-2 border-dotted border-[#f05a3c]"/><span>03 CHECK</span></div><h1 className="mt-3 text-4xl font-black">{station.title}</h1><section className="mq-practice-card mt-6 rounded-3xl border bg-white p-8 text-center"><p className="font-mono text-xs">STATION {String(index + 1).padStart(2, "0")} · 8 題任務</p><p className="mt-7 text-2xl font-black">{question[0]}</p><div className="mx-auto mt-6 grid size-40 place-items-center border-4 border-dashed border-[#f05a3c] bg-[#fffaf5]">{artifact}</div><p className="mx-auto mt-4 max-w-md rounded-xl bg-[#fff7ef] p-3 text-sm">導師提示：{hint}</p><div className="mq-concept-choices mx-auto mt-6">{options.map((value) => <button key={value} onClick={() => choose(value)}>{value}</button>)}</div>{correct && <button onClick={next} className="mq-start mt-6 rounded-xl bg-[#f05a3c] px-5 py-3 text-white">答對了！下一題</button>}</section></main>;
}
