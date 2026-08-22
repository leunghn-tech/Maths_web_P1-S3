/** Maths Quest 完美通關：八題全對時顯示的大獎盃成就標誌。 */
import { Crown, Sparkles, Trophy } from "lucide-react";

export default function PerfectTrophy({ show }: { show: boolean }) {
  if (!show) return null;
  return <div className="mq-perfect-trophy" role="status" aria-live="polite"><Crown className="mq-perfect-crown size-6" /><span><Trophy className="size-10" /></span><Sparkles className="mq-perfect-spark mq-perfect-spark-one size-5" /><Sparkles className="mq-perfect-spark mq-perfect-spark-two size-4" /><strong>完美通關！</strong><small>8 題全對 · 大獎盃</small></div>;
}
