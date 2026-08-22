/** Maths Quest 過關星星：讓小學生在題型卡上即時看見已完成的站點。 */
import { Star } from "lucide-react";

export default function CompletionStars({ completed, label = "已過關" }: { completed: boolean; label?: string }) {
  return <span className={`mq-completion-stars ${completed ? "is-complete" : ""}`} aria-label={completed ? label : "未完成"}>{[0, 1, 2].map((star) => <Star key={star} className="size-3" />)}<small>{completed ? label : "未過關"}</small></span>;
}
