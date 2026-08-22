/** Maths Quest 連中徽章：學生連續答對三題時，顯示短暫的成就提示。 */
import { Award, Sparkles } from "lucide-react";

export default function StreakBadge({ streak }: { streak: number }) {
  if (streak < 3) return null;
  return <div className="mq-streak-badge" role="status" aria-live="polite"><span><Award className="size-5" /><Sparkles className="mq-streak-spark size-3" /></span><strong>連中 3 題！</strong><small>星級小勇士</small></div>;
}
