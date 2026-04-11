CREATE TABLE `instagram_followers_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(255) NOT NULL,
	`followers` int NOT NULL,
	`following` int NOT NULL DEFAULT 0,
	`postsCount` int NOT NULL DEFAULT 0,
	`totalLikes` int NOT NULL DEFAULT 0,
	`totalComments` int NOT NULL DEFAULT 0,
	`totalShares` int NOT NULL DEFAULT 0,
	`totalSaves` int NOT NULL DEFAULT 0,
	`snapshotDate` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `instagram_followers_history_id` PRIMARY KEY(`id`)
);
