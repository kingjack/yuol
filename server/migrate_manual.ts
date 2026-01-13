import "dotenv/config";
import { getDb } from "./db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Starting manual migration...");
  const db = await getDb();
  if (!db) {
    console.error("Failed to connect to database");
    process.exit(1);
  }

  try {
    console.log("Creating user_tags table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_tags (
        id int AUTO_INCREMENT PRIMARY KEY,
        userId int NOT NULL,
        label varchar(50) NOT NULL,
        voteCount int NOT NULL DEFAULT 0,
        createdAt timestamp NOT NULL DEFAULT (now()),
        KEY user_tags_user_idx (userId)
      );
    `);

    console.log("Creating user_tag_votes table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_tag_votes (
        id int AUTO_INCREMENT PRIMARY KEY,
        userTagId int NOT NULL,
        voterId int NOT NULL,
        createdAt timestamp NOT NULL DEFAULT (now()),
        KEY user_tag_votes_tag_idx (userTagId),
        KEY user_tag_votes_voter_idx (voterId),
        KEY unique_user_tag_vote_idx (userTagId, voterId)
      );
    `);

    console.log("Creating notifications table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id int AUTO_INCREMENT PRIMARY KEY,
        userId int NOT NULL,
        type enum('system', 'like', 'comment', 'reply') NOT NULL,
        title varchar(200) NOT NULL,
        content text,
        linkUrl varchar(500),
        isRead boolean NOT NULL DEFAULT false,
        createdAt timestamp NOT NULL DEFAULT (now()),
        KEY notifications_user_idx (userId),
        KEY notifications_read_idx (isRead)
      );
    `);

    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();
