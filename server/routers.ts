import { TRPCError } from "@trpc/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { sdk } from "./_core/sdk";

import { carouselService } from "./services/carouselService";

export const appRouter = router({
  system: systemRouter,

  userTags: router({
    add: protectedProcedure
      .input(z.object({
        userId: z.number(),
        label: z.string().min(1).max(20),
      }))
      .mutation(async ({ input }) => {
        return db.addUserTag(input.userId, input.label);
      }),

    list: publicProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .query(async ({ input }) => {
        return db.getUserTags(input.userId);
      }),

    vote: protectedProcedure
      .input(z.object({
        tagId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        try {
          await db.voteUserTag(input.tagId, ctx.user.id);
          return { success: true };
        } catch (error: any) {
          if (error.message === "ALREADY_VOTED") {
            throw new TRPCError({ code: "CONFLICT", message: "已经投过票了" });
          }
          throw error;
        }
      }),
  }),

  notifications: router({
    list: protectedProcedure
      .input(z.object({
        unreadOnly: z.boolean().default(false),
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ ctx, input }) => {
        return db.getNotifications(ctx.user.id, input.unreadOnly, input.limit);
      }),
      
    markRead: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.id);
        return { success: true };
      }),
      
    markAllRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        await db.markAllNotificationsAsRead(ctx.user.id);
        return { success: true };
      }),
  }),
  
  auth: router({
    register: publicProcedure
      .input(z.object({
        username: z.string().min(3, "用户名至少3个字符"),
        password: z.string().min(6, "密码至少6个字符"),
        name: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // 检查用户名是否存在
        const existingUser = await db.getUserByUsername(input.username);
        if (existingUser) {
          throw new TRPCError({ code: "CONFLICT", message: "用户名已存在" });
        }

        // 哈希密码
        const hashedPassword = await bcrypt.hash(input.password, 10);
        const openId = `local:${input.username}`;

        // 创建用户
        await db.createUser({
          openId,
          username: input.username,
          password: hashedPassword,
          name: input.name || input.username,
          loginMethod: "local",
        });

        // 创建 Session
        const sessionToken = await sdk.createSessionToken(openId, {
          name: input.name || input.username,
          expiresInMs: ONE_YEAR_MS,
        });

        // 设置 Cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return { success: true };
      }),

    login: publicProcedure
      .input(z.object({
        username: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByUsername(input.username);
        if (!user || !user.password) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "用户名或密码错误" });
        }

        const isValid = await bcrypt.compare(input.password, user.password);
        if (!isValid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "用户名或密码错误" });
        }

        // 创建 Session
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || user.username || "",
          expiresInMs: ONE_YEAR_MS,
        });

        // 设置 Cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return { success: true };
      }),

    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      
      // Clear with current detected options
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: 0 });
      
      // Also clear potential mismatched secure/non-secure cookies
      const isSecure = cookieOptions.secure;
      ctx.res.clearCookie(COOKIE_NAME, { 
        ...cookieOptions, 
        secure: !isSecure, 
        sameSite: !isSecure ? 'none' : 'lax',
        maxAge: 0 
      });
      return { success: true };
    }),
  }),

  // ============ 搜索 ============
  search: router({
    all: publicProcedure
      .input(z.object({
        query: z.string(),
        limit: z.number().min(1).max(100).default(30),
      }))
      .query(async ({ input }) => {
        return db.searchAll(input.query, input.limit);
      }),
  }),
  
  // ============ 用户 ============
  users: router({
    get: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const user = await db.getUser(input);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "用户不存在" });
        }
        // 移除敏感信息
        const { password, ...safeUser } = user;
        return safeUser;
      }),
  }),

  // ============ 轮播图 ============
  carousels: router({
    list: publicProcedure.query(async () => {
      const items = await db.getActiveCarousels();
      if (items.length === 0) {
        console.log("[Carousel] No active carousels found, initializing default images...");
        return await carouselService.resetAndFillBeautyImages();
      }
      return items;
    }),
    
    // 管理员：重置并填充美女图片
    resetAndFill: protectedProcedure
      .mutation(async ({ ctx }) => {
        // 鉴权：仅管理员可操作
        if (!ctx.user || ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: '只有管理员可以执行此操作' });
        }

        try {
          // 调用服务层逻辑
          const result = await carouselService.resetAndFillBeautyImages();
          return result;
        } catch (error) {
          console.error("Failed to reset carousels:", error);
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: '重置轮播图失败' 
          });
        }
      }),
  }),

  posts: router({
    list: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
        categoryId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return db.getPosts(input.limit, input.offset, input.categoryId);
      }),
    
    get: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const post = await db.getPost(input);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });
        return post;
      }),
      
    create: protectedProcedure
      .input(z.object({
        title: z.string().optional(),
        content: z.string().min(1),
        categoryId: z.number().optional(),
        images: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createPost({
          ...input,
          authorId: ctx.user.id,
          images: input.images ? JSON.stringify(input.images) : undefined,
        });
      }),
  }),

  articles: router({
    list: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
        categoryId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return db.getArticles(input.limit, input.offset, input.categoryId);
      }),

    get: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const article = await db.getArticle(input);
        if (!article) throw new TRPCError({ code: "NOT_FOUND" });
        return article;
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        categoryId: z.number().optional(),
        coverImage: z.string().optional(),
        summary: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createArticle({
          ...input,
          authorId: ctx.user.id,
          published: true, // 默认直接发布
        });
      }),
  }),

  heartVoices: router({
    list: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        const voices = await db.getHeartVoices(input.limit, input.offset);
        // 如果是匿名，需要处理作者信息
        return voices.map(v => {
          if (v.isAnonymous) {
            // 返回不带作者信息的对象
            const { author, ...rest } = v;
            return {
              ...rest,
              author: null
            };
          }
          return v;
        });
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        isAnonymous: z.boolean().default(false),
        age: z.number().optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        location: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createHeartVoice({
          ...input,
          authorId: ctx.user.id,
        });
      }),

    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteHeartVoice(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ============ 评论 ============
  comments: router({
    list: publicProcedure
      .input(z.object({
        contentType: z.enum(["post", "article"]),
        contentId: z.number(),
      }))
      .query(async ({ input }) => {
        return db.getComments(input.contentType, input.contentId);
      }),

    create: protectedProcedure
      .input(z.object({
        contentType: z.enum(["post", "article"]),
        contentId: z.number(),
        content: z.string().min(1),
        parentId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createComment({
          content: input.content,
          authorId: ctx.user.id,
          postId: input.contentType === "post" ? input.contentId : null,
          articleId: input.contentType === "article" ? input.contentId : null,
          parentId: input.parentId,
        });
      }),

    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteComment(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ============ 点赞 ============
  likes: router({
    toggle: protectedProcedure
      .input(z.object({
        contentType: z.enum(["post", "article", "comment"]),
        contentId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.toggleLike(ctx.user.id, input.contentType, input.contentId);
      }),
  }),

  // ============ 收藏 ============
  bookmarks: router({
    toggle: protectedProcedure
      .input(z.object({
        contentType: z.enum(["post", "article"]),
        contentId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.toggleBookmark(ctx.user.id, input.contentType, input.contentId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
