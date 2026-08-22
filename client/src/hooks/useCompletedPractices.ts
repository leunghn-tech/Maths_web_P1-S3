/** Maths Quest 完成紀錄監聽：題型卡會在學生過關後即時顯示星星。 */
import { useEffect, useState } from "react";
import { getCompletedPractices, PRACTICE_COMPLETION_EVENT } from "@/lib/practiceCompletion";

export function useCompletedPractices() {
  const [completedPractices, setCompletedPractices] = useState(() => getCompletedPractices());
  useEffect(() => {
    const sync = () => setCompletedPractices(getCompletedPractices());
    window.addEventListener(PRACTICE_COMPLETION_EVENT, sync);
    return () => window.removeEventListener(PRACTICE_COMPLETION_EVENT, sync);
  }, []);
  return completedPractices;
}
