import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, Sparkles, Eye, Heart, MessageCircle, PenSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function Articles() {
  const { isAuthenticated } = useAuth();
  const { data: articles, isLoading } = trpc.articles.list.useQuery({
    limit: 20,
    offset: 0,
    // publishedOnly 字段不在接口定义中，暂移除
  });

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
                <Sparkles className="w-6 h-6 text-secondary" />
                <h1 className="text-xl font-bold">文章专栏</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/posts">
                <Button variant="ghost">动态</Button>
              </Link>
              <Link href="/calendar">
                <Button variant="ghost">老黄历</Button>
              </Link>
              {isAuthenticated && (
                <>
                  <Link href="/articles/new">
                    <Button variant="default" className="gap-2">
                      <PenSquare className="w-4 h-4" />
                      写文章
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="outline">个人中心</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">加载中...</div>
          ) : articles && articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <Card className="cinematic-blur border-border/50">
              <CardContent className="py-12 text-center text-muted-foreground">
                还没有文章，快来发布第一篇吧！
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article }: { article: any }) {
  return (
    <Link href={`/articles/${article.id}`}>
      <Card className="cinematic-blur dramatic-shadow border-border/50 hover:border-secondary/50 transition-all h-full cursor-pointer">
        {article.coverImage && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader>
          <h3 className="font-bold text-xl line-clamp-2">{article.title}</h3>
          {article.summary && (
            <p className="text-muted-foreground text-sm line-clamp-2 mt-2">
              {article.summary}
            </p>
          )}
        </CardHeader>
        <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {article.viewsCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {article.likesCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {article.commentsCount || 0}
            </span>
          </div>
          <span>
            {formatDistanceToNow(new Date(article.createdAt), {
              addSuffix: true,
              locale: zhCN,
            })}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
