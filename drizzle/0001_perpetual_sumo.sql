CREATE TABLE `article_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` int NOT NULL,
	`tagId` int NOT NULL,
	CONSTRAINT `article_tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`authorId` int NOT NULL,
	`categoryId` int,
	`title` varchar(200) NOT NULL,
	`content` text NOT NULL,
	`coverImage` text,
	`summary` text,
	`likesCount` int NOT NULL DEFAULT 0,
	`commentsCount` int NOT NULL DEFAULT 0,
	`bookmarksCount` int NOT NULL DEFAULT 0,
	`viewsCount` int NOT NULL DEFAULT 0,
	`published` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`publishedAt` timestamp,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentType` enum('post','article') NOT NULL,
	`contentId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`slug` varchar(50) NOT NULL,
	`description` text,
	`color` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`authorId` int NOT NULL,
	`contentType` enum('post','article') NOT NULL,
	`contentId` int NOT NULL,
	`parentId` int,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentType` enum('post','article') NOT NULL,
	`contentId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`actorId` int NOT NULL,
	`type` enum('comment','like','bookmark','mention') NOT NULL,
	`contentType` enum('post','article','comment') NOT NULL,
	`contentId` int NOT NULL,
	`read` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`tagId` int NOT NULL,
	CONSTRAINT `post_tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`authorId` int NOT NULL,
	`categoryId` int,
	`title` varchar(200),
	`content` text NOT NULL,
	`images` text,
	`likesCount` int NOT NULL DEFAULT 0,
	`commentsCount` int NOT NULL DEFAULT 0,
	`bookmarksCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `tags_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `users` ADD `department` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `position` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `joinedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
CREATE INDEX `article_tags_article_idx` ON `article_tags` (`articleId`);--> statement-breakpoint
CREATE INDEX `article_tags_tag_idx` ON `article_tags` (`tagId`);--> statement-breakpoint
CREATE INDEX `articles_author_idx` ON `articles` (`authorId`);--> statement-breakpoint
CREATE INDEX `articles_category_idx` ON `articles` (`categoryId`);--> statement-breakpoint
CREATE INDEX `articles_published_idx` ON `articles` (`published`);--> statement-breakpoint
CREATE INDEX `articles_created_at_idx` ON `articles` (`createdAt`);--> statement-breakpoint
CREATE INDEX `bookmarks_user_content_idx` ON `bookmarks` (`userId`,`contentType`,`contentId`);--> statement-breakpoint
CREATE INDEX `bookmarks_user_idx` ON `bookmarks` (`userId`);--> statement-breakpoint
CREATE INDEX `comments_author_idx` ON `comments` (`authorId`);--> statement-breakpoint
CREATE INDEX `comments_content_idx` ON `comments` (`contentType`,`contentId`);--> statement-breakpoint
CREATE INDEX `comments_parent_idx` ON `comments` (`parentId`);--> statement-breakpoint
CREATE INDEX `likes_user_content_idx` ON `likes` (`userId`,`contentType`,`contentId`);--> statement-breakpoint
CREATE INDEX `likes_content_idx` ON `likes` (`contentType`,`contentId`);--> statement-breakpoint
CREATE INDEX `notifications_user_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `notifications_read_idx` ON `notifications` (`read`);--> statement-breakpoint
CREATE INDEX `post_tags_post_idx` ON `post_tags` (`postId`);--> statement-breakpoint
CREATE INDEX `post_tags_tag_idx` ON `post_tags` (`tagId`);--> statement-breakpoint
CREATE INDEX `posts_author_idx` ON `posts` (`authorId`);--> statement-breakpoint
CREATE INDEX `posts_category_idx` ON `posts` (`categoryId`);--> statement-breakpoint
CREATE INDEX `posts_created_at_idx` ON `posts` (`createdAt`);