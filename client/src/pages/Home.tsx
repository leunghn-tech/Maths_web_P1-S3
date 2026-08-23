/**
 * Maths Quest —「數學探險手帳」：以非對稱學習軌跡、暖白紙張與解題橘紅引導學生選擇下一個練習站。
 */
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Compass,
  Dices,
  LineChart,
  Menu,
  Moon,
  Play,
  Search,
  Sparkles,
  Star,
  Sun,
  Target,
  X,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { getCompletedPractices, PRACTICE_COMPLETION_EVENT, resetPracticeProgress } from "@/lib/practiceCompletion";
import { DAILY_PROGRESS_EVENT, getDailyPracticeProgress, setDailyPracticeTarget, type DailyPracticeProgress } from "@/lib/dailyPractice";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type Stage = "primary" | "secondary";

type Course = {
  grade: string;
  shortLabel: string;
  stage: Stage;
  title: string;
  checkpoint: string;
  accent: string;
  categories: Array<{ name: string; topics: string[] }>;
};

type StarPractice = { key: string; grade: string; title: string; detail: string; href: string; accent: string };

const courses: Course[] = [
  {
    grade: "P1",
    shortLabel: "小一",
    stage: "primary",
    title: "建立數感與圖形直覺",
    checkpoint: "20 以內加減法",
    accent: "#0e8b87",
    categories: [
      { name: "數", topics: ["20 以內的數", "100 以內的數", "順數和倒數", "基本加法和減法（不進位／不退位及進位／退位）"] },
      { name: "度量", topics: ["長度和距離（常用單位）", "時間（星期、鐘面的認識）"] },
      { name: "圖形與空間", topics: ["立體圖形（球體、柱體、錐體）", "平面圖形（三角形、正方形、長方形、圓形）", "直線和曲線"] },
      { name: "數據處理", topics: ["象形圖（一個圖形代表 1 個單位）"] },
    ],
  },
  {
    grade: "P2",
    shortLabel: "小二",
    stage: "primary",
    title: "連結乘除與生活量度",
    checkpoint: "九九乘法表",
    accent: "#c8811e",
    categories: [
      { name: "數", topics: ["三位數", "乘法和除法（九九乘法表）", "加減乘除混合計算", "分數的初步認識"] },
      { name: "度量", topics: ["長度和距離（米、厘米）", "時間（時、分、秒）", "貨幣（香港硬幣和紙幣）"] },
      { name: "圖形與空間", topics: ["角（直角、銳角、鈍角）", "四邊形（正方形、長方形的特性）", "方向（東、南、西、北）"] },
      { name: "數據處理", topics: ["象形圖（一個圖形代表 1、2、5 或 10 個單位）"] },
    ],
  },
  {
    grade: "P3",
    shortLabel: "小三",
    stage: "primary",
    title: "擴闊數字與量的觀察",
    checkpoint: "四則混合計算",
    accent: "#4f6eae",
    categories: [
      { name: "數", topics: ["四位數", "五位數", "四則混合計算"] },
      { name: "度量", topics: ["重量（克、公斤）", "容量（升、毫升）", "時間（24 小時報時制）"] },
      { name: "圖形與空間", topics: ["平行線和垂直線", "平行四邊形", "梯形"] },
      { name: "數據處理", topics: ["方塊圖", "棒形圖（一個單位代表 1 個數據）"] },
    ],
  },
  {
    grade: "P4",
    shortLabel: "小四",
    stage: "primary",
    title: "看懂關係、面積與分數",
    checkpoint: "分數加減法",
    accent: "#b15979",
    categories: [
      { name: "數", topics: ["因數和倍數", "公因數和公倍數（HCF & LCM）", "分數的加減法", "小數的初步認識"] },
      { name: "度量", topics: ["周界（正方形和長方形）", "面積（正方形和長方形）"] },
      { name: "圖形與空間", topics: ["三角形的分類（等邊、等腰、直角）", "四邊形的關係", "方向（八個方向）"] },
      { name: "數據處理", topics: ["棒形圖（一個單位代表 2、5、10 或 100 個數據）"] },
    ],
  },
  {
    grade: "P5",
    shortLabel: "小五",
    stage: "primary",
    title: "靈活運算與空間推理",
    checkpoint: "小數四則運算",
    accent: "#7c6cb0",
    categories: [
      { name: "數", topics: ["分數乘法和除法", "小數加減乘除", "異分母分數加減"] },
      { name: "度量", topics: ["平行四邊形、三角形及梯形的面積", "體積（立方厘米、立方米）"] },
      { name: "圖形與空間", topics: ["多邊形", "八向度與旋轉", "軸對稱"] },
      { name: "數據處理", topics: ["折線圖", "平均數"] },
    ],
  },
  {
    grade: "P6",
    shortLabel: "小六",
    stage: "primary",
    title: "為升中建立應用能力",
    checkpoint: "百分數應用",
    accent: "#6c8b4c",
    categories: [
      { name: "數", topics: ["百分數", "分數／小數／百分數的互化", "百分數的應用（折扣、利潤）"] },
      { name: "度量", topics: ["圓周", "圓面積", "排水法求不規則立體體積", "速率"] },
      { name: "圖形與空間", topics: ["立體圖形的截面和摺紙圖樣", "坐標幾何（第一象限）"] },
      { name: "數據處理", topics: ["圓形圖", "圓形圖的應用"] },
      { name: "代數", topics: ["簡易方程（一步及兩步方程）"] },
    ],
  },
  {
    grade: "S1",
    shortLabel: "中一",
    stage: "secondary",
    title: "踏入代數與坐標世界",
    checkpoint: "一元一次方程",
    accent: "#3867a7",
    categories: [
      { name: "數與代數", topics: ["有向數及數線（正負數）", "估算與近似（四捨五入、有效數字）", "代數初步與公式", "一元一次方程", "整數指數定律（基本）", "百分率（一）：單利息、百分增減"] },
      { name: "圖形與空間", topics: ["幾何初步（點、線、角、多邊形）", "面積與體積（一）：棱柱及圓柱的表面積和體積", "坐標幾何初步（直角坐標系、距離公式）", "對稱與變換"] },
      { name: "數據處理", topics: ["統計圖表的組織及表述（組織頻數表、組織統計圖）"] },
    ],
  },
  {
    grade: "S2",
    shortLabel: "中二",
    stage: "secondary",
    title: "用關係、證明與圖像解題",
    checkpoint: "聯立一元一次方程",
    accent: "#7d5ea8",
    categories: [
      { name: "數與代數", topics: ["乘法公式與因式分解（十字相乘法、平方差、完全平方）", "代數分數與分式方程", "聯立一元一次方程（代入法、消去法、圖像法）", "速率、比例及比"] },
      { name: "圖形與空間", topics: ["畢氏定理（勾股定理）及無理數", "幾何證明的初步（三角形內角和、外角、全等三角形、相似三角形）", "面積與體積（二）：錐體及圓錐的表面積和體積", "凸多邊形的內角與外角"] },
      { name: "數據處理", topics: ["統計學的誤用", "散點圖"] },
    ],
  },
  {
    grade: "S3",
    shortLabel: "中三",
    stage: "secondary",
    title: "整合理論與真實應用",
    checkpoint: "三角學初步",
    accent: "#1f8378",
    categories: [
      { name: "數與代數", topics: ["指數定律（負指數及零指數）", "根式與實數系統", "一元一次不等式", "百分率（二）：複利息、折舊、稅務及增長問題"] },
      { name: "圖形與空間", topics: ["三角學初步（正弦 sin、餘弦 cos、正切 tan、仰角與俯角、方位角）", "面積與體積（三）：球體的表面積和體積、相似立體的體積比", "坐標幾何（二）：直線的斜率、平行線與垂直線的斜率關係", "三角形的幾何特性（內心、外心、重心、垂心）"] },
      { name: "數據處理", topics: ["集中趨勢的量度（平均數、中位數、眾數、加權平均數）", "概率初步（理論概率、經驗概率）"] },
    ],
  },
];

const categoryIcons = [BookOpen, Compass, LineChart, Dices, CircleHelp];
const starPractices: StarPractice[] = [
  { key: "p1-add", grade: "P1", title: "加法", detail: "加多啲", href: "/practice/p1-add-subtract?mode=add", accent: "#f05a3c" },
  { key: "p1-subtract", grade: "P1", title: "減法", detail: "拿走", href: "/practice/p1-add-subtract?mode=subtract", accent: "#f05a3c" },
  { key: "p1-mixed", grade: "P1", title: "加減", detail: "一齊做", href: "/practice/p1-add-subtract?mode=mixed", accent: "#f05a3c" },
  { key: "p1-counting", grade: "P1", title: "20 以內的數", detail: "數數配對", href: "/practice/p1-counting", accent: "#f05a3c" },
  { key: "p1-numbers", grade: "P1", title: "100 以內的數", detail: "十和一", href: "/practice/p1-numbers", accent: "#f05a3c" },
  { key: "p1-time", grade: "P1", title: "時間與鐘面", detail: "撥指針", href: "/practice/p1-time", accent: "#f05a3c" },
  { key: "p1-number-line", grade: "P1", title: "順數與倒數", detail: "青蛙跳", href: "/practice/p1-number-line", accent: "#f05a3c" },
  { key: "p1-measure", grade: "P1", title: "長度與距離", detail: "拖尺子", href: "/practice/p1-measure", accent: "#f05a3c" },
  { key: "p1-length-compare", grade: "P1", title: "較長與較短", detail: "比長短", href: "/practice/p1-length-compare", accent: "#f05a3c" },
  { key: "p1-shapes", grade: "P1", title: "平面圖形", detail: "拖圖形", href: "/practice/p1-shapes", accent: "#f05a3c" },
  { key: "p1-solids", grade: "P1", title: "立體圖形", detail: "分類物件", href: "/practice/p1-solids", accent: "#f05a3c" },
  { key: "p1-shape-rotation", grade: "P1", title: "旋轉圖形", detail: "轉一轉", href: "/practice/p1-shape-rotation", accent: "#f05a3c" },
  { key: "p1-length-sort", grade: "P1", title: "長度排序", detail: "由短到長", href: "/practice/p1-length-sort", accent: "#f05a3c" },
  { key: "p1-calendar", grade: "P1", title: "星期與日曆", detail: "排星期", href: "/practice/p1-calendar", accent: "#f05a3c" },
  { key: "p1-lines", grade: "P1", title: "直線與曲線", detail: "描一描", href: "/practice/p1-lines", accent: "#f05a3c" },
  { key: "p1-pictograph", grade: "P1", title: "象形圖", detail: "看圖數", href: "/practice/p1-pictograph", accent: "#f05a3c" },
  { key: "p2-numbers", grade: "P2", title: "三位數", detail: "百十個位", href: "/practice/p2-numbers", accent: "#c8811e" },
  { key: "p2-number-line", grade: "P2", title: "數線比較", detail: "比大小", href: "/practice/p2-numbers-compare", accent: "#c8811e" },
  { key: "p2-money", grade: "P2", title: "港幣找錢", detail: "日常交易", href: "/practice/p2-money", accent: "#c8811e" },
  { key: "p2-time", grade: "P2", title: "時分秒", detail: "撥三支針", href: "/practice/p2-time", accent: "#c8811e" },
  { key: "p2-multiply-visual", grade: "P2", title: "九九乘法", detail: "陣列分組", href: "/practice/p2-multiply-visual", accent: "#c8811e" },
  { key: "p2-money-coins", grade: "P2", title: "硬幣組合", detail: "湊出金額", href: "/practice/p2-money-coins", accent: "#c8811e" },
  { key: "p2-directions", grade: "P2", title: "方向位置", detail: "校園地圖", href: "/practice/p2-directions", accent: "#c8811e" },
  { key: "p2-division", grade: "P2", title: "除法分一分", detail: "平均分配", href: "/practice/p2-division", accent: "#c8811e" },
  { key: "p2-direction-route", grade: "P2", title: "方向路徑", detail: "左轉右轉", href: "/practice/p2-direction-route", accent: "#c8811e" },
  { key: "p2-array-builder", grade: "P2", title: "乘法排陣", detail: "拖曳圖形", href: "/practice/p2-array-builder", accent: "#c8811e" },
  { key: "p2-measure", grade: "P2", title: "米與厘米", detail: "虛擬直尺", href: "/practice/p2-measure", accent: "#c8811e" },
  { key: "p2-angles", grade: "P2", title: "角度分類", detail: "直銳鈍角", href: "/practice/p2-angles", accent: "#c8811e" },
  { key: "p2-division-remainder", grade: "P2", title: "有餘數", detail: "生活分配", href: "/practice/p2-division-remainder", accent: "#c8811e" },
  { key: "p2-quadrilaterals", grade: "P2", title: "四邊形", detail: "特性配對", href: "/practice/p2-quadrilaterals", accent: "#c8811e" },
  { key: "p2-pictograph-multiple", grade: "P2", title: "象形圖進階", detail: "圖例 2、5、10", href: "/practice/p2-pictograph-multiple", accent: "#c8811e" },
  { key: "p2-meter-centimeter", grade: "P2", title: "米厘米換算", detail: "1 米＝100 厘米", href: "/practice/p2-meter-centimeter", accent: "#c8811e" },
  { key: "p2-fractions-basic", grade: "P2", title: "分數初步", detail: "一半、四分一", href: "/practice/p2-fractions-basic", accent: "#c8811e" },
  { key: "p3-weight", grade: "P3", title: "克與公斤", detail: "虛擬天平", href: "/practice/p3-weight", accent: "#4f6eae" },
  { key: "p3-capacity", grade: "P3", title: "升與毫升", detail: "拖曳倒水", href: "/practice/p3-capacity", accent: "#4f6eae" },
  { key: "p3-24hour", grade: "P3", title: "24小時制", detail: "時間轉換", href: "/practice/p3-24hour", accent: "#4f6eae" },
  { key: "p3-weight-builder", grade: "P3", title: "法碼湊重", detail: "多個法碼", href: "/practice/p3-weight-builder", accent: "#4f6eae" },
  { key: "p3-large-numbers", grade: "P3", title: "四五位數", detail: "位值挑戰", href: "/practice/p3-large-numbers", accent: "#4f6eae" },
  { key: "p3-charts", grade: "P3", title: "統計圖表", detail: "方塊圖棒形圖", href: "/practice/p3-charts", accent: "#4f6eae" },
  { key: "p3-parallel-perpendicular", grade: "P3", title: "平行與垂直", detail: "找線條", href: "/practice/p3-parallel-perpendicular", accent: "#4f6eae" },
  { key: "p3-perimeter-area", grade: "P3", title: "周界與面積", detail: "方格紙", href: "/practice/p3-perimeter-area", accent: "#4f6eae" },
  { key: "p3-mixed-stories", grade: "P3", title: "混合生活題", detail: "列算式", href: "/practice/p3-mixed-stories", accent: "#4f6eae" },
  { key: "p3-shopping-measure", grade: "P3", title: "超市量度", detail: "重量容量", href: "/practice/p3-shopping-measure", accent: "#4f6eae" },
  { key: "p4-decimals-line", grade: "P4", title: "小數初步", detail: "數線港幣", href: "/practice/p4-decimals-line", accent: "#6c8b4c" },
  { key: "p4-triangles", grade: "P4", title: "三角形分類", detail: "等邊等腰直角", href: "/practice/p4-triangles", accent: "#6c8b4c" },
  { key: "p4-eight-directions", grade: "P4", title: "八方向", detail: "地圖任務", href: "/practice/p4-eight-directions", accent: "#6c8b4c" },
  { key: "p4-quadrilateral-map", grade: "P4", title: "四邊形關係", detail: "分類地圖", href: "/practice/p4-quadrilateral-map", accent: "#6c8b4c" },
  { key: "p4-bar-chart", grade: "P4", title: "棒形圖", detail: "倍數刻度", href: "/practice/p4-bar-chart", accent: "#6c8b4c" },
  { key: "p4-decimal-shopping", grade: "P4", title: "小數購物", detail: "生活加減", href: "/practice/p4-decimal-shopping", accent: "#6c8b4c" },
  { key: "p4-route-planning", grade: "P4", title: "方向路線", detail: "進階規劃", href: "/practice/p4-route-planning", accent: "#6c8b4c" },
  { key: "p4-bar-compare", grade: "P4", title: "棒形圖比較", detail: "兩組資料", href: "/practice/p4-bar-compare", accent: "#6c8b4c" },
  { key: "p5-fraction-visual", grade: "P5", title: "分數乘除", detail: "圖形模型", href: "/practice/p5-fraction-visual", accent: "#b85b7d" },
  { key: "p5-decimal-life", grade: "P5", title: "小數生活題", detail: "購物量度", href: "/practice/p5-decimal-life", accent: "#b85b7d" },
  { key: "p5-volume-build", grade: "P5", title: "體積積木", detail: "立方厘米", href: "/practice/p5-volume-build", accent: "#b85b7d" },
  { key: "p5-fraction-add", grade: "P5", title: "異分母分數", detail: "配對分母", href: "/practice/p5-fraction-add", accent: "#7c6cb0" },
  { key: "p5-area", grade: "P5", title: "面積小工房", detail: "三角形梯形", href: "/practice/p5-area", accent: "#7c6cb0" },
  { key: "p5-geometry-data", grade: "P5", title: "圖形與數據", detail: "平均數", href: "/practice/p5-geometry-data", accent: "#7c6cb0" },
  { key: "p5-volume-units", grade: "P5", title: "體積換算", detail: "cm³ m³", href: "/practice/p5-volume-units", accent: "#4f6eae" },
  { key: "p5-decimal-carry", grade: "P5", title: "進位與借位", detail: "直式小數", href: "/practice/p5-decimal-carry", accent: "#7c6cb0" },
  { key: "p5-polygons", grade: "P5", title: "多邊形變換", detail: "旋轉對稱", href: "/practice/p5-polygons", accent: "#6c8b4c" },
  { key: "p5-data-insights", grade: "P5", title: "數據判讀", detail: "平均升跌", href: "/practice/p5-data-insights", accent: "#6c8b4c" },
  { key: "p5-area-puzzle", grade: "P5", title: "面積拼圖", detail: "公式推導", href: "/practice/p5-area-puzzle", accent: "#6c8b4c" },
  { key: "p5-volume-life", grade: "P5", title: "體積生活題", detail: "水箱包裝箱", href: "/practice/p5-volume-life", accent: "#4f6eae" },
  { key: "p6-convert", grade: "P6", title: "百分轉換", detail: "分小百", href: "/practice/p6-convert", accent: "#6c8b4c" },
  { key: "p6-measure-rate", grade: "P6", title: "圓與速率", detail: "生活量度", href: "/practice/p6-measure-rate", accent: "#6c8b4c" },
  { key: "p6-geometry", grade: "P6", title: "坐標立體", detail: "截面摺紙", href: "/practice/p6-geometry", accent: "#6c8b4c" },
  { key: "p6-data-equation", grade: "P6", title: "數據方程", detail: "圓圖方程", href: "/practice/p6-data-equation", accent: "#6c8b4c" },
  { key: "p2-multiply", grade: "P2", title: "乘法", detail: "幾組幾個", href: "/practice/p2-multiplication?mode=multiply", accent: "#c8811e" },
  { key: "p2-divide", grade: "P2", title: "除法", detail: "平均分", href: "/practice/p2-multiplication?mode=divide", accent: "#c8811e" },
  { key: "p2-mixed", grade: "P2", title: "混合運算", detail: "先乘除", href: "/practice/p2-multiplication?mode=mixed", accent: "#c8811e" },
  { key: "p3-level-1", grade: "P3", title: "第一關", detail: "先乘除", href: "/practice/p3-mixed-operations?level=1", accent: "#4f6eae" },
  { key: "p3-level-2", grade: "P3", title: "第二關", detail: "兩步算", href: "/practice/p3-mixed-operations?level=2", accent: "#4f6eae" },
  { key: "p3-level-3", grade: "P3", title: "第三關", detail: "過大關", href: "/practice/p3-mixed-operations?level=3", accent: "#4f6eae" },
];

export default function Home() {
  const [activeStage, setActiveStage] = useState<Stage>("primary");
  const [selectedGrade, setSelectedGrade] = useState("P1");
  const [menuOpen, setMenuOpen] = useState(false);
  const [completedPractices, setCompletedPractices] = useState<string[]>([]);
  const [resetOpen, setResetOpen] = useState(false);
  const [dailyProgress, setDailyProgress] = useState<DailyPracticeProgress>(() => getDailyPracticeProgress());
  const [targetOpen, setTargetOpen] = useState(false);
  const [pendingTarget, setPendingTarget] = useState(() => getDailyPracticeProgress().target);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const syncCompletion = () => setCompletedPractices(getCompletedPractices());
    syncCompletion();
    window.addEventListener(PRACTICE_COMPLETION_EVENT, syncCompletion);
    return () => window.removeEventListener(PRACTICE_COMPLETION_EVENT, syncCompletion);
  }, []);

  useEffect(() => {
    const syncDailyProgress = () => setDailyProgress(getDailyPracticeProgress());
    syncDailyProgress();
    window.addEventListener(DAILY_PROGRESS_EVENT, syncDailyProgress);
    return () => window.removeEventListener(DAILY_PROGRESS_EVENT, syncDailyProgress);
  }, []);

  const visibleCourses = useMemo(
    () => courses.filter((course) => course.stage === activeStage),
    [activeStage],
  );
  const course = courses.find((item) => item.grade === selectedGrade) ?? courses[0];
  const topicCount = course.categories.reduce((total, category) => total + category.topics.length, 0);
  const routeStations = starPractices.filter((practice) => practice.grade === course.grade);
  const nextStarPractice = useMemo(() => starPractices.find((practice) => !completedPractices.includes(practice.key)) ?? null, [completedPractices]);
  const isGradeCompleted = (grade: string) => {
    if (grade === "P1") return ["p1-add-subtract", "p1-counting", "p1-numbers", "p1-time", "p1-number-line", "p1-measure", "p1-length-compare", "p1-shapes", "p1-solids", "p1-shape-rotation", "p1-length-sort", "p1-calendar", "p1-lines", "p1-pictograph"].some((id) => completedPractices.includes(id));
    if (grade === "P2") return ["p2-numbers", "p2-number-line", "p2-money", "p2-time", "p2-multiply-visual", "p2-money-coins", "p2-directions", "p2-division", "p2-direction-route", "p2-array-builder", "p2-measure", "p2-angles", "p2-division-remainder", "p2-quadrilaterals", "p2-pictograph-multiple", "p2-meter-centimeter", "p2-multiply", "p2-divide", "p2-mixed"].some((id) => completedPractices.includes(id));
    if (grade === "P3") return ["p3-weight", "p3-capacity", "p3-24hour", "p3-weight-builder", "p3-level-1", "p3-level-2", "p3-level-3"].some((id) => completedPractices.includes(id));
    if (grade === "P4") return ["p4-fractions", "p4-decimals", "p4-convert", "p4-factors", "p4-measure", "p4-polygon-area"].some((id) => completedPractices.includes(id));
    if (grade === "P5") return ["p5-fraction-multiply-divide", "p5-decimal-operations", "p5-unlike-fractions", "p5-volume"].some((id) => completedPractices.includes(id));
    if (grade === "P6") return ["p6-discount", "p6-profit"].some((id) => completedPractices.includes(id));
    return false;
  };
  const courseCompleted = isGradeCompleted(course.grade);
  const courseCompletionLabel = course.grade === "P1" ? `${["p1-add-subtract", "p1-counting", "p1-numbers", "p1-time", "p1-number-line", "p1-measure", "p1-length-compare", "p1-shapes", "p1-solids", "p1-shape-rotation", "p1-length-sort", "p1-calendar", "p1-lines", "p1-pictograph"].filter((id) => completedPractices.includes(id)).length}/14 題型完成` : course.grade === "P2" ? `${["p2-numbers", "p2-number-line", "p2-money", "p2-time", "p2-multiply-visual", "p2-money-coins", "p2-directions", "p2-division", "p2-direction-route", "p2-array-builder", "p2-measure", "p2-angles", "p2-division-remainder", "p2-quadrilaterals", "p2-pictograph-multiple", "p2-meter-centimeter", "p2-multiply", "p2-divide", "p2-mixed"].filter((id) => completedPractices.includes(id)).length}/19 題型完成` : course.grade === "P3" ? `已完成 ${["p3-level-1", "p3-level-2", "p3-level-3"].filter((id) => completedPractices.includes(id)).length}/3 關` : course.grade === "P4" ? `${["p4-fractions", "p4-decimals", "p4-convert", "p4-factors", "p4-measure", "p4-polygon-area"].filter((id) => completedPractices.includes(id)).length}/6 題型完成` : course.grade === "P5" ? `${["p5-fraction-multiply-divide", "p5-decimal-operations", "p5-unlike-fractions", "p5-volume"].filter((id) => completedPractices.includes(id)).length}/4 題型完成` : course.grade === "P6" ? `${["p6-discount", "p6-profit"].filter((id) => completedPractices.includes(id)).length}/2 題型完成` : "練習已完成";

  const selectStage = (stage: Stage) => {
    setActiveStage(stage);
    setSelectedGrade(stage === "primary" ? "P1" : "S1");
  };

  const resetProgress = () => {
    resetPracticeProgress();
    setCompletedPractices([]);
    setDailyProgress(getDailyPracticeProgress());
    setResetOpen(false);
    toast.success("學習進度已重設", { description: "你可以隨時重新挑戰每一個學習站。" });
  };

  const saveDailyTarget = () => {
    const updated = setDailyPracticeTarget(pendingTarget);
    setDailyProgress(updated);
    setTargetOpen(false);
    toast.success("每日目標已更新", { description: `今天完成 ${updated.target} 個練習站，即可獲得打卡印章。` });
  };

  const notifyComingSoon = (label: string) => {
    toast.message(`${label}將在題目系統完成後開放`, {
      description: "現階段先讓你確認學習路徑與頁面設計。",
    });
  };

  return (
    <div className="mq-app min-h-screen overflow-x-clip bg-[#f8f5ed] text-[#172b3f]">
      <header className="mq-header sticky top-0 z-50 border-b border-[#172b3f]/10 bg-[#f8f5ed]/92 backdrop-blur-xl dark:border-white/10 dark:bg-[#111c28]/92">
          <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 lg:px-8">
          <a href="#top" className="group flex items-center gap-3" aria-label="Maths Quest 首頁">
            <span className="grid size-11 place-items-center rounded-[15px] bg-[#f05a3c] shadow-[0_7px_0_#c84932] transition-transform duration-200 group-hover:-translate-y-0.5">
              <img src="/manus-storage/maths-quest-logo_cf7e4a6a.png" alt="" className="size-7 brightness-0 invert" />
            </span>
            <span className="leading-none">
              <strong className="block text-[17px] font-extrabold tracking-[-0.04em]">Maths Quest</strong>
              <small className="mt-1 block font-mono text-[10px] font-bold tracking-[0.16em] text-[#f05a3c]">數學操題地圖</small>
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-bold lg:flex" aria-label="主要導覽">
            <a href="#path" className="transition-colors hover:text-[#f05a3c]">學習路徑</a>
            <a href="#curriculum" className="transition-colors hover:text-[#f05a3c]">課程地圖</a>
            <button onClick={() => notifyComingSoon("我的進度")} className="transition-colors hover:text-[#f05a3c]">我的進度</button>
            <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
              <AlertDialogTrigger asChild><button className="transition-colors hover:text-[#f05a3c]">重設進度</button></AlertDialogTrigger>
              <AlertDialogContent className="border-[#172b3f]/15 bg-[#fffdf8] text-[#172b3f] dark:border-white/15 dark:bg-[#172737] dark:text-white">
                <AlertDialogHeader><AlertDialogTitle className="font-black">要重設學習進度嗎？</AlertDialogTitle><AlertDialogDescription className="leading-6 dark:text-[#b7c8ce]">這會清除本機的完成徽章與錯題重溫紀錄，讓你可由第一個學習站重新挑戰。此操作無法復原。</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>保留目前進度</AlertDialogCancel><AlertDialogAction onClick={resetProgress} className="bg-[#f05a3c] text-white hover:bg-[#d84a34]">清除並重新開始</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="mq-theme-switch grid size-10 place-items-center rounded-full border border-[#172b3f]/15 bg-white/70 text-[#172b3f] transition hover:-translate-y-0.5 hover:border-[#f05a3c] hover:text-[#f05a3c] dark:border-white/15 dark:bg-white/10 dark:text-white" aria-label={theme === "light" ? "切換至深色模式" : "切換至淺色模式"} title={theme === "light" ? "深色模式" : "淺色模式"}>
              {theme === "light" ? <Moon className="size-[17px]" /> : <Sun className="size-[18px]" />}
            </button>
            <button onClick={() => notifyComingSoon("登入功能")} className="hidden text-sm font-bold text-[#172b3f] transition-colors hover:text-[#f05a3c] dark:text-white sm:block">登入</button>
            <button onClick={() => notifyComingSoon("開始練習")} className="mq-start hidden items-center gap-2 rounded-full bg-[#f05a3c] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_0_#c84932] transition duration-200 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none sm:flex">
              開始練習 <ArrowRight className="size-4" />
            </button>
            <button onClick={() => setMenuOpen((open) => !open)} className="grid size-10 place-items-center rounded-full border border-[#172b3f]/15 lg:hidden" aria-label="開啟選單" aria-expanded={menuOpen}>
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="border-t border-[#172b3f]/10 bg-[#f8f5ed] px-5 py-5 lg:hidden" aria-label="流動版主要導覽">
            <div className="mx-auto grid max-w-[1280px] gap-2 text-sm font-bold">
              <a onClick={() => setMenuOpen(false)} href="#path" className="rounded-xl px-3 py-3 hover:bg-white">學習路徑</a>
              <a onClick={() => setMenuOpen(false)} href="#curriculum" className="rounded-xl px-3 py-3 hover:bg-white">課程地圖</a>
              <button onClick={() => notifyComingSoon("登入功能")} className="rounded-xl px-3 py-3 text-left hover:bg-white">登入</button>
              <button onClick={() => { setMenuOpen(false); setResetOpen(true); }} className="rounded-xl px-3 py-3 text-left text-[#f05a3c] hover:bg-white">重設進度</button>
            </div>
          </nav>
        )}
      </header>

      <main id="top">
        <section className="mq-hero relative border-b border-[#172b3f]/10">
          <div className="hero-grid pointer-events-none absolute inset-0 opacity-80" />
          <div className="relative mx-auto grid min-h-[560px] max-w-[1280px] items-center gap-8 px-5 py-14 lg:grid-cols-[0.94fr_1.06fr] lg:px-8 lg:py-16">
            <div className="relative z-10 max-w-[650px]">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 bg-white/70 px-3 py-1.5 text-xs font-bold text-[#41566e] shadow-sm">
                <span className="size-2 rounded-full bg-[#f05a3c]" />
                為香港 P1–S3 學生設計
              </div>
              <p className="font-mono text-xs font-bold tracking-[0.18em] text-[#f05a3c]">YOUR LEARNING TRAIL — 01</p>
              <h1 className="mt-4 text-balance text-[clamp(2.8rem,6vw,5.5rem)] font-black leading-[0.94] tracking-[-0.075em] text-[#172b3f]">
                選一個主題，<br />
                <span className="relative inline-block text-[#f05a3c]">解開下一題。</span>
              </h1>
              <p className="mt-7 max-w-[510px] text-[17px] leading-8 text-[#53677d]">由基礎數感到三角學，把你的年級、主題和下一個練習站連起來。每次練習，都是一次更清楚的理解。</p>
              <div className="mq-daily-goal mt-6 max-w-[510px]" aria-live="polite">
                <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] font-bold tracking-[0.14em] text-[#f05a3c]">DAILY QUEST</p><p className="mt-1 text-sm font-extrabold">{dailyProgress.reachedGoal ? "今日目標已完成，太好了！" : `今天完成 ${dailyProgress.target} 個練習站`}</p></div><div className="flex items-center gap-2"><AlertDialog open={targetOpen} onOpenChange={setTargetOpen}><AlertDialogTrigger asChild><button onClick={() => setPendingTarget(dailyProgress.target)} className="mq-target-edit inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 font-mono text-[10px] font-bold" aria-label="設定每日練習目標"><Target className="size-3" /> 設定</button></AlertDialogTrigger><AlertDialogContent className="border-[#172b3f]/15 bg-[#fffdf8] text-[#172b3f] dark:border-white/15 dark:bg-[#172737] dark:text-white"><AlertDialogHeader><AlertDialogTitle className="font-black">設定每日練習目標</AlertDialogTitle><AlertDialogDescription className="leading-6 dark:text-[#b7c8ce]">選擇每天想完成的練習站數量。設定只保存在這部裝置，可隨時再調整。</AlertDialogDescription></AlertDialogHeader><div className="grid grid-cols-3 gap-3 py-2">{[1, 2, 3, 4, 5, 6].map((value) => <button key={value} onClick={() => setPendingTarget(value)} className={`mq-target-choice rounded-xl border px-3 py-3 text-left ${pendingTarget === value ? "border-[#f05a3c] bg-[#fff0e9] text-[#f05a3c] dark:bg-[#3a2f2b]" : "border-[#172b3f]/12 dark:border-white/15"}`}><strong className="block text-lg font-black">{value}</strong><small className="font-bold">個練習站</small></button>)}</div><AlertDialogFooter><AlertDialogCancel>暫不更改</AlertDialogCancel><AlertDialogAction onClick={saveDailyTarget} className="bg-[#f05a3c] text-white hover:bg-[#d84a34]">儲存目標</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog><div className="mq-streak"><Sparkles className="size-4" /><span>{dailyProgress.streak}</span><small>天</small></div></div></div>
                <div className="mt-4 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-[#172b3f]/10"><div className="h-full rounded-full bg-[#f05a3c] transition-[width] duration-500" style={{ width: `${Math.min(100, (dailyProgress.completed / dailyProgress.target) * 100)}%` }} /></div><span className="font-mono text-xs font-black text-[#f05a3c]">{dailyProgress.completed}/{dailyProgress.target}</span></div>
                <p className="mt-3 text-xs font-bold text-[#617286]">{dailyProgress.streak > 0 ? `已連續打卡 ${dailyProgress.streak} 天${dailyProgress.reachedGoal ? " · 獲得今日探險印章" : " · 完成目標可獲今日印章"}` : "完成第一個練習站，即可開始你的打卡紀錄。"}</p>
              </div>
              {nextStarPractice ? <Link href={nextStarPractice.href} className="mq-next-star mt-4 flex max-w-[510px] items-center gap-3 rounded-2xl p-3 transition hover:-translate-y-0.5" style={{ "--station-accent": nextStarPractice.accent } as CSSProperties}>
                <span className="mq-next-star-mark"><Star className="size-5 fill-current" /></span><span className="min-w-0 flex-1"><span className="block font-mono text-[10px] font-bold tracking-[0.13em]">NEXT STAR</span><strong className="mt-0.5 block text-sm">下一顆星：{nextStarPractice.grade} {nextStarPractice.title}</strong><small>{nextStarPractice.detail} · 完成就有星星</small></span><ArrowRight className="size-5 shrink-0" /></Link> : <div className="mq-next-star mt-4 flex max-w-[510px] items-center gap-3 rounded-2xl p-3"><span className="mq-next-star-mark"><Star className="size-5 fill-current" /></span><span><strong className="block text-sm">全部星星已收集！</strong><small>再做一次，也能繼續變厲害。</small></span></div>}
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#path" className="group inline-flex items-center gap-2 rounded-full bg-[#f05a3c] px-6 py-4 text-sm font-extrabold text-white shadow-[0_5px_0_#c84932] transition duration-200 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none">
                  探索我的年級 <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </a>
                <button onClick={() => notifyComingSoon("診斷練習")} className="inline-flex items-center gap-2 rounded-full border border-[#172b3f]/20 bg-white/75 px-6 py-4 text-sm font-extrabold transition hover:border-[#172b3f] hover:bg-white">
                  <Target className="size-4 text-[#0e8b87]" /> 先做診斷練習
                </button>
              </div>
              <div className="mt-12 flex items-center gap-6 text-xs font-bold text-[#53677d]">
                <span className="flex items-center gap-2"><Check className="size-4 text-[#0e8b87]" /> 按年級整理</span>
                <span className="flex items-center gap-2"><Check className="size-4 text-[#0e8b87]" /> 清楚主題路徑</span>
              </div>
            </div>
            <div className="relative min-h-[350px] lg:min-h-[460px]">
              <div className="absolute -right-[22%] -top-[17%] size-[460px] rounded-full border border-[#f05a3c]/20 lg:size-[640px]" />
              <div className="absolute bottom-[8%] left-[7%] z-10 rounded-2xl border border-white/60 bg-white/88 px-4 py-3 shadow-[0_15px_35px_rgba(23,43,63,0.12)] backdrop-blur-md">
                <p className="font-mono text-[10px] font-bold tracking-widest text-[#f05a3c]">NEXT STOP</p>
                <p className="mt-1 text-sm font-extrabold">今天，從一題開始。</p>
              </div>
              <img src="/manus-storage/maths-quest-hero_80a0a3df.png" alt="數學探險手帳風格的幾何與量度插畫" className="relative z-[1] mx-auto w-full max-w-[720px] drop-shadow-[0_24px_28px_rgba(23,43,63,0.14)]" />
            </div>
          </div>
        </section>

        <section id="path" className="mx-auto max-w-[1280px] px-5 py-16 lg:px-8 lg:py-20">
          <div className="mb-7 flex flex-col justify-between gap-5 border-b border-[#172b3f]/10 pb-7 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-xs font-bold tracking-[0.17em] text-[#f05a3c]">CHOOSE YOUR STATION — 02</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.055em] md:text-4xl">你的學習路徑，從年級開始。</h2>
            </div>
            <div className="inline-flex w-fit rounded-full bg-[#e8e3d9] p-1.5" aria-label="選擇學習階段">
              <button onClick={() => selectStage("primary")} className={`rounded-full px-4 py-2.5 text-sm font-extrabold transition ${activeStage === "primary" ? "bg-white text-[#172b3f] shadow-sm" : "text-[#617286] hover:text-[#172b3f]"}`}>小學 P1–P6</button>
              <button onClick={() => selectStage("secondary")} className={`rounded-full px-4 py-2.5 text-sm font-extrabold transition ${activeStage === "secondary" ? "bg-white text-[#172b3f] shadow-sm" : "text-[#617286] hover:text-[#172b3f]"}`}>初中 S1–S3</button>
            </div>
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-[126px_minmax(0,1fr)]">
            <aside className="mq-rail hidden lg:block">
              <div className="sticky top-24 rounded-2xl border border-[#172b3f]/10 bg-[#fffdf8] px-3 py-4 shadow-[0_8px_22px_rgba(23,43,63,0.05)]">
                <p className="font-mono text-[9px] font-bold tracking-[0.14em] text-[#f05a3c]">LEARNING<br />TRAIL</p>
                <div className="relative mt-4 space-y-1 before:absolute before:bottom-3 before:left-[14px] before:top-3 before:w-px before:bg-[#172b3f]/15">
                  {courses.map((item, index) => {
                    const selected = item.grade === selectedGrade;
                    return (
                      <button key={item.grade} onClick={() => { setActiveStage(item.stage); setSelectedGrade(item.grade); }} className={`relative flex w-full items-center gap-2 rounded-lg px-1 py-1.5 text-left transition ${selected ? "bg-[#fff0e9] text-[#172b3f]" : "text-[#617286] hover:bg-[#f8f5ed] hover:text-[#172b3f]"}`}>
                        <span className={`grid size-7 shrink-0 place-items-center rounded-full border-2 border-[#fffdf8] text-[9px] font-black text-white ${selected ? "shadow-[0_3px_0_rgba(0,0,0,0.12)]" : "opacity-60"}`} style={{ backgroundColor: item.accent }}>{index + 1}</span>
                        <span className="min-w-0"><strong className="block text-[10px] leading-none">{item.grade}</strong><small className="mt-0.5 block text-[9px] leading-none">{item.shortLabel}</small></span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>
            <div className="space-y-5">
            <div className="mq-stepper relative overflow-hidden rounded-[25px] border border-[#172b3f]/10 bg-white px-5 py-5 shadow-[0_10px_25px_rgba(23,43,63,0.05)] md:px-6">
              <div className="absolute -right-10 -top-14 size-40 rounded-full border-[18px] border-[#f05a3c]/10" />
              <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="shrink-0">
                  <div className="flex items-center gap-3">
                    <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-[#f05a3c]">GRADE TRAIL</p>
                    <span className="rounded-full bg-[#172b3f] px-2.5 py-1 font-mono text-[10px] font-bold text-white">{activeStage === "primary" ? "P1–P6" : "S1–S3"}</span>
                  </div>
                  <p className="mt-1 text-sm font-extrabold">點選一個年級，即時查看它的學習站點。</p>
                </div>
                <div className="-mx-1 overflow-x-auto pb-2 lg:pb-0">
                  <div className="relative flex min-w-max items-start gap-2 px-1 lg:gap-1">
                    <div className="absolute left-8 right-8 top-5 h-px bg-[#172b3f]/12" />
                    {visibleCourses.map((item, index) => {
                      const selected = item.grade === selectedGrade;
                      const completed = isGradeCompleted(item.grade);
                      return (
                        <button key={item.grade} onClick={() => setSelectedGrade(item.grade)} className={`relative z-10 flex min-w-[98px] flex-col items-center gap-1.5 rounded-2xl px-2 py-1.5 text-center transition duration-200 hover:-translate-y-0.5 ${selected ? "text-[#172b3f]" : "text-[#617286] hover:text-[#172b3f]"}`} aria-pressed={selected}>
                          <span className={`grid size-10 place-items-center rounded-full border-4 text-xs font-black transition ${selected ? "border-white text-white shadow-[0_5px_0_rgba(0,0,0,0.14)]" : "border-[#f8f5ed] bg-[#e8e3d9] text-[#617286]"}`} style={selected ? { backgroundColor: item.accent } : undefined}>{index + 1}</span>
                          <span className="text-xs font-extrabold leading-none">{item.shortLabel}</span>
                          <span className="font-mono text-[10px] font-bold opacity-65">{completed ? "已完成" : item.grade}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {activeStage === "primary" && <div className="mq-primary-start-grid grid gap-2 rounded-2xl border border-[#f05a3c]/20 bg-[#fff3e8] p-3 sm:grid-cols-3" aria-label="小學生三步開始">
              <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2"><span className="grid size-6 place-items-center rounded-full bg-[#f05a3c] font-mono text-[10px] font-black text-white">1</span><strong className="text-sm">選年級</strong></div>
              <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2"><span className="grid size-6 place-items-center rounded-full bg-[#172b3f] font-mono text-[10px] font-black text-white">2</span><strong className="text-sm">按紅色開始</strong></div>
              <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2"><span className="grid size-6 place-items-center rounded-full bg-[#172b3f] font-mono text-[10px] font-black text-white">3</span><strong className="text-sm">做 8 題</strong></div>
            </div>}

            <div className="mq-course rounded-[28px] border border-[#172b3f]/10 bg-white p-5 shadow-[0_12px_30px_rgba(23,43,63,0.06)] md:p-7">
              <div className="flex flex-col gap-5 border-b border-[#172b3f]/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="grid size-14 place-items-center rounded-2xl text-xl font-black text-white shadow-[0_5px_0_rgba(0,0,0,0.15)]" style={{ backgroundColor: course.accent }}>{course.grade}</div>
                  <div>
                    <p className="font-mono text-[11px] font-bold tracking-[0.16em]" style={{ color: course.accent }}>{course.shortLabel.toUpperCase()} LEARNING MAP</p>
                    <h3 className="mt-1 text-2xl font-black tracking-[-0.045em]">{course.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#617286]">{course.stage === "primary" ? "選好年級後，按紅色按鈕開始做題。" : `共 ${topicCount} 個課程焦點 · 從最常用的核心概念開始整理。`}</p>
                    {courseCompleted && <span className="mq-completion-badge mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-bold"><Check className="size-3" /> {courseCompletionLabel}</span>}
                  </div>
                </div>
                {course.stage !== "primary" && (course.grade === "P1" ? (
                  <div className="flex flex-wrap justify-end gap-2"><Link href="/practice/p1-add-subtract" className="mq-start inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#f05a3c] px-5 py-3 text-sm font-extrabold text-white shadow-[0_4px_0_#c84932] transition hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"><Play className="size-4 fill-current" /> 20 以內加減</Link><Link href="/practice/p1-counting" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-4 py-3 text-sm font-extrabold dark:border-white/15">20 以內的數</Link><Link href="/practice/p1-numbers" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-4 py-3 text-sm font-extrabold dark:border-white/15">100 以內的數</Link><Link href="/practice/p1-calendar" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-4 py-3 text-sm font-extrabold dark:border-white/15">星期日曆</Link><Link href="/practice/p1-lines" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-4 py-3 text-sm font-extrabold dark:border-white/15">直線曲線</Link><Link href="/practice/p1-pictograph" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-4 py-3 text-sm font-extrabold dark:border-white/15">象形圖</Link></div>
                ) : course.grade === "P2" ? (
                  <div className="flex flex-wrap justify-end gap-2"><Link href="/practice/p2-numbers" className="mq-start inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#f05a3c] px-5 py-3 text-sm font-extrabold text-white shadow-[0_4px_0_#c84932] transition hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"><Play className="size-4 fill-current" /> 三位數</Link><Link href="/practice/p2-multiply-visual" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-4 py-3 text-sm font-extrabold dark:border-white/15">九九乘法</Link><Link href="/practice/p2-division" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-4 py-3 text-sm font-extrabold dark:border-white/15">除法分一分</Link><Link href="/practice/p2-division-remainder" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-4 py-3 text-sm font-extrabold dark:border-white/15">有餘數</Link><Link href="/practice/p2-measure" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-4 py-3 text-sm font-extrabold dark:border-white/15">米與厘米</Link><Link href="/practice/p2-angles" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-4 py-3 text-sm font-extrabold dark:border-white/15">角度分類</Link><Link href="/practice/p2-money" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-4 py-3 text-sm font-extrabold dark:border-white/15">港幣找錢</Link><Link href="/practice/p2-directions" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-4 py-3 text-sm font-extrabold dark:border-white/15">校園方向</Link></div>
                ) : course.grade === "P3" ? (
                  <Link href="/practice/p3-mixed-operations" className="mq-start inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#f05a3c] px-5 py-3 text-sm font-extrabold text-white shadow-[0_4px_0_#c84932] transition hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"><Play className="size-4 fill-current" /> 開始 P3 練習</Link>
                ) : course.grade === "P4" ? (
                  <div className="flex flex-wrap justify-end gap-2"><Link href="/practice/p4-fractions-decimals" className="mq-start inline-flex items-center justify-center gap-2 rounded-full bg-[#f05a3c] px-4 py-3 text-sm font-extrabold text-white shadow-[0_4px_0_#c84932] transition"><Play className="size-4 fill-current" /> 分數小數</Link><Link href="/practice/p4-factors-multiples" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-4 py-3 text-sm font-extrabold dark:border-white/15">因數倍數</Link><Link href="/practice/p4-perimeter-area" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-4 py-3 text-sm font-extrabold dark:border-white/15">周界面積</Link><Link href="/practice/p4-polygon-area" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-4 py-3 text-sm font-extrabold dark:border-white/15">多邊形面積</Link></div>
                ) : course.grade === "P5" ? (
                  <div className="flex flex-wrap justify-end gap-2"><Link href="/practice/p5-fractions" className="mq-start inline-flex items-center justify-center gap-2 rounded-full bg-[#f05a3c] px-4 py-3 text-sm font-extrabold text-white shadow-[0_4px_0_#c84932] transition"><Play className="size-4 fill-current" /> 分數乘除</Link><Link href="/practice/p5-decimals" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-4 py-3 text-sm font-extrabold dark:border-white/15">小數四則</Link><Link href="/practice/p5-unlike-fractions" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-4 py-3 text-sm font-extrabold dark:border-white/15">異分母加減</Link><Link href="/practice/p5-volume" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-4 py-3 text-sm font-extrabold dark:border-white/15">體積計算</Link></div>
                ) : course.grade === "P6" ? (
                  <div className="flex flex-wrap justify-end gap-2"><Link href="/practice/p6-discount" className="mq-start inline-flex items-center justify-center gap-2 rounded-full bg-[#f05a3c] px-4 py-3 text-sm font-extrabold text-white shadow-[0_4px_0_#c84932] transition"><Play className="size-4 fill-current" /> 百分折扣</Link><Link href="/practice/p6-profit" className="mq-library-return inline-flex items-center gap-2 rounded-full border border-[#172b3f]/15 px-4 py-3 text-sm font-extrabold dark:border-white/15">利潤應用</Link></div>
                ) : (
                  <button onClick={() => notifyComingSoon(`${course.shortLabel}練習`)} className="mq-start inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#f05a3c] px-5 py-3 text-sm font-extrabold text-white shadow-[0_4px_0_#c84932] transition hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"><Play className="size-4 fill-current" /> 開始 {course.grade} 練習</button>
                ))}
              </div>

              {course.stage === "primary" && <section className="mt-6 border-y border-[#172b3f]/10 bg-[#fffdf8] py-5" aria-label="Recommended Route"><div className="grid gap-5 lg:grid-cols-[.78fr_1.22fr] lg:items-center"><div className="flex items-start gap-4"><span className="grid size-[84px] shrink-0 place-items-center rounded-[28px] text-3xl font-black text-white shadow-[0_7px_0_rgba(0,0,0,.13)]" style={{ backgroundColor: course.accent }}>{course.grade}</span><div><p className="font-mono text-[12px] font-bold tracking-[.18em]" style={{ color: course.accent }}>{course.shortLabel} — LEARNING MAP</p><h4 className="mt-2 text-3xl font-black leading-tight tracking-[-.055em]">{course.title}</h4><p className="mt-3 max-w-sm text-sm leading-6 text-[#617286]">選好年級後，按紅色卡開始做題。</p></div></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{routeStations.map((station, stationIndex) => { const done = completedPractices.includes(station.key); const recommended = !done && routeStations.slice(0, stationIndex).every((prior) => completedPractices.includes(prior.key)); const symbol = station.title.includes("加") ? "＋" : station.title.includes("減") ? "−" : station.title.includes("分數") ? "½" : station.title.includes("小數") ? ".5" : station.title.includes("體積") ? "▦" : station.title.includes("面積") ? "▱" : station.title.includes("圖") ? "⌁" : station.title.includes("時間") ? "◷" : station.title.includes("錢") || station.title.includes("港") ? "$" : station.title.includes("方向") ? "↗" : station.title.includes("形") ? "△" : station.title.includes("量") ? "▥" : station.title.includes("數") ? "123" : "✦"; return <Link key={station.key} href={station.href} className={`group relative flex min-h-[76px] items-center gap-3 rounded-xl border-2 px-3 text-left transition ${recommended ? "border-[#f05a3c] bg-[#f05a3c] text-white shadow-[0_5px_0_#c84932]" : done ? "border-[#0e8b87]/35 bg-[#e8f5f2] text-[#0e8b87]" : "border-[#172b3f]/15 bg-white text-[#172b3f] hover:border-[#f05a3c]"}`}><span className={`grid size-11 shrink-0 place-items-center rounded-lg font-mono text-lg font-black ${recommended ? "bg-white/20 text-white" : "bg-[#fff0e9] text-[#f05a3c]"}`}>{recommended ? <Play className="size-4 fill-current" /> : done ? "✓" : symbol}</span><span><strong className="block text-sm font-black leading-tight">{station.title}</strong><small className={`mt-1 block font-mono text-[9px] font-bold tracking-[.08em] ${recommended ? "text-white/80" : "text-[#8390a0]"}`}>{recommended ? "NEXT · 開始" : done ? "完成" : "練習站"}</small></span></Link>; })}</div></div></section>}

              {false && course.grade === "P1" && <section className="mq-p1-recommended mt-6 rounded-2xl border border-[#f05a3c]/20 bg-[#fff7ef] p-4" aria-label="P1 推薦學習次序">
                <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-mono text-[10px] font-bold tracking-[.14em] text-[#f05a3c]">RECOMMENDED ROUTE</p><h4 className="mt-1 font-black">跟住這條路，一站一站學。</h4></div><span className="rounded-full bg-[#172b3f] px-2.5 py-1 font-mono text-[10px] font-bold text-white">P1 · 14 站</span></div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{[
                  { key: "p1-add-subtract", code: "01", icon: "＋", title: "20 以內加減", detail: "先練基本數感", href: "/practice/p1-add-subtract" },
                  { key: "p1-counting", code: "02", icon: "🔢", title: "20 以內的數", detail: "數數和配對", href: "/practice/p1-counting" },
                  { key: "p1-numbers", code: "03", icon: "🔟", title: "100 以內的數", detail: "看十位和個位", href: "/practice/p1-numbers" },
                  { key: "p1-number-line", code: "04", icon: "🐸", title: "順數與倒數", detail: "跟青蛙跳數線", href: "/practice/p1-number-line" },
                  { key: "p1-time", code: "05", icon: "🕐", title: "時間與鐘面", detail: "拖動時針分針", href: "/practice/p1-time" },
                  { key: "p1-calendar", code: "06", icon: "🗓️", title: "星期日曆", detail: "排好一星期", href: "/practice/p1-calendar" },
                  { key: "p1-measure", code: "07", icon: "📏", title: "長度量度", detail: "拖尺子學量度", href: "/practice/p1-measure" },
                  { key: "p1-length-compare", code: "08", icon: "↔️", title: "較長較短", detail: "先比兩件物品", href: "/practice/p1-length-compare" },
                  { key: "p1-length-sort", code: "09", icon: "📐", title: "長度排序", detail: "由短排到長", href: "/practice/p1-length-sort" },
                  { key: "p1-shapes", code: "10", icon: "🔺", title: "平面圖形", detail: "拖圖形拼一拼", href: "/practice/p1-shapes" },
                  { key: "p1-shape-rotation", code: "11", icon: "🔄", title: "旋轉圖形", detail: "轉一轉也一樣", href: "/practice/p1-shape-rotation" },
                  { key: "p1-lines", code: "12", icon: "〰️", title: "直線曲線", detail: "分類再描線", href: "/practice/p1-lines" },
                  { key: "p1-solids", code: "13", icon: "🧊", title: "立體圖形", detail: "分類生活物件", href: "/practice/p1-solids" },
                  { key: "p1-pictograph", code: "14", icon: "📊", title: "象形圖", detail: "看圖數一數", href: "/practice/p1-pictograph" },
                ].map((station, stationIndex, stations) => { const done = completedPractices.includes(station.key); const next = !done && stations.slice(0, stationIndex).every((prior) => completedPractices.includes(prior.key)); return <Link key={station.key} href={station.href} className={`mq-p1-route-card ${next ? "is-next" : ""} ${done ? "is-done" : ""}`}><span className="mq-p1-route-code">{done ? <Check className="size-3" /> : station.code}</span><span className="text-lg leading-none">{station.icon}</span><strong>{station.title}</strong><small>{done ? "已收集星星" : next ? "下一站，按這裡" : station.detail}</small></Link>; })}</div>
              </section>}

              {course.stage !== "primary" && <div className="mt-6 grid gap-4 md:grid-cols-2">
                {course.categories.map((category, index) => {
                  const Icon = categoryIcons[index] ?? BookOpen;
                  return (
                    <article key={category.name} data-station={`0${index + 1}`} className="mq-card group relative h-full overflow-hidden rounded-2xl border border-[#172b3f]/10 bg-[#fcfbf7] p-5 transition duration-200 hover:-translate-y-1 hover:border-[#172b3f]/25 hover:shadow-[0_12px_25px_rgba(23,43,63,0.08)]">
                      <div className="flex items-center justify-between">
                        <span className="grid size-9 place-items-center rounded-xl text-white" style={{ backgroundColor: course.accent }}><Icon className="size-4" /></span>
                        <span className="font-mono text-[10px] font-bold tracking-widest text-[#8390a0]">{String(index + 1).padStart(2, "0")}</span>
                      </div>
                      <h4 className="mt-4 text-lg font-extrabold">{category.name}</h4>
                      <ul className="mt-3 space-y-2">
                        {category.topics.slice(0, 3).map((topic) => <li key={topic} className="flex gap-2 text-sm leading-5 text-[#617286]"><span className="mt-[8px] size-1 shrink-0 rounded-full" style={{ backgroundColor: course.accent }} />{topic}</li>)}
                        {category.topics.length > 3 && <li className="pl-3 text-xs font-bold text-[#617286]">另有 {category.topics.length - 3} 個焦點</li>}
                      </ul>
                    </article>
                  );
                })}
              </div>}
              {course.stage !== "primary" && <div className="mq-checkpoint mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#fff3e8] px-5 py-4">
                <p className="text-sm font-bold text-[#744230]"><span className="font-mono text-xs text-[#f05a3c]">CHECKPOINT →</span> 建議先挑戰：{course.checkpoint}</p>
                {courseCompleted ? <span className="inline-flex items-center gap-1 text-sm font-extrabold text-[#0e8b87]"><Check className="size-4" /> 已完成練習</span> : <button onClick={() => notifyComingSoon(course.checkpoint)} className="inline-flex items-center gap-1 text-sm font-extrabold text-[#f05a3c] hover:underline">查看題型 <ArrowRight className="size-4" /></button>}
              </div>}
            </div>
            </div>
          </div>
        </section>

        <section id="curriculum" className="border-y border-[#172b3f]/10 bg-[#ece6d9]">
          <div className="mx-auto max-w-[1280px] px-5 py-16 lg:px-8 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-[0.65fr_1.35fr] lg:gap-14">
              <div>
                <p className="font-mono text-xs font-bold tracking-[0.17em] text-[#f05a3c]">FULL CURRICULUM — 03</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.055em] md:text-4xl">所有年級，<br />都在同一張地圖。</h2>
                <p className="mt-5 max-w-[360px] text-[15px] leading-7 text-[#53677d]">沿著年級路徑查看每個主題；完成一站後，再選擇下一個想解開的數學挑戰。</p>
                <div className="mt-8 rounded-2xl border border-[#172b3f]/10 bg-white/70 p-4">
                  <div className="flex items-center gap-3"><Sparkles className="size-5 text-[#f05a3c]" /><p className="text-sm font-extrabold">你的探險地圖</p></div>
                  <p className="mt-2 text-sm leading-6 text-[#617286]">每一站標示年級、範疇和主題。從已開放的練習站開始，逐步收集你的完成印記。</p>
                </div>
              </div>
              <div className="space-y-3">
                {courses.map((item, index) => (
                  <details key={item.grade} className="mq-accordion group relative rounded-2xl border border-[#172b3f]/10 bg-white transition-shadow open:shadow-[0_10px_25px_rgba(23,43,63,0.06)]">
                    <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 marker:content-none">
                      <span className="grid size-10 place-items-center rounded-xl font-mono text-xs font-bold text-white" style={{ backgroundColor: item.accent }}>{item.grade}</span>
                      <span className="min-w-0 flex-1"><small className="font-mono text-[9px] font-bold tracking-[0.13em] text-[#f05a3c]">Q PATH · STATION {String(index + 1).padStart(2, "0")}</small><strong className="mt-0.5 block text-sm font-extrabold">{item.shortLabel} · {item.title}</strong><small className="mt-0.5 block text-xs text-[#728195]">{item.categories.length} 個範疇 · {item.categories.reduce((sum, category) => sum + category.topics.length, 0)} 個主題</small></span>
                      <ChevronDown className="size-5 text-[#617286] transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="grid gap-4 border-t border-[#172b3f]/10 px-5 py-5 md:grid-cols-2">
                      {item.categories.map((category) => (
                        <div key={category.name} className="border-l-2 pl-3" style={{ borderColor: `${item.accent}66` }}>
                          <h3 className="font-mono text-[11px] font-bold tracking-[0.12em]" style={{ color: item.accent }}>{category.name.toUpperCase()}</h3>
                          <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[#53677d]">{category.topics.map((topic) => <li key={topic} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full" style={{ backgroundColor: item.accent }} />{topic}</li>)}</ul>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-5 py-16 lg:px-8 lg:py-20">
          <div className="mq-next-station relative overflow-hidden rounded-[30px] bg-[#172b3f] px-6 py-10 text-white md:px-10 lg:px-14 lg:py-14">
            <div className="absolute -right-20 -top-24 size-[360px] rounded-full border-[24px] border-white/10" />
            <div className="absolute bottom-[-90px] right-[22%] size-[220px] rounded-full border-[18px] border-[#f6be5d]/70" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-[690px]">
                <p className="font-mono text-xs font-bold tracking-[0.17em] text-[#ffe4a0]">NEXT STATION — 04</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.055em] md:text-4xl">已準備好，向下一個挑戰前進。</h2>
                <p className="mt-4 text-[15px] leading-7 text-white/80">選擇你的年級，從最想練習的主題開始。答對後記下方法；遇到難題時，回看提示再試一次。</p>
              </div>
              <a href="#path" className="mq-start inline-flex w-fit items-center gap-2 rounded-full bg-[#f05a3c] px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_4px_0_#c84932] transition hover:-translate-y-0.5 active:translate-y-0 active:shadow-none">回到學習路徑 <ArrowRight className="size-4" /></a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#172b3f]/10 bg-[#f8f5ed]">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-5 py-8 text-xs text-[#617286] sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p className="font-bold text-[#172b3f]">Maths Quest <span className="ml-2 font-normal text-[#617286]">P1–S3 數學操題地圖</span></p>
          <p className="font-mono text-[10px] tracking-[0.12em]">LEARN · PRACTISE · UNDERSTAND</p>
        </div>
      </footer>
    </div>
  );
}
