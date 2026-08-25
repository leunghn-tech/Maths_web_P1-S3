/** Maths Quest P2/P3 起步工作台：以圖形分割認識分數，並以天平認識克與公斤。 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Check, Scale, Shapes, Trophy, Volume2, VolumeX, X } from "lucide-react";
import { playCelebrationSound, playCorrectSound, playWrongSound } from "@/lib/sounds";
import { markPracticeCompleted } from "@/lib/practiceCompletion";
import { recordDailyPractice } from "@/lib/dailyPractice";
import { speakCorrectEncouragement, speakTryAgain } from "@/lib/speech";
import SpeakButton from "@/components/SpeakButton";
import CorrectCelebration from "@/components/CorrectCelebration";
import MidpointBreak from "@/components/MidpointBreak";
import FinishAchievementOverlay from "@/components/FinishAchievementOverlay";

const fractionParts = [2, 4, 2, 4, 4, 2, 4, 2];
const weightQuestions = [
  { n: 500, u: "g", a: 500 }, { n: 1, u: "kg", a: 1000 }, { n: 250, u: "g", a: 250 }, { n: 2, u: "kg", a: 2000 },
  { n: 750, u: "g", a: 750 }, { n: 3, u: "kg", a: 3000 }, { n: 400, u: "g", a: 400 }, { n: 5, u: "kg", a: 5000 },
];
type Result = "idle" | "correct" | "incorrect";

function weightChoices(answer: number) {
  const step = answer >= 1000 ? 500 : 100;
  return Array.from(new Set([answer, Math.max(0, answer - step), answer + step, answer + step * 2]));
}

export default function P2P3StarterPractice() {
  const mode = location.pathname.includes("p2-fractions") ? "fraction" : "weight";
  const config = mode === "fraction"
    ? { grade: "P2", code: "P2.12", title: "分數初步", tag: "一半與四分一", id: "p2-fractions-basic", icon: <Shapes />, sub: "把圖形平均分開，認識一半和四分一。" }
    : { grade: "P3", code: "P3.01", title: "重量：克與公斤", tag: "虛擬天平", id: "p3-weight", icon: <Scale />, sub: "把法碼放到天平，讀出重量與換算。" };
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<Result>("idle");
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [finished, setFinished] = useState(false);
  const [midpointOpen, setMidpointOpen] = useState(false);
  const [wrong, setWrong] = useState<{ prompt: string; answer: string; hint: string }[]>([]);
  const part = fractionParts[index];
  const weight = weightQuestions[index];
  const answer = mode === "fraction" ? (part === 2 ? "一半" : "四分一") : weight.a;
  const prompt = mode === "fraction" ? `哪個圖形表示${answer}？` : `${weight.n} ${weight.u} 是多少克？`;
  const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  const complete = index + (result === "correct" ? 1 : 0);

  useEffect(() => {
    if (finished) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [finished]);

  const choose = (value: string | number) => {
    if (result !== "idle") return;
    if (value === answer) {
      setResult("correct"); setScore((value) => value + 1);
      if (soundEnabled) { playCorrectSound(); speakCorrectEncouragement(); }
      return;
    }
    setResult("incorrect");
    setWrong((items) => [...items, { prompt, answer: String(answer), hint: mode === "fraction" ? "每一份要一樣大。" : "1 公斤等於 1000 克。" }]);
    if (soundEnabled) { playWrongSound(); speakTryAgain(); }
  };
  const next = () => {
    if (index === 7) {
      setFinished(true); markPracticeCompleted(config.id); recordDailyPractice(config.id);
      if (soundEnabled) playCelebrationSound();
      return;
    }
    if (index === 3) setMidpointOpen(true);
    setIndex((value) => value + 1); setResult("idle");
  };
  const restart = () => { setIndex(0); setResult("idle"); setScore(0); setSeconds(0); setFinished(false); setMidpointOpen(false); setWrong([]); };

  return <div className="mq-practice mq-p2-practice min-h-screen bg-[#f8f5ed] text-[#172b3f]">
    <MidpointBreak open={midpointOpen} onContinue={() => setMidpointOpen(false)} />
    <header className="mq-practice-header sticky top-0 z-50 border-b bg-[#f8f5ed]/92"><div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5"><Link href="/" className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-[14px] bg-[#f05a3c]"><img src="/manus-storage/maths-quest-logo_cf7e4a6a.png" alt="" className="size-6 brightness-0 invert" /></span><b>Maths Quest</b></Link><div className="flex gap-2"><button onClick={() => setSoundEnabled((value) => !value)} className="mq-theme-switch grid size-10 place-items-center rounded-full border" aria-label={soundEnabled ? "關閉答題音效" : "開啟答題音效"}>{soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}</button><Link href="/#path" className="mq-library-link rounded-full border px-3 py-2 text-sm font-extrabold"><ArrowLeft className="inline size-4" /> 返回題目庫</Link></div></div></header>
    <main className="mx-auto max-w-[1100px] px-5 py-8"><div className="mq-route-ruler"><span>起點</span><i /><span>{config.code}</span><i /><span>新站</span></div><div className="mb-6 flex items-end justify-between"><div><p className="font-mono text-[11px] font-bold tracking-[.16em] text-[#c8811e]">{config.grade} · {config.tag}</p><h1 className="mt-2 text-3xl font-black">{config.title}</h1><p className="mt-2 text-sm text-[#617286]">{config.sub}</p></div><b className="mq-progress-label rounded-2xl border bg-white px-4 py-3">完成 {complete}/8 題 · {time}</b></div>
      <div className="mq-shape-controls"><div><span className="mq-station-stamp">DISCOVERY LAB</span><strong>{config.tag}</strong><small>看圖，動手選答案。</small></div>{config.icon}</div>
      <section className="mq-practice-card mq-p2-card mt-5 min-h-[560px] rounded-[28px] border bg-white p-5 md:p-8">{result === "correct" && <CorrectCelebration />}{!finished ? <><div className="mq-question-head flex justify-between border-b pb-5"><div><p className="font-mono text-[10px] font-bold text-[#c8811e]">第 {index + 1} 題</p><p className="mt-1 text-sm font-bold text-[#617286]">按喇叭，聽題目。</p></div><span>{index + 1}</span></div><div className="flex min-h-[330px] flex-col items-center justify-center text-center"><SpeakButton text={prompt} /><h2 className="mt-3 text-3xl font-black">{mode === "fraction" ? <>哪個是 <b className="text-[#c8811e]">{answer}</b>？</> : <><b className="text-[#c8811e]">{weight.n} {weight.u}</b> 是多少克？</>}</h2>{mode === "fraction" ? <><div className={`mq-fraction-disc parts-${part}`}>{Array.from({ length: part }, (_, item) => <i key={item} />)}</div><div className="mq-angle-choices">{["一半", "四分一", "一個"].map((choice) => <button key={choice} onClick={() => choose(choice)}>{choice}</button>)}</div></> : <><div className="mq-scale"><span>⚖️</span><b>{weight.n} {weight.u}</b><i>＝</i><strong>? g</strong></div><div className="mq-concept-choices">{weightChoices(weight.a).map((choice) => <button key={choice} onClick={() => choose(choice)}>{choice} g</button>)}</div></>}</div>
        {result !== "idle" && <div className={`mq-feedback mb-5 rounded-2xl border p-4 ${result === "correct" ? "bg-[#e8f5f2]" : "bg-[#fff0e9]"}`}>{result === "correct" ? <Check /> : <X />}{result === "correct" ? " 答對了！" : mode === "fraction" ? " 再試一次。每一份要一樣大。" : " 再試一次。1 公斤等於 1000 克。"}</div>}<div className="flex justify-end">{result === "idle" ? <p>選一個答案。</p> : result === "incorrect" ? <button onClick={() => setResult("idle")} className="mq-start rounded-2xl bg-[#f05a3c] px-5 py-3 text-white">再試一次</button> : <button onClick={next} className="mq-start rounded-2xl bg-[#f05a3c] px-5 py-3 text-white">{index === 7 ? "看結果" : "下一題"}<ArrowRight className="ml-1 inline size-4" /></button>}</div></> : <div className="flex min-h-[420px] flex-col items-center justify-center"><Trophy className="size-12 text-[#c8811e]" /><h2 className="mt-3 text-3xl font-black">完成！</h2><FinishAchievementOverlay perfect={score === 8} items={wrong} /><button onClick={restart} className="mq-start mt-6 rounded-full bg-[#f05a3c] px-5 py-3 text-white">再做一次</button></div>}</section>
    </main>
  </div>;
}
