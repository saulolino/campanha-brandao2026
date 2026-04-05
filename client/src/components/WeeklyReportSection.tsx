// ============================================================
// DESIGN: Command Center Militar Verde
// Gerador de Relatório Semanal — Métricas vs. Metas
// ============================================================
import { useState } from "react";
import { WEEKLY_GOALS, TRACKED_POSTS, STATUS_CONFIG, type PostStatus } from "@/lib/statusTracker";
import {
  FileText,
  Download,
  Copy,
  Check,
  Target,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  BarChart3,
  AlertTriangle,
  Zap,
  ChevronDown,
  ChevronUp,
  Printer,
  Clock,
  DollarSign,
  Award,
  ArrowRight,
} from "lucide-react";

function PerformanceBar({ label, meta, real, color }: { label: string; meta: number; real: number; color: string }) {
  const percentage = meta > 0 ? Math.min((real / meta) * 100, 150) : 0;
  const isAbove = real >= meta;

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-foreground">{real.toLocaleString("pt-BR")}</span>
          <span className="text-[10px] text-muted-foreground">/</span>
          <span className="text-[10px] font-mono text-muted-foreground">{meta.toLocaleString("pt-BR")}</span>
          <span className={`text-[9px] font-mono font-bold ${isAbove ? "text-primary" : "text-destructive"}`}>
            {isAbove ? "+" : ""}{((real - meta) / meta * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="h-2 bg-muted/30 rounded-full overflow-hidden relative">
        <div className="absolute top-0 left-0 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: color }} />
        {percentage >= 100 && (
          <div className="absolute top-0 h-full rounded-full bg-primary/30 animate-pulse" style={{ left: "100%", width: `${percentage - 100}%` }} />
        )}
        <div className="absolute top-0 h-full w-0.5 bg-foreground/30" style={{ left: "100%" }} />
      </div>
    </div>
  );
}

function ReportCard({ title, children, icon: Icon, accentColor }: { title: string; children: React.ReactNode; icon: React.ElementType; accentColor?: string }) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border/50">
        <Icon size={14} style={{ color: accentColor || "var(--primary)" }} />
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function WeeklyReportSection() {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const weekGoals = WEEKLY_GOALS.find((w) => w.weekId === selectedWeek)!;
  const weekPosts = TRACKED_POSTS.filter((p) => p.weekId === selectedWeek);

  // Simulated real data for demonstration
  const simulatedData = {
    1: { seguidores: 1580, alcance: 4800, curtidas: 195, comentarios: 32 },
    2: { seguidores: 1720, alcance: 5900, curtidas: 228, comentarios: 38 },
    3: { seguidores: 1890, alcance: 6800, curtidas: 255, comentarios: 44 },
    4: { seguidores: 2050, alcance: 7400, curtidas: 285, comentarios: 49 },
  };
  const realData = simulatedData[selectedWeek as keyof typeof simulatedData];

  const statusCounts = {
    publicado: weekPosts.filter((p) => p.status === "publicado").length,
    aprovado: weekPosts.filter((p) => p.status === "aprovado").length,
    em_producao: weekPosts.filter((p) => p.status === "em_producao").length,
    planejado: weekPosts.filter((p) => p.status === "planejado").length,
    cancelado: weekPosts.filter((p) => p.status === "cancelado").length,
  };

  const completionRate = weekPosts.length > 0 ? (statusCounts.publicado / weekPosts.length) * 100 : 0;
  const overallScore = (
    (realData.seguidores / weekGoals.metaSeguidores * 25) +
    (realData.alcance / weekGoals.metaAlcanceTotal * 25) +
    (realData.curtidas / weekGoals.metaCurtidasTotal * 25) +
    (realData.comentarios / weekGoals.metaComentariosTotal * 25)
  );

  const getScoreLabel = (score: number) => {
    if (score >= 100) return { label: "EXCELENTE", color: "#2d6a4f", icon: Award };
    if (score >= 80) return { label: "BOM", color: "#40916c", icon: TrendingUp };
    if (score >= 60) return { label: "REGULAR", color: "#c9a84c", icon: Target };
    return { label: "ATENÇÃO", color: "#e76f51", icon: AlertTriangle };
  };
  const scoreInfo = getScoreLabel(overallScore);

  // Generate text report
  const generateTextReport = () => {
    const lines = [
      `═══════════════════════════════════════`,
      `RELATÓRIO SEMANAL — CAMPANHA BRASÍLIA CIDADE PARQUE`,
      `═══════════════════════════════════════`,
      ``,
      `📅 Período: ${weekGoals.weekLabel} (${weekGoals.dateRange})`,
      `📊 Score Geral: ${overallScore.toFixed(0)}% — ${scoreInfo.label}`,
      `🎯 Taxa de Conclusão: ${completionRate.toFixed(0)}%`,
      ``,
      `─── MÉTRICAS VS. METAS ───`,
      ``,
      `👥 Seguidores: ${realData.seguidores.toLocaleString()} / ${weekGoals.metaSeguidores.toLocaleString()} (${((realData.seguidores / weekGoals.metaSeguidores - 1) * 100).toFixed(1)}%)`,
      `👁️ Alcance: ${realData.alcance.toLocaleString()} / ${weekGoals.metaAlcanceTotal.toLocaleString()} (${((realData.alcance / weekGoals.metaAlcanceTotal - 1) * 100).toFixed(1)}%)`,
      `❤️ Curtidas: ${realData.curtidas.toLocaleString()} / ${weekGoals.metaCurtidasTotal.toLocaleString()} (${((realData.curtidas / weekGoals.metaCurtidasTotal - 1) * 100).toFixed(1)}%)`,
      `💬 Comentários: ${realData.comentarios.toLocaleString()} / ${weekGoals.metaComentariosTotal.toLocaleString()} (${((realData.comentarios / weekGoals.metaComentariosTotal - 1) * 100).toFixed(1)}%)`,
      ``,
      `─── STATUS DOS POSTS ───`,
      ``,
      `📋 Total: ${weekPosts.length} posts`,
      `🚀 Publicados: ${statusCounts.publicado}`,
      `✅ Aprovados: ${statusCounts.aprovado}`,
      `🎬 Em Produção: ${statusCounts.em_producao}`,
      `📋 Planejados: ${statusCounts.planejado}`,
      statusCounts.cancelado > 0 ? `❌ Cancelados: ${statusCounts.cancelado}` : ``,
      ``,
      `─── DETALHAMENTO DOS POSTS ───`,
      ``,
      ...weekPosts.map((p, i) => [
        `${i + 1}. ${p.title}`,
        `   📅 ${p.dayOfWeek} ${p.date} às ${p.time}`,
        `   📌 ${p.pillar} | ${p.format}`,
        `   👤 ${p.assignedTo}`,
        `   📊 Status: ${STATUS_CONFIG[p.status].label}`,
        p.adBudget > 0 ? `   💰 Ads: R$ ${p.adBudget}` : ``,
        ``,
      ]).flat(),
      `─── INVESTIMENTO ───`,
      ``,
      `💰 Ads Total: R$ ${weekGoals.adBudgetTotal}`,
      `📊 Custo por Seguidor: R$ ${(weekGoals.adBudgetTotal / (realData.seguidores - (selectedWeek === 1 ? 1505 : simulatedData[(selectedWeek - 1) as keyof typeof simulatedData].seguidores))).toFixed(2)}`,
      ``,
      `─── RECOMENDAÇÕES ───`,
      ``,
      realData.alcance < weekGoals.metaAlcanceTotal ? `⚠️ Alcance abaixo da meta. Considerar aumentar investimento em ads.` : `✅ Alcance dentro ou acima da meta.`,
      realData.comentarios < weekGoals.metaComentariosTotal ? `⚠️ Comentários abaixo da meta. Incluir mais CTAs de engajamento.` : `✅ Comentários dentro ou acima da meta.`,
      completionRate < 100 ? `⚠️ Nem todos os posts foram publicados. Verificar gargalos de produção.` : `✅ Todos os posts foram publicados conforme planejado.`,
      ``,
      `═══════════════════════════════════════`,
      `Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
      `Campanha Eduardo Brandão — Brasília Cidade Parque`,
      `═══════════════════════════════════════`,
    ].filter(Boolean);

    return lines.join("\n");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateTextReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generateTextReport()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-semanal-${weekGoals.weekLabel.toLowerCase().replace(" ", "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-5 bg-primary rounded-full" />
        <h2 className="text-lg font-bold text-foreground">RELATÓRIO SEMANAL</h2>
        <span className="text-xs font-mono text-muted-foreground ml-2">Gerador Automático</span>
      </div>

      {/* Intro */}
      <div className="bg-accent/5 rounded-lg border border-accent/20 p-4 mb-6 flex items-start gap-3">
        <FileText size={16} className="text-accent shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1">Relatório para Liderança</p>
          <p className="text-xs text-foreground/80">Gere relatórios semanais automaticamente comparando metas planejadas vs. resultados reais. Copie o texto ou baixe o arquivo para enviar à liderança da campanha. Os dados simulados servem como exemplo — atualize com dados reais após cada semana.</p>
        </div>
      </div>

      {/* Week selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {WEEKLY_GOALS.map((w) => (
          <button
            key={w.weekId}
            onClick={() => setSelectedWeek(w.weekId)}
            className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
              selectedWeek === w.weekId
                ? "bg-primary/10 border-primary/40 text-primary ring-1 ring-primary/20"
                : "bg-card border-border text-muted-foreground hover:border-primary/20"
            }`}
          >
            <span className="font-bold">{w.weekLabel}</span>
            <span className="ml-1.5 text-[10px] opacity-70">{w.dateRange}</span>
          </button>
        ))}
      </div>

      {/* Score card */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Score Geral da Semana</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-mono font-bold" style={{ color: scoreInfo.color }}>{overallScore.toFixed(0)}%</span>
              <div>
                <span className="text-sm font-bold px-2 py-0.5 rounded" style={{ backgroundColor: scoreInfo.color + "20", color: scoreInfo.color }}>
                  {scoreInfo.label}
                </span>
                <p className="text-[9px] text-muted-foreground mt-1">Média ponderada de 4 métricas</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copiado!" : "Copiar"}
            </button>
            <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent/10 border border-accent/30 text-accent text-xs font-medium hover:bg-accent/20 transition-colors">
              <Download size={14} />
              Baixar .txt
            </button>
          </div>
        </div>

        {/* Performance bars */}
        <PerformanceBar label="Seguidores" meta={weekGoals.metaSeguidores} real={realData.seguidores} color="#2d6a4f" />
        <PerformanceBar label="Alcance Total" meta={weekGoals.metaAlcanceTotal} real={realData.alcance} color="#40916c" />
        <PerformanceBar label="Curtidas Total" meta={weekGoals.metaCurtidasTotal} real={realData.curtidas} color="#c9a84c" />
        <PerformanceBar label="Comentários Total" meta={weekGoals.metaComentariosTotal} real={realData.comentarios} color="#e76f51" />
      </div>

      {/* Detail cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Status dos Posts */}
        <ReportCard title="Status dos Posts" icon={Calendar}>
          <div className="space-y-2">
            {weekPosts.map((post) => (
              <div key={post.id} className="flex items-center justify-between bg-muted/15 rounded-lg p-3 border border-border/50">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-xs font-medium text-foreground truncate">{post.title}</p>
                  <p className="text-[9px] text-muted-foreground">{post.dayOfWeek} {post.date} - {post.time}</p>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0" style={{ backgroundColor: STATUS_CONFIG[post.status].bgColor, color: STATUS_CONFIG[post.status].color }}>
                  {STATUS_CONFIG[post.status].icon} {STATUS_CONFIG[post.status].label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Taxa de conclusão</span>
            <span className="text-sm font-mono font-bold text-primary">{completionRate.toFixed(0)}%</span>
          </div>
        </ReportCard>

        {/* Investimento */}
        <ReportCard title="Investimento em Ads" icon={DollarSign} accentColor="#c9a84c">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-muted/15 rounded-lg p-3 border border-border/50 text-center">
              <p className="text-lg font-mono font-bold text-foreground">R$ {weekGoals.adBudgetTotal}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">Budget Total</p>
            </div>
            <div className="bg-muted/15 rounded-lg p-3 border border-border/50 text-center">
              <p className="text-lg font-mono font-bold text-primary">R$ {(weekGoals.adBudgetTotal / weekPosts.filter(p => p.adBudget > 0).length || 1).toFixed(0)}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">Média/Post Pago</p>
            </div>
          </div>
          <div className="space-y-2">
            {weekPosts.filter(p => p.adBudget > 0).map((post) => (
              <div key={post.id} className="flex items-center justify-between text-xs">
                <span className="text-foreground/80 truncate mr-2">{post.title}</span>
                <span className="font-mono text-accent shrink-0">R$ {post.adBudget}</span>
              </div>
            ))}
          </div>
        </ReportCard>

        {/* Diagnóstico */}
        <ReportCard title="Diagnóstico Automático" icon={Zap} accentColor="#40916c">
          <div className="space-y-2">
            {realData.seguidores >= weekGoals.metaSeguidores ? (
              <div className="flex items-start gap-2 bg-primary/5 rounded-lg p-3 border border-primary/20">
                <TrendingUp size={14} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-primary">Seguidores acima da meta</p>
                  <p className="text-[9px] text-foreground/70">Crescimento saudável. Manter estratégia atual.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 bg-destructive/5 rounded-lg p-3 border border-destructive/20">
                <AlertTriangle size={14} className="text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-destructive">Seguidores abaixo da meta</p>
                  <p className="text-[9px] text-foreground/70">Considerar aumentar parcerias e investimento em ads.</p>
                </div>
              </div>
            )}
            {realData.alcance >= weekGoals.metaAlcanceTotal ? (
              <div className="flex items-start gap-2 bg-primary/5 rounded-lg p-3 border border-primary/20">
                <TrendingUp size={14} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-primary">Alcance dentro da meta</p>
                  <p className="text-[9px] text-foreground/70">Conteúdo está atingindo o público esperado.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 bg-[#c9a84c]/5 rounded-lg p-3 border border-[#c9a84c]/20">
                <AlertTriangle size={14} className="text-[#c9a84c] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-[#c9a84c]">Alcance levemente abaixo</p>
                  <p className="text-[9px] text-foreground/70">Revisar horários de publicação e hashtags.</p>
                </div>
              </div>
            )}
            {realData.comentarios >= weekGoals.metaComentariosTotal ? (
              <div className="flex items-start gap-2 bg-primary/5 rounded-lg p-3 border border-primary/20">
                <TrendingUp size={14} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-primary">Engajamento saudável</p>
                  <p className="text-[9px] text-foreground/70">CTAs estão funcionando. Manter abordagem.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 bg-destructive/5 rounded-lg p-3 border border-destructive/20">
                <AlertTriangle size={14} className="text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-destructive">Comentários abaixo da meta</p>
                  <p className="text-[9px] text-foreground/70">Incluir mais perguntas e CTAs de engajamento nos posts.</p>
                </div>
              </div>
            )}
          </div>
        </ReportCard>

        {/* Próxima semana */}
        <ReportCard title="Ações para Próxima Semana" icon={ArrowRight} accentColor="#2d6a4f">
          <div className="space-y-2">
            <div className="flex items-start gap-2 bg-muted/15 rounded-lg p-3 border border-border/50">
              <span className="text-primary font-bold text-xs">1</span>
              <p className="text-xs text-foreground/80">Revisar resultados reais e atualizar métricas no tracker</p>
            </div>
            <div className="flex items-start gap-2 bg-muted/15 rounded-lg p-3 border border-border/50">
              <span className="text-primary font-bold text-xs">2</span>
              <p className="text-xs text-foreground/80">Ajustar estratégia de ads com base no desempenho</p>
            </div>
            <div className="flex items-start gap-2 bg-muted/15 rounded-lg p-3 border border-border/50">
              <span className="text-primary font-bold text-xs">3</span>
              <p className="text-xs text-foreground/80">Produzir conteúdo da semana seguinte com antecedência</p>
            </div>
            <div className="flex items-start gap-2 bg-muted/15 rounded-lg p-3 border border-border/50">
              <span className="text-primary font-bold text-xs">4</span>
              <p className="text-xs text-foreground/80">Responder 100% dos comentários pendentes</p>
            </div>
            <div className="flex items-start gap-2 bg-muted/15 rounded-lg p-3 border border-border/50">
              <span className="text-primary font-bold text-xs">5</span>
              <p className="text-xs text-foreground/80">Agendar reunião de alinhamento com equipe</p>
            </div>
          </div>
        </ReportCard>
      </div>

      {/* Preview toggle */}
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-card border border-border hover:border-primary/20 transition-colors text-xs text-muted-foreground mb-4"
      >
        {showPreview ? <><ChevronUp size={14} />Ocultar preview do relatório</> : <><ChevronDown size={14} />Ver preview do relatório em texto</>}
      </button>

      {/* Text preview */}
      {showPreview && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-primary" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Preview do Relatório</span>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCopy} className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary text-[10px] hover:bg-primary/20 transition-colors">
                {copied ? <Check size={10} /> : <Copy size={10} />}
                {copied ? "Copiado!" : "Copiar"}
              </button>
              <button onClick={handleDownload} className="flex items-center gap-1 px-2 py-1 rounded bg-accent/10 text-accent text-[10px] hover:bg-accent/20 transition-colors">
                <Download size={10} />
                Baixar
              </button>
            </div>
          </div>
          <pre className="p-4 text-[10px] font-mono text-foreground/80 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-[400px] overflow-y-auto">
            {generateTextReport()}
          </pre>
        </div>
      )}

      {/* Note */}
      <div className="mt-4 bg-muted/15 rounded-lg border border-border p-4 flex items-start gap-3">
        <Clock size={14} className="text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          <span className="font-bold text-foreground">Nota:</span> Os dados exibidos são simulados para demonstração. Atualize com os dados reais do Instagram após cada semana para gerar relatórios precisos. O relatório pode ser copiado e enviado via WhatsApp ou e-mail para a liderança da campanha.
        </p>
      </div>
    </div>
  );
}
