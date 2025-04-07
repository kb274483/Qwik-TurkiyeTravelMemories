import { component$, useVisibleTask$, useSignal, $, useTask$ } from '@builder.io/qwik';
interface City {
  id: string;
  name: string;
  x: number;
  y: number;
  appearAt: number;
}
interface cityPng {
  id: string;
  x: number;
  y: number;
  appearAt: number;
}
export const SvgMap = component$(() => {
  const isVisible = useSignal(false);
  const isDrawing = useSignal(false);
  const scrollProgress = useSignal(0);


  const cities: City[] = [
    { id: 'istanbul', name: 'Istanbul', x: 135, y: 59, appearAt: 0.20 },
    { id: 'alacati', name: 'Alacati', x: 38, y: 206, appearAt: 0.32 },
    { id: 'efes', name: 'Ephesus', x: 71, y: 221, appearAt: 0.44 },
    { id: 'sirince', name: 'Sirince', x: 110, y: 195, appearAt: 0.56 },
    { id: 'pamukkale', name: 'Pamukkale', x: 145, y: 228, appearAt: 0.68 },
    { id: 'antalya', name: 'Antalya', x: 210, y: 278, appearAt: 0.80 },
    { id: 'konya', name: 'Konya', x: 283, y: 222, appearAt: 0.92 },
    { id: 'cappadocia', name: 'Cappadocia', x: 378, y: 182, appearAt: 1.04 },
  ];
  const cityPng: cityPng[] = [
    { id: 'istanbul', x: 50, y: 20, appearAt: 0.25 },
    { id: 'alacati', x:-10, y: 110, appearAt: 0.37 },
    { id: 'efes', x: 0, y: 200, appearAt: 0.49 },
    { id: 'sirince', x: 150, y: 125, appearAt: 0.61 },
    { id: 'pamukkale', x: 135, y: 200, appearAt: 0.73 },
    { id: 'antalya', x: 190, y: 255, appearAt: 0.85 },
    { id: 'konya', x: 270, y: 200, appearAt: 0.97 },
    { id: 'cappadocia', x: 350, y: 170, appearAt: 1.09 },
  ]
  // const connections: Connection[] = [
  //   { id: 'istanbul-alacati', from: 'istanbul', to: 'alacati', appearAt: 0.25 },
  //   { id: 'alacati-efes', from: 'alacati', to: 'efes', appearAt: 0.37 },
  //   { id: 'efes-sirince', from: 'efes', to: 'sirince', appearAt: 0.49 },
  //   { id: 'sirince-pamukkale', from: 'sirince', to: 'pamukkale', appearAt: 0.61 },
  //   { id: 'pamukkale-antalya', from: 'pamukkale', to: 'antalya', appearAt: 0.73 },
  //   { id: 'antalya-konya', from: 'antalya', to: 'konya', appearAt: 0.90 },
  //   { id: 'konya-cappadocia', from: 'konya', to: 'cappadocia', appearAt: 1.12 },
  //   { id: 'cappadocia-istanbul', from: 'cappadocia', to: 'istanbul', appearAt: 1.14 },
  // ];

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
      ).style.animation = `drawLine 1.5s forwards ease-in-out`;
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
          isDrawing.value = false; // 全部動畫結束後才可重繪
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

    const windowScroll = ()=>{
      if(
        window.scrollY > (wrapperRect.top - 200) && 
        window.scrollY < (wrapperRect.bottom + 200)
      ){  
        mapContainer.style.position = 'fixed';
        mapContainer.style.top = '50%';
        mapContainer.style.transform = 'translateY(-50%)';
        mapContainer.style.width = '100%';
        recordContainer.style.position = 'fixed'; 
        recordContainer.style.top = '50%';
        recordContainer.style.transform = 'translateY(-50%)';
        recordContainer.style.width = '100%';
      }else{
        mapContainer.style.position = '';
        mapContainer.style.top = '';
        mapContainer.style.transform = '';
        mapContainer.style.width = '';
        recordContainer.style.position = '';
        recordContainer.style.top = '';
        recordContainer.style.transform = '';
        recordContainer.style.width = '';
      }
    }
    window.addEventListener('scroll',windowScroll)
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

  useTask$(async ({ track }) => {
    track(() => isVisible.value);
    
    if (isVisible.value && !isDrawing.value) {
      loadAndDrawSvg();
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const mapWrapper = document.getElementById('map-wrapper') as HTMLDivElement;
    const updateScrollProgress = () => {
      const scrollY = window.scrollY;
      const docHeight = mapWrapper.scrollHeight - window.innerHeight;
      scrollProgress.value = docHeight > 0 ? scrollY / docHeight : 0;
      console.log('Scroll Progress:', scrollProgress.value);
    };
    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress();
    return () => window.removeEventListener('scroll', updateScrollProgress);
  });

  return (
    <>
      <div id='map-wrapper'
        class="relative h-[300dvh] flex items-center"
      >
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
                <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="white" flood-opacity="0.8" />
              </filter>
            </defs>
            {cityPng
              .filter((img) => scrollProgress.value >= img.appearAt)
              .map((img) => {
                const handleClick = $(() => {
                  alert(`你點擊了：${img.id}`);
                });
                return (
                    <image
                      onClick$={handleClick}
                      class="city-image"
                      href={`/images/${img.id}.PNG`}
                      x={img.x}
                      y={img.y}
                      width="100"
                      height="100"
                      opacity="0"
                      style={{
                        animation: 'imageAppear 0.8s ease forwards',
                        transformOrigin: 'center center',
                      }}
                      filter="url(#dropShadow)"
                    />
                );
              })}

            {/* 動態連線渲染 */}
            {/* {connections
              .filter((conn) => scrollProgress.value >= conn.appearAt)
              .map((conn) => {
                const from = cities.find((c) => c.id === conn.from);
                const to = cities.find((c) => c.id === conn.to);
                if (!from || !to) return null;
                // 計算線段長度
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                const length = Math.sqrt(dx * dx + dy * dy);

                return (
                  <line
                    key={conn.id}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="#c3c3c3"
                    stroke-width="2"
                    stroke-dasharray={length}
                    stroke-dashoffset={length}
                  />
                );
              })} */}

          </svg>
        </div>
        <style>{`
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
          .city-image{
            transition: all 0.5s ease;
            cursor: pointer;
          }
          .city-image:hover{
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
        `}</style>
      </div>
    </>
  );
});


