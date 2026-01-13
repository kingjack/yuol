CREATE TABLE `user_tag_votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userTagId` int NOT NULL,
	`voterId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_tag_votes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`label` varchar(50) NOT NULL,
	`voteCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `carousels` RENAME COLUMN `active` TO `linkUrl`;--> statement-breakpoint
ALTER TABLE `carousels` RENAME COLUMN `link` TO `isActive`;--> statement-breakpoint
DROP INDEX `articles_published_idx` ON `articles`;--> statement-breakpoint
DROP INDEX `bookmarks_user_content_idx` ON `bookmarks`;--> statement-breakpoint
DROP INDEX `carousels_order_idx` ON `carousels`;--> statement-breakpoint
DROP INDEX `comments_content_idx` ON `comments`;--> statement-breakpoint
DROP INDEX `likes_user_content_idx` ON `likes`;--> statement-breakpoint
DROP INDEX `likes_content_idx` ON `likes`;--> statement-breakpoint
DROP INDEX `notifications_read_idx` ON `notifications`;--> statement-breakpoint
ALTER TABLE `carousels` MODIFY COLUMN `title` varchar(200);--> statement-breakpoint
ALTER TABLE `carousels` MODIFY COLUMN `imageUrl` varchar(500) NOT NULL;--> statement-breakpoint
ALTER TABLE `carousels` MODIFY COLUMN `isActive` boolean NOT NULL DEFAULT true;--> statement-breakpoint
ALTER TABLE `carousels` MODIFY COLUMN `linkUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `type` enum('system','like','comment','reply') NOT NULL;--> statement-breakpoint
ALTER TABLE `bookmarks` ADD `targetType` enum('post','article') NOT NULL;--> statement-breakpoint
ALTER TABLE `bookmarks` ADD `targetId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `comments` ADD `postId` int;--> statement-breakpoint
ALTER TABLE `comments` ADD `articleId` int;--> statement-breakpoint
ALTER TABLE `heart_voices` ADD `isAnonymous` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `likes` ADD `targetType` enum('post','article','comment') NOT NULL;--> statement-breakpoint
ALTER TABLE `likes` ADD `targetId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` ADD `title` varchar(200) NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` ADD `content` text;--> statement-breakpoint
ALTER TABLE `notifications` ADD `linkUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `notifications` ADD `isRead` boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `user_tag_votes_tag_idx` ON `user_tag_votes` (`userTagId`);--> statement-breakpoint
CREATE INDEX `user_tag_votes_voter_idx` ON `user_tag_votes` (`voterId`);--> statement-breakpoint
CREATE INDEX `unique_user_tag_vote_idx` ON `user_tag_votes` (`userTagId`,`voterId`);--> statement-breakpoint
CREATE INDEX `user_tags_user_idx` ON `user_tags` (`userId`);--> statement-breakpoint
CREATE INDEX `bookmarks_target_idx` ON `bookmarks` (`targetType`,`targetId`);--> statement-breakpoint
CREATE INDEX `unique_bookmark_idx` ON `bookmarks` (`userId`,`targetType`,`targetId`);--> statement-breakpoint
CREATE INDEX `comments_post_idx` ON `comments` (`postId`);--> statement-breakpoint
CREATE INDEX `comments_article_idx` ON `comments` (`articleId`);--> statement-breakpoint
CREATE INDEX `likes_user_idx` ON `likes` (`userId`);--> statement-breakpoint
CREATE INDEX `likes_target_idx` ON `likes` (`targetType`,`targetId`);--> statement-breakpoint
CREATE INDEX `unique_like_idx` ON `likes` (`userId`,`targetType`,`targetId`);--> statement-breakpoint
CREATE INDEX `notifications_read_idx` ON `notifications` (`isRead`);--> statement-breakpoint
ALTER TABLE `bookmarks` DROP COLUMN `contentType`;--> statement-breakpoint
ALTER TABLE `bookmarks` DROP COLUMN `contentId`;--> statement-breakpoint
ALTER TABLE `carousels` DROP COLUMN `description`;--> statement-breakpoint
ALTER TABLE `comments` DROP COLUMN `contentType`;--> statement-breakpoint
ALTER TABLE `comments` DROP COLUMN `contentId`;--> statement-breakpoint
ALTER TABLE `heart_voices` DROP COLUMN `location`;--> statement-breakpoint
ALTER TABLE `heart_voices` DROP COLUMN `images`;--> statement-breakpoint
ALTER TABLE `heart_voices` DROP COLUMN `status`;--> statement-breakpoint
ALTER TABLE `likes` DROP COLUMN `contentType`;--> statement-breakpoint
ALTER TABLE `likes` DROP COLUMN `contentId`;--> statement-breakpoint
ALTER TABLE `notifications` DROP COLUMN `actorId`;--> statement-breakpoint
ALTER TABLE `notifications` DROP COLUMN `contentType`;--> statement-breakpoint
ALTER TABLE `notifications` DROP COLUMN `contentId`;--> statement-breakpoint
ALTER TABLE `notifications` DROP COLUMN `read`;