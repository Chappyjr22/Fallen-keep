CREATE TABLE `coop_rooms` (
	`code` text PRIMARY KEY NOT NULL,
	`host_token` text NOT NULL,
	`guest_token` text,
	`map_id` text NOT NULL,
	`host_config` text NOT NULL,
	`guest_config` text,
	`state` text,
	`input` text,
	`host_signal` text,
	`guest_signal` text,
	`host_seq` integer DEFAULT 0 NOT NULL,
	`guest_seq` integer DEFAULT 0 NOT NULL,
	`host_seen` integer NOT NULL,
	`guest_seen` integer DEFAULT 0 NOT NULL,
	`expires_at` integer NOT NULL,
	`closed` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `coop_rooms_expiry_idx` ON `coop_rooms` (`expires_at`);