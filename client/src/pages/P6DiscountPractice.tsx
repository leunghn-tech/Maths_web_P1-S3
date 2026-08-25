/** Maths Quest P6 百分數站：暖白手帳題面以解題橘紅作行動與進度訊號。 */
import P4QuestionStation, { type Difficulty, type RandomProblem } from "@/components/P4QuestionStation";

const shuffled = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const money = (value: number) => `HK$${Number(value.toFixed(2))}`;

function createChoices(answer: number, alternatives: number[]) {
  const values = Array.from(new Set([answer, ...alternatives].map((value) => Number(Math.max(0, value).toFixed(2)))));
  return shuffled(values).slice(0, 4).map(money);
}

function generateDiscount(difficulty: Difficulty): RandomProblem {
  const prices = difficulty === "easy" ? [80, 100, 120, 160, 200] : [120, 160, 200, 240, 300, 400];
  const price = prices[Math.floor(Math.random() * prices.length)];
  const discounts = difficulty === "easy" ? [10, 20, 25, 50] : [10, 15, 20, 25, 30, 40];
  const discount = discounts[Math.floor(Math.random() * discounts.length)];
  const discountAmount = price * discount / 100;
  const salePrice = price - discountAmount;
  if (difficulty === "easy") {
    return { id: `percent-${price}-${discount}-${Math.random()}`, prompt: `一件物品原價 ${money(price)}，${discount}% 是多少錢？`, equation: `${price} × ${discount}%`, answer: money(discountAmount), choices: createChoices(discountAmount, [price * (100 - discount) / 100, discountAmount + 10, discountAmount / 2]), hint: "百分數表示每 100 份中的數量；用原價乘上百分率。" };
  }
  if (difficulty === "standard") {
    return { id: `discount-${price}-${discount}-${Math.random()}`, prompt: `一件物品原價 ${money(price)}，現正減價 ${discount}%，折後價是多少？`, equation: `${price} − ${discountAmount}`, answer: money(salePrice), choices: createChoices(salePrice, [discountAmount, price + discountAmount, salePrice + 10]), hint: "先找出折扣金額，再由原價減去折扣。" };
  }
  const secondDiscount = [10, 20][Math.floor(Math.random() * 2)];
  const finalPrice = salePrice * (100 - secondDiscount) / 100;
  return { id: `double-discount-${price}-${discount}-${secondDiscount}-${Math.random()}`, prompt: `一件物品原價 ${money(price)}，先減 ${discount}% 再減 ${secondDiscount}%，最後售價是多少？`, equation: `${salePrice} × ${100 - secondDiscount}%`, answer: money(finalPrice), choices: createChoices(finalPrice, [price * (100 - discount - secondDiscount) / 100, salePrice, finalPrice + 20]), hint: "第二次折扣要用第一次折後價計算，不能直接把兩個百分率相加。" };
}

export default function P6DiscountPractice() {
  return <P4QuestionStation stationCode="P6 百分站 · 01" title="百分數與折扣" subtitle="選擇難度後，隨機挑戰百分比金額、單次折扣與連續折扣。" accent="#d37042" practiceKey="p6-discount" gradeLabel="P6" generateProblem={generateDiscount} />;
}
