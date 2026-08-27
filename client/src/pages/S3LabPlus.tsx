// Maths Quest：此頁只保留中三三角學及概率的互動延伸；財務題目由百分法核心站處理。
// @ts-nocheck
import { useState } from "react";
import { Link } from "wouter";
import { markPracticeCompleted } from "@/lib/practiceCompletion";
import { recordDailyPractice } from "@/lib/dailyPractice";
import { recordPracticeMistake } from "@/lib/reviewRecommendations";
import { speakCantonese } from "@/lib/speech";

const meta = {
  trig: { zh: "三角學反向計算", en: "Trigonometry Reverse Calculation", tag: "TRIGONOMETRY" },
  probability: { zh: "概率抽樣", en: "Probability Sampling", tag: "PROBABILITY" },
};

export default function S3LabPlus() {
  const requestedTopic = new URLSearchParams(location.search).get("topic") || "trig";
  const topic = requestedTopic === "probability" ? "probability" : "trig";
  const info = meta[topic];
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
  const [result, setResult] = useState("");
  const [complete, setComplete] = useState(false);
  const zh = lang === "zh";
  const reset = () => { setMode("distance"); setHeight(12); setDistance(20); setAngle(30); setColorA("R"); setColorB("B"); setCountA(2); setCountB(1); setBag(["R", "R", "B"]); setDraws([]); setResult(""); };
  const reverseDistance = Math.round((height / Math.tan(angle * Math.PI / 180)) * 10) / 10;
  const reverseAngle = Math.round((Math.atan(height / distance) * 180 / Math.PI) * 10) / 10;
  const fail = () => { setResult("wrong"); recordPracticeMistake({ key: `s3-${topic}-lab`, grade: "S3", title: info.zh, href: `/practice/s3-lab?topic=${topic}` }); };
  const check = () => (topic === "trig" ? height > 0 && distance > 0 && angle > 0 : draws.length === 2 && countA + countB >= 2) ? setResult("correct") : fail();
  const next = () => { if (question === 7) { markPracticeCompleted(`s3-${topic}-lab`); recordDailyPractice(`s3-${topic}-lab`); setComplete(true); } else { setQuestion((value) => value + 1); reset(); } };
  const speak = () => { const text = topic === "trig" ? (zh ? "選擇反向計算模式，再用正切反求距離或角度。" : "Choose a reverse calculation mode and use tangent to find distance or angle.") : (zh ? "設定兩種球的標記及數量，裝入抽樣袋後進行不放回抽樣。" : "Set two ball labels and quantities, load the bag, then sample without replacement."); if (zh) speakCantonese(text); else if ("speechSynthesis" in window) { const utterance = new SpeechSynthesisUtterance(text); utterance.lang = "en-HK"; window.speechSynthesis.speak(utterance); } };
  const loadBag = () => { setBag([...Array(countA).fill(colorA), ...Array(countB).fill(colorB)]); setDraws([]); };
  const draw = () => { if (!bag.length) return; const pick = Math.floor(Math.random() * bag.length); setDraws([...draws, bag[pick]]); setBag(bag.filter((_, i) => i !== pick)); };
  const trigPanel = topic === "trig" ? <div className="mx-auto mt-5 max-w-xl"><div className="grid grid-cols-2 gap-3"><button onClick={() => setMode("distance")} className={`rounded-xl border-2 p-3 font-bold ${mode === "distance" ? "border-[#0e8b87] bg-[#e8f5f2]" : "border-[#1f8378]/35 bg-white"}`}>{zh ? "求距離" : "Find distance"}</button><button onClick={() => setMode("angle")} className={`rounded-xl border-2 p-3 font-bold ${mode === "angle" ? "border-[#0e8b87] bg-[#e8f5f2]" : "border-[#1f8378]/35 bg-white"}`}>{zh ? "求角度" : "Find angle"}</button></div><div className="mt-4 grid gap-3 rounded-2xl border bg-[#fffaf5] p-4 sm:grid-cols-3"><label className="font-mono text-xs">HEIGHT {height} m<input type="range" min="2" max="30" value={height} onChange={(event) => setHeight(+event.target.value)} className="mt-2 w-full accent-[#f05a3c]"/></label><label className="font-mono text-xs">DISTANCE {distance} m<input type="range" min="5" max="50" value={distance} onChange={(event) => setDistance(+event.target.value)} className="mt-2 w-full accent-[#f05a3c]"/></label><label className="font-mono text-xs">ANGLE {angle}°<input type="range" min="10" max="70" value={angle} onChange={(event) => setAngle(+event.target.value)} className="mt-2 w-full accent-[#f05a3c]"/></label></div><div className="mt-5 rounded-xl border-2 border-dashed border-[#f05a3c] p-4 font-mono"><small className="mr-2 text-[9px] text-[#f05a3c]">CHECKPOINT</small>{mode === "distance" ? `d = h ÷ tan θ = ${height} ÷ tan ${angle}° = ${reverseDistance} m` : `θ = tan⁻¹(h ÷ d) = tan⁻¹(${height} ÷ ${distance}) = ${reverseAngle}°`}</div></div> : null;
  const probabilityPanel = topic === "probability" ? <div className="mx-auto mt-5 max-w-xl"><div className="grid gap-3 rounded-2xl border bg-[#fffaf5] p-4 sm:grid-cols-2"><label className="font-mono text-xs">BALL A<input value={colorA} maxLength={1} onChange={(event) => setColorA(event.target.value.toUpperCase() || "A")} className="mt-2 w-full rounded border bg-white p-2"/></label><label className="font-mono text-xs">COUNT A<input type="number" min="0" max="8" value={countA} onChange={(event) => setCountA(Math.max(0, +event.target.value))} className="mt-2 w-full rounded border bg-white p-2"/></label><label className="font-mono text-xs">BALL B<input value={colorB} maxLength={1} onChange={(event) => setColorB(event.target.value.toUpperCase() || "B")} className="mt-2 w-full rounded border bg-white p-2"/></label><label className="font-mono text-xs">COUNT B<input type="number" min="0" max="8" value={countB} onChange={(event) => setCountB(Math.max(0, +event.target.value))} className="mt-2 w-full rounded border bg-white p-2"/></label></div><button onClick={loadBag} className="mt-3 rounded-lg border-2 border-[#1f8378] bg-[#e8f5f2] px-4 py-2 font-bold">{zh ? "裝入抽樣袋" : "Load bag"}</button><div className="mt-4 rounded-2xl border bg-white p-4"><p className="font-mono text-xs">NO-REPLACEMENT SAMPLING</p><div className="mt-4 flex items-center justify-between"><div className="flex gap-2">{bag.map((ball, index) => <i key={index} className={`grid size-8 place-items-center rounded-full font-bold text-white ${ball === colorA ? "bg-[#f05a3c]" : "bg-[#3867a7]"}`}>{ball}</i>)}</div><button onClick={draw} className="rounded-lg bg-[#f05a3c] px-3 py-2 text-sm font-bold text-white">{zh ? "抽一球" : "Draw"}</button></div><p className="mt-4 font-mono">DRAW PATH: {draws.join(" → ") || "—"}</p></div></div> : null;
  const prompt = topic === "trig" ? (zh ? "選擇反向模式，利用已知高度、距離或角度找出未知量。" : "Choose a reverse mode and use known height, distance or angle to find the unknown.") : (zh ? "自訂兩種球的標記和數量，再以不放回方式抽取兩次。" : "Customize two ball labels and quantities, then draw twice without replacement.");
  return <main className="min-h-screen bg-[#f8f5ed] p-5 text-[#172b3f] sm:p-7"><Link href="/#path" className="font-bold">← 返回學習地圖 / Back to map</Link><header className="mt-7 flex flex-wrap items-center gap-3 font-mono text-xs"><b className="grid size-12 place-items-center rounded-full bg-[#f05a3c] text-base font-black text-white">Q↗</b><strong className="tracking-[.16em]">MATHS QUEST</strong><span className="border-b-2 border-dotted border-[#f05a3c] pb-1">Q-PATH · S3 · {info.tag}</span><div className="ml-auto flex overflow-hidden rounded-lg border border-[#172b3f]/20"><button onClick={() => setLang("zh")} className={`px-3 py-2 font-bold ${zh ? "bg-[#172b3f] text-white" : "bg-white"}`}>CMI 中文</button><button onClick={() => setLang("en")} className={`px-3 py-2 font-bold ${!zh ? "bg-[#172b3f] text-white" : "bg-white"}`}>EMI English</button></div></header><h1 className="mt-5 text-4xl font-black">{zh ? info.zh : info.en}</h1>{complete ? <section className="mq-practice-card mt-6 rounded-3xl border bg-white p-9 text-center"><div className="text-6xl">★</div><h2 className="mt-4 text-3xl font-black">{zh ? "練習完成！" : "Practice completed!"}</h2><Link href="/#path" className="mq-start mt-6 inline-block rounded-xl bg-[#f05a3c] px-5 py-3 font-bold text-white">{zh ? "返回學習地圖" : "Back to map"}</Link></section> : <section className="mq-practice-card mt-6 rounded-3xl border bg-white p-6 text-center sm:p-8"><p className="font-mono text-xs">STATION {String(question + 1).padStart(2, "0")} · {question + 1}/8 · S3 PRACTICE</p><h2 className="mx-auto mt-5 max-w-2xl text-2xl font-black leading-snug">{prompt}</h2><button onClick={speak} className="mt-4 rounded-full border border-[#172b3f]/20 bg-white px-4 py-2 text-sm font-bold">◉ {zh ? "朗讀任務" : "Read task"}</button>{trigPanel || probabilityPanel}<button onClick={check} className="mq-start mt-7 rounded-xl bg-[#f05a3c] px-6 py-3 font-bold text-white">{zh ? "檢查操作" : "Check"}</button>{result === "wrong" && <p className="mx-auto mt-4 max-w-xl rounded-xl bg-[#fff3e8] p-3 font-bold text-[#b84c36]">{zh ? "完成所需設定或抽樣後，再檢查一次。" : "Complete the required setup or draws, then check again."}</p>}{result === "correct" && <div className="mt-4"><p className="font-bold text-[#0e8b87]">{zh ? "操作正確！" : "Correct!"}</p><button onClick={next} className="mq-start mt-3 rounded-xl bg-[#f05a3c] px-5 py-3 font-bold text-white">{question === 7 ? (zh ? "完成本站" : "Finish station") : (zh ? "下一題" : "Next task")}</button></div>}</section>}</main>;
}
