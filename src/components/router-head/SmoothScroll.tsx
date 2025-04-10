import { component$, useVisibleTask$, useSignal } from '@builder.io/qwik';

export const SmoothScroll = component$(() => {
  const currentScrollY = useSignal(0);
  const targetScrollY = useSignal(0);
  const scrolling = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    // 取得當前滾動位置
    currentScrollY.value = window.scrollY;
    targetScrollY.value = window.scrollY;
    
    const smoothScroll = () => {
      // 減速係數
      const ease = 0.08;
      // 計算當前滾動位置與目標位置的差距
      const diff = targetScrollY.value - currentScrollY.value;
      
      // 忽略差距過小的變化
      if (Math.abs(diff) < 0.05) {
        currentScrollY.value = targetScrollY.value;
        scrolling.value = false;
        return;
      }
      
      // 計算新的滾動位置
      currentScrollY.value += diff * ease;
      window.scrollTo(0, currentScrollY.value);
      // 執行下一幀
      requestAnimationFrame(smoothScroll);
    };
    
    const handleWheel = (e: WheelEvent) => {
      // 阻止預設行為
      e.preventDefault();
      // 更新目標滾動位置
      targetScrollY.value += e.deltaY;
      
      // 限制目標滾動位置，確保不會超出頁面邊界
      targetScrollY.value = Math.max(0, Math.min(
        document.documentElement.scrollHeight - window.innerHeight,
        targetScrollY.value
      ));
      
      // 避免動畫重複執行
      if (!scrolling.value) {
        scrolling.value = true;
        requestAnimationFrame(smoothScroll);
      }
    };

    // 監聽頁面滾動，更新狀態
    const handleScroll = () => {
      if (!scrolling.value) {
        currentScrollY.value = window.scrollY;
        targetScrollY.value = window.scrollY;
      }
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
    };
  });
  
  return null; 
}); 