// @ts-nocheck
import { useState } from "react";
import { Link } from "wouter";

const units = [
  ["1 立方公尺", "1,000,000", "立方厘米"], ["2 立方公尺", "2,000,000", "立方厘米"], ["500,000 立方厘米", "0.5", "立方公尺"], ["3,000,000 立方厘米", "3", "立方公尺"],
  ["0.2 立方公尺", "200,000", "立方厘米"], ["1,500,000 立方厘米", "1.5", "立方公尺"], ["4 立方公尺", "4,000,000", "立方厘米"], ["750,000 立方厘米", "0.75", "立方公尺"],
];
const carry = [
  ["4.78", "+", "2.65", "7.43", "個位相加 8＋5＝13，先寫 3，向十分位進 1。"], ["9.20", "−", "3.75", "5.45", "十分位 2 不夠減 7，向個位借 1 個，變成 12 個十分位。"],
  ["6.39", "+", "1.87", "8.26", "百分位 9＋7＝16，先寫 6，向十分位進 1。"], ["8.00", "−", "2.46", "5.54", "百分位 0 不夠減 6，逐欄向左借位。"],
  ["5.67", "+", "3.58", "9.25", "百分位 7＋8＝15，進 1 到十分位。"], ["7.30", "−", "1.85", "5.45", "十分位 3 不夠減 8，先向個位借 1。"],
  ["2.49", "+", "4.62", "7.11", "百分位 9＋2＝11，進 1 到十分位。"], ["10.00", "−", "6.48", "3.52", "0 不夠減 8，從左邊的 1 逐欄借位。"],
];
const polygons = [["五邊形有多少條邊？", "5", "五角星旁的外框可數到 5 條邊。"],["六邊形有多少條邊？", "6", "每一條直邊數一次。"],["八邊形有多少條邊？", "8", "像停止標誌的外框。"],["正五邊形有幾條對稱軸？", "5", "每個頂點可對準對面的邊中點。"],["正六邊形旋轉多少度後會重合？", "60", "一整圈 360° 平均分成 6 份。"],["正方形旋轉多少度後會第一次重合？", "90", "一整圈 360° 平均分成 4 份。"],["正三角形有幾條對稱軸？", "3", "每個頂點都有一條折線。"],["七邊形有多少條邊？", "7", "沿外框逐邊點數。"]];
const data = [["4、6、8、10 四日的平均數", "7", "先加起來：28；再除以 4。"],["3、5、7、9、11 五日的平均數", "7", "總和 35 ÷ 5。"],["2、6、4、8 四日中最高數值", "8", "找折線圖最高的點。"],["9、7、5、3 四日中整體趨勢", "下降", "每一天都比前一天低。"],["4、4、6、6 四日的平均數", "5", "總和 20 ÷ 4。"],["5、8、6、9 四日中最低數值", "5", "找最靠近橫軸的點。"],["1、3、5、7、9 五日的平均數", "5", "總和 25 ÷ 5。"],["2、5、5、8 四日中整體趨勢", "上升", "最後一天比第一天高。"]];

export default function P5ExpansionPractice() {
  const path = location.pathname; const kind = path.includes("volume-units") ? "unit" : path.includes("decimal-carry") ? "carry" : path.includes("polygons") ? "shape" : "data";
  const bank = kind === "unit" ? units : kind === "carry" ? carry : kind === "shape" ? polygons : data;
  const title = kind === "unit" ? "體積單位換算" : kind === "carry" ? "小數進位與借位" : kind === "shape" ? "多邊形・旋轉・軸對稱" : "平均數與折線圖判讀";
  const code = kind === "unit" ? "UNIT" : kind === "carry" ? "DEC+" : kind === "shape" ? "SHAPE" : "DATA+";
  const [index, setIndex] = useState(0); const [correct, setCorrect] = useState(false); const q = bank[index];
  const answer = q[1]; const options = [answer, kind === "unit" ? "100,000" : kind === "carry" ? "6.43" : kind === "shape" ? "4" : "6", kind === "shape" ? "8" : "9", kind === "data" ? "下降" : "10"].filter((v, p, all) => all.indexOf(v) === p);
  const next = () => { setCorrect(false); setIndex(index === 7 ? 0 : index + 1); };
  return <main className="min-h-screen bg-[#f8f5ed] p-6 text-[#172b3f]"><Link href="/#path">← 返回題目庫</Link><header className="mt-7 flex items-center gap-3 font-mono text-xs"><b className="rounded-full bg-[#6c8b4c] px-3 py-2 text-white">Q↗ {code}</b><span className="border-b-2 border-dotted border-[#f05a3c] pb-1">QUEST PATH · 檢查點 {index + 1}/8</span><span className="text-[#f05a3c]">● ┄ ┄ ○ ┄ ┄ ○</span></header><h1 className="mt-3 text-4xl font-black">{title}</h1><section className="mq-practice-card mt-6 rounded-3xl border bg-white p-8 text-center"><p className="font-mono text-xs">STATION {String(index + 1).padStart(2, "0")}</p>{kind === "unit" && <><p className="mt-6 text-2xl font-black">{q[0]} ＝ ？ {q[2]}</p><div className="mx-auto mt-4 max-w-md rounded-xl bg-[#eef5ff] p-3 text-sm">立方換算提示：1 m³ ＝ 1,000,000 cm³。每一條邊都放大 100 倍，所以體積放大 100 × 100 × 100 倍。</div><div className="mx-auto my-4 flex justify-center gap-2"><i className="size-12 border-2 border-[#4f6eae] bg-[#dceaff]"/><b className="pt-3 text-[#f05a3c]">⇄</b><i className="size-20 border-2 border-[#4f6eae] bg-[#dceaff]"/></div></>}{kind === "carry" && <><div className="mx-auto mt-5 w-60 border-b-2 border-[#172b3f] pb-2 text-right font-mono text-3xl font-black"><p>{q[0]}</p><p>{q[1]} {q[2]}</p></div><p className="mx-auto mt-4 max-w-md rounded-xl bg-[#fff0f5] p-3 text-left text-sm"><b className="text-[#f05a3c]">進借位提示欄：</b>{q[4]}</p><div className="mt-4 flex justify-center gap-2 font-mono text-xs"><span className="rounded border px-3 py-2">個位</span><span className="rounded border px-3 py-2">十分位</span><span className="rounded border px-3 py-2">百分位</span></div></>}{kind === "shape" && <><p className="mt-6 text-2xl font-black">{q[0]}</p><div className="mx-auto mt-6 grid size-28 place-items-center border-4 border-dashed border-[#6c8b4c] text-5xl">⬠</div><p className="mt-4 rounded-xl bg-[#eff6e9] p-3 text-sm">圖形手帳：{q[2]}</p></>}{kind === "data" && <><p className="mt-6 text-2xl font-black">{q[0]} 是多少？</p><div className="mx-auto mt-5 flex h-28 max-w-sm items-end justify-around border-b-2 border-l-2 px-5">{String(q[0]).match(/\d+/g)?.slice(0,5).map((v,n)=><i key={n} className="w-6 bg-[#6c8b4c]" style={{height:`${Number(v)*9}px`}}/> )}</div><p className="mt-4 rounded-xl bg-[#eff6e9] p-3 text-sm">數據筆記：{q[2]}</p></>}<div className="mq-concept-choices mx-auto mt-7">{options.map(v => <button key={v} onClick={() => setCorrect(v === answer)}>{v}</button>)}</div>{correct && <button className="mq-start mt-6 rounded-xl bg-[#f05a3c] px-5 py-3 text-white" onClick={next}>答對了！下一題</button>}</section></main>;
}
