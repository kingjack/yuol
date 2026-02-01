import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

// 直接使用 Unsplash 图片数据，不通过 tRPC
const UNSPLASH_CAROUSELS = [
  {
    id: 1,
    title: '团队协作',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop&auto=format&q=80',
    description: '携手共进，创造无限可能'
  },
  {
    id: 2,
    title: '创新思维',
    imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=600&fit=crop&auto=format&q=80',
    description: '突破边界，探索全新可能'
  },
  {
    id: 3,
    title: '高效办公',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop&auto=format&q=80',
    description: '专注当下，成就卓越效率'
  },
  {
    id: 4,
    title: '技术分享',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=600&fit=crop&auto=format&q=80',
    description: '知识传递，共同成长'
  },
  {
    id: 5,
    title: '轻松氛围',
    imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=600&fit=crop&auto=format&q=80',
    description: '快乐工作，幸福生活'
  }
];

export function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // 模拟加载状态
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % UNSPLASH_CAROUSELS.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isLoading]);

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set([...prev, index]));
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + UNSPLASH_CAROUSELS.length) % UNSPLASH_CAROUSELS.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % UNSPLASH_CAROUSELS.length);
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="relative w-full h-96 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg overflow-hidden border border-orange-500/20">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  const current = UNSPLASH_CAROUSELS[currentIndex];

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden group border border-orange-500/20 shadow-2xl shadow-orange-500/10">
      {/* 轮播图容器 */}
      <div className="relative w-full h-full">
        {UNSPLASH_CAROUSELS.map((carousel, index) => (
          <div
            key={carousel.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            {imageErrors.has(index) ? (
              // 图片加载失败时的占位图
              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <ImageIcon size={64} className="text-orange-500/30" />
              </div>
            ) : (
              <img
                src={carousel.imageUrl}
                alt={carousel.title}
                className="w-full h-full object-cover"
                onError={() => handleImageError(index)}
                loading="eager"
              />
            )}
            
            {/* 渐变遮罩 - 更自然的过渡 */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
            
            {/* 文字内容 */}
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <div className="transform transition-transform duration-300 group-hover:translate-x-2">
                <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{carousel.title}</h3>
                {carousel.description && (
                  <p className="text-gray-200 text-sm drop-shadow">{carousel.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 左右导航按钮 - 更明显的样式 */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-lg hover:shadow-orange-500/50 transform hover:scale-110"
        aria-label="上一张"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-lg hover:shadow-orange-500/50 transform hover:scale-110"
        aria-label="下一张"
      >
        <ChevronRight size={24} />
      </button>

      {/* 指示点 - 更明显的样式 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        {UNSPLASH_CAROUSELS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-orange-500 w-8 shadow-lg shadow-orange-500/50'
                : 'bg-white/40 w-2 hover:bg-white/60 hover:w-4'
            }`}
            aria-label={`切换到第${index + 1}张`}
          />
        ))}
      </div>

      {/* 进度条 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500/20">
        <div 
          className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-100 ease-linear"
          style={{
            width: `${((currentIndex + 1) / UNSPLASH_CAROUSELS.length) * 100}%`
          }}
        />
      </div>
    </div>
  );
}
