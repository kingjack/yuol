import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserAvatarWithTags } from '@/components/UserAvatarWithTags';

import { Carousel } from '@/components/Carousel';
import { Search as SearchIcon, Heart, MessageCircle, Bookmark } from 'lucide-react';

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: postsRaw } = trpc.posts.list.useQuery({ limit: 10, offset: 0 });
  const { data: articlesRaw } = trpc.articles.list.useQuery({ limit: 10 });
  const { data: carousels } = trpc.carousels.list.useQuery();
  const { data: heartVoicesRaw } = trpc.heartVoices.list.useQuery({ limit: 6, offset: 0 });
  
  // 获取心声社区内容作者信息
  const heartVoices = heartVoicesRaw?.map(voice => ({
    ...voice,
    author: { id: voice.authorId, name: '用户', avatar: null }
  }));

  // 获取帖子作者信息
  const posts = postsRaw?.map(post => ({
    ...post,
    author: { id: post.authorId, name: '用户' }
  }));

  // 获取文章作者信息
  const articles = articlesRaw?.map(article => ({
    ...article,
    author: { id: article.authorId, name: '用户' }
  }));

  // 获取老黄历数据（模拟）
  const today = new Date();
  const lunarData = {
    date: `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`,
    dayOfWeek: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][today.getDay()],
    suitable: ['开会', '写代码', '提交PR', 'Code Review'],
    unsuitable: ['加班', '删库', '改需求', '线上调试'],
    luckyColor: '深紫色',
    luckyNumber: 9,
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800">
      {/* 导航栏 */}
      <nav className="bg-slate-900/80 backdrop-blur border-b border-orange-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">✦</span>
            </div>
            <h1 className="text-xl font-bold text-white">内部社区</h1>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={() => setLocation('/posts')} className="text-gray-300 hover:text-white transition-colors">
              动态
            </button>
            <button onClick={() => setLocation('/articles')} className="text-gray-300 hover:text-white transition-colors">
              文章
            </button>
            <button onClick={() => setLocation('/calendar')} className="text-gray-300 hover:text-white transition-colors">
              老黄历
            </button>
            <button onClick={() => setLocation('/heart-voices')} className="text-gray-300 hover:text-white transition-colors">
              心声社区
            </button>
            {isAuthenticated ? (
              <button onClick={() => setLocation('/profile')} className="text-orange-400 hover:text-orange-300 transition-colors">
                个人中心
              </button>
            ) : (
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => setLocation('/login')}
              >
                登录 / 注册
              </Button>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* 搜索框 */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="搜索文章、动态、员工信息..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border-orange-500/30 text-white placeholder-gray-400 rounded-lg focus:border-orange-500"
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white"
            >
              搜索
            </Button>
          </div>
        </form>

        {/* 主内容区 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* 左侧：轮播图 */}
          <div>
            <Carousel />
          </div>

          {/* 右侧：老黄历 */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-orange-500/20 rounded-lg p-6 h-fit">
            <h3 className="text-lg font-bold text-orange-400 mb-4">📅 今日黄历</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">日期</p>
                <p className="text-white font-semibold">{lunarData.date} {lunarData.dayOfWeek}</p>
              </div>

              <div>
                <p className="text-green-400 text-sm font-semibold mb-2">✓ 宜</p>
                <div className="space-y-1">
                  {lunarData.suitable.map((item, i) => (
                    <p key={i} className="text-gray-300 text-sm">{item}</p>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-red-400 text-sm font-semibold mb-2">✗ 忌</p>
                <div className="space-y-1">
                  {lunarData.unsuitable.map((item, i) => (
                    <p key={i} className="text-gray-300 text-sm">{item}</p>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-orange-500/10">
                <div>
                  <p className="text-gray-400 text-xs">幸运颜色</p>
                  <p className="text-orange-400 font-semibold">{lunarData.luckyColor}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">幸运数字</p>
                  <p className="text-orange-400 font-semibold">{lunarData.luckyNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 灌水动态内容列表 */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">💬 灌水广场</h2>
            {isAuthenticated && (
              <Button
                onClick={() => setLocation('/posts')}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                发布动态
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {!posts || posts.length === 0 ? (
              <Card className="bg-slate-800/50 border-orange-500/10 p-6 text-center">
                <p className="text-gray-400">还没有动态，快来发布第一条吧!</p>
              </Card>
            ) : (
              posts.slice(0, 5).map((post) => (
                <Card
                  key={post.id}
                  className="bg-slate-800/50 border-orange-500/10 hover:border-orange-500/30 cursor-pointer transition-all p-4"
                  onClick={() => setLocation(`/posts/${post.id}`)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <UserAvatarWithTags 
                      user={{ 
                        id: post.authorId,
                        name: `用户${post.authorId}`,
                        username: `user${post.authorId}` 
                      }} 
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-white">用户{post.authorId}</p>
                      <p className="text-xs text-gray-400">不到1分钟前</p>
                    </div>
                  </div>
                  <p className="text-gray-200 mb-3 line-clamp-2">{post.content}</p>
                  <div className="flex gap-6 text-gray-400 text-sm">
                    <button className="flex items-center gap-1 hover:text-orange-400 transition-colors">
                      <Heart size={16} />
                      <span>{post.likesCount}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-orange-400 transition-colors">
                      <MessageCircle size={16} />
                      <span>{post.commentsCount}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-orange-400 transition-colors">
                      <Bookmark size={16} />
                      <span>{post.bookmarksCount}</span>
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* 文章列表（按评论数排序） */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">📝 热门文章</h2>
            <Button
              onClick={() => setLocation('/articles')}
              variant="outline"
              className="text-orange-400 border-orange-500/30 hover:bg-orange-500/10"
            >
              查看全部
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!articles || articles.length === 0 ? (
              <Card className="bg-slate-800/50 border-orange-500/10 p-6 text-center md:col-span-2">
                <p className="text-gray-400">还没有文章，快来发布第一篇吧!</p>
              </Card>
            ) : (
              articles.slice(0, 4).map((article) => (
                <Card
                  key={article.id}
                  className="bg-slate-800/50 border-orange-500/10 hover:border-orange-500/30 cursor-pointer transition-all p-4"
                  onClick={() => setLocation(`/articles/${article.id}`)}
                >
                  <h3 className="font-semibold text-white mb-2 line-clamp-2">{article.title}</h3>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{article.summary || article.content.substring(0, 100)}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <UserAvatarWithTags 
                        user={{ 
                          id: article.authorId,
                          name: `用户${article.authorId}`,
                          username: `user${article.authorId}` 
                        }}
                        size="sm"
                      />
                      <span>用户{article.authorId}</span>
                    </div>
                    <div className="flex gap-3">
                      <span>💬 {article.commentsCount}</span>
                      <span>❤️ {article.likesCount}</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* 心声社区内容展示 */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">💕 心声社区</h2>
            <Button
              onClick={() => setLocation('/heart-voices')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              查看全部
            </Button>
          </div>
          
          {/* 心声社区内容卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {!heartVoices || heartVoices.length === 0 ? (
              <Card className="bg-slate-800/50 border-orange-500/10 p-6 text-center md:col-span-2 lg:col-span-3">
                <p className="text-gray-400">还没有心声,快来发布第一条吧!</p>
              </Card>
            ) : (
              heartVoices.slice(0, 3).map((voice) => (
                <Card
                  key={voice.id}
                  className="bg-slate-800/50 border-orange-500/10 hover:border-orange-500/30 cursor-pointer transition-all p-4"
                  onClick={() => setLocation(`/heart-voices/${voice.id}`)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <UserAvatarWithTags 
                      user={voice.isAnonymous ? { 
                        id: 0, 
                        name: '匿名用户', 
                        username: 'anonymous' 
                      } : { 
                        id: voice.author.id,
                        name: voice.author.name || `用户${voice.authorId}`,
                        username: `user${voice.authorId}`
                      }}
                      size="sm"
                      editable={!voice.isAnonymous}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-white">
                        {voice.isAnonymous ? "匿名用户" : voice.author.name || `用户${voice.authorId}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(voice.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <h3 className="font-semibold text-white mb-2 line-clamp-1">{voice.title}</h3>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{voice.content}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex gap-2">
                      {voice.age && <span>{voice.age}岁</span>}
                      {voice.gender && <span>{voice.gender === 'male' ? '男' : voice.gender === 'female' ? '女' : '其他'}</span>}
                    </div>
                    <div className="flex gap-3">
                      <span>💬 {voice.commentsCount}</span>
                      <span>❤️ {voice.likesCount}</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* 网站导航 */}
        <footer className="border-t border-orange-500/10 pt-8 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-white mb-3">功能</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-orange-400 transition-colors">发布动态</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">写文章</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">心声社区</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">发现</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-orange-400 transition-colors">热门动态</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">热门文章</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">员工目录</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">关于</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-orange-400 transition-colors">关于我们</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">联系我们</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">反馈建议</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">其他</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-orange-400 transition-colors">隐私政策</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">用户协议</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">免责声明</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-gray-500 text-sm border-t border-orange-500/10 pt-4">
            <p>&copy; 2025 快运社区. 所有权利保留.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
