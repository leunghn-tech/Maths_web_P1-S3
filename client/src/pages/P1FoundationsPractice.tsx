// @ts-nocheck
/**
 * Maths Quest P1 基礎概念站：暖白手帳格線、深墨藍題面、解題橘紅操作。
 * 大圖示、短句、拖曳兼點按，讓低年級學生動手探索。
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, CalendarDays, ChartColumnIncreasing, Check, Hash, Lightbulb, Moon, PenLine, RotateCcw, Star, Sun, Trophy, Volume2, VolumeX, Waypoints, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { playCelebrationSound, playCorrectSound, playWrongSound } from "@/lib/sounds";
import { markPracticeCompleted } from "@/lib/practiceCompletion";
import { recordDailyPractice } from "@/lib/dailyPractice";
import { speakCorrectEncouragement, speakTryAgain } from "@/lib/speech";
import SpeakButton from "@/components/SpeakButton";
import CorrectCelebration from "@/components/CorrectCelebration";
import MidpointBreak from "@/components/MidpointBreak";
import FinishAchievementOverlay from "@/components/FinishAchievementOverlay";
import type { VoiceReviewItem } from "@/components/WrongReviewVoiceButton";

type Mode = "count" | "calendar" | "lines" | "pictograph";
type Result = "idle" | "correct" | "incorrect";
type CountTask = { action: "count" | "match"; emoji: string; label: string; answer: number; choices: number[] };
type CalendarTask = { action: "order"; days: string[] } | { action: "relative"; today: string; relation: "昨天" | "明天"; answer: string; story: string; choices: string[] };
type LineTask = { action: "classify" | "trace"; answer: "直線" | "曲線"; path: string };
type PictoTask = { action: "read"; title: string; rows: [string, string, number][]; answer: string } | { action: "make"; title: string; rows: [string, string, number][]; emoji: string; label: string; answer: number };

const days = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const numberChoices = (answer: number) => {
  const choices = new Set([answer]);
  for (let distance = 1; choices.size < 4 && distance <= 20; distance += 1) {
    if (answer - distance >= 1) choices.add(answer - distance);
    if (choices.size < 4 && answer + distance <= 20) choices.add(answer + distance);
  }
  return shuffle([...choices]);
};
const icons = (emoji: string, amount: number) => Array.from({ length: amount }, (_, index) => <i key={index}>{emoji}</i>);

const counts: CountTask[] = [
  { action: "count", emoji: "🍎", label: "蘋果", answer: 6, choices: numberChoices(6) },
  { action: "match", emoji: "⭐", label: "星星", answer: 12, choices: numberChoices(12) },
  { action: "count", emoji: "🐟", label: "小魚", answer: 9, choices: numberChoices(9) },
  { action: "match", emoji: "🟡", label: "圓點", answer: 15, choices: numberChoices(15) },
  { action: "count", emoji: "🍪", label: "餅乾", answer: 4, choices: numberChoices(4) },
  { action: "match", emoji: "🧱", label: "積木", answer: 18, choices: numberChoices(18) },
  { action: "count", emoji: "🌼", label: "小花", answer: 11, choices: numberChoices(11) },
  { action: "match", emoji: "🔵", label: "藍點", answer: 20, choices: numberChoices(20) },
];
const calendars: CalendarTask[] = [
  { action: "order", days: ["星期一", "星期二", "星期三"] },
  { action: "relative", today: "星期三", relation: "昨天", answer: "星期二", story: "小晴今天上課。", choices: ["星期一", "星期二", "星期四"] },
  { action: "order", days: ["星期四", "星期五", "星期六"] },
  { action: "relative", today: "星期六", relation: "明天", answer: "星期日", story: "阿朗今天去公園。", choices: ["星期五", "星期日", "星期一"] },
  { action: "order", days: ["星期一", "星期二", "星期日"] },
  { action: "relative", today: "星期一", relation: "昨天", answer: "星期日", story: "小美今天返學。", choices: ["星期六", "星期日", "星期二"] },
  { action: "order", days: ["星期三", "星期四", "星期五", "星期六"] },
  { action: "relative", today: "星期五", relation: "明天", answer: "星期六", story: "明天不用上課。", choices: ["星期四", "星期六", "星期日"] },
];
const lines: LineTask[] = [
  { action: "classify", answer: "直線", path: "M16 92 L224 18" },
  { action: "classify", answer: "曲線", path: "M18 82 C65 8,158 126,224 28" },
  { action: "trace", answer: "直線", path: "M18 24 L222 92" },
  { action: "trace", answer: "曲線", path: "M18 35 C88 130,146 -6,224 77" },
  { action: "classify", answer: "直線", path: "M18 62 L224 62" },
  { action: "trace", answer: "曲線", path: "M18 70 C72 5,159 129,224 48" },
  { action: "trace", answer: "直線", path: "M32 104 L202 14" },
  { action: "classify", answer: "曲線", path: "M18 62 C72 0,152 125,224 60" },
];
const pictographs: PictoTask[] = [
  { action: "read", title: "哪一樣最多？", rows: [["🍎", "蘋果", 2], ["🍌", "香蕉", 4], ["🍓", "草莓", 3]], answer: "香蕉" },
  { action: "make", title: "拖圖案做圖表", rows: [["🚗", "小車", 2], ["🚌", "巴士", 1], ["🚲", "單車", 3]], emoji: "🚗", label: "小車", answer: 2 },
  { action: "read", title: "哪一樣最少？", rows: [["🐶", "小狗", 1], ["🐱", "小貓", 3], ["🐰", "小兔", 2]], answer: "小狗" },
  { action: "make", title: "拖圖案做圖表", rows: [["🌞", "晴天", 3], ["☁️", "多雲", 2], ["🌧️", "下雨", 1]], emoji: "🌧️", label: "下雨", answer: 1 },
  { action: "read", title: "哪一樣有 3 個？", rows: [["⚽", "足球", 3], ["🏀", "籃球", 1], ["🎾", "網球", 2]], answer: "足球" },
  { action: "make", title: "拖圖案做圖表", rows: [["🟡", "黃圓點", 1], ["🔵", "藍圓點", 3], ["🔴", "紅圓點", 2]], emoji: "🔵", label: "藍圓點", answer: 3 },
  { action: "read", title: "哪一樣最多？", rows: [["🍪", "餅乾", 2], ["🧁", "蛋糕", 1], ["🍩", "冬甩", 4]], answer: "冬甩" },
  { action: "make", title: "拖圖案做圖表", rows: [["🐟", "小魚", 2], ["🐳", "鯨魚", 1], ["🐙", "章魚", 3]], emoji: "🐟", label: "小魚", answer: 2 },
];

const station = {
  count: { key: "p1-counting", code: "P1.01A", title: "20 以內的數", subtitle: "數一數，再配對正確數字。", action: "數數和配對", hint: "逐個點數，不要跳過，也不要重複數。", stamp: "NUMBER LAB", Icon: Hash },
  calendar: { key: "p1-calendar", code: "P1.04B", title: "星期與日曆", subtitle: "排好星期，也想想今天前後的日子。", action: "排好星期的次序", hint: "一星期由星期一開始；昨天在前，明天在後。", stamp: "WEEK LAB", Icon: CalendarDays },
  lines: { key: "p1-lines", code: "P1.06C", title: "直線與曲線", subtitle: "分一分，再沿著線條描一描。", action: "認識直線和曲線", hint: "直線不轉彎；曲線會彎彎地走。", stamp: "LINE LAB", Icon: Waypoints },
  pictograph: { key: "p1-pictograph", code: "P1.08", title: "象形圖", subtitle: "看圖數一數，也拖圖案做圖表。", action: "每個圖形代表 1 個單位", hint: "每一個圖案代表 1 個單位，逐個數最清楚。", stamp: "DATA LAB", Icon: ChartColumnIncreasing },
} as const;

const getMode = (path: string): Mode => path.includes("counting") ? "count" : path.includes("lines") ? "lines" : path.includes("pictograph") ? "pictograph" : "calendar";

export default function P1FoundationsPractice() {
  const [location] = useLocation();
  const mode = getMode(location); const info = station[mode]; const { theme, toggleTheme } = useTheme(); const StationIcon = info.Icon;
  const tasks = useMemo(() => mode === "count" ? counts : mode === "calendar" ? calendars : mode === "lines" ? lines : pictographs, [mode]);
  const [index, setIndex] = useState(0); const [result, setResult] = useState<Result>("idle"); const [score, setScore] = useState(0); const [seconds, setSeconds] = useState(0); const [sound, setSound] = useState(true); const [finished, setFinished] = useState(false); const [midpointOpen, setMidpointOpen] = useState(false); const [picked, setPicked] = useState<string[]>([]); const [traced, setTraced] = useState(0); const [made, setMade] = useState(0); const [wrongItems, setWrongItems] = useState<VoiceReviewItem[]>([]);
  const task: any = tasks[index];
  const complete = index + (result === "correct" ? 1 : 0); const stars = score === 8 ? 3 : score >= 6 ? 2 : score ? 1 : 0; const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  const orderedOptions = useMemo(() => mode === "calendar" && task.action === "order" ? shuffle(task.days) : [], [index, mode]);

  useEffect(() => { if (finished) return; const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000); return () => window.clearInterval(timer); }, [finished]);

  const prompt = mode === "count" ? (task.action === "count" ? `請數一數有多少個${task.label}。` : `哪一張卡有${task.answer}個${task.label}？`) : mode === "calendar" ? (task.action === "order" ? "請由最早的一日開始，逐個按好星期的次序。" : `${task.story}今天是${task.today}，${task.relation}是星期幾？`) : mode === "lines" ? (task.action === "trace" ? "沿著虛線描一描。" : "這是直線，還是曲線？") : task.action === "make" ? `請把${task.emoji}拖到圖表，做出${task.answer}個${task.label}。` : `${task.title}，每個圖形代表 1 個單位。`;
  const reset = () => { setResult("idle"); setPicked([]); setTraced(0); setMade(0); };
  const correct = () => { setResult("correct"); setScore((value) => value + 1); if (sound) { playCorrectSound(); speakCorrectEncouragement(); } };
  const wrong = (answer: string, hint: string) => { setResult("incorrect"); setWrongItems((items) => [...items, { prompt, answer, hint }]); if (sound) { playWrongSound(); speakTryAgain(); } };
  const verify = (answer?: string | number) => {
    if (result !== "idle") return;
    if (mode === "count") return answer === task.answer ? correct() : wrong(`${task.answer} 個${task.label}`, "逐個點數，數完才選數字。");
    if (mode === "calendar") return task.action === "order" ? (picked.length === task.days.length && picked.every((day, position) => day === task.days[position]) ? correct() : wrong(task.days.join("、"), "從最早的一日開始，一日一日向後排。")) : answer === task.answer ? correct() : wrong(task.answer, "昨天在今天前一日；明天在今天後一日。");
    if (mode === "lines") return task.action === "trace" ? (traced >= 6 ? correct() : wrong(task.answer, "用手指或滑鼠沿著虛線多走幾下。")) : answer === task.answer ? correct() : wrong(task.answer, task.answer === "直線" ? "直線不轉彎。" : "曲線有彎彎的地方。");
    return task.action === "make" ? (made === task.answer ? correct() : wrong(`${task.answer} 個${task.label}`, "每個圖案只代表 1 個，數數已拖進去的圖案。")) : answer === task.answer ? correct() : wrong(task.answer, "逐個數每一行的圖案。");
  };
  const next = () => { if (index === 7) { setFinished(true); markPracticeCompleted(info.key); recordDailyPractice(info.key); if (sound) playCelebrationSound(); return; } if (index === 3) setMidpointOpen(true); setIndex((value) => value + 1); reset(); };
  const restart = () => { setIndex(0); setResult("idle"); setScore(0); setSeconds(0); setFinished(false); setMidpointOpen(false); setPicked([]); setTraced(0); setMade(0); setWrongItems([]); };
  const addSymbol = () => setMade((value) => Math.min(4, value + 1));

  const activity = mode === "count" ? <div className="mq-count-board"><div className="mq-count-scale"><b>0</b><b>5</b><b>10</b><b>15</b><b>20</b></div><div className="mq-count-object-row">{icons(task.emoji, task.answer)}</div>{task.action === "count" ? <div className="mq-number-choice-grid">{task.choices.map((choice) => <button key={choice} onClick={() => verify(choice)}>{choice}</button>)}</div> : <div className="mq-count-match-grid">{task.choices.map((choice) => <button key={choice} onClick={() => verify(choice)}><span>{icons(task.emoji, choice)}</span><strong>{choice}</strong></button>)}</div>}</div> : mode === "calendar" ? <div className="mq-week-board">{task.action === "order" ? <><div className="mq-week-strip">{days.map((day) => <span key={day} className={picked.includes(day) ? "is-picked" : ""}>{day}</span>)}</div><div className="mq-week-tray">{orderedOptions.map((day) => <button key={day} onClick={() => setPicked((items) => items.includes(day) ? items : [...items, day])} disabled={picked.includes(day)} className={picked.includes(day) ? "is-picked" : ""}><CalendarDays className="size-5" />{day}</button>)}</div><div className="mq-picked-order">{picked.length ? picked.map((day, position) => <span key={day}>{position + 1}. {day}</span>) : <span>按卡片，排出次序。</span>}</div><button onClick={() => verify()} disabled={picked.length !== task.days.length} className="mq-start rounded-full bg-[#f05a3c] px-5 py-3 text-sm font-extrabold text-white disabled:opacity-40">檢查次序</button></> : <><div className="mq-day-story"><span>今天<br /><b>{task.today}</b></span><i>{task.relation}是？</i><small>{task.story}</small></div><div className="mq-day-choices">{task.choices.map((day) => <button key={day} onClick={() => verify(day)}><CalendarDays className="size-5" />{day}</button>)}</div></>}</div> : mode === "lines" ? <div className="mq-line-board"><svg viewBox="0 0 240 118" role="img" aria-label="線條"><path d={task.path} className="mq-line-dash" /><path d={task.path} className={traced >= 6 ? "mq-line-trace is-done" : "mq-line-trace"} /></svg>{task.action === "trace" ? <><button onPointerDown={() => setTraced((value) => Math.min(8, value + 2))} onPointerMove={() => setTraced((value) => Math.min(8, value + 1))} className={`mq-trace-pad ${traced >= 6 ? "is-done" : ""}`}><PenLine className="size-7" /><strong>{traced >= 6 ? "描好了！" : "按住並在這裡描線"}</strong><small>描線進度 {Math.min(100, Math.round(traced / 6 * 100))}%</small></button><button onClick={() => verify()} className="mq-start rounded-full bg-[#f05a3c] px-5 py-3 text-sm font-extrabold text-white">檢查描線</button></> : <div className="mq-line-choices"><button onClick={() => verify("直線")}><span className="mq-mini-line straight" />直線</button><button onClick={() => verify("曲線")}><span className="mq-mini-line curve" />曲線</button></div>}</div> : <div className="mq-pictograph-board"><div className="mq-pictograph-axis"><span>每個圖案 = 1</span><i /> <b>數據</b></div><div className="mq-pictograph-chart">{task.rows.map(([emoji, label, amount]) => <div key={label}><strong>{emoji} {label}</strong><span>{icons(emoji, amount)}</span><small>{amount} 個</small></div>)}</div>{task.action === "read" ? <div className="mq-picto-choices">{task.rows.map(([, label]) => <button key={label} onClick={() => verify(label)}>{label}</button>)}</div> : <div className="mq-picto-maker"><p>拖 <b>{task.emoji}</b> 到空格；按圖案也可加入。</p><button draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", task.emoji)} onClick={addSymbol} className="mq-drag-symbol">{task.emoji}</button><div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addSymbol(); }} className="mq-picto-dropzone">{icons(task.emoji, made)}{Array.from({ length: Math.max(0, 4 - made) }, (_, value) => <i key={value}>＋</i>)}</div><div className="flex flex-wrap justify-center gap-3"><button onClick={() => setMade(0)} className="text-sm font-bold text-[#617286]">清一清</button><button onClick={() => verify()} className="mq-start rounded-full bg-[#f05a3c] px-5 py-3 text-sm font-extrabold text-white">檢查圖表</button></div></div>}</div>;

  const title = mode === "count" ? (task.action === "count" ? <>數一數有 <b className="text-[#f05a3c]">多少</b> 個？</> : <>找出 <b className="text-[#f05a3c]">{task.answer}</b> 個{task.label}</>) : mode === "calendar" ? (task.action === "order" ? <>由 <b className="text-[#f05a3c]">最早</b> 到 <b className="text-[#f05a3c]">最遲</b> 排好</> : <>{task.relation} 是 <b className="text-[#f05a3c]">星期幾</b>？</>) : mode === "lines" ? (task.action === "trace" ? <>沿著 <b className="text-[#f05a3c]">虛線</b> 描一描</> : <>這是 <b className="text-[#f05a3c]">直線</b> 還是 <b className="text-[#f05a3c]">曲線</b>？</>) : task.action === "make" ? <>拖出 <b className="text-[#f05a3c]">{task.answer} 個</b>{task.label}</> : <>{task.title}</>;

  return <div className={`mq-practice mq-p1-practice mq-p1-foundations mq-p1-${mode} min-h-screen bg-[#f8f5ed] text-[#172b3f] dark:bg-[#101b27] dark:text-[#f4f7f4]`}><MidpointBreak open={midpointOpen} onContinue={() => setMidpointOpen(false)} /><header className="mq-practice-header sticky top-0 z-50 border-b border-[#172b3f]/10 bg-[#f8f5ed]/92 backdrop-blur-xl dark:border-white/10 dark:bg-[#111c28]/92"><div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 lg:px-8"><Link href="/" className="group flex items-center gap-3"><span className="grid size-10 place-items-center rounded-[14px] bg-[#f05a3c] shadow-[0_6px_0_#c84932]"><img src="/manus-storage/maths-quest-logo_cf7e4a6a.png" alt="" className="size-6 brightness-0 invert" /></span><span className="leading-none"><strong className="block text-[16px] font-extrabold">Maths Quest</strong><small className="mt-1 block font-mono text-[9px] font-bold tracking-[.14em] text-[#f05a3c]">{info.code} · 互動站</small></span></Link><div className="flex items-center gap-2 sm:gap-4"><button onClick={() => setSound((value) => !value)} className="mq-theme-switch grid size-10 place-items-center rounded-full border border-[#172b3f]/15 bg-white/70 dark:bg-white/10" aria-label="切換語音">{sound ? <Volume2 className="size-[17px]" /> : <VolumeX className="size-[17px]" />}</button><button onClick={toggleTheme} className="mq-theme-switch grid size-10 place-items-center rounded-full border border-[#172b3f]/15 bg-white/70 dark:bg-white/10" aria-label="切換深色模式">{theme === "light" ? <Moon className="size-[17px]" /> : <Sun className="size-[18px]" />}</button><Link href="/#path" className="mq-library-link inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-3 py-2 text-sm font-extrabold"><ArrowLeft className="size-4" /><span>返回題目庫</span></Link></div></div></header><main className="mx-auto max-w-[1280px] px-5 py-8 lg:px-8 lg:py-10"><div className="mq-route-ruler"><span>起點</span><i /><span>{info.code}</span><i /><span>互動站</span></div><div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="font-mono text-[11px] font-bold tracking-[.16em] text-[#f05a3c]">P1 · 看一看、數一數、動手做</p><h1 className="mt-2 text-3xl font-black tracking-[-.055em] sm:text-4xl">{info.title}</h1><p className="mt-2 text-sm leading-6 text-[#617286] dark:text-[#b7c8ce]">{info.subtitle}</p></div><div className="mq-progress-label rounded-2xl border border-[#172b3f]/10 bg-white px-4 py-3 text-sm dark:bg-[#1c3041]"><span className="font-mono text-[10px] font-bold tracking-[.12em] text-[#f05a3c]">探索任務</span><p className="mt-1 font-extrabold">完成 {complete} / 8 題 · {time}</p></div></div><div className="mq-shape-controls"><div><span className="mq-station-stamp">{info.stamp}</span><strong>{info.action}</strong><small>{info.hint}</small></div><StationIcon className="size-8 text-[#f05a3c]" /></div><div className="mq-practice-grid mt-5 grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]"><aside className="mq-practice-sidebar order-2 lg:order-1"><div className="rounded-[24px] border border-[#172b3f]/10 bg-[#172b3f] p-5 text-white shadow-[0_10px_0_#0e1d2a]"><p className="font-mono text-[10px] font-bold tracking-[.16em] text-[#f6be5d]">探索任務</p><h2 className="mt-3 text-xl font-black leading-7">先看，再動手試。</h2><div className="mq-mission-steps mt-5">{Array.from({ length: 8 }, (_, number) => <span key={number} className={number < complete ? "mq-mission-step-done" : number === index ? "mq-mission-step-current" : ""}>{number + 1}</span>)}</div><div className="mt-6 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#f05a3c] transition-[width] duration-500" style={{ width: `${complete / 8 * 100}%` }} /></div><div className="mq-stars mt-5">{[1, 2, 3].map((star) => <Star key={star} className={`size-5 ${star <= stars ? "fill-[#f6be5d] text-[#f6be5d]" : "text-white/20"}`} />)}</div></div><div className="mq-tip mt-5 rounded-2xl border border-[#172b3f]/10 bg-[#fff3e8] p-4"><div className="flex items-center gap-2 text-[#f05a3c]"><Lightbulb className="size-4" /><span className="font-mono text-[10px] font-bold tracking-[.12em]">小提示</span></div><p className="mt-2 text-sm font-bold leading-6 text-[#744230]">{info.hint}</p></div></aside><section className="mq-practice-card order-1 min-h-[560px] overflow-hidden rounded-[28px] border border-[#172b3f]/10 bg-white p-5 shadow-[0_16px_35px_rgba(23,43,63,.07)] dark:bg-[#1c3041] md:p-8">{result === "correct" && <CorrectCelebration />}{!finished ? <><div className="mq-question-head flex items-center justify-between border-b border-[#172b3f]/10 pb-5 dark:border-white/10"><div><p className="font-mono text-[10px] font-bold tracking-[.14em] text-[#f05a3c]">探索站 · 第 {index + 1} 題</p><p className="mt-1 text-sm font-bold text-[#617286]">{info.action}</p></div><span className="grid size-10 place-items-center rounded-full bg-[#fff0e9] font-mono text-xs font-black text-[#f05a3c]">{index + 1}</span></div><div className="flex min-h-[345px] flex-col items-center justify-center py-7 text-center"><div className="mq-question-note"><span className="font-mono">動手提示</span><span>先看清楚，再按答案。</span></div><SpeakButton text={prompt} /><h2 className="mt-3 text-[clamp(1.5rem,4vw,2.4rem)] font-black tracking-[-.05em]">{title}</h2>{activity}</div>{result !== "idle" && <div className={`mq-feedback mb-5 flex items-start gap-3 rounded-2xl border p-4 ${result === "correct" ? "border-[#0e8b87]/25 bg-[#e8f5f2] text-[#135d59]" : "border-[#f05a3c]/25 bg-[#fff0e9] text-[#8c3f2e]"}`}><span className={`grid size-8 shrink-0 place-items-center rounded-full ${result === "correct" ? "bg-[#0e8b87]" : "bg-[#f05a3c]"} text-white`}>{result === "correct" ? <Check className="size-4" /> : <X className="size-4" />}</span><div><p className="font-extrabold">{result === "correct" ? "答對了！你做得很好。" : "再試一次，慢慢看提示。"}</p><p className="mt-1 text-sm opacity-80">{info.hint}</p></div></div>}<div className="flex justify-end">{result === "idle" ? <p className="rounded-2xl border border-dashed border-[#172b3f]/15 px-5 py-4 text-sm font-bold text-[#617286]">先動手試一試。</p> : result === "incorrect" ? <button onClick={reset} className="mq-start min-h-14 rounded-2xl bg-[#f05a3c] px-6 text-sm font-extrabold text-white"><RotateCcw className="mr-1 inline size-4" /> 再試一次</button> : <button onClick={next} className="mq-start min-h-14 rounded-2xl bg-[#f05a3c] px-6 text-sm font-extrabold text-white">{index === 7 ? "看結果" : "下一題"} <ArrowRight className="ml-1 inline size-4" /></button>}</div></> : <div className="flex min-h-[500px] flex-col items-center justify-center text-center"><span className="grid size-20 place-items-center rounded-[26px] bg-[#fff0e9] text-[#f05a3c]"><Trophy className="size-10" /></span><p className="mt-7 font-mono text-[11px] font-bold tracking-[.16em] text-[#f05a3c]">完成探索站</p><h2 className="mt-3 text-3xl font-black tracking-[-.05em]">{info.title}完成了！</h2><div className="mq-finish-stars mt-4">{[1, 2, 3].map((star) => <Star key={star} className={`size-7 ${star <= stars ? "fill-[#f6be5d] text-[#f6be5d]" : "text-[#e8e3d9]"}`} />)}</div><p className="mt-3 text-[15px] leading-7 text-[#617286]">答對 {score} / 8 題。</p><FinishAchievementOverlay perfect={score === 8} items={wrongItems} /><div className="mt-7 flex flex-wrap justify-center gap-3"><button onClick={restart} className="mq-start inline-flex items-center gap-2 rounded-full bg-[#f05a3c] px-5 py-3 text-sm font-extrabold text-white"><RotateCcw className="size-4" /> 再做一次</button><Link href="/#path" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-5 py-3 text-sm font-extrabold">返回題目庫 <ArrowRight className="size-4" /></Link></div></div>}</section></div></main></div>;
}
