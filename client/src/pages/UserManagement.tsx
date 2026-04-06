import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLE_DESCRIPTIONS, type UserRole } from "@shared/permissions";
import { Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react";
import NotFound from "./NotFound";

export default function UserManagement() {
  const { user } = useAuth();
  const { isSuperAdmin } = usePermissions();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newRole, setNewRole] = useState<UserRole | undefined>();

  // Apenas SuperAdmin pode acessar
  if (!isSuperAdmin) {
    return <NotFound />;
  }

  // Queries
  const { data: users, isLoading, refetch } = trpc.users.list.useQuery();
  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedUserId(null);
      setNewRole(undefined);
    },
  });


  const handleUpdateRole = async () => {
    if (!selectedUserId || !newRole) return;
    await updateRoleMutation.mutateAsync({ userId: selectedUserId, newRole });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">Gerencie roles e permissões de todos os usuários</p>
        </div>

        {/* Tabela de Usuários */}
        <Card className="border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Usuário
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Departamento
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Carregando usuários...
                    </td>
                  </tr>
                ) : users && users.length > 0 ? (
                  users.map((u: any) => (
                    <tr key={u.id} className="border-b border-border hover:bg-muted/50 transition">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{u.name || "Sem nome"}</p>
                          <p className="text-xs text-muted-foreground">{u.openId}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{u.email || "-"}</td>
                      <td className="py-3 px-4">
                        <Badge variant="default">{ROLE_DESCRIPTIONS[u.role as UserRole]?.label}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {u.department || "-"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {u.isActive ? (
                          <CheckCircle2 size={18} className="text-green-500 mx-auto" />
                        ) : (
                          <XCircle size={18} className="text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUserId(u.id);
                                setNewRole(u.role);
                              }}
                            >
                              <Edit2 size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Atualizar Role - {u.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">
                                  Novo Role
                                </label>
                                <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(["visitor", "team", "coordinator", "superadmin"] as UserRole[]).map((role) => (
                                      <SelectItem key={role} value={role}>
                                        {ROLE_DESCRIPTIONS[role].label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                onClick={handleUpdateRole}
                                disabled={updateRoleMutation.isPending || newRole === u.role}
                              >
                                {updateRoleMutation.isPending ? "Atualizando..." : "Atualizar"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
