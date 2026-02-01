import { eq, desc, and, or, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  categories, InsertCategory,
  posts, InsertPost,
  articles, InsertArticle,
  heartVoices, InsertHeartVoice,
  carousels, InsertCarousel,
  userTags, userTagVotes,
  notifications, InsertNotification,
  comments, InsertComment,
  likes, bookmarks
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(user: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(users).values(user);
  return getUserByOpenId(user.openId);
}

// ============ 用户相关 ============
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "avatar", "department", "position", "bio"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.joinedAt !== undefined) {
      values.joinedAt = user.joinedAt;
      updateSet.joinedAt = user.joinedAt;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function updateUserAvatar(userId: number, avatarUrl: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users)
    .set({ avatar: avatarUrl })
    .where(eq(users.id, userId));
}

export async function getUser(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users);
}

export async function searchUsers(query: string) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(users).where(
    or(
      like(users.name, `%${query}%`),
      like(users.department, `%${query}%`),
      like(users.position, `%${query}%`)
    )
  );
  
  return results.map(user => {
    const { password, ...safeUser } = user;
    return safeUser;
  });
}

// ============ 分类相关 ============
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories);
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(category: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(categories).values(category);
  return { ...category, id: result[0].insertId };
}

// ============ 帖子相关 ============
export async function createPost(post: InsertPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(posts).values(post);
  return { ...post, id: result[0].insertId };
}

export async function getPost(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.id, id))
    .limit(1);
    
  if (result.length === 0) return undefined;
  
  const { posts: post, users: author } = result[0];
  if (author) {
    const { password, ...safeAuthor } = author;
    return { ...post, author: safeAuthor };
  }
  return { ...post, author: null };
}

export async function getPosts(limit = 10, offset = 0, categoryId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select()
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(posts.createdAt));
  
  if (categoryId) {
    // @ts-ignore
    query = query.where(eq(posts.categoryId, categoryId));
  }
  
  const results = await query;
  return results.map(({ posts, users }) => {
    if (users) {
      const { password, ...safeAuthor } = users;
      return { ...posts, author: safeAuthor };
    }
    return { ...posts, author: null };
  });
}

// ============ 文章相关 ============
export async function createArticle(article: InsertArticle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(articles).values(article);
  return { ...article, id: result[0].insertId };
}

export async function getArticle(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(eq(articles.id, id))
    .limit(1);
    
  if (result.length === 0) return undefined;
  
  const { articles: article, users: author } = result[0];
  if (author) {
    const { password, ...safeAuthor } = author;
    return { ...article, author: safeAuthor };
  }
  return { ...article, author: null };
}

export async function getArticles(limit = 10, offset = 0, categoryId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select()
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(articles.createdAt));
  
  if (categoryId) {
    // @ts-ignore
    query = query.where(eq(articles.categoryId, categoryId));
  }
  
  const results = await query;
  return results.map(({ articles, users }) => {
    if (users) {
      const { password, ...safeAuthor } = users;
      return { ...articles, author: safeAuthor };
    }
    return { ...articles, author: null };
  });
}

// ============ 树洞相关 ============
export async function createHeartVoice(voice: InsertHeartVoice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(heartVoices).values(voice);
  return { ...voice, id: result[0].insertId };
}

export async function getHeartVoices(limit = 10, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db.select()
    .from(heartVoices)
    .leftJoin(users, eq(heartVoices.authorId, users.id))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(heartVoices.createdAt));
    
  return results.map(({ heart_voices, users }) => {
    let safeAuthor = null;
    if (users) {
      const { password, ...rest } = users;
      safeAuthor = rest;
    }
    return {
      ...heart_voices,
      author: safeAuthor
    };
  });
}

export async function getHeartVoice(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select()
    .from(heartVoices)
    .leftJoin(users, eq(heartVoices.authorId, users.id))
    .where(eq(heartVoices.id, id))
    .limit(1);
    
  if (results.length === 0) return null;
  
  const row = results[0];
  let safeAuthor = null;
  if (row.users) {
    const { password, ...rest } = row.users;
    safeAuthor = rest;
  }
  
  return {
    ...row.heart_voices,
    author: safeAuthor
  };
}

export async function deleteHeartVoice(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(heartVoices)
    .where(and(eq(heartVoices.id, id), eq(heartVoices.authorId, userId)));
}

// ============ 轮播图相关 ============
export async function createCarousel(carousel: InsertCarousel) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(carousels).values(carousel);
  return { ...carousel, id: result[0].insertId };
}

export async function getActiveCarousels() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(carousels)
    .where(eq(carousels.isActive, true))
    .orderBy(desc(carousels.order));
}

export async function clearAllCarousels() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(carousels);
}

// ============ 用户标签相关 ============
export async function addUserTag(userId: number, label: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 检查是否已存在该标签
  const existing = await db.select().from(userTags)
    .where(and(eq(userTags.userId, userId), eq(userTags.label, label)))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // 插入新标签
  const result = await db.insert(userTags).values({
    userId,
    label,
    voteCount: 0
  });
  
  return { id: result[0].insertId, userId, label, voteCount: 0 };
}

export async function getUserTags(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(userTags)
    .where(eq(userTags.userId, userId))
    .orderBy(desc(userTags.voteCount));
}

export async function voteUserTag(tagId: number, voterId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // 检查是否已经投过票
  const existingVote = await db.select().from(userTagVotes)
    .where(and(eq(userTagVotes.userTagId, tagId), eq(userTagVotes.voterId, voterId)))
    .limit(1);

  if (existingVote.length > 0) {
    throw new Error("ALREADY_VOTED");
  }

  // 开启事务
  await db.transaction(async (tx) => {
    // 记录投票
    await tx.insert(userTagVotes).values({
      userTagId: tagId,
      voterId: voterId
    });

    // 更新票数
    await tx.update(userTags)
      .set({ voteCount: sql`${userTags.voteCount} + 1` })
      .where(eq(userTags.id, tagId));
  });

  return { success: true };
}

// ============ 通知相关 ============
export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notifications).values(notification);
  return { ...notification, id: result[0].insertId };
}

export async function getNotifications(userId: number, unreadOnly = false, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(notifications.userId, userId)];
  if (unreadOnly) {
    conditions.push(eq(notifications.isRead, false));
  }
  
  return db.select().from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, id));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));
}

// ============ 搜索相关 ============
export async function searchAll(query: string, limit = 30) {
  const db = await getDb();
  if (!db) return { posts: [], articles: [], users: [] };

  const postsResults = await db.select()
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(like(posts.content, `%${query}%`))
    .orderBy(desc(posts.createdAt))
    .limit(limit);

  const articlesResults = await db.select()
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(
      or(
        like(articles.title, `%${query}%`),
        like(articles.summary, `%${query}%`),
        like(articles.content, `%${query}%`)
      )
    )
    .orderBy(desc(articles.createdAt))
    .limit(limit);

  const usersResults = await db.select()
    .from(users)
    .where(
      or(
        like(users.name, `%${query}%`),
        like(users.department, `%${query}%`),
        like(users.position, `%${query}%`)
      )
    )
    .limit(limit);

  return {
    posts: postsResults.map(({ posts, users }) => {
      if (users) {
        const { password, ...safeAuthor } = users;
        return { ...posts, author: safeAuthor };
      }
      return { ...posts, author: null };
    }),
    articles: articlesResults.map(({ articles, users }) => {
      if (users) {
        const { password, ...safeAuthor } = users;
        return { ...articles, author: safeAuthor };
      }
      return { ...articles, author: null };
    }),
    users: usersResults.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    })
  };
}

// ============ 评论相关 ============
export async function createComment(comment: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(comments).values(comment);
  
  // 更新评论计数
  if (comment.postId) {
    await db.update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} + 1` })
      .where(eq(posts.id, comment.postId));
  } else if (comment.articleId) {
    await db.update(articles)
      .set({ commentsCount: sql`${articles.commentsCount} + 1` })
      .where(eq(articles.id, comment.articleId));
  } else if (comment.heartVoiceId) {
    await db.update(heartVoices)
      .set({ commentsCount: sql`${heartVoices.commentsCount} + 1` })
      .where(eq(heartVoices.id, comment.heartVoiceId));
  }

  return { ...comment, id: result[0].insertId };
}

export async function getComments(targetType: "post" | "article" | "heartVoice", targetId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (targetType === "post") {
    conditions.push(eq(comments.postId, targetId));
  } else if (targetType === "article") {
    conditions.push(eq(comments.articleId, targetId));
  } else {
    conditions.push(eq(comments.heartVoiceId, targetId));
  }

  const results = await db.select()
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(and(...conditions))
    .orderBy(desc(comments.createdAt));

  return results.map(({ comments, users }) => {
    if (users) {
      const { password, ...safeAuthor } = users;
      return { ...comments, author: safeAuthor };
    }
    return { ...comments, author: null };
  });
}

export async function deleteComment(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 先查询评论以获取关联信息
  const comment = await db.select().from(comments)
    .where(and(eq(comments.id, id), eq(comments.authorId, userId)))
    .limit(1);

  if (comment.length === 0) return;

  const target = comment[0];

  // 删除评论
  await db.delete(comments)
    .where(eq(comments.id, id));

  // 更新计数
  if (target.postId) {
    await db.update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} - 1` })
      .where(eq(posts.id, target.postId));
  } else if (target.articleId) {
    await db.update(articles)
      .set({ commentsCount: sql`${articles.commentsCount} - 1` })
      .where(eq(articles.id, target.articleId));
  } else if (target.heartVoiceId) {
    await db.update(heartVoices)
      .set({ commentsCount: sql`${heartVoices.commentsCount} - 1` })
      .where(eq(heartVoices.id, target.heartVoiceId));
  }
}

// ============ 点赞相关 ============
export async function toggleLike(userId: number, targetType: "post" | "article" | "comment", targetId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(likes)
    .where(and(
      eq(likes.userId, userId),
      eq(likes.targetType, targetType),
      eq(likes.targetId, targetId)
    ))
    .limit(1);

  if (existing.length > 0) {
    // 取消点赞
    await db.delete(likes)
      .where(eq(likes.id, existing[0].id));
      
    // 更新计数
    if (targetType === "post") {
      await db.update(posts)
        .set({ likesCount: sql`${posts.likesCount} - 1` })
        .where(eq(posts.id, targetId));
    } else if (targetType === "article") {
      await db.update(articles)
        .set({ likesCount: sql`${articles.likesCount} - 1` })
        .where(eq(articles.id, targetId));
    } else if (targetType === "comment") {
       // comments table doesn't have likesCount in schema provided earlier?
       // Let's check schema again. Schema says comments has no likesCount. 
       // Only posts, articles, heartVoices have likesCount.
       // But wait, schema might have been updated? 
       // In `drizzle/schema.ts`: `comments` table definition:
       // content, authorId, postId, articleId, parentId, createdAt, updatedAt.
       // NO likesCount.
       // So we can't update likesCount for comments unless we add it.
       // For now, ignore comment likes count update or add column.
       // I'll skip comment likesCount update for now.
    }
    
    return { liked: false };
  } else {
    // 点赞
    await db.insert(likes).values({
      userId,
      targetType,
      targetId
    });

    // 更新计数
    if (targetType === "post") {
      await db.update(posts)
        .set({ likesCount: sql`${posts.likesCount} + 1` })
        .where(eq(posts.id, targetId));
    } else if (targetType === "article") {
      await db.update(articles)
        .set({ likesCount: sql`${articles.likesCount} + 1` })
        .where(eq(articles.id, targetId));
    }
    
    return { liked: true };
  }
}

// ============ 收藏相关 ============
export async function toggleBookmark(userId: number, targetType: "post" | "article", targetId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(bookmarks)
    .where(and(
      eq(bookmarks.userId, userId),
      eq(bookmarks.targetType, targetType),
      eq(bookmarks.targetId, targetId)
    ))
    .limit(1);

  if (existing.length > 0) {
    // 取消收藏
    await db.delete(bookmarks)
      .where(eq(bookmarks.id, existing[0].id));
      
    // 更新计数
    if (targetType === "post") {
      await db.update(posts)
        .set({ bookmarksCount: sql`${posts.bookmarksCount} - 1` })
        .where(eq(posts.id, targetId));
    } else if (targetType === "article") {
      await db.update(articles)
        .set({ bookmarksCount: sql`${articles.bookmarksCount} - 1` })
        .where(eq(articles.id, targetId));
    }
    
    return { bookmarked: false };
  } else {
    // 收藏
    await db.insert(bookmarks).values({
      userId,
      targetType,
      targetId
    });

    // 更新计数
    if (targetType === "post") {
      await db.update(posts)
        .set({ bookmarksCount: sql`${posts.bookmarksCount} + 1` })
        .where(eq(posts.id, targetId));
    } else if (targetType === "article") {
      await db.update(articles)
        .set({ bookmarksCount: sql`${articles.bookmarksCount} + 1` })
        .where(eq(articles.id, targetId));
    }
    
    return { bookmarked: true };
  }
}
