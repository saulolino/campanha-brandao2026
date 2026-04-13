// ============================================================
// Módulo de Benchmarking de Candidatos Concorrentes
// Comparação Instagram + Facebook via Graph API
// ============================================================

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Instagram,
  Facebook,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart2,
  UserCheck,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { useLocation } from "wouter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Competitor = {
  id: number;
  name: string;
  nickname?: string | null;
  party?: string | null;
  role?: string | null;
  notes?: string | null;
  instagramUsername?: string | null;
  instagramFollowers?: number | null;
  instagramFollowing?: number | null;
  instagramPosts?: number | null;
  instagramBio?: string | null;
  instagramProfilePic?: string | null;
  instagramLastSync?: Date | null;
  facebookPageId?: string | null;
  facebookPageName?: string | null;
  facebookFollowers?: number | null;
  facebookLikes?: number | null;
  facebookBio?: string | null;
  facebookProfilePic?: string | null;
  facebookLastSync?: Date | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNum(n: number | null | undefined) {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString("pt-BR");
}

function formatDate(d: Date | null | undefined) {
  if (!d) return "Nunca sincronizado";
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DeltaBadge({ value, reference }: { value: number | null | undefined; reference: number | null | undefined }) {
  if (value == null || reference == null || reference === 0) return null;
  const diff = value - reference;
  const pct = ((diff / reference) * 100).toFixed(1);
  if (diff > 0) return (
    <span className="text-xs text-green-400 flex items-center gap-0.5">
      <TrendingUp className="w-3 h-3" />+{pct}%
    </span>
  );
  if (diff < 0) return (
    <span className="text-xs text-red-400 flex items-center gap-0.5">
      <TrendingDown className="w-3 h-3" />{pct}%
    </span>
  );
  return <span className="text-xs text-gray-500 flex items-center gap-0.5"><Minus className="w-3 h-3" />0%</span>;
}

// ─── Card de Concorrente ──────────────────────────────────────────────────────

function CompetitorCard({
  competitor,
  eduFollowers,
  isCoordinator,
  onEdit,
  onDelete,
  onSyncIG,
  onSyncFB,
  syncingIG,
  syncingFB,
}: {
  competitor: Competitor;
  eduFollowers: number;
  isCoordinator: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSyncIG: () => void;
  onSyncFB: () => void;
  syncingIG: boolean;
  syncingFB: boolean;
}) {
  return (
    <Card className="bg-[#0d1117] border-[#1a2332] hover:border-[#2a3a52] transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold text-white truncate">
              {competitor.name}
            </CardTitle>
            {competitor.nickname && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">{competitor.nickname}</p>
            )}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {competitor.party && (
                <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/25 text-xs">
                  {competitor.party}
                </Badge>
              )}
              {competitor.role && (
                <span className="text-xs text-gray-500">{competitor.role}</span>
              )}
            </div>
          </div>
          {isCoordinator && (
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-gray-400 hover:text-white"
                onClick={onEdit}
                title="Editar"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-gray-400 hover:text-red-400"
                onClick={onDelete}
                title="Remover"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instagram */}
        <div className="rounded-lg bg-[#111827] border border-[#1a2332] p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Instagram className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-medium text-gray-300">Instagram</span>
              {competitor.instagramUsername && (
                <span className="text-xs text-gray-500">@{competitor.instagramUsername}</span>
              )}
            </div>
            {isCoordinator && competitor.instagramUsername && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-gray-400 hover:text-white"
                onClick={onSyncIG}
                disabled={syncingIG}
                title="Busca via Apify — pode levar até 2 minutos"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${syncingIG ? "animate-spin" : ""}`} />
                {syncingIG ? "Buscando..." : "Sync"}
              </Button>
            )}
          </div>
          {syncingIG ? (
            <div className="text-center py-3">
              <div className="flex items-center justify-center gap-2 text-xs text-amber-400">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Buscando via Apify... pode levar até 2 min</span>
              </div>
            </div>
          ) : competitor.instagramFollowers != null ? (
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{formatNum(competitor.instagramFollowers)}</div>
                <div className="text-[10px] text-gray-500">Seguidores</div>
                <DeltaBadge value={competitor.instagramFollowers} reference={eduFollowers} />
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{formatNum(competitor.instagramPosts)}</div>
                <div className="text-[10px] text-gray-500">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{formatNum(competitor.instagramFollowing)}</div>
                <div className="text-[10px] text-gray-500">Seguindo</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              {competitor.instagramUsername ? (
                <p className="text-xs text-gray-500">Clique em Sync para carregar dados</p>
              ) : (
                <p className="text-xs text-gray-600">Username não cadastrado</p>
              )}
            </div>
          )}
          {competitor.instagramLastSync && (
            <p className="text-[10px] text-gray-600 mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Sync: {formatDate(competitor.instagramLastSync)}
            </p>
          )}
        </div>

        {/* Facebook */}
        <div className="rounded-lg bg-[#111827] border border-[#1a2332] p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Facebook className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-gray-300">Facebook</span>
              {competitor.facebookPageName && (
                <span className="text-xs text-gray-500 truncate max-w-[100px]">{competitor.facebookPageName}</span>
              )}
            </div>
            {isCoordinator && competitor.facebookPageId && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-gray-400 hover:text-white"
                onClick={onSyncFB}
                disabled={syncingFB}
                title="Busca via Apify — pode levar até 2 minutos"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${syncingFB ? "animate-spin" : ""}`} />
                {syncingFB ? "Buscando..." : "Sync"}
              </Button>
            )}
          </div>
          {syncingFB ? (
            <div className="text-center py-3">
              <div className="flex items-center justify-center gap-2 text-xs text-amber-400">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Buscando via Apify... pode levar até 2 min</span>
              </div>
            </div>
          ) : competitor.facebookFollowers != null ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{formatNum(competitor.facebookFollowers)}</div>
                <div className="text-[10px] text-gray-500">Seguidores</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{formatNum(competitor.facebookLikes)}</div>
                <div className="text-[10px] text-gray-500">Curtidas na página</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              {competitor.facebookPageId ? (
                <p className="text-xs text-gray-500">Clique em Sync para carregar dados</p>
              ) : (
                <p className="text-xs text-gray-600">ID da página não cadastrado</p>
              )}
            </div>
          )}
          {competitor.facebookLastSync && (
            <p className="text-[10px] text-gray-600 mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Sync: {formatDate(competitor.facebookLastSync)}
            </p>
          )}
        </div>

        {/* Notas */}
        {competitor.notes && (
          <p className="text-xs text-gray-500 italic border-t border-[#1a2332] pt-2">{competitor.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Formulário de Cadastro/Edição ────────────────────────────────────────────

function CompetitorForm({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Competitor | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [nickname, setNickname] = useState(initial?.nickname ?? "");
  const [party, setParty] = useState(initial?.party ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [instagramUsername, setInstagramUsername] = useState(
    initial?.instagramUsername ?? ""
  );
  const [facebookPageId, setFacebookPageId] = useState(
    initial?.facebookPageId ?? ""
  );

  const utils = trpc.useUtils();

  const createMutation = trpc.competitors.create.useMutation({
    onSuccess: () => {
      toast.success("Concorrente cadastrado com sucesso!");
      utils.competitors.list.invalidate();
      onSaved();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.competitors.update.useMutation({
    onSuccess: () => {
      toast.success("Concorrente atualizado!");
      utils.competitors.list.invalidate();
      onSaved();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  function handleSubmit() {
    if (!name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    const payload = {
      name: name.trim(),
      nickname: nickname.trim() || undefined,
      party: party.trim() || undefined,
      role: role.trim() || undefined,
      notes: notes.trim() || undefined,
      instagramUsername: instagramUsername.trim().replace("@", "") || undefined,
      facebookPageId: facebookPageId.trim() || undefined,
    };
    if (initial) {
      updateMutation.mutate({ id: initial.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#0d1117] border-[#1a2332] text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">
            {initial ? "Editar Concorrente" : "Cadastrar Concorrente"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-gray-300 text-xs mb-1 block">Nome do Candidato *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Rodrigo Sobral"
                className="bg-[#111827] border-[#1a2332] text-white placeholder:text-gray-600"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-gray-300 text-xs mb-1 block">Segundo Nome / Apelido / Nome de Urna</Label>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ex: Rodrigo do Povo, Sobral Vereador..."
                className="bg-[#111827] border-[#1a2332] text-white placeholder:text-gray-600"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs mb-1 block">Partido</Label>
              <Input
                value={party}
                onChange={(e) => setParty(e.target.value)}
                placeholder="Ex: PSDB"
                className="bg-[#111827] border-[#1a2332] text-white placeholder:text-gray-600"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs mb-1 block">Cargo Disputado</Label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ex: Deputado Distrital"
                className="bg-[#111827] border-[#1a2332] text-white placeholder:text-gray-600"
              />
            </div>
          </div>

          <div className="border-t border-[#1a2332] pt-3">
            <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
              <Instagram className="w-3.5 h-3.5 text-pink-400" />
              Instagram — Business Discovery API (perfis públicos Business/Creator)
            </p>
            <Label className="text-gray-300 text-xs mb-1 block">Username do Instagram</Label>
            <Input
              value={instagramUsername}
              onChange={(e) => setInstagramUsername(e.target.value)}
              placeholder="@username (sem @)"
              className="bg-[#111827] border-[#1a2332] text-white placeholder:text-gray-600"
            />
          </div>

          <div className="border-t border-[#1a2332] pt-3">
            <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
              <Facebook className="w-3.5 h-3.5 text-blue-400" />
              Facebook — Graph API (páginas públicas)
            </p>
            <Label className="text-gray-300 text-xs mb-1 block">ID ou Username da Página</Label>
            <Input
              value={facebookPageId}
              onChange={(e) => setFacebookPageId(e.target.value)}
              placeholder="Ex: rodrigosobral.df ou 123456789"
              className="bg-[#111827] border-[#1a2332] text-white placeholder:text-gray-600"
            />
          </div>

          <div>
            <Label className="text-gray-300 text-xs mb-1 block">Observações</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas estratégicas sobre este candidato..."
              rows={2}
              className="bg-[#111827] border-[#1a2332] text-white placeholder:text-gray-600 resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Salvando..." : initial ? "Salvar Alterações" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Gráfico Comparativo ──────────────────────────────────────────────────────

function ComparisonChart({
  competitors,
  eduFollowers,
  eduFacebookFollowers,
  eduName,
}: {
  competitors: Competitor[];
  eduFollowers: number;
  eduFacebookFollowers: number | null;
  eduName: string;
}) {
  const data = useMemo(() => {
    const items = [
      {
        name: eduName.split(" ")[0],
        instagram: eduFollowers,
        facebook: eduFacebookFollowers,
        isEdu: true,
      },
      ...competitors.map((c) => ({
        name: c.name.split(" ")[0],
        instagram: c.instagramFollowers ?? null,
        facebook: c.facebookFollowers ?? null,
        isEdu: false,
      })),
    ];
    return items;
  }, [competitors, eduFollowers, eduName]);

  if (data.length <= 1) return null;

  return (
    <Card className="bg-[#0d1117] border-[#1a2332] mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-blue-400" />
          Comparativo de Seguidores
        </CardTitle>
        <CardDescription className="text-xs text-gray-500">
          Eduardo Brandão vs. concorrentes cadastrados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" />
            <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} />
            <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(v) => formatNum(v)} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0d1117", border: "1px solid #1a2332", borderRadius: 8 }}
              labelStyle={{ color: "#e5e7eb" }}
              formatter={(value: number, name: string) => [formatNum(value), name === "instagram" ? "Instagram" : "Facebook"]}
            />
            <Legend formatter={(v) => v === "instagram" ? "Instagram" : "Facebook"} />
            <Bar dataKey="instagram" name="instagram" fill="#ec4899" radius={[4, 4, 0, 0]} />
            <Bar dataKey="facebook" name="facebook" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────

export default function Concorrentes() {
  const { user } = useAuth();
  const isCoordinator = ["coordinator", "superadmin"].includes((user as any)?.role ?? "");
  const [, navigate] = useLocation();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Competitor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Competitor | null>(null);
  const [syncingIG, setSyncingIG] = useState<number | null>(null);
  const [syncingFB, setSyncingFB] = useState<number | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingEdu, setSyncingEdu] = useState(false);

  const utils = trpc.useUtils();

  const { data: competitorsList = [], isLoading } = trpc.competitors.list.useQuery(undefined, {
    staleTime: 2 * 60 * 1000,
  });

  // Métricas do Eduardo para comparação
  const { data: eduMetrics } = trpc.instagram.getMetrics.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const { data: fbMetrics } = trpc.facebook.getMetrics.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const eduFollowers = eduMetrics?.followers ?? 0;
  const eduFacebookFollowers = fbMetrics?.followers ?? null;
  const eduName = eduMetrics?.name ?? "Eduardo Brandão";

  const deleteMutation = trpc.competitors.remove.useMutation({
    onSuccess: () => {
      toast.success("Concorrente removido.");
      utils.competitors.list.invalidate();
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const syncIGMutation = trpc.competitors.syncInstagram.useMutation({
    onSuccess: (_, vars) => {
      toast.success("Instagram sincronizado!");
      utils.competitors.list.invalidate();
      setSyncingIG(null);
    },
    onError: (e, vars) => {
      toast.error(`Erro ao sincronizar Instagram: ${e.message}`);
      setSyncingIG(null);
    },
  });

  const syncFBMutation = trpc.competitors.syncFacebook.useMutation({
    onSuccess: () => {
      toast.success("Facebook sincronizado!");
      utils.competitors.list.invalidate();
      setSyncingFB(null);
    },
    onError: (e) => {
      toast.error(`Erro ao sincronizar Facebook: ${e.message}`);
      setSyncingFB(null);
    },
  });

  const syncEduMutation = trpc.instagram.syncFromAPI.useMutation({
    onSuccess: (data) => {
      toast.success(`Instagram do Eduardo atualizado! ${data.followers?.toLocaleString('pt-BR') ?? ''} seguidores.`);
      utils.instagram.getMetrics.invalidate();
      setSyncingEdu(false);
    },
    onError: (e) => {
      toast.error(`Erro ao sincronizar: ${e.message}`);
      setSyncingEdu(false);
    },
  });

  const syncAllMutation = trpc.competitors.syncAll.useMutation({
    onSuccess: (data) => {
      const ok = data.results.filter((r) => r.instagram === "ok" || r.facebook === "ok").length;
      const err = data.results.filter((r) => r.instagram?.startsWith("erro") || r.facebook?.startsWith("erro")).length;
      toast.success(`Sync concluído: ${ok} perfis atualizados${err > 0 ? `, ${err} com erro` : ""}`);
      utils.competitors.list.invalidate();
      setSyncingAll(false);
    },
    onError: (e) => {
      toast.error(e.message);
      setSyncingAll(false);
    },
  });

  function handleSyncIG(id: number) {
    setSyncingIG(id);
    syncIGMutation.mutate({ id });
  }

  function handleSyncFB(id: number) {
    setSyncingFB(id);
    syncFBMutation.mutate({ id });
  }

  function handleSyncEdu() {
    setSyncingEdu(true);
    syncEduMutation.mutate();
  }

  function handleSyncAll() {
    setSyncingAll(true);
    syncAllMutation.mutate();
  }

  return (
    <div className="min-h-screen bg-[#060d0f] text-white">
      {/* Header */}
      <div className="border-b border-[#1a2332] bg-[#0a1628]/80 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/home")}
              className="text-gray-400 hover:text-white hover:bg-white/5 -ml-1 h-8 px-2"
              title="Voltar ao painel principal"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
            <div className="w-px h-6 bg-[#1a2332]" />
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Benchmarking de Candidatos
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Compare Eduardo Brandão com candidatos concorrentes no Instagram e Facebook
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCoordinator && competitorsList.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncAll}
                disabled={syncingAll}
                className="bg-transparent border-[#1a2332] text-gray-300 hover:text-white hover:border-blue-500/50 text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${syncingAll ? "animate-spin" : ""}`} />
                {syncingAll ? "Sincronizando..." : "Sync Todos"}
              </Button>
            )}
            {isCoordinator && (
              <Button
                size="sm"
                onClick={() => { setEditTarget(null); setFormOpen(true); }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Adicionar Candidato
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Card do Eduardo (referência) */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Nossa Campanha (Referência)
          </h2>
          <Card className="bg-[#0a1628] border-blue-500/30">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{eduName}</p>
                  <p className="text-xs text-gray-500">Partido Verde · Deputado Distrital DF 2026</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-1.5">
                        <Instagram className="w-3.5 h-3.5 text-pink-400" />
                        <span className="text-lg font-bold text-white">{formatNum(eduFollowers)}</span>
                      </div>
                      <p className="text-[10px] text-gray-500">Instagram</p>
                    </div>
                    {eduFacebookFollowers != null && (
                      <div className="text-center">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12.073h2.54V9.845c0-2.503 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.988C20.343 21.201 24 17.064 24 12.073z"/>
                          </svg>
                          <span className="text-lg font-bold text-white">{formatNum(eduFacebookFollowers)}</span>
                        </div>
                        <p className="text-[10px] text-gray-500">Facebook</p>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-lg font-bold text-white">{formatNum(eduMetrics?.posts)}</span>
                      </div>
                      <p className="text-[10px] text-gray-500">posts</p>
                    </div>
                  </div>
                  {isCoordinator && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSyncEdu}
                      disabled={syncingEdu}
                      className="bg-transparent border-blue-500/30 text-blue-300 hover:text-white hover:border-blue-400 text-xs h-8"
                      title="Sincronizar dados do Instagram de Eduardo Brandão"
                    >
                      <RefreshCw className={`w-3 h-3 mr-1.5 ${syncingEdu ? 'animate-spin' : ''}`} />
                      {syncingEdu ? 'Sincronizando...' : 'Sync'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico comparativo */}
        {competitorsList.length > 0 && (
          <ComparisonChart
            competitors={competitorsList as Competitor[]}
            eduFollowers={eduFollowers}
            eduFacebookFollowers={eduFacebookFollowers}
            eduName={eduName}
          />
        )}

        {/* Lista de concorrentes */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Candidatos Monitorados ({competitorsList.length})
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-[#0d1117] border-[#1a2332] animate-pulse">
                  <CardContent className="pt-6 pb-6">
                    <div className="h-4 bg-[#1a2332] rounded w-3/4 mb-3" />
                    <div className="h-3 bg-[#1a2332] rounded w-1/2 mb-6" />
                    <div className="h-20 bg-[#1a2332] rounded mb-3" />
                    <div className="h-20 bg-[#1a2332] rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : competitorsList.length === 0 ? (
            <Card className="bg-[#0d1117] border-[#1a2332] border-dashed">
              <CardContent className="py-12 text-center">
                <Users className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 font-medium mb-1">Nenhum candidato cadastrado</p>
                <p className="text-gray-600 text-sm mb-4">
                  Adicione candidatos concorrentes para comparar métricas de Instagram e Facebook.
                </p>
                {isCoordinator && (
                  <Button
                    size="sm"
                    onClick={() => { setEditTarget(null); setFormOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Candidato
                  </Button>
                )}
                {!isCoordinator && (
                  <p className="text-xs text-gray-600">Apenas coordenadores podem cadastrar candidatos.</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(competitorsList as Competitor[]).map((c) => (
                <CompetitorCard
                  key={c.id}
                  competitor={c}
                  eduFollowers={eduFollowers}
                  isCoordinator={isCoordinator}
                  onEdit={() => { setEditTarget(c); setFormOpen(true); }}
                  onDelete={() => setDeleteTarget(c)}
                  onSyncIG={() => handleSyncIG(c.id)}
                  onSyncFB={() => handleSyncFB(c.id)}
                  syncingIG={syncingIG === c.id}
                  syncingFB={syncingFB === c.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Aviso sobre limitações da API */}
        <div className="mt-6 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-300 mb-1">Limitações da API</p>
              <p className="text-xs text-gray-500">
                <strong className="text-gray-400">Instagram:</strong> A Business Discovery API permite buscar dados de perfis públicos do tipo Business ou Creator. Perfis pessoais não são acessíveis via API.
                {" "}<strong className="text-gray-400">Facebook:</strong> Dados de páginas públicas (fan_count, followers_count, about) são acessíveis com o token atual.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de cadastro/edição */}
      <CompetitorForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null); }}
        initial={editTarget}
        onSaved={() => { setEditTarget(null); }}
      />

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-[#0d1117] border-[#1a2332] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Remover Candidato</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Tem certeza que deseja remover <strong className="text-white">{deleteTarget?.name}</strong> da lista de monitoramento?
              O histórico de snapshots será mantido no banco.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[#1a2332] text-gray-300 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate({ id: deleteTarget.id })}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
