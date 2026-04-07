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

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Login} />
      <Route path={"/login"} component={Login} />
      <Route path={"/home"} component={Home} />
      <Route path={"/apoiadores"} component={Apoiadores} />
      <Route path={"/publicacoes"} component={PublicationManager} />
      <Route path={"/performance"} component={PostPerformance} />
      <Route path={"/performance-dashboard"} component={PerformanceDashboard} />
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
