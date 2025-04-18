/* eslint-disable qwik/jsx-key */
import { component$, useVisibleTask$, useSignal, $, useTask$, useStyles$ } from '@builder.io/qwik';
import { CardGallery } from './cardGallery';
import introduceData from '../../assets/introduce.json';
import photoAlbum from '../../assets/photoAlbum.json';

interface City {
  id: string;
  name: string;
  x: number;
  y: number;
  appearAt: number;
}

interface PhotoAlbum {
  id: string;
  photos: {
    url: string;
    info: string;
  }[];
}

interface IntroduceData {
  [key: string]: {
    title: string;
    title_zh: string;
    text: string;
    text_zh: string;
  };
}

const typedIntroduceData = introduceData as IntroduceData;

interface cityPng {
  id: string;
  x: number;
  y: number;
  appearAt: number;
}

const CityImage = component$((props: {
  id: string;
  x: number;
  y: number;
  isAppear: boolean;
  onClick$: () => void;
}) => {
  
  return (
    <image
      onClick$={props.onClick$}
      class="city-image"
      href={`/images/${props.id}.PNG`}
      x={props.x}
      y={props.y}
      width="100"
      height="100"
      style={{
        animation: props.isAppear ? 
          'imageAppear 0.8s ease forwards' :
          'imageDisappear 0.8s ease forwards',
        transformOrigin: 'center center',
      }}
      preventdefault:animationend
      filter="url(#dropShadow)"
    />
  );
});

export const SvgMap = component$(() => {
  useStyles$(`
    .svg-map-container svg {
      width: 80%;
      height: auto;
      margin: 0 auto;
    }
    .svg-map-container svg path,
    .svg-map-container svg line,
    .svg-map-container svg circle,
    .svg-map-container svg rect {
      stroke-width: 2;
      transition: all 0.5s ease;
    }
    .city-image {
      transition: all 0.5s ease;
      cursor: pointer;
    }
    .city-image:hover {
      filter: brightness(1.2);
      translate: 0 -10px;
    }
    @keyframes imageAppear {
      0% {
        opacity: 0;
        transform: scale(0.5);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
    @keyframes imageDisappear {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(0.5);
      }
    }
    #text-container {
      width: 100%;
      height: 100%;
    }
    .text-fadeIn {
      animation: fadeInSlide 1s ease-out;
    }
    .text-container-left {
      position: absolute;
      top: 5%;
      left: 2%;
      width: 30%;
    }
    .text-container-right {
      position: absolute;
      bottom: 5%;
      right: 2%;
      width: 30%;
    }
    .text-content {
      background: rgba(50, 50, 50, 0.7);
      padding: 2rem;
      border-radius: 1rem;
      backdrop-filter: blur(10px);
    }
    .slide-left-text {
      opacity: 1;
      transform: translateX(0%);
      transition: all 0.5s ease;
    }
    .slide-right-text {
      opacity: 1;
      transform: translateX(0%);
      transition: all 0.5s ease;
    }
    .slide-left-text.active {
      opacity: 0;
      transform: translateX(-100%);
    }
    .slide-right-text.active {
      opacity: 0;
      transform: translateX(100%);
    }
    @keyframes fadeInSlide {
      0% {
        opacity: 0;
        transform: translateY(30px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `);
  const isVisible = useSignal(false);
  const isDrawing = useSignal(false);
  const scrollProgress = useSignal(0);
  const currentCityIndex = useSignal(0);
  const photoList = photoAlbum as PhotoAlbum[];
  const photoProps = useSignal<PhotoAlbum | null>(null);

  const cities: City[] = [
    { id: 'alacati', name: 'Alacati', x: 38, y: 206, appearAt: 0.20 },
    { id: 'efes', name: 'Ephesus', x: 71, y: 221, appearAt: 0.30 },
    { id: 'sirince', name: 'Sirince', x: 110, y: 195, appearAt: 0.40 },
    { id: 'pamukkale', name: 'Pamukkale', x: 145, y: 228, appearAt: 0.50 },
    { id: 'antalya', name: 'Antalya', x: 210, y: 278, appearAt: 0.60 },
    { id: 'konya', name: 'Konya', x: 283, y: 222, appearAt: 0.70 },
    { id: 'cappadocia', name: 'Cappadocia', x: 378, y: 182, appearAt: 0.80 },
    { id: 'istanbul', name: 'Istanbul', x: 135, y: 59, appearAt: 0.90 },
  ];
  const cityPng: cityPng[] = [
    { id: 'alacati', x:-10, y: 110, appearAt: 0.20 },
    { id: 'efes', x: 0, y: 200, appearAt: 0.30 },
    { id: 'sirince', x: 150, y: 125, appearAt: 0.40 },
    { id: 'pamukkale', x: 135, y: 200, appearAt: 0.50 },
    { id: 'antalya', x: 190, y: 255, appearAt: 0.60 },
    { id: 'konya', x: 270, y: 200, appearAt: 0.70 },
    { id: 'cappadocia', x: 350, y: 170, appearAt: 0.80 },
    { id: 'istanbul', x: 50, y: 20, appearAt: 0.90 },
  ]

  const loadAndDrawSvg = $(async () => {
    if (isDrawing.value) return;
    isDrawing.value = true;
    
    const res = await fetch('/trukiye-symbol.svg');
    const svg = await res.text();

    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;
    
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
    const symbolElement = svgDoc.querySelector('symbol');
    
    if (!symbolElement) return;
    
    const newSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    newSvg.setAttribute('width', '100%');
    newSvg.setAttribute('height', '100%');
    newSvg.setAttribute('viewBox', symbolElement.getAttribute('viewBox') || '0 0 792 334');
    newSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    Array.from(symbolElement.childNodes).forEach(node => {
      newSvg.appendChild(node.cloneNode(true));
    });
    mapContainer.innerHTML = '';
    mapContainer.appendChild(newSvg);

    const style = document.createElement('style');
    style.textContent = `
      @keyframes drawLine {
        from { stroke-dashoffset: var(--length); }
        to { stroke-dashoffset: 0; }
      }
      @keyframes eraseLine {
        from { stroke-dashoffset: 0; }
        to { stroke-dashoffset: var(--length); }
      }
    `;
    newSvg.appendChild(style);
    
    const paths = Array.from(newSvg.querySelectorAll('path, line, circle, rect'));
    
    paths.forEach((path) => {
      let length = 0;
      if ('getTotalLength' in path) {
        length = (path as SVGGeometryElement).getTotalLength();
      }
      (path as SVGElement & 
        { style: CSSStyleDeclaration }
      ).style.setProperty('--length', `${length}`);
      path.setAttribute('stroke-dasharray', `${length}`);
      path.setAttribute('stroke-dashoffset', `${length}`);
      path.setAttribute('stroke', '#FFB266');
      path.setAttribute('fill', 'none');
      path.setAttribute('opacity', '1');
      
      (
        path as SVGElement &
        { style: CSSStyleDeclaration }
      ).style.animation = `drawLine 1s forwards ease-in-out`;
    });
  });

  const reverseDrawSvg = $(() => {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;
    const svg = mapContainer.querySelector('svg');
    if (!svg) return;
  
    const paths = svg.querySelectorAll('path, line, circle, rect');
    let finishedCount = 0;
  
    paths.forEach((path) => {
      const el = path as SVGGeometryElement;
      const length = 'getTotalLength' in el ? el.getTotalLength() : 0;
  
      el.setAttribute('stroke-dasharray', `${length}`);
      el.setAttribute('stroke-dashoffset', `0`);
      el.setAttribute('stroke', '#FFB266');
      el.setAttribute('fill', 'none');
      el.setAttribute('opacity', '1');
  
      // 重設動畫
      (el as any).style.animation = `eraseLine 1.5s forwards ease-in-out`;
  
      // 監聽動畫結束
      el.addEventListener('animationend', () => {
        finishedCount++;
        if (finishedCount === paths.length) {
          isDrawing.value = false;
        }
      }, { once: true });
    });
  });
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const mapWrapper = document.getElementById('map-wrapper') as HTMLDivElement;
    const mapContainer = document.getElementById('map-container') as HTMLDivElement;
    const recordContainer = document.getElementById('record-container') as HTMLDivElement;
    const wrapperRect = mapWrapper.getBoundingClientRect();
    const textContainer = document.getElementById('text-container') as HTMLDivElement;

    const windowScroll = ()=>{
      if(
        window.scrollY > (wrapperRect.top - 200) && 
        window.scrollY < (wrapperRect.bottom + 200)
      ){  
        mapContainer.style.position = 'fixed';
        mapContainer.style.top = '50%';
        mapContainer.style.transform = 'translateY(-50%)';
        mapContainer.style.width = '100%';
        // 
        recordContainer.style.position = 'fixed'; 
        recordContainer.style.top = '50%';
        recordContainer.style.transform = 'translateY(-50%)';
        recordContainer.style.width = '100%';
        // 
        textContainer.style.display = 'block';
        textContainer.style.position = 'fixed';
        textContainer.style.top = '50%';
        textContainer.style.transform = 'translateY(-50%)';
        textContainer.style.width = '100%';
      }else{
        mapContainer.style.position = '';
        mapContainer.style.top = '';
        mapContainer.style.transform = '';
        mapContainer.style.width = '';
        // 
        recordContainer.style.position = '';
        recordContainer.style.top = '';
        recordContainer.style.transform = '';
        recordContainer.style.width = '';
        // 
        textContainer.style.position = '';
        textContainer.style.top = '';
        textContainer.style.transform = '';
        textContainer.style.width = '';
        textContainer.style.display = 'none';
      }
    }
    window.addEventListener('scroll',windowScroll)
    windowScroll()
    return ()=>{
      window.removeEventListener('scroll',windowScroll)
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.intersectionRatio >= 0.1;
        isVisible.value = visible;

        if (isVisible.value && !isDrawing.value) {
          loadAndDrawSvg();
        } else if (!visible && isDrawing.value) {
          reverseDrawSvg();
        }
      },
      {threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]}
    );

    observer.observe(mapContainer);
    return () => observer.disconnect();
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const mapWrapper = document.getElementById('map-wrapper') as HTMLDivElement;
    const updateScrollProgress = () => {
      const scrollY = window.scrollY;
      const docHeight = mapWrapper.scrollHeight - window.innerHeight;
      scrollProgress.value = docHeight > 0 ? scrollY / docHeight : 0;
    };
    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress();
    return () => window.removeEventListener('scroll', updateScrollProgress);
  });
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ track }) => {
    track(() => currentCityIndex.value);
    const textContainerLeft = document.querySelector('.text-container-left') as HTMLDivElement;
    const textContainerRight = document.querySelector('.text-container-right') as HTMLDivElement;
    if(currentCityIndex.value >= 0){
      textContainerLeft.classList.add('active');
      textContainerRight.classList.add('active');
      setTimeout(()=>{
        textContainerLeft.classList.remove('active');
        textContainerRight.classList.remove('active');
      },1000)
    }  
  })

  useTask$(async ({ track }) => {
    track(() => isVisible.value);
    
    if (isVisible.value && !isDrawing.value) {
      loadAndDrawSvg();
    }
  });

  useTask$(async ({ track }) => {
    track(() => scrollProgress.value);
    const currentIndex = cities.findIndex(city => scrollProgress.value < city.appearAt);

    if (currentIndex === -1) {
      currentCityIndex.value = cities.length - 1;
    } else {
      currentCityIndex.value = Math.max(0, currentIndex - 1);
    }
  });

  const closeGallery = $(() => {
    photoProps.value = null;
  })

  const handleClick = $((imgId: string) => {
    photoProps.value = null;
    const photo = photoList.find((p) => p.id === imgId) || null;
    photoProps.value = photo;
  });

  return (
    <>
      <div id='map-wrapper'
        class="relative h-[400dvh] flex items-center"
      >
        <div id="text-container">
          <div class="text-container-left slide-left-text">
            {currentCityIndex.value >= 0 && (
              <div class="text-content slide-left-text">
                <h2 class="text-2xl font-bold mb-4 text-white">
                  {typedIntroduceData[cities[currentCityIndex.value].id].title_zh}
                </h2>
                <p class="text-lg text-white">
                  {typedIntroduceData[cities[currentCityIndex.value].id].text_zh}
                </p>
              </div>
            )}
          </div>
          <div class="text-container-right slide-right-text">
            {currentCityIndex.value >= 0 && (
              <div class="text-content slide-right-text">
                <h2 class="text-2xl font-bold mb-4 text-white">
                  {typedIntroduceData[cities[currentCityIndex.value].id].title}
                </h2>
                <p class="text-lg text-white">
                  {typedIntroduceData[cities[currentCityIndex.value].id].text}
                </p>
              </div>
            )}
          </div>
        </div>
        <div id="map-container" class="svg-map-container"></div>
        <div id="record-container" class="svg-map-container">
          <svg viewBox="0 0 792 334" class="w-[80%] h-auto">
            {/* 動態城市渲染 */}
            {cities
              .filter((c) => scrollProgress.value >= c.appearAt)
              .map((c) => (
                <g key={c.id}>
                  <circle cx={c.x} cy={c.y} r="8" fill="#ef4444" stroke="#fff" stroke-width="2" />
                  <text x={c.x + 10} y={c.y} fill="#fff" font-size="16">{c.name}</text>
                </g>
              ))}
            <defs>
              <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="4" 
                  stdDeviation="4" 
                  flood-color="white" 
                  flood-opacity="0.5"
                />
              </filter>
            </defs>
            {cityPng
              .map((img) => (
                <CityImage
                  key={img.id}
                  id={img.id}
                  x={img.x}
                  y={img.y}
                  isAppear={scrollProgress.value >= img.appearAt}
                  onClick$={() => handleClick(img.id)}
                />
              ))}
          </svg>
        </div>
      </div>
      {photoProps.value && (
        <CardGallery 
          photoProps={photoProps.value} 
          closeGallery={closeGallery}
        />
      )}
    </>
  );
});


