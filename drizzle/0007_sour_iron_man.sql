CREATE TABLE `layout_drafts` (
	`map_id` text PRIMARY KEY NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`patches` text DEFAULT '[]' NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `layout_versions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bundle` text NOT NULL,
	`created_at` integer NOT NULL
);
