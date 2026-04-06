import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLE_DESCRIPTIONS, type UserRole } from "@shared/permissions";
import { getLoginUrl } from "@/const";
import { Users, Lock, Eye, Crown } from "lucide-react";

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  visitor: <Eye size={32} />,
  team: <Users size={32} />,
  coordinator: <Lock size={32} />,
  superadmin: <Crown size={32} />,
};

const ROLE_COLORS: Record<UserRole, string> = {
  visitor: "bg-gray-500/10 border-gray-500/20 hover:bg-gray-500/20",
  team: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20",
  coordinator: "bg-green-500/10 border-green-500/20 hover:bg-green-500/20",
  superadmin: "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20",
};

const ROLE_BADGE_COLORS: Record<UserRole, "secondary" | "default" | "destructive" | "outline"> = {
  visitor: "secondary",
  team: "default",
  coordinator: "default",
  superadmin: "destructive",
};

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleLogin = (role: UserRole) => {
    // Armazenar role selecionado no localStorage
    localStorage.setItem("selectedRole", role);
    // Redirecionar para login do Manus
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/logo-bcp_185f8543.png"
              alt="Brasília Cidade Parque"
              className="w-12 h-12"
            />
            <h1 className="text-4xl font-bold text-foreground">Brasília Cidade Parque</h1>
          </div>
          <p className="text-lg text-muted-foreground">Painel de Campanha - Selecione seu nível de acesso</p>
        </div>

        {/* Role Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {(["visitor", "team", "coordinator", "superadmin"] as UserRole[]).map((role) => (
            <Card
              key={role}
              className={`p-6 cursor-pointer border-2 transition-all duration-200 ${ROLE_COLORS[role]} ${
                selectedRole === role ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedRole(role)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-primary">{ROLE_ICONS[role]}</div>
                <Badge variant={ROLE_BADGE_COLORS[role]}>{ROLE_DESCRIPTIONS[role].label}</Badge>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2">
                {ROLE_DESCRIPTIONS[role].label}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {ROLE_DESCRIPTIONS[role].description}
              </p>

              {/* Permissões específicas */}
              <div className="space-y-2 text-xs">
                {role === "visitor" && (
                  <div className="text-muted-foreground">
                    <p>❌ Sem acesso a informações estratégicas</p>
                    <p>❌ Sem acesso ao painel</p>
                  </div>
                )}
                {role === "team" && (
                  <div className="text-muted-foreground">
                    <p>✅ Acesso ao painel completo</p>
                    <p>✅ Pode editar posts</p>
                    <p>❌ Não pode publicar</p>
                  </div>
                )}
                {role === "coordinator" && (
                  <div className="text-muted-foreground">
                    <p>✅ Acesso ao painel completo</p>
                    <p>✅ Pode editar e publicar posts</p>
                    <p>✅ Pode agendar publicações</p>
                  </div>
                )}
                {role === "superadmin" && (
                  <div className="text-muted-foreground">
                    <p>✅ Acesso total ao sistema</p>
                    <p>✅ Gerencia usuários e permissões</p>
                    <p>✅ Acesso a configurações avançadas</p>
                  </div>
                )}
              </div>

              <Button
                onClick={() => handleLogin(role)}
                className="w-full mt-6"
                variant={selectedRole === role ? "default" : "outline"}
              >
                Entrar como {ROLE_DESCRIPTIONS[role].label}
              </Button>
            </Card>
          ))}
        </div>

        {/* Info Box */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h4 className="font-semibold text-foreground mb-2">ℹ️ Como funciona?</h4>
          <p className="text-sm text-muted-foreground">
            Selecione seu nível de acesso acima. Você será redirecionado para fazer login com sua conta Manus.
            Após o login, seu acesso será configurado de acordo com o nível selecionado.
          </p>
        </Card>
      </div>
    </div>
  );
}
