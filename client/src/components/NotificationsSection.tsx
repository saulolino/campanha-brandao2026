// ============================================================
// DESIGN: Command Center Militar Verde
// Sistema de Notificações e Lembretes
// ============================================================
import { useState } from "react";
import {
  getNotifications,
  getUpcomingPosts,
  REMINDER_RULES,
  type Notification,
  type UpcomingPost,
} from "@/lib/notifications";
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Settings,
  Video,
  Image,
  Film,
} from "lucide-react";

const typeStyles: Record<string, { border: string; bg: string; icon: string; dot: string }> = {
  urgent: { border: "border-red-500/30", bg: "bg-red-500/5", icon: "text-red-400", dot: "bg-red-500" },
  warning: { border: "border-yellow-500/30", bg: "bg-yellow-500/5", icon: "text-yellow-400", dot: "bg-yellow-500" },
  info: { border: "border-blue-400/30", bg: "bg-blue-400/5", icon: "text-blue-400", dot: "bg-blue-400" },
  success: { border: "border-[#2d6a4f]/30", bg: "bg-[#2d6a4f]/5", icon: "text-[#2d6a4f]", dot: "bg-[#2d6a4f]" },
};

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  overdue: { bg: "bg-red-500/20", text: "text-red-400", label: "ATRASADO" },
  today: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "HOJE" },
  tomorrow: { bg: "bg-orange-400/20", text: "text-orange-400", label: "AMANHÃ" },
  upcoming: { bg: "bg-blue-400/20", text: "text-blue-400", label: "EM BREVE" },
  week: { bg: "bg-muted/20", text: "text-muted-foreground", label: "ESTA SEMANA" },
};

function TypeIcon({ type }: { type: string }) {
  const cls = `${typeStyles[type]?.icon || "text-muted-foreground"}`;
  if (type === "urgent") return <AlertTriangle size={14} className={cls} />;
  if (type === "warning") return <Clock size={14} className={cls} />;
  if (type === "success") return <CheckCircle2 size={14} className={cls} />;
  return <Info size={14} className={cls} />;
}

function FormatIcon({ type }: { type: string }) {
  if (type === "Vídeo") return <Video size={12} className="text-blue-400" />;
  if (type === "Reels") return <Film size={12} className="text-purple-400" />;
  return <Image size={12} className="text-[#2d6a4f]" />;
}

export default function NotificationsSection() {
  const [notifications, setNotifications] = useState<Notification[]>(getNotifications());
  const [filter, setFilter] = useState<"all" | "unread" | "urgent">("all");
  const [showRules, setShowRules] = useState(false);
  const upcomingPosts = getUpcomingPosts();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const urgentCount = notifications.filter((n) => n.type === "urgent" && !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "urgent") return n.type === "urgent";
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-5 bg-primary rounded-full" />
        <h2 className="text-lg font-bold text-foreground">NOTIFICAÇÕES E LEMBRETES</h2>
        {unreadCount > 0 && (
          <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">
            {unreadCount}
          </span>
        )}
      </div>

      {/* Upcoming posts timeline */}
      <div className="bg-card rounded-xl border border-primary/20 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Próximos Posts</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">{upcomingPosts.length} posts programados</span>
        </div>

        <div className="space-y-2">
          {upcomingPosts.map((post, i) => {
            const status = statusStyles[post.status];
            return (
              <div key={post.id} className="flex items-center gap-3 bg-muted/5 rounded-lg border border-border/50 p-3 hover:border-primary/20 transition-colors">
                {/* Timeline dot */}
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-3 h-3 rounded-full ${post.daysUntil <= 2 ? "bg-yellow-500 animate-pulse" : "bg-primary/40"}`} />
                  {i < upcomingPosts.length - 1 && <div className="w-px h-6 bg-border/30 mt-1" />}
                </div>

                {/* Date */}
                <div className="shrink-0 w-16 text-center">
                  <p className="text-xs font-mono font-bold text-foreground">
                    {post.date.split("-")[2]}/{post.date.split("-")[1]}
                  </p>
                  <p className="text-[9px] text-muted-foreground">{post.time}</p>
                </div>

                {/* Status badge */}
                <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${status.bg} ${status.text}`}>
                  {post.daysUntil === 0 ? "HOJE" : post.daysUntil === 1 ? "AMANHÃ" : `${post.daysUntil}d`}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-foreground truncate">{post.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <FormatIcon type={post.type} />
                    <span className="text-[9px] text-muted-foreground">{post.type}</span>
                    <span className="text-[9px] text-primary/60">{post.pillar}</span>
                  </div>
                </div>

                {/* Countdown */}
                <div className="shrink-0 text-right">
                  <p className={`text-xs font-mono font-bold ${post.daysUntil <= 2 ? "text-yellow-400" : "text-muted-foreground"}`}>
                    {post.hoursUntil}h
                  </p>
                  <p className="text-[8px] text-muted-foreground">restantes</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notifications list */}
      <div className="bg-card rounded-xl border border-border p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell size={14} className="text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Central de Alertas</span>
            {urgentCount > 0 && (
              <span className="text-[9px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                {urgentCount} urgente{urgentCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <button onClick={markAllRead} className="text-[10px] text-primary hover:text-primary/80 transition-colors">
            Marcar todas como lidas
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-3">
          {[
            { key: "all" as const, label: "Todas", count: notifications.length },
            { key: "unread" as const, label: "Não lidas", count: unreadCount },
            { key: "urgent" as const, label: "Urgentes", count: notifications.filter((n) => n.type === "urgent").length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`text-[10px] font-medium px-2.5 py-1.5 rounded-md transition-colors ${
                filter === tab.key
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted/10"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Notification items */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filtered.map((notif) => {
            const style = typeStyles[notif.type];
            return (
              <div
                key={notif.id}
                className={`rounded-lg border p-3 transition-all ${style.border} ${style.bg} ${
                  !notif.read ? "shadow-sm" : "opacity-70"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <TypeIcon type={notif.type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-bold text-foreground">{notif.title}</span>
                      {!notif.read && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
                    </div>
                    <p className="text-[10px] text-foreground/60 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[9px] text-muted-foreground">{notif.time}</span>
                      {notif.actionLabel && (
                        <button className="text-[9px] font-medium text-primary hover:text-primary/80 transition-colors">
                          {notif.actionLabel}
                        </button>
                      )}
                      {!notif.read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="text-[9px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
                        >
                          <Eye size={9} /> Marcar como lida
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reminder rules */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setShowRules(!showRules)}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-2">
            <Settings size={14} className="text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Regras de Lembretes</span>
            <span className="text-[10px] font-mono text-muted-foreground">{REMINDER_RULES.length} regras ativas</span>
          </div>
          {showRules ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
        </button>
        {showRules && (
          <div className="px-4 pb-4">
            <div className="space-y-2">
              {REMINDER_RULES.map((rule, i) => {
                const style = typeStyles[rule.type];
                return (
                  <div key={i} className={`flex items-center gap-3 rounded-lg border p-3 ${style.border} ${style.bg}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${style.bg}`}>
                      <Clock size={14} className={style.icon} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{rule.label}</span>
                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${style.bg} ${style.icon}`}>
                          {rule.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-foreground/60">{rule.description}</p>
                    </div>
                    <div className="shrink-0">
                      <div className="w-8 h-4 bg-primary/30 rounded-full flex items-center justify-end px-0.5">
                        <div className="w-3 h-3 bg-primary rounded-full" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] text-muted-foreground mt-3 text-center">
              Lembretes são gerados automaticamente com base no calendário de publicações
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
