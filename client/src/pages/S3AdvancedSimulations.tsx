// Maths Quest：S3 模擬站以正式中學數學術語呈現三角學、概率及複利折舊模型。
// @ts-nocheck
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { markPracticeCompleted } from "@/lib/practiceCompletion";
import { recordDailyPractice } from "@/lib/dailyPractice";
import { recordPracticeMistake } from "@/lib/reviewRecommendations";
import { speakCantonese } from "@/lib/speech";

const stations = {
  trig: {
    zh: "三角學應用：仰角、俯角與方位角",
    en: "Trigonometric Applications: Elevation, Depression and Bearings",
    tag: "BEARING & SIGHTLINE",
    cue: ["方位角須由正北方向順時針量起；再根據視線相對水平線的位置辨認仰角或俯角。", "Measure bearings clockwise from due north, then identify elevation or depression according to the sightline relative to the horizontal."],
    items: [
      { bearing: 45, kind: "elevation", angle: 30 }, { bearing: 135, kind: "depression", angle: 20 },
      { bearing: 270, kind: "elevation", angle: 45 }, { bearing: 315, kind: "depression", angle: 15 },
      { bearing: 60, kind: "elevation", angle: 25 }, { bearing: 210, kind: "depression", angle: 35 },
      { bearing: 120, kind: "elevation", angle: 40 }, { bearing: 330, kind: "depression", angle: 10 },
    ],
  },
  probability: {
    zh: "概率樹狀圖與抽樣",
    en: "Probability Trees and Sampling",
    tag: "THEORETICAL & EXPERIMENTAL",
    cue: ["先從樹狀圖讀取理論概率，再以重複抽樣比較實驗概率。", "Read the theoretical probability from the tree diagram, then compare it with experimental probability from repeated trials."],
    items: [
      { target: "H", focus: ["擲一枚公平硬幣一次，求出現正面的理論概率。", "A fair coin is tossed once. Find the theoretical probability of heads."] },
      { target: "T", focus: ["擲一枚公平硬幣一次，求出現反面的理論概率。", "A fair coin is tossed once. Find the theoretical probability of tails."] },
      { target: "H", focus: ["以樹狀圖表示一次公平擲幣，求分支 H 的概率。", "Use a tree diagram for one fair coin toss. Find the probability on branch H."] },
      { target: "T", focus: ["以樹狀圖表示一次公平擲幣，求分支 T 的概率。", "Use a tree diagram for one fair coin toss. Find the probability on branch T."] },
      { target: "H", focus: ["比較理論與實驗結果前，求 P(H)。", "Before comparing theoretical and experimental results, find P(H)."] },
      { target: "T", focus: ["比較理論與實驗結果前，求 P(T)。", "Before comparing theoretical and experimental results, find P(T)."] },
      { target: "H", focus: ["公平擲幣重複進行時，求正面的理論相對頻率。", "For repeated fair coin tosses, find the theoretical relative frequency of heads."] },
      { target: "T", focus: ["公平擲幣重複進行時，求反面的理論相對頻率。", "For repeated fair coin tosses, find the theoretical relative frequency of tails."] },
    ],
  },
  finance: {
    zh: "複利與折舊多年度圖表",
    en: "Compound Interest and Depreciation over Time",
    tag: "COMPOUND GROWTH",
    cue: ["每一期須以上一期的本利和或折後價值為基礎計算，並比較金額隨時間的變化。", "Each period is calculated from the previous period's amount or depreciated value; compare how the amount changes over time."],
    items: [
      { principal: 1000, rate: 10, kind: "interest", years: 3 }, { principal: 2000, rate: 20, kind: "depreciation", years: 3 },
      { principal: 500, rate: 5, kind: "interest", years: 4 }, { principal: 1500, rate: 10, kind: "depreciation", years: 2 },
      { principal: 3000, rate: 4, kind: "interest", years: 5 }, { principal: 8000, rate: 15, kind: "depreciation", years: 2 },
      { principal: 1200, rate: 8, kind: "interest", years: 2 }, { principal: 5000, rate: 12, kind: "depreciation", years: 4 },
    ],
  },
};

export default function S3AdvancedSimulations() {
  const topic = new URLSearchParams(location.search).get("topic") || "trig";
  const station = stations[topic] || stations.trig;
  const [lang, setLang] = useState("zh");
  const [index, setIndex] = useState(0);
  const [bearing, setBearing] = useState(0);
  const [kind, setKind] = useState("elevation");
  const [angle, setAngle] = useState(0);
  const [pick, setPick] = useState("");
  const [samples, setSamples] = useState({ H: 0, T: 0 });
  const [years, setYears] = useState(1);
  const [result, setResult] = useState("");
  const [complete, setComplete] = useState(false);
  const item = station.items[index];
  const label = lang === "zh" ? station.zh : station.en;

  const reset = () => { setBearing(0); setKind("elevation"); setAngle(0); setPick(""); setSamples({ H: 0, T: 0 }); setYears(1); setResult(""); };
  const wrong = () => { setResult("wrong"); recordPracticeMistake({ key: `s3-${topic}-sim`, grade: "S3", title: station.zh, href: `/practice/s3-sim?topic=${topic}` }); };
  const check = () => {
    const correct = topic === "trig"
      ? bearing === item.bearing && kind === item.kind && angle === item.angle
      : topic === "probability"
        ? pick === "1/2" && samples.H + samples.T >= 5
        : years === item.years;
    correct ? setResult("correct") : wrong();
  };
  const next = () => { if (index === 7) { markPracticeCompleted(`s3-${topic}-sim`); recordDailyPractice(`s3-${topic}-sim`); setComplete(true); } else { setIndex(index + 1); reset(); } };
  const speak = () => {
    const text = topic === "trig"
      ? (lang === "zh" ? `設定三位數方位角 ${item.bearing} 度及${item.kind === "elevation" ? "仰角" : "俯角"} ${item.angle} 度。` : `Set a bearing of ${item.bearing} degrees and an ${item.kind} angle of ${item.angle} degrees.`)
      : topic === "probability" ? item.focus[lang === "zh" ? 0 : 1]
        : (lang === "zh" ? `繪製本金或原值為 HK$${item.principal}、每年 ${item.rate}% 的${item.kind === "interest" ? "複利" : "折舊"}圖表，至第 ${item.years} 年。` : `Plot the ${item.kind} model for HK$${item.principal} at ${item.rate}% per year to year ${item.years}.`);
    if (lang === "zh") speakCantonese(text); else if ("speechSynthesis" in window) { const utterance = new SpeechSynthesisUtterance(text); utterance.lang = "en-HK"; window.speechSynthesis.speak(utterance); }
  };
  const chart = useMemo(() => {
    if (topic !== "finance") return [];
    const multiplier = item.kind === "interest" ? 1 + item.rate / 100 : 1 - item.rate / 100;
    return Array.from({ length: Math.max(years, item.years) + 1 }, (_, year) => Math.round(item.principal * Math.pow(multiplier, year)));
  }, [topic, item, years]);

  const task = topic === "trig"
    ? (lang === "zh" ? `設定方位角 ${String(item.bearing).padStart(3, "0")}°、${item.kind === "elevation" ? "仰角" : "俯角"} ${item.angle}°。` : `Set bearing ${String(item.bearing).padStart(3, "0")}° and ${item.kind} ${item.angle}°.`)
    : topic === "probability" ? item.focus[lang === "zh" ? 0 : 1]
      : (lang === "zh" ? `設定年數為 ${item.years}，並檢視 HK$${item.principal} 按年 ${item.rate}% ${item.kind === "interest" ? "複利" : "折舊"}的金額。` : `Set the year to ${item.years} and inspect HK$${item.principal} at ${item.rate}% annual ${item.kind}.`);

  const trigModel = topic === "trig" && <div className="mx-auto mt-5 max-w-xl">
    <div className="relative mx-auto grid size-52 place-items-center rounded-full border-4 border-[#1f8378] bg-[#f7fcfb]"><b className="absolute top-3 font-mono text-xs">N 000°</b><b className="absolute right-3 font-mono text-xs">E</b><b className="absolute bottom-3 font-mono text-xs">S</b><b className="absolute left-3 font-mono text-xs">W</b><i className="absolute h-1 w-20 origin-left bg-[#f05a3c]" style={{ transform: `rotate(${bearing - 90}deg)`, left: "50%", top: "50%" }} /><span className="rounded-xl bg-white px-3 py-2 font-mono text-sm font-bold text-[#f05a3c]">{String(bearing).padStart(3, "0")}°</span></div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="rounded-xl border bg-white p-3 font-mono text-xs">{lang === "zh" ? "方位角" : "BEARING"}<input type="range" min="0" max="360" step="5" value={bearing} onChange={(event) => setBearing(+event.target.value)} className="mt-2 w-full accent-[#f05a3c]" /></label><label className="rounded-xl border bg-white p-3 font-mono text-xs">{lang === "zh" ? "視線角" : "ANGLE"}<input type="range" min="0" max="60" step="5" value={angle} onChange={(event) => setAngle(+event.target.value)} className="mt-2 w-full accent-[#f05a3c]" /></label></div>
    <div className="mt-3 grid grid-cols-2 gap-3"><button onClick={() => setKind("elevation")} className={`rounded-xl border-2 p-3 font-bold ${kind === "elevation" ? "border-[#0e8b87] bg-[#e8f5f2]" : "border-[#1f8378]/35 bg-white"}`}>↑ {lang === "zh" ? "仰角" : "Elevation"}</button><button onClick={() => setKind("depression")} className={`rounded-xl border-2 p-3 font-bold ${kind === "depression" ? "border-[#0e8b87] bg-[#e8f5f2]" : "border-[#1f8378]/35 bg-white"}`}>↓ {lang === "zh" ? "俯角" : "Depression"}</button></div>
  </div>;
  const probabilityModel = topic === "probability" && <div className="mx-auto mt-5 max-w-xl"><div className="rounded-2xl border bg-[#fffaf5] p-5"><p className="font-mono text-xs">TREE DIAGRAM</p><div className="mt-3 grid grid-cols-[auto_1fr_1fr] items-center gap-3 font-mono"><b>START</b><i className="border-t-2 border-[#1f8378]" /><b>H · 1/2</b><span /><i className="border-t-2 border-[#1f8378]" /><b>T · 1/2</b></div></div><div className="mt-3 grid grid-cols-3 gap-3">{["1/2", "1/3", "2/3"].map((probability) => <button key={probability} onClick={() => setPick(probability)} className={`rounded-xl border-2 p-3 font-mono font-bold ${pick === probability ? "border-[#0e8b87] bg-[#e8f5f2]" : "border-[#1f8378]/35 bg-white"}`}>{probability}</button>)}</div><div className="mt-5 rounded-2xl border bg-white p-4"><div className="flex items-center justify-between"><b>{lang === "zh" ? "抽樣實驗" : "Sampling experiment"}</b><button onClick={() => { const outcome = Math.random() < 0.5 ? "H" : "T"; setSamples({ ...samples, [outcome]: samples[outcome] + 1 }); }} className="rounded-lg bg-[#f05a3c] px-3 py-2 text-sm font-bold text-white">{lang === "zh" ? "進行一次抽樣" : "Run one trial"}</button></div><div className="mt-3 grid grid-cols-2 gap-3 font-mono"><span>H: {samples.H}</span><span>T: {samples.T}</span></div></div></div>;
  const financeModel = topic === "finance" && <div className="mx-auto mt-5 max-w-xl"><p className="font-mono text-xs">{lang === "zh" ? `本金／原值 HK$${item.principal}；每年 ${item.rate}% ${item.kind === "interest" ? "複利" : "折舊"}` : `Principal/value HK$${item.principal}; ${item.rate}% annual ${item.kind}`}</p><div className="mt-4 flex h-36 items-end gap-2 rounded-2xl border bg-[#fffaf5] p-4">{chart.map((value, year) => <div key={year} className="flex h-full flex-1 flex-col items-center justify-end gap-1"><i className={`block w-full shrink-0 rounded-t ${item.kind === "interest" ? "bg-[#1f8378]" : "bg-[#7d5ea8]"}`} style={{ height: `${Math.max(10, value / Math.max(...chart) * 72)}%` }} /><small className="font-mono text-[8px]">Y{year}</small><small className="font-mono text-[8px]">{value}</small></div>)}</div><label className="mt-4 block rounded-xl border bg-white p-3 font-mono text-xs">{lang === "zh" ? "年數" : "YEARS"}: {years}<input type="range" min="1" max="5" value={years} onChange={(event) => setYears(+event.target.value)} className="mt-2 w-full accent-[#f05a3c]" /></label></div>;

  return <main className="min-h-screen bg-[#f8f5ed] p-5 text-[#172b3f] sm:p-7"><Link href="/#path" className="font-bold">← 返回學習地圖 / Back to map</Link><header className="mt-7 flex flex-wrap items-center gap-3 font-mono text-xs"><b className="grid size-12 place-items-center rounded-full bg-[#f05a3c] text-base font-black text-white">Q↗</b><strong className="tracking-[.16em]">MATHS QUEST</strong><span className="border-b-2 border-dotted border-[#f05a3c] pb-1">Q-PATH · S3 · {station.tag}</span><div className="ml-auto flex overflow-hidden rounded-lg border border-[#172b3f]/20"><button onClick={() => setLang("zh")} className={`px-3 py-2 font-bold ${lang === "zh" ? "bg-[#172b3f] text-white" : "bg-white"}`}>CMI 中文</button><button onClick={() => setLang("en")} className={`px-3 py-2 font-bold ${lang === "en" ? "bg-[#172b3f] text-white" : "bg-white"}`}>EMI English</button></div></header><h1 className="mt-5 text-4xl font-black">{label}</h1>{complete ? <section className="mq-practice-card mt-6 rounded-3xl border bg-white p-9 text-center"><div className="text-6xl">★</div><h2 className="mt-4 text-3xl font-black">{lang === "zh" ? "模擬站完成！" : "Simulation station completed!"}</h2><Link href="/#path" className="mq-start mt-6 inline-block rounded-xl bg-[#f05a3c] px-5 py-3 font-bold text-white">{lang === "zh" ? "返回學習地圖" : "Back to map"}</Link></section> : <section className="mq-practice-card mt-6 rounded-3xl border bg-white p-6 text-center sm:p-8"><p className="font-mono text-xs">STATION {String(index + 1).padStart(2, "0")} · {index + 1}/8 · S3 SIMULATION</p><p className="mx-auto mt-4 max-w-xl rounded-xl bg-[#fff7ef] p-3 text-sm font-bold">{lang === "zh" ? `導師提示：${station.cue[0]}` : `Mentor cue: ${station.cue[1]}`}</p><h2 className="mx-auto mt-5 max-w-2xl text-2xl font-black leading-snug">{task}</h2><button onClick={speak} className="mt-4 rounded-full border border-[#172b3f]/20 bg-white px-4 py-2 text-sm font-bold">◉ {lang === "zh" ? "朗讀任務" : "Read task"}</button>{trigModel || probabilityModel || financeModel}<button onClick={check} className="mq-start mt-7 rounded-xl bg-[#f05a3c] px-6 py-3 font-bold text-white">{lang === "zh" ? "檢查答案" : "Check answer"}</button>{result === "wrong" && <p className="mx-auto mt-4 max-w-xl rounded-xl bg-[#fff3e8] p-3 font-bold text-[#b84c36]">{lang === "zh" ? "請核對方位、理論概率或計算年數後再試。" : "Check the bearing, theoretical probability, or number of years and try again."}</p>}{result === "correct" && <div className="mt-4"><p className="font-bold text-[#0e8b87]">{lang === "zh" ? "答案正確。" : "Correct."}</p><button onClick={next} className="mq-start mt-3 rounded-xl bg-[#f05a3c] px-5 py-3 font-bold text-white">{index === 7 ? (lang === "zh" ? "完成本站" : "Finish station") : (lang === "zh" ? "下一題" : "Next question")}</button></div>}</section>}</main>;
}
