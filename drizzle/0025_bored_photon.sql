ALTER TABLE `campaign_settings` ADD `whapiToken` text;--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `whapiChannelName` varchar(255);--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `whapiChannelPhone` varchar(30);--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `whapiChannelStatus` varchar(64);--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `whapiDefaultGroups` text;