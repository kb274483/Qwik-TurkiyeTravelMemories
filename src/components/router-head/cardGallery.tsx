import { 
  component$, 
  type PropFunction, 
  useVisibleTask$, 
  useSignal,
  $
} from "@builder.io/qwik";

interface CardGalleryProps {
  photoProps : {
    id: string;
    photos: {
      url: string;
      info: string;
    }[];
  } | null;
  closeGallery: PropFunction<() => void>;
}

interface GridPosition {
  x: number;
  y: number;
  z: number;
  rotateY: number;
}

interface LightBoxProps {
  url: string | null;
  info: string | null;
  closeLightBox: PropFunction<() => void>;
}

// 照片尺寸和間距
const PHOTO_WIDTH = 320; // 照片寬度 
const PHOTO_HEIGHT = 240; // 照片高度
const GRID_SPACING = 0; // 網格間距

export const LightBox = component$<LightBoxProps>(({url, info, closeLightBox})=>{
  const imageLoading = useSignal(true);
  const infoDisplay = useSignal(false);
  return (
    <div class="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-16">
      <div class="absolute w-1/2 h-1/2 rounded-lg transition-all duration-500 ease-in-out bg-white z-10"
        style={{
          opacity: infoDisplay.value ? 1 : 0,
          bottom : infoDisplay.value ? 20 : 100,
          right : infoDisplay.value ? 20 : 100,
        }}
      > 
        <p class="absolute bottom-0 right-0 p-2 text-end text-xl text-gray-600">
          {info}
        </p>
      </div>
      <img src={url || ''}
        key={url}
        alt="Photo" 
        width={1920} 
        height={1080} 
        class="relative z-50 w-full h-full object-cover rounded-lg"
        onLoad$={()=>{
          imageLoading.value = false
          setTimeout(()=>infoDisplay.value = true , 800)
        }}
      />
      <div class="w-full h-full bg-gray-400/50 animate-pulse transition-opacity duration-500 ease-in-out absolute top-0 left-0"
        style={{
          display: imageLoading.value ? 'block' : 'none',
        }}
      ></div>
      <div class="absolute top-4 flex justify-center items-center">
        <button onClick$={closeLightBox} 
          class="text-white cursor-pointer text-2xl w-12 h-12 font-bold rounded-full bg-white/20 p-2">X</button>
      </div>
    </div>
  )
})  

export const CardGallery = component$<CardGalleryProps>(({ photoProps, closeGallery }) => {
  const visible = useSignal(false);
  // 儲存每張相片的最終位置
  const gridPositions = useSignal<GridPosition[]>([]);
  const lightBoxUrl = useSignal<string | null>(null);
  const lightBoxVisible = useSignal(false);
  const lightBoxInfo = useSignal<string | null>(null);

  const getSmallPhotoUrl = (url: string) => {
    return url.replace('upload/','upload/t_smell/')
  };
  const photoLightBox = $((url:string, info:string)=>{
    lightBoxUrl.value = url;
    lightBoxVisible.value = true;
    lightBoxInfo.value = info;  
  })

  const closeLightBox = $(()=>{
    lightBoxVisible.value = false;
    lightBoxUrl.value = null;
  })

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    // 禁止滾動
    document.body.style.overflow = 'hidden';

    // gridPositions 是空的（表示首次），計算網格位置
    if (photoProps && gridPositions.value.length === 0) {
      const photos = photoProps.photos;
      const newPositions: GridPosition[] = [];
      
      const createGridSystem = (photosCount: number) => {
        // 計算網格大小 (根據照片數量)
        const photosPerRow = Math.ceil(Math.sqrt(photosCount));
        const rows = Math.ceil(photosCount / photosPerRow);
        
        // 計算網格總寬度和高度
        const totalWidth = photosPerRow * (PHOTO_WIDTH + GRID_SPACING);
        const totalHeight = rows * (PHOTO_HEIGHT + GRID_SPACING);
        
        const gridCells: {row: number; col: number; used: boolean}[] = [];
        
        // 建立網格
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < photosPerRow; col++) {
            if (gridCells.length < photosCount) {
              gridCells.push({ row, col, used: false });
            }
          }
        }
        
        // 網格順序隨機分配
        shuffleArray(gridCells);
        
        // 為每張照片分配網格位置
        for (let i = 0; i < photosCount; i++) {
          const cell = gridCells[i];
          
          // 計算基礎網格位置
          const baseX = (cell.col * (PHOTO_WIDTH + GRID_SPACING)) - totalWidth / 2 + PHOTO_WIDTH / 2;
          const baseY = (cell.row * (PHOTO_HEIGHT + GRID_SPACING)) - totalHeight / 2 + PHOTO_HEIGHT / 2;
          
          // 隨機偏移
          const randomOffsetX = Math.random() * GRID_SPACING - GRID_SPACING / 2;
          const randomOffsetY = Math.random() * GRID_SPACING - GRID_SPACING / 2;
          const randomZ = Math.random() * 200 - 50;
          const randomRotateY = Math.random() * 20 - 10;

          newPositions.push({
            x: baseX + randomOffsetX,
            y: baseY + randomOffsetY,
            z: randomZ,
            rotateY: randomRotateY
          });
        }
        
        return newPositions;
      };
      
      const shuffleArray = (array: any[]) => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      };
      
      gridPositions.value = createGridSystem(photos.length);
    }

    // 使用 requestAnimationFrame 確保狀態更新後再觸發動畫
    requestAnimationFrame(() => {
      visible.value = true;
    });

     // 使用 cleanup 函數確保組件銷毀時恢復 body 滾動
    cleanup(() => {
      document.body.style.overflow = 'auto';
    });
   });

  return (
    <div id="gallery-container"
      class="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center"
      style={{
        opacity: visible.value ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }}
    >
      <div class="absolute top-4 right-4 z-50">
        <button onClick$={() => {
          visible.value = false;
          setTimeout(() => {
            closeGallery()
          }, 800);
        }}
          class="text-white cursor-pointer text-2xl w-12 h-12 font-bold rounded-full bg-white/20 p-2"
        >
          X
        </button>
      </div>
      <div 
        class="relative w-full h-full" 
        style={styles.perspective}
      >
        {photoProps?.photos.map((photo, index) => {
          // 初始動畫屬性
          const initialAngle = (index / (photoProps.photos.length || 1)) * 360 + Math.random() * 40 - 20;
          const initialRadius = 800 + Math.random() * 400;
          const initialZ = -600 - Math.random() * 600;
          const initialRotateY = initialAngle + Math.random() * 90 - 45;
          const delay = index * 40 + Math.random() * 30;
          const duration = 700 + Math.random() * 300;

          // 獲取相片的最終位置
          const finalPos = gridPositions.value[index] || { x: 0, y: 0, z: 0, rotateY: 0 };

          // 定義初始和最終的 transform 狀態
          const initialTransform = `translate3d(${Math.cos(initialAngle * Math.PI / 180) * initialRadius}px, ${Math.sin(initialAngle * Math.PI / 180) * initialRadius}px, ${initialZ}px) rotateY(${initialRotateY}deg)`;
          const finalTransform = `translate3d(${finalPos.x}px, ${finalPos.y}px, ${finalPos.z}px) rotateY(${finalPos.rotateY}deg)`;

          return (
            <div
              key={photo.url}
              class="absolute w-72 h-48 rounded shadow-lg overflow-hidden border-b-4 border-r-4 border-white/50"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: `-${PHOTO_WIDTH / 2}px`, 
                marginTop: `-${PHOTO_HEIGHT / 2}px`,
                transform: visible.value ? finalTransform : initialTransform,
                transition: `transform ${duration}ms ease-out ${delay}ms`,
              }}
            >
              <img
                src={getSmallPhotoUrl(photo.url)}
                onClick$={()=>photoLightBox(photo.url, photo.info)}
                alt={photo.info || `Gallery image ${index + 1}`}
                width={PHOTO_WIDTH} 
                height={PHOTO_HEIGHT}
                class="w-full h-full object-cover cursor-pointer hover:scale-110 transition-all duration-800 ease-in-out"
                loading="lazy"
              />
            </div>
          );
        })}
      </div>
      {
        lightBoxVisible.value &&
        <LightBox 
          url={lightBoxUrl.value || ''} 
          info={lightBoxInfo.value || null}
          closeLightBox={closeLightBox}
        />
      }
    </div>
  );
});

// perspective 樣式
const styles = {
  perspective : {
    perspective: '1200px', // 視角距離
    transformStyle: 'preserve-3d' as const, // 子元素保持 3D
    width: '100%',
    height: '100%',
    position: 'relative' as const,
  }
}

