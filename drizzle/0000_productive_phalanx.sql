CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`coins` integer DEFAULT 0 NOT NULL,
	`speed` integer DEFAULT 0 NOT NULL,
	`health` integer DEFAULT 0 NOT NULL,
	`damage` integer DEFAULT 0 NOT NULL,
	`pickup` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `runs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`gold` integer DEFAULT 0 NOT NULL,
	`elapsed` integer DEFAULT 0 NOT NULL,
	`kills` integer DEFAULT 0 NOT NULL,
	`closed` integer DEFAULT 0 NOT NULL,
	`victory` integer DEFAULT 0 NOT NULL,
	`bonuses` text NOT NULL,
	`started_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `runs_user_id_idx` ON `runs` (`user_id`);