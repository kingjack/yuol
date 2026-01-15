import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index, primaryKey } from "drizzle-orm/mysql-core";
import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";

/**
 * 核心用户表,支持员工信息管理
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  username: varchar("username", { length: 50 }).unique(),
  password: varchar("password", { length: 255 }),
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
  content: text("content").notNull(),
  authorId: int("authorId").notNull(),
  postId: int("postId"), // 可关联帖子
  articleId: int("articleId"), // 可关联文章
  heartVoiceId: int("heartVoiceId"), // 可关联心声
  parentId: int("parentId"), // 父评论ID（回复）
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  authorIdx: index("comments_author_idx").on(table.authorId),
  postIdx: index("comments_post_idx").on(table.postId),
  articleIdx: index("comments_article_idx").on(table.articleId),
  heartVoiceIdx: index("comments_heart_voice_idx").on(table.heartVoiceId),
  parentIdx: index("comments_parent_idx").on(table.parentId),
}));

/**
 * 点赞表 (用于帖子、文章、评论等)
 */
export const likes = mysqlTable("likes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  targetType: mysqlEnum("targetType", ["post", "article", "comment"]).notNull(),
  targetId: int("targetId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("likes_user_idx").on(table.userId),
  targetIdx: index("likes_target_idx").on(table.targetType, table.targetId),
  // 联合唯一约束，防止重复点赞
  uniqueLike: index("unique_like_idx").on(table.userId, table.targetType, table.targetId),
}));

/**
 * 收藏表
 */
export const bookmarks = mysqlTable("bookmarks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  targetType: mysqlEnum("targetType", ["post", "article"]).notNull(),
  targetId: int("targetId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("bookmarks_user_idx").on(table.userId),
  targetIdx: index("bookmarks_target_idx").on(table.targetType, table.targetId),
  // 联合唯一约束
  uniqueBookmark: index("unique_bookmark_idx").on(table.userId, table.targetType, table.targetId),
}));

/**
 * 心声社区表 (Heart Voices)
 */
export const heartVoices = mysqlTable("heart_voices", {
  id: int("id").autoincrement().primaryKey(),
  authorId: int("authorId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  age: int("age"),
  gender: mysqlEnum("gender", ["male", "female", "other"]),
  location: varchar("location", { length: 100 }),
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  likesCount: int("likesCount").default(0).notNull(),
  commentsCount: int("commentsCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  authorIdx: index("heart_voices_author_idx").on(table.authorId),
  createdAtIdx: index("heart_voices_created_at_idx").on(table.createdAt),
}));

/**
 * 轮播图表
 */
export const carousels = mysqlTable("carousels", {
  id: int("id").autoincrement().primaryKey(),
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
  title: varchar("title", { length: 200 }),
  linkUrl: varchar("linkUrl", { length: 500 }),
  order: int("order").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * 用户标签表
 */
export const userTags = mysqlTable("user_tags", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  label: varchar("label", { length: 50 }).notNull(),
  voteCount: int("voteCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_tags_user_idx").on(table.userId),
}));

/**
 * 用户标签投票记录表
 */
export const userTagVotes = mysqlTable("user_tag_votes", {
  id: int("id").autoincrement().primaryKey(),
  userTagId: int("userTagId").notNull(),
  voterId: int("voterId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userTagIdx: index("user_tag_votes_tag_idx").on(table.userTagId),
  voterIdx: index("user_tag_votes_voter_idx").on(table.voterId),
  uniqueVote: index("unique_user_tag_vote_idx").on(table.userTagId, table.voterId),
}));

/**
 * 通知表
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["system", "like", "comment", "reply"]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content"),
  linkUrl: varchar("linkUrl", { length: 500 }),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("notifications_user_idx").on(table.userId),
  readIdx: index("notifications_read_idx").on(table.isRead),
}));

export type InsertUser = InferInsertModel<typeof users>;
export type SelectUser = InferSelectModel<typeof users>;
export type User = SelectUser;

export type InsertCategory = InferInsertModel<typeof categories>;
export type SelectCategory = InferSelectModel<typeof categories>;

export type InsertTag = InferInsertModel<typeof tags>;
export type SelectTag = InferSelectModel<typeof tags>;

export type InsertPost = InferInsertModel<typeof posts>;
export type SelectPost = InferSelectModel<typeof posts>;

export type InsertPostTag = InferInsertModel<typeof postTags>;
export type SelectPostTag = InferSelectModel<typeof postTags>;

export type InsertArticle = InferInsertModel<typeof articles>;
export type SelectArticle = InferSelectModel<typeof articles>;

export type InsertArticleTag = InferInsertModel<typeof articleTags>;
export type SelectArticleTag = InferSelectModel<typeof articleTags>;

export type InsertComment = InferInsertModel<typeof comments>;
export type SelectComment = InferSelectModel<typeof comments>;

export type InsertLike = InferInsertModel<typeof likes>;
export type SelectLike = InferSelectModel<typeof likes>;

export type InsertBookmark = InferInsertModel<typeof bookmarks>;
export type SelectBookmark = InferSelectModel<typeof bookmarks>;

export type InsertHeartVoice = InferInsertModel<typeof heartVoices>;
export type SelectHeartVoice = InferSelectModel<typeof heartVoices>;

export type InsertCarousel = InferInsertModel<typeof carousels>;
export type SelectCarousel = InferSelectModel<typeof carousels>;

export type InsertUserTag = InferInsertModel<typeof userTags>;
export type SelectUserTag = InferSelectModel<typeof userTags>;

export type InsertUserTagVote = InferInsertModel<typeof userTagVotes>;
export type SelectUserTagVote = InferSelectModel<typeof userTagVotes>;

export type InsertNotification = InferInsertModel<typeof notifications>;
export type SelectNotification = InferSelectModel<typeof notifications>;
