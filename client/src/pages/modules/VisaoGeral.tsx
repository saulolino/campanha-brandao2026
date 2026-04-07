import DashboardLayout from "../DashboardLayout";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const growthData = [
  { week: "Sem 1", followers: 15000 },
  { week: "Sem 2", followers: 16200 },
  { week: "Sem 3", followers: 17500 },
  { week: "Sem 4", followers: 18800 },
];

const engagementData = [
  { name: "Curtidas", value: 4500 },
  { name: "Comentários", value: 1200 },
  { name: "Compartilhamentos", value: 800 },
  { name: "Visualizações", value: 12000 },
];

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"];

export default function VisaoGeral() {
  return (
    <DashboardLayout activeSection="dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Visão Geral</h1>
          <p className="text-muted-foreground">Métricas e progresso da campanha em tempo real</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">Seguidores</p>
            <p className="text-3xl font-bold">18.8K</p>
            <p className="text-xs text-green-500 mt-2">+3.8K este mês</p>
          </Card>
          <Card className="p-6 border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">Posts Publicados</p>
            <p className="text-3xl font-bold">42</p>
            <p className="text-xs text-green-500 mt-2">+8 esta semana</p>
          </Card>
          <Card className="p-6 border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">Engajamento Médio</p>
            <p className="text-3xl font-bold">8.2%</p>
            <p className="text-xs text-green-500 mt-2">+1.2% vs semana anterior</p>
          </Card>
          <Card className="p-6 border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">Posts Agendados</p>
            <p className="text-3xl font-bold">12</p>
            <p className="text-xs text-blue-500 mt-2">Próximos 7 dias</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Growth Chart */}
          <Card className="p-6 border-primary/20">
            <h3 className="text-lg font-semibold mb-4">Crescimento de Seguidores</h3>
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

          {/* Engagement Distribution */}
          <Card className="p-6 border-primary/20">
            <h3 className="text-lg font-semibold mb-4">Distribuição de Engajamento</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={engagementData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {engagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Engagement by Day */}
        <Card className="p-6 border-primary/20">
          <h3 className="text-lg font-semibold mb-4">Engajamento ao Longo da Semana</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { day: "Seg", engagement: 1200 },
              { day: "Ter", engagement: 1900 },
              { day: "Qua", engagement: 1600 },
              { day: "Qui", engagement: 2100 },
              { day: "Sex", engagement: 2800 },
              { day: "Sab", engagement: 2200 },
              { day: "Dom", engagement: 1800 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="engagement" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </DashboardLayout>
  );
}
