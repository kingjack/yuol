import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useParams } from "wouter";
import { ArrowLeft, MapPin, User, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function HeartVoiceDetail() {
  const { id } = useParams();
  
  const voiceId = parseInt(id || "0");
  const { data: voice, isLoading } = trpc.heartVoices.get.useQuery(voiceId);

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
      </main>
    </div>
  );
}
