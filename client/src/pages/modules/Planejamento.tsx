import DashboardLayout from "../DashboardLayout";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";

const weeklyPosts = [
  { day: "Segunda", date: "10/04", posts: 2, time: "09:00 e 18:00" },
  { day: "Terça", date: "11/04", posts: 1, time: "14:00" },
  { day: "Quarta", date: "12/04", posts: 2, time: "09:00 e 20:00" },
  { day: "Quinta", date: "13/04", posts: 1, time: "18:00" },
  { day: "Sexta", date: "14/04", posts: 3, time: "09:00, 14:00 e 20:00" },
  { day: "Sábado", date: "15/04", posts: 2, time: "11:00 e 19:00" },
  { day: "Domingo", date: "16/04", posts: 1, time: "15:00" },
];

export default function Planejamento() {
  return (
    <DashboardLayout activeSection="planejamento">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Planejamento</h1>
          <p className="text-muted-foreground">Organize posts e conteúdo para a semana</p>
        </div>

        {/* Próxima Semana */}
        <Card className="p-6 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Próxima Semana (10-16 de Abril)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {weeklyPosts.map((item, idx) => (
              <div key={idx} className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="font-semibold text-sm">{item.day}</p>
                <p className="text-xs text-muted-foreground mb-3">{item.date}</p>
                <div className="flex items-center gap-2 text-sm mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>{item.posts} post(s)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Calendário Semanal */}
        <Card className="p-6 border-primary/20">
          <h2 className="text-xl font-semibold mb-4">Calendário Semanal</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary/10">
                  <th className="text-left py-2 px-4">Dia</th>
                  <th className="text-left py-2 px-4">Data</th>
                  <th className="text-left py-2 px-4">Posts</th>
                  <th className="text-left py-2 px-4">Horários</th>
                  <th className="text-left py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {weeklyPosts.map((item, idx) => (
                  <tr key={idx} className="border-b border-primary/5 hover:bg-primary/5">
                    <td className="py-3 px-4 font-medium">{item.day}</td>
                    <td className="py-3 px-4">{item.date}</td>
                    <td className="py-3 px-4">{item.posts}</td>
                    <td className="py-3 px-4 text-xs">{item.time}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded text-xs font-medium">
                        Planejado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Calendário Mensal */}
        <Card className="p-6 border-primary/20">
          <h2 className="text-xl font-semibold mb-4">Calendário Mensal - Abril</h2>
          <div className="grid grid-cols-7 gap-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
              <div key={day} className="text-center font-semibold text-sm py-2">
                {day}
              </div>
            ))}
            {[...Array(31)].map((_, i) => (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center rounded border ${
                  i % 7 === 5 || i % 7 === 6
                    ? "bg-primary/5 border-primary/10"
                    : "bg-background border-primary/5"
                } hover:bg-primary/10 cursor-pointer transition-colors`}
              >
                <span className="text-sm font-medium">{i + 1}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
