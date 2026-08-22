/** P5 異分母分數加減隨機練習頁。 */
import P4QuestionStation, { type Difficulty, type RandomProblem } from "@/components/P4QuestionStation";

const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
const lcm = (a: number, b: number) => a * b / gcd(a, b);
const reduce = (numerator: number, denominator: number) => {
  const divisor = gcd(Math.abs(numerator), denominator);
  return `${numerator / divisor}/${denominator / divisor}`;
};
const shuffled = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

function generateUnlikeFractions(difficulty: Difficulty): RandomProblem {
  const denominators = difficulty === "easy" ? [[2, 4], [3, 6], [4, 8]] : difficulty === "standard" ? [[2, 3], [3, 4], [4, 5]] : [[4, 6], [5, 6], [3, 8], [4, 9]];
  const [firstDenominator, secondDenominator] = denominators[Math.floor(Math.random() * denominators.length)];
  const firstNumerator = 1 + Math.floor(Math.random() * Math.max(1, firstDenominator - 1));
  const secondNumerator = 1 + Math.floor(Math.random() * Math.max(1, secondDenominator - 1));
  const subtract = difficulty === "challenge" && Math.random() > 0.45;
  const common = lcm(firstDenominator, secondDenominator);
  const convertedFirst = firstNumerator * (common / firstDenominator);
  const convertedSecond = secondNumerator * (common / secondDenominator);
  const numerator = subtract ? Math.abs(convertedFirst - convertedSecond) : convertedFirst + convertedSecond;
  const answer = reduce(numerator, common);
  const distractors = Array.from(new Set([
    reduce(convertedFirst + convertedSecond, common),
    reduce(Math.abs(firstNumerator - secondNumerator), common),
    reduce(numerator + 1, common),
    reduce(Math.max(1, numerator - 1), common),
  ].filter((value) => value !== answer))).slice(0, 3);
  while (distractors.length < 3) distractors.push(`${numerator + distractors.length + 2}/${common}`);
  const symbol = subtract ? "−" : "+";
  return {
    id: `unlike-${firstNumerator}-${firstDenominator}-${symbol}-${secondNumerator}-${secondDenominator}-${Math.random()}`,
    prompt: `計算 ${firstNumerator}/${firstDenominator} ${symbol} ${secondNumerator}/${secondDenominator}，並約成最簡分數。`,
    equation: `${firstNumerator}/${firstDenominator} ${symbol} ${secondNumerator}/${secondDenominator}`,
    answer,
    choices: shuffled([answer, ...distractors]),
    hint: `先把兩個分數化成分母為 ${common} 的等值分數，再處理分子。`,
  };
}

export default function P5UnlikeFractionsPractice() {
  return <P4QuestionStation stationCode="P5 分數站 · 03" title="異分母分數加減法" subtitle="選擇難度後，隨機練習通分、相加或相減，並把答案約成最簡分數。" accent="#a05a7a" practiceKey="p5-unlike-fractions" gradeLabel="P5" generateProblem={generateUnlikeFractions} />;
}
