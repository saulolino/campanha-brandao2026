import { useLocation } from "wouter";
import { usePageTransition } from "@/hooks/usePageTransition";
import Sidebar from "@/components/SidebarNew";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Video, Image, MessageSquare } from "lucide-react";

export default function Conteudo() {
  const [, navigate] = useLocation();
  const { animationClass } = usePageTransition();

  const handleNavigate = (itemId: string) => {
    const routeMap: Record<string, string> = {
      "dashboard": "/dashboard",
      "conteudo": "/conteudo",
      "estrategia": "/estrategia",
      "metricas": "/metricas",
      "projecoes": "/projecoes",
      "configuracoes": "/configuracoes",
    };
    const route = routeMap[itemId] || "/dashboard";
    navigate(route);
  };

  const weeklyPosts = [
    { id: 1, day: "Segunda", date: "10 de Abril", type: "Reel", title: "Qualidade de Vida em BCP", status: "Agendado", time: "08:00" },
    { id: 2, day: "Terça", date: "11 de Abril", type: "Carrossel", title: "Infraestrutura do Bairro", status: "Agendado", time: "14:00" },
    { id: 3, day: "Quarta", date: "12 de Abril", type: "Story", title: "Comunidade em Ação", status: "Rascunho", time: "20:00" },
    { id: 4, day: "Quinta", date: "13 de Abril", type: "Reel", title: "Segurança e Bem-estar", status: "Agendado", time: "08:00" },
    { id: 5, day: "Sexta", date: "14 de Abril", type: "Carrossel", title: "Depoimentos de Moradores", status: "Pendente", time: "14:00" },
    { id: 6, day: "Sábado", date: "15 de Abril", type: "Reel", title: "Atividades do Fim de Semana", status: "Agendado", time: "10:00" },
    { id: 7, day: "Domingo", date: "16 de Abril", type: "Story", title: "Domingo em Família", status: "Rascunho", time: "18:00" },
  ];

  const contentTypes = [
    { name: "Reels", count: 3, icon: Video, color: "bg-red-500/10 text-red-500" },
    { name: "Carrossel", count: 2, icon: Image, color: "bg-blue-500/10 text-blue-500" },
    { name: "Stories", count: 2, icon: MessageSquare, color: "bg-purple-500/10 text-purple-500" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Agendado":
        return "bg-green-500/10 text-green-700";
      case "Rascunho":
        return "bg-yellow-500/10 text-yellow-700";
      case "Pendente":
        return "bg-orange-500/10 text-orange-700";
      default:
        return "bg-gray-500/10 text-gray-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Reel":
        return <Video className="w-4 h-4" />;
      case "Carrossel":
        return <Image className="w-4 h-4" />;
      case "Story":
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeSection="conteudo" onNavigate={handleNavigate} />
      <main className={`flex-1 overflow-auto ${animationClass}`}>
        <div className="p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Conteúdo</h1>
            </div>
            <p className="text-muted-foreground">Calendário semanal, timeline de posts e tipos de conteúdo</p>
          </div>

          <Tabs defaultValue="calendario" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="calendario">Calendário</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="tipos">Tipos de Conteúdo</TabsTrigger>
            </TabsList>

            {/* Calendário */}
            <TabsContent value="calendario" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Calendário Semanal</CardTitle>
                  <CardDescription>Posts planejados para os próximos 7 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {weeklyPosts.map((post) => (
                      <div key={post.id} className="border border-border/50 rounded-lg p-4 hover:border-primary/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-sm">{post.day}</h4>
                            <p className="text-xs text-muted-foreground">{post.date}</p>
                          </div>
                          <Badge variant="outline" className={getStatusColor(post.status)}>
                            {post.status}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            {getTypeIcon(post.type)}
                            <span className="text-muted-foreground">{post.type}</span>
                          </div>
                          <p className="text-sm font-medium">{post.title}</p>
                          <p className="text-xs text-muted-foreground">Horário: {post.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline */}
            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Timeline de Posts</CardTitle>
                  <CardDescription>Visualização cronológica da semana</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {weeklyPosts.map((post, idx) => (
                      <div key={post.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-4 h-4 bg-primary rounded-full" />
                          {idx < weeklyPosts.length - 1 && <div className="w-1 h-12 bg-border mt-2" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{post.day} - {post.date}</h4>
                              <p className="text-sm text-muted-foreground">{post.time}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getStatusColor(post.status)}>
                                {post.status}
                              </Badge>
                              <Badge variant="secondary" className="flex items-center gap-1">
                                {getTypeIcon(post.type)}
                                {post.type}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-foreground">{post.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tipos de Conteúdo */}
            <TabsContent value="tipos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Conteúdo</CardTitle>
                  <CardDescription>Tipos de conteúdo planejados para a semana</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {contentTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <div key={type.name} className="border border-border/50 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${type.color} mx-auto mb-4`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <h4 className="font-semibold mb-1">{type.name}</h4>
                          <p className="text-3xl font-bold text-primary">{type.count}</p>
                          <p className="text-xs text-muted-foreground mt-2">{Math.round((type.count / weeklyPosts.length) * 100)}% da semana</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Detalhes por Tipo */}
                  <div className="mt-8 space-y-4">
                    {contentTypes.map((type) => {
                      const Icon = type.icon;
                      const postsOfType = weeklyPosts.filter((p) => p.type === type.name);
                      return (
                        <div key={type.name} className="border border-border/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Icon className="w-4 h-4" />
                            <h4 className="font-semibold">{type.name}</h4>
                            <Badge variant="secondary">{postsOfType.length}</Badge>
                          </div>
                          <div className="space-y-2">
                            {postsOfType.map((post) => (
                              <div key={post.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                                <span>{post.title}</span>
                                <Badge variant="outline" className={getStatusColor(post.status)}>
                                  {post.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
