/** Maths Quest 小學生題型卡：用大圖示和極短標籤取代文字型頁籤。 */
import { Lock, type LucideIcon } from "lucide-react";
import CompletionStars from "@/components/CompletionStars";

export type KidTopicItem<T extends string | number> = { id: T; label: string; detail: string; Icon: LucideIcon; completed?: boolean };
type Props<T extends string | number> = { value: T; onChange: (value: T) => void; items: KidTopicItem<T>[]; disabled?: Partial<Record<T, boolean>> };

export default function KidTopicPicker<T extends string | number>({ value, onChange, items, disabled = {} }: Props<T>) {
  return <div className="mq-kid-topic" role="radiogroup" aria-label="選擇題型">{items.map(({ id, label, detail, Icon, completed = false }) => <button key={id} onClick={() => !disabled[id] && onChange(id)} disabled={disabled[id]} aria-pressed={value === id} role="radio"><span className="mq-kid-topic-icon">{disabled[id] ? <Lock /> : <Icon />}</span><strong>{label}</strong><small>{disabled[id] ? "先過關" : detail}</small><CompletionStars completed={completed} /></button>)}</div>;
}
