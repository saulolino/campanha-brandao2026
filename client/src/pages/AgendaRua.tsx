import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import SidebarNav from "@/components/SidebarNav";
import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus, Calendar, MapPin, Users, Clock, ChevronLeft, ChevronRight,
  Edit3, Trash2, Upload, X, Image, FileVideo, FileText, Loader2,
  Eye, CheckCircle2, XCircle, AlertCircle, Footprints, Megaphone,
  Handshake, Mic, Star, LayoutGrid, Download, Share2,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type EventType = "caminhada" | "reuniao" | "panfletagem" | "visita" | "debate" | "entrevista" | "show" | "outro";
type EventStatus = "planejado" | "confirmado" | "realizado" | "cancelado";
type ViewMode = "semanal" | "mensal" | "lista" | "mapa";

interface EventForm {
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  eventDate: string;
  eventTime: string;
  endTime: string;
  location: string;
  neighborhood: string;
  city: string;
  expectedAttendees: number;
  actualAttendees: number;
  notes: string;
  mediaUrls: string; // JSON array de URLs
}

const defaultForm: EventForm = {
  title: "",
  description: "",
  type: "outro",
  status: "planejado",
  eventDate: "",
  eventTime: "09:00",
  endTime: "",
  location: "",
  neighborhood: "",
  city: "Brasília",
  expectedAttendees: 0,
  actualAttendees: 0,
  notes: "",
  mediaUrls: "",
};

// ─── Configurações visuais ────────────────────────────────────────────────────
const TYPE_CONFIG: Record<EventType, { label: string; icon: any; color: string; bg: string }> = {
  caminhada:   { label: "Caminhada",   icon: Footprints,   color: "text-green-400",  bg: "bg-green-500/20 border-green-500/40" },
  reuniao:     { label: "Reunião",     icon: Handshake,    color: "text-blue-400",   bg: "bg-blue-500/20 border-blue-500/40" },
  panfletagem: { label: "Panfletagem", icon: Megaphone,    color: "text-yellow-400", bg: "bg-yellow-500/20 border-yellow-500/40" },
  visita:      { label: "Visita",      icon: MapPin,       color: "text-purple-400", bg: "bg-purple-500/20 border-purple-500/40" },
  debate:      { label: "Debate",      icon: Mic,          color: "text-red-400",    bg: "bg-red-500/20 border-red-500/40" },
  entrevista:  { label: "Entrevista",  icon: Mic,          color: "text-orange-400", bg: "bg-orange-500/20 border-orange-500/40" },
  show:        { label: "Show/Evento", icon: Star,         color: "text-pink-400",   bg: "bg-pink-500/20 border-pink-500/40" },
  outro:       { label: "Outro",       icon: Calendar,     color: "text-gray-400",   bg: "bg-gray-500/20 border-gray-500/40" },
};

const STATUS_CONFIG: Record<EventStatus, { label: string; color: string; icon: any }> = {
  planejado:  { label: "Planejado",  color: "bg-gray-500/20 text-gray-400 border-gray-500/30",     icon: Clock },
  confirmado: { label: "Confirmado", color: "bg-blue-500/20 text-blue-400 border-blue-500/30",     icon: CheckCircle2 },
  realizado:  { label: "Realizado",  color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
  cancelado:  { label: "Cancelado",  color: "bg-red-500/20 text-red-400 border-red-500/30",        icon: XCircle },
};

const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS_PT = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

// Regiões administrativas do DF
const REGIOES_DF = [
  "Asa Norte", "Asa Sul", "Lago Norte", "Lago Sul", "Sudoeste", "Octogonal",
  "Noroeste", "Cruzeiro", "Guará I", "Guará II", "Águas Claras", "Taguatinga",
  "Ceilândia", "Samambaia", "Recanto das Emas", "Riacho Fundo", "Riacho Fundo II",
  "Candangolândia", "Núcleo Bandeirante", "Park Way", "SCIA/Estrutural",
  "SIA", "Vicente Pires", "Sobradinho", "Sobradinho II", "Planaltina",
  "Paranoá", "São Sebastião", "Itapoã", "Jardim Botânico", "Brazlândia",
  "Gama", "Santa Maria", "Outro",
];

function getWeekDays(ref: Date): Date[] {
  const day = ref.getDay();
  const monday = new Date(ref);
  monday.setDate(ref.getDate() - day + 1);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const grid: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) grid.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) grid.push(new Date(year, month, d));
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function formatDateForInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─── Componente MapaVista ────────────────────────────────────────────────────
function MapaVista({ filteredEvents, filterBairro }: { filteredEvents: any[]; filterBairro: string }) {
  const mapViewRef = useRef<google.maps.Map | null>(null);
  const mapMarkersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Recriar pins sempre que os eventos ou o mapa mudar
  useEffect(() => {
    if (!mapReady || !mapViewRef.current) return;
    const map = mapViewRef.current;

    // Fechar infowindow aberta
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
    }

    // Remover marcadores anteriores
    mapMarkersRef.current.forEach(m => { m.map = null; });
    mapMarkersRef.current = [];

    const eventsWithCoords = filteredEvents.filter(ev => ev.latitude && ev.longitude);
    if (eventsWithCoords.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();

    eventsWithCoords.forEach(ev => {
      const cfg = TYPE_CONFIG[ev.type as EventType] || TYPE_CONFIG.outro;
      const sCfg = STATUS_CONFIG[ev.status as EventStatus] || STATUS_CONFIG.planejado;
      const pinColor = ev.status === "realizado" ? "#34d399" : ev.status === "confirmado" ? "#60a5fa" : ev.status === "cancelado" ? "#f87171" : "#9ca3af";

      // Criar elemento visual do pin
      const pinEl = document.createElement("div");
      pinEl.style.cssText = `width:22px;height:22px;border-radius:50%;background:${pinColor};border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);cursor:pointer;`;

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        position: { lat: Number(ev.latitude), lng: Number(ev.longitude) },
        map,
        title: ev.title,
        content: pinEl,
      });

      const infoContent = `<div style="background:#161b22;color:#fff;padding:10px 14px;border-radius:8px;min-width:190px;font-family:sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.5)">
        <div style="font-weight:700;font-size:13px;margin-bottom:5px">${ev.title}</div>
        <div style="font-size:11px;color:#9ca3af;margin-bottom:3px">${cfg.label} • <span style="color:${pinColor}">${sCfg.label}</span></div>
        <div style="font-size:11px;color:#d1d5db">${ev.eventDate ? new Date(ev.eventDate).toLocaleDateString("pt-BR") : ""} ${ev.eventTime ? "\u00e0s " + ev.eventTime : ""}</div>
        ${ev.location ? `<div style="font-size:11px;color:#9ca3af;margin-top:4px">📍 ${ev.location}</div>` : ""}
        ${ev.neighborhood ? `<div style="font-size:11px;color:#6ee7b7">${ev.neighborhood}</div>` : ""}
        ${ev.expectedAttendees ? `<div style="font-size:11px;color:#9ca3af;margin-top:2px">👥 ${ev.expectedAttendees} pessoas esperadas</div>` : ""}
      </div>`;

      marker.addListener("click", () => {
        if (infoWindowRef.current) infoWindowRef.current.close();
        const iw = new window.google.maps.InfoWindow({ content: infoContent });
        infoWindowRef.current = iw;
        iw.open({ map, anchor: marker });
      });

      mapMarkersRef.current.push(marker);
      bounds.extend({ lat: Number(ev.latitude), lng: Number(ev.longitude) });
    });

    if (mapMarkersRef.current.length === 1) {
      map.setCenter({ lat: Number(eventsWithCoords[0].latitude), lng: Number(eventsWithCoords[0].longitude) });
      map.setZoom(14);
    } else {
      map.fitBounds(bounds);
    }
  }, [filteredEvents, mapReady]);

  const eventsWithCoords = filteredEvents.filter(ev => ev.latitude && ev.longitude);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-400">
          {filterBairro === "todos" ? `${filteredEvents.length} eventos no total` : `${filteredEvents.length} eventos em ${filterBairro}`}
          {" — clique em um pin para ver detalhes"}
        </p>
      </div>
      <div className="relative rounded-xl overflow-hidden border border-white/10" style={{ height: 520 }}>
        <MapView
          className="w-full h-full"
          initialCenter={{ lat: -15.7801, lng: -47.9292 }}
          initialZoom={11}
          onMapReady={(map) => {
            mapViewRef.current = map;
            setMapReady(true);
          }}
        />
        {eventsWithCoords.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 pointer-events-none">
            <MapPin className="w-10 h-10 text-gray-500 mb-3" />
            <p className="text-gray-400 text-sm">Nenhum evento com localização definida.</p>
            <p className="text-gray-500 text-xs mt-1">Adicione eventos com endereço para visualizá-los no mapa.</p>
          </div>
        )}
      </div>
      {/* Legenda */}
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full border-2 border-white/30 ${key === "realizado" ? "bg-emerald-400" : key === "confirmado" ? "bg-blue-400" : key === "cancelado" ? "bg-red-400" : "bg-gray-400"}`} />
            <span className="text-xs text-gray-400">{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function AgendaRua() {
  const [, navigate] = useLocation();

  const localUser = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  }, []);

  useEffect(() => {
    if (!localUser) navigate("/login");
  }, [localUser, navigate]);

  const canEdit = ["team", "coordinator", "superadmin"].includes(localUser?.role ?? "");
  const canDelete = ["coordinator", "superadmin"].includes(localUser?.role ?? "");

  const [viewMode, setViewMode] = useState<ViewMode>("mensal");
  const [weekRef, setWeekRef] = useState(() => new Date());
  const [monthRef, setMonthRef] = useState(() => new Date());
  const weekDays = useMemo(() => getWeekDays(weekRef), [weekRef]);
  const monthGrid = useMemo(() => getMonthGrid(monthRef.getFullYear(), monthRef.getMonth()), [monthRef]);
  const [filterBairro, setFilterBairro] = useState<string>("todos");
  const mapViewRef = useRef<google.maps.Map | null>(null);
  const mapMarkersRef = useRef<any[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [form, setForm] = useState<EventForm>(defaultForm);
  const [modalTab, setModalTab] = useState<"info" | "local" | "midia">("info");

  // Upload de mídia
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Google Maps
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<any>(null);
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({ lat: -15.7801, lng: -47.9292 }); // Brasília
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;

    // Listener de clique no mapa para posicionar marcador
    map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      // Atualizar marcador
      if (markerRef.current) markerRef.current.map = null;
      markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat, lng },
        title: "Local do evento",
      });
      // Geocodificar para obter endereço
      if (window.google?.maps?.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === "OK" && results && results[0]) {
            const address = results[0].formatted_address || "";
            setForm(f => ({ ...f, location: address }));
            // Atualizar o input de autocomplete
            if (autocompleteInputRef.current) {
              autocompleteInputRef.current.value = address;
            }
          }
        });
      }
    });

    // Inicializar autocomplete no input de endereço
    if (autocompleteInputRef.current && window.google) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        autocompleteInputRef.current,
        { componentRestrictions: { country: "br" }, fields: ["geometry", "formatted_address", "name"] }
      );
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry?.location) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        map.setCenter({ lat, lng });
        map.setZoom(16);
        // Atualizar marcador
        if (markerRef.current) markerRef.current.map = null;
        markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat, lng },
          title: place.name || place.formatted_address,
        });
        // Preencher campo de endereço
        const address = place.formatted_address || place.name || "";
        setForm(f => ({ ...f, location: address }));
      });
    }
  }, []);

  const utils = trpc.useUtils();

  const { data: eventsData, isLoading } = trpc.streetEvents.list.useQuery(
    { limit: 500, offset: 0 },
    { enabled: !!localUser }
  );
  const events: any[] = eventsData || [];

  // Eventos filtrados por bairro/região
  const filteredEvents = useMemo(() => {
    if (filterBairro === "todos") return events;
    return events.filter(ev => {
      const nb = (ev.neighborhood || "").toLowerCase();
      const loc = (ev.location || "").toLowerCase();
      const filter = filterBairro.toLowerCase();
      return nb.includes(filter) || loc.includes(filter);
    });
  }, [events, filterBairro]);

  const createEvent = trpc.streetEvents.create.useMutation({
    onSuccess: () => {
      utils.streetEvents.list.invalidate();
      setModalOpen(false);
      setForm(defaultForm);
      toast.success("Evento criado com sucesso!");
    },
    onError: (err) => toast.error(`Erro ao criar evento: ${err.message}`),
  });

  const updateEvent = trpc.streetEvents.update.useMutation({
    onSuccess: () => {
      utils.streetEvents.list.invalidate();
      setModalOpen(false);
      setEditingEvent(null);
      setForm(defaultForm);
      toast.success("Evento atualizado!");
    },
    onError: (err) => toast.error(`Erro ao atualizar: ${err.message}`),
  });

  const deleteEvent = trpc.streetEvents.delete.useMutation({
    onSuccess: () => {
      utils.streetEvents.list.invalidate();
      toast.success("Evento removido.");
    },
    onError: (err) => toast.error(`Erro ao remover: ${err.message}`),
  });

  const uploadMediaMutation = trpc.streetEvents.uploadMedia.useMutation({
    onError: (err) => toast.error(`Erro no upload: ${err.message}`),
  });

  // Sync previews ao abrir modal
  useEffect(() => {
    if (modalOpen && form.mediaUrls) {
      try {
        const urls = JSON.parse(form.mediaUrls);
        setMediaPreviewUrls(Array.isArray(urls) ? urls : []);
      } catch { setMediaPreviewUrls([]); }
    } else if (!modalOpen) {
      setMediaPreviewUrls([]);
      setModalTab("info");
    }
  }, [modalOpen, editingEvent]);

  function openNew(day?: Date) {
    setEditingEvent(null);
    setForm({ ...defaultForm, eventDate: day ? formatDateForInput(day) : formatDateForInput(new Date()) });
    setModalOpen(true);
  }

  function openEdit(ev: any) {
    setEditingEvent(ev);
    const d = new Date(ev.eventDate);
    setForm({
      title: ev.title || "",
      description: ev.description || "",
      type: ev.type || "outro",
      status: ev.status || "planejado",
      eventDate: formatDateForInput(d),
      eventTime: ev.eventTime || "09:00",
      endTime: ev.endTime || "",
      location: ev.location || "",
      neighborhood: ev.neighborhood || "",
      city: ev.city || "Brasília",
      expectedAttendees: ev.expectedAttendees || 0,
      actualAttendees: ev.actualAttendees || 0,
      notes: ev.notes || "",
      mediaUrls: ev.mediaUrls || "",
    });
    setModalOpen(true);
  }

  function createPostFromEvent(ev: any) {
    // Monta os query params para pré-preencher a agenda de conteúdo
    const eventDate = new Date(ev.eventDate);
    const dateStr = eventDate.toISOString().split("T")[0];
    const title = encodeURIComponent(`Evento: ${ev.title}`);
    const location = encodeURIComponent(ev.location || "");
    const neighborhood = encodeURIComponent(ev.neighborhood || "");
    const time = encodeURIComponent(ev.eventTime || "");
    const description = encodeURIComponent(
      `Evento de rua: ${ev.title}\nLocal: ${ev.location}${ev.neighborhood ? `, ${ev.neighborhood}` : ""}\nHorário: ${ev.eventTime || ""}\n${ev.description || ""}`
    );
    // Pega a primeira mídia do evento se houver
    let mediaUrl = "";
    if (ev.mediaUrls) {
      try {
        const urls = JSON.parse(ev.mediaUrls);
        if (Array.isArray(urls) && urls.length > 0) mediaUrl = encodeURIComponent(urls[0]);
      } catch { /* ignore */ }
    }
    const params = `?prefill=1&title=${title}&date=${dateStr}&description=${description}&type=imagem${mediaUrl ? `&mediaUrl=${mediaUrl}` : ""}`;
    navigate(`/conteudo${params}`);
    toast.success("Redirecionando para a agenda de conteúdo com os dados do evento pré-preenchidos!");
  }

  function handleSave() {
    if (!form.title.trim()) { toast.error("Título obrigatório."); return; }
    if (!form.eventDate) { toast.error("Data obrigatória."); return; }
    if (!form.location.trim()) { toast.error("Local obrigatório."); return; }

    const eventDate = new Date(form.eventDate + "T" + form.eventTime + ":00");
    const payload = {
      title: form.title,
      description: form.description || undefined,
      type: form.type,
      status: form.status,
      eventDate,
      eventTime: form.eventTime,
      endTime: form.endTime || undefined,
      location: form.location,
      neighborhood: form.neighborhood || undefined,
      city: form.city,
      expectedAttendees: form.expectedAttendees,
      actualAttendees: form.actualAttendees || undefined,
      notes: form.notes || undefined,
      mediaUrls: form.mediaUrls || undefined,
    };

    if (editingEvent) {
      updateEvent.mutate({ id: editingEvent.id, ...payload });
    } else {
      createEvent.mutate(payload);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingMedia(true);
    const newUrls: string[] = [];
    for (const file of files) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(file);
      });
      const result = await uploadMediaMutation.mutateAsync({
        fileName: file.name,
        fileBase64: base64,
        mimeType: file.type,
      });
      newUrls.push(result.url);
    }
    const current = form.mediaUrls ? JSON.parse(form.mediaUrls) : [];
    const updated = [...current, ...newUrls];
    setForm(f => ({ ...f, mediaUrls: JSON.stringify(updated) }));
    setMediaPreviewUrls(updated);
    setUploadingMedia(false);
    toast.success(`${newUrls.length} arquivo(s) enviado(s)!`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeMedia(url: string) {
    const updated = mediaPreviewUrls.filter(u => u !== url);
    setMediaPreviewUrls(updated);
    setForm(f => ({ ...f, mediaUrls: updated.length ? JSON.stringify(updated) : "" }));
  }

  // ─── Exportar PDF da agenda do mês ────────────────────────────────────────
  function exportPdf() {
    setIsExportingPdf(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const year = monthRef.getFullYear();
      const month = monthRef.getMonth();
      const monthName = MONTHS_PT[month];

      // Filtrar eventos do mês
      const monthEvents = events.filter(ev => {
        const d = new Date(ev.eventDate);
        return d.getFullYear() === year && d.getMonth() === month;
      }).sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

      // Cabeçalho
      doc.setFillColor(13, 17, 23);
      doc.rect(0, 0, 210, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Agenda de Rua", 14, 18);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(160, 160, 160);
      doc.text(`Pré campanha Eduardo Brandão · ${monthName} ${year}`, 14, 27);
      doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 14, 33);

      // KPIs
      const total = monthEvents.length;
      const realizados = monthEvents.filter(e => e.status === "realizado").length;
      const confirmados = monthEvents.filter(e => e.status === "confirmado").length;
      const totalPublico = monthEvents.reduce((s, e) => s + (e.actualAttendees || e.expectedAttendees || 0), 0);

      doc.setFillColor(22, 27, 34);
      doc.roundedRect(14, 46, 42, 22, 3, 3, "F");
      doc.roundedRect(60, 46, 42, 22, 3, 3, "F");
      doc.roundedRect(106, 46, 42, 22, 3, 3, "F");
      doc.roundedRect(152, 46, 42, 22, 3, 3, "F");

      const kpis = [
        { label: "Total de Eventos", value: String(total), x: 14 },
        { label: "Realizados", value: String(realizados), x: 60 },
        { label: "Confirmados", value: String(confirmados), x: 106 },
        { label: "Público Total", value: String(totalPublico), x: 152 },
      ];
      kpis.forEach(k => {
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(52, 211, 153); // verde
        doc.text(k.value, k.x + 21, 60, { align: "center" });
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(140, 140, 140);
        doc.text(k.label, k.x + 21, 65, { align: "center" });
      });

      // Tabela de eventos
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Eventos do Mês", 14, 80);

      const rows = monthEvents.map(ev => [
        new Date(ev.eventDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        ev.eventTime || "",
        ev.title || "",
        TYPE_CONFIG[ev.type as EventType]?.label || ev.type,
        STATUS_CONFIG[ev.status as EventStatus]?.label || ev.status,
        ev.location || "",
        ev.neighborhood || "",
        ev.expectedAttendees ? String(ev.expectedAttendees) : "",
        ev.actualAttendees ? String(ev.actualAttendees) : "",
      ]);

      autoTable(doc, {
        startY: 84,
        head: [["Data", "Hora", "Título", "Tipo", "Status", "Local", "Bairro", "Esperado", "Presente"]],
        body: rows,
        styles: { fontSize: 7, cellPadding: 2, textColor: [220, 220, 220], fillColor: [22, 27, 34] },
        headStyles: { fillColor: [30, 80, 50], textColor: [255, 255, 255], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [18, 22, 28] },
        columnStyles: {
          0: { cellWidth: 12 }, 1: { cellWidth: 10 }, 2: { cellWidth: 40 },
          3: { cellWidth: 20 }, 4: { cellWidth: 20 }, 5: { cellWidth: 35 },
          6: { cellWidth: 22 }, 7: { cellWidth: 12 }, 8: { cellWidth: 12 },
        },
        theme: "plain",
      });

      // Rodapé
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(80, 80, 80);
        doc.text(`Agenda de Rua · ${monthName} ${year} · Pág. ${i}/${pageCount}`, 105, 290, { align: "center" });
      }

      doc.save(`agenda-rua-${monthName.toLowerCase()}-${year}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar PDF.");
    } finally {
      setIsExportingPdf(false);
    }
  }

  function getEventsForDay(day: Date): any[] {
    return filteredEvents.filter(ev => {
      const d = new Date(ev.eventDate);
      return isSameDay(d, day);
    });
  }

  function getMediaIcon(url: string) {
    if (/\.(mp4|mov|avi|webm)$/i.test(url)) return <FileVideo className="w-4 h-4" />;
    if (/\.(pdf)$/i.test(url)) return <FileText className="w-4 h-4" />;
    return <Image className="w-4 h-4" />;
  }

  function isImage(url: string) {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#0d1117] text-gray-100 overflow-hidden">
      <SidebarNav activeSection="agenda-rua" />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}

        <div className="sticky top-0 z-10 bg-[#0d1117]/95 backdrop-blur border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-green-400" />
            <div>
              <h1 className="text-lg font-bold text-white">Agenda de Rua</h1>
              <p className="text-xs text-gray-400">Eventos presenciais do candidato</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filtro por região/bairro */}
            <select
              value={filterBairro}
              onChange={e => setFilterBairro(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
            >
              <option value="todos">Todas as regiões</option>
              {REGIOES_DF.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {/* View mode */}
            <div className="flex bg-white/5 rounded-lg p-1 gap-1">
              {(["semanal", "mensal", "lista", "mapa"] as ViewMode[]).map(v => (
                <button
                  key={v}
                  onClick={() => setViewMode(v)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${viewMode === v ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"}`}>
                  {v === "mapa" ? "Mapa" : v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={exportPdf}
              disabled={isExportingPdf}
              className="border-white/10 text-gray-300 hover:text-white hover:bg-white/10 gap-1"
            >
              {isExportingPdf
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Download className="w-4 h-4" />
              }
              Exportar PDF
            </Button>
            {canEdit && (
              <Button size="sm" onClick={() => openNew()} className="bg-green-600 hover:bg-green-700 text-white gap-1">
                <Plus className="w-4 h-4" /> Novo Evento
              </Button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* ── VISTA SEMANAL ── */}
          {viewMode === "semanal" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => { const d = new Date(weekRef); d.setDate(d.getDate() - 7); setWeekRef(d); }} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-gray-300">
                  {weekDays[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} – {weekDays[6].toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                <button onClick={() => { const d = new Date(weekRef); d.setDate(d.getDate() + 7); setWeekRef(d); }} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, i) => {
                  const dayEvents = getEventsForDay(day);
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div key={i} className={`min-h-[140px] rounded-xl border p-2 ${isToday ? "border-green-500/50 bg-green-500/5" : "border-white/5 bg-white/2"}`}>
                      <div className={`text-center mb-2 ${isToday ? "text-green-400 font-bold" : "text-gray-400"}`}>
                        <div className="text-xs">{DAYS_PT[day.getDay()]}</div>
                        <div className="text-lg font-bold">{day.getDate()}</div>
                      </div>
                      <div className="space-y-1">
                        {dayEvents.map(ev => {
                          const cfg = TYPE_CONFIG[ev.type as EventType] || TYPE_CONFIG.outro;
                          const Icon = cfg.icon;
                          return (
                            <button key={ev.id} onClick={() => openEdit(ev)}
                              className={`w-full text-left p-1.5 rounded-lg border text-xs ${cfg.bg} hover:opacity-80 transition-opacity`}>
                              <div className="flex items-center gap-1">
                                <Icon className={`w-3 h-3 ${cfg.color} shrink-0`} />
                                <span className="truncate font-medium text-white">{ev.title}</span>
                              </div>
                              <div className="text-gray-400 mt-0.5">{ev.eventTime}</div>
                            </button>
                          );
                        })}
                        {canEdit && (
                          <button onClick={() => openNew(day)}
                            className="w-full p-1 rounded border border-dashed border-white/10 text-gray-600 hover:text-gray-400 hover:border-white/20 transition-colors text-xs flex items-center justify-center gap-1">
                            <Plus className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── VISTA MENSAL ── */}
          {viewMode === "mensal" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => { const d = new Date(monthRef); d.setMonth(d.getMonth() - 1); setMonthRef(d); }} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-base font-semibold text-white">
                  {MONTHS_PT[monthRef.getMonth()]} {monthRef.getFullYear()}
                </span>
                <button onClick={() => { const d = new Date(monthRef); d.setMonth(d.getMonth() + 1); setMonthRef(d); }} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {/* Header dias */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAYS_PT.map(d => (
                  <div key={d} className="text-center text-xs text-gray-500 font-medium py-1">{d}</div>
                ))}
              </div>
              {/* Grid */}
              <div className="grid grid-cols-7 gap-1">
                {monthGrid.map((day, i) => {
                  if (!day) return <div key={i} className="min-h-[90px]" />;
                  const dayEvents = getEventsForDay(day);
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div key={i} className={`min-h-[90px] rounded-xl border p-1.5 transition-colors ${isToday ? "border-green-500/50 bg-green-500/5" : "border-white/5 bg-white/2 hover:border-white/15"}`}>
                      {/* Header do dia com botão + */}
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${isToday ? "text-green-400" : "text-gray-400"}`}>{day.getDate()}</span>
                        {canEdit && (
                          <button onClick={() => openNew(day)}
                            className="w-4 h-4 rounded flex items-center justify-center text-gray-600 hover:text-green-400 hover:bg-green-500/10 transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map(ev => {
                          const cfg = TYPE_CONFIG[ev.type as EventType] || TYPE_CONFIG.outro;
                          const Icon = cfg.icon;
                          return (
                            <button key={ev.id} onClick={() => openEdit(ev)}
                              className={`w-full text-left px-1.5 py-0.5 rounded border text-xs ${cfg.bg} hover:opacity-80 transition-opacity flex items-center gap-1`}>
                              <Icon className={`w-2.5 h-2.5 ${cfg.color} shrink-0`} />
                              <span className="truncate text-white">{ev.title}</span>
                            </button>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <button
                            onClick={() => { setViewMode("lista"); }}
                            className="w-full text-xs text-green-400 hover:text-green-300 pl-1 text-left transition-colors">
                            +{dayEvents.length - 3} mais →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── VISTA LISTA ── */}
          {viewMode === "lista" && (
            <div className="space-y-3">
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-green-400" />
                </div>
              )}
              {!isLoading && events.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Nenhum evento cadastrado ainda.</p>
                  {canEdit && (
                    <Button size="sm" onClick={() => openNew()} className="mt-4 bg-green-600 hover:bg-green-700 text-white gap-1">
                      <Plus className="w-4 h-4" /> Criar primeiro evento
                    </Button>
                  )}
                </div>
              )}
              {events.map(ev => {
                const cfg = TYPE_CONFIG[ev.type as EventType] || TYPE_CONFIG.outro;
                const sCfg = STATUS_CONFIG[ev.status as EventStatus] || STATUS_CONFIG.planejado;
                const Icon = cfg.icon;
                const SIcon = sCfg.icon;
                const mediaList = ev.mediaUrls ? (() => { try { return JSON.parse(ev.mediaUrls); } catch { return []; } })() : [];
                return (
                  <div key={ev.id} className="bg-white/3 border border-white/8 rounded-xl p-4 hover:border-white/15 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg border ${cfg.bg} shrink-0`}>
                          <Icon className={`w-4 h-4 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-white text-sm">{ev.title}</h3>
                            <Badge variant="outline" className={`text-xs border ${sCfg.color}`}>
                              <SIcon className="w-3 h-3 mr-1" />
                              {sCfg.label}
                            </Badge>
                            <Badge variant="outline" className={`text-xs border ${cfg.bg} ${cfg.color}`}>
                              {cfg.label}
                            </Badge>
                          </div>
                          {ev.description && (
                            <p className="text-xs text-gray-400 mb-2 line-clamp-2">{ev.description}</p>
                          )}
                          <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(ev.eventDate).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {ev.eventTime}{ev.endTime ? ` – ${ev.endTime}` : ""}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {ev.location}{ev.neighborhood ? `, ${ev.neighborhood}` : ""}
                            </span>
                            {ev.expectedAttendees > 0 && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {ev.expectedAttendees} esperados
                                {ev.actualAttendees ? ` / ${ev.actualAttendees} presentes` : ""}
                              </span>
                            )}
                          </div>
                          {mediaList.length > 0 && (
                            <div className="flex items-center gap-1 mt-2 flex-wrap">
                              {mediaList.slice(0, 4).map((url: string, idx: number) => (
                                <button key={idx} onClick={() => setLightboxUrl(url)}
                                  className="w-8 h-8 rounded border border-white/10 bg-white/5 flex items-center justify-center hover:border-white/30 transition-colors overflow-hidden">
                                  {isImage(url)
                                    ? <img src={url} alt="" className="w-full h-full object-cover" />
                                    : getMediaIcon(url)
                                  }
                                </button>
                              ))}
                              {mediaList.length > 4 && (
                                <span className="text-xs text-gray-500">+{mediaList.length - 4}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                          <button
                            title="Criar post a partir deste evento"
                            onClick={() => createPostFromEvent(ev)}
                            className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300 transition-colors">
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          {canEdit && (
                            <>
                              <button onClick={() => openEdit(ev)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {canDelete && (
                                <button onClick={() => { if (confirm("Remover este evento?")) deleteEvent.mutate({ id: ev.id }); }}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── VISTA MAPA ── */}
          {viewMode === "mapa" && (
            <MapaVista
              filteredEvents={filteredEvents}
              filterBairro={filterBairro}
            />
          )}
        </div>
      </main>

      {/* ─── MODAL DE EVENTO ─────────────────────────────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#161b22] border border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <MapPin className="w-5 h-5 text-green-400" />
              {editingEvent ? "Editar Evento de Rua" : "Novo Evento de Rua"}
            </DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-1 bg-white/5 rounded-lg p-1 mb-4">
            {(["info", "local", "midia"] as const).map(tab => (
              <button key={tab} onClick={() => setModalTab(tab)}
                className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${modalTab === tab ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"}`}>
                {tab === "info" ? "Informações" : tab === "local" ? "Local & Público" : "Materiais"}
              </button>
            ))}
          </div>

          {/* ── Tab: Informações ── */}
          {modalTab === "info" && (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300 text-xs mb-1 block">Título *</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Caminhada no Guará" className="bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
              </div>
              <div>
                <Label className="text-gray-300 text-xs mb-1 block">Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Detalhes do evento..." rows={3}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300 text-xs mb-1 block">Tipo</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as EventType }))}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1c2128] border-white/10">
                      {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="text-white hover:bg-white/10">{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300 text-xs mb-1 block">Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as EventStatus }))}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1c2128] border-white/10">
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="text-white hover:bg-white/10">{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <Label className="text-gray-300 text-xs mb-1 block">Data *</Label>
                  <Input type="date" value={form.eventDate} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <Label className="text-gray-300 text-xs mb-1 block">Início</Label>
                  <Input type="time" value={form.eventTime} onChange={e => setForm(f => ({ ...f, eventTime: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <Label className="text-gray-300 text-xs mb-1 block">Término</Label>
                  <Input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white" />
                </div>
              </div>
              <div>
                <Label className="text-gray-300 text-xs mb-1 block">Observações</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Notas internas, logística, contatos..." rows={2}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 resize-none" />
              </div>
            </div>
          )}

          {/* ── Tab: Local & Público ── */}
          {modalTab === "local" && (
            <div className="space-y-4">
              {/* Campo com autocomplete do Google Maps */}
              <div>
                <Label className="text-gray-300 text-xs mb-1 block">Buscar endereço (autocomplete)</Label>
                <input
                  ref={autocompleteInputRef}
                  type="text"
                  defaultValue={form.location}
                  placeholder="Digite o endereço para buscar no mapa..."
                  className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">Selecione um resultado para preencher o endereço e posicionar o pin no mapa.</p>
              </div>

              {/* Mapa interativo */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-xs text-gray-400">Clique no mapa para posicionar o marcador e preencher o endereço automaticamente</span>
                </div>
                <div className="rounded-xl overflow-hidden border border-white/10">
                  <MapView
                    initialCenter={mapCenter}
                    initialZoom={12}
                    className="h-[240px]"
                    onMapReady={handleMapReady}
                  />
                </div>
              </div>

              {/* Campo de endereço manual */}
              <div>
                <Label className="text-gray-300 text-xs mb-1 block">Local / Endereço *</Label>
                <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Ex: Praça do Guárá, Quadra 1" className="bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300 text-xs mb-1 block">Bairro / Região</Label>
                  <Input value={form.neighborhood} onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))}
                    placeholder="Ex: Guárá I" className="bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
                </div>
                <div>
                  <Label className="text-gray-300 text-xs mb-1 block">Cidade</Label>
                  <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300 text-xs mb-1 block">Público esperado</Label>
                  <Input type="number" min={0} value={form.expectedAttendees}
                    onChange={e => setForm(f => ({ ...f, expectedAttendees: parseInt(e.target.value) || 0 }))}
                    className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <Label className="text-gray-300 text-xs mb-1 block">Público presente (pós-evento)</Label>
                  <Input type="number" min={0} value={form.actualAttendees || ""}
                    onChange={e => setForm(f => ({ ...f, actualAttendees: parseInt(e.target.value) || 0 }))}
                    placeholder="Preencher após o evento"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Materiais ── */}
          {modalTab === "midia" && (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300 text-xs mb-2 block">Materiais gráficos, fotos e vídeos</Label>
                <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.pdf"
                  onChange={handleFileUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploadingMedia}
                  className="w-full border-2 border-dashed border-white/15 rounded-xl p-6 text-center hover:border-green-500/40 hover:bg-green-500/5 transition-all group">
                  {uploadingMedia
                    ? <Loader2 className="w-6 h-6 animate-spin text-green-400 mx-auto mb-2" />
                    : <Upload className="w-6 h-6 text-gray-500 group-hover:text-green-400 mx-auto mb-2 transition-colors" />
                  }
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    {uploadingMedia ? "Enviando..." : "Clique para enviar imagens, vídeos ou PDFs"}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">JPG, PNG, MP4, MOV, PDF</p>
                </button>
              </div>

              {mediaPreviewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {mediaPreviewUrls.map((url, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border border-white/10 bg-white/5 aspect-square">
                      {isImage(url)
                        ? <img src={url} alt="" className="w-full h-full object-cover" />
                        : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-400">
                            {getMediaIcon(url)}
                            <span className="text-xs truncate px-2 text-center">{url.split("/").pop()?.slice(0, 20)}</span>
                          </div>
                        )
                      }
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button onClick={() => setLightboxUrl(url)} className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                          <Eye className="w-4 h-4 text-white" />
                        </button>
                        <button onClick={() => removeMedia(url)} className="p-1.5 bg-red-500/40 rounded-lg hover:bg-red-500/60 transition-colors">
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={createEvent.isPending || updateEvent.isPending}
              className="bg-green-600 hover:bg-green-700 text-white gap-2">
              {(createEvent.isPending || updateEvent.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingEvent ? "Salvar alterações" : "Criar evento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── LIGHTBOX ─────────────────────────────────────────────────────────── */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
          <button className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
          {isImage(lightboxUrl)
            ? <img src={lightboxUrl} alt="" className="max-w-full max-h-full rounded-xl object-contain" onClick={e => e.stopPropagation()} />
            : (
              <div className="bg-[#161b22] rounded-xl p-8 text-center" onClick={e => e.stopPropagation()}>
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <a href={lightboxUrl} target="_blank" rel="noopener noreferrer"
                  className="text-green-400 hover:underline text-sm">Abrir arquivo em nova aba</a>
              </div>
            )
          }
        </div>
      )}
    </div>
  );
}
