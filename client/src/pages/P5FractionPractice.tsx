/** P5 分數乘除隨機練習頁。 */
import P4QuestionStation, { type Difficulty, type RandomProblem } from "@/components/P4QuestionStation";

const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
const fraction = (numerator: number, denominator: number) => { const divisor = gcd(numerator, denominator); return `${numerator / divisor}/${denominator / divisor}`; };
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

function generateFraction(difficulty: Difficulty): RandomProblem {
  const numeratorA = difficulty === "easy" ? 1 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 5);
  const denominatorA = difficulty === "easy" ? 2 + Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 7);
  const numeratorB = difficulty === "easy" ? 1 : 1 + Math.floor(Math.random() * 4);
  const denominatorB = difficulty === "easy" ? 2 + Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 7);
  const divide = difficulty === "challenge" || (difficulty === "standard" && Math.random() > 0.55);
  const answer = divide ? fraction(numeratorA * denominatorB, denominatorA * numeratorB) : fraction(numeratorA * numeratorB, denominatorA * denominatorB);
  const [top, bottom] = answer.split("/").map(Number);
  const alternatives = Array.from(new Set([answer, `${Math.max(1, top + 1)}/${bottom}`, `${top}/${bottom + 1}`, `${Math.max(1, numeratorA + numeratorB)}/${denominatorA + denominatorB}`]));
  return { id: `fraction-${difficulty}-${numeratorA}-${denominatorA}-${numeratorB}-${denominatorB}-${divide}`, prompt: divide ? "把除以分數轉成乘以倒數，再約成最簡分數。" : "先把分子相乘、分母相乘，再把答案約成最簡分數。", equation: `${numeratorA}/${denominatorA} ${divide ? "÷" : "×"} ${numeratorB}/${denominatorB}`, answer, choices: shuffle(alternatives), hint: divide ? "除以一個分數，等於乘以它的倒數。" : "分數相乘：分子乘分子，分母乘分母。" };
}

export default function P5FractionPractice() { return <P4QuestionStation gradeLabel="P5" stationCode="P5 分數站 · 01" title="分數乘除" subtitle="選擇難度後，隨機練習分數乘法、除法及最簡分數。" accent="#8e5da2" practiceKey="p5-fraction-multiply-divide" generateProblem={generateFraction} />; }
