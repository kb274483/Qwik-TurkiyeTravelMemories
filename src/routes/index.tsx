import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Parallax } from "~/components/router-head/parallax";
import { SvgMap } from "~/components/router-head/svgMap";
export default component$(() => {
  const isVisible = useSignal(false);

  useVisibleTask$(() => {
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
      <div id="parallax-container"
        style={{
          ...styles.fadeSlideUp,
          ...(isVisible.value ? styles.fadeSlideUpShow : {})
        }}
      >
        <Parallax />
      </div>
      <div class="relative mt-[-50vh]">
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