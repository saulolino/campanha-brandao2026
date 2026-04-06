CREATE TABLE `instagram_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`scheduledDate` timestamp NOT NULL,
	`status` enum('draft','design','caption','review','scheduled','published','failed') NOT NULL DEFAULT 'draft',
	`mediaUrls` text,
	`caption` text,
	`hashtags` text,
	`designerId` int,
	`captionWriterId` int,
	`coordinatorId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`publishedAt` timestamp,
	`instagramPostId` varchar(255),
	`instagramError` text,
	CONSTRAINT `instagram_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_status_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`previousStatus` varchar(50) NOT NULL,
	`newStatus` varchar(50) NOT NULL,
	`changedBy` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_status_history_id` PRIMARY KEY(`id`)
);
