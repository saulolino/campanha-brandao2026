import DashboardLayout from "../DashboardLayout";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, FileText, ClipboardList } from "lucide-react";

const statusData = [
  { id: 1, title: "Post Carrossel - Dicas de Crescimento", status: "Publicado", date: "07/04", engagement: "8.5%" },
  { id: 2, title: "Vídeo - Testemunho de Apoiador", status: "Publicado", date: "06/04", engagement: "12.3%" },
  { id: 3, title: "Post - Anúncio de Evento", status: "Agendado", date: "10/04", engagement: "-" },
  { id: 4, title: "Story - Behind the Scenes", status: "Rascunho", date: "-", engagement: "-" },
];

const growthData = [
  { week: "Sem 1", followers: 15000, engagement: 6.2 },
  { week: "Sem 2", followers: 16200, engagement: 7.1 },
  { week: "Sem 3", followers: 17500, engagement: 7.8 },
  { week: "Sem 4", followers: 18800, engagement: 8.2 },
];

export default function Analise() {
  return (
    <DashboardLayout activeSection="analise">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Análise</h1>
          <p className="text-muted-foreground">Acompanhe o desempenho da campanha</p>
        </div>

        {/* Status dos Posts */}
        <Card className="p-6 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Status dos Posts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary/10">
                  <th className="text-left py-2 px-4">Título</th>
                  <th className="text-left py-2 px-4">Status</th>
                  <th className="text-left py-2 px-4">Data</th>
                  <th className="text-left py-2 px-4">Engajamento</th>
                </tr>
              </thead>
              <tbody>
                {statusData.map((item) => (
                  <tr key={item.id} className="border-b border-primary/5 hover:bg-primary/5">
                    <td className="py-3 px-4">{item.title}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === "Publicado"
                            ? "bg-green-500/20 text-green-600"
                            : item.status === "Agendado"
                            ? "bg-blue-500/20 text-blue-600"
                            : "bg-gray-500/20 text-gray-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{item.date}</td>
                    <td className="py-3 px-4">{item.engagement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Crescimento e Engajamento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Crescimento de Seguidores</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="followers" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Taxa de Engajamento</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="engagement" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Relatório Semanal */}
        <Card className="p-6 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Relatório Semanal</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <h3 className="font-semibold text-sm mb-2">Semana de 07-13 de Abril</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ 14 posts publicados</li>
                <li>✓ 3.300 novos seguidores</li>
                <li>✓ Taxa média de engajamento: 8.2%</li>
                <li>✓ Melhor post: "Testemunho de Apoiador" com 12.3% de engajamento</li>
              </ul>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <h3 className="font-semibold text-sm mb-2">Recomendações</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Aumentar frequência de vídeos (melhor desempenho)</li>
                <li>• Publicar mais aos finais de semana (maior engajamento)</li>
                <li>• Manter consistência com horários de pico (9h, 14h, 18h, 20h)</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
