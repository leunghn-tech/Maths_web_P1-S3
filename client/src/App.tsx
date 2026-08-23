/** Maths Quest global shell — maintains the light paper workspace selected in ideas.md. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import PrimaryFractionFormatter from "@/components/PrimaryFractionFormatter";
import PrimaryLearningCoach from "@/components/PrimaryLearningCoach";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import P1Practice from "./pages/P1Practice";
import P1NumbersPractice from "./pages/P1NumbersPractice";
import P1TimePractice from "./pages/P1TimePractice";
import P1NumberLinePractice from "./pages/P1NumberLinePractice";
import P1MeasurePractice from "./pages/P1MeasurePractice";
import P1ShapesPractice from "./pages/P1ShapesPractice";
import P1LengthComparePractice from "./pages/P1LengthComparePractice";
import P1SpatialPractice from "./pages/P1SpatialPractice";
import P1FoundationsPractice from "./pages/P1FoundationsPractice";
import P2NumbersPractice from "./pages/P2NumbersPractice";
import P2MoneyPractice from "./pages/P2MoneyPractice";
import P2TimePractice from "./pages/P2TimePractice";
import P2NumberLinePractice from "./pages/P2NumberLinePractice";
import P2ConceptPractice from "./pages/P2ConceptPractice";
import P2AdvancedPractice from "./pages/P2AdvancedPractice";
import P2AppliedPractice from "./pages/P2AppliedPractice";
import P2FurtherPractice from "./pages/P2FurtherPractice";
import P2Practice from "./pages/P2Practice";
import P3Practice from "./pages/P3Practice";
import P4Practice from "./pages/P4Practice";
import P4FactorsPractice from "./pages/P4FactorsPractice";
import P4MeasurePractice from "./pages/P4MeasurePractice";
import P4PolygonAreaPractice from "./pages/P4PolygonAreaPractice";
import P5DecimalPractice from "./pages/P5DecimalPractice";
import P5FractionPractice from "./pages/P5FractionPractice";
import P5UnlikeFractionsPractice from "./pages/P5UnlikeFractionsPractice";
import P5VolumePractice from "./pages/P5VolumePractice";
import P6DiscountPractice from "./pages/P6DiscountPractice";
import P6ProfitPractice from "./pages/P6ProfitPractice";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/practice/p1-add-subtract" component={P1Practice} />
      <Route path="/practice/p1-numbers" component={P1NumbersPractice} />
      <Route path="/practice/p1-time" component={P1TimePractice} />
      <Route path="/practice/p1-number-line" component={P1NumberLinePractice} />
      <Route path="/practice/p1-measure" component={P1MeasurePractice} />
      <Route path="/practice/p1-length-compare" component={P1LengthComparePractice} />
      <Route path="/practice/p1-shapes" component={P1ShapesPractice} />
      <Route path="/practice/p1-solids" component={P1SpatialPractice} />
      <Route path="/practice/p1-shape-rotation" component={P1SpatialPractice} />
      <Route path="/practice/p1-length-sort" component={P1SpatialPractice} />
      <Route path="/practice/p1-counting" component={P1FoundationsPractice} />
      <Route path="/practice/p1-calendar" component={P1FoundationsPractice} />
      <Route path="/practice/p1-lines" component={P1FoundationsPractice} />
      <Route path="/practice/p1-pictograph" component={P1FoundationsPractice} />
      <Route path="/practice/p2-multiplication" component={P2Practice} />
      <Route path="/practice/p2-numbers" component={P2NumbersPractice} />
      <Route path="/practice/p2-money" component={P2MoneyPractice} />
      <Route path="/practice/p2-time" component={P2TimePractice} />
      <Route path="/practice/p2-numbers-compare" component={P2NumberLinePractice} />
      <Route path="/practice/p2-multiply-visual" component={P2ConceptPractice} />
      <Route path="/practice/p2-money-coins" component={P2ConceptPractice} />
      <Route path="/practice/p2-directions" component={P2ConceptPractice} />
      <Route path="/practice/p2-division" component={P2AdvancedPractice} />
      <Route path="/practice/p2-direction-route" component={P2AdvancedPractice} />
      <Route path="/practice/p2-array-builder" component={P2AdvancedPractice} />
      <Route path="/practice/p2-measure" component={P2AppliedPractice} />
      <Route path="/practice/p2-angles" component={P2AppliedPractice} />
      <Route path="/practice/p2-division-remainder" component={P2AppliedPractice} />
      <Route path="/practice/p2-quadrilaterals" component={P2FurtherPractice} />
      <Route path="/practice/p2-pictograph-multiple" component={P2FurtherPractice} />
      <Route path="/practice/p2-meter-centimeter" component={P2FurtherPractice} />
      <Route path="/practice/p3-mixed-operations" component={P3Practice} />
      <Route path="/practice/p4-fractions-decimals" component={P4Practice} />
      <Route path="/practice/p4-factors-multiples" component={P4FactorsPractice} />
      <Route path="/practice/p4-perimeter-area" component={P4MeasurePractice} />
      <Route path="/practice/p4-polygon-area" component={P4PolygonAreaPractice} />
      <Route path="/practice/p5-fractions" component={P5FractionPractice} />
      <Route path="/practice/p5-decimals" component={P5DecimalPractice} />
      <Route path="/practice/p5-unlike-fractions" component={P5UnlikeFractionsPractice} />
      <Route path="/practice/p5-volume" component={P5VolumePractice} />
      <Route path="/practice/p6-discount" component={P6DiscountPractice} />
      <Route path="/practice/p6-profit" component={P6ProfitPractice} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster richColors position="top-center" />
          <Router />
          <PrimaryFractionFormatter />
          <PrimaryLearningCoach />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
