import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft, Sparkles, Calendar, Briefcase, Mail, User, Bell } from "lucide-react";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { zhCN } from "date-fns/locale";

import { UserAvatarWithTags } from "@/components/UserAvatarWithTags";

// 简单的骨架屏组件
function ProfileSkeleton() {
  return (
    <div className="min-h-screen dramatic-gradient">
      <nav className="cinematic-blur border-b border-border/50 sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 bg-slate-800/50 rounded animate-pulse" />
          </div>
        </div>
      </nav>
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-96 bg-slate-800/50 rounded animate-pulse" />
            <div className="space-y-6">
              <div className="h-48 bg-slate-800/50 rounded animate-pulse" />
              <div className="h-48 bg-slate-800/50 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user: currentUser, logout } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  
  // 确定要显示的用户 ID
  const viewUserId = params.id ? parseInt(params.id) : currentUser?.id;
  const isSelf = currentUser && viewUserId === currentUser.id;

  // 获取用户信息
  const { data: userProfile, isLoading, error } = trpc.users.get.useQuery(
    viewUserId || 0,
    { enabled: !!viewUserId }
  );

  // 获取当前登录用户的通知（仅在查看自己时）
  const { data: notifications } = trpc.notifications.list.useQuery(
    { unreadOnly: true },
    { enabled: !!currentUser && !!isSelf }
  );

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen dramatic-gradient flex items-center justify-center">
        <Card className="cinematic-blur dramatic-shadow border-border/50 p-8">
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">用户不存在或无法访问</p>
            <Link href="/">
              <Button>返回首页</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 使用查询到的用户信息，如果查询失败（比如查看自己时还没加载完），回退到currentUser
  const displayUser = userProfile;

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  // 计算入职天数
  const joinedDays = displayUser.joinedAt
    ? differenceInDays(new Date(), new Date(displayUser.joinedAt))
    : 0;

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
                <User className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold">{isSelf ? "个人中心" : "员工资料"}</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/posts">
                <Button variant="ghost">动态</Button>
              </Link>
              <Link href="/articles">
                <Button variant="ghost">文章</Button>
              </Link>
              {isSelf && (
                <Link href="/notifications">
                  <Button variant="ghost" className="relative">
                    <Bell className="w-4 h-4" />
                    {notifications && notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-xs flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 左侧：个人资料 */}
            <Card className="cinematic-blur dramatic-shadow border-border/50 h-fit">
              <CardContent className="p-6 md:p-8">
                <UserAvatarWithTags 
                  user={displayUser} 
                  size="2xl"
                  orientation="horizontal"
                  className="mb-2 w-full"
                  editable={isSelf ?? undefined} // 只有自己可以编辑标签
                >
                  <div className="flex flex-col items-start gap-1 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-2xl font-bold">{displayUser.name || "未设置姓名"}</h2>
                      {displayUser.role === "admin" && (
                        <Badge variant="default" className="bg-primary">
                          管理员
                        </Badge>
                      )}
                    </div>
                    {displayUser.bio && (
                      <p className="text-muted-foreground text-sm text-left">{displayUser.bio}</p>
                    )}
                  </div>
                </UserAvatarWithTags>

                <div className="w-full space-y-3 text-sm text-left border-t border-border/50 pt-6 mt-4">
                  {displayUser.email && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span className="truncate">{displayUser.email}</span>
                    </div>
                  )}
                  {displayUser.department && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Briefcase className="w-4 h-4 shrink-0" />
                      <span>{displayUser.department} {displayUser.position && `· ${displayUser.position}`}</span>
                    </div>
                  )}
                  {displayUser.joinedAt && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>
                        入职 {formatDistanceToNow(new Date(displayUser.joinedAt), { locale: zhCN })}
                        {joinedDays > 0 && ` (${joinedDays} 天)`}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {/* 右侧：快捷操作 (仅自己可见) */}
              {isSelf && (
                <Card className="cinematic-blur dramatic-shadow border-border/50">
                  <CardHeader>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      快捷操作
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Link href="/posts">
                        <Button variant="outline" className="w-full justify-start h-auto py-4 px-4 border-primary/20 hover:bg-primary/5 hover:border-primary/50 transition-all">
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-semibold">我的动态</span>
                            <span className="text-xs text-muted-foreground">查看发布的动态</span>
                          </div>
                        </Button>
                      </Link>
                      <Link href="/articles">
                        <Button variant="outline" className="w-full justify-start h-auto py-4 px-4 border-primary/20 hover:bg-primary/5 hover:border-primary/50 transition-all">
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-semibold">我的文章</span>
                            <span className="text-xs text-muted-foreground">管理发布的文章</span>
                          </div>
                        </Button>
                      </Link>
                      <Link href="/bookmarks">
                        <Button variant="outline" className="w-full justify-start h-auto py-4 px-4 border-primary/20 hover:bg-primary/5 hover:border-primary/50 transition-all">
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-semibold">我的收藏</span>
                            <span className="text-xs text-muted-foreground">查看收藏的内容</span>
                          </div>
                        </Button>
                      </Link>
                      <Link href="/notifications">
                        <Button variant="outline" className="w-full justify-start h-auto py-4 px-4 border-primary/20 hover:bg-primary/5 hover:border-primary/50 transition-all">
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-semibold">通知中心</span>
                            <span className="text-xs text-muted-foreground">查看消息通知</span>
                          </div>
                        </Button>
                      </Link>
                      <Link href="/calendar">
                        <Button variant="outline" className="w-full justify-start h-auto py-4 px-4 border-primary/20 hover:bg-primary/5 hover:border-primary/50 transition-all">
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-semibold">查看黄历</span>
                            <span className="text-xs text-muted-foreground">程序员老黄历</span>
                          </div>
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        onClick={handleLogout} 
                        className="w-full justify-start h-auto py-4 px-4 border-destructive/20 hover:bg-destructive/5 hover:border-destructive/50 transition-all text-destructive hover:text-destructive"
                      >
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-semibold">退出登录</span>
                          <span className="text-xs text-muted-foreground/80">安全退出账号</span>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 入职里程碑 */}
              {displayUser.joinedAt && (
                <Card className="cinematic-blur dramatic-shadow border-border/50">
                  <CardHeader>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      入职里程碑
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <MilestoneCard
                        label="入职天数"
                        value={joinedDays}
                        unit="天"
                        color="primary"
                      />
                      <MilestoneCard
                        label="工作周数"
                        value={Math.floor(joinedDays / 7)}
                        unit="周"
                        color="secondary"
                      />
                      <MilestoneCard
                        label="工作月数"
                        value={Math.floor(joinedDays / 30)}
                        unit="月"
                        color="accent"
                      />
                      <MilestoneCard
                        label="工作年数"
                        value={Math.floor(joinedDays / 365)}
                        unit="年"
                        color="primary"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* 底部装饰 */}
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-accent mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">
              感谢您为公司做出的贡献 🎉
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MilestoneCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div className={`p-4 rounded-lg border border-${color}/20 bg-${color}/5 text-center`}>
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className={`text-3xl font-bold text-${color}`}>
        {value}
        <span className="text-lg ml-1">{unit}</span>
      </div>
    </div>
  );
}
