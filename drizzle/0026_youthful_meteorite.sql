CREATE TABLE `competitor_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`competitorId` int NOT NULL,
	`platform` enum('instagram','facebook') NOT NULL,
	`followers` int,
	`following` int,
	`posts` int,
	`likes` int,
	`snapshotDate` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `competitor_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `competitors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`party` varchar(100),
	`role` varchar(255),
	`notes` text,
	`instagramUsername` varchar(100),
	`instagramId` varchar(64),
	`instagramFollowers` int,
	`instagramFollowing` int,
	`instagramPosts` int,
	`instagramBio` text,
	`instagramProfilePic` text,
	`instagramLastSync` timestamp,
	`facebookPageId` varchar(100),
	`facebookPageName` varchar(255),
	`facebookFollowers` int,
	`facebookLikes` int,
	`facebookBio` text,
	`facebookProfilePic` text,
	`facebookLastSync` timestamp,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `competitors_id` PRIMARY KEY(`id`)
);
