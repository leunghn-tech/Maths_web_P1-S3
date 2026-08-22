/** Maths Quest 自動讀題開關：讓低年級學生不用每題重新按朗讀。 */
import { Volume2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type Props = { checked: boolean; onCheckedChange: (value: boolean) => void };

export default function AutoReadToggle({ checked, onCheckedChange }: Props) {
  return <label className="mq-auto-read"><Volume2 className="size-4" /><span>自動讀題</span><Switch checked={checked} onCheckedChange={onCheckedChange} aria-label="自動朗讀下一題" /></label>;
}
