// ============================================================
// MÓDULO: Planejamento Semanal
// Chat guiado com IA para planejar posts e ações de rua
// Acesso: Coordenador e SuperAdmin
// ============================================================
import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// ScrollArea removida — usando div nativo para scroll confiável
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  User,
  Send,
  Plus,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Loader2,
  Sparkles,
  FileText,
  CalendarDays,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import SidebarNav from "@/components/SidebarNav";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Message = {
  id?: number;
  role: "user" | "assistant";
  content: string;
  messageType?: string;
  createdAt?: Date;
};

type Session = {
  id: number;
  weekStart: Date;
  weekEnd: Date;
  status: string;
  createdAt: Date;
};

// ─── Componente de mensagem ───────────────────────────────────────────────────

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} mb-4`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? "bg-[#4a7c59]" : "bg-[#1a2e1a] border border-[#4a7c59]/30"
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-[#4a7c59]" />
        )}
      </div>

      {/* Balão */}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        isUser
          ? "bg-[#4a7c59] text-white rounded-tr-sm"
          : "bg-[#1a2e1a] border border-[#2d4a2d]/50 text-gray-100 rounded-tl-sm"
      }`}>
        <div className={`text-sm leading-relaxed prose prose-sm max-w-none ${
          isUser ? "prose-invert" : "prose-invert"
        }`}>
          <ReactMarkdown
            components={{
              p: ({ children }: any) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }: any) => <strong className="font-semibold text-[#7bc47f]">{children}</strong>,
              ul: ({ children }: any) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
              ol: ({ children }: any) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
              li: ({ children }: any) => <li className="text-sm">{children}</li>,
              code: ({ children }: any) => <code className="bg-black/30 px-1 rounded text-xs font-mono">{children}</code>,
              pre: ({ children }: any) => <pre className="bg-black/40 p-3 rounded-lg overflow-x-auto text-xs my-2">{children}</pre>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        {message.createdAt && (
          <p className={`text-xs mt-1 ${isUser ? "text-white/60 text-right" : "text-gray-500"}`}>
            {new Date(message.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Card de sessão anterior ──────────────────────────────────────────────────

function SessionCard({ session, onOpen }: { session: Session; onOpen: (id: number) => void }) {
  const statusColor = {
    em_andamento: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    concluida: "bg-green-500/20 text-green-400 border-green-500/30",
    cancelada: "bg-red-500/20 text-red-400 border-red-500/30",
  }[session.status] || "bg-gray-500/20 text-gray-400";

  const statusLabel = {
    em_andamento: "Em andamento",
    concluida: "Concluída",
    cancelada: "Cancelada",
  }[session.status] || session.status;

  return (
    <button
      onClick={() => onOpen(session.id)}
      className="w-full text-left p-3 rounded-lg bg-[#1a2e1a] border border-[#2d4a2d]/50 hover:border-[#4a7c59]/50 transition-colors group"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
          Semana {new Date(session.weekStart).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} –{" "}
          {new Date(session.weekEnd).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#4a7c59] transition-colors" />
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor}`}>{statusLabel}</span>
        <span className="text-xs text-gray-500">
          {new Date(session.createdAt).toLocaleDateString("pt-BR")}
        </span>
      </div>
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PlanejamentoSemanal() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Estado da sessão atual
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<string>("em_andamento");
  const [createdItems, setCreatedItems] = useState<{ posts: number[]; events: number[] } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: sessions, refetch: refetchSessions } = trpc.weeklyPlanning.list.useQuery(
    { limit: 10 },
    { enabled: ["coordinator", "superadmin"].includes(user?.role ?? "") }
  );

  const { data: sessionData, refetch: refetchSession } = trpc.weeklyPlanning.getSession.useQuery(
    { id: activeSessionId! },
    { enabled: activeSessionId !== null }
  );

  // Mutations
  const startSession = trpc.weeklyPlanning.startSession.useMutation({
    onSuccess: (data) => {
      setActiveSessionId(data.sessionId);
      setMessages([{
        role: "assistant",
        content: data.welcomeMessage,
        messageType: "pergunta",
        createdAt: new Date(),
      }]);
      setSessionStatus("em_andamento");
      setCreatedItems(null);
      refetchSessions();
    },
    onError: (err) => toast.error("Erro ao iniciar sessão: " + err.message),
  });

  const sendMessage = trpc.weeklyPlanning.sendMessage.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.reply,
        messageType: data.sessionStatus === "concluida" ? "confirmacao" : "pergunta",
        createdAt: new Date(),
      }]);
      setSessionStatus(data.sessionStatus);
      if (data.createdItems) {
        setCreatedItems(data.createdItems);
        refetchSessions();
      }
      setIsTyping(false);
    },
    onError: (err) => {
      toast.error("Erro ao enviar mensagem: " + err.message);
      setIsTyping(false);
    },
  });

  const cancelSession = trpc.weeklyPlanning.cancelSession.useMutation({
    onSuccess: () => {
      setSessionStatus("cancelada");
      refetchSessions();
      toast.info("Sessão cancelada.");
    },
  });

  // Scroll automático — rola o container nativo para o final
  useEffect(() => {
    requestAnimationFrame(() => {
      const container = chatContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }, [messages, isTyping]);

  // Carregar sessão existente
  useEffect(() => {
    if (sessionData && activeSessionId) {
      setMessages(sessionData.messages.map(m => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        messageType: m.messageType,
        createdAt: m.createdAt,
      })));
      setSessionStatus(sessionData.session.status);
    }
  }, [sessionData]);

  // Verificar permissão
  const canAccess = ["coordinator", "superadmin"].includes(user?.role ?? "");
  if (!canAccess) {
    return (
      <div className="flex h-screen bg-background">
        <SidebarNav activeSection="planejamento-semanal" />
        <div className="flex-1 flex items-center justify-center bg-[#0d1a0d]">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Acesso restrito</h2>
            <p className="text-gray-400">Esta área é exclusiva para Coordenadores e SuperAdmin.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSend = () => {
    if (!inputValue.trim() || !activeSessionId || isTyping) return;

    const userMsg: Message = {
      role: "user",
      content: inputValue.trim(),
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    sendMessage.mutate({
      sessionId: activeSessionId,
      message: userMsg.content,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOpenSession = (id: number) => {
    setActiveSessionId(id);
    setMessages([]);
    setCreatedItems(null);
  };

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav activeSection="planejamento-semanal" />
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0d1a0d] text-white">
        {/* Header */}
        <div className="border-b border-[#2d4a2d]/50 bg-[#0d1a0d]/95 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#4a7c59]/20 border border-[#4a7c59]/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#7bc47f]" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-white">Planejamento Semanal</h1>
                <p className="text-xs text-gray-400">Chat guiado com IA — posts + ações de rua</p>
              </div>
            </div>
            <Button
              onClick={() => startSession.mutate()}
              disabled={startSession.isPending}
              size="sm"
              className="bg-[#4a7c59] hover:bg-[#3d6b4a] text-white border-0 gap-2"
            >
              {startSession.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Nova Sessão
            </Button>
          </div>
        </div>

        <div className="flex flex-1 w-full px-4 py-4 gap-4 overflow-hidden">
          {/* Sidebar — sessões anteriores */}
          <div className="w-64 flex-shrink-0 hidden lg:block overflow-y-auto">
            <div className="sticky top-0">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Sessões anteriores
              </h3>
              <div className="space-y-2">
                {sessions && sessions.length > 0 ? (
                  sessions.map(s => (
                    <SessionCard
                      key={s.id}
                      session={s as Session}
                      onOpen={handleOpenSession}
                    />
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic">Nenhuma sessão anterior.</p>
                )}
              </div>
            </div>
          </div>

          {/* Área principal do chat */}
          <div className="flex-1 flex flex-col min-h-0">
            {!activeSessionId ? (
              /* Estado vazio */
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-[#4a7c59]/10 border border-[#4a7c59]/20 flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-[#4a7c59]" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-3">Planejamento Semanal com IA</h2>
                <p className="text-gray-400 max-w-md mb-2 text-sm leading-relaxed">
                  Responda algumas perguntas rápidas sobre a semana e a IA vai pesquisar fatos verificados,
                  criar sugestões de posts e ações de rua, e cadastrar tudo nas agendas após sua aprovação.
                </p>
                <p className="text-gray-500 text-xs mb-8">Ideal para fazer toda semana, de preferência no fim de semana.</p>

                <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-lg">
                  {[
                    { icon: FileText, label: "5 posts sugeridos", desc: "Com roteiro e legenda" },
                    { icon: MapPin, label: "2 ações de rua", desc: "Com local e horário" },
                    { icon: CalendarDays, label: "Cadastro automático", desc: "Após sua aprovação" },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="bg-[#1a2e1a] border border-[#2d4a2d]/50 rounded-xl p-3 text-center">
                      <Icon className="w-5 h-5 text-[#4a7c59] mx-auto mb-2" />
                      <p className="text-xs font-medium text-white">{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => startSession.mutate()}
                  disabled={startSession.isPending}
                  className="bg-[#4a7c59] hover:bg-[#3d6b4a] text-white border-0 gap-2 px-6"
                >
                  {startSession.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Iniciar planejamento da semana
                </Button>
              </div>
            ) : (
              /* Chat ativo */
              <div className="flex flex-col flex-1 min-h-0 bg-[#111e11] rounded-2xl border border-[#2d4a2d]/50 overflow-hidden">
                {/* Status da sessão */}
                {sessionStatus !== "em_andamento" && (
                  <div className={`px-4 py-2 text-xs font-medium flex items-center gap-2 ${
                    sessionStatus === "concluida"
                      ? "bg-green-900/30 text-green-400 border-b border-green-900/30"
                      : "bg-red-900/30 text-red-400 border-b border-red-900/30"
                  }`}>
                    {sessionStatus === "concluida" ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    Sessão {sessionStatus === "concluida" ? "concluída" : "cancelada"}
                    {createdItems && (
                      <span className="ml-auto">
                        {createdItems.posts.length} posts + {createdItems.events.length} eventos cadastrados
                      </span>
                    )}
                  </div>
                )}

                {/* Mensagens */}
                <div ref={chatContainerRef} className="flex-1 min-h-0 p-4 overflow-y-auto">
                  <div className="space-y-1">
                    {messages.map((msg, i) => (
                      <ChatMessage key={msg.id ?? i} message={msg} />
                    ))}

                    {/* Indicador de digitação */}
                    {isTyping && (
                      <div className="flex gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-[#1a2e1a] border border-[#4a7c59]/30 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-[#4a7c59]" />
                        </div>
                        <div className="bg-[#1a2e1a] border border-[#2d4a2d]/50 rounded-2xl rounded-tl-sm px-4 py-3">
                          <div className="flex gap-1 items-center h-5">
                            <span className="w-1.5 h-1.5 bg-[#4a7c59] rounded-full animate-bounce [animation-delay:0ms]" />
                            <span className="w-1.5 h-1.5 bg-[#4a7c59] rounded-full animate-bounce [animation-delay:150ms]" />
                            <span className="w-1.5 h-1.5 bg-[#4a7c59] rounded-full animate-bounce [animation-delay:300ms]" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Atalhos de resposta rápida */}
                    {messages.length > 0 &&
                      messages[messages.length - 1]?.role === "assistant" &&
                      sessionStatus === "em_andamento" &&
                      !isTyping && (
                      <div className="flex flex-wrap gap-2 mt-2 mb-4 pl-11">
                        {messages[messages.length - 1]?.content?.includes("próxima semana") && (
                          <button
                            onClick={() => setInputValue("Próxima semana")}
                            className="text-xs px-3 py-1.5 rounded-full bg-[#1a2e1a] border border-[#2d4a2d]/50 text-gray-300 hover:border-[#4a7c59]/50 hover:text-white transition-colors"
                          >
                            Próxima semana
                          </button>
                        )}
                        {messages[messages.length - 1]?.content?.includes("aprova") && (
                          <>
                            <button
                              onClick={() => {
                                setInputValue("Aprovo! Pode cadastrar.");
                                setTimeout(handleSend, 100);
                              }}
                              className="text-xs px-3 py-1.5 rounded-full bg-[#4a7c59]/20 border border-[#4a7c59]/40 text-[#7bc47f] hover:bg-[#4a7c59]/30 transition-colors"
                            >
                              ✅ Aprovar e cadastrar
                            </button>
                            <button
                              onClick={() => setInputValue("Quero ajustar alguns pontos: ")}
                              className="text-xs px-3 py-1.5 rounded-full bg-[#1a2e1a] border border-[#2d4a2d]/50 text-gray-300 hover:border-[#4a7c59]/50 transition-colors"
                            >
                              ✏️ Ajustar plano
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input */}
                <div className="border-t border-[#2d4a2d]/50 p-3">
                  {sessionStatus === "em_andamento" ? (
                    <div className="flex gap-2 items-end">
                      <Textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Digite sua resposta... (Enter para enviar, Shift+Enter para nova linha)"
                        className="flex-1 min-h-[44px] max-h-32 resize-none bg-[#1a2e1a] border-[#2d4a2d]/50 text-white placeholder:text-gray-500 focus:border-[#4a7c59]/50 text-sm rounded-xl"
                        disabled={isTyping}
                      />
                      <Button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isTyping}
                        size="icon"
                        className="h-11 w-11 bg-[#4a7c59] hover:bg-[#3d6b4a] text-white border-0 rounded-xl flex-shrink-0"
                      >
                        {isTyping ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => startSession.mutate()}
                        className="flex-1 bg-[#4a7c59] hover:bg-[#3d6b4a] text-white border-0 gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Planejar próxima semana
                      </Button>
                      {createdItems && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => navigate("/conteudo")}
                            className="border-[#2d4a2d] text-gray-300 hover:bg-[#1a2e1a] gap-1.5"
                          >
                            <FileText className="w-4 h-4" />
                            Ver posts
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => navigate("/agenda-rua")}
                            className="border-[#2d4a2d] text-gray-300 hover:bg-[#1a2e1a] gap-1.5"
                          >
                            <MapPin className="w-4 h-4" />
                            Ver eventos
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-600 text-center mt-2">
                    {sessionStatus === "em_andamento"
                      ? "A IA vai sugerir um plano completo para você aprovar antes de cadastrar."
                      : sessionStatus === "concluida"
                      ? "Plano cadastrado com sucesso. Revise nas agendas."
                      : "Sessão cancelada."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
