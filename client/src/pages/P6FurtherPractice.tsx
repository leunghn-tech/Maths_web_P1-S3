// @ts-nocheck
import { useState } from "react";
import { Link } from "wouter";
import { recordPracticeMistake } from "@/lib/reviewRecommendations";

const banks = {
  finance: { title: "百分應用", tag: "折扣・利息・增減", icon: "%", q: [["原價 $200，八折後是多少？", "$160"], ["$1,000 以年利率 3% 存一年，利息是多少？", "$30"], ["$80 增加 25%，新數是多少？", "100"], ["成本 $50，售價 $65，利潤是多少？", "$15"], ["$500 九折後是多少？", "$450"], ["$2,000 以 2% 單利存兩年，利息是多少？", "$80"], ["$120 減少 10%，新數是多少？", "108"], ["售價 $90，成本 $72，利潤百分率是多少？", "25%"]] },
  solid: { title: "立體與截面", tag: "圓柱・排水法・截面", icon: "▦", q: [["圓柱半徑 3 cm、高 5 cm，體積是多少？（π＝3.14）", "141.3 cm³"], ["水位由 200 mL 升至 260 mL，物件體積是多少？", "60 cm³"], ["正方體斜切，截面可能是？", "三角形"], ["圓柱半徑 2 cm、高 10 cm，體積是多少？（π＝3.14）", "125.6 cm³"], ["長方體長 4、寬 3、高 2 cm，體積是多少？", "24 cm³"], ["排水增加 75 mL，物件體積是多少？", "75 cm³"], ["圓柱頂面是甚麼形狀？", "圓形"], ["長方體平行底面切開，截面是？", "長方形"]] },
  stats: { title: "統計與集中趨勢", tag: "平均數・中位數・眾數・加權", icon: "⌁", q: [["3、5、7 的平均數是多少？", "5"], ["2、4、4、6、8 的眾數是？", "4"], ["1、3、5、7、9 的中位數是？", "5"], ["測驗 80 分佔 40%、90 分佔 60%，加權平均是多少？", "86"], ["10、12、14、16 的平均數是多少？", "13"], ["5、5、6、7、7、7 的眾數是？", "7"], ["2、8、10 的平均數是多少？", "6.67"], ["圓形圖全圓有多少度？", "360°"]] },
};

export default function P6FurtherPractice() {
  const path = location.pathname;
  const mode = path.includes("finance") ? "finance" : path.includes("solid") ? "solid" : "stats";
  const station = banks[mode];
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(false);
  const question = station.q[index];
  const answer = question[1];
  const options = [answer, "4", "$100", "圓形"].filter((value, position, all) => all.indexOf(value) === position);
  const visual = mode === "finance" ? <div className="grid h-full w-full grid-cols-[1fr_auto_1fr] items-center gap-1 px-3 font-mono text-sm font-black"><span className="rounded bg-[#f6be5d] px-1 py-2">$</span><b className="text-[#f05a3c]">−%</b><span className="rounded border-2 border-dashed border-[#4f6eae] px-1 py-2">$</span></div> : mode === "solid" ? <div className="relative grid h-full w-full place-items-center"><span className="absolute size-14 border-2 border-[#172b3f] bg-[#dceaff]"/><span className="absolute size-14 translate-x-3 -translate-y-3 border-2 border-[#172b3f] bg-[#eef5ff]"/><span className="relative font-mono text-xs">πr²h</span></div> : <div className="flex h-full items-end justify-center gap-1 pb-4">{[30, 48, 70, 42].map((height, index) => <i key={index} className="w-3 bg-[#7c6cb0]" style={{ height }} />)}</div>;
  const choose = (value: string) => { const yes = value === answer; setCorrect(yes); if (!yes) recordPracticeMistake({ key: `p6-${mode}`, grade: "P6", title: station.title, href: path }); };
  const next = () => { setCorrect(false); setIndex(index === 7 ? 0 : index + 1); };
  return <main className="min-h-screen bg-[#f8f5ed] p-6 text-[#172b3f]"><Link href="/#path">← 返回題目庫</Link><header className="mt-7 flex items-center gap-3 font-mono text-xs"><b className="rounded-full bg-[#f05a3c] px-3 py-2 text-white">Q↗ P6</b><span className="border-b-2 border-dotted border-[#f05a3c] pb-1">QUEST PATH · 檢查點 {index + 1}/8</span></header><h1 className="mt-3 text-4xl font-black">{station.title}</h1><section className="mq-practice-card mt-6 rounded-3xl border bg-white p-8 text-center"><p className="font-mono text-xs">STATION {String(index + 1).padStart(2, "0")} · {station.tag}</p><p className="mt-7 text-2xl font-black">{question[0]}</p><div className="mx-auto mt-6 grid size-28 place-items-center overflow-hidden border-4 border-dashed border-[#f05a3c] bg-[#fff0e9]">{visual}</div><p className="mx-auto mt-4 max-w-md rounded-xl bg-[#fff7ef] p-3 text-sm">導師提示：先圈出題目中的量，再選對公式或統計方法。</p><div className="mq-concept-choices mx-auto mt-6">{options.map((value) => <button key={value} onClick={() => choose(value)}>{value}</button>)}</div>{correct && <button className="mq-start mt-6 rounded-xl bg-[#f05a3c] px-5 py-3 text-white" onClick={next}>答對了！下一題</button>}</section></main>;
}
