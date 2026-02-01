import { clearAllCarousels, createCarousel } from '../db';

interface CarouselItem {
  title: string;
  imageUrl: string;
  linkUrl: string;
  order: number;
  isActive: boolean;
}

export const carouselService = {
  async resetAndFillBeautyImages() {
    console.log("[Carousel] Resetting and filling beauty images...");
    
    // 1. 清除现有轮播图
    await clearAllCarousels();

    // 2. 使用 Unsplash Source API (免费、稳定、高质量)
    const carouselItems = [
      {
        title: '团队协作',
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop',
        linkUrl: '#',
        order: 0,
        isActive: true
      },
      {
        title: '创新思维',
        imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=600&fit=crop',
        linkUrl: '#',
        order: 1,
        isActive: true
      },
      {
        title: '高效办公',
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop',
        linkUrl: '#',
        order: 2,
        isActive: true
      },
      {
        title: '技术分享',
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=600&fit=crop',
        linkUrl: '#',
        order: 3,
        isActive: true
      },
      {
        title: '轻松氛围',
        imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=600&fit=crop',
        linkUrl: '#',
        order: 4,
        isActive: true
      }
    ];

    const newItems = [];

    for (const item of carouselItems) {
      await createCarousel(item);
      newItems.push(item);
    }

    console.log(`[Carousel] Created ${newItems.length} new images.`);
    return newItems;
  },
};

