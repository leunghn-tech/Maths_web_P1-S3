/** Maths Quest global shell — maintains the light paper workspace selected in ideas.md. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import P1Practice from "./pages/P1Practice";
import P2Practice from "./pages/P2Practice";
import P3Practice from "./pages/P3Practice";
import P4Practice from "./pages/P4Practice";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/practice/p1-add-subtract" component={P1Practice} />
      <Route path="/practice/p2-multiplication" component={P2Practice} />
      <Route path="/practice/p3-mixed-operations" component={P3Practice} />
      <Route path="/practice/p4-fractions-decimals" component={P4Practice} />
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
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
