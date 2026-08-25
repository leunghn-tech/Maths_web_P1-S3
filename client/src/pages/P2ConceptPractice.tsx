/** Maths Quest P2 概念工作台：乘法陣列、硬幣組合與校園方向。 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Check, Coins, Compass, Grid3X3, Lightbulb, Moon, RotateCcw, Star, Sun, Trophy, Volume2, VolumeX, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { playCelebrationSound, playCorrectSound, playWrongSound } from "@/lib/sounds";
import { markPracticeCompleted } from "@/lib/practiceCompletion";
import { recordDailyPractice } from "@/lib/dailyPractice";
import { speakCorrectEncouragement, speakTryAgain } from "@/lib/speech";
import SpeakButton from "@/components/SpeakButton";
import CorrectCelebration from "@/components/CorrectCelebration";
import MidpointBreak from "@/components/MidpointBreak";
import FinishAchievementOverlay from "@/components/FinishAchievementOverlay";

type Mode = "mul" | "coin" | "dir";

const multiplication = [{ a: 2, b: 3 }, { a: 3, b: 4 }, { a: 5, b: 2 }, { a: 4, b: 4 }, { a: 3, b: 5 }, { a: 6, b: 2 }, { a: 4, b: 5 }, { a: 3, b: 6 }].map((question) => ({ ...question, answer: question.a * question.b, choices: [question.a * question.b, question.a * question.b + question.a, question.a * question.b - question.a, Math.max(1, question.a + question.b)] }));

const coinOptions = [[10, 2], [5, 5], [10, 5, 2], [10, 5], [5, 2], [10, 2, 1], [5, 2, 1], [10, 10], [1, 1]];
const coins = [{ target: 12, values: [10, 2] }, { target: 15, values: [10, 5] }, { target: 17, values: [10, 5, 2] }, { target: 20, values: [10, 10] }, { target: 7, values: [5, 2] }, { target: 13, values: [10, 2, 1] }, { target: 16, values: [10, 5, 1] }, { target: 8, values: [5, 2, 1] }].map((question) => {
  const answer = question.values.join("+");
  const choices = [question.values, ...coinOptions]
    .map((values) => values.join("+"))
    .filter((value, index, all) => all.indexOf(value) === index)
    .filter((value, index) => index === 0 || value.split("+").reduce((sum, item) => sum + Number(item), 0) !== question.target)
    .slice(0, 4);
  return { ...question, answer, choices };
});

const directions = [{ target: "操場", direction: "北" }, { target: "飯堂", direction: "南" }, { target: "音樂室", direction: "東" }, { target: "花園", direction: "西" }, { target: "禮堂", direction: "北" }, { target: "保健室", direction: "東" }, { target: "電腦室", direction: "西" }, { target: "校門", direction: "南" }].map((question) => ({ ...question, answer: question.direction, choices: ["東", "南", "西", "北"] }));

const positionByDirection = { 北: [2, 1], 南: [2, 3], 東: [3, 2], 西: [1, 2] } as const;
const currency = (value: string | number) => <span className="mq-coin">HK${value}</span>;

export default function P2ConceptPractice() {
  const path = location.pathname;
  const mode: Mode = path.includes("multiply") ? "mul" : path.includes("money-coins") ? "coin" : "dir";
  const info = mode === "mul"
    ? { title: "九九乘法表", code: "P2.05", tag: "乘法陣列", sub: "用一排一排的圖形，看見乘法。", id: "p2-multiply-visual", icon: <Grid3X3 /> }
    : mode === "coin"
      ? { title: "硬幣組合挑戰", code: "P2.03B", tag: "多種硬幣湊款", sub: "選出能剛好湊出金額的硬幣組合。", id: "p2-money-coins", icon: <Coins /> }
      : { title: "方向與位置", code: "P2.06", tag: "校園東南西北", sub: "看校園地圖，找出指定地點的正確方向。", id: "p2-directions", icon: <Compass /> };
  const tasks = useMemo(() => mode === "mul" ? multiplication : mode === "coin" ? coins : directions, [mode]);
  const { theme, toggleTheme } = useTheme();
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<"idle" | "correct" | "incorrect">("idle");
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [sound, setSound] = useState(true);
  const [done, setDone] = useState(false);
  const [midpoint, setMidpoint] = useState(false);
  const [wrong, setWrong] = useState<{ prompt: string; answer: string; hint: string }[]>([]);
  const question = tasks[index] as any;
  const complete = index + (result === "correct" ? 1 : 0);
  const stars = score === 8 ? 3 : score >= 6 ? 2 : score ? 1 : 0;
  const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  useEffect(() => {
    if (done) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [done]);

  const prompt = mode === "mul"
    ? `${question.a} 組，每組有 ${question.b} 個，一共有多少個？`
    : mode === "coin"
      ? `哪一組硬幣剛好湊出 HK$${question.target}？`
      : `圖書館的${question.target}在甚麼方向？`;
  const answer = mode === "mul" ? question.answer : mode === "coin" ? question.answer : question.direction;

  const check = (value: string | number) => {
    if (result !== "idle") return;
    if (value === answer) {
      setResult("correct");
      setScore((current) => current + 1);
      if (sound) { playCorrectSound(); speakCorrectEncouragement(); }
      return;
    }
    setResult("incorrect");
    setWrong((items) => [...items, { prompt, answer: String(answer), hint: mode === "mul" ? "數一數有幾組，每組有幾個。" : mode === "coin" ? "把每枚硬幣的金額加起來。" : "先找北，再看指定地點在圖書館的哪一邊。" }]);
    if (sound) { playWrongSound(); speakTryAgain(); }
  };

  const next = () => {
    if (index === 7) {
      setDone(true);
      markPracticeCompleted(info.id);
      recordDailyPractice(info.id);
      if (sound) playCelebrationSound();
      return;
    }
    if (index === 3) setMidpoint(true);
    setIndex((current) => current + 1);
    setResult("idle");
  };
  const restart = () => { setIndex(0); setResult("idle"); setScore(0); setSeconds(0); setDone(false); setMidpoint(false); setWrong([]); };

  const activity = mode === "mul" ? <>
    <div className="mq-array-board" style={{ gridTemplateColumns: `repeat(${question.b}, 1fr)` }}>{Array.from({ length: question.a * question.b }, (_, item) => <span key={item}>●</span>)}</div>
    <p className="mq-array-equation">{question.a} 組 × {question.b} 個 = ?</p>
    <div className="mq-concept-choices">{question.choices.map((value: number) => <button key={value} onClick={() => check(value)}>{value}</button>)}</div>
  </> : mode === "coin" ? <>
    <div className="mq-target-coin">目標 <b>HK${question.target}</b></div>
    <div className="mq-coin-combos">{question.choices.map((value: string) => <button key={value} onClick={() => check(value)}>{value.split("+").map((coin: string, item: number) => <span key={`${coin}-${item}`}>{currency(coin)}</span>)}</button>)}</div>
  </> : <>
    <div className="mq-campus-map" aria-label={`校園地圖：${question.target} 在圖書館的${question.direction}方`}>
      <span className="north">北 ↑</span><span className="library">📚<b>圖書館</b></span>
      {(["北", "南", "東", "西"] as const).map((direction) => {
        const [column, row] = positionByDirection[direction];
        const isTarget = direction === question.direction;
        return <span key={direction} className="place" style={{ gridColumn: column, gridRow: row }}>{isTarget ? <><span>🏫</span><small>{question.target}</small></> : direction}</span>;
      })}
    </div>
    <p className="mq-map-question">圖書館的 <b>{question.target}</b> 在哪個方向？</p>
    <div className="mq-direction-choices">{question.choices.map((value: string) => <button key={value} onClick={() => check(value)}>{value}</button>)}</div>
  </>;

  return <div className="mq-practice mq-p2-practice mq-p2-concept min-h-screen bg-[#f8f5ed] text-[#172b3f] dark:bg-[#101b27] dark:text-[#f4f7f4]">
    <MidpointBreak open={midpoint} onContinue={() => setMidpoint(false)} />
    <header className="mq-practice-header sticky top-0 z-50 border-b bg-[#f8f5ed]/92 backdrop-blur-xl"><div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 lg:px-8">
      <Link href="/" className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-[14px] bg-[#f05a3c] shadow-[0_6px_0_#c84932]"><img src="/manus-storage/maths-quest-logo_cf7e4a6a.png" alt="" className="size-6 brightness-0 invert" /></span><span><strong className="block text-[16px] font-extrabold">Maths Quest</strong><small className="font-mono text-[9px] font-bold tracking-[.14em] text-[#c8811e]">{info.code} · 互動站</small></span></Link>
      <div className="flex gap-2"><button onClick={() => setSound((value) => !value)} className="mq-theme-switch grid size-10 place-items-center rounded-full border bg-white/70" aria-label={sound ? "關閉音效" : "開啟音效"}>{sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}</button><button onClick={toggleTheme} className="mq-theme-switch grid size-10 place-items-center rounded-full border bg-white/70" aria-label="切換深色模式">{theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}</button><Link href="/#path" className="mq-library-link inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-extrabold"><ArrowLeft className="size-4" />返回題目庫</Link></div>
    </div></header>
    <main className="mx-auto max-w-[1280px] px-5 py-8 lg:px-8">
      <div className="mq-route-ruler"><span>起點</span><i /><span>{info.code}</span><i /><span>互動站</span></div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="font-mono text-[11px] font-bold tracking-[.16em] text-[#c8811e]">P2 · {info.tag}</p><h1 className="mt-2 text-3xl font-black">{info.title}</h1><p className="mt-2 text-sm text-[#617286] dark:text-[#b7c8ce]">{info.sub}</p></div><div className="mq-progress-label rounded-2xl border bg-white px-4 py-3 text-sm"><span className="font-mono text-[10px] font-bold text-[#c8811e]">探索任務</span><p className="mt-1 font-extrabold">完成 {complete}/8 題 · {time}</p></div></div>
      <div className="mq-shape-controls"><div><span className="mq-station-stamp">{mode === "mul" ? "ARRAY LAB" : mode === "coin" ? "COIN LAB" : "CAMPUS MAP"}</span><strong>{info.tag}</strong><small>{mode === "mul" ? "先看有幾組，再看每組有幾個。" : mode === "coin" ? "硬幣加起來要剛剛好。" : "上北下南，右東左西。"}</small></div>{info.icon}</div>
      <div className="mq-practice-grid mt-5 grid gap-5 lg:grid-cols-[230px_1fr]"><aside className="mq-practice-sidebar order-2 lg:order-1"><div className="rounded-[24px] bg-[#172b3f] p-5 text-white"><p className="font-mono text-[10px] font-bold text-[#f6be5d]">探索任務</p><h2 className="mt-3 text-xl font-black">動手看清楚。</h2><div className="mq-mission-steps mt-5">{Array.from({ length: 8 }, (_, item) => <span key={item} className={item < complete ? "mq-mission-step-done" : item === index ? "mq-mission-step-current" : ""}>{item + 1}</span>)}</div><div className="mq-stars mt-5">{[1, 2, 3].map((star) => <Star key={star} className={star <= stars ? "size-5 fill-[#f6be5d] text-[#f6be5d]" : "size-5 text-white/20"} />)}</div></div><div className="mq-tip mt-5 rounded-2xl bg-[#fff7e9] p-4"><Lightbulb className="size-4 text-[#c8811e]" /><p className="mt-2 text-sm font-bold text-[#744230]">{mode === "mul" ? "每一排一樣多，可以用乘法計算。" : mode === "coin" ? "先選大面額，再補小面額。" : "先在地圖頂端找到北。"}</p></div></aside>
        <section className="mq-practice-card mq-p2-card order-1 min-h-[560px] rounded-[28px] border bg-white p-5 md:p-8">{result === "correct" && <CorrectCelebration />}{!done ? <><div className="mq-question-head flex justify-between border-b pb-5"><div><p className="font-mono text-[10px] font-bold text-[#c8811e]">{info.tag} · 第 {index + 1} 題</p><p className="mt-1 text-sm font-bold text-[#617286]">看圖，再選答案。</p></div><span className="grid size-10 place-items-center rounded-full bg-[#fff7e9] font-mono text-xs font-black text-[#c8811e]">{index + 1}</span></div><div className="flex min-h-[340px] flex-col items-center justify-center text-center"><SpeakButton text={prompt} /><h2 className="mt-3 text-[clamp(1.45rem,4vw,2.25rem)] font-black">{mode === "mul" ? <><b className="text-[#c8811e]">{question.a}</b> 組，每組 <b className="text-[#c8811e]">{question.b}</b> 個</> : mode === "coin" ? <>哪一組硬幣剛好湊出 <b className="text-[#c8811e]">HK${question.target}</b>？</> : <>圖書館的 <b className="text-[#c8811e]">{question.target}</b> 在哪個方向？</>}</h2>{activity}</div>{result !== "idle" && <div className={`mq-feedback mb-5 flex gap-3 rounded-2xl border p-4 ${result === "correct" ? "border-[#0e8b87]/25 bg-[#e8f5f2] text-[#135d59]" : "border-[#f05a3c]/25 bg-[#fff0e9] text-[#8c3f2e]"}`}><span>{result === "correct" ? <Check /> : <X />}</span><p className="font-extrabold">{result === "correct" ? "答對了！你看得很清楚。" : "再試一次，看看圖中的提示。"}</p></div>}<div className="flex justify-end">{result === "idle" ? <p className="rounded-2xl border border-dashed px-5 py-4 text-sm font-bold text-[#617286]">選一個答案。</p> : result === "incorrect" ? <button onClick={() => setResult("idle")} className="mq-start min-h-14 rounded-2xl bg-[#f05a3c] px-6 text-sm font-extrabold text-white"><RotateCcw className="mr-1 inline size-4" />再試一次</button> : <button onClick={next} className="mq-start min-h-14 rounded-2xl bg-[#f05a3c] px-6 text-sm font-extrabold text-white">{index === 7 ? "看結果" : "下一題"}<ArrowRight className="ml-1 inline size-4" /></button>}</div></> : <div className="flex min-h-[480px] flex-col items-center justify-center text-center"><Trophy className="size-12 text-[#c8811e]" /><h2 className="mt-4 text-3xl font-black">{info.title}完成！</h2><p className="mt-2">答對 {score}/8 題。</p><FinishAchievementOverlay perfect={score === 8} items={wrong} /><div className="mt-6 flex gap-3"><button onClick={restart} className="mq-start rounded-full bg-[#f05a3c] px-5 py-3 font-extrabold text-white">再做一次</button><Link href="/#path" className="mq-library-return rounded-full border px-5 py-3 font-extrabold">返回題目庫</Link></div></div>}</section>
      </div>
    </main>
  </div>;
}
