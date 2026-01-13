import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";
import { ArrowLeft, Bell, Heart, MessageCircle, Bookmark, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { toast } from "sonner";

export default function Notifications() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const { data: notifications, isLoading } = trpc.notifications.list.useQuery(
    { unreadOnly: false },
    { enabled: !!user }
  );

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
    },
  });

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      toast.success("已全部标记为已读");
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen dramatic-gradient flex items-center justify-center">
        <Card className="cinematic-blur dramatic-shadow border-border/50 p-8">
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">请先登录</p>
            <Link href="/">
              <Button>返回首页</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-primary" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-secondary" />;
      case "bookmark":
        return <Bookmark className="w-5 h-5 text-accent" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationText = (notification: any) => {
    const actorName = notification.actor?.name || `用户${notification.actorId}`;
    switch (notification.type) {
      case "like":
        return `${actorName} 赞了你的${notification.contentType === "post" ? "动态" : "文章"}`;
      case "comment":
        return `${actorName} 评论了你的${notification.contentType === "post" ? "动态" : "文章"}`;
      case "bookmark":
        return `${actorName} 收藏了你的${notification.contentType === "post" ? "动态" : "文章"}`;
      default:
        return "新通知";
    }
  };

  const getNotificationLink = (notification: any) => {
    if (notification.contentType === "post") {
      return `/posts/${notification.contentId}`;
    } else if (notification.contentType === "article") {
      return `/articles/${notification.contentId}`;
    }
    return "#";
  };

  return (
    <div className="min-h-screen dramatic-gradient">
      {/* 导航栏 */}
      <nav className="cinematic-blur border-b border-border/50 sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/profile">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Bell className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold">通知中心</h1>
              </div>
            </div>
            {notifications && notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                全部已读
              </Button>
            )}
          </div>
        </div>
      </nav>

      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">加载中...</div>
          ) : notifications && notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cinematic-blur border-border/50 hover:border-primary/30 transition-all ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link href={getNotificationLink(notification)}>
                            <p
                              className="text-foreground hover:text-primary transition-colors cursor-pointer"
                              onClick={() => {
                                if (!notification.read) {
                                  markAsReadMutation.mutate({ id: notification.id });
                                }
                              }}
                            >
                              {getNotificationText(notification)}
                            </p>
                          </Link>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="cinematic-blur border-border/50">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>暂无通知</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
