import { useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLE_DESCRIPTIONS, type UserRole } from "@shared/permissions";
import { Edit2, Users, Clock, CheckCircle2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import NotFound from "./NotFound";
import SidebarNav from "@/components/SidebarNav";

const ROLE_COLORS: Record<string, string> = {
  visitor: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  team: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  coordinator: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  superadmin: "bg-green-500/20 text-green-300 border-green-500/30",
};

// Componente separado para o Dialog de edição de role — estado local, sem conflito
function EditRoleDialog({
  userId,
  userName,
  currentRole,
  userEmail,
  userWhatsapp,
  userCreatedAt,
  onSuccess,
  variant = "icon",
}: {
  userId: number;
  userName: string;
  currentRole: UserRole;
  userEmail?: string;
  userWhatsapp?: string | null;
  userCreatedAt?: Date | string;
  onSuccess: () => void;
  variant?: "icon" | "full";
}) {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);

  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: (_, vars) => {
      const roleLabel = ROLE_DESCRIPTIONS[vars.newRole as UserRole]?.label || vars.newRole;
      toast.success(`Usuário promovido para ${roleLabel}`);
      setOpen(false);
      onSuccess();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSave = async () => {
    await updateRoleMutation.mutateAsync({ userId, newRole: selectedRole });
  };

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const formatWhatsapp = (w: string | null | undefined) => {
    if (!w) return "-";
    const d = w.replace(/\D/g, "");
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return w;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) setSelectedRole(currentRole); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Edit2 size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {variant === "full" ? `Classificar usuário — ${userName}` : `Editar acesso — ${userName}`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {variant === "full" && (
            <div className="p-3 bg-muted/30 rounded-lg text-sm space-y-1">
              {userEmail && <p><span className="text-muted-foreground">E-mail:</span> {userEmail}</p>}
              {userWhatsapp !== undefined && <p><span className="text-muted-foreground">WhatsApp:</span> {formatWhatsapp(userWhatsapp)}</p>}
              {userCreatedAt && <p><span className="text-muted-foreground">Cadastro:</span> {formatDate(userCreatedAt)}</p>}
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-2 block">Nível de acesso</label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["visitor", "team", "coordinator", "superadmin"] as UserRole[]).map((role) => (
                  <SelectItem key={role} value={role}>
                    <span className="font-medium">{ROLE_DESCRIPTIONS[role].label}</span>
                    <span className="ml-2 text-muted-foreground text-xs">{ROLE_DESCRIPTIONS[role].description}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={updateRoleMutation.isPending || selectedRole === currentRole}
          >
            {updateRoleMutation.isPending ? "Salvando..." : variant === "full" ? "Confirmar classificação" : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function UserManagement() {
  const { isSuperAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState<"all" | "pending">("pending");

  // Apenas SuperAdmin pode acessar
  if (!isSuperAdmin) {
    return <NotFound />;
  }

  // Queries
  const { data: allUsers, isLoading, refetch } = trpc.users.list.useQuery();
  const { data: pendingUsers, isLoading: loadingPending, refetch: refetchPending } = trpc.users.listPending.useQuery();

  const handleRefetch = () => {
    refetch();
    refetchPending();
  };

  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: (_, vars) => {
      handleRefetch();
      const roleLabel = ROLE_DESCRIPTIONS[vars.newRole as UserRole]?.label || vars.newRole;
      toast.success(`Usuário promovido para ${roleLabel}`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleQuickPromote = async (userId: number, role: UserRole) => {
    await updateRoleMutation.mutateAsync({ userId, newRole: role });
  };

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const formatWhatsapp = (w: string | null) => {
    if (!w) return "-";
    const d = w.replace(/\D/g, "");
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return w;
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <SidebarNav activeSection="usuarios" />
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground text-sm">Aprove solicitações de acesso e gerencie os níveis de permissão da equipe</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "pending"
                ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <Clock size={15} />
            Aguardando aprovação
            {pendingUsers && pendingUsers.length > 0 && (
              <span className="ml-1 bg-yellow-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {pendingUsers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "bg-primary/20 text-primary border border-primary/40"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <Users size={15} />
            Todos os usuários
            {allUsers && (
              <span className="ml-1 bg-muted text-muted-foreground text-xs font-bold rounded-full px-1.5">
                {allUsers.length}
              </span>
            )}
          </button>
        </div>

        {/* Aba: Pendentes */}
        {activeTab === "pending" && (
          <Card className="border-border bg-card">
            {loadingPending ? (
              <div className="py-12 text-center text-muted-foreground">Carregando...</div>
            ) : pendingUsers && pendingUsers.length > 0 ? (
              <div className="divide-y divide-border">
                {pendingUsers.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-yellow-300 font-bold text-sm">
                          {(u.name || "?").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{u.name || "Sem nome"}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <MessageCircle size={11} className="text-green-400" />
                          <a
                            href={`https://wa.me/55${(u.whatsapp || "").replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-green-400 hover:text-green-300 transition-colors"
                          >
                            {formatWhatsapp(u.whatsapp)}
                          </a>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Cadastro: {formatDate(u.createdAt)}</p>
                      </div>
                    </div>

                    {/* Ações rápidas */}
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-blue-500/40 text-blue-300 hover:bg-blue-500/10"
                        onClick={() => handleQuickPromote(u.id, "team")}
                        disabled={updateRoleMutation.isPending}
                      >
                        Equipe
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/10"
                        onClick={() => handleQuickPromote(u.id, "coordinator")}
                        disabled={updateRoleMutation.isPending}
                      >
                        Coordenador
                      </Button>
                      {/* Dialog com estado local — sem conflito de estado compartilhado */}
                      <EditRoleDialog
                        userId={u.id}
                        userName={u.name || "Sem nome"}
                        currentRole={(u.role as UserRole) || "visitor"}
                        userEmail={u.email}
                        userWhatsapp={u.whatsapp}
                        userCreatedAt={u.createdAt}
                        onSuccess={handleRefetch}
                        variant="full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3 opacity-60" />
                <p className="text-muted-foreground font-medium">Nenhuma solicitação pendente</p>
                <p className="text-sm text-muted-foreground mt-1">Todos os cadastros foram classificados</p>
              </div>
            )}
          </Card>
        )}

        {/* Aba: Todos os usuários */}
        {activeTab === "all" && (
          <Card className="border-border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Usuário</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">E-mail</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">WhatsApp</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Nível</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Cadastro</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Carregando...</td></tr>
                ) : allUsers && allUsers.length > 0 ? (
                  allUsers.map((u: any) => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {(u.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{u.name || "Sem nome"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{u.email || "-"}</td>
                      <td className="py-3 px-4">
                        {u.whatsapp ? (
                          <a
                            href={`https://wa.me/55${u.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
                          >
                            <MessageCircle size={12} />
                            {formatWhatsapp(u.whatsapp)}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${ROLE_COLORS[u.role] || ROLE_COLORS.visitor}`}>
                          {ROLE_DESCRIPTIONS[u.role as UserRole]?.label || u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{formatDate(u.createdAt)}</td>
                      <td className="py-3 px-4 text-center">
                        {/* Dialog com estado local por linha — sem conflito */}
                        <EditRoleDialog
                          userId={u.id}
                          userName={u.name || "Sem nome"}
                          currentRole={(u.role as UserRole) || "visitor"}
                          onSuccess={handleRefetch}
                          variant="icon"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Nenhum usuário encontrado</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        )}
      </main>
    </div>
  );
}
