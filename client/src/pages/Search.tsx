import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search as SearchIcon } from 'lucide-react';

export default function Search() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // 初始化时从 URL 获取搜索参数
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setQuery(q);
      setSearchQuery(q);
    }
  }, []);
  
  const { data: results, isLoading } = trpc.search.all.useQuery(
    { query: searchQuery, limit: 30 },
    { enabled: !!searchQuery }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchQuery(query);
      // 更新 URL，方便分享
      const newUrl = `/search?q=${encodeURIComponent(query)}`;
      window.history.pushState(null, '', newUrl);
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
          <div className="flex gap-4">
            <button onClick={() => setLocation('/')} className="text-gray-300 hover:text-white">
              首页
            </button>
            <button onClick={() => setLocation('/posts')} className="text-gray-300 hover:text-white">
              动态
            </button>
            <button onClick={() => setLocation('/articles')} className="text-gray-300 hover:text-white">
              文章
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* 搜索框 */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="搜索帖子、文章、员工..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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

        {!searchQuery ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">输入关键词开始搜索</p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">搜索中...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 帖子搜索结果 */}
            {results?.posts && results.posts.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-orange-500/30">
                  动态 ({results.posts.length})
                </h2>
                <div className="space-y-3">
                  {results.posts.map((post) => (
                    <Card
                      key={post.id}
                      className="bg-slate-800/50 border-orange-500/10 hover:border-orange-500/30 cursor-pointer transition-all"
                      onClick={() => setLocation(`/posts/${post.id}`)}
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={post.author?.avatar || ''} />
                            <AvatarFallback>{post.author?.name?.[0] || '用'}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-300">{post.author?.name || '用户'}</span>
                        </div>
                        <p className="text-gray-200 line-clamp-2">{post.content}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 文章搜索结果 */}
            {results?.articles && results.articles.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-orange-500/30">
                  文章 ({results.articles.length})
                </h2>
                <div className="space-y-3">
                  {results.articles.map((article) => (
                    <Card
                      key={article.id}
                      className="bg-slate-800/50 border-orange-500/10 hover:border-orange-500/30 cursor-pointer transition-all"
                      onClick={() => setLocation(`/articles/${article.id}`)}
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={article.author?.avatar || ''} />
                            <AvatarFallback>{article.author?.name?.[0] || '用'}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-300">{article.author?.name || '用户'}</span>
                        </div>
                        <h3 className="font-semibold text-white mb-1">{article.title}</h3>
                        <p className="text-gray-300 text-sm line-clamp-2">{article.summary || article.content.substring(0, 100)}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 员工搜索结果 */}
            {results?.users && results.users.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-orange-500/30">
                  员工 ({results.users.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.users.map((user) => (
                    <Card
                      key={user.id}
                      className="bg-slate-800/50 border-orange-500/10 hover:border-orange-500/30 cursor-pointer transition-all p-4"
                      onClick={() => setLocation(`/profile/${user.id}`)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar || ''} />
                          <AvatarFallback>{user.name?.[0] || '用'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-white">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.position || '员工'}</p>
                        </div>
                      </div>
                      {user.department && (
                        <p className="text-sm text-gray-400 mb-2">{user.department}</p>
                      )}
                      {user.email && (
                        <p className="text-xs text-gray-500">{user.email}</p>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 无结果提示 */}
            {(!results?.posts || results.posts.length === 0) &&
              (!results?.articles || results.articles.length === 0) &&
              (!results?.users || results.users.length === 0) && (
                <div className="text-center py-12">
                  <p className="text-gray-400">未找到相关结果</p>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
