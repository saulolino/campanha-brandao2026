CREATE TABLE `whatsapp_dispatches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupId` varchar(255) NOT NULL,
	`groupName` varchar(255) NOT NULL,
	`dispatchType` enum('diario','semanal') NOT NULL,
	`message` text NOT NULL,
	`includedPostIds` text,
	`includedEventIds` text,
	`sentById` int NOT NULL,
	`sentByName` varchar(255),
	`status` enum('enviado','erro') NOT NULL DEFAULT 'enviado',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whatsapp_dispatches_id` PRIMARY KEY(`id`)
);
