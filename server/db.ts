import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  categories, InsertCategory,
  tags, InsertTag,
  posts, InsertPost,
  articles, InsertArticle,
  comments, InsertComment,
  likes, InsertLike,
  bookmarks, InsertBookmark,
  notifications, InsertNotification,
  postTags, articleTags
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

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(users).set(data).where(eq(users.id, userId));
  return getUserById(userId);
}

export async function searchUsers(query: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users)
    .where(or(
      like(users.name, `%${query}%`),
      like(users.email, `%${query}%`),
      like(users.department, `%${query}%`)
    ))
    .limit(20);
}

// ============ 分类相关 ============
export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.name);
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(categories).values(data);
  return { id: Number(result[0].insertId), ...data };
}

// ============ 标签相关 ============
export async function getTags() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tags).orderBy(tags.name);
}

export async function createTag(name: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(tags).values({ name });
  return { id: Number(result[0].insertId), name };
}

export async function getOrCreateTag(name: string) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(tags).where(eq(tags.name, name)).limit(1);
  if (existing.length > 0) return existing[0];
  return createTag(name);
}

// ============ 帖子相关 ============
export async function createPost(data: InsertPost) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(posts).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getPostById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getPosts(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(posts)
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getPostsByCategory(categoryId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(posts)
    .where(eq(posts.categoryId, categoryId))
    .orderBy(desc(posts.createdAt))
    .limit(limit);
}

export async function updatePost(id: number, data: Partial<InsertPost>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(posts).set(data).where(eq(posts.id, id));
  return getPostById(id);
}

export async function deletePost(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(posts).where(eq(posts.id, id));
}

export async function addPostTag(postId: number, tagId: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(postTags).values({ postId, tagId });
}

export async function getPostTags(postId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ tag: tags })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, postId));
}

// ============ 文章相关 ============
export async function createArticle(data: InsertArticle) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(articles).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getArticleById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getArticles(publishedOnly = true, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(articles);
  if (publishedOnly) {
    query.where(eq(articles.published, true));
  }
  return query.orderBy(desc(articles.createdAt)).limit(limit).offset(offset);
}

export async function updateArticle(id: number, data: Partial<InsertArticle>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(articles).set(data).where(eq(articles.id, id));
  return getArticleById(id);
}

export async function deleteArticle(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(articles).where(eq(articles.id, id));
}

export async function incrementArticleViews(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(articles)
    .set({ viewsCount: sql`${articles.viewsCount} + 1` })
    .where(eq(articles.id, id));
}

export async function addArticleTag(articleId: number, tagId: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(articleTags).values({ articleId, tagId });
}

export async function getArticleTags(articleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ tag: tags })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(eq(articleTags.articleId, articleId));
}

// ============ 评论相关 ============
export async function createComment(data: InsertComment) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(comments).values(data);
  const commentId = Number(result[0].insertId);
  
  // 更新内容的评论计数
  if (data.contentType === 'post') {
    await db.update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} + 1` })
      .where(eq(posts.id, data.contentId));
  } else {
    await db.update(articles)
      .set({ commentsCount: sql`${articles.commentsCount} + 1` })
      .where(eq(articles.id, data.contentId));
  }
  
  return { id: commentId, ...data };
}

export async function getComments(contentType: 'post' | 'article', contentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(comments)
    .where(and(
      eq(comments.contentType, contentType),
      eq(comments.contentId, contentId)
    ))
    .orderBy(comments.createdAt);
}

export async function deleteComment(id: number) {
  const db = await getDb();
  if (!db) return;
  const comment = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
  if (comment.length === 0) return;
  
  const { contentType, contentId } = comment[0];
  await db.delete(comments).where(eq(comments.id, id));
  
  // 更新评论计数
  if (contentType === 'post') {
    await db.update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} - 1` })
      .where(eq(posts.id, contentId));
  } else {
    await db.update(articles)
      .set({ commentsCount: sql`${articles.commentsCount} - 1` })
      .where(eq(articles.id, contentId));
  }
}

// ============ 点赞相关 ============
export async function toggleLike(userId: number, contentType: 'post' | 'article', contentId: number) {
  const db = await getDb();
  if (!db) return { liked: false };
  
  const existing = await db.select().from(likes)
    .where(and(
      eq(likes.userId, userId),
      eq(likes.contentType, contentType),
      eq(likes.contentId, contentId)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    // 取消点赞
    await db.delete(likes).where(eq(likes.id, existing[0].id));
    if (contentType === 'post') {
      await db.update(posts)
        .set({ likesCount: sql`${posts.likesCount} - 1` })
        .where(eq(posts.id, contentId));
    } else {
      await db.update(articles)
        .set({ likesCount: sql`${articles.likesCount} - 1` })
        .where(eq(articles.id, contentId));
    }
    return { liked: false };
  } else {
    // 添加点赞
    await db.insert(likes).values({ userId, contentType, contentId });
    if (contentType === 'post') {
      await db.update(posts)
        .set({ likesCount: sql`${posts.likesCount} + 1` })
        .where(eq(posts.id, contentId));
    } else {
      await db.update(articles)
        .set({ likesCount: sql`${articles.likesCount} + 1` })
        .where(eq(articles.id, contentId));
    }
    return { liked: true };
  }
}

export async function checkUserLiked(userId: number, contentType: 'post' | 'article', contentId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(likes)
    .where(and(
      eq(likes.userId, userId),
      eq(likes.contentType, contentType),
      eq(likes.contentId, contentId)
    ))
    .limit(1);
  return result.length > 0;
}

// ============ 收藏相关 ============
export async function toggleBookmark(userId: number, contentType: 'post' | 'article', contentId: number) {
  const db = await getDb();
  if (!db) return { bookmarked: false };
  
  const existing = await db.select().from(bookmarks)
    .where(and(
      eq(bookmarks.userId, userId),
      eq(bookmarks.contentType, contentType),
      eq(bookmarks.contentId, contentId)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    await db.delete(bookmarks).where(eq(bookmarks.id, existing[0].id));
    if (contentType === 'post') {
      await db.update(posts)
        .set({ bookmarksCount: sql`${posts.bookmarksCount} - 1` })
        .where(eq(posts.id, contentId));
    } else {
      await db.update(articles)
        .set({ bookmarksCount: sql`${articles.bookmarksCount} - 1` })
        .where(eq(articles.id, contentId));
    }
    return { bookmarked: false };
  } else {
    await db.insert(bookmarks).values({ userId, contentType, contentId });
    if (contentType === 'post') {
      await db.update(posts)
        .set({ bookmarksCount: sql`${posts.bookmarksCount} + 1` })
        .where(eq(posts.id, contentId));
    } else {
      await db.update(articles)
        .set({ bookmarksCount: sql`${articles.bookmarksCount} + 1` })
        .where(eq(articles.id, contentId));
    }
    return { bookmarked: true };
  }
}

export async function getUserBookmarks(userId: number, contentType?: 'post' | 'article') {
  const db = await getDb();
  if (!db) return [];
  if (contentType) {
    return db.select().from(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.contentType, contentType)))
      .orderBy(desc(bookmarks.createdAt));
  }
  return db.select().from(bookmarks)
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt));
}

// ============ 通知相关 ============
export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(notifications).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getUserNotifications(userId: number, unreadOnly = false) {
  const db = await getDb();
  if (!db) return [];
  if (unreadOnly) {
    return db.select().from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
}

// ============ 搜索相关 ============
export async function searchPosts(query: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(posts)
    .where(or(
      like(posts.title, `%${query}%`),
      like(posts.content, `%${query}%`)
    ))
    .orderBy(desc(posts.createdAt))
    .limit(20);
}

export async function searchArticles(query: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(articles)
    .where(and(
      eq(articles.published, true),
      or(
        like(articles.title, `%${query}%`),
        like(articles.content, `%${query}%`),
        like(articles.summary, `%${query}%`)
      )
    ))
    .orderBy(desc(articles.createdAt))
    .limit(20);
}
