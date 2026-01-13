import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index } from "drizzle-orm/mysql-core";

/**
 * 核心用户表,支持员工信息管理
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // 员工信息字段
  avatar: text("avatar"), // 头像URL
  department: varchar("department", { length: 100 }), // 部门
  position: varchar("position", { length: 100 }), // 职位
  joinedAt: timestamp("joinedAt"), // 入职日期
  bio: text("bio"), // 个人简介
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * 分类表
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  description: text("description"),
  color: varchar("color", { length: 20 }), // 分类颜色标识
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * 标签表
 */
export const tags = mysqlTable("tags", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * 帖子表
 */
export const posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  authorId: int("authorId").notNull(),
  categoryId: int("categoryId"),
  title: varchar("title", { length: 200 }),
  content: text("content").notNull(),
  images: text("images"), // JSON数组存储图片URLs
  likesCount: int("likesCount").default(0).notNull(),
  commentsCount: int("commentsCount").default(0).notNull(),
  bookmarksCount: int("bookmarksCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  authorIdx: index("posts_author_idx").on(table.authorId),
  categoryIdx: index("posts_category_idx").on(table.categoryId),
  createdAtIdx: index("posts_created_at_idx").on(table.createdAt),
}));

/**
 * 帖子标签关联表
 */
export const postTags = mysqlTable("post_tags", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  tagId: int("tagId").notNull(),
}, (table) => ({
  postIdx: index("post_tags_post_idx").on(table.postId),
  tagIdx: index("post_tags_tag_idx").on(table.tagId),
}));

/**
 * 文章表
 */
export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  authorId: int("authorId").notNull(),
  categoryId: int("categoryId"),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(), // 富文本内容
  coverImage: text("coverImage"), // 封面图
  summary: text("summary"), // 文章摘要
  likesCount: int("likesCount").default(0).notNull(),
  commentsCount: int("commentsCount").default(0).notNull(),
  bookmarksCount: int("bookmarksCount").default(0).notNull(),
  viewsCount: int("viewsCount").default(0).notNull(),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  publishedAt: timestamp("publishedAt"),
}, (table) => ({
  authorIdx: index("articles_author_idx").on(table.authorId),
  categoryIdx: index("articles_category_idx").on(table.categoryId),
  publishedIdx: index("articles_published_idx").on(table.published),
  createdAtIdx: index("articles_created_at_idx").on(table.createdAt),
}));

/**
 * 文章标签关联表
 */
export const articleTags = mysqlTable("article_tags", {
  id: int("id").autoincrement().primaryKey(),
  articleId: int("articleId").notNull(),
  tagId: int("tagId").notNull(),
}, (table) => ({
  articleIdx: index("article_tags_article_idx").on(table.articleId),
  tagIdx: index("article_tags_tag_idx").on(table.tagId),
}));

/**
 * 评论表
 */
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  authorId: int("authorId").notNull(),
  contentType: mysqlEnum("contentType", ["post", "article"]).notNull(),
  contentId: int("contentId").notNull(), // 帖子或文章ID
  parentId: int("parentId"), // 父评论ID,支持嵌套评论
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  authorIdx: index("comments_author_idx").on(table.authorId),
  contentIdx: index("comments_content_idx").on(table.contentType, table.contentId),
  parentIdx: index("comments_parent_idx").on(table.parentId),
}));

/**
 * 点赞表
 */
export const likes = mysqlTable("likes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contentType: mysqlEnum("contentType", ["post", "article"]).notNull(),
  contentId: int("contentId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userContentIdx: index("likes_user_content_idx").on(table.userId, table.contentType, table.contentId),
  contentIdx: index("likes_content_idx").on(table.contentType, table.contentId),
}));

/**
 * 收藏表
 */
export const bookmarks = mysqlTable("bookmarks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contentType: mysqlEnum("contentType", ["post", "article"]).notNull(),
  contentId: int("contentId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userContentIdx: index("bookmarks_user_content_idx").on(table.userId, table.contentType, table.contentId),
  userIdx: index("bookmarks_user_idx").on(table.userId),
}));

/**
 * 通知表
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // 接收通知的用户
  actorId: int("actorId").notNull(), // 触发通知的用户
  type: mysqlEnum("type", ["comment", "like", "bookmark", "mention"]).notNull(),
  contentType: mysqlEnum("contentType", ["post", "article", "comment"]).notNull(),
  contentId: int("contentId").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("notifications_user_idx").on(table.userId),
  readIdx: index("notifications_read_idx").on(table.read),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;
export type Like = typeof likes.$inferSelect;
export type InsertLike = typeof likes.$inferInsert;
export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = typeof bookmarks.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
