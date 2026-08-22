/** Maths Quest 答對瞬間：短暫星星撒花，提供正向回饋但不遮擋作答操作。 */
import type { CSSProperties } from "react";
import { Sparkles, Star } from "lucide-react";

export default function CorrectCelebration() {
  return <div className="mq-correct-celebration" aria-hidden="true">{[0, 1, 2, 3, 4].map((item) => <Star key={item} className="mq-correct-star" style={{ "--celebration-index": item } as CSSProperties} />)}<Sparkles className="mq-correct-spark" /></div>;
}
