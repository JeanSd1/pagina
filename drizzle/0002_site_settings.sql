CREATE TABLE `siteSettings` (
	`key` varchar(80) NOT NULL,
	`value` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteSettings_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
ALTER TABLE `availabilitySlots` ADD CONSTRAINT `availability_date_time_unique` UNIQUE(`date`,`time`);