import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId = 1, role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role,
    avatar: null,
    department: null,
    position: null,
    joinedAt: null,
    bio: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Posts API", () => {
  it("should create a post successfully", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const post = await caller.posts.create({
      content: "这是一条测试动态",
      title: "测试标题",
    });

    expect(post).toBeDefined();
    expect(post?.content).toBe("这是一条测试动态");
    expect(post?.title).toBe("测试标题");
    expect(post?.authorId).toBe(1);
  });

  it("should list posts", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const posts = await caller.posts.list({ limit: 10, offset: 0 });

    expect(Array.isArray(posts)).toBe(true);
  });

  it("should toggle like on a post", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    // 创建一个帖子
    const post = await caller.posts.create({
      content: "测试点赞功能",
    });

    if (!post) {
      throw new Error("Failed to create post");
    }

    // 点赞
    const likeResult = await caller.likes.toggle({
      contentType: "post",
      contentId: post.id,
    });

    expect(likeResult.liked).toBe(true);

    // 取消点赞
    const unlikeResult = await caller.likes.toggle({
      contentType: "post",
      contentId: post.id,
    });

    expect(unlikeResult.liked).toBe(false);
  });
});

describe("Comments API", () => {
  it("should create a comment on a post", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    // 创建一个帖子
    const post = await caller.posts.create({
      content: "测试评论功能",
    });

    if (!post) {
      throw new Error("Failed to create post");
    }

    // 添加评论
    const comment = await caller.comments.create({
      contentType: "post",
      contentId: post.id,
      content: "这是一条测试评论",
    });

    expect(comment).toBeDefined();
    expect(comment?.content).toBe("这是一条测试评论");
    expect(comment?.authorId).toBe(1);
  });

  it("should list comments for a post", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    // 创建一个帖子
    const post = await caller.posts.create({
      content: "测试评论列表",
    });

    if (!post) {
      throw new Error("Failed to create post");
    }

    // 添加评论
    await caller.comments.create({
      contentType: "post",
      contentId: post.id,
      content: "评论1",
    });

    await caller.comments.create({
      contentType: "post",
      contentId: post.id,
      content: "评论2",
    });

    // 获取评论列表
    const comments = await caller.comments.list({
      contentType: "post",
      contentId: post.id,
    });

    expect(comments.length).toBeGreaterThanOrEqual(2);
  });
});

describe("Notifications API", () => {
  it("should create notification when user comments", async () => {
    const ctx1 = createAuthContext(1);
    const ctx2 = createAuthContext(2);
    const caller1 = appRouter.createCaller(ctx1);
    const caller2 = appRouter.createCaller(ctx2);

    // 用户1创建帖子
    const post = await caller1.posts.create({
      content: "测试通知功能",
    });

    if (!post) {
      throw new Error("Failed to create post");
    }

    // 用户2评论
    await caller2.comments.create({
      contentType: "post",
      contentId: post.id,
      content: "这是用户2的评论",
    });

    // 用户1应该收到通知
    const notifications = await caller1.notifications.list({ unreadOnly: true });

    expect(notifications.length).toBeGreaterThan(0);
    const commentNotification = notifications.find(
      (n) => n.type === "comment" && n.contentId === post.id
    );
    expect(commentNotification).toBeDefined();
  });

  it("should mark notification as read", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const notifications = await caller.notifications.list({ unreadOnly: true });

    if (notifications.length > 0) {
      const result = await caller.notifications.markAsRead({ id: notifications[0].id });
      expect(result.success).toBe(true);
    }
  });
});
