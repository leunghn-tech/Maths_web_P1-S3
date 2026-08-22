/** Maths Quest 小學生難度選擇：以大圖示、短句與顏色狀態協助 P1–P2 自主選擇。 */
import { CircleDot, Lock, Star, Trophy } from "lucide-react";
import { speakCantonese } from "@/lib/speech";

export type KidDifficulty = "easy" | "standard" | "challenge";
type Props = { value: KidDifficulty; onChange: (value: KidDifficulty) => void; details: Record<KidDifficulty, string>; disabled?: Partial<Record<KidDifficulty, boolean>> };

const items = [
  { id: "easy" as const, label: "慢慢來", Icon: CircleDot },
  { id: "standard" as const, label: "剛剛好", Icon: Star },
  { id: "challenge" as const, label: "挑戰我", Icon: Trophy },
];

export default function KidDifficultyPicker({ value, onChange, details, disabled = {} }: Props) {
  return <div className="mq-kid-difficulty" role="radiogroup" aria-label="選擇難度">{items.map(({ id, label, Icon }) => <button key={id} onClick={() => { if (disabled[id]) return; speakCantonese(`${label}，${details[id]}`); onChange(id); }} disabled={disabled[id]} aria-pressed={value === id} role="radio"><span className="mq-kid-difficulty-icon">{disabled[id] ? <Lock /> : <Icon />}</span><strong>{label}</strong><small>{disabled[id] ? "先過關" : details[id]}</small></button>)}</div>;
}
