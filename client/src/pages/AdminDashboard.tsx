import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Shield, AlertCircle, CheckCircle2, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar";
import InfoTooltip from "@/components/InfoTooltip";

type UserRole = "visitor" | "team" | "coordinator" | "superadmin";

interface User {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  role: string;
  createdAt: Date;
  lastSignedIn: Date | null;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const { isSuperAdmin } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRole>("visitor");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [searchEmail, setSearchEmail] = useState("");
  const [foundUser, setFoundUser] = useState<User | null>(null);

  const { data: allUsers, isLoading: usersLoading, refetch } = trpc.users.list.useQuery();
  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Função atualizada com sucesso!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });
  
  const [emailToSearch, setEmailToSearch] = useState<string | null>(null);
  const { data: searchedUser, isLoading: searchingUser, error: searchError } = trpc.users.getByEmail.useQuery(
    { email: emailToSearch! },
    { enabled: !!emailToSearch, retry: false }
  );

  useEffect(() => {
    if (searchedUser) {
      setFoundUser(searchedUser as User);
      toast.success(`Usuário encontrado: ${searchedUser.name || searchedUser.email}`);
    }
  }, [searchedUser]);

  useEffect(() => {
    if (searchError) {
      setFoundUser(null);
      toast.error(`Erro: ${searchError.message}`);
    }
  }, [searchError]);
  
  const updateRoleByEmailMutation = trpc.users.updateRoleByEmail.useMutation({
    onSuccess: () => {
      toast.success("Função atualizada com sucesso!");
      setSearchEmail("");
      setFoundUser(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  useEffect(() => {
    if (allUsers) {
      setUsers(allUsers);
    }
  }, [allUsers]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold text-foreground mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground mb-6">Apenas SuperAdmin pode acessar este painel.</p>
          <a href="/home" className="text-primary hover:underline">Voltar para home</a>
        </div>
      </div>
    );
  }

  const handleUpdateRole = (userId: number, newRole: UserRole) => {
    updateRoleMutation.mutate({ userId, newRole });
    setEditingUserId(null);
  };

  const roleDescriptions: Record<UserRole, string> = {
    visitor: "Sem acesso ao painel",
    team: "Acesso total, sem publicação",
    coordinator: "Acesso total com publicação",
    superadmin: "Super poderes - gerencia tudo",
  };

  const roleColors: Record<UserRole, string> = {
    visitor: "bg-gray-100 text-gray-800",
    team: "bg-blue-100 text-blue-800",
    coordinator: "bg-green-100 text-green-800",
    superadmin: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />
      
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground tracking-tight">PAINEL DE ADMINISTRAÇÃO</h2>
              <p className="text-[10px] text-muted-foreground">Gerenciar usuários e permissões</p>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-primary" />
              <span className="text-xs font-mono text-primary font-bold">SUPERADMIN</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total de Usuários</p>
                  <p className="text-2xl font-bold text-foreground">{users.length}</p>
                </div>
                <Users size={24} className="text-primary" />
              </div>
            </Card>
            
            <Card className="p-4 border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">SuperAdmins</p>
                  <p className="text-2xl font-bold text-foreground">{users.filter(u => u.role === "superadmin").length}</p>
                </div>
                <Shield size={24} className="text-purple-500" />
              </div>
            </Card>

            <Card className="p-4 border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Coordenadores</p>
                  <p className="text-2xl font-bold text-foreground">{users.filter(u => u.role === "coordinator").length}</p>
                </div>
                <CheckCircle2 size={24} className="text-green-500" />
              </div>
            </Card>

            <Card className="p-4 border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Visitantes</p>
                  <p className="text-2xl font-bold text-foreground">{users.filter(u => u.role === "visitor").length}</p>
                </div>
                <AlertCircle size={24} className="text-gray-500" />
              </div>
            </Card>
          </div>

          {/* Search by Email Section */}
          <Card className="border-border p-4 mb-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              Buscar e Atualizar Usuário por Email
              <InfoTooltip text="Digite um email para buscar o usuário e atualizar sua função" />
            </h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Digite o email do usuário"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => {
                    if (searchEmail) {
                      setEmailToSearch(searchEmail);
                    }
                  }}
                  disabled={!searchEmail || searchingUser}
                >
                  Buscar
                </Button>
              </div>
              
              {foundUser && (
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Nome</p>
                      <p className="font-semibold text-foreground">{foundUser.name || "Sem nome"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Email</p>
                      <p className="font-semibold text-foreground">{foundUser.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Função Atual</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${roleColors[foundUser.role as UserRole]}`}>
                        {foundUser.role === "visitor" ? "Visitante" : foundUser.role === "team" ? "Equipe" : foundUser.role === "coordinator" ? "Coordenador" : "SuperAdmin"}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Nova Função</p>
                      <Select
                        value={selectedRole}
                        onValueChange={(value) => setSelectedRole(value as UserRole)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visitor">Visitante</SelectItem>
                          <SelectItem value="team">Equipe</SelectItem>
                          <SelectItem value="coordinator">Coordenador</SelectItem>
                          <SelectItem value="superadmin">SuperAdmin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      updateRoleByEmailMutation.mutate({ email: foundUser.email!, newRole: selectedRole });
                    }}
                    disabled={updateRoleByEmailMutation.isPending}
                    className="w-full"
                  >
                    Atualizar Função
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Users Table */}
          <Card className="border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  Usuários da Plataforma
                  <InfoTooltip text="Clique em um usuário para alterar sua função" />
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Nome</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Função Atual</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Data de Cadastro</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        Carregando usuários...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        Nenhum usuário cadastrado
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{u.name || "Sem nome"}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{u.email || "Sem email"}</td>
                        <td className="px-4 py-3">
                          {editingUserId === u.id ? (
                            <Select
                              value={selectedRole}
                              onValueChange={(value) => {
                                setSelectedRole(value as UserRole);
                                handleUpdateRole(u.id, value as UserRole);
                              }}
                            >
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="visitor">Visitante</SelectItem>
                                <SelectItem value="team">Equipe</SelectItem>
                                <SelectItem value="coordinator">Coordenador</SelectItem>
                                <SelectItem value="superadmin">SuperAdmin</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${roleColors[u.role as UserRole]}`}>
                              {u.role === "visitor" ? "Visitante" : u.role === "team" ? "Equipe" : u.role === "coordinator" ? "Coordenador" : "SuperAdmin"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingUserId(editingUserId === u.id ? null : u.id);
                                setSelectedRole(u.role as UserRole);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Role Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card className="p-4 border-border">
              <h4 className="font-semibold text-foreground mb-3">Descrição das Funções</h4>
              <div className="space-y-2 text-sm">
                {Object.entries(roleDescriptions).map(([role, desc]) => (
                  <div key={role} className="flex gap-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${roleColors[role as UserRole]} min-w-fit`}>
                      {role === "visitor" ? "Visitante" : role === "team" ? "Equipe" : role === "coordinator" ? "Coordenador" : "SuperAdmin"}
                    </span>
                    <span className="text-muted-foreground">{desc}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 border-border">
              <h4 className="font-semibold text-foreground mb-3">Instruções</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Novos usuários começam como <strong>Visitante</strong></li>
                <li>✓ Clique em <strong>Editar</strong> para alterar a função</li>
                <li>✓ Selecione a nova função no dropdown</li>
                <li>✓ A função é atualizada automaticamente</li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
