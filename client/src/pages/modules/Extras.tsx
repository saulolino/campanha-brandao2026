import DashboardLayout from "../DashboardLayout";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CheckSquare } from "lucide-react";

const competitorData = [
  { name: "Nossa Campanha", followers: 18800, engagement: 8.2 },
  { name: "Concorrente A", followers: 22000, engagement: 6.5 },
  { name: "Concorrente B", followers: 15500, engagement: 7.1 },
  { name: "Concorrente C", followers: 19200, engagement: 5.8 },
];

const checklist = [
  { category: "Antes de Publicar", items: [
    { text: "Verificar ortografia e gramática", completed: true },
    { text: "Conferir links e hashtags", completed: true },
    { text: "Revisar imagem/vídeo", completed: true },
    { text: "Testar no celular", completed: false },
  ]},
  { category: "Conteúdo", items: [
    { text: "Alinhado com pilares", completed: true },
    { text: "Imagem de qualidade", completed: true },
    { text: "Legenda engajadora", completed: true },
    { text: "Call-to-action claro", completed: false },
  ]},
  { category: "Publicação", items: [
    { text: "Horário correto", completed: true },
    { text: "Hashtags relevantes", completed: true },
    { text: "Aprovação do Coordenador", completed: false },
    { text: "Agendamento confirmado", completed: false },
  ]},
];

export default function Extras() {
  return (
    <DashboardLayout activeSection="extras">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Extras</h1>
          <p className="text-muted-foreground">Ferramentas adicionais e análises</p>
        </div>

        {/* Análise de Concorrentes */}
        <Card className="p-6 border-primary/20">
          <h2 className="text-xl font-semibold mb-4">Análise de Concorrentes</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Comparação de desempenho com perfis similares
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={competitorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="followers" fill="#3b82f6" name="Seguidores" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-sm font-semibold mb-2">Nossa Posição</p>
              <p className="text-xs text-muted-foreground">
                Estamos em 2º lugar em engajamento (8.2%), mas precisamos crescer em seguidores para alcançar os concorrentes.
              </p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-sm font-semibold mb-2">Oportunidade</p>
              <p className="text-xs text-muted-foreground">
                Aumentar frequência de posts e melhorar qualidade do conteúdo para competir com Concorrente A.
              </p>
            </div>
          </div>
        </Card>

        {/* Checklist de Publicação */}
        <Card className="p-6 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Checklist de Publicação</h2>
          </div>
          <div className="space-y-6">
            {checklist.map((section, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-sm mb-3">{section.category}</h3>
                <div className="space-y-2">
                  {section.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex items-center gap-3 p-3 bg-primary/5 rounded border border-primary/10"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        readOnly
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                      <span className={`text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Dicas e Boas Práticas */}
        <Card className="p-6 border-primary/20">
          <h2 className="text-xl font-semibold mb-4">Dicas e Boas Práticas</h2>
          <div className="space-y-3">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="font-semibold text-sm mb-2">✓ O que Funciona</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Vídeos com depoimentos (12.3% engajamento)</li>
                <li>• Posts ao final de semana (maior alcance)</li>
                <li>• Conteúdo com call-to-action claro</li>
              </ul>
            </div>
            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <p className="font-semibold text-sm mb-2">✗ O que Não Funciona</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Posts muito longos (menos leitura)</li>
                <li>• Imagens com baixa qualidade</li>
                <li>• Falta de resposta a comentários</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="font-semibold text-sm mb-2">💡 Recomendações</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Testar diferentes horários de publicação</li>
                <li>• Aumentar frequência de Stories</li>
                <li>• Criar mais conteúdo interativo (enquetes, perguntas)</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Recursos Úteis */}
        <Card className="p-6 border-primary/20">
          <h2 className="text-xl font-semibold mb-4">Recursos Úteis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="#" className="p-4 bg-primary/5 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors">
              <p className="font-semibold text-sm mb-1">Instagram Insights</p>
              <p className="text-xs text-muted-foreground">Análise detalhada de desempenho</p>
            </a>
            <a href="#" className="p-4 bg-primary/5 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors">
              <p className="font-semibold text-sm mb-1">Meta Business Suite</p>
              <p className="text-xs text-muted-foreground">Gerenciar publicações e anúncios</p>
            </a>
            <a href="#" className="p-4 bg-primary/5 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors">
              <p className="font-semibold text-sm mb-1">Canva</p>
              <p className="text-xs text-muted-foreground">Criar designs profissionais</p>
            </a>
            <a href="#" className="p-4 bg-primary/5 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors">
              <p className="font-semibold text-sm mb-1">Hootsuite</p>
              <p className="text-xs text-muted-foreground">Agendar e gerenciar posts</p>
            </a>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
