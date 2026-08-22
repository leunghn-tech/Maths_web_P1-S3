/** Maths Quest 小學生導引：以圖示加三個短詞，降低 P1–P6 練習頁的閱讀負擔。 */
import { ArrowRight, Eye, Hand, type LucideIcon } from "lucide-react";
import { speakCantonese } from "@/lib/speech";
import { useLocation } from "wouter";

const steps: { label: string; prompt: string; Icon: LucideIcon }[] = [
  { label: "看題", prompt: "先看題目。想再聽一次，可以按聽題目。", Icon: Eye },
  { label: "選答", prompt: "選一個你認為正確的答案。", Icon: Hand },
  { label: "前進", prompt: "答對後，按下一題，繼續前進。", Icon: ArrowRight },
];

export default function PrimaryLearningCoach() {
  const [location] = useLocation();
  if (!/^\/practice\/p[1-6]/.test(location)) return null;
  return <aside className="mq-primary-coach" aria-label="做題三步">
    <span className="mq-primary-coach-title">跟住做</span>
    <ol>{steps.map(({ label, prompt, Icon }, index) => <li key={label}><button type="button" onClick={() => speakCantonese(prompt)} aria-label={`${label}提示`}><span>{index + 1}</span><Icon aria-hidden="true" /><strong>{label}</strong></button></li>)}</ol>
  </aside>;
}
