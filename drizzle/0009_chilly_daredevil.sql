ALTER TABLE `instagram_posts` ADD `type` enum('reels','carrossel','video','story','imagem') DEFAULT 'imagem' NOT NULL;--> statement-breakpoint
ALTER TABLE `instagram_posts` ADD `objective` varchar(255);--> statement-breakpoint
ALTER TABLE `instagram_posts` ADD `scheduledTime` varchar(5) DEFAULT '12:00';--> statement-breakpoint
ALTER TABLE `instagram_posts` ADD `description` text;--> statement-breakpoint
ALTER TABLE `instagram_posts` ADD `expectedReach` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `instagram_posts` ADD `expectedLikes` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `instagram_posts` ADD `expectedComments` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `instagram_posts` ADD `budget` decimal(10,2);--> statement-breakpoint
ALTER TABLE `instagram_posts` ADD `notes` text;