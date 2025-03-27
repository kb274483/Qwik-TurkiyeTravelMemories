import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

export const Parallax = component$(() => {
  const imgArr = useSignal<number[]>([2,3,4,5]);

  useVisibleTask$(() => {
    const el = document.querySelector('.hotairBalloon') as HTMLDivElement;

    let t = 0;
    const float = () => {
      t += 0.02;

      const x = Math.sin(t) * 10;
      const y = Math.cos(t) * 15;
      el.style.transform = `translate(${x}px, ${y}px)`;

      requestAnimationFrame(float);
    };

    float();
  });

  return (
    <div class="parallax bg-amber-700" style={styles.parallax}>
      <div class="parallax-item hotairBalloon" style={{
        ...styles.parallaxItem, ...styles.hotairBalloon
      }}>
        <img src="/parallaxImg/1.webp" alt="" style={styles.image} />
      </div>
      {imgArr.value.map((i) => (
        <div key={i}
          class="parallax-item" style={styles.parallaxItem}
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
  );
});

const styles = {
  parallax: {
    position: "relative" as const,
    width: "100%",
    height: "100vh",
    overflow: "hidden",
  },
  parallaxItem: {
    position: "absolute" as const,
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    zIndex: "1",
  },
  hotairBalloon: {
    zIndex: "10",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  }
};
