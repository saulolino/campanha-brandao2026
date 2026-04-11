import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Users, Pencil, Trash2, ShieldCheck, Eye, UserCog, UserPlus, Activity, Link2, Copy, Check, RefreshCw, EyeOff } from "lucide-react";
import { useLocation } from "wouter";
import { usePageTransition } from "@/hooks/usePageTransition";
import SidebarNav from "@/components/SidebarNav";
import InstagramTokenAlert from "@/components/InstagramTokenAlert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Settings, Clock, FileText, Key, Bell, BellOff, Trash2 as Trash2Icon, CheckCheck, Filter, Loader2, UserPlus as UserPlusIcon, CalendarPlus, Instagram, RefreshCcw, Info, X } from "lucide-react";

export default function SettingsPage() {
  const [, navigate] = useLocation();
  const { animationClass } = usePageTransition();
  const [activeTab, setActiveTab] = useState("instagram");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // Ouvir evento de navegação de aba disparado pelo NotificationsTab
  useEffect(() => {
    const handler = (e: Event) => {
      const tab = (e as CustomEvent<{ tab: string }>).detail?.tab;
      if (tab) setActiveTab(tab);
    };
    window.addEventListener("settings:navigate-tab", handler);
    return () => window.removeEventListener("settings:navigate-tab", handler);
  }, []);

  // Instagram Credentials
  const [instagramToken, setInstagramToken] = useState(localStorage.getItem("instagramAccessToken") || "");
  const [instagramUsername, setInstagramUsername] = useState(localStorage.getItem("instagramUsername") || "");

  // Sync Schedule
  const [syncSchedule, setSyncSchedule] = useState(localStorage.getItem("syncSchedule") || "08:00,14:00,20:00");

  // Report Preferences
  const [reportFormat, setReportFormat] = useState(localStorage.getItem("reportFormat") || "pdf");
  const [reportFrequency, setReportFrequency] = useState(localStorage.getItem("reportFrequency") || "weekly");
  const [reportRecipients, setReportRecipients] = useState(localStorage.getItem("reportRecipients") || "");

  // ─── CRUD de Usuários ────────────────────────────────────────────────────
  const { user: currentUser } = useAuth();
  const localUser = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  })();
  const effectiveRole = currentUser?.role ?? localUser?.role ?? null;
  const isSuperAdmin = effectiveRole === "superadmin";

  // Estado do modal de edição
  const [editingUser, setEditingUser] = useState<{ id: number; name: string; email: string; role: string } | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"visitor" | "team" | "coordinator" | "superadmin">("visitor");
  const [editPassword, setEditPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Estado do modal de criação
  const [creatingUser, setCreatingUser] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"visitor" | "team" | "coordinator" | "superadmin">("visitor");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Estado do confirm de exclusão
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  // Estado de busca e paginação
  const [userSearch, setUserSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // ─── Log de Acesso ────────────────────────────────────────────────────────
  const [logLimit, setLogLimit] = useState(50);
  const [logUserFilter, setLogUserFilter] = useState<number | undefined>(undefined);
  const accessLogsQuery = trpc.users.listAccessLogs.useQuery(
    { limit: logLimit },
    { enabled: isSuperAdmin && activeTab === "users" }
  );

  // ─── Recuperação de Senha ─────────────────────────────────────────────────
  const [resetTokenResult, setResetTokenResult] = useState<{
    token: string; expiresAt: Date; userName: string | null; userEmail: string | null;
  } | null>(null);
  const [copiedResetLink, setCopiedResetLink] = useState(false);
  const generateResetTokenMutation = trpc.users.generatePasswordResetToken.useMutation({
    onSuccess: (data) => {
      setResetTokenResult(data as any);
      toast.success(`Link de recuperação gerado para ${data.userName || data.userEmail}`);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleGenerateResetLink = (userId: number) => {
    generateResetTokenMutation.mutate({ userId });
  };

  const getResetLink = (token: string) => {
    return `${window.location.origin}/redefinir-senha?token=${token}`;
  };

  const handleCopyResetLink = (token: string) => {
    navigator.clipboard.writeText(getResetLink(token));
    setCopiedResetLink(true);
    setTimeout(() => setCopiedResetLink(false), 3000);
  };

  // Query e mutations
  const usersQuery = trpc.users.list.useQuery(undefined, { enabled: isSuperAdmin });
  const utils = trpc.useUtils();

  const updateMutation = trpc.users.update.useMutation({
    onSuccess: () => { utils.users.list.invalidate(); toast.success("Usuário atualizado com sucesso"); },
    onError: (err: any) => toast.error(err.message),
  });

  const updatePasswordMutation = trpc.users.updatePassword.useMutation({
    onSuccess: () => { toast.success("Senha atualizada com sucesso"); setEditPassword(""); },
    onError: (err: any) => toast.error(err.message),
  });

  const createMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      toast.success("Usuário criado com sucesso");
      setCreatingUser(false);
      setNewName(""); setNewEmail(""); setNewPassword(""); setNewRole("visitor");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      toast.success("Usuário removido");
      setDeletingUserId(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const openEditModal = (u: { id: number; name: string | null; email: string | null; role: string | null }) => {
    setEditingUser({ id: u.id, name: u.name || "", email: u.email || "", role: u.role || "visitor" });
    setEditName(u.name || "");
    setEditEmail(u.email || "");
    setEditRole((u.role as any) || "visitor");
    setEditPassword("");
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;
    const hasDataChanges = editName !== editingUser.name || editEmail !== editingUser.email || editRole !== editingUser.role;
    const hasPasswordChange = editPassword.trim().length >= 4;
    if (hasDataChanges) {
      updateMutation.mutate({ userId: editingUser.id, name: editName, email: editEmail || undefined, role: editRole });
    }
    if (hasPasswordChange) {
      updatePasswordMutation.mutate({ userId: editingUser.id, newPassword: editPassword });
    }
    if (!hasDataChanges && !hasPasswordChange) {
      setEditingUser(null);
      return;
    }
    setTimeout(() => setEditingUser(null), 500);
  };

  const roleLabel: Record<string, string> = {
    visitor: "Visitante",
    team: "Equipe",
    coordinator: "Coordenador",
    superadmin: "Superadmin",
  };

  const roleBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    visitor: "outline",
    team: "secondary",
    coordinator: "default",
    superadmin: "destructive",
  };
  // ─────────────────────────────────────────────────────────────────────────

  const handleNavigate = (itemId: string) => {
    const routeMap: Record<string, string> = {
      "dashboard": "/dashboard",
      "realtime": "/dashboard",
      "publicacoes": "/publicacoes",
      "performance": "/performance",
      "nextweek": "/planejamento",
      "calendar": "/planejamento",
      "monthlycal": "/planejamento",
      "contentbank": "/conteudo",
      "content": "/conteudo",
      "briefing": "/conteudo",
      "tracker": "/analise",
      "growth": "/analise",
      "report": "/analise",
      "competitors": "/analise",
      "pillars": "/conteudo",
      "donts": "/conteudo",
      "moodboard": "/conteudo",
      "team": "/conteudo",
      "budget": "/conteudo",
      "supporters": "/apoiadores",
      "notifications": "/home",
      "testimonials": "/home",
      "checklist": "/home",
      "admin": "/admin"
    };
    const route = routeMap[itemId] || "/home";
    navigate(route);
  };

  const handleSaveInstagramSettings = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      if (!instagramToken.trim()) {
        setSaveStatus("error");
        setIsSaving(false);
        return;
      }
      localStorage.setItem("instagramAccessToken", instagramToken);
      localStorage.setItem("instagramUsername", instagramUsername);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSyncSettings = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      const times = syncSchedule.split(",").map(t => t.trim());
      const validTimes = times.every(t => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(t));
      if (!validTimes) {
        setSaveStatus("error");
        setIsSaving(false);
        return;
      }
      localStorage.setItem("syncSchedule", syncSchedule);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveReportSettings = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      localStorage.setItem("reportFormat", reportFormat);
      localStorage.setItem("reportFrequency", reportFrequency);
      localStorage.setItem("reportRecipients", reportRecipients);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav activeSection="configuracoes" />
      <main className={`flex-1 overflow-auto ${animationClass}`}>
        <div className="p-8 max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Configurações</h1>
            </div>
            <p className="text-muted-foreground">Gerencie credenciais do Instagram, horários de sincronização e preferências de relatórios</p>
          </div>
          <InstagramTokenAlert />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="instagram" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                <span className="hidden sm:inline">Instagram</span>
              </TabsTrigger>
              <TabsTrigger value="sync" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Sync</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Relatórios</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Usuários</span>
              </TabsTrigger>
              {["coordinator", "superadmin"].includes(effectiveRole ?? "") && (
                <TabsTrigger value="notifications" className="flex items-center gap-2 relative">
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">Notificações</span>
                  <NotifBadge />
                </TabsTrigger>
              )}
            </TabsList>

            {/* Instagram Credentials Tab */}
            <TabsContent value="instagram">
              <Card>
                <CardHeader>
                  <CardTitle>Credenciais do Instagram</CardTitle>
                  <CardDescription>
                    Configure seu token de acesso da API do Instagram Graph para sincronizar dados em tempo real
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="instagram-token">Token de Acesso</Label>
                    <Input
                      id="instagram-token"
                      type="password"
                      placeholder="Insira seu token de acesso do Instagram Graph API"
                      value={instagramToken}
                      onChange={(e) => setInstagramToken(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Obtenha seu token em{" "}
                      <a
                        href="https://developers.facebook.com/docs/instagram-graph-api"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Facebook Developers
                      </a>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram-username">Nome de Usuário</Label>
                    <Input
                      id="instagram-username"
                      placeholder="ex: eduardobrandao"
                      value={instagramUsername}
                      onChange={(e) => setInstagramUsername(e.target.value)}
                    />
                  </div>

                  {saveStatus === "success" && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">Credenciais salvas com sucesso!</span>
                    </div>
                  )}

                  {saveStatus === "error" && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Erro ao salvar. Verifique os dados e tente novamente.</span>
                    </div>
                  )}

                  <Button
                    onClick={handleSaveInstagramSettings}
                    disabled={isSaving || !instagramToken.trim()}
                    className="w-full"
                  >
                    {isSaving ? "Salvando..." : "Salvar Credenciais"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sync Schedule Tab */}
            <TabsContent value="sync">
              <Card>
                <CardHeader>
                  <CardTitle>Horários de Sincronização</CardTitle>
                  <CardDescription>
                    Configure os horários em que os dados do Instagram serão sincronizados (formato HH:mm)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="sync-schedule">Horários (separados por vírgula)</Label>
                    <Input
                      id="sync-schedule"
                      placeholder="08:00,14:00,20:00"
                      value={syncSchedule}
                      onChange={(e) => setSyncSchedule(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Exemplo: 08:00,14:00,20:00 (sincroniza 3 vezes por dia)
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                    <p className="text-sm text-blue-700">
                      <strong>Dica:</strong> Escolha horários estratégicos para sincronizar dados quando sua audiência está mais ativa.
                    </p>
                  </div>

                  {saveStatus === "success" && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">Horários salvos com sucesso!</span>
                    </div>
                  )}

                  {saveStatus === "error" && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Formato inválido. Use HH:mm (ex: 08:00)</span>
                    </div>
                  )}

                  <Button
                    onClick={handleSaveSyncSettings}
                    disabled={isSaving}
                    className="w-full"
                  >
                    {isSaving ? "Salvando..." : "Salvar Horários"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Preferências de Relatórios</CardTitle>
                  <CardDescription>
                    Configure o formato, frequência e destinatários dos relatórios automáticos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="report-format">Formato do Relatório</Label>
                    <Select value={reportFormat} onValueChange={setReportFormat}>
                      <SelectTrigger id="report-format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="both">PDF + CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="report-frequency">Frequência</Label>
                    <Select value={reportFrequency} onValueChange={setReportFrequency}>
                      <SelectTrigger id="report-frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="report-recipients">Destinatários (emails separados por vírgula)</Label>
                    <Input
                      id="report-recipients"
                      placeholder="email@example.com, outro@example.com"
                      value={reportRecipients}
                      onChange={(e) => setReportRecipients(e.target.value)}
                    />
                  </div>

                  {saveStatus === "success" && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">Preferências salvas com sucesso!</span>
                    </div>
                  )}

                  {saveStatus === "error" && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Erro ao salvar. Tente novamente.</span>
                    </div>
                  )}

                  <Button
                    onClick={handleSaveReportSettings}
                    disabled={isSaving}
                    className="w-full"
                  >
                    {isSaving ? "Salvando..." : "Salvar Preferências"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users CRUD Tab */}
            <TabsContent value="users">
              {!isSuperAdmin ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                    <ShieldCheck className="w-12 h-12 text-muted-foreground" />
                    <p className="text-muted-foreground text-center">Apenas Superadmin pode gerenciar usuários.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* ── Tabela de Usuários ── */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <UserCog className="w-5 h-5" />
                            Gerenciamento de Usuários
                          </CardTitle>
                          <CardDescription>Visualize, edite roles e remova membros da equipe da pré campanha.</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{usersQuery.data?.length ?? 0} usuários</Badge>
                          <Button size="sm" onClick={() => setCreatingUser(true)} className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            Novo Usuário
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Input
                          placeholder="Buscar por nome ou e-mail..."
                          value={userSearch}
                          onChange={(e) => { setUserSearch(e.target.value); setCurrentPage(1); }}
                          className="max-w-sm"
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {usersQuery.isLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                      ) : usersQuery.isError ? (
                        <div className="flex items-center gap-2 text-destructive py-8 justify-center">
                          <AlertCircle className="w-5 h-5" />
                          <span>Erro ao carregar usuários</span>
                        </div>
                      ) : (() => {
                        const filtered = (usersQuery.data ?? []).filter(u => {
                          const q = userSearch.toLowerCase();
                          return !q || (u.name ?? "").toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q);
                        });
                        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
                        const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
                        return (
                          <>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Nome</TableHead>
                                  <TableHead>E-mail</TableHead>
                                  <TableHead>Role</TableHead>
                                  <TableHead>Cadastro</TableHead>
                                  <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {paginated.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                      Nenhum usuário encontrado
                                    </TableCell>
                                  </TableRow>
                                ) : paginated.map((u) => (
                                  <TableRow key={u.id}>
                                    <TableCell className="font-medium">{u.name || <span className="text-muted-foreground italic">Sem nome</span>}</TableCell>
                                    <TableCell className="text-muted-foreground">{u.email || "—"}</TableCell>
                                    <TableCell>
                                      {/* Seletor de role inline — apenas Superadmin pode alterar */}
                                      {isSuperAdmin ? (
                                        <Select
                                          value={u.role ?? "visitor"}
                                          onValueChange={(newRole) => {
                                            updateMutation.mutate({
                                              userId: u.id,
                                              role: newRole as "visitor" | "team" | "coordinator" | "superadmin",
                                            });
                                          }}
                                          disabled={updateMutation.isPending}
                                        >
                                          <SelectTrigger className="h-7 w-36 text-xs">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="visitor">👁️ Visitante</SelectItem>
                                            <SelectItem value="team">👥 Equipe</SelectItem>
                                            <SelectItem value="coordinator">📋 Coordenador</SelectItem>
                                            <SelectItem value="superadmin">🔑 SuperAdmin</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      ) : (
                                        <Badge variant={roleBadgeVariant[u.role ?? "visitor"]}>
                                          {roleLabel[u.role ?? "visitor"]}
                                        </Badge>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("pt-BR") : "—"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex items-center justify-end gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleGenerateResetLink(u.id)}
                                          title="Gerar link de recuperação de senha"
                                          disabled={generateResetTokenMutation.isPending}
                                        >
                                          <Link2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => openEditModal(u)} title="Editar">
                                          <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-destructive hover:text-destructive"
                                          onClick={() => setDeletingUserId(u.id)}
                                          disabled={u.id === currentUser?.id}
                                          title={u.id === currentUser?.id ? "Não pode remover a si mesmo" : "Remover"}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            {totalPages > 1 && (
                              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                                <span>
                                  Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length} usuários
                                </span>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Anterior</Button>
                                  <span className="px-2">{currentPage} / {totalPages}</span>
                                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Próxima</Button>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  {/* ── Log de Acesso ── */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Log de Acesso
                          </CardTitle>
                          <CardDescription>Histórico de logins bem-sucedidos na plataforma.</CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => accessLogsQuery.refetch()}
                          disabled={accessLogsQuery.isFetching}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className={`w-4 h-4 ${accessLogsQuery.isFetching ? "animate-spin" : ""}`} />
                          Atualizar
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {accessLogsQuery.isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                        </div>
                      ) : accessLogsQuery.isError ? (
                        <div className="flex items-center gap-2 text-destructive py-6 justify-center">
                          <AlertCircle className="w-5 h-5" />
                          <span>Erro ao carregar logs</span>
                        </div>
                      ) : (
                        <>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Usuário</TableHead>
                                <TableHead>E-mail</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>IP</TableHead>
                                <TableHead>Data/Hora</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(accessLogsQuery.data ?? []).length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                    Nenhum acesso registrado ainda
                                  </TableCell>
                                </TableRow>
                              ) : (accessLogsQuery.data ?? []).map((log) => (
                                <TableRow key={log.id}>
                                  <TableCell className="font-medium">{log.userName || "—"}</TableCell>
                                  <TableCell className="text-muted-foreground text-sm">{log.userEmail || "—"}</TableCell>
                                  <TableCell>
                                    <Badge variant={roleBadgeVariant[log.userRole ?? "visitor"]}>
                                      {roleLabel[log.userRole ?? "visitor"]}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-muted-foreground text-xs font-mono">{log.ipAddress || "—"}</TableCell>
                                  <TableCell className="text-muted-foreground text-sm">
                                    {log.createdAt ? new Date(log.createdAt).toLocaleString("pt-BR") : "—"}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          {(accessLogsQuery.data?.length ?? 0) >= logLimit && (
                            <div className="mt-4 text-center">
                              <Button variant="outline" size="sm" onClick={() => setLogLimit(l => l + 50)}>
                                Carregar mais
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Modal de Edição Completa */}
              <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Editar Usuário</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Nome</Label>
                      <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nome completo" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">E-mail</Label>
                      <Input id="edit-email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="email@exemplo.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-role">Nível de Acesso</Label>
                      <Select value={editRole} onValueChange={(v) => setEditRole(v as any)}>
                        <SelectTrigger id="edit-role"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visitor"><div className="flex items-center gap-2"><Eye className="w-4 h-4" /> Visitante — só visualização</div></SelectItem>
                          <SelectItem value="team"><div className="flex items-center gap-2"><Users className="w-4 h-4" /> Equipe — acesso total sem publicação</div></SelectItem>
                          <SelectItem value="coordinator"><div className="flex items-center gap-2"><UserCog className="w-4 h-4" /> Coordenador — acesso total com publicação</div></SelectItem>
                          <SelectItem value="superadmin"><div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Superadmin — acesso total e administração</div></SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-password">Nova Senha <span className="text-muted-foreground text-xs">(deixe em branco para não alterar)</span></Label>
                      <div className="relative">
                        <Input
                          id="edit-password"
                          type={showEditPassword ? "text" : "password"}
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="Mínimo 4 caracteres"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowEditPassword(!showEditPassword)}
                        >
                          {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingUser(null)}>Cancelar</Button>
                    <Button
                      onClick={handleSaveEdit}
                      disabled={updateMutation.isPending || updatePasswordMutation.isPending || !editName.trim()}
                    >
                      {(updateMutation.isPending || updatePasswordMutation.isPending) ? "Salvando..." : "Salvar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Modal de Criação de Usuário */}
              <Dialog open={creatingUser} onOpenChange={(open) => !open && setCreatingUser(false)}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Novo Usuário</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="new-name">Nome</Label>
                      <Input id="new-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome completo" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-email">E-mail</Label>
                      <Input id="new-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@exemplo.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Mínimo 4 caracteres"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-role">Nível de Acesso</Label>
                      <Select value={newRole} onValueChange={(v) => setNewRole(v as any)}>
                        <SelectTrigger id="new-role"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visitor"><div className="flex items-center gap-2"><Eye className="w-4 h-4" /> Visitante</div></SelectItem>
                          <SelectItem value="team"><div className="flex items-center gap-2"><Users className="w-4 h-4" /> Equipe</div></SelectItem>
                          <SelectItem value="coordinator"><div className="flex items-center gap-2"><UserCog className="w-4 h-4" /> Coordenador</div></SelectItem>
                          <SelectItem value="superadmin"><div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Superadmin</div></SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreatingUser(false)}>Cancelar</Button>
                    <Button
                      onClick={() => createMutation.mutate({ name: newName, email: newEmail, password: newPassword, role: newRole })}
                      disabled={createMutation.isPending || !newName.trim() || !newEmail.trim() || newPassword.length < 4}
                    >
                      {createMutation.isPending ? "Criando..." : "Criar Usuário"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Confirm de Exclusão */}
              <AlertDialog open={!!deletingUserId} onOpenChange={(open) => !open && setDeletingUserId(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover usuário?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. O usuário perderá acesso à plataforma imediatamente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => deletingUserId && deleteMutation.mutate({ userId: deletingUserId })}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? "Removendo..." : "Remover"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Modal: Link de Recuperação de Senha Gerado */}
              <Dialog open={!!resetTokenResult} onOpenChange={(open) => !open && setResetTokenResult(null)}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Link2 className="w-5 h-5 text-primary" />
                      Link de Recuperação Gerado
                    </DialogTitle>
                  </DialogHeader>
                  {resetTokenResult && (
                    <div className="space-y-4 py-2">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium">{resetTokenResult.userName || resetTokenResult.userEmail}</p>
                        <p className="text-xs text-muted-foreground">{resetTokenResult.userEmail}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Link de Redefinição de Senha</Label>
                        <div className="flex gap-2">
                          <Input
                            readOnly
                            value={getResetLink(resetTokenResult.token)}
                            className="font-mono text-xs"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyResetLink(resetTokenResult.token)}
                            className="shrink-0"
                          >
                            {copiedResetLink ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-700">
                          <strong>Atenção:</strong> Este link expira em{" "}
                          <strong>{new Date(resetTokenResult.expiresAt).toLocaleString("pt-BR")}</strong>.
                          Envie-o ao usuário pelo WhatsApp ou e-mail.
                        </p>
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button onClick={() => setResetTokenResult(null)}>Fechar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* ─── Aba Notificações ─────────────────────────────────────────── */}
            {["coordinator", "superadmin"].includes(effectiveRole ?? "") && (
              <TabsContent value="notifications">
                <NotificationsTab isSuperAdmin={isSuperAdmin} />
              </TabsContent>
            )}

          </Tabs>
        </div>
      </main>
    </div>
  );
}

// ─── Tipos de notificação ─────────────────────────────────────────────────────
type NotifType =
  | "novo_cadastro" | "novo_post" | "evento_criado" | "evento_confirmado"
  | "evento_realizado" | "instagram_sync" | "token_expirando" | "sistema" | "outro" | "all";

const NOTIF_TYPE_LABELS: Record<string, string> = {
  novo_cadastro: "Novo Cadastro",
  novo_post: "Novo Post",
  evento_criado: "Evento Criado",
  evento_confirmado: "Evento Confirmado",
  evento_realizado: "Evento Realizado",
  instagram_sync: "Sync Instagram",
  token_expirando: "Token Expirando",
  sistema: "Sistema",
  outro: "Outro",
};

const NOTIF_TYPE_ICONS: Record<string, React.ReactNode> = {
  novo_cadastro: <UserPlusIcon className="w-4 h-4 text-blue-400" />,
  novo_post: <Instagram className="w-4 h-4 text-pink-400" />,
  evento_criado: <CalendarPlus className="w-4 h-4 text-green-400" />,
  evento_confirmado: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  evento_realizado: <CheckCheck className="w-4 h-4 text-teal-400" />,
  instagram_sync: <RefreshCcw className="w-4 h-4 text-purple-400" />,
  token_expirando: <AlertCircle className="w-4 h-4 text-yellow-400" />,
  sistema: <Info className="w-4 h-4 text-gray-400" />,
  outro: <Bell className="w-4 h-4 text-gray-400" />,
};

// ─── Badge de não lidas (usado no TabsTrigger) ────────────────────────────────
function NotifBadge() {
  const { data } = trpc.notifications.countUnread.useQuery(undefined, {
    refetchInterval: 60_000,
  });
  const count = data?.count ?? 0;
  if (count === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}
// Mapa de redirecionamento por tipo de notificação
// Para notificações com ação: { tab: aba destino na SettingsPage, route: rota externa }
const NOTIF_ACTION_MAP: Record<string, { tab?: string; route?: string }> = {
  novo_cadastro: { tab: "users" },
  instagram_sync: { tab: "instagram" },
  token_expirando: { tab: "instagram" },
  evento_criado: { route: "/agenda-rua" },
  evento_confirmado: { route: "/agenda-rua" },
  evento_realizado: { route: "/agenda-rua" },
};

// ─── Aba completa de Notificações ───────────────────────────────────────────────
function NotificationsTab({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const utils = trpc.useUtils();
  const [, navigate] = useLocation();
  const [filterType, setFilterType] = useState<NotifType>("all");
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { data: notifs, isLoading } = trpc.notifications.list.useQuery(
    { limit: 100, offset: 0, onlyUnread, type: filterType },
    { refetchInterval: 30_000 }
  );

  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.countUnread.invalidate();
    },
  });

  // Ao clicar no card: marcar como lida + redirecionar se houver ação mapeada
  const handleNotifClick = (notif: { id: number; type: string; isRead: number }) => {
    if (!notif.isRead) {
      markRead.mutate({ id: notif.id });
    }
    const action = NOTIF_ACTION_MAP[notif.type];
    if (!action) return;
    if (action.route) {
      navigate(action.route);
    } else if (action.tab) {
      // Redirecionar para a aba correta na SettingsPage
      // O componente pai controla o activeTab via prop, mas aqui usamos o setActiveTab do pai
      // Como NotificationsTab é filho, vamos usar um evento customizado via window
      window.dispatchEvent(new CustomEvent("settings:navigate-tab", { detail: { tab: action.tab } }));
    }
  };

  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.countUnread.invalidate();
      toast.success("Todas as notificações marcadas como lidas");
    },
  });

  const deleteNotif = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.countUnread.invalidate();
      setDeletingId(null);
      toast.success("Notificação excluída");
    },
  });

  const unreadCount = notifs?.filter(n => !n.isRead).length ?? 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-green-400" />
              Notificações
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">{unreadCount} não lidas</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Alertas do sistema, novos cadastros, eventos e sincronizações do Instagram
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOnlyUnread(v => !v)}
              className={onlyUnread ? "border-green-500 text-green-400" : ""}
            >
              {onlyUnread ? <BellOff className="w-4 h-4 mr-1" /> : <Bell className="w-4 h-4 mr-1" />}
              {onlyUnread ? "Mostrar todas" : "Só não lidas"}
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>

        {/* Filtro por tipo */}
        <div className="flex items-center gap-2 flex-wrap mt-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtrar:</span>
          {(["all", "novo_cadastro", "novo_post", "evento_criado", "evento_confirmado", "evento_realizado", "instagram_sync", "token_expirando", "sistema"] as NotifType[]).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                filterType === t
                  ? "bg-green-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {t === "all" ? "Todos" : NOTIF_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-green-400" />
            <span className="ml-2 text-muted-foreground">Carregando notificações...</span>
          </div>
        ) : !notifs || notifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BellOff className="w-12 h-12 text-gray-600 mb-3" />
            <p className="text-muted-foreground font-medium">Nenhuma notificação encontrada</p>
            <p className="text-sm text-gray-500 mt-1">
              {onlyUnread ? "Você está em dia! Nenhuma notificação não lida." : "Não há notificações para os filtros selecionados."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifs.map(notif => (
              <div
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  notif.isRead
                    ? "border-white/5 bg-white/2 opacity-70 hover:bg-white/5"
                    : "border-green-500/20 bg-green-500/5 hover:bg-green-500/10"
                } ${NOTIF_ACTION_MAP[notif.type] ? "cursor-pointer" : ""}`}
              >
                {/* Ícone do tipo */}
                <div className="mt-0.5 shrink-0">
                  {NOTIF_TYPE_ICONS[notif.type] ?? <Bell className="w-4 h-4 text-gray-400" />}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-semibold text-sm ${notif.isRead ? "text-muted-foreground" : "text-foreground"}`}>
                      {notif.title}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {NOTIF_TYPE_LABELS[notif.type] ?? notif.type}
                    </Badge>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" title="Não lida" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 break-words">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notif.createdAt).toLocaleString("pt-BR")}
                    {notif.isRead && notif.readAt && (
                      <span className="ml-2 text-gray-600">
                        · Lida em {new Date(notif.readAt).toLocaleString("pt-BR")}
                      </span>
                    )}
                  </p>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1 shrink-0">
                  {!notif.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-green-400 hover:text-green-300"
                      title="Marcar como lida"
                      onClick={() => markRead.mutate({ id: notif.id })}
                      disabled={markRead.isPending}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  {isSuperAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-red-400 hover:text-red-300"
                      title="Excluir notificação"
                      onClick={() => setDeletingId(notif.id)}
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Confirm de exclusão */}
      <AlertDialog open={deletingId !== null} onOpenChange={open => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir notificação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A notificação será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deletingId !== null && deleteNotif.mutate({ id: deletingId })}
              disabled={deleteNotif.isPending}
            >
              {deleteNotif.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
