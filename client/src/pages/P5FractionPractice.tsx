import P4QuestionStation, { type Difficulty, type RandomProblem } from "@/components/P4QuestionStation";

const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
const chineseNumber = (value: number): string => value < 10 ? ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"][value] : value < 20 ? `十${value === 10 ? "" : chineseNumber(value - 10)}` : `${chineseNumber(Math.floor(value / 10))}十${value % 10 === 0 ? "" : chineseNumber(value % 10)}`;
export const displayFraction = (numerator: number, denominator: number) => { const divisor = gcd(Math.abs(numerator), denominator); const top = numerator / divisor; const bottom = denominator / divisor; return bottom === 1 ? chineseNumber(top) : `${chineseNumber(bottom)}分之${chineseNumber(top)}`; };
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const choicesFor = (numerator: number, denominator: number) => {
  const answer = displayFraction(numerator, denominator);
  const choices = [answer];
  for (let offset = 1; choices.length < 4; offset += 1) {
    const candidate = displayFraction(numerator + offset, denominator);
    if (!choices.includes(candidate)) choices.push(candidate);
  }
  return shuffle(choices);
};
const properFraction = (minDenominator: number, maxDenominator: number) => { const denominator = minDenominator + Math.floor(Math.random() * (maxDenominator - minDenominator + 1)); return { numerator: 1 + Math.floor(Math.random() * (denominator - 1)), denominator }; };

export function generateFraction(difficulty: Difficulty): RandomProblem {
  const minDenominator = difficulty === "easy" ? 2 : 3;
  const maxDenominator = difficulty === "easy" ? 4 : 8;
  const first = properFraction(minDenominator, maxDenominator);
  const second = properFraction(minDenominator, maxDenominator);
  const divide = difficulty === "challenge" || (difficulty === "standard" && Math.random() > 0.55);
  const resultNumerator = divide ? first.numerator * second.denominator : first.numerator * second.numerator;
  const resultDenominator = divide ? first.denominator * second.numerator : first.denominator * second.denominator;
  const answer = displayFraction(resultNumerator, resultDenominator);
  return { id: `fraction-${difficulty}-${first.numerator}-${first.denominator}-${second.numerator}-${second.denominator}-${divide}`, prompt: "計算以下分數，並把答案約成最簡分數。", equation: `${displayFraction(first.numerator, first.denominator)} ${divide ? "÷" : "×"} ${displayFraction(second.numerator, second.denominator)}`, answer, choices: choicesFor(resultNumerator, resultDenominator), hint: divide ? "除以一個分數，等於乘以它的倒數；最後約成最簡分數。" : "分數相乘：分子乘分子，分母乘分母；最後約成最簡分數。" };
}

export default function P5FractionPractice() { return <P4QuestionStation gradeLabel="P5" stationCode="P5 分數站 · 01" title="分數乘除" subtitle="選擇難度後，隨機練習分數乘法、除法及最簡分數。" accent="#8e5da2" practiceKey="p5-fraction-multiply-divide" generateProblem={generateFraction} />; }
