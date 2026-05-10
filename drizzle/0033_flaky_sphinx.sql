CREATE TABLE `saved_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`periodFrom` timestamp NOT NULL,
	`periodTo` timestamp NOT NULL,
	`periodLabel` varchar(128) NOT NULL,
	`currentMetrics` json NOT NULL,
	`previousMetrics` json NOT NULL,
	`variations` json NOT NULL,
	`followersData` json,
	`topPosts` json,
	`byType` json,
	`aiAnalysis` text,
	`dataSource` varchar(32) NOT NULL DEFAULT 'mysql',
	`createdBy` varchar(256),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `saved_reports_id` PRIMARY KEY(`id`)
);
