// Maths Quest「數學探險手帳」：S3 延伸實驗室以反向計算、自訂抽樣袋及目標儲蓄，深化可操作雙語模型。
// @ts-nocheck
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { markPracticeCompleted } from "@/lib/practiceCompletion";
import { recordDailyPractice } from "@/lib/dailyPractice";
import { recordPracticeMistake } from "@/lib/reviewRecommendations";
import { speakCantonese } from "@/lib/speech";

const meta = {
  trig: { zh: "三角學反向計算實驗室", en: "Trigonometry Reverse Lab", tag: "REVERSE HEIGHT MAP" },
  probability: { zh: "自訂概率抽樣袋", en: "Custom Probability Bag", tag: "CUSTOM SAMPLING" },
  finance: { zh: "儲蓄目標與每月供款", en: "Savings Goal and Contributions", tag: "GOAL CURVES" },
};

export default function S3LabPlus() {
  const topic = new URLSearchParams(location.search).get("topic") || "trig";
  const info = meta[topic] || meta.trig;
  const [lang, setLang] = useState("zh");
  const [question, setQuestion] = useState(0);
  const [mode, setMode] = useState("distance");
  const [height, setHeight] = useState(12);
  const [distance, setDistance] = useState(20);
  const [angle, setAngle] = useState(30);
  const [colorA, setColorA] = useState("R");
  const [colorB, setColorB] = useState("B");
  const [countA, setCountA] = useState(2);
  const [countB, setCountB] = useState(1);
  const [bag, setBag] = useState(["R", "R", "B"]);
  const [draws, setDraws] = useState<string[]>([]);
  const [principal, setPrincipal] = useState(1000);
  const [rate, setRate] = useState(4);
  const [monthly, setMonthly] = useState(500);
  const [goal, setGoal] = useState(25000);
  const [years, setYears] = useState(3);
  const [result, setResult] = useState("");
  const [complete, setComplete] = useState(false);
  const zh = lang === "zh";
  const reset = () => { setMode("distance"); setHeight(12); setDistance(20); setAngle(30); setColorA("R"); setColorB("B"); setCountA(2); setCountB(1); setBag(["R", "R", "B"]); setDraws([]); setPrincipal(1000); setRate(4); setMonthly(500); setGoal(25000); setYears(3); setResult(""); };
  const reverseDistance = Math.round((height / Math.tan(angle * Math.PI / 180)) * 10) / 10;
  const reverseAngle = Math.round((Math.atan(height / distance) * 180 / Math.PI) * 10) / 10;
  const months = years * 12;
  const monthlyRate = rate / 1200;
  const futureValue = Math.round(principal * Math.pow(1 + monthlyRate, months) + monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate));
  const noContribution = Math.round(principal * Math.pow(1 + monthlyRate, months));
  const goalPct = Math.min(100, Math.round(futureValue / goal * 100));
  const curve = useMemo(() => Array.from({ length: years + 1 }, (_, y) => {
    const m = y * 12;
    return Math.round(principal * Math.pow(1 + monthlyRate, m) + monthly * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate));
  }), [principal, monthly, monthlyRate, years]);
  const fail = () => { setResult("wrong"); recordPracticeMistake({ key: `s3-${topic}-lab-plus`, grade: "S3", title: info.zh, href: `/practice/s3-lab?topic=${topic}` }); };
  const check = () => { const ok = topic === "trig" ? (height > 0 && distance > 0 && angle > 0) : topic === "probability" ? (draws.length === 2 && countA + countB >= 2) : (principal > 0 && monthly >= 0 && goal > 0); ok ? setResult("correct") : fail(); };
  const next = () => { if (question === 7) { markPracticeCompleted(`s3-${topic}-lab-plus`); recordDailyPractice(`s3-${topic}-lab-plus`); setComplete(true); } else { setQuestion(question + 1); reset(); } };
  const speak = () => { const text = topic === "trig" ? (zh ? "選擇反向計算模式，再用正切反求距離或角度。" : "Choose a reverse calculation mode and use tangent to find distance or angle.") : topic === "probability" ? (zh ? "設定兩種球的標記及數量，裝入抽樣袋後進行不放回抽樣。" : "Set two ball labels and quantities, load the bag, then sample without replacement.") : (zh ? "輸入本金、利率、每月供款及儲蓄目標，觀察達標進度。" : "Enter principal, rate, monthly contribution and savings goal to view progress."); if (zh) speakCantonese(text); else if ("speechSynthesis" in window) { const u = new SpeechSynthesisUtterance(text); u.lang = "en-HK"; window.speechSynthesis.speak(u); } };
  const loadBag = () => { const nextBag = [...Array(countA).fill(colorA), ...Array(countB).fill(colorB)]; setBag(nextBag); setDraws([]); };
  const draw = () => { if (!bag.length) return; const pick = Math.floor(Math.random() * bag.length); setDraws([...draws, bag[pick]]); setBag(bag.filter((_, i) => i !== pick)); };
  const trigPanel = topic === "trig" ? <div className="mx-auto mt-5 max-w-xl">
    <div className="grid grid-cols-2 gap-3"><button onClick={() => setMode("distance")} className={`rounded-xl border-2 p-3 font-bold ${mode === "distance" ? "border-[#0e8b87] bg-[#e8f5f2]" : "border-[#1f8378]/35 bg-white"}`}>DISTANCE / {zh ? "求距離" : "distance"}</button><button onClick={() => setMode("angle")} className={`rounded-xl border-2 p-3 font-bold ${mode === "angle" ? "border-[#0e8b87] bg-[#e8f5f2]" : "border-[#1f8378]/35 bg-white"}`}>ANGLE / {zh ? "求角度" : "angle"}</button></div>
    <div className="mt-4 grid gap-3 rounded-2xl border bg-[#fffaf5] p-4 sm:grid-cols-3"><label className="font-mono text-xs">HEIGHT {height}m<input type="range" min="2" max="30" step="1" value={height} onChange={e => setHeight(+e.target.value)} className="mt-2 w-full accent-[#f05a3c]"/></label><label className="font-mono text-xs">DISTANCE {distance}m<input type="range" min="5" max="50" step="1" value={distance} onChange={e => setDistance(+e.target.value)} className="mt-2 w-full accent-[#f05a3c]"/></label><label className="font-mono text-xs">ANGLE {angle}°<input type="range" min="10" max="70" step="1" value={angle} onChange={e => setAngle(+e.target.value)} className="mt-2 w-full accent-[#f05a3c]"/></label></div>
    <div className="relative mx-auto mt-5 h-52 max-w-md overflow-hidden rounded-2xl border-2 border-[#1f8378] bg-[#f7fcfb]"><i className="absolute bottom-8 left-6 right-6 border-t-2 border-[#1f8378]"/><i className="absolute bottom-8 left-12 h-40 border-l-4 border-[#1f8378]"/><i className="absolute bottom-8 left-12 w-56 origin-bottom-left border-t-4 border-[#f05a3c]" style={{ transform: `rotate(${-angle}deg)` }}/><span className="absolute left-2 top-4 font-mono text-xs">h = {height}m</span><span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-xs">d = {distance}m</span></div>
    <div className="mt-5 rounded-xl border-2 border-dashed border-[#f05a3c] p-4 font-mono"><small className="mr-2 text-[9px] text-[#f05a3c]">REVERSE CHECKPOINT</small>{mode === "distance" ? `d = h ÷ tan θ = ${height} ÷ tan ${angle}° = ${reverseDistance}m` : `θ = tan⁻¹(h ÷ d) = tan⁻¹(${height} ÷ ${distance}) = ${reverseAngle}°`}</div>
  </div> : null;
  const probabilityPanel = topic === "probability" ? <div className="mx-auto mt-5 max-w-xl">
    <div className="grid gap-3 rounded-2xl border bg-[#fffaf5] p-4 sm:grid-cols-2"><label className="font-mono text-xs">BALL A<input value={colorA} maxLength={1} onChange={e => setColorA(e.target.value.toUpperCase() || "A")} className="mt-2 w-full rounded border bg-white p-2"/></label><label className="font-mono text-xs">COUNT A<input type="number" min="0" max="8" value={countA} onChange={e => setCountA(Math.max(0, +e.target.value))} className="mt-2 w-full rounded border bg-white p-2"/></label><label className="font-mono text-xs">BALL B<input value={colorB} maxLength={1} onChange={e => setColorB(e.target.value.toUpperCase() || "B")} className="mt-2 w-full rounded border bg-white p-2"/></label><label className="font-mono text-xs">COUNT B<input type="number" min="0" max="8" value={countB} onChange={e => setCountB(Math.max(0, +e.target.value))} className="mt-2 w-full rounded border bg-white p-2"/></label></div>
    <button onClick={loadBag} className="mt-3 rounded-lg border-2 border-[#1f8378] bg-[#e8f5f2] px-4 py-2 font-bold">{zh ? "裝入抽樣袋 / Load bag" : "Load bag"}</button>
    <div className="mt-4 rounded-2xl border bg-white p-4"><p className="font-mono text-xs">NO-REPLACEMENT TREE</p><div className="mt-3 grid grid-cols-[auto_1fr_auto] items-center gap-3 font-mono text-sm"><b>START</b><i className="border-t-2 border-[#1f8378]"/><b>{colorA} {countA}/{countA + countB || 1}</b><span></span><i className="border-t-2 border-[#1f8378]"/><b>{colorB} {countB}/{countA + countB || 1}</b></div><div className="mt-4 flex items-center justify-between"><div className="flex gap-2">{bag.map((x, i) => <i key={i} className={`grid size-8 place-items-center rounded-full font-bold text-white ${x === colorA ? "bg-[#f05a3c]" : "bg-[#3867a7]"}`}>{x}</i>)}</div><button onClick={draw} className="rounded-lg bg-[#f05a3c] px-3 py-2 text-sm font-bold text-white">{zh ? "抽一球" : "Draw"}</button></div><p className="mt-4 font-mono">DRAW PATH: {draws.join(" → ") || "—"}</p></div>
  </div> : null;
  const financePanel = topic === "finance" ? <div className="mx-auto mt-5 max-w-xl">
    <div className="grid gap-3 rounded-2xl border bg-[#fffaf5] p-4 sm:grid-cols-2"><label className="font-mono text-xs">PRINCIPAL<input type="number" min="0" value={principal} onChange={e => setPrincipal(Math.max(0, +e.target.value))} className="mt-2 w-full rounded border bg-white p-2"/></label><label className="font-mono text-xs">RATE %<input type="number" min="0" max="20" value={rate} onChange={e => setRate(Math.max(0, +e.target.value))} className="mt-2 w-full rounded border bg-white p-2"/></label><label className="font-mono text-xs">MONTHLY<input type="number" min="0" value={monthly} onChange={e => setMonthly(Math.max(0, +e.target.value))} className="mt-2 w-full rounded border bg-white p-2"/></label><label className="font-mono text-xs">SAVINGS GOAL<input type="number" min="1" value={goal} onChange={e => setGoal(Math.max(1, +e.target.value))} className="mt-2 w-full rounded border bg-white p-2"/></label></div>
    <label className="mt-3 block rounded-xl border bg-white p-3 font-mono text-xs">YEARS {years}<input type="range" min="1" max="10" value={years} onChange={e => setYears(+e.target.value)} className="mt-2 w-full accent-[#f05a3c]"/></label>
    <div className="mt-5 rounded-2xl border bg-white p-4"><p className="font-mono text-xs">GOAL CURVE / MONTHLY CONTRIBUTION</p><svg viewBox="0 0 300 130" className="mt-2 w-full"><path d="M20 112H286M20 15V112" stroke="#172b3f" strokeWidth="2" fill="none"/><polyline fill="none" stroke="#f05a3c" strokeWidth="4" points={curve.map((v,i) => `${22 + i * (250 / Math.max(1, curve.length - 1))},${108 - Math.min(85, v / Math.max(goal, ...curve) * 85)}`).join(" ")}/><line x1="20" y1={108 - Math.min(85, goal / Math.max(goal, ...curve) * 85)} x2="286" y2={108 - Math.min(85, goal / Math.max(goal, ...curve) * 85)} stroke="#1f8378" strokeDasharray="5 4" strokeWidth="2"/></svg><div className="flex justify-between font-mono text-[10px]"><span className="text-[#f05a3c]">● {zh ? "供款後金額" : "with contribution"}</span><span className="text-[#1f8378]">— {zh ? "目標" : "goal"}</span></div></div>
    <div className="mt-4 rounded-xl border-2 border-dashed border-[#f05a3c] p-4 font-mono"><small className="mr-2 text-[9px] text-[#f05a3c]">GOAL CHECKPOINT</small>Y{years}: ${futureValue} / {goalPct}% {zh ? "達標" : "to goal"} · {zh ? "無供款" : "no contribution"}: ${noContribution}</div>
  </div> : null;
  const prompt = topic === "trig" ? (zh ? "選擇反向模式，利用已知高度、距離或角度找出未知量。" : "Choose a reverse mode and use known height, distance or angle to find the unknown.") : topic === "probability" ? (zh ? "自訂兩種球的標記和數量，再以不放回方式抽取兩次。" : "Customize two ball labels and quantities, then draw twice without replacement.") : (zh ? "設定儲蓄目標和每月供款，觀察成長曲線是否跨過目標線。" : "Set a savings goal and monthly contribution; observe whether the growth curve reaches the goal line.");
  return <main className="min-h-screen bg-[#f8f5ed] p-5 text-[#172b3f] sm:p-7"><Link href="/#path" className="font-bold">← 返回學習地圖 / Back to map</Link><header className="mt-7 flex flex-wrap items-center gap-3 font-mono text-xs"><b className="grid size-12 place-items-center rounded-full bg-[#f05a3c] text-base font-black text-white">Q↗</b><strong className="tracking-[.16em]">MATHS QUEST</strong><span className="border-b-2 border-dotted border-[#f05a3c] pb-1">Q-PATH · S3 · {info.tag}</span><div className="ml-auto flex overflow-hidden rounded-lg border border-[#172b3f]/20"><button onClick={() => setLang("zh")} className={`px-3 py-2 font-bold ${zh ? "bg-[#172b3f] text-white" : "bg-white"}`}>CMI 中文</button><button onClick={() => setLang("en")} className={`px-3 py-2 font-bold ${!zh ? "bg-[#172b3f] text-white" : "bg-white"}`}>EMI English</button></div></header><div className="mt-3 flex max-w-md items-center gap-2 font-mono text-[9px] font-bold"><span className="rounded bg-[#1f8378] px-2 py-1 text-white">01 CUSTOMISE</span><i className="h-px flex-1 border-t-2 border-dotted border-[#f05a3c]"/><span>02 SIMULATE</span><i className="h-px flex-1 border-t-2 border-dotted border-[#f05a3c]"/><span>03 CHECK</span></div><h1 className="mt-3 text-4xl font-black">{zh ? info.zh : info.en}</h1>{complete ? <section className="mq-practice-card mt-6 rounded-3xl border bg-white p-9 text-center"><div className="text-6xl">★</div><h2 className="mt-4 text-3xl font-black">{zh ? "延伸實驗完成！" : "Extension lab completed!"}</h2><Link href="/#path" className="mq-start mt-6 inline-block rounded-xl bg-[#f05a3c] px-5 py-3 font-bold text-white">{zh ? "返回學習地圖" : "Back to map"}</Link></section> : <section className="mq-practice-card mt-6 rounded-3xl border bg-white p-6 text-center sm:p-8"><p className="font-mono text-xs">STATION {String(question + 1).padStart(2, "0")} · {question + 1}/8 · EXTENSION LAB</p><h2 className="mx-auto mt-5 max-w-2xl text-2xl font-black leading-snug">{prompt}</h2><button onClick={speak} className="mt-4 rounded-full border border-[#172b3f]/20 bg-white px-4 py-2 text-sm font-bold">◉ {zh ? "朗讀任務" : "Read task"}</button>{trigPanel || probabilityPanel || financePanel}<button onClick={check} className="mq-start mt-7 rounded-xl bg-[#f05a3c] px-6 py-3 font-bold text-white">{zh ? "檢查模擬" : "Check simulation"}</button>{result === "wrong" && <p className="mx-auto mt-4 max-w-xl rounded-xl bg-[#fff3e8] p-3 font-bold text-[#b84c36]">{zh ? "完成所需設定或抽樣後，再檢查一次。" : "Complete the required setup or draws, then check again."}</p>}{result === "correct" && <div className="mt-4"><p className="font-bold text-[#0e8b87]">{zh ? "實驗設定正確！前往下一個檢查點。" : "Lab setup correct! Proceed to the next checkpoint."}</p><button onClick={next} className="mq-start mt-3 rounded-xl bg-[#f05a3c] px-5 py-3 font-bold text-white">{question === 7 ? (zh ? "完成本站" : "Finish station") : (zh ? "下一題" : "Next task")}</button></div>}</section>}</main>;
}
