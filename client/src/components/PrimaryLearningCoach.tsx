/** Maths Quest 小學生導引：以圖示加三個短詞，降低 P1–P6 練習頁的閱讀負擔。 */
import { ArrowRight, Eye, Hand, type LucideIcon } from "lucide-react";
import { useLocation } from "wouter";

const steps: { label: string; Icon: LucideIcon }[] = [
  { label: "看題", Icon: Eye },
  { label: "選答", Icon: Hand },
  { label: "前進", Icon: ArrowRight },
];

export default function PrimaryLearningCoach() {
  const [location] = useLocation();
  if (!/^\/practice\/p[1-6]/.test(location)) return null;
  return <aside className="mq-primary-coach" aria-label="做題三步">
    <span className="mq-primary-coach-title">跟住做</span>
    <ol>{steps.map(({ label, Icon }, index) => <li key={label}><span>{index + 1}</span><Icon aria-hidden="true" /><strong>{label}</strong></li>)}</ol>
  </aside>;
}
