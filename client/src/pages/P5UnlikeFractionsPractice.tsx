import P4QuestionStation, { type Difficulty, type RandomProblem } from "@/components/P4QuestionStation";

const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
const lcm = (a: number, b: number) => a * b / gcd(a, b);
const reduce = (numerator: number, denominator: number) => { const divisor = gcd(Math.abs(numerator), denominator); const top = numerator / divisor; const bottom = denominator / divisor; return bottom === 1 ? String(top) : `${top}/${bottom}`; };
const shuffled = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const choicesFor = (numerator: number, denominator: number) => {
  const answer = reduce(numerator, denominator);
  const choices = [answer];
  for (let offset = 1; choices.length < 4; offset += 1) { const candidate = reduce(numerator + offset, denominator); if (!choices.includes(candidate)) choices.push(candidate); }
  return shuffled(choices);
};

function generateUnlikeFractions(difficulty: Difficulty): RandomProblem {
  const denominators = difficulty === "easy" ? [[2, 4], [3, 6], [4, 8]] : difficulty === "standard" ? [[2, 3], [3, 4], [4, 5]] : [[4, 6], [5, 6], [3, 8], [4, 9]];
  let [firstDenominator, secondDenominator] = denominators[Math.floor(Math.random() * denominators.length)];
  let firstNumerator = 1 + Math.floor(Math.random() * (firstDenominator - 1));
  let secondNumerator = 1 + Math.floor(Math.random() * (secondDenominator - 1));
  const subtract = difficulty === "challenge" && Math.random() > 0.45;
  const common = lcm(firstDenominator, secondDenominator);
  let convertedFirst = firstNumerator * (common / firstDenominator);
  let convertedSecond = secondNumerator * (common / secondDenominator);
  if (subtract && convertedFirst < convertedSecond) {
    [firstNumerator, secondNumerator] = [secondNumerator, firstNumerator];
    [firstDenominator, secondDenominator] = [secondDenominator, firstDenominator];
    [convertedFirst, convertedSecond] = [convertedSecond, convertedFirst];
  }
  const numerator = subtract ? convertedFirst - convertedSecond : convertedFirst + convertedSecond;
  const answer = reduce(numerator, common);
  const symbol = subtract ? "−" : "+";
  return { id: `unlike-${firstNumerator}-${firstDenominator}-${symbol}-${secondNumerator}-${secondDenominator}-${Math.random()}`, prompt: "先通分，再計算，並把答案約成最簡分數。", equation: `${firstNumerator}/${firstDenominator} ${symbol} ${secondNumerator}/${secondDenominator}`, answer, choices: choicesFor(numerator, common), hint: `先把兩個分數化成分母為 ${common} 的等值分數，再處理分子。` };
}

export default function P5UnlikeFractionsPractice() { return <P4QuestionStation stationCode="P5 分數站 · 03" title="異分母分數加減法" subtitle="選擇難度後，隨機練習通分、相加或相減，並把答案約成最簡分數。" accent="#a05a7a" practiceKey="p5-unlike-fractions" gradeLabel="P5" generateProblem={generateUnlikeFractions} />; }
