CREATE TABLE `planning_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`messageType` enum('pergunta','resposta','resumo','confirmacao','erro','info') NOT NULL DEFAULT 'info',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `planning_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weekly_planning_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weekStart` timestamp NOT NULL,
	`weekEnd` timestamp NOT NULL,
	`status` enum('em_andamento','concluida','cancelada') NOT NULL DEFAULT 'em_andamento',
	`answers` text,
	`researchedFacts` text,
	`generatedPosts` text,
	`generatedEvents` text,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `weekly_planning_sessions_id` PRIMARY KEY(`id`)
);
