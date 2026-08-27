// Maths Quest：S3 互動站採用單一步驟、可檢查的選擇題，避免多個控制項造成答案判斷歧義。
// @ts-nocheck
import { useState } from "react";
import { Link } from "wouter";
import { markPracticeCompleted } from "@/lib/practiceCompletion";
import { recordDailyPractice } from "@/lib/dailyPractice";
import { recordPracticeMistake } from "@/lib/reviewRecommendations";
import { speakCantonese } from "@/lib/speech";

const answer = (key, zh, en) => ({ key, zh, en });

const stations = {
  identity: {
    zh: "恆等式與因式分解", en: "Identities and Factorization", tag: "IDENTITIES",
    cue: ["先辨認公式中的中間項與常數項。", "Check the middle and constant terms of the identity first."],
    items: [
      { prompt: ["展開 (a+b)²。", "Expand (a+b)²."], correct: "a² + 2ab + b²", choices: ["a² + b²", "a² − 2ab + b²", "a² + 2ab + b²", "2a + 2b"] },
      { prompt: ["把 a²−b² 因式分解。", "Factorise a²−b²."], correct: "(a+b)(a−b)", choices: ["(a−b)²", "(a+b)(a−b)", "a(a−b)", "(a+b)²"] },
      { prompt: ["把 x²+6x+9 寫成完全平方形式。", "Write x² + 6x + 9 as a perfect square."], correct: "(x+3)²", choices: ["(x+9)²", "(x+3)²", "x(x+6)+9", "(x+6)²"] },
      { prompt: ["展開 (x−5)²。", "Expand (x−5)²."], correct: "x²−10x+25", choices: ["x²−25", "x²−10x+25", "x²−5x+25", "x²+10x+25"] },
      { prompt: ["展開 (2x+3)²。", "Expand (2x+3)²."], correct: "4x²+12x+9", choices: ["4x²+9", "4x²+12x+9", "4x²+6x+9", "2x²+12x+3"] },
      { prompt: ["把 x²−16 因式分解。", "Factorise x²−16."], correct: "(x+4)(x−4)", choices: ["(x−4)²", "(x+4)(x−4)", "x(x−16)", "(x+16)(x−1)"] },
      { prompt: ["把 x²−5x+6 因式分解。", "Factorise x²−5x+6."], correct: "(x−2)(x−3)", choices: ["(x+2)(x+3)", "(x−2)(x−3)", "(x−1)(x−6)", "x(x−5)+6"] },
      { prompt: ["把 4x²−25 因式分解。", "Factorise 4x²−25."], correct: "(2x+5)(2x−5)", choices: ["(2x−5)²", "(2x+5)(2x−5)", "(4x+5)(x−5)", "(2x+25)(2x−1)"] },
    ],
  },
  inequality: {
    zh: "一元一次不等式", en: "Linear Inequalities", tag: "NUMBER-LINE REPRESENTATION",
    cue: ["只需選擇完整數線表示法：○ 是空心點，● 是實心點；箭嘴表示解集方向。", "Choose one complete number-line representation: ○ is open, ● is closed, and the arrow shows the solution direction."],
    items: [
      { prompt: ["在數線上表示 x > 3。", "Represent x > 3 on a number line."], correct: "open-right-3", choices: [answer("open-left-3", "○ 3，向左", "○ 3, left"), answer("open-right-3", "○ 3，向右", "○ 3, right"), answer("closed-right-3", "● 3，向右", "● 3, right"), answer("closed-left-3", "● 3，向左", "● 3, left")] },
      { prompt: ["在數線上表示 x ≤ −2。", "Represent x ≤ −2 on a number line."], correct: "closed-left-neg2", choices: [answer("open-left-neg2", "○ −2，向左", "○ −2, left"), answer("closed-left-neg2", "● −2，向左", "● −2, left"), answer("closed-right-neg2", "● −2，向右", "● −2, right"), answer("open-right-neg2", "○ −2，向右", "○ −2, right")] },
      { prompt: ["在數線上表示 x ≥ 4。", "Represent x ≥ 4 on a number line."], correct: "closed-right-4", choices: [answer("closed-left-4", "● 4，向左", "● 4, left"), answer("open-right-4", "○ 4，向右", "○ 4, right"), answer("closed-right-4", "● 4，向右", "● 4, right"), answer("open-left-4", "○ 4，向左", "○ 4, left")] },
      { prompt: ["在數線上表示 x < −5。", "Represent x < −5 on a number line."], correct: "open-left-neg5", choices: [answer("closed-left-neg5", "● −5，向左", "● −5, left"), answer("open-right-neg5", "○ −5，向右", "○ −5, right"), answer("open-left-neg5", "○ −5，向左", "○ −5, left"), answer("closed-right-neg5", "● −5，向右", "● −5, right")] },
      { prompt: ["解 2x−1>5 後，在數線上表示解集。", "Solve 2x - 1 > 5 and represent the solution set."], correct: "open-right-3", choices: [answer("open-right-3", "○ 3，向右", "○ 3, right"), answer("closed-right-3", "● 3，向右", "● 3, right"), answer("open-left-3", "○ 3，向左", "○ 3, left"), answer("open-right-2", "○ 2，向右", "○ 2, right")] },
      { prompt: ["解 3−x≥7 後，在數線上表示解集。", "Solve 3 - x ≥ 7 and represent the solution set."], correct: "closed-left-neg4", choices: [answer("closed-left-neg4", "● −4，向左", "● −4, left"), answer("open-left-neg4", "○ −4，向左", "○ −4, left"), answer("closed-right-neg4", "● −4，向右", "● −4, right"), answer("closed-left-4", "● 4，向左", "● 4, left")] },
      { prompt: ["解 4x+2≤10 後，在數線上表示解集。", "Solve 4x + 2 ≤ 10 and represent the solution set."], correct: "closed-left-2", choices: [answer("open-left-2", "○ 2，向左", "○ 2, left"), answer("closed-right-2", "● 2，向右", "● 2, right"), answer("closed-left-2", "● 2，向左", "● 2, left"), answer("closed-left-10", "● 10，向左", "● 10, left")] },
      { prompt: ["解 −2x<8 後，在數線上表示解集。", "Solve −2x < 8 and represent the solution set."], correct: "open-right-neg4", choices: [answer("open-left-neg4", "○ −4，向左", "○ −4, left"), answer("closed-right-neg4", "● −4，向右", "● −4, right"), answer("open-right-neg4", "○ −4，向右", "○ −4, right"), answer("open-right-4", "○ 4，向右", "○ 4, right")] },
    ],
  },
  proof: {
    zh: "幾何證明與三角形中心", en: "Geometric Proofs and Triangle Centres", tag: "GEOMETRIC REASONS",
    cue: ["從已知條件找出可直接使用的幾何定理。", "Start with the stated fact and select the applicable geometry theorem."],
    items: [
      { prompt: ["在 △ABC 中，AB＝AC。可推出甚麼？", "In △ABC, AB = AC. What can be concluded?"], correct: "∠B＝∠C", choices: ["∠B＝∠C", "∠A＝∠B", "BC＝AB", "∠A＝90°"] },
      { prompt: ["在 △ABC 中，∠B＝∠C。可推出甚麼？", "In △ABC, ∠B = ∠C. What can be concluded?"], correct: "AB＝AC", choices: ["AB＝AC", "BC＝AC", "∠A＝90°", "AB∥AC"] },
      { prompt: ["三條中線的交點稱為甚麼？", "What is the intersection of the three medians called?"], correct: "重心 / Centroid", choices: ["重心 / Centroid", "內心 / Incentre", "外心 / Circumcentre", "垂心 / Orthocentre"] },
      { prompt: ["三條高的交點稱為甚麼？", "What is the intersection of the three altitudes called?"], correct: "垂心 / Orthocentre", choices: ["內心 / Incentre", "垂心 / Orthocentre", "重心 / Centroid", "外心 / Circumcentre"] },
      { prompt: ["三條角平分線的交點稱為甚麼？", "What is the intersection of the three angle bisectors called?"], correct: "內心 / Incentre", choices: ["內心 / Incentre", "外心 / Circumcentre", "重心 / Centroid", "垂心 / Orthocentre"] },
      { prompt: ["三條邊的垂直平分線的交點稱為甚麼？", "What is the intersection of the perpendicular bisectors?"], correct: "外心 / Circumcentre", choices: ["垂心 / Orthocentre", "外心 / Circumcentre", "重心 / Centroid", "內心 / Incentre"] },
      { prompt: ["「等邊對等角」的意思是甚麼？", "What does ‘equal sides subtend equal angles’ mean?"], correct: "相等的邊所對的角相等", choices: ["相等的邊所對的角相等", "相等的角必定是直角", "所有三角形均有等邊", "平行線必定等長"] },
      { prompt: ["「等角對等邊」的意思是甚麼？", "What does ‘equal angles subtend equal sides’ mean?"], correct: "相等的角所對的邊相等", choices: ["相等的角所對的邊相等", "所有角均相等", "相等的邊必定平行", "所有三角形均全等"] },
    ],
  },
};

export const inequalityQuestions = stations.inequality.items;
export const isCorrectInequalityChoice = (item, selected) => item.correct === selected;

export default function S3InteractiveCore() {
  const topic = new URLSearchParams(location.search).get("topic") || "identity";
  const station = stations[topic] || stations.identity;
  const [lang, setLang] = useState("zh");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState("");
  const [complete, setComplete] = useState(false);
  const item = station.items[index];
  const label = lang === "zh" ? station.zh : station.en;
  const choices = item.choices;
  const displayed = (choice) => typeof choice === "string" ? choice : choice[lang];
  const choiceKey = (choice) => typeof choice === "string" ? choice : choice.key;
  const correctText = displayed(choices.find((choice) => choiceKey(choice) === item.correct) || item.correct);
  const check = () => {
    if (selected === item.correct) setResult("correct");
    else {
      setResult("wrong");
      recordPracticeMistake({ key: `s3-${topic}-interactive`, grade: "S3", title: station.zh, href: `/practice/s3-interactive?topic=${topic}` });
    }
  };
  const next = () => {
    if (index === 7) {
      markPracticeCompleted(`s3-${topic}-interactive`);
      recordDailyPractice(`s3-${topic}-interactive`);
      setComplete(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelected("");
    setResult("");
  };
  const speak = () => {
    const text = item.prompt[lang === "zh" ? 0 : 1];
    if (lang === "zh") speakCantonese(text);
    else if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-HK";
      window.speechSynthesis.speak(utterance);
    }
  };

  return <main className="min-h-screen bg-[#f8f5ed] p-5 text-[#172b3f] sm:p-7">
    <Link href="/#path" className="font-bold">← 返回學習地圖 / Back to map</Link>
    <header className="mt-7 flex flex-wrap items-center gap-3 font-mono text-xs">
      <b className="grid size-12 place-items-center rounded-full bg-[#f05a3c] text-base font-black text-white">Q↗</b>
      <strong className="tracking-[.16em]">MATHS QUEST</strong>
      <span className="border-b-2 border-dotted border-[#f05a3c] pb-1">Q-PATH · S3 · {station.tag}</span>
      <div className="ml-auto flex overflow-hidden rounded-lg border border-[#172b3f]/20">
        <button onClick={() => setLang("zh")} className={`px-3 py-2 font-bold ${lang === "zh" ? "bg-[#172b3f] text-white" : "bg-white"}`}>CMI 中文</button>
        <button onClick={() => setLang("en")} className={`px-3 py-2 font-bold ${lang === "en" ? "bg-[#172b3f] text-white" : "bg-white"}`}>EMI English</button>
      </div>
    </header>
    <h1 className="mt-5 text-4xl font-black">{label}</h1>
    {complete ? <section className="mq-practice-card mt-6 rounded-3xl border bg-white p-9 text-center">
      <div className="text-6xl">★</div><h2 className="mt-4 text-3xl font-black">{lang === "zh" ? "操作站完成！" : "Interactive station completed!"}</h2>
      <p className="mt-3 text-[#617286]">{lang === "zh" ? "8 題完成，星星與今日紀錄已更新。" : "Eight questions completed. Your star and daily record are updated."}</p>
      <Link href="/#path" className="mq-start mt-6 inline-block rounded-xl bg-[#f05a3c] px-5 py-3 font-bold text-white">{lang === "zh" ? "返回學習地圖" : "Back to map"}</Link>
    </section> : <section className="mq-practice-card mt-6 rounded-3xl border bg-white p-6 text-center sm:p-8">
      <p className="font-mono text-xs">STATION {String(index + 1).padStart(2, "0")} · {index + 1}/8 · S3 INTERACTIVE</p>
      <p className="mx-auto mt-4 max-w-xl rounded-xl bg-[#fff7ef] p-3 text-sm font-bold">{lang === "zh" ? `提示：${station.cue[0]}` : `Hint: ${station.cue[1]}`}</p>
      <h2 className="mx-auto mt-5 max-w-2xl text-2xl font-black leading-snug">{item.prompt[lang === "zh" ? 0 : 1]}</h2>
      <button onClick={speak} className="mt-4 rounded-full border border-[#172b3f]/20 bg-white px-4 py-2 text-sm font-bold">◉ {lang === "zh" ? "朗讀題目" : "Read task"}</button>
      <div className="mq-concept-choices mx-auto mt-7 grid max-w-xl gap-3">
        {choices.map((choice) => <button key={choiceKey(choice)} type="button" onClick={() => { setSelected(choiceKey(choice)); setResult(""); }} className={`rounded-xl border-2 p-4 text-left font-bold ${selected === choiceKey(choice) ? "border-[#0e8b87] bg-[#e8f5f2]" : "border-[#1f8378]/35 bg-white"}`}>{displayed(choice)}</button>)}
      </div>
      <button onClick={check} disabled={!selected} className="mq-start mt-7 rounded-xl bg-[#f05a3c] px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{lang === "zh" ? "檢查答案" : "Check answer"}</button>
      {result === "wrong" && <div className="mx-auto mt-4 max-w-xl rounded-xl bg-[#fff3e8] p-3 font-bold text-[#b84c36]">{lang === "zh" ? `再試一次。正確表示法是：${correctText}` : `Try again. The correct representation is: ${correctText}`}</div>}
      {result === "correct" && <div className="mt-4"><p className="font-bold text-[#0e8b87]">{lang === "zh" ? "答對了！" : "Correct!"}</p><button onClick={next} className="mq-start mt-3 rounded-xl bg-[#f05a3c] px-5 py-3 font-bold text-white">{index === 7 ? (lang === "zh" ? "完成本站" : "Finish station") : (lang === "zh" ? "下一題" : "Next task")}</button></div>}
    </section>}
  </main>;
}
