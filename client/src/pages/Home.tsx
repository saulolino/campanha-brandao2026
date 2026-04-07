import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, LogOut, User, Settings } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Se o usuário não estiver autenticado, mostrar tela de carregamento

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      visitor: "Visitante",
      team: "Equipe",
      coordinator: "Coordenador",
      superadmin: "SuperAdmin",
    };
    return labels[role] || role;
  };

  const handleLogout = async () => {
    await logout();
    // Recarregar a página após logout
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-primary/10 bg-background/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/logo-bcp_185f8543.png"
              alt="Brasília Cidade Parque"
              className="w-10 h-10"
            />
            <h1 className="text-2xl font-bold">Brasília Cidade Parque</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/profile")}
              className="gap-2"
            >
              <User className="w-4 h-4" />
              Perfil
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome Card */}
        <Card className="p-8 mb-8 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Bem-vindo, {user.name}!
              </h2>
              <p className="text-muted-foreground text-lg">
                Nível de Acesso: <span className="font-semibold text-primary">{getRoleLabel(user.role)}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
              <p className="text-sm text-muted-foreground mt-2">WhatsApp</p>
              <p className="font-medium">{user.whatsapp}</p>
            </div>
          </div>
        </Card>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Painel Principal */}
          <Card className="p-6 border-primary/20 hover:border-primary/40 transition-colors">
            <h3 className="text-lg font-semibold mb-4">Painel Principal</h3>
            <p className="text-muted-foreground mb-4">
              Acesse o painel de controle da campanha com métricas em tempo real.
            </p>
            <Button
              disabled
              className="w-full"
            >
              Você está no Painel
            </Button>
          </Card>

          {/* Publicações */}
          <Card className="p-6 border-primary/20 hover:border-primary/40 transition-colors">
            <h3 className="text-lg font-semibold mb-4">Gerenciador de Publicações</h3>
            <p className="text-muted-foreground mb-4">
              Gerencie todas as publicações da campanha em um único lugar.
            </p>
            <Button
              onClick={() => setLocation("/publicacoes")}
              className="w-full"
            >
              Ir para Publicações
            </Button>
          </Card>

          {/* Performance */}
          <Card className="p-6 border-primary/20 hover:border-primary/40 transition-colors">
            <h3 className="text-lg font-semibold mb-4">Performance</h3>
            <p className="text-muted-foreground mb-4">
              Analise o desempenho da campanha com gráficos e relatórios.
            </p>
            <Button
              onClick={() => setLocation("/performance")}
              className="w-full"
            >
              Ver Performance
            </Button>
          </Card>

          {/* Apoiadores */}
          <Card className="p-6 border-primary/20 hover:border-primary/40 transition-colors">
            <h3 className="text-lg font-semibold mb-4">Apoiadores</h3>
            <p className="text-muted-foreground mb-4">
              Gerencie a lista de apoiadores da campanha.
            </p>
            <Button
              onClick={() => setLocation("/apoiadores")}
              className="w-full"
            >
              Ver Apoiadores
            </Button>
          </Card>

          {/* Usuários */}
          {(user.role === "coordinator" || user.role === "superadmin") && (
            <Card className="p-6 border-primary/20 hover:border-primary/40 transition-colors">
              <h3 className="text-lg font-semibold mb-4">Gerenciamento de Usuários</h3>
              <p className="text-muted-foreground mb-4">
                Gerencie os usuários do sistema e suas permissões.
              </p>
              <Button
                onClick={() => setLocation("/usuarios")}
                className="w-full"
              >
                Gerenciar Usuários
              </Button>
            </Card>
          )}

          {/* Admin */}
          {user.role === "superadmin" && (
            <Card className="p-6 border-primary/20 hover:border-primary/40 transition-colors">
              <h3 className="text-lg font-semibold mb-4">Painel de Admin</h3>
              <p className="text-muted-foreground mb-4">
                Acesse as ferramentas administrativas do sistema.
              </p>
              <Button
                onClick={() => setLocation("/admin")}
                className="w-full"
              >
                Ir para Admin
              </Button>
            </Card>
          )}
        </div>

        {/* Info Box */}
        <Card className="mt-8 p-6 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <Settings className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Dica: Gerenciar Perfil</h3>
              <p className="text-sm text-muted-foreground">
                Você pode editar suas informações pessoais, alterar sua senha e gerenciar suas preferências na página de perfil.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
