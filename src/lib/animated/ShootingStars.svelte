<script lang="ts">
  interface ShootingStarsProps {
    count?: number;
    color?: string;
    glowColor?: string;
    class?: string;
  }

  let {
    count = 20,
    color = '#ffffff',
    glowColor = 'rgba(255, 255, 255, 0.8)',
    class: className = ''
  }: ShootingStarsProps = $props();

  interface Star {
    id: number;
    x: number;
    y: number;
    angle: number;
    delay: number;
    duration: number;
    size: number;
    tailLength: number;
  }

  let stars = $state<Star[]>([]);

  $effect(() => {
    const generateStars = () => {
      const newStars: Star[] = [];
      for (let i = 0; i < count; i++) {
        newStars.push({
          id: i,
          x: 75 + Math.random() * 35, // Start near or just beyond the right edge
          y: -10 - Math.random() * 20, // Start slightly above the viewport
          angle: 100 + Math.random() * 15, // Fall downwards with a slight left tilt (100-115 degrees)
          delay: Math.random() * 8, // Random start delay up to 8s
          duration: 1.5 + Math.random() * 2.5, // Fall duration between 1.5s and 4s
          size: 1 + Math.random() * 1.5, // Core star thickness
          tailLength: 100 + Math.random() * 150 // Tail length between 100px and 250px
        });
      }
      stars = newStars;
    };

    generateStars();
  });
</script>

<div class="shooting-stars-container {className}" aria-hidden="true">
  {#each stars as star (star.id)}
    <div
      class="shooting-star"
      style:--star-color={color}
      style:--glow-color={glowColor}
      style:--x="{star.x}vw"
      style:--y="{star.y}vh"
      style:--angle="{star.angle}deg"
      style:--delay="{star.delay}s"
      style:--duration="{star.duration}s"
      style:--size="{star.size}px"
      style:--tail="{star.tailLength}px"
    ></div>
  {/each}
</div>

<style>
  .shooting-stars-container {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none; /* Prevents interference with clicks/hover on the portfolio */
    z-index: 10;
  }

  .shooting-star {
    position: absolute;
    left: var(--x);
    top: var(--y);
    width: var(--tail);
    height: var(--size);
    /* Fade from transparent to solid color at the head */
    background: linear-gradient(90deg, transparent 0%, transparent 40%, var(--star-color) 100%);
    border-radius: 999px;
    transform-origin: right center;
    opacity: 0;
    animation: fall var(--duration) linear var(--delay) infinite;
  }

  /* The glowing head of the star */
  .shooting-star::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: calc(var(--size) * 2.5);
    height: calc(var(--size) * 2.5);
    background-color: var(--star-color);
    border-radius: 50%;
    box-shadow: 0 0 12px 3px var(--glow-color);
  }

  @keyframes fall {
    0% {
      opacity: 0;
      transform: rotate(var(--angle)) translateX(0) scale(0.5);
    }
    10% {
      opacity: 0.8; /* Fade in smoothly at the top */
    }
    70% {
      opacity: 1; 
    }
    100% {
      opacity: 0;
      /* Travel distance based on angle, fading out near the bottom white gradient */
      transform: rotate(var(--angle)) translateX(120vh) scale(1.2);
    }
  }
</style>