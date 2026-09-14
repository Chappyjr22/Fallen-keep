ALTER TABLE `profiles` ADD `keep_key` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `runs` ADD `map_id` text DEFAULT 'courtyard' NOT NULL;