import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // 用户相关
  users: router({
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const user = await db.getUserById(input.id);
        if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: '用户不存在' });
        return user;
      }),
    
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        avatar: z.string().optional(),
        department: z.string().optional(),
        position: z.string().optional(),
        joinedAt: z.date().optional(),
        bio: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.updateUserProfile(ctx.user.id, input);
      }),
    
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return db.searchUsers(input.query);
      }),
  }),

  // 分类相关
  categories: router({
    list: publicProcedure.query(() => db.getCategories()),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        color: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createCategory(input);
      }),
  }),

  // 标签相关
  tags: router({
    list: publicProcedure.query(() => db.getTags()),
    
    create: protectedProcedure
      .input(z.object({ name: z.string() }))
      .mutation(async ({ input }) => {
        return db.createTag(input.name);
      }),
  }),

  // 帖子相关
  posts: router({
    list: publicProcedure
      .input(z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
        categoryId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        if (input.categoryId) {
          return db.getPostsByCategory(input.categoryId, input.limit);
        }
        return db.getPosts(input.limit, input.offset);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const post = await db.getPostById(input.id);
        if (!post) throw new TRPCError({ code: 'NOT_FOUND', message: '帖子不存在' });
        
        const author = await db.getUserById(post.authorId);
        const tags = await db.getPostTags(input.id);
        
        return { ...post, author, tags: tags.map(t => t.tag) };
      }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string().optional(),
        content: z.string(),
        images: z.string().optional(),
        categoryId: z.number().optional(),
        tagNames: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { tagNames, ...postData } = input;
        const post = await db.createPost({
          ...postData,
          authorId: ctx.user.id,
        });
        
        if (post && tagNames && tagNames.length > 0) {
          for (const tagName of tagNames) {
            const tag = await db.getOrCreateTag(tagName);
            if (tag) {
              await db.addPostTag(post.id, tag.id);
            }
          }
        }
        
        return post;
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        images: z.string().optional(),
        categoryId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.getPostById(input.id);
        if (!post) throw new TRPCError({ code: 'NOT_FOUND', message: '帖子不存在' });
        if (post.authorId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: '无权限编辑此帖子' });
        }
        
        const { id, ...updateData } = input;
        return db.updatePost(id, updateData);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.getPostById(input.id);
        if (!post) throw new TRPCError({ code: 'NOT_FOUND', message: '帖子不存在' });
        if (post.authorId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: '无权限删除此帖子' });
        }
        
        await db.deletePost(input.id);
        return { success: true };
      }),
    
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return db.searchPosts(input.query);
      }),
  }),

  // 文章相关
  articles: router({
    list: publicProcedure
      .input(z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
        publishedOnly: z.boolean().default(true),
      }))
      .query(async ({ input }) => {
        return db.getArticles(input.publishedOnly, input.limit, input.offset);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const article = await db.getArticleById(input.id);
        if (!article) throw new TRPCError({ code: 'NOT_FOUND', message: '文章不存在' });
        
        await db.incrementArticleViews(input.id);
        const author = await db.getUserById(article.authorId);
        const tags = await db.getArticleTags(input.id);
        
        return { ...article, author, tags: tags.map(t => t.tag) };
      }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        content: z.string(),
        coverImage: z.string().optional(),
        summary: z.string().optional(),
        categoryId: z.number().optional(),
        published: z.boolean().default(false),
        tagNames: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { tagNames, ...articleData } = input;
        const article = await db.createArticle({
          ...articleData,
          authorId: ctx.user.id,
          publishedAt: input.published ? new Date() : undefined,
        });
        
        if (article && tagNames && tagNames.length > 0) {
          for (const tagName of tagNames) {
            const tag = await db.getOrCreateTag(tagName);
            if (tag) {
              await db.addArticleTag(article.id, tag.id);
            }
          }
        }
        
        return article;
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        coverImage: z.string().optional(),
        summary: z.string().optional(),
        categoryId: z.number().optional(),
        published: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const article = await db.getArticleById(input.id);
        if (!article) throw new TRPCError({ code: 'NOT_FOUND', message: '文章不存在' });
        if (article.authorId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: '无权限编辑此文章' });
        }
        
        const { id, published, ...updateData } = input;
        const finalData: any = { ...updateData };
        if (published !== undefined) {
          finalData.published = published;
          if (published && !article.published) {
            finalData.publishedAt = new Date();
          }
        }
        
        return db.updateArticle(id, finalData);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const article = await db.getArticleById(input.id);
        if (!article) throw new TRPCError({ code: 'NOT_FOUND', message: '文章不存在' });
        if (article.authorId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: '无权限删除此文章' });
        }
        
        await db.deleteArticle(input.id);
        return { success: true };
      }),
    
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return db.searchArticles(input.query);
      }),
  }),

  // 评论相关
  comments: router({
    list: publicProcedure
      .input(z.object({
        contentType: z.enum(['post', 'article']),
        contentId: z.number(),
      }))
      .query(async ({ input }) => {
        const comments = await db.getComments(input.contentType, input.contentId);
        const commentsWithAuthors = await Promise.all(
          comments.map(async (comment) => {
            const author = await db.getUserById(comment.authorId);
            return { ...comment, author };
          })
        );
        return commentsWithAuthors;
      }),
    
    create: protectedProcedure
      .input(z.object({
        contentType: z.enum(['post', 'article']),
        contentId: z.number(),
        content: z.string(),
        parentId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const comment = await db.createComment({
          ...input,
          authorId: ctx.user.id,
        });
        
        // 创建通知
        let contentAuthorId: number | null = null;
        if (input.contentType === 'post') {
          const post = await db.getPostById(input.contentId);
          if (post) contentAuthorId = post.authorId;
        } else {
          const article = await db.getArticleById(input.contentId);
          if (article) contentAuthorId = article.authorId;
        }
        
        if (contentAuthorId && contentAuthorId !== ctx.user.id) {
          await db.createNotification({
            userId: contentAuthorId,
            actorId: ctx.user.id,
            type: 'comment',
            contentType: input.contentType,
            contentId: input.contentId,
          });
        }
        
        return comment;
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const comments = await db.getComments('post', 0); // 临时查询
        const comment = comments.find(c => c.id === input.id);
        
        if (!comment) throw new TRPCError({ code: 'NOT_FOUND', message: '评论不存在' });
        if (comment.authorId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: '无权限删除此评论' });
        }
        
        await db.deleteComment(input.id);
        return { success: true };
      }),
  }),

  // 点赞相关
  likes: router({
    toggle: protectedProcedure
      .input(z.object({
        contentType: z.enum(['post', 'article']),
        contentId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.toggleLike(ctx.user.id, input.contentType, input.contentId);
        
        // 如果是点赞操作,创建通知
        if (result.liked) {
          let contentAuthorId: number | null = null;
          if (input.contentType === 'post') {
            const post = await db.getPostById(input.contentId);
            if (post) contentAuthorId = post.authorId;
          } else {
            const article = await db.getArticleById(input.contentId);
            if (article) contentAuthorId = article.authorId;
          }
          
          if (contentAuthorId && contentAuthorId !== ctx.user.id) {
            await db.createNotification({
              userId: contentAuthorId,
              actorId: ctx.user.id,
              type: 'like',
              contentType: input.contentType,
              contentId: input.contentId,
            });
          }
        }
        
        return result;
      }),
    
    check: protectedProcedure
      .input(z.object({
        contentType: z.enum(['post', 'article']),
        contentId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const liked = await db.checkUserLiked(ctx.user.id, input.contentType, input.contentId);
        return { liked };
      }),
  }),

  // 收藏相关
  bookmarks: router({
    toggle: protectedProcedure
      .input(z.object({
        contentType: z.enum(['post', 'article']),
        contentId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.toggleBookmark(ctx.user.id, input.contentType, input.contentId);
      }),
    
    list: protectedProcedure
      .input(z.object({
        contentType: z.enum(['post', 'article']).optional(),
      }))
      .query(async ({ ctx, input }) => {
        return db.getUserBookmarks(ctx.user.id, input.contentType);
      }),
  }),

  // 通知相关
  notifications: router({
    list: protectedProcedure
      .input(z.object({
        unreadOnly: z.boolean().default(false),
      }))
      .query(async ({ ctx, input }) => {
        const notifications = await db.getUserNotifications(ctx.user.id, input.unreadOnly);
        const notificationsWithActors = await Promise.all(
          notifications.map(async (notification) => {
            const actor = await db.getUserById(notification.actorId);
            return { ...notification, actor };
          })
        );
        return notificationsWithActors;
      }),
    
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.id);
        return { success: true };
      }),
    
    markAllAsRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        await db.markAllNotificationsAsRead(ctx.user.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
