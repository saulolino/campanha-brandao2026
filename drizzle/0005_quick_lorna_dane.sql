ALTER TABLE `users` ADD `emailVerified` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerificationToken` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordResetToken` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordResetExpires` timestamp;