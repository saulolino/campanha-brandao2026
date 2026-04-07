import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Shield, Users, ArrowLeft } from "lucide-react";

interface User {
  id: number;
  name: string | null;
  email: string | null;
  role: "visitor" | "team" | "coordinator" | "superadmin" | null;
  createdAt: Date;
}

const ROLE_COLORS: Record<string, string> = {
  visitor: "bg-blue-500/10 text-blue-700 border-blue-200",
  team: "bg-green-500/10 text-green-700 border-green-200",
  coordinator: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  superadmin: "bg-red-500/10 text-red-700 border-red-200",
};

const ROLE_LABELS: Record<string, string> = {
  visitor: "Visitante",
  team: "Equipe",
  coordinator: "Coordenador",
  superadmin: "Superadmin",
};

export default function UserAdmin() {
  const [, navigate] = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Verificar se é superadmin
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== "superadmin") {
      navigate("/home");
      return;
    }

    setCurrentUser(user);
    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      // Aqui você faria uma chamada à API para listar usuários
      // Por enquanto, vamos simular com dados do localStorage
      const usersData: User[] = [
        {
          id: 1,
          name: "Visitante",
          email: "visitante@teste.com",
          role: "visitor",
          createdAt: new Date(),
        },
        {
          id: 2,
          name: "Equipe",
          email: "equipe@teste.com",
          role: "team",
          createdAt: new Date(),
        },
        {
          id: 3,
          name: "Coordenador",
          email: "coordenador@teste.com",
          role: "coordinator",
          createdAt: new Date(),
        },
        {
          id: 4,
          name: "Superadmin",
          email: "superadmin@teste.com",
          role: "superadmin",
          createdAt: new Date(),
        },
      ];
      setUsers(usersData);
    } catch (err) {
      setError("Erro ao carregar usuários");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      // Aqui você faria uma chamada à API para atualizar o role
      // Por enquanto, vamos simular a atualização
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, role: newRole as any } : u
        )
      );
      alert(`Usuário atualizado para ${ROLE_LABELS[newRole]}`);
    } catch (err) {
      setError("Erro ao atualizar usuário");
      console.error(err);
    }
  };

  if (!currentUser || currentUser.role !== "superadmin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <p className="text-lg font-semibold">Acesso Negado</p>
          <p className="text-muted-foreground mb-4">
            Apenas superadmins podem acessar esta página
          </p>
          <Button onClick={() => navigate("/home")}>Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/home")}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield size={32} className="text-green-600" />
              Gerenciamento de Usuários
            </h1>
            <p className="text-muted-foreground">
              Controle de acesso e permissões
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} className="text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Users List */}
        <Card className="bg-card border-border">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando usuários...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Role Atual
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-foreground">
                        {user.name || "Sem nome"}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {user.email || "Sem email"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                            ROLE_COLORS[user.role || "visitor"]
                          }`}
                        >
                          {ROLE_LABELS[user.role || "visitor"]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          {user.role !== "superadmin" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleUpdateRole(user.id, "superadmin")
                              }
                            >
                              Promover
                            </Button>
                          )}
                          {user.role !== "coordinator" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleUpdateRole(user.id, "coordinator")
                              }
                            >
                              Coordenador
                            </Button>
                          )}
                          {user.role !== "team" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateRole(user.id, "team")}
                            >
                              Equipe
                            </Button>
                          )}
                          {user.role !== "visitor" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleUpdateRole(user.id, "visitor")
                              }
                            >
                              Visitante
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-blue-500/10 border-blue-500/30 p-4">
          <div className="flex gap-3">
            <Users size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Sobre Roles
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  <strong>Visitante:</strong> Acesso apenas leitura ao dashboard
                </li>
                <li>
                  <strong>Equipe:</strong> Acesso total, sem permissão de
                  publicação
                </li>
                <li>
                  <strong>Coordenador:</strong> Acesso total com permissão de
                  publicação
                </li>
                <li>
                  <strong>Superadmin:</strong> Acesso total e gerenciamento de
                  usuários
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
