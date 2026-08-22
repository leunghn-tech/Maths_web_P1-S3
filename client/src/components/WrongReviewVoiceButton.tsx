/** Maths Quest 錯題語音回顧：每次按下朗讀下一題錯題及其正確答案。 */
import { useState } from "react";
import { Volume2 } from "lucide-react";
import { speakCantonese } from "@/lib/speech";

export type VoiceReviewItem = { prompt: string; answer: string; hint?: string };

export default function WrongReviewVoiceButton({ items }: { items: VoiceReviewItem[] }) {
  const [index, setIndex] = useState(0);
  if (!items.length) return null;
  const item = items[index % items.length];
  const listen = () => { speakCantonese(`錯題回顧，第 ${index + 1} 題。${item.prompt}。正確答案是 ${item.answer}。${item.hint ?? ""}`); setIndex((value) => (value + 1) % items.length); };
  return <button onClick={listen} className="mq-voice-review inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold"><Volume2 className="size-4" /> 聽錯題 {index + 1}/{items.length}</button>;
}
