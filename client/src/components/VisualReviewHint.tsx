/** Maths Quest 錯題圖像提示：以可重播的三步動畫協助學生看懂解題。 */
import { ArrowRight, Check, Equal, Eye, Lightbulb, Percent, Play, RotateCcw, X } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";

export type ReviewHintKind = "count" | "groups" | "fraction" | "order" | "application";

type Props = { kind: ReviewHintKind; expression: string; answer: string; hint?: string; accent?: string };

function Dots({ amount = 6, accent = "#f05a3c" }: { amount?: number; accent?: string }) {
  return <span className="mq-review-dots" aria-hidden="true">{Array.from({ length: Math.min(amount, 10) }, (_, index) => <i key={index} style={{ backgroundColor: accent }} />)}</span>;
}

function MethodVisual({ kind, accent }: { kind: ReviewHintKind; accent: string }) {
  if (kind === "count") return <><Dots accent={accent} /><ArrowRight className="size-4" /><span className="mq-review-chip">慢慢數</span></>;
  if (kind === "groups") return <><span className="mq-review-group"><Dots amount={3} accent={accent} /><Dots amount={3} accent={accent} /></span><X className="size-4" /><span className="mq-review-chip">組數 × 每組</span></>;
  if (kind === "fraction") return <><span className="mq-fraction-bars"><i style={{ backgroundColor: accent }} /><i style={{ backgroundColor: accent }} /><i /><i /></span><ArrowRight className="size-4" /><span className="mq-review-chip">分母不變</span></>;
  if (kind === "order") return <><span className="mq-review-chip">先乘 ÷</span><ArrowRight className="size-4" /><span className="mq-review-chip">再加 −</span></>;
  return <><Percent className="size-6" /><ArrowRight className="size-4" /><span className="mq-review-chip">先找變化量</span></>;
}

export default function VisualReviewHint({ kind, expression, answer, hint, accent = "#f05a3c" }: Props) {
  const [step, setStep] = useState(0);
  const title = kind === "count" ? "看圖數一數" : kind === "groups" ? "分組計算" : kind === "fraction" ? "分子分母分開看" : kind === "order" ? "先乘除，後加減" : "把題目分成兩步";
  const restart = () => setStep(0);

  useEffect(() => { restart(); }, [kind, expression, answer]);
  useEffect(() => {
    if (step >= 2) return;
    const timer = window.setTimeout(() => setStep((value) => Math.min(2, value + 1)), step === 0 ? 900 : 1200);
    return () => window.clearTimeout(timer);
  }, [step]);

  return <div className="mq-review-visual mq-solution-player" style={{ "--review-accent": accent } as CSSProperties}>
    <div className="mq-review-visual-head"><Lightbulb className="size-4" /><span>逐步解題</span><strong>{title}</strong><span className="mq-solution-count">{step + 1} / 3</span></div>
    <div className={`mq-solution-stage ${step >= 0 ? "is-visible" : ""}`}><span className="mq-solution-number"><Eye className="size-3" /> 1</span><span className="mq-solution-copy">先看題目</span><span className="mq-review-chip">{expression}</span></div>
    <div className={`mq-solution-stage ${step >= 1 ? "is-visible" : ""}`}><span className="mq-solution-number">2</span><span className="mq-solution-copy">跟住做</span><span className="mq-solution-method"><MethodVisual kind={kind} accent={accent} /></span></div>
    <div className={`mq-solution-stage ${step >= 2 ? "is-visible" : ""}`}><span className="mq-solution-number"><Check className="size-3" /> 3</span><span className="mq-solution-copy">答案是</span><Equal className="size-4" /><b>{answer}</b></div>
    <p>{step < 2 ? "跟住亮起的步驟慢慢看。" : hint ?? "一步一步做，就可以找到答案。"}</p>
    <div className="mq-solution-actions"><button type="button" onClick={() => step < 2 ? setStep((value) => value + 1) : restart()}>{step < 2 ? <><Play className="size-3" /> 下一步</> : <><RotateCcw className="size-3" /> 再看一次</>}</button></div>
  </div>;
}
