import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';

export default function ArticleEditor() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createArticle = trpc.articles.create.useMutation({
    onSuccess: () => {
      toast.success('文章发布成功!');
      setTitle('');
      setContent('');
      setLocation('/articles');
    },
    onError: (error) => {
      toast.error(`发布失败: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('请先登录');
      return;
    }

    if (!title.trim()) {
      toast.error('请输入文章标题');
      return;
    }

    if (!content.trim()) {
      toast.error('请输入文章内容');
      return;
    }

    setIsSubmitting(true);
    try {
      await createArticle.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        categoryId: 1, // 默认分类
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
        <div className="container mx-auto px-4">
          <Card className="bg-slate-800/50 border-orange-500/20 p-8 text-center">
            <p className="text-gray-300 mb-4">请先登录才能发布文章</p>
            <Button
              onClick={() => setLocation('/')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              返回首页
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6 flex items-center gap-2">
          <Button
            onClick={() => setLocation('/articles')}
            variant="outline"
            size="sm"
            className="border-orange-500/20 hover:border-orange-500/50"
          >
            <ChevronLeft size={18} />
            返回
          </Button>
          <h1 className="text-3xl font-bold text-white">写文章</h1>
        </div>

        <Card className="bg-slate-800/50 border-orange-500/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                文章标题 *
              </label>
              <Input
                type="text"
                placeholder="输入文章标题..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-slate-700/50 border-orange-500/20 text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                文章内容 *
              </label>
              <textarea
                placeholder="输入文章内容..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="w-full bg-slate-700/50 border border-orange-500/20 rounded-md px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
              />
              <p className="text-xs text-gray-400 mt-2">
                支持Markdown格式 (可选)
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isSubmitting ? '发布中...' : '发布文章'}
              </Button>
              <Button
                type="button"
                onClick={() => setLocation('/articles')}
                variant="outline"
                className="border-orange-500/20 hover:border-orange-500/50"
              >
                取消
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
