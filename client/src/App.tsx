import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Páginas públicas
import Home from "./pages/Home";
import Login from "./pages/Login";
import RedefinirSenha from "./pages/RedefinirSenha";
import NotFound from "./pages/NotFound";

// Páginas protegidas — Equipe, Coordenador, Superadmin
import Conteudo from "./pages/Conteudo";
import Estrategia from "./pages/Estrategia";
import Metricas from "./pages/Metricas";
import Projecoes from "./pages/Projecoes";
import Relatorios from "./pages/Relatorios";
import Apoiadores from "./pages/Apoiadores";
import PublicationManager from "./pages/PublicationManager";
import PostPerformance from "./pages/PostPerformance";
import PerformanceDashboard from "./pages/PerformanceDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";

// Páginas exclusivas do Superadmin
import SettingsPage from "./pages/SettingsPage";

/**
 * Hierarquia de acesso:
 * - Visitante  → apenas /login, /home, /redefinir-senha
 * - Equipe     → + conteúdo (leitura), estratégia, métricas, projeções, relatórios, apoiadores
 * - Coordenador→ + publicar/agendar conteúdo (permissão canPublishPost)
 * - Superadmin → + configurações, gerenciamento de usuários, admin
 *
 * Acesso negado: usuários autenticados sem permissão veem a página AcessoNegado.
 * Usuários não autenticados são redirecionados para /login.
 */
function Router() {
  return (
    <Switch>
      {/* ===== ROTAS PÚBLICAS ===== */}
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/redefinir-senha" component={RedefinirSenha} />

      {/* ===== HOME — acessível a qualquer usuário autenticado ===== */}
      <Route path="/home" component={Home} />

      {/* ===== ROTAS PARA EQUIPE, COORDENADOR E SUPERADMIN ===== */}
      <Route path="/conteudo">
        {() => (
          <ProtectedRoute
            requiredRole={["team", "coordinator", "superadmin"]}
            rotaTentada="/conteudo"
          >
            <Conteudo />
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/estrategia">
        {() => (
          <ProtectedRoute
            requiredRole={["team", "coordinator", "superadmin"]}
            rotaTentada="/estrategia"
          >
            <Estrategia />
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/metricas">
        {() => (
          <ProtectedRoute
            requiredRole={["team", "coordinator", "superadmin"]}
            rotaTentada="/metricas"
          >
            <Metricas />
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/projecoes">
        {() => (
          <ProtectedRoute
            requiredRole={["team", "coordinator", "superadmin"]}
            rotaTentada="/projecoes"
          >
            <Projecoes />
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/relatorios">
        {() => (
          <ProtectedRoute
            requiredRole={["team", "coordinator", "superadmin"]}
            rotaTentada="/relatorios"
          >
            <Relatorios />
          </ProtectedRoute>
        )}
      </Route>

      {/* /apoiadores — página pública, sem necessidade de login */}
      <Route path="/apoiadores" component={Apoiadores} />

      <Route path="/publicacoes">
        {() => (
          <ProtectedRoute
            requiredRole={["team", "coordinator", "superadmin"]}
            rotaTentada="/publicacoes"
          >
            <PublicationManager />
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/performance">
        {() => (
          <ProtectedRoute
            requiredRole={["team", "coordinator", "superadmin"]}
            rotaTentada="/performance"
          >
            <PostPerformance />
          </ProtectedRoute>
        )}
      </Route>

      {/* ===== ROTAS EXCLUSIVAS DO SUPERADMIN ===== */}
      <Route path="/configuracoes">
        {() => (
          <ProtectedRoute
            requiredRole={["superadmin"]}
            rotaTentada="/configuracoes"
          >
            <SettingsPage />
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/usuarios">
        {() => (
          <ProtectedRoute
            requiredRole={["superadmin"]}
            rotaTentada="/usuarios"
          >
            <UserManagement />
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin">
        {() => (
          <ProtectedRoute
            requiredRole={["superadmin"]}
            rotaTentada="/admin"
          >
            <AdminDashboard />
          </ProtectedRoute>
        )}
      </Route>

      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
