CREATE TABLE `map_discoveries` (
	`user_id` text NOT NULL,
	`event_id` text NOT NULL,
	`discovered_at` integer NOT NULL,
	PRIMARY KEY(`user_id`,`event_id`),
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `map_discoveries_user_id_idx` ON `map_discoveries` (`user_id`);
