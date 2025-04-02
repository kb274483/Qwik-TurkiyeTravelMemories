import { component$, useVisibleTask$, useSignal, $, useTask$ } from '@builder.io/qwik';

export const SvgMap = component$(() => {
  const isVisible = useSignal(false);
  const isDrawing = useSignal(false);

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
      
      (
        path as SVGElement & 
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
      ).style.animation = `drawLine 3s forwards ease-in-out`;
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
      }else{
        mapContainer.style.position = '';
        mapContainer.style.top = '';
        mapContainer.style.transform = '';
        mapContainer.style.width = '';
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

  // eslint-disable-next-line qwik/no-use-visible-task
  useTask$(async ({ track }) => {
    track(() => isVisible.value);
    
    if (isVisible.value && !isDrawing.value) {
      loadAndDrawSvg();
    }
  });

  return (
    <>
      <div id='map-wrapper'
        class="relative h-[300dvh] flex items-center"
      >
        <div id="map-container" class="svg-map-container w-full">
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
            fill: none;
            stroke-width: 2;
            transition: fill 0.3s, stroke 0.3s;
          }
        `}</style>
      </div>
    </>
  );
});


