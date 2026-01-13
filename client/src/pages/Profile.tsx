import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Sparkles, Calendar, Briefcase, Mail, User, Bell } from "lucide-react";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function Profile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: notifications } = trpc.notifications.list.useQuery(
    { unreadOnly: true },
    { enabled: !!user }
  );

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

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  // 计算入职天数
  const joinedDays = user.joinedAt
    ? differenceInDays(new Date(), new Date(user.joinedAt))
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
                <h1 className="text-xl font-bold">个人中心</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/posts">
                <Button variant="ghost">动态</Button>
              </Link>
              <Link href="/articles">
                <Button variant="ghost">文章</Button>
              </Link>
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
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 用户信息卡片 */}
          <Card className="cinematic-blur dramatic-shadow border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="bg-primary/20 text-primary text-3xl">
                    {user.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{user.name || "未设置姓名"}</h2>
                    {user.role === "admin" && (
                      <Badge variant="default" className="bg-primary">
                        管理员
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-muted-foreground">
                    {user.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                    )}
                    {user.department && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        <span>{user.department}</span>
                        {user.position && <span>· {user.position}</span>}
                      </div>
                    )}
                    {user.joinedAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          入职 {formatDistanceToNow(new Date(user.joinedAt), { locale: zhCN })}
                          {joinedDays > 0 && ` (${joinedDays} 天)`}
                        </span>
                      </div>
                    )}
                  </div>

                  {user.bio && (
                    <p className="mt-4 text-foreground/80">{user.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 入职里程碑 */}
          {user.joinedAt && (
            <Card className="cinematic-blur dramatic-shadow border-border/50">
              <CardHeader>
                <h3 className="text-xl font-bold">入职里程碑</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

          {/* 快捷操作 */}
          <Card className="cinematic-blur dramatic-shadow border-border/50">
            <CardHeader>
              <h3 className="text-xl font-bold">快捷操作</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Link href="/posts">
                  <Button variant="outline" className="w-full">
                    我的动态
                  </Button>
                </Link>
                <Link href="/articles">
                  <Button variant="outline" className="w-full">
                    我的文章
                  </Button>
                </Link>
                <Link href="/bookmarks">
                  <Button variant="outline" className="w-full">
                    我的收藏
                  </Button>
                </Link>
                <Link href="/notifications">
                  <Button variant="outline" className="w-full">
                    通知中心
                  </Button>
                </Link>
                <Link href="/calendar">
                  <Button variant="outline" className="w-full">
                    查看黄历
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleLogout} className="w-full">
                  退出登录
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 装饰元素 */}
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
