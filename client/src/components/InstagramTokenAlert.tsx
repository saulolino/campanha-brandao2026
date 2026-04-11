import { AlertTriangle, XCircle, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";

/**
 * Banner de alerta quando o token do Instagram está próximo do vencimento (≤30 dias) ou expirado.
 * Exibe automaticamente — não renderiza nada quando o token está saudável.
 */
export default function InstagramTokenAlert() {
  const { data: tokenStatus } = trpc.instagram.getTokenStatus.useQuery(undefined, {
    staleTime: 60 * 60 * 1000, // revalidar a cada 1h
    refetchOnWindowFocus: false,
  });

  if (!tokenStatus) return null;

  const { daysUntilExpiry, expiresAt, isExpired, isWarning } = tokenStatus;

  // Não exibir se o token está saudável
  if (!isExpired && !isWarning) return null;

  const expiresFormatted = expiresAt
    ? new Date(expiresAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "data desconhecida";

  if (isExpired) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 mb-4">
        <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-400">Token do Instagram expirado</p>
          <p className="text-xs text-red-300/80 mt-0.5">
            O token expirou em <strong>{expiresFormatted}</strong>. As métricas e publicações automáticas estão interrompidas.
          </p>
        </div>
        <a
          href="/configuracoes"
          className="shrink-0 flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
        >
          Renovar <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  // isWarning: ≤30 dias
  const urgency = daysUntilExpiry !== null && daysUntilExpiry <= 7;
  return (
    <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 mb-4 ${
      urgency
        ? "border-orange-500/50 bg-orange-500/10"
        : "border-yellow-500/40 bg-yellow-500/8"
    }`}>
      <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${urgency ? "text-orange-400" : "text-yellow-400"}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${urgency ? "text-orange-400" : "text-yellow-400"}`}>
          Token do Instagram expira em {daysUntilExpiry} dia{daysUntilExpiry !== 1 ? "s" : ""}
        </p>
        <p className={`text-xs mt-0.5 ${urgency ? "text-orange-300/80" : "text-yellow-300/70"}`}>
          Vencimento: <strong>{expiresFormatted}</strong>. Acesse Configurações para renovar antes do prazo.
        </p>
      </div>
      <a
        href="/configuracoes"
        className={`shrink-0 flex items-center gap-1 text-xs font-medium transition-colors ${
          urgency ? "text-orange-400 hover:text-orange-300" : "text-yellow-400 hover:text-yellow-300"
        }`}
      >
        Renovar <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}
