import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

export const Parallax = component$(() => {
  const imgArr = useSignal<number[]>([2,3,4,5]);
  const isMobile = useSignal(false);

  useVisibleTask$(() => {
    const el = document.querySelector('.hotairBalloon') as HTMLDivElement;
    let t = 0;
    const float = () => {
      t += 0.02;
      const x = Math.sin(t) * 50;
      const y = Math.cos(t) * 50;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      requestAnimationFrame(float);
    };
    float();
  });

  useVisibleTask$(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      isMobile.value = width < 768;
    }
    checkMobile();

    const scroll = () => {
      const scrollY = window.scrollY;
      const hotairBalloon = document.querySelector('.hotairBalloon') as HTMLDivElement;
      const parallaxItems = document.querySelectorAll('.parallax-item') as NodeListOf<HTMLElement>;
      const parallaxTitle = document.getElementById('parallax-title') as HTMLDivElement;

      if(scrollY < 350) {
        parallaxTitle.style.transform = `translate3d(0, -${scrollY * 0.6}px, 0)`;
        hotairBalloon.style.transform = `translate3d(0, -${scrollY * 0.5}px, 0)`;
        parallaxItems.forEach((item) => {
          const speed = item.getAttribute('data-speed');
          if (speed) {
            const y = (scrollY * parseInt(speed)) / 100;
            item.style.transform = `translate3d(0, -${y}px, 0)`;
          }
        })
      }
    }

    window.addEventListener('scroll', scroll);
    return () => {
      window.removeEventListener('scroll', scroll);
    }
  })

  return (
    <>
      <div class="parallax bg-stone-900" style={styles.parallax}>
        <div id="parallax-title"
          class="absolute top-0 left-0 z-10 w-full h-1/2 flex flex-col justify-center items-center"
        >
          <h2 class="text-white text-3xl md:text-5xl font-bold text-center">
            Framing Memories
          </h2>
          <h3 class="text-white text-xl md:text-3xl text-center">
            Exploring Türkiye Through the Lens
          </h3>
        </div>
        <div data-speed="200"  
          class="parallax-item hotairBalloon" 
          style={{
            ...styles.parallaxItem, ...styles.hotairBalloon
          }}
        >
          <img 
            src="/parallaxImg/1.webp"
            alt="hotairBalloon" 
            style={styles.image} 
          />
        </div>
        {imgArr.value.map((i) => (
          <div key={i}
            class="parallax-item" 
            style={{
              ...styles.parallaxItem,
              ...(i === 4 ? styles.mountain : {}),
              ...(i === 5 ? styles.ground : {})
            }}
            data-speed={
              i === 2 ?
              '50' : i === 3 ? 
              '100' : i === 4 ? 
              '150' : '200'
            }
          >
            <img
              width={100}
              height={100}
              alt="parallaxImg"
              src={`/parallaxImg/${i}.webp`} 
              style={styles.image}
              class={`
                ${isMobile.value ? 'object-fill' : 'object-cover'}
                ${i === 5 ? styles.groundImage : ''}
              `}
            />
          </div>
        ))}
      </div>
    </>
  );

});

const styles = {
  parallax: {
    position: "relative" as const,
    width: "100%",
    height: "150dvh",
    overflow: "hidden",
  },
  parallaxItem: {
    position: "absolute" as const,
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    willChange: "transform",
  },
  mountain: {
    zIndex: "10",
  },
  ground: {
    zIndex: "15",
  },
  hotairBalloon: {
    zIndex: "5",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  groundImage: {
    height: "150%",
  }
};
