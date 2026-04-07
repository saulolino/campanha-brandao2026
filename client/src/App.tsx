import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { useEffect, useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import Home from "./pages/Home";
import Apoiadores from "./pages/Apoiadores";
import PublicationManager from "./pages/PublicationManager";
import PerformanceDashboard from "./pages/PerformanceDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserManagement from "./pages/UserManagement";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import VisaoGeral from "./pages/modules/VisaoGeral";
import Planejamento from "./pages/modules/Planejamento";
import Conteudo from "./pages/modules/Conteudo";
import Analise from "./pages/modules/Analise";
import Estrategia from "./pages/modules/Estrategia";
import Recursos from "./pages/modules/Recursos";
import Comunicacao from "./pages/modules/Comunicacao";
import Extras from "./pages/modules/Extras";
import Administracao from "./pages/modules/Administracao";

function Router() {
  const { user, loading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]);

  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/home"} component={() => {
        // Redirecionar /home para /
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
        return null;
      }} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/verify-email/:token"} component={VerifyEmail} />
      <Route path={"/forgot-password"} component={ForgotPassword} />
      <Route path={"/reset-password/:token"} component={ResetPassword} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/apoiadores"} component={Apoiadores} />
      <Route path={"/publicacoes"} component={PublicationManager} />
      <Route path={"/performance"} component={PerformanceDashboard} />
      <Route path={"/usuarios"} component={UserManagement} />
      <Route path={"/admin"} component={AdminDashboard} />
      {/* Módulos do Dashboard */}
      <Route path={"/visao-geral"} component={VisaoGeral} />
      <Route path={"/planejamento"} component={Planejamento} />
      <Route path={"/conteudo"} component={Conteudo} />
      <Route path={"/analise"} component={Analise} />
      <Route path={"/estrategia"} component={Estrategia} />
      <Route path={"/recursos"} component={Recursos} />
      <Route path={"/comunicacao"} component={Comunicacao} />
      <Route path={"/extras"} component={Extras} />
      <Route path={"/administracao"} component={Administracao} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
