import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useParams } from "wouter";
import { ArrowLeft, Heart, MessageCircle, Bookmark, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function PostDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [commentContent, setCommentContent] = useState("");
  const utils = trpc.useUtils();

  const postId = parseInt(id || "0");
  const { data: post, isLoading } = trpc.posts.getById.useQuery({ id: postId });
  const { data: comments } = trpc.comments.list.useQuery({
    contentType: "post",
    contentId: postId,
  });

  const createCommentMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.list.invalidate();
      utils.posts.getById.invalidate();
      setCommentContent("");
      toast.success("评论成功!");
    },
  });

  const likeMutation = trpc.likes.toggle.useMutation({
    onSuccess: () => {
      utils.posts.getById.invalidate();
    },
  });

  const bookmarkMutation = trpc.bookmarks.toggle.useMutation({
    onSuccess: () => {
      utils.posts.getById.invalidate();
    },
  });

  const deleteCommentMutation = trpc.comments.delete.useMutation({
    onSuccess: () => {
      utils.comments.list.invalidate();
      toast.success("删除成功");
    },
  });

  const handleComment = () => {
    if (!commentContent.trim()) {
      toast.error("请输入评论内容");
      return;
    }
    createCommentMutation.mutate({
      contentType: "post",
      contentId: postId,
      content: commentContent,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen dramatic-gradient flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen dramatic-gradient flex items-center justify-center">
        <Card className="cinematic-blur dramatic-shadow border-border/50 p-8">
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">帖子不存在</p>
            <Link href="/posts">
              <Button>返回动态列表</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen dramatic-gradient">
      {/* 导航栏 */}
      <nav className="cinematic-blur border-b border-border/50 sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Link href="/posts">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">动态详情</h1>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* 帖子内容 */}
          <Card className="cinematic-blur dramatic-shadow border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {post.author?.name?.[0] || post.authorId}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">
                    {post.author?.name || `用户${post.authorId}`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {post.title && <h2 className="font-bold text-2xl mb-4">{post.title}</h2>}
              <p className="whitespace-pre-wrap text-lg">{post.content}</p>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.tags.map((tag: any) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex items-center gap-6 text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:text-primary"
                onClick={() => {
                  if (!user) {
                    toast.error("请先登录");
                    return;
                  }
                  likeMutation.mutate({ contentType: "post", contentId: post.id });
                }}
              >
                <Heart className="w-4 h-4" />
                {post.likesCount || 0}
              </Button>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                {post.commentsCount || 0}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:text-accent"
                onClick={() => {
                  if (!user) {
                    toast.error("请先登录");
                    return;
                  }
                  bookmarkMutation.mutate({ contentType: "post", contentId: post.id });
                }}
              >
                <Bookmark className="w-4 h-4" />
                {post.bookmarksCount || 0}
              </Button>
            </CardFooter>
          </Card>

          {/* 评论表单 */}
          {isAuthenticated && (
            <Card className="cinematic-blur dramatic-shadow border-border/50">
              <CardContent className="pt-6">
                <Textarea
                  placeholder="写下你的评论..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="min-h-[100px] bg-background/50"
                />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={handleComment}
                  disabled={createCommentMutation.isPending}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  发表评论
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* 评论列表 */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">
              评论 ({comments?.length || 0})
            </h3>
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <Card
                  key={comment.id}
                  className="cinematic-blur border-border/50"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-secondary/20 text-secondary">
                          {comment.author?.name?.[0] || comment.authorId}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-semibold">
                              {comment.author?.name || `用户${comment.authorId}`}
                            </span>
                            <span className="text-sm text-muted-foreground ml-3">
                              {formatDistanceToNow(new Date(comment.createdAt), {
                                addSuffix: true,
                                locale: zhCN,
                              })}
                            </span>
                          </div>
                          {user && (user.id === comment.authorId || user.role === "admin") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCommentMutation.mutate({ id: comment.id })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <p className="text-foreground/90 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="cinematic-blur border-border/50">
                <CardContent className="py-8 text-center text-muted-foreground">
                  暂无评论，快来抢沙发吧！
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
