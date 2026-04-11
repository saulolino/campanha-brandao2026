/**
 * QuickApprovalModal — Modal compacto de aprovação rápida de usuários pendentes.
 * Acionado pelo badge de pendentes no SidebarNav.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  UserCheck,
  Users,
  Phone,
  Mail,
  Clock,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useLocation } from "wouter";

type UserRole = "visitor" | "team" | "coordinator" | "superadmin";

const ROLE_OPTIONS: { value: UserRole; label: string; color: string }[] = [
  { value: "visitor",     label: "Visitante",   color: "bg-slate-600 hover:bg-slate-500" },
  { value: "team",        label: "Equipe",       color: "bg-green-700 hover:bg-green-600" },
  { value: "coordinator", label: "Coordenador",  color: "bg-blue-700 hover:bg-blue-600" },
  { value: "superadmin",  label: "SuperAdmin",   color: "bg-yellow-700 hover:bg-yellow-600" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuickApprovalModal({ open, onOpenChange }: Props) {
  const [, navigate] = useLocation();
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const { data: pending = [], isLoading } = trpc.users.listPending.useQuery(undefined, {
    enabled: open,
    staleTime: 0,
  });

  const updateRole = trpc.users.updateRole.useMutation({
    onSuccess: (_, variables) => {
      const roleLabel = ROLE_OPTIONS.find(r => r.value === variables.newRole)?.label ?? variables.newRole;
      toast.success(`Usuário promovido para ${roleLabel} com sucesso.`);
      utils.users.listPending.invalidate();
      utils.users.countPending.invalidate();
      setApprovingId(null);
    },
    onError: (err) => {
      toast.error(`Erro ao atualizar: ${err.message}`);
      setApprovingId(null);
    },
  });

  const handleApprove = (userId: number, newRole: UserRole) => {
    setApprovingId(userId);
    updateRole.mutate({ userId, newRole });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-slate-900 border-slate-700 text-slate-50 max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-50">
            <UserCheck size={18} className="text-green-400" />
            Aprovação Rápida
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Usuários aguardando classificação de acesso
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-green-400" />
            </div>
          ) : pending.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Users size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhum usuário aguardando aprovação.</p>
            </div>
          ) : (
            pending.map((user) => (
              <div
                key={user.id}
                className="bg-slate-800 rounded-lg p-4 border border-slate-700"
              >
                {/* Cabeçalho do usuário */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-100 truncate">{user.name}</p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                      <Mail size={11} />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.whatsapp && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Phone size={11} />
                        <span>{user.whatsapp}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                      <Clock size={11} />
                      <span>Cadastrado em {formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-slate-600 text-slate-400 shrink-0">
                    {user.loginMethod === "local" ? "Local" : "OAuth"}
                  </Badge>
                </div>

                {/* Botões de aprovação por role */}
                <div className="flex flex-wrap gap-1.5">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleApprove(user.id, opt.value)}
                      disabled={approvingId === user.id}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${opt.color}`}
                    >
                      {approvingId === user.id ? (
                        <Loader2 size={10} className="animate-spin inline mr-1" />
                      ) : null}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé */}
        <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            {pending.length > 0 ? `${pending.length} usuário${pending.length > 1 ? "s" : ""} pendente${pending.length > 1 ? "s" : ""}` : ""}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-200 text-xs gap-1"
            onClick={() => { onOpenChange(false); navigate("/usuarios"); }}
          >
            <ExternalLink size={12} />
            Ver todos os usuários
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
