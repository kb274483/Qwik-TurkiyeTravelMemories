import { component$, useSignal, useVisibleTask$, useStyles$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Parallax } from "~/components/router-head/parallax";
import { SvgMap } from "~/components/router-head/svgMap";
import { LoadingScreen } from "~/components/router-head/LoadingScreen";
import { SmoothScroll } from "~/components/router-head/SmoothScroll";

export const TypingText = component$(() => {
  const text = "If the Earth were a single state, Istanbul would be its capital.";
  const displayedText = useSignal('');
  const isVisible = useSignal(false);
  const scrollY = useSignal(0);
  useStyles$(`
    .typing-cursor {
      animation: blink 1s step-start infinite;
    }
    @keyframes blink {
      50% { opacity: 0; }
    }
  `);
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => isVisible.value);
    if (!isVisible.value) return;

    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        displayedText.value = text.slice(0, i);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const onScroll = () => {
      const y = window.scrollY;
      scrollY.value = y;
      if (y > 100) isVisible.value = true;
      if (y < 100) isVisible.value = false;
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  });

  // 樣式計算
  const translateY = Math.max(0, 100 - scrollY.value * 0.2);

  return (
    <div
      id="typing-text"
      class="text-2xl text-center text-white font-mono whitespace-pre-wrap w-full mx-auto fixed left-0 z-20 pointer-events-none"
      style={{
        top: `${translateY}vh`,
        transition: 'all 0.2s ease-out',
      }}
    >
      {isVisible.value && (
        <div>
          {displayedText.value}
          <span class="typing-cursor">|</span>
        </div>
      )}
    </div>
  );
});


export default component$(() => {
  const isVisible = useSignal(false);
  const isLoading = useSignal(true);

  useStyles$(`
    :root {
      --scroll-speed: 0.15s;
    }
    
    .parallax-container {
      will-change: transform;
    }
    
    .parallax-element {
      transition: transform var(--scroll-speed) cubic-bezier(0.25, 0.1, 0.25, 1);
      will-change: transform;
    }
    
    @media (prefers-reduced-motion: reduce) {
      :root {
        --scroll-speed: 0s;
      }
    }
  `);

  // LOADING COMPLETE
  const handleLoadingComplete = $(() => {
    isLoading.value = false;
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    window.scrollTo({top: 0, behavior: 'auto'});
    const target = document.getElementById('parallax-container');
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.value = entry.intersectionRatio >= 0.01;
      },
      {threshold: 0.01}
    );

    observer.observe(target);
    return () => observer.disconnect();
  });

  return (
    <div class="relative overflow-hidden bg-stone-900">  
      {
        isLoading.value && 
        <LoadingScreen 
          onLoadingComplete$={handleLoadingComplete}
        />
      }
      
      <SmoothScroll />
      
      <div id="parallax-container"
        class="parallax-container"
        style={{
          ...styles.fadeSlideUp,
          ...(isVisible.value ? styles.fadeSlideUpShow : {})
        }}
      >
        <Parallax />
      </div>
      <TypingText />
      <div class="relative mt-[-90vh]">
        <SvgMap />
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Roy's Travel Memories",
  meta: [
    {
      name: "description",
      content: "Roy & Buccula's Turkiye Travel Memories",
    },
  ],
};


const styles = {
  fadeSlideUp : {
    opacity: 0,
    transform: 'translateY(30px)',
    transition: 'all 0.8s ease',
  },
  fadeSlideUpShow :{
    opacity: 1,
    transform: 'translateY(0)',
  }
}