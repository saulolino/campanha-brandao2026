import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { useEffect, useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Apoiadores from "./pages/Apoiadores";
import PublicationManager from "./pages/PublicationManager";
import PostPerformance from "./pages/PostPerformance";
import PerformanceDashboard from "./pages/PerformanceDashboard";
import UserManagement from "./pages/UserManagement";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Conteudo from "./pages/Conteudo";
import Estrategia from "./pages/Estrategia";
import Metricas from "./pages/Metricas";
import Projecoes from "./pages/Projecoes";
import SettingsPage from "./pages/SettingsPage";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Login} />
      <Route path={"/login"} component={Login} />
      <Route path={"/home"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/conteudo"} component={Conteudo} />
      <Route path={"/estrategia"} component={Estrategia} />
      <Route path={"/metricas"} component={Metricas} />
      <Route path={"/projecoes"} component={Projecoes} />
      <Route path={"/configuracoes"} component={SettingsPage} />
      <Route path={"/apoiadores"} component={Apoiadores} />
      <Route path={"/publicacoes"} component={PublicationManager} />
      <Route path={"/performance"} component={PostPerformance} />
      <Route path={"/usuarios"} component={UserManagement} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

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
