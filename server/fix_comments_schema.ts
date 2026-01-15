
import 'dotenv/config';
import { getDb } from "./db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Adding heartVoiceId column to comments table...");
  
  const db = await getDb();
  if (!db) {
    console.error("Database connection failed");
    process.exit(1);
  }

  try {
    await db.execute(sql`
      ALTER TABLE comments 
      ADD COLUMN heartVoiceId int;
    `);
    
    await db.execute(sql`
      CREATE INDEX comments_heart_voice_idx ON comments(heartVoiceId);
    `);
    
    console.log("Successfully added heartVoiceId column to comments table");
  } catch (error) {
    console.error("Error updating schema:", error);
  }
  
  process.exit(0);
}

main();
