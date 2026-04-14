ALTER TABLE `campaign_settings` ADD `narrativeCentralPhrase` varchar(120);--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `narrativePillars` text;--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `narrativeStrategicThemes` text;--> statement-breakpoint
ALTER TABLE `instagram_posts` ADD `contentCategory` enum('autoridade','bastidor','opiniao','vida_pessoal','proposta');--> statement-breakpoint
ALTER TABLE `instagram_posts` ADD `trafficType` enum('organico','teste_pago','escala') DEFAULT 'organico';--> statement-breakpoint
ALTER TABLE `instagram_posts` ADD `isABTest` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `instagram_posts` ADD `conversionGoal` enum('engajamento','crescimento','conversao');--> statement-breakpoint
ALTER TABLE `instagram_posts` ADD `ctaType` enum('grupo_whatsapp','whatsapp_direto','formulario','link_bio','nenhum') DEFAULT 'nenhum';--> statement-breakpoint
ALTER TABLE `instagram_posts` ADD `ctaLink` varchar(500);--> statement-breakpoint
ALTER TABLE `instagram_posts` ADD `realReach` int;--> statement-breakpoint
ALTER TABLE `instagram_posts` ADD `realLikes` int;--> statement-breakpoint
ALTER TABLE `instagram_posts` ADD `realComments` int;--> statement-breakpoint
ALTER TABLE `instagram_posts` ADD `realShares` int;--> statement-breakpoint
ALTER TABLE `instagram_posts` ADD `realSaves` int;--> statement-breakpoint
ALTER TABLE `instagram_posts` ADD `retentionRate` decimal(5,2);--> statement-breakpoint
ALTER TABLE `instagram_posts` ADD `aiAnalysis` enum('top','fraco','neutro');--> statement-breakpoint
ALTER TABLE `instagram_posts` ADD `aiSuggestion` enum('replicar','ajustar','descartar');--> statement-breakpoint
ALTER TABLE `instagram_posts` ADD `aiSuggestionNote` text;