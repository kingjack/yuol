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

    // 2. 生成新数据
    const today = new Date().toISOString().slice(0, 10);
    const styles = [
      { title: '清纯校花', prompt: 'beautiful asian school girl, pure face, black hair, natural makeup, soft sunlight, high school uniform, 8k photography' },
      { title: '职场丽人', prompt: 'professional asian business woman, office lady, white shirt, elegant smile, modern office background, cinematic lighting, photorealistic' },
      { title: '古风汉服', prompt: 'chinese traditional hanfu girl, ancient style, elegant, garden background, ethereal, masterpiece, best quality' },
      { title: '街拍潮流', prompt: 'trendy asian fashion model, street snap, shanghai street background, stylish outfit, cool vibe, 35mm film look' },
      { title: '运动活力', prompt: 'fit asian girl, gym wear, yoga, healthy lifestyle, sweat, energetic smile, bright lighting, realistic skin texture' }
    ];

    const newItems = [];

    for (let i = 0; i < styles.length; i++) {
      const style = styles[i];
      const seed = `${today}-${i}`; // 确保当天图片一致
      // 使用 Pollinations API
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(style.prompt)}?width=1200&height=600&nologo=true&seed=${seed}&model=flux-realism`;

      const item = {
        title: style.title,
        imageUrl: imageUrl,
        linkUrl: '#',
        order: i,
        isActive: true
      };

      await createCarousel(item);
      newItems.push(item);
    }

    console.log(`[Carousel] Created ${newItems.length} new images.`);
    return newItems;
  },

  // 保留旧方法以兼容（如果还有其他地方用到），或者直接移除
  // 既然 routers.ts 只有 resetAndFillBeautyImages，我们可以只保留这个，
  // 但为了安全起见，如果不确定是否被移除，可以暂时不导出或者删掉旧代码。
  // 鉴于 user request 是 fix missing method，我会完全替换内容以匹配需求。
};

