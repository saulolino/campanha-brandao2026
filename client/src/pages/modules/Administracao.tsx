import DashboardLayout from "../DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users, Settings, Trash2, Edit2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const users = [
  { id: 1, name: "Eduardo Brandão", email: "eduardo@teste.com", role: "superadmin", status: "Ativo" },
  { id: 2, name: "Designer Teste", email: "designer@teste.com", role: "team", status: "Ativo" },
  { id: 3, name: "Redator Teste", email: "redator@teste.com", role: "team", status: "Ativo" },
  { id: 4, name: "Coordenador Teste", email: "coordenador@teste.com", role: "coordinator", status: "Ativo" },
];

const systemLogs = [
  { timestamp: "07/04/2026 14:30", action: "Post Publicado", user: "Coordenador Teste", details: "Post 'Dicas de Crescimento'" },
  { timestamp: "07/04/2026 10:15", action: "Usuário Criado", user: "Eduardo Brandão", details: "Designer Teste adicionado" },
  { timestamp: "06/04/2026 18:45", action: "Configuração Alterada", user: "Eduardo Brandão", details: "Meta de seguidores atualizada" },
  { timestamp: "05/04/2026 09:00", action: "Relatório Gerado", user: "Sistema", details: "Relatório semanal criado" },
];

export default function Administracao() {
  const { user } = useAuth();

  // Verificar se é SuperAdmin
  if (user?.role !== "superadmin") {
    return (
      <DashboardLayout activeSection="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 border-red-500/20 bg-red-500/5 text-center">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">Apenas SuperAdmins podem acessar esta área.</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeSection="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Administração</h1>
          <p className="text-muted-foreground">Gerenciar plataforma, usuários e configurações</p>
        </div>

        {/* Estatísticas do Sistema */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">Usuários Ativos</p>
            <p className="text-3xl font-bold">4</p>
          </Card>
          <Card className="p-6 border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">Posts Publicados</p>
            <p className="text-3xl font-bold">42</p>
          </Card>
          <Card className="p-6 border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">Seguidores</p>
            <p className="text-3xl font-bold">18.8K</p>
          </Card>
          <Card className="p-6 border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">Engajamento Médio</p>
            <p className="text-3xl font-bold">8.2%</p>
          </Card>
        </div>

        {/* Gerenciamento de Usuários */}
        <Card className="p-6 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Gerenciamento de Usuários</h2>
            </div>
            <Button size="sm">Adicionar Usuário</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary/10">
                  <th className="text-left py-2 px-4">Nome</th>
                  <th className="text-left py-2 px-4">Email</th>
                  <th className="text-left py-2 px-4">Função</th>
                  <th className="text-left py-2 px-4">Status</th>
                  <th className="text-left py-2 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-primary/5 hover:bg-primary/5">
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs font-medium">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded text-xs font-medium">
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="destructive" className="gap-1">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Configurações do Sistema */}
        <Card className="p-6 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Configurações do Sistema</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">Meta de Seguidores</p>
                  <p className="text-xs text-muted-foreground">Objetivo principal da campanha</p>
                </div>
                <input type="number" defaultValue="20000" className="w-24 px-2 py-1 rounded border border-primary/20" />
              </div>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">Frequência Mínima de Posts</p>
                  <p className="text-xs text-muted-foreground">Posts por dia</p>
                </div>
                <input type="number" defaultValue="2" className="w-24 px-2 py-1 rounded border border-primary/20" />
              </div>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">Modo de Manutenção</p>
                  <p className="text-xs text-muted-foreground">Desabilitar acesso temporariamente</p>
                </div>
                <input type="checkbox" className="w-5 h-5 rounded" />
              </div>
            </div>
            <Button className="w-full mt-4">Salvar Configurações</Button>
          </div>
        </Card>

        {/* Log de Atividades */}
        <Card className="p-6 border-primary/20">
          <h2 className="text-xl font-semibold mb-4">Log de Atividades</h2>
          <div className="space-y-3">
            {systemLogs.map((log, idx) => (
              <div key={idx} className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-sm">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground">{log.details}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Backup e Segurança */}
        <Card className="p-6 border-primary/20">
          <h2 className="text-xl font-semibold mb-4">Backup e Segurança</h2>
          <div className="space-y-3">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">Último Backup</p>
                  <p className="text-xs text-muted-foreground">07/04/2026 às 02:00</p>
                </div>
                <Button size="sm">Fazer Backup Agora</Button>
              </div>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">Autenticação de Dois Fatores</p>
                  <p className="text-xs text-muted-foreground">Aumentar segurança da plataforma</p>
                </div>
                <input type="checkbox" className="w-5 h-5 rounded" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
