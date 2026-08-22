/** Maths Quest 高年級結算成就：在完成八題後提供完美獎盃與語音錯題回顧。 */
import PerfectTrophy from "@/components/PerfectTrophy";
import WrongReviewVoiceButton, { type VoiceReviewItem } from "@/components/WrongReviewVoiceButton";

export default function FinishAchievementOverlay({ perfect, items }: { perfect: boolean; items: VoiceReviewItem[] }) {
  if (!perfect && !items.length) return null;
  return <div className="mq-finish-achievement-overlay">{perfect && <PerfectTrophy show />}{items.length > 0 && <WrongReviewVoiceButton items={items} />}</div>;
}
