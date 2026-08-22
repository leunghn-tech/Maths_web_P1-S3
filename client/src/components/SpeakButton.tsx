/** Maths Quest 小學生朗讀按鈕：用耳朵圖示取代冗長文字說明。 */
import { Volume2 } from "lucide-react";
import { speakCantonese } from "@/lib/speech";

type Props = { text: string; label?: string; className?: string };

export default function SpeakButton({ text, label = "聽題目", className = "" }: Props) {
  return <button type="button" onClick={() => speakCantonese(text)} className={`mq-speak-button ${className}`} aria-label={label} title={label}><Volume2 className="size-4" /><span>{label}</span></button>;
}
