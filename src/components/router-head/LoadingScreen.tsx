import { component$, useSignal, useVisibleTask$, useStyles$, type PropFunction } from '@builder.io/qwik';

export interface LoadingScreenProps {
  onLoadingComplete$: PropFunction<() => void>;
}

export const LoadingScreen = component$<LoadingScreenProps>(({ onLoadingComplete$ }) => {
  const loadingProgress = useSignal(0);
  const isComplete = useSignal(false);
  const imagesLoaded = useSignal(0);
  const totalImages = useSignal(5); //總共五張圖片
  
  useStyles$(`
    @keyframes fadeOut {
      0% { opacity: 1; }
      100% { opacity: 0; visibility: hidden; }
    }
    
    .loading-screen-fade-out {
      animation: fadeOut 0.8s ease-in-out forwards;
    }
  `);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => isComplete.value);
    
    if (isComplete.value) {
      // 動畫結束後觸發
      setTimeout(() => {
        onLoadingComplete$();
      }, 800);
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const preloadImages = () => {
      const imagePaths = [
        '/parallaxImg/1.webp',
        '/parallaxImg/2.webp',
        '/parallaxImg/3.webp',
        '/parallaxImg/4.webp',
        '/parallaxImg/5.webp'
      ];
      let loadedCount = 0;
      
      imagePaths.forEach(path => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
          loadedCount++;
          imagesLoaded.value = loadedCount;
          loadingProgress.value = Math.floor((loadedCount / totalImages.value) * 100);
          
          // 當所有圖片加載完成
          if (loadedCount === totalImages.value) {
            // 等待時間顯示100%
            setTimeout(() => {
              isComplete.value = true;
            }, 500);
          }
        };
      });
    };

    preloadImages();
  });

  return (
    <div 
      class={`fixed top-0 left-0 w-full h-full bg-stone-900 z-50 flex flex-col justify-center items-center ${isComplete.value ? 'loading-screen-fade-out' : ''}`}
    >
      <div class="w-64 md:w-96 mb-8 flex flex-col items-center">
        <div class="w-full h-2 md:h-3 bg-gray-700 rounded-full overflow-hidden">
          <div 
            class="h-full bg-white transition-all duration-300 ease-out rounded-full"
            style={{ width: `${loadingProgress.value}%` }}
          ></div>
        </div>
        <div class="mt-4 text-white text-xl md:text-2xl font-mono">
          {loadingProgress.value}%
        </div>
      </div>
      
      <div class="text-white text-center px-4">
        <p class="text-lg md:text-xl opacity-70">Exploring Türkiye Through the Lens</p>
      </div>
    </div>
  );
}); 