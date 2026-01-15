import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Link, useParams } from "wouter";
import { ArrowLeft, MapPin, User, Calendar, Send, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { toast } from "sonner";

export default function HeartVoiceDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [commentContent, setCommentContent] = useState("");
  const utils = trpc.useUtils();
  
  const voiceId = parseInt(id || "0");
  const { data: voice, isLoading } = trpc.heartVoices.get.useQuery(voiceId);
  const { data: comments } = trpc.comments.list.useQuery({
    contentType: "heartVoice",
    contentId: voiceId,
  });

  const createCommentMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.list.invalidate();
      utils.heartVoices.get.invalidate();
      setCommentContent("");
      toast.success("评论成功!");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const deleteCommentMutation = trpc.comments.delete.useMutation({
    onSuccess: () => {
      utils.comments.list.invalidate();
      utils.heartVoices.get.invalidate();
      toast.success("删除成功");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleComment = () => {
    if (!commentContent.trim()) {
      toast.error("请输入评论内容");
      return;
    }
    createCommentMutation.mutate({
      contentType: "heartVoice",
      contentId: voiceId,
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

  if (!voice) {
    return (
      <div className="min-h-screen dramatic-gradient flex items-center justify-center">
        <Card className="cinematic-blur dramatic-shadow border-border/50 p-8">
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">心声不存在</p>
            <Link href="/heart-voices">
              <Button>返回列表</Button>
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
            <Link href="/heart-voices">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">心声详情</h1>
          </div>
        </div>
      </nav>

      <main className="container py-8 max-w-3xl">
        <Card className="cinematic-blur dramatic-shadow border-border/50">
          <CardHeader>
            <div className="flex items-start justify-between">
               <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={voice.author?.avatar || undefined} />
                    <AvatarFallback>
                      {voice.isAnonymous ? "匿" : voice.author?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {voice.isAnonymous ? "匿名用户" : voice.author?.name || "未知用户"}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{formatDistanceToNow(new Date(voice.createdAt), { addSuffix: true, locale: zhCN })}</span>
                      {voice.location && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {voice.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
               </div>
            </div>
            <CardTitle className="mt-4 text-2xl">{voice.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
              {voice.content}
            </div>
            
            {(voice.age || voice.gender) && (
              <div className="flex gap-2 pt-4">
                {voice.age && (
                  <div className="bg-secondary/50 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {voice.age}岁
                  </div>
                )}
                {voice.gender && (
                  <div className="bg-secondary/50 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <User className="w-3 h-3" />
                    {voice.gender === 'male' ? '男' : voice.gender === 'female' ? '女' : '其他'}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 评论区 */}
        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-bold text-white">评论 ({voice.commentsCount || 0})</h2>
          
          {/* 评论表单 */}
          {isAuthenticated ? (
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
          ) : (
             <Card className="cinematic-blur border-border/50">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">登录后参与评论</p>
                  <Link href="/login">
                    <Button variant="outline">去登录</Button>
                  </Link>
                </CardContent>
             </Card>
          )}

          {/* 评论列表 */}
          <div className="space-y-4">
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <Card
                  key={comment.id}
                  className="cinematic-blur border-border/50"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={comment.author?.avatar || undefined} />
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
      </main>
    </div>
  );
}
