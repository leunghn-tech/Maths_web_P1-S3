// @ts-nocheck
import { useState } from "react";
import { Link } from "wouter";

const sets = {
  fraction: { title: "異分母分數加減", tag: "配對分母", items: [[1,2,1,3,"5/6"],[1,4,1,2,"3/4"],[2,3,1,6,"5/6"],[3,4,1,8,"7/8"],[1,5,1,2,"7/10"],[2,5,1,4,"13/20"],[1,3,1,4,"7/12"],[3,8,1,2,"7/8"]] },
  area: { title: "面積小工房", tag: "三角形・平行四邊形・梯形", items: [[4,3,"6"],[6,5,"15"],[8,4,"16"],[10,3,"15"],[7,6,"21"],[12,4,"24"],[9,2,"9"],[6,8,"24"]] },
  data: { title: "圖形與數據", tag: "旋轉・對稱・折線圖・平均數", items: [[4,6,"5"],[3,9,"6"],[8,4,"6"],[7,5,"6"],[2,10,"6"],[6,6,"6"],[9,3,"6"],[5,7,"6"]] },
};
const Fraction = ({ n, d }) => <span className="inline-flex flex-col align-middle leading-none"><b className="border-b-2 px-1">{n}</b><b className="px-1">{d}</b></span>;

export default function P5CorePractice() {
  const mode = location.pathname.includes("fraction-add") ? "fraction" : location.pathname.includes("area") ? "area" : "data";
  const s = sets[mode]; const [i, setI] = useState(0); const [good, setGood] = useState(false);
  const q = s.items[i]; const answer = q[q.length - 1];
  const picks = mode === "fraction" ? [answer, "1/2", "2/3", "3/4"] : [answer, String(Number(answer) + 2), String(Math.max(1, Number(answer) - 1)), String(Number(answer) + 1)];
  const visual = mode === "fraction" ? <><Fraction n={q[0]} d={q[1]} /> ＋ <Fraction n={q[2]} d={q[3]} /><p className="mt-5 rounded-xl bg-[#fff0f5] p-3 text-base">先找 {q[1]} 和 {q[3]} 的共同分母，再把分子改寫。</p></> : mode === "area" ? <><p>底 {q[0]} 厘米，高 {q[1]} 厘米</p><div className="mx-auto mt-4 h-16 w-40 border-b-4 border-l-4 border-[#f05a3c]"/><p className="mt-4 rounded-xl bg-[#eef5ff] p-3 text-base">三角形面積＝底 × 高 ÷ 2</p></> : <><p>兩次記錄是 {q[0]} 和 {q[1]}。</p><p className="mt-4 rounded-xl bg-[#f4f0ff] p-3 text-base">平均數＝總和 ÷ 次數；看看折線圖的兩點。</p><div className="mx-auto mt-4 flex h-20 w-48 items-end justify-around border-b-2 border-l-2"><i className="h-10 w-4 bg-[#7c6cb0]"/><i className="h-16 w-4 bg-[#f05a3c]"/></div></>;
  return <main className="min-h-screen bg-[#f8f5ed] p-6 text-[#172b3f]"><Link href="/#path">← 返回題目庫</Link><header className="mt-7 flex items-center gap-3 font-mono text-xs"><b className="rounded-full bg-[#f05a3c] px-3 py-2 text-white">Q-{mode.toUpperCase()}</b><span className="border-b-2 border-dotted border-[#f05a3c] pb-1">檢查點 {i + 1} / 8</span><span className="text-[#f05a3c]">● ┄ ┄ ○ ┄ ┄ ○</span></header><h1 className="mt-3 text-4xl font-black">{s.title}</h1><section className="mq-practice-card mt-6 rounded-3xl border bg-white p-8 text-center"><p className="font-mono text-xs">STATION {String(i + 1).padStart(2, "0")} · {s.tag}</p><div className="mt-5 text-3xl font-black">{visual}</div><div className="mq-concept-choices mx-auto mt-8">{picks.filter((x, n, a) => a.indexOf(x) === n).map(x => <button key={x} onClick={() => setGood(x === answer)}>{mode === "fraction" ? <Fraction n={x.split("/")[0]} d={x.split("/")[1]} /> : x}</button>)}</div>{good && <button className="mq-start mt-6 rounded-xl bg-[#f05a3c] px-5 py-3 text-white" onClick={() => { setGood(false); setI(i === 7 ? 0 : i + 1); }}>答對了！下一題</button>}</section></main>;
}
