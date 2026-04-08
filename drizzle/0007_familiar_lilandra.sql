CREATE TABLE `instagram_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(255) NOT NULL,
	`followers` int NOT NULL DEFAULT 0,
	`following` int NOT NULL DEFAULT 0,
	`postsCount` int NOT NULL DEFAULT 0,
	`biography` text,
	`profilePictureUrl` text,
	`engagementRate` int NOT NULL DEFAULT 0,
	`averageLikes` int NOT NULL DEFAULT 0,
	`averageComments` int NOT NULL DEFAULT 0,
	`lastSyncedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `instagram_metrics_id` PRIMARY KEY(`id`),
	CONSTRAINT `instagram_metrics_username_unique` UNIQUE(`username`)
);
