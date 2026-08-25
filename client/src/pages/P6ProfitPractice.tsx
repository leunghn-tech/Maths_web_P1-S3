/** Maths Quest P6 利潤站：暖白手帳題面保留解題橘紅作行動與進度訊號，紫色僅作題型識別。 */
import P4QuestionStation, { type Difficulty, type RandomProblem } from "@/components/P4QuestionStation";

const shuffled = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const money = (value: number) => `HK$${Number(value.toFixed(2))}`;

function moneyChoices(answer: number, alternatives: number[]) {
  const values = Array.from(new Set([answer, ...alternatives].map((value) => Number(Math.max(0, value).toFixed(2)))));
  return shuffled(values).slice(0, 4).map(money);
}

function percentChoices(answer: number, alternatives: number[]) {
  const values = Array.from(new Set([answer, ...alternatives].map((value) => Math.max(0, Math.round(value)))));
  return shuffled(values).slice(0, 4).map((value) => `${value}%`);
}

function generateProfit(difficulty: Difficulty): RandomProblem {
  const costs = difficulty === "easy" ? [40, 60, 80, 100, 120] : [80, 100, 120, 160, 200, 240];
  const cost = costs[Math.floor(Math.random() * costs.length)];
  const profitRates = difficulty === "easy" ? [10, 20, 25, 50] : [15, 20, 25, 30, 40, 50];
  const rate = profitRates[Math.floor(Math.random() * profitRates.length)];
  const profit = cost * rate / 100;
  const selling = cost + profit;
  if (difficulty === "easy") {
    return { id: `profit-amount-${cost}-${selling}-${Math.random()}`, prompt: `一件物品成本 ${money(cost)}，售價 ${money(selling)}，利潤是多少？`, equation: `${selling} − ${cost}`, answer: money(profit), choices: moneyChoices(profit, [cost, selling, profit + 10]), hint: "利潤 = 售價 − 成本。" };
  }
  if (difficulty === "standard") {
    return { id: `profit-percent-${cost}-${selling}-${Math.random()}`, prompt: `一件物品成本 ${money(cost)}，售價 ${money(selling)}，利潤率是多少？`, equation: `${profit} ÷ ${cost} × 100%`, answer: `${rate}%`, choices: percentChoices(rate, [rate + 5, Math.max(0, rate - 5), rate * 2]), hint: "利潤率 = 利潤 ÷ 成本 × 100%。" };
  }
  return { id: `profit-selling-${cost}-${rate}-${Math.random()}`, prompt: `一件物品成本 ${money(cost)}，希望有 ${rate}% 利潤，售價應是多少？`, equation: `${cost} + ${profit}`, answer: money(selling), choices: moneyChoices(selling, [profit, cost - profit, selling + 20]), hint: "售價 = 成本 + 利潤；先算成本的百分之多少是利潤。" };
}

export default function P6ProfitPractice() {
  return <P4QuestionStation stationCode="P6 應用站 · 02" title="利潤應用" subtitle="選擇難度後，隨機挑戰利潤金額、利潤率與售價計算。" accent="#8a5ca5" practiceKey="p6-profit" gradeLabel="P6" generateProblem={generateProfit} />;
}
