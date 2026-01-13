import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Sparkles, Calendar as CalendarIcon } from "lucide-react";

// 简化的老黄历数据生成
function generateCalendarData(date: Date) {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  
  const yiList = [
    ["开会", "写代码", "提交PR", "Code Review"],
    ["部署上线", "修复Bug", "重构代码", "写文档"],
    ["团队建设", "技术分享", "学习新技术", "优化性能"],
    ["需求评审", "设计方案", "测试功能", "发版本"],
  ];
  
  const jiList = [
    ["加班", "删库", "改需求", "线上调试"],
    ["直接推送到主分支", "不写注释", "忽略警告", "跳过测试"],
    ["熬夜写代码", "周末加班", "临时改需求", "紧急发版"],
    ["不备份数据", "强制推送", "硬编码密码", "忽略安全"],
  ];
  
  const yi = yiList[dayOfYear % yiList.length];
  const ji = jiList[dayOfYear % jiList.length];
  
  const luckColors = ["焦橙色", "深青色", "星空蓝", "暗金色", "深紫色"];
  const luckNumbers = [1, 3, 5, 7, 9, 11, 13, 17, 19, 23];
  
  const luckColor = luckColors[dayOfYear % luckColors.length];
  const luckNumber = luckNumbers[dayOfYear % luckNumbers.length];
  
  const fortunes = [
    { label: "工作运", value: 60 + (dayOfYear % 40) },
    { label: "学习运", value: 50 + (dayOfYear % 50) },
    { label: "人际运", value: 55 + (dayOfYear % 45) },
    { label: "健康运", value: 65 + (dayOfYear % 35) },
  ];
  
  return { yi, ji, luckColor, luckNumber, fortunes };
}

export default function Calendar() {
  const [currentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<any>(null);

  useEffect(() => {
    setCalendarData(generateCalendarData(currentDate));
  }, [currentDate]);

  if (!calendarData) {
    return <div className="min-h-screen dramatic-gradient flex items-center justify-center">
      <div className="text-muted-foreground">加载中...</div>
    </div>;
  }

  const dateStr = currentDate.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
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
                <CalendarIcon className="w-6 h-6 text-accent" />
                <h1 className="text-xl font-bold">今日黄历</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/posts">
                <Button variant="ghost">动态</Button>
              </Link>
              <Link href="/articles">
                <Button variant="ghost">文章</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 日期显示 */}
          <Card className="cinematic-blur dramatic-shadow border-border/50 text-center">
            <CardHeader>
              <h2 className="text-3xl font-bold glow-text">{dateStr}</h2>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 宜 */}
            <Card className="cinematic-blur dramatic-shadow border-primary/30">
              <CardHeader>
                <h3 className="text-2xl font-bold text-primary text-center">宜</h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {calendarData.yi.map((item: string, index: number) => (
                    <li
                      key={index}
                      className="text-lg p-3 bg-primary/10 rounded-lg border border-primary/20"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* 忌 */}
            <Card className="cinematic-blur dramatic-shadow border-destructive/30">
              <CardHeader>
                <h3 className="text-2xl font-bold text-destructive text-center">忌</h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {calendarData.ji.map((item: string, index: number) => (
                    <li
                      key={index}
                      className="text-lg p-3 bg-destructive/10 rounded-lg border border-destructive/20"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* 幸运信息 */}
          <Card className="cinematic-blur dramatic-shadow border-border/50">
            <CardHeader>
              <h3 className="text-xl font-bold text-center">今日幸运</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-muted-foreground mb-2">幸运颜色</div>
                  <div className="text-2xl font-bold text-primary">{calendarData.luckColor}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-2">幸运数字</div>
                  <div className="text-2xl font-bold text-secondary">{calendarData.luckNumber}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 运势 */}
          <Card className="cinematic-blur dramatic-shadow border-border/50">
            <CardHeader>
              <h3 className="text-xl font-bold text-center">今日运势</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {calendarData.fortunes.map((fortune: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">{fortune.label}</span>
                      <span className="font-bold">{fortune.value}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                        style={{ width: `${fortune.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 温馨提示 */}
          <Card className="cinematic-blur dramatic-shadow border-accent/30">
            <CardContent className="py-6 text-center">
              <Sparkles className="w-8 h-8 text-accent mx-auto mb-3" />
              <p className="text-muted-foreground">
                黄历仅供娱乐参考，工作生活还需脚踏实地 💪
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
