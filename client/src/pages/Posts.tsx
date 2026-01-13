import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Heart, MessageCircle, Bookmark, Send, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function Posts() {
  const { user, isAuthenticated } = useAuth();
  const [newPostContent, setNewPostContent] = useState("");
  const utils = trpc.useUtils();

  const { data: posts, isLoading } = trpc.posts.list.useQuery({ limit: 20, offset: 0 });

  const createPostMutation = trpc.posts.create.useMutation({
    onSuccess: () => {
      utils.posts.list.invalidate();
      setNewPostContent("");
      toast.success("发布成功!");
    },
    onError: (error) => {
      toast.error("发布失败: " + error.message);
    },
  });

  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      toast.error("请输入内容");
      return;
    }
    createPostMutation.mutate({ content: newPostContent });
  };

  return (
    <div className="min-h-screen dramatic-gradient">
      {/* 导航栏 */}
      <nav className="cinematic-blur border-b border-border/50 sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold">动态广场</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/articles">
                <Button variant="ghost">文章</Button>
              </Link>
              <Link href="/calendar">
                <Button variant="ghost">老黄历</Button>
              </Link>
              {isAuthenticated && (
                <Link href="/profile">
                  <Button variant="default">个人中心</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* 发帖表单 */}
          {isAuthenticated && (
            <Card className="cinematic-blur dramatic-shadow border-border/50">
              <CardHeader>
                <h3 className="font-bold">分享新动态</h3>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="分享你的想法..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[120px] bg-background/50"
                />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={handleCreatePost}
                  disabled={createPostMutation.isPending}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  发布
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* 帖子列表 */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">加载中...</div>
          ) : posts && posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <Card className="cinematic-blur border-border/50">
              <CardContent className="py-12 text-center text-muted-foreground">
                还没有动态，快来发布第一条吧！
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post }: { post: any }) {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const likeMutation = trpc.likes.toggle.useMutation({
    onSuccess: () => {
      utils.posts.list.invalidate();
    },
  });

  const bookmarkMutation = trpc.bookmarks.toggle.useMutation({
    onSuccess: () => {
      utils.posts.list.invalidate();
    },
  });

  const handleLike = () => {
    if (!user) {
      toast.error("请先登录");
      return;
    }
    likeMutation.mutate({ contentType: "post", contentId: post.id });
  };

  const handleBookmark = () => {
    if (!user) {
      toast.error("请先登录");
      return;
    }
    bookmarkMutation.mutate({ contentType: "post", contentId: post.id });
  };

  return (
    <Card className="cinematic-blur dramatic-shadow border-border/50 hover:border-primary/30 transition-all">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary/20 text-primary">
              {post.authorId}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-semibold">用户 {post.authorId}</div>
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
        {post.title && <h3 className="font-bold text-lg mb-2">{post.title}</h3>}
        <p className="whitespace-pre-wrap text-foreground/90">{post.content}</p>
      </CardContent>
      <CardFooter className="flex items-center gap-6 text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 hover:text-primary"
          onClick={handleLike}
        >
          <Heart className="w-4 h-4" />
          {post.likesCount || 0}
        </Button>
        <Link href={`/posts/${post.id}`}>
          <Button variant="ghost" size="sm" className="gap-2 hover:text-secondary">
            <MessageCircle className="w-4 h-4" />
            {post.commentsCount || 0}
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 hover:text-accent"
          onClick={handleBookmark}
        >
          <Bookmark className="w-4 h-4" />
          {post.bookmarksCount || 0}
        </Button>
      </CardFooter>
    </Card>
  );
}
