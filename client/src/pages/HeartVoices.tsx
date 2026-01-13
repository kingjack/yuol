import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function HeartVoices() {
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    age: '',
    gender: '',
    location: '',
  });

  const { data: voices, isLoading, refetch } = trpc.heartVoices.list.useQuery({
    limit: 50,
    offset: 0,
  });

  const createMutation = trpc.heartVoices.create.useMutation({
    onSuccess: () => {
      toast.success('发布成功!');
      setFormData({ title: '', content: '', age: '', gender: '', location: '' });
      setShowForm(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.heartVoices.delete.useMutation({
    onSuccess: () => {
      toast.success('删除成功!');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('请填写标题和内容');
      return;
    }

    createMutation.mutate({
      title: formData.title,
      content: formData.content,
      age: formData.age ? parseInt(formData.age) : undefined,
      gender: (formData.gender as any) || undefined,
      location: formData.location || undefined,
    });
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
            <h1 className="text-xl font-bold text-white">心声社区</h1>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setLocation('/')} className="text-gray-300 hover:text-white">
              首页
            </button>
            <button onClick={() => setLocation('/posts')} className="text-gray-300 hover:text-white">
              动态
            </button>
            <button onClick={() => setLocation('/profile')} className="text-gray-300 hover:text-white">
              个人中心
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* 发布表单 */}
        {!showForm ? (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full mb-8 bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg"
          >
            发布心声 💬
          </Button>
        ) : (
          <Card className="bg-slate-800/50 border-orange-500/20 p-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-4">发布你的心声</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="标题 (必填)"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-orange-500/20 rounded text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
              />
              <textarea
                placeholder="内容 (必填)"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-slate-700 border border-orange-500/20 rounded text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
              />
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  placeholder="年龄 (可选)"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="px-4 py-2 bg-slate-700 border border-orange-500/20 rounded text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                />
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="px-4 py-2 bg-slate-700 border border-orange-500/20 rounded text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="">性别 (可选)</option>
                  <option value="male">男</option>
                  <option value="female">女</option>
                  <option value="other">其他</option>
                </select>
                <input
                  type="text"
                  placeholder="地点 (可选)"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="px-4 py-2 bg-slate-700 border border-orange-500/20 rounded text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {createMutation.isPending ? '发布中...' : '发布'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  取消
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* 心声列表 */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">加载中...</p>
            </div>
          ) : !voices || voices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">还没有心声，快来发布第一条吧!</p>
            </div>
          ) : (
            voices.map((voice) => (
              <Card
                key={voice.id}
                className="bg-slate-800/50 border-orange-500/10 hover:border-orange-500/30 transition-all p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={voice.author?.avatar || ''} />
                      <AvatarFallback>{voice.author?.name?.[0] || '用'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white">{voice.author?.name || '用户'}</p>
                      <p className="text-xs text-gray-400">
                        {voice.age && `${voice.age}岁`} {voice.gender && `·${voice.gender === 'male' ? '男' : voice.gender === 'female' ? '女' : '其他'}`} {voice.location && `·${voice.location}`}
                      </p>
                    </div>
                  </div>
                  {voice.author?.id && (
                    <button
                      onClick={() => deleteMutation.mutate({ id: voice.id })}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">{voice.title}</h3>
                <p className="text-gray-300 mb-4">{voice.content}</p>

                <div className="flex gap-6 text-gray-400 text-sm">
                  <button className="flex items-center gap-2 hover:text-orange-400 transition-colors">
                    <Heart size={16} />
                    <span>{voice.likesCount}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-orange-400 transition-colors">
                    <MessageCircle size={16} />
                    <span>{voice.commentsCount}</span>
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
