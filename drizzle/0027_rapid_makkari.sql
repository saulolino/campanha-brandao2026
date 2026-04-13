ALTER TABLE `campaign_settings` ADD `facebookPageUrl` text;--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `facebookPageName` varchar(255);--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `facebookFollowers` int;--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `facebookLikes` int;--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `facebookBio` text;--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `facebookProfilePic` text;--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `facebookLastSync` timestamp;