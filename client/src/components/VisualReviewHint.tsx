/** Maths Quest 錯題圖像提示：以可拖曳、可點按的三步解題互動協助學生看懂答案。 */
import { ArrowRight, Check, Eye, Lightbulb, Percent, Play, RotateCcw } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";

export type ReviewHintKind = "count" | "groups" | "fraction" | "order" | "application";
type Props = { kind: ReviewHintKind; expression: string; answer: string; hint?: string; accent?: string };

function Dots({ amount = 6, accent = "#f05a3c" }: { amount?: number; accent?: string }) {
  return <span className="mq-review-dots" aria-hidden="true">{Array.from({ length: Math.min(amount, 10) }, (_, index) => <i key={index} style={{ backgroundColor: accent }} />)}</span>;
}

function PuzzleToken({ kind, accent }: { kind: ReviewHintKind; accent: string }) {
  if (kind === "count") return <Dots accent={accent} />;
  if (kind === "groups") return <span className="mq-review-group"><Dots amount={3} accent={accent} /><Dots amount={3} accent={accent} /></span>;
  if (kind === "fraction") return <span className="mq-fraction-bars"><i style={{ backgroundColor: accent }} /><i style={{ backgroundColor: accent }} /><i /><i /></span>;
  if (kind === "order") return <span className="mq-puzzle-order">× ÷</span>;
  return <Percent className="size-6" />;
}

function PuzzleTarget({ kind }: { kind: ReviewHintKind }) {
  if (kind === "count") return <>數清楚</>;
  if (kind === "groups") return <>每組一樣</>;
  if (kind === "fraction") return <>同一個整體</>;
  if (kind === "order") return <>先做這一步</>;
  return <>先找變化量</>;
}

export default function VisualReviewHint({ kind, expression, answer, hint, accent = "#f05a3c" }: Props) {
  const [step, setStep] = useState(0);
  const [placed, setPlaced] = useState(false);
  const title = kind === "count" ? "看圖數一數" : kind === "groups" ? "分組計算" : kind === "fraction" ? "分子分母分開看" : kind === "order" ? "先乘除，後加減" : "把題目分成兩步";
  const restart = () => { setStep(0); setPlaced(false); };
  const completePuzzle = () => { if (!placed) setPlaced(true); };

  useEffect(() => { restart(); }, [kind, expression, answer]);
  useEffect(() => {
    if (step !== 0) return;
    const timer = window.setTimeout(() => setStep(1), 900);
    return () => window.clearTimeout(timer);
  }, [step]);
  useEffect(() => {
    if (!placed) return;
    const timer = window.setTimeout(() => setStep(2), 350);
    return () => window.clearTimeout(timer);
  }, [placed]);

  return <div className="mq-review-visual mq-solution-player" style={{ "--review-accent": accent } as CSSProperties}>
    <div className="mq-review-visual-head"><Lightbulb className="size-4" /><span>動手解題</span><strong>{title}</strong><span className="mq-solution-count">{step + 1} / 3</span></div>
    <div className={`mq-solution-stage ${step >= 0 ? "is-visible" : ""}`}><span className="mq-solution-number"><Eye className="size-3" /> 1</span><span className="mq-solution-copy">先看題目</span><span className="mq-review-chip">{expression}</span></div>
    <div className={`mq-solution-stage mq-puzzle-stage ${step >= 1 ? "is-visible" : ""} ${placed ? "is-complete" : ""}`}><span className="mq-solution-number">2</span><span className="mq-solution-copy">動手放</span><button type="button" className="mq-puzzle-piece" draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", "maths-quest-piece")} onClick={completePuzzle} aria-label="按一下選取圖形，然後放到提示框"><PuzzleToken kind={kind} accent={accent} /></button><ArrowRight className="size-4" /><button type="button" className="mq-puzzle-target" onDragOver={(event) => event.preventDefault()} onDrop={completePuzzle} onClick={completePuzzle} aria-label="把圖形放到這裡"><span>{placed ? <><Check className="size-4" /> 做得好</> : <PuzzleTarget kind={kind} />}</span></button></div>
    <div className={`mq-solution-stage ${step >= 2 ? "is-visible" : ""}`}><span className="mq-solution-number"><Check className="size-3" /> 3</span><span className="mq-solution-copy">答案是</span><span className="mq-solution-equals">＝</span><b>{answer}</b></div>
    <p>{step < 1 ? "先看題目，下一步會有圖形讓你操作。" : step < 2 ? "拖圖形到框內；也可以直接按圖形，再按提示框。" : hint ?? "一步一步做，就可以找到答案。"}</p>
    <div className="mq-solution-actions"><button type="button" onClick={() => step === 0 ? setStep(1) : step === 1 ? completePuzzle() : restart()}>{step === 0 ? <><Play className="size-3" /> 下一步</> : step === 1 ? <><Check className="size-3" /> 我放好了</> : <><RotateCcw className="size-3" /> 再做一次</>}</button></div>
  </div>;
}
