ALTER TABLE `users` MODIFY COLUMN `role` enum('visitor','team','coordinator','superadmin') NOT NULL DEFAULT 'visitor';--> statement-breakpoint
ALTER TABLE `users` ADD `department` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` int DEFAULT 1 NOT NULL;