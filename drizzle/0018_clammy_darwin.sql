CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('novo_cadastro','novo_post','evento_criado','evento_confirmado','evento_realizado','instagram_sync','token_expirando','sistema','outro') NOT NULL DEFAULT 'outro',
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`metadata` text,
	`isRead` tinyint NOT NULL DEFAULT 0,
	`targetUserId` int,
	`triggeredByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
