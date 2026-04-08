import { useState } from "react";
import { useLocation } from "wouter";
import { usePageTransition } from "@/hooks/usePageTransition";
import SidebarNav from "@/components/SidebarNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Settings, Clock, FileText, Key } from "lucide-react";

export default function SettingsPage() {
  const [, navigate] = useLocation();
  const { animationClass } = usePageTransition();
  const [activeTab, setActiveTab] = useState("instagram");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // Instagram Credentials
  const [instagramToken, setInstagramToken] = useState(localStorage.getItem("instagramAccessToken") || "");
  const [instagramUsername, setInstagramUsername] = useState(localStorage.getItem("instagramUsername") || "");

  // Sync Schedule
  const [syncSchedule, setSyncSchedule] = useState(localStorage.getItem("syncSchedule") || "08:00,14:00,20:00");

  // Report Preferences
  const [reportFormat, setReportFormat] = useState(localStorage.getItem("reportFormat") || "pdf");
  const [reportFrequency, setReportFrequency] = useState(localStorage.getItem("reportFrequency") || "weekly");
  const [reportRecipients, setReportRecipients] = useState(localStorage.getItem("reportRecipients") || "");

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
      // Validar token
      if (!instagramToken.trim()) {
        setSaveStatus("error");
        setIsSaving(false);
        return;
      }

      // Salvar no localStorage (em produção, seria no banco de dados via tRPC)
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
      // Validar formato HH:mm,HH:mm,HH:mm
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
        <div className="p-8 max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Configurações</h1>
            </div>
            <p className="text-muted-foreground">Gerencie credenciais do Instagram, horários de sincronização e preferências de relatórios</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="instagram" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                <span className="hidden sm:inline">Credenciais Instagram</span>
                <span className="sm:hidden">Instagram</span>
              </TabsTrigger>
              <TabsTrigger value="sync" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Sincronização</span>
                <span className="sm:hidden">Sync</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Relatórios</span>
                <span className="sm:hidden">Reports</span>
              </TabsTrigger>
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
                      type="email"
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
          </Tabs>
        </div>
      </main>
    </div>
  );
}
