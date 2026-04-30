import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { postsRouter } from "./routers/posts";
import { usersRouter } from "./routers/users";
import { instagramRouter } from "./routers/instagram";
import { streetEventsRouter } from "./routers/streetEvents";
import { notificationsRouter } from "./routers/notifications";
import { weeklyPlanningRouter } from "./routers/weeklyPlanning";
import { proposalsRouter } from "./routers/proposals";
import { whatsappRouter } from "./routers/whatsapp";
import { whatsappSettingsRouter } from "./routers/whatsappSettings";
import { competitorsRouter } from "./routers/competitors";
import { facebookRouter } from "./routers/facebook";
import { candidateSettingsRouter } from "./routers/candidateSettings";
import { territoriesRouter } from "./routers/territories";
import { reportRouter } from "./routers/report";
import { electoralCalendarRouter } from "./routers/electoralCalendar";
import { electoralAlertsRouter } from "./routers/electoralAlerts";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  posts: postsRouter,
  users: usersRouter,
  instagram: instagramRouter,
  streetEvents: streetEventsRouter,
  notifications: notificationsRouter,
  weeklyPlanning: weeklyPlanningRouter,
  proposals: proposalsRouter,
  whatsapp: whatsappRouter,
  whatsappSettings: whatsappSettingsRouter,
  competitors: competitorsRouter,
  facebook: facebookRouter,
  candidateSettings: candidateSettingsRouter,
  // ── Camada Territorial PDAD/IPEDF ──────────────────────────────────────────
  // Reutilizável por: Atlas.voto | Monitor360 | Fala Eleitor | Campanha360
  territories: territoriesRouter,
  report: reportRouter,
  electoralCalendar: electoralCalendarRouter,
  electoralAlerts: electoralAlertsRouter,
});

export type AppRouter = typeof appRouter;
