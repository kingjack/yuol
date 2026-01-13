CREATE TABLE `carousels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`imageUrl` text NOT NULL,
	`link` varchar(500),
	`order` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `carousels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `heart_voices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`authorId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`content` text NOT NULL,
	`age` int,
	`gender` enum('male','female','other'),
	`location` varchar(100),
	`images` text,
	`likesCount` int NOT NULL DEFAULT 0,
	`commentsCount` int NOT NULL DEFAULT 0,
	`status` enum('active','hidden','matched') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `heart_voices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `carousels_order_idx` ON `carousels` (`order`);--> statement-breakpoint
CREATE INDEX `heart_voices_author_idx` ON `heart_voices` (`authorId`);--> statement-breakpoint
CREATE INDEX `heart_voices_created_at_idx` ON `heart_voices` (`createdAt`);