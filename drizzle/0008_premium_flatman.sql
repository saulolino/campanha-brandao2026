CREATE TABLE `campaign_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`instagramAccessToken` text,
	`instagramBusinessAccountId` varchar(255),
	`instagramUsername` varchar(255),
	`syncSchedule` varchar(255) NOT NULL DEFAULT '08:00,14:00,20:00',
	`reportFormat` enum('pdf','csv','both') NOT NULL DEFAULT 'pdf',
	`reportFrequency` enum('daily','weekly','monthly') NOT NULL DEFAULT 'weekly',
	`reportRecipients` text,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`lastUpdatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaign_settings_id` PRIMARY KEY(`id`)
);
