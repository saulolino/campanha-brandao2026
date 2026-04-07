import DashboardLayout from "../DashboardLayout";
import { Card } from "@/components/ui/card";
import { Users, DollarSign, Clock } from "lucide-react";

const teamMembers = [
  { name: "Eduardo Brandão", role: "Candidato", hours: "Estratégia e Visão", color: "bg-purple-500/20" },
  { name: "Designer", role: "Criação Visual", hours: "30h/semana", color: "bg-blue-500/20" },
  { name: "Redator", role: "Conteúdo", hours: "25h/semana", color: "bg-green-500/20" },
  { name: "Coordenador", role: "Publicação", hours: "20h/semana", color: "bg-orange-500/20" },
  { name: "Analista", role: "Métricas", hours: "15h/semana", color: "bg-pink-500/20" },
];

const budget = [
  { category: "Publicidade", amount: "R$ 5.000", percentage: 50 },
  { category: "Produção de Conteúdo", amount: "R$ 2.000", percentage: 20 },
  { category: "Ferramentas", amount: "R$ 1.500", percentage: 15 },
  { category: "Contingência", amount: "R$ 1.500", percentage: 15 },
];

export default function Recursos() {
  return (
    <DashboardLayout activeSection="recursos">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Recursos</h1>
          <p className="text-muted-foreground">Equipe e orçamento da campanha</p>
        </div>

        {/* Equipe */}
        <Card className="p-6 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Equipe</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.map((member, idx) => (
              <div key={idx} className={`p-4 rounded-lg border border-primary/10 ${member.color}`}>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{member.hours}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Responsabilidades */}
        <Card className="p-6 border-primary/20">
          <h2 className="text-xl font-semibold mb-4">Responsabilidades por Função</h2>
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <h3 className="font-semibold text-sm mb-2">Designer</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Criar designs visuais para posts</li>
                <li>• Manter consistência visual</li>
                <li>• Produzir conteúdo visual original</li>
              </ul>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <h3 className="font-semibold text-sm mb-2">Redator</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Escrever legendas engajadoras</li>
                <li>• Revisar conteúdo</li>
                <li>• Garantir qualidade textual</li>
              </ul>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <h3 className="font-semibold text-sm mb-2">Coordenador</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Revisar e aprovar posts</li>
                <li>• Publicar no Instagram</li>
                <li>• Gerenciar cronograma</li>
              </ul>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <h3 className="font-semibold text-sm mb-2">Analista</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Acompanhar métricas</li>
                <li>• Gerar relatórios</li>
                <li>• Sugerir otimizações</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Orçamento */}
        <Card className="p-6 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Orçamento Mensal</h2>
          </div>
          <div className="space-y-4">
            {budget.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{item.category}</span>
                  <span className="text-sm font-semibold">{item.amount}</span>
                </div>
                <div className="w-full bg-primary/10 rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-sm font-semibold">Total Mensal: R$ 10.000</p>
              <p className="text-xs text-muted-foreground mt-1">Orçamento alocado para a campanha</p>
            </div>
          </div>
        </Card>

        {/* Ferramentas */}
        <Card className="p-6 border-primary/20">
          <h2 className="text-xl font-semibold mb-4">Ferramentas Utilizadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="font-semibold text-sm mb-2">Canva Pro</p>
              <p className="text-xs text-muted-foreground">Design e criação visual</p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="font-semibold text-sm mb-2">Meta Business Suite</p>
              <p className="text-xs text-muted-foreground">Gerenciamento de publicações</p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="font-semibold text-sm mb-2">Google Analytics</p>
              <p className="text-xs text-muted-foreground">Análise de tráfego</p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="font-semibold text-sm mb-2">Hootsuite</p>
              <p className="text-xs text-muted-foreground">Agendamento de posts</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
