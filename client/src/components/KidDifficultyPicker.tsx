/** Maths Quest 小學生難度選擇：以大圖示、短句與顏色狀態協助 P1–P2 自主選擇。 */
export type KidDifficulty = "easy" | "standard" | "challenge";
type Props = { value: KidDifficulty; onChange: (value: KidDifficulty) => void; details: Record<KidDifficulty, string>; disabled?: Partial<Record<KidDifficulty, boolean>> };

/** 難度選擇已取消；保留相容元件以讓既有題庫固定使用預設隨機題。 */
export default function KidDifficultyPicker(_props: Props) {
  return null;
}
