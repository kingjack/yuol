import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Calendar, FileText, MessageSquare, Users, TrendingUp, Sparkles } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen dramatic-gradient">
      {/* 导航栏 */}
      <nav className="cinematic-blur border-b border-border/50 sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold glow-text">公司内部社区</h1>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/posts">
                    <Button variant="ghost">动态</Button>
                  </Link>
                  <Link href="/articles">
                    <Button variant="ghost">文章</Button>
                  </Link>
                  <Link href="/calendar">
                    <Button variant="ghost">老黄历</Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="default">个人中心</Button>
                  </Link>
                </>
              ) : (
                <a href={getLoginUrl()}>
                  <Button variant="default">登录</Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 英雄区域 */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 geometric-accent opacity-50" />
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-bold mb-6 glow-text">
              连接每一位同事
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              在这里分享想法、发布文章、查看老黄历，打造充满活力的企业文化
            </p>
            {!isAuthenticated && (
              <a href={getLoginUrl()}>
                <Button size="lg" className="text-lg px-8 py-6 dramatic-shadow">
                  立即加入
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 功能特性 */}
      <section className="py-20 relative">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cinematic-blur dramatic-shadow border-border/50 hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-6">
                <MessageSquare className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">即时动态</h3>
                <p className="text-muted-foreground">
                  发布工作动态、分享生活点滴，与同事实时互动交流
                </p>
              </CardContent>
            </Card>

            <Card className="cinematic-blur dramatic-shadow border-border/50 hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-6">
                <FileText className="w-12 h-12 text-secondary mb-4" />
                <h3 className="text-xl font-bold mb-2">深度文章</h3>
                <p className="text-muted-foreground">
                  撰写专业文章、分享技术经验，构建知识库
                </p>
              </CardContent>
            </Card>

            <Card className="cinematic-blur dramatic-shadow border-border/50 hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-6">
                <Calendar className="w-12 h-12 text-accent mb-4" />
                <h3 className="text-xl font-bold mb-2">每日黄历</h3>
                <p className="text-muted-foreground">
                  查看传统老黄历，为工作生活增添一份仪式感
                </p>
              </CardContent>
            </Card>

            <Card className="cinematic-blur dramatic-shadow border-border/50 hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-6">
                <Users className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">员工信息</h3>
                <p className="text-muted-foreground">
                  展示个人资料、入职时长，增进团队了解
                </p>
              </CardContent>
            </Card>

            <Card className="cinematic-blur dramatic-shadow border-border/50 hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-6">
                <TrendingUp className="w-12 h-12 text-secondary mb-4" />
                <h3 className="text-xl font-bold mb-2">互动系统</h3>
                <p className="text-muted-foreground">
                  点赞、评论、收藏，让优质内容获得更多关注
                </p>
              </CardContent>
            </Card>

            <Card className="cinematic-blur dramatic-shadow border-border/50 hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-6">
                <Sparkles className="w-12 h-12 text-accent mb-4" />
                <h3 className="text-xl font-bold mb-2">智能搜索</h3>
                <p className="text-muted-foreground">
                  快速查找帖子、文章和同事，高效获取信息
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="py-8 border-t border-border/50 cinematic-blur">
        <div className="container text-center text-muted-foreground">
          <p>© 2024 公司内部社区. 让每一天都充满创意与活力</p>
        </div>
      </footer>
    </div>
  );
}
