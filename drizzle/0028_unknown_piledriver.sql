ALTER TABLE `campaign_settings` ADD `candidateName` varchar(255);--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `candidateNickname` varchar(100);--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `candidateParty` varchar(100);--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `candidateNumber` varchar(20);--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `candidateRole` varchar(255);--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `candidateBio` text;--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `candidateEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `candidatePhone` varchar(30);--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `candidateProfilePic` text;--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `candidateInstagram` varchar(255);--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `candidateFacebook` varchar(255);--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `candidateYoutube` varchar(255);--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `candidateTiktok` varchar(255);--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `candidateWebsite` varchar(500);--> statement-breakpoint
ALTER TABLE `campaign_settings` ADD `candidateElectionDate` varchar(10);