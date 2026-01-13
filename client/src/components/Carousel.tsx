import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export function Carousel() {
  const { data: carousels, isLoading } = trpc.carousels.list.useQuery();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!carousels || carousels.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carousels.length);
    }, 5000); // 5秒自动切换

    return () => clearInterval(timer);
  }, [carousels]);

  if (isLoading || !carousels || carousels.length === 0) {
    return (
      <div className="w-full h-96 bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  const current = carousels[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + carousels.length) % carousels.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % carousels.length);
  };

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden group">
      {/* 轮播图容器 */}
      <div className="relative w-full h-full">
        {carousels.map((carousel, index) => (
          <div
            key={carousel.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={carousel.imageUrl}
              alt={carousel.title}
              className="w-full h-full object-cover"
            />
            {/* 深色遮罩 */}
            <div className="absolute inset-0 bg-black/40" />
            
            {/* 文字内容 */}
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <h3 className="text-2xl font-bold text-white mb-2">{carousel.title}</h3>
              {carousel.description && (
                <p className="text-gray-200 text-sm">{carousel.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 左右导航按钮 */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
        aria-label="上一张"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
        aria-label="下一张"
      >
        <ChevronRight size={24} />
      </button>

      {/* 指示点 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {carousels.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-orange-500 w-8'
                : 'bg-white/50 w-2 hover:bg-white/75'
            }`}
            aria-label={`切换到第${index + 1}张`}
          />
        ))}
      </div>
    </div>
  );
}
