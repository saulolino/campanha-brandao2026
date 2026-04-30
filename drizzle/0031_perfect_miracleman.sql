CREATE TABLE `electoral_alert_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`electoralDateId` varchar(64) NOT NULL,
	`electoralTitle` varchar(512) NOT NULL,
	`electoralDate` varchar(10) NOT NULL,
	`category` varchar(64) NOT NULL,
	`daysBeforeEvent` int NOT NULL,
	`notificationSent` tinyint NOT NULL DEFAULT 0,
	`notificationError` text,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `electoral_alert_log_id` PRIMARY KEY(`id`)
);
