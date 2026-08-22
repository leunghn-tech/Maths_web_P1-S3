/** Maths Quest 八題中場站：完成第 4 題後，短暫提示學生休息並朗讀鼓勵。 */
import { useEffect } from "react";
import { ArrowRight, Coffee, Sparkles } from "lucide-react";
import { speakCantonese } from "@/lib/speech";

export default function MidpointBreak({ open, onContinue }: { open: boolean; onContinue: () => void }) {
  useEffect(() => { if (open) speakCantonese("好叻！你已完成一半。深呼吸一下，準備再做四題。") }, [open]);
  if (!open) return null;
  return <div className="mq-midpoint-break" role="dialog" aria-modal="true" aria-label="中場休息"><div className="mq-midpoint-card"><span className="mq-midpoint-icon"><Coffee className="size-7" /><Sparkles className="mq-midpoint-spark size-4" /></span><p className="font-mono text-[10px] font-bold tracking-[0.16em]">HALFWAY STAR</p><h2>完成一半了！</h2><p>深呼吸一下，再解開 4 題。</p><button onClick={onContinue}>繼續挑戰 <ArrowRight className="size-4" /></button></div></div>;
}
