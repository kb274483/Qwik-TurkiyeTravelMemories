import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

export const Parallax = component$(() => {
  const imgArr = useSignal<number[]>([2,3,4,5]);
  const isMobile = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const el = document.querySelector('.hotAirBalloon') as HTMLDivElement;
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

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      isMobile.value = width < 768;
    }
    checkMobile();

    const scroll = () => {
      const scrollY = window.scrollY;
      const scrollLimit = window.innerHeight * 0.35;
      const hotAirBalloon = document.querySelector('.hotAirBalloon') as HTMLDivElement;
      const parallaxItems = document.querySelectorAll('.parallax-item') as NodeListOf<HTMLElement>;
      const parallaxTitle = document.getElementById('parallax-title') as HTMLDivElement;

      if(scrollY < scrollLimit) {
        parallaxTitle.style.transform = `translate3d(0, -${scrollY * 0.6}px, 0)`;
        hotAirBalloon.style.transform = `translate3d(0, -${scrollY * 0.5}px, 0)`;
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
      <div class="parallax from-[#2c111a] via-[#2c111a] to-stone-900 bg-gradient-to-b relative" style={styles.parallax}>
        
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
          class="parallax-item hotAirBalloon" 
          style={{
            ...styles.parallaxItem, ...styles.hotAirBalloon
          }}
        >
          <img 
            src="/parallaxImg/1.webp"
            alt="hotAirBalloon" 
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
              '30' : i === 3 ? 
              '70' : i === 4 ? 
              '120' : '180'
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
  hotAirBalloon: {
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
