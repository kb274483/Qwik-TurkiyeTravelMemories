import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

export const Parallax = component$(() => {
  const imgArr = useSignal<number[]>([2,3,4,5]);

  useVisibleTask$(() => {
    const el = document.querySelector('.hotairBalloon') as HTMLDivElement;
    let t = 0;
    const float = () => {
      t += 0.02;
      const x = Math.sin(t) * 25;
      const y = Math.cos(t) * 20;
      el.style.transform = `translate(${x}px, ${y}px)`;

      requestAnimationFrame(float);
    };
    float();
  });

  useVisibleTask$(() => {
    const scroll = () => {
      const scrollY = window.scrollY;
      const hotairBalloon = document.querySelector('.hotairBalloon') as HTMLDivElement;
      const parallaxItems = document.querySelectorAll('.parallax-item') as NodeListOf<HTMLElement>;

      hotairBalloon.style.transform = `translateY(${scrollY * 0.5}px)`;
      parallaxItems.forEach((item) => {
        const speed = item.getAttribute('data-speed');
        console.log(speed);
        if (speed) {
          const y = (scrollY * parseInt(speed)) / 100;
          item.style.transform = `translateY(-${y}px)`;
        }
      })
    }
    window.addEventListener('scroll', scroll);
    return () => {
      window.removeEventListener('scroll', scroll);
    }
  })

  return (
    <>
      <div class="parallax bg-stone-900" style={styles.parallax}>
        <div data-speed="200"  
          class="parallax-item hotairBalloon" 
          style={{
            ...styles.parallaxItem, ...styles.hotairBalloon
          }}
        >
          <img src="/parallaxImg/1.webp" alt="" style={styles.image} />
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
            />
          </div>
        ))}
      </div>
      <div class="bg-stone-900 h-[150dvh]"></div>
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
    objectFit: "cover" as const,
  }
};
