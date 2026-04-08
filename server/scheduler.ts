import cron from "node-cron";

let schedulerInitialized = false;

/**
 * Inicializar scheduler
 * Atualmente desabilitado - publicação automática requer configuração adicional
 */
export function initializeScheduler(): void {
  if (schedulerInitialized) return;
  schedulerInitialized = true;
  console.log("[Scheduler] Scheduler initialized (auto-publish disabled)");
}

/**
 * Parar o scheduler
 */
export function stopScheduler(): void {
  cron.getTasks().forEach((task) => task.stop());
  schedulerInitialized = false;
  console.log("[Scheduler] Scheduler stopped");
}
