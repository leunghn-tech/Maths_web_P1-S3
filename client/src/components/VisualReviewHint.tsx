/** Maths Quest 錯題圖像提示：以少文字的圖示步驟協助學生理解正確答案。 */
import { ArrowRight, Equal, Lightbulb, Percent, Plus, X } from "lucide-react";

export type ReviewHintKind = "count" | "groups" | "fraction" | "order" | "application";

type Props = { kind: ReviewHintKind; expression: string; answer: string; hint?: string; accent?: string };

function Dots({ amount = 6, accent = "#f05a3c" }: { amount?: number; accent?: string }) {
  return <span className="mq-review-dots" aria-hidden="true">{Array.from({ length: Math.min(amount, 10) }, (_, index) => <i key={index} style={{ backgroundColor: accent }} />)}</span>;
}

export default function VisualReviewHint({ kind, expression, answer, hint, accent = "#f05a3c" }: Props) {
  const title = kind === "count" ? "看圖數一數" : kind === "groups" ? "分組計算" : kind === "fraction" ? "分子分母分開看" : kind === "order" ? "先乘除，後加減" : "把題目分成兩步";
  return <div className="mq-review-visual" style={{ "--review-accent": accent } as React.CSSProperties}><div className="mq-review-visual-head"><Lightbulb className="size-4" /><span>圖像提示</span><strong>{title}</strong></div>{kind === "count" && <div className="mq-review-steps"><Dots accent={accent} /><ArrowRight className="size-4" /><span className="mq-review-chip">{expression}</span><Equal className="size-4" /><b>{answer}</b></div>}{kind === "groups" && <div className="mq-review-steps"><span className="mq-review-group"><Dots amount={3} accent={accent} /><Dots amount={3} accent={accent} /></span><X className="size-4" /><span className="mq-review-chip">幾組 × 每組</span><Equal className="size-4" /><b>{answer}</b></div>}{kind === "fraction" && <div className="mq-review-steps"><span className="mq-fraction-bars"><i style={{ backgroundColor: accent }} /><i style={{ backgroundColor: accent }} /><i /><i /></span><ArrowRight className="size-4" /><span className="mq-review-chip">分母不變，算分子</span><Equal className="size-4" /><b>{answer}</b></div>}{kind === "order" && <div className="mq-review-steps"><span className="mq-review-chip">① 先乘 ÷</span><ArrowRight className="size-4" /><span className="mq-review-chip">② 再加 −</span><Equal className="size-4" /><b>{answer}</b></div>}{kind === "application" && <div className="mq-review-steps"><Percent className="size-6" /><ArrowRight className="size-4" /><span className="mq-review-chip">先找變化量</span><ArrowRight className="size-4" /><b>{answer}</b></div>}<p>{hint ?? "一步一步做，就可以找到答案。"}</p></div>;
}
