import { component$, useVisibleTask$, useSignal } from '@builder.io/qwik';

export const SvgMap = component$(() => {
  const isVisible = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$( async () => {
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
        from {
          stroke-dashoffset: var(--length);
        }
        to {
          stroke-dashoffset: 0;
        }
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
    
    isVisible.value = true;
  });

  return (
    <div class="relative h-[100dvh] flex items-center">
      <div id="map-container" class="svg-map-container w-full"></div>
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
  );
});

