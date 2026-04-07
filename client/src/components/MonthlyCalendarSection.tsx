// ============================================================
// DESIGN: Command Center Militar Verde
// Calendário Mensal — Visão de grade com todos os posts
// ============================================================
import { useState } from "react";
import { CALENDAR_MONTHS, PILLAR_COLORS, type CalendarPost } from "@/lib/monthlyCalendar";
import { ScheduledPostEditor } from "./ScheduledPostEditor";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Target,
  Megaphone,
  Clock,
  Film,
  LayoutGrid,
  Image,
  X,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function PostTooltip({ post, onClose, onEdit }: { post: CalendarPost; onClose: () => void; onEdit: (post: CalendarPost) => void }) {
  const pillar = PILLAR_COLORS[post.pillar];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-xl border border-border p-5 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: pillar.bg, color: pillar.text }}>
              {pillar.label}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">{post.format}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted/30 transition-colors">
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>
        <h3 className="text-sm font-bold text-foreground mb-2">{post.title}</h3>
        <div className="space-y-2 text-xs text-foreground/70">
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-primary" />
            <span>{post.dayOfWeek}, {post.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-primary" />
            <span>Publicar às {post.time}</span>
          </div>
          {post.hasAds && (
            <div className="flex items-center gap-2">
              <Megaphone size={12} className="text-[#c9a84c]" />
              <span className="text-[#c9a84c] font-medium">Impulsionamento pago</span>
            </div>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Post #{post.id}</span>
          <span className="text-[9px] font-mono text-muted-foreground">{post.status.toUpperCase()}</span>
        </div>
        {post.status === "planejado" && (
          <Button
            onClick={() => onEdit(post)}
            variant="outline"
            size="sm"
            className="w-full mt-3 text-xs"
          >
            <Edit size={12} className="mr-1" />
            Editar
          </Button>
        )}
      </div>
    </div>
  );
}

export default function MonthlyCalendarSection() {
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(0);
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<CalendarPost | null>(null);

  const month = CALENDAR_MONTHS[selectedMonthIdx];
  const totalPosts = CALENDAR_MONTHS.reduce((acc, m) => acc + m.postsCount, 0);

  // Build calendar grid
  const year = month.year;
  const monthNum = month.month;
  const firstDay = new Date(year, monthNum - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, monthNum, 0).getDate();

  // Map posts by day
  const postsByDay: Record<number, CalendarPost[]> = {};
  month.posts.forEach((p) => {
    const day = parseInt(p.date.split("-")[2]);
    if (!postsByDay[day]) postsByDay[day] = [];
    postsByDay[day].push(p);
  });

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7));
  }

  const dayHeaders = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const formatIcon = (format: string) => {
    if (format.includes("Reels") || format.includes("Vídeo")) return <Film size={10} />;
    if (format.includes("Carrossel")) return <LayoutGrid size={10} />;
    return <Image size={10} />;
  };

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-5 bg-primary rounded-full" />
        <h2 className="text-lg font-bold text-foreground">CALENDÁRIO MENSAL</h2>
        <span className="text-xs font-mono text-muted-foreground ml-2">{totalPosts} posts planejados</span>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setSelectedMonthIdx(Math.max(0, selectedMonthIdx - 1))}
          disabled={selectedMonthIdx === 0}
          className="p-2 rounded-lg bg-card border border-border hover:border-primary/20 disabled:opacity-30 transition-all"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex flex-wrap gap-1.5 justify-center">
          {CALENDAR_MONTHS.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setSelectedMonthIdx(i)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                selectedMonthIdx === i
                  ? "bg-primary/15 text-primary border border-primary/40 ring-1 ring-primary/20"
                  : "bg-card text-muted-foreground border border-border hover:border-primary/20"
              }`}
            >
              {m.name.substring(0, 3)}
            </button>
          ))}
        </div>

        <button
          onClick={() => setSelectedMonthIdx(Math.min(CALENDAR_MONTHS.length - 1, selectedMonthIdx + 1))}
          disabled={selectedMonthIdx === CALENDAR_MONTHS.length - 1}
          className="p-2 rounded-lg bg-card border border-border hover:border-primary/20 disabled:opacity-30 transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Month info */}
      <div className="bg-card rounded-xl border border-border p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">{month.name} {month.year}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">{month.theme}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xl font-mono font-bold text-primary">{month.postsCount}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-mono font-bold text-[#c9a84c]">{month.posts.filter(p => p.hasAds).length}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Com Ads</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-mono font-bold text-foreground">{month.metaSeguidores.toLocaleString("pt-BR")}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Meta Seg.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pillar legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(PILLAR_COLORS).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: val.text }} />
            <span className="text-[10px] text-muted-foreground">{val.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-2">
          <Megaphone size={10} className="text-[#c9a84c]" />
          <span className="text-[10px] text-muted-foreground">Com Ads</span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {dayHeaders.map((day, i) => (
            <div key={day} className={`py-2 text-center text-[10px] font-bold uppercase tracking-wider ${i === 0 || i === 6 ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-border/50 last:border-b-0">
            {week.map((day, di) => {
              const posts = day ? postsByDay[day] || [] : [];
              const isToday = day && new Date().getDate() === day && new Date().getMonth() + 1 === monthNum && new Date().getFullYear() === year;

              return (
                <div
                  key={di}
                  className={`min-h-[80px] lg:min-h-[100px] p-1.5 border-r border-border/30 last:border-r-0 transition-colors ${
                    day ? "hover:bg-muted/10" : "bg-muted/5"
                  } ${isToday ? "bg-primary/5 ring-1 ring-inset ring-primary/20" : ""}`}
                >
                  {day && (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-mono ${isToday ? "text-primary font-bold" : "text-muted-foreground"}`}>
                          {day}
                        </span>
                        {isToday && <span className="text-[7px] bg-primary/20 text-primary px-1 rounded font-bold">HOJE</span>}
                      </div>
                      <div className="space-y-0.5">
                        {posts.map((post) => {
                          const pillar = PILLAR_COLORS[post.pillar];
                          return (
                            <button
                              key={post.id}
                              onClick={() => setSelectedPost(post)}
                              className="w-full text-left rounded px-1 py-0.5 transition-all hover:ring-1 hover:ring-primary/30 group"
                              style={{ backgroundColor: pillar.bg }}
                            >
                              <div className="flex items-center gap-1">
                                <span style={{ color: pillar.text }}>{formatIcon(post.format)}</span>
                                {post.hasAds && <Megaphone size={8} className="text-[#c9a84c]" />}
                              </div>
                              <p className="text-[8px] leading-tight text-foreground/70 truncate group-hover:text-foreground transition-colors">
                                {post.title}
                              </p>
                              <p className="text-[7px] font-mono text-muted-foreground">{post.time}</p>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Month posts list (compact) */}
      <div className="mt-4 bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-3 border-b border-border/50 flex items-center gap-2">
          <Calendar size={14} className="text-primary" />
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">Lista de Posts — {month.name}</span>
          <span className="text-[10px] font-mono text-muted-foreground ml-auto">{month.postsCount} posts</span>
        </div>
        <div className="divide-y divide-border/30 max-h-[300px] overflow-y-auto">
          {month.posts.map((post) => {
            const pillar = PILLAR_COLORS[post.pillar];
            return (
              <button
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/10 transition-colors text-left"
              >
                <span className="text-[10px] font-mono text-muted-foreground w-16 shrink-0">{post.date.slice(5)}</span>
                <span className="text-[10px] font-mono text-muted-foreground w-10 shrink-0">{post.time}</span>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: pillar.text }} />
                <span className="text-xs text-foreground truncate flex-1">{post.title}</span>
                <span className="text-[9px] font-mono text-muted-foreground bg-muted/20 px-1.5 py-0.5 rounded shrink-0">{post.format.split(" ")[0]}</span>
                {post.hasAds && <Megaphone size={10} className="text-[#c9a84c] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CALENDAR_MONTHS.map((m) => (
          <div key={m.id} className={`bg-card rounded-lg border p-3 text-center transition-all cursor-pointer hover:border-primary/20 ${selectedMonthIdx === CALENDAR_MONTHS.indexOf(m) ? "border-primary/40 ring-1 ring-primary/20" : "border-border"}`} onClick={() => setSelectedMonthIdx(CALENDAR_MONTHS.indexOf(m))}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.name}</p>
            <p className="text-lg font-mono font-bold text-foreground">{m.postsCount}</p>
            <p className="text-[9px] text-muted-foreground">Meta: {m.metaSeguidores.toLocaleString("pt-BR")}</p>
          </div>
        ))}
      </div>

      {/* Post detail modal */}
      {selectedPost && (
        <PostTooltip
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onEdit={(post) => {
            setPostToEdit(post);
            setIsEditorOpen(true);
            setSelectedPost(null);
          }}
        />
      )}

      {/* Scheduled Post Editor Modal */}
      {postToEdit && (
        <ScheduledPostEditor
          post={{
            id: postToEdit.id.toString(),
            title: postToEdit.title,
            caption: "", // CalendarPost não tem caption, usar vazio
            scheduledDate: `${postToEdit.date}T${postToEdit.time}:00`,
            status: "scheduled",
          }}
          isOpen={isEditorOpen}
          onOpenChange={setIsEditorOpen}
          onSave={async (updatedPost) => {
            // TODO: Conectar ao tRPC para salvar no banco
            console.log("Post atualizado:", updatedPost);
          }}
        />
      )}
    </div>
  );
}
