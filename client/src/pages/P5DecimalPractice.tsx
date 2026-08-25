import P4QuestionStation, { type Difficulty, type RandomProblem } from "@/components/P4QuestionStation";

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const format = (value: number) => Number(value.toFixed(2)).toString();
const decimalChoices = (answer: number) => {
  const choices = [format(answer)];
  for (const adjustment of [0.1, -0.1, 1, -1, 0.2, 2]) { const candidate = format(Math.max(0, answer + adjustment)); if (!choices.includes(candidate)) choices.push(candidate); if (choices.length === 4) break; }
  return shuffle(choices);
};

function generateDecimal(difficulty: Difficulty): RandomProblem {
  const firstTenths = 10 + Math.floor(Math.random() * (difficulty === "easy" ? 70 : 140));
  const secondTenths = 2 + Math.floor(Math.random() * (difficulty === "easy" ? 40 : 80));
  const a = firstTenths / 10;
  const b = secondTenths / 10;
  if (difficulty === "easy") {
    const add = Math.random() > 0.5;
    const minuend = Math.max(a, b); const subtrahend = Math.min(a, b);
    const answer = add ? a + b : minuend - subtrahend;
    return { id: `decimal-easy-${a}-${b}-${add}`, prompt: "把小數點對齊，再進行小數加法或減法。", equation: add ? `${a} + ${b}` : `${minuend} − ${subtrahend}`, answer: format(answer), choices: decimalChoices(answer), hint: "小數點要對齊，從最右邊的小數位開始計算。" };
  }
  if (difficulty === "standard") {
    const multiplier = 2 + Math.floor(Math.random() * 5);
    const answer = a * multiplier;
    return { id: `decimal-standard-${a}-${multiplier}`, prompt: "計算小數乘整數，並留意答案的小數點位置。", equation: `${a} × ${multiplier}`, answer: format(answer), choices: decimalChoices(answer), hint: "先按整數乘法計算，再按原數的小數位數放回小數點。" };
  }
  const divisor = 2 + Math.floor(Math.random() * 4);
  const quotientTenths = 10 + Math.floor(Math.random() * 60);
  const dividend = quotientTenths * divisor / 10;
  const answer = quotientTenths / 10;
  return { id: `decimal-challenge-${dividend}-${divisor}`, prompt: "計算小數除以整數，並檢查商的小數點位置。", equation: `${format(dividend)} ÷ ${divisor}`, answer: format(answer), choices: decimalChoices(answer), hint: "小數除以整數時，商的小數點要與被除數的小數點對齊。" };
}

export default function P5DecimalPractice() { return <P4QuestionStation gradeLabel="P5" stationCode="P5 小數站 · 02" title="小數四則運算" subtitle="選擇難度後，隨機練習小數加減、乘法及除法。" accent="#0e8b87" practiceKey="p5-decimal-operations" generateProblem={generateDecimal} />; }
