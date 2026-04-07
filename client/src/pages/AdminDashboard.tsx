import { useLocalAuth } from "@/hooks/useLocalAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Shield, AlertCircle, CheckCircle2, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

type UserRole = "visitor" | "team" | "coordinator" | "superadmin";

interface User {
  id: number;
  email: string;
  nome: string;
  role: UserRole;
  whatsapp: string;
  createdAt?: string;
}

// Dados simulados de usuários (em produção, viria de um banco de dados)
const MOCK_USERS: User[] = [
  {
    id: 1,
    email: "visitante@teste.com",
    nome: "Visitante",
    role: "visitor",
    whatsapp: "(61) 98888-8888",
    createdAt: "2026-04-01",
  },
  {
    id: 2,
    email: "equipe@teste.com",
    nome: "Equipe",
    role: "team",
    whatsapp: "(61) 97777-7777",
    createdAt: "2026-04-02",
  },
  {
    id: 3,
    email: "coordenador@teste.com",
    nome: "Coordenador",
    role: "coordinator",
    whatsapp: "(61) 96666-6666",
    createdAt: "2026-04-03",
  },
  {
    id: 4,
    email: "superadmin@teste.com",
    nome: "Superadmin",
    role: "superadmin",
    whatsapp: "(61) 95555-5555",
    createdAt: "2026-04-04",
  },
];

export default function AdminDashboard() {
  const { user: currentUser } = useLocalAuth();
  const { isSuperAdmin } = usePermissions();
  const [, navigate] = useLocation();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [selectedRole, setSelectedRole] = useState<UserRole>("visitor");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");

  // Redirecionar se não for superadmin
  useEffect(() => {
    if (!isSuperAdmin) {
      toast.error("Acesso negado! Apenas superadmins podem acessar esta página.");
      navigate("/home");
    }
  }, [isSuperAdmin, navigate]);

  const handleUpdateRole = (userId: number, newRole: UserRole) => {
    setUsers(
      users.map((u) =>
        u.id === userId ? { ...u, role: newRole } : u
      )
    );
    setEditingUserId(null);
    toast.success("Função atualizada com sucesso!");
  };

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter((u) => u.id !== userId));
    toast.success("Usuário removido com sucesso!");
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "superadmin":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "coordinator":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "team":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "visitor":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "superadmin":
        return "Superadmin";
      case "coordinator":
        return "Coordenador";
      case "team":
        return "Equipe";
      case "visitor":
        return "Visitante";
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground mb-4">
            Apenas superadmins podem acessar esta página.
          </p>
          <Button onClick={() => navigate("/home")} className="w-full">
            Voltar ao Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />

      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
            </div>
            <p className="text-muted-foreground">
              Gerencie roles e permissões dos usuários do sistema
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Total de Usuários</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Superadmins</p>
              <p className="text-2xl font-bold text-red-400">
                {users.filter((u) => u.role === "superadmin").length}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Coordenadores</p>
              <p className="text-2xl font-bold text-blue-400">
                {users.filter((u) => u.role === "coordinator").length}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Visitantes</p>
              <p className="text-2xl font-bold text-gray-400">
                {users.filter((u) => u.role === "visitor").length}
              </p>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Buscar por email ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Users Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Nome</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Função</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">WhatsApp</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm">{user.email}</td>
                      <td className="px-6 py-4 text-sm">{user.nome}</td>
                      <td className="px-6 py-4">
                        {editingUserId === user.id ? (
                          <Select value={user.role} onValueChange={(newRole) => handleUpdateRole(user.id, newRole as UserRole)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="visitor">Visitante</SelectItem>
                              <SelectItem value="team">Equipe</SelectItem>
                              <SelectItem value="coordinator">Coordenador</SelectItem>
                              <SelectItem value="superadmin">Superadmin</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getRoleColor(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">{user.whatsapp}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          {editingUserId === user.id ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingUserId(null)}
                              className="text-xs"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Salvar
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingUserId(user.id)}
                              className="text-xs"
                            >
                              <Edit2 className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remover
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {filteredUsers.length === 0 && (
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Nenhum usuário encontrado</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
