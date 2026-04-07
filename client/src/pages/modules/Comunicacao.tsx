import DashboardLayout from "../DashboardLayout";
import { Card } from "@/components/ui/card";
import { Heart, Bell, MessageCircle } from "lucide-react";

const supporterProtocol = [
  { step: 1, title: "Compartilhamento", description: "Compartilhe posts nos grupos de WhatsApp" },
  { step: 2, title: "Engajamento", description: "Curta, comente e compartilhe com amigos" },
  { step: 3, title: "Feedback", description: "Envie sugestões de conteúdo" },
  { step: 4, title: "Evangelismo", description: "Convide novos apoiadores" },
];

const notifications = [
  { type: "Post Publicado", message: "Novo post disponível para compartilhar", time: "Hoje às 14:30" },
  { type: "Novo Seguidor", message: "Atingimos 18.800 seguidores!", time: "Hoje às 10:15" },
  { type: "Comentário", message: "Novo comentário em seu post", time: "Ontem às 18:45" },
];

const testimonials = [
  {
    name: "João Silva",
    role: "Apoiador",
    text: "Adorei participar dessa campanha! Muito inspirador.",
    date: "05/04/2026",
  },
  {
    name: "Maria Santos",
    role: "Voluntária",
    text: "Excelente iniciativa para o crescimento da comunidade.",
    date: "04/04/2026",
  },
  {
    name: "Pedro Oliveira",
    role: "Apoiador",
    text: "Estou muito animado com os resultados. Continuamos crescendo!",
    date: "03/04/2026",
  },
];

export default function Comunicacao() {
  return (
    <DashboardLayout activeSection="comunicacao">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Comunicação</h1>
          <p className="text-muted-foreground">Engaje com apoiadores e voluntários</p>
        </div>

        {/* Guia do Apoiador */}
        <Card className="p-6 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Guia do Apoiador</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Protocolo de engajamento e missões para voluntários que desejam participar da campanha.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supporterProtocol.map((item) => (
              <div key={item.step} className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Notificações */}
        <Card className="p-6 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Notificações Recentes</h2>
          </div>
          <div className="space-y-3">
            {notifications.map((notif, idx) => (
              <div key={idx} className="p-4 bg-primary/5 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm">{notif.type}</span>
                  <span className="text-xs text-muted-foreground">{notif.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{notif.message}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Depoimentos */}
        <Card className="p-6 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Depoimentos de Apoiadores</h2>
          </div>
          <div className="space-y-4">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{testimonial.date}</span>
                </div>
                <p className="text-sm italic text-muted-foreground">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Estratégia de Comunicação */}
        <Card className="p-6 border-primary/20">
          <h2 className="text-xl font-semibold mb-4">Estratégia de Comunicação</h2>
          <div className="space-y-3">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="font-semibold text-sm mb-2">Canais de Comunicação</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Instagram: Posts diários e Stories</li>
                <li>• WhatsApp: Grupos de apoiadores para compartilhamento</li>
                <li>• Email: Newsletters semanais com progresso</li>
              </ul>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="font-semibold text-sm mb-2">Frequência de Comunicação</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Posts: 2+ por dia</li>
                <li>• Stories: 3-5 por dia</li>
                <li>• Newsletter: 1 por semana</li>
              </ul>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="font-semibold text-sm mb-2">Resposta a Comentários</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Objetivo: Responder em até 2 horas</li>
                <li>• Tom: Amigável, profissional e engajador</li>
                <li>• Prioridade: Comentários de apoiadores</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
