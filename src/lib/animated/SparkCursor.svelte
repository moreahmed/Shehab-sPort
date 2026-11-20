<script lang="ts">
  import { onMount } from 'svelte';

  interface SparkCursorProps {
    image?: string;
    size?: number;
    hotspot?: [number, number];
    facing?: number;
    tilt?: boolean;
    lifetime?: number;
    colors?: string[];
    glow?: string;
  }

  let {
    image = '',
    size = 32,
    hotspot = [0.5, 0.5],
    facing = 0,
    tilt = true,
    lifetime = 500,
    colors = ['#fff3b0', '#ffe98a', '#48cae4', '#00b4d8', '#90e0ef'],
    glow = '#0096c7'
  }: SparkCursorProps = $props();

  interface Spark {
    x: number;
    y: number;
    vx: number;
    vy: number;
    born: number;
    width: number;
    color: string;
  }

  const SPACING = 16;
  const MAX_PER_EVENT = 8;
  const MAX_SPARKS = 120;
  const GRAVITY = 420;
  const DRAG = 2.6;
  const STREAK = 0.06;
  const TURN_DISTANCE = 6;
  const TURN_TIME = 0.07;

  const wrap = (degrees: number) => ((((degrees + 180) % 360) + 360) % 360) - 180;

  let enabled = $state(false);
  let loaded = $state(false);
  let shown = $state(false);
  let canvas = $state<HTMLCanvasElement>();
  let cursor = $state<HTMLImageElement>();

  onMount(() => {
    enabled = matchMedia('(hover: hover) and (pointer: fine)').matches;
  });

  $effect(() => {
    const active = Boolean(image) && enabled && loaded && shown;
    document.documentElement.classList.toggle('has-custom-cursor', active);
    return () => document.documentElement.classList.remove('has-custom-cursor');
  });

  $effect(() => {
    if (!canvas) return;
    const surface = canvas;
    const ctx = surface.getContext('2d');
    if (!ctx) return;

    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const queue: Spark[] = [];
    let frameId = 0;
    let previous = 0;
    let width = 0;
    let height = 0;
    let lastX = 0;
    let lastY = 0;
    let pointerX = 0;
    let pointerY = 0;
    let aimX = 0;
    let aimY = 0;
    let heading = 0;
    let aim = 0;
    let aimed = false;
    let tracking = false;
    let painted = false;
    let carry = 0;

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const rect = surface.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      surface.width = Math.round(width * dpr);
      surface.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const place = () => {
      if (cursor) {
        cursor.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) rotate(${heading}deg)`;
      }
    };

    const wake = () => {
      if (frameId) return;
      previous = performance.now();
      frameId = requestAnimationFrame(frame);
    };

    const spawn = (x: number, y: number, dirX: number, dirY: number) => {
      if (queue.length >= MAX_SPARKS) return;
      const angle = Math.atan2(-dirY, -dirX) + (Math.random() - 0.5) * 1.6;
      const speed = 50 + Math.random() * 170;
      queue.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        born: performance.now(),
        width: 1.5 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)] ?? '#fff3b0'
      });
      wake();
    };

    const frame = () => {
      frameId = 0;
      const now = performance.now();
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;

      const turn = wrap(aim - heading);
      if (turn !== 0) {
        heading = Math.abs(turn) < 0.2 ? aim : wrap(heading + turn * (1 - Math.exp(-dt / TURN_TIME)));
        place();
      }

      const duration = Math.max(lifetime, 1);
      while (queue.length && now - queue[0].born >= duration) queue.shift();

      if (queue.length) {
        painted = true;
        ctx.clearRect(0, 0, width, height);
        const drag = Math.exp(-DRAG * dt);
        ctx.lineCap = 'round';
        for (const spark of queue) {
          spark.vx *= drag;
          spark.vy = spark.vy * drag + GRAVITY * dt;
          spark.x += spark.vx * dt;
          spark.y += spark.vy * dt;

          const life = 1 - (now - spark.born) / duration;
          ctx.beginPath();
          ctx.moveTo(spark.x - spark.vx * STREAK, spark.y - spark.vy * STREAK);
          ctx.lineTo(spark.x, spark.y);
          ctx.strokeStyle = glow;
          ctx.globalAlpha = life * 0.3;
          ctx.lineWidth = spark.width * 3;
          ctx.stroke();
          ctx.strokeStyle = spark.color;
          ctx.globalAlpha = Math.min(1, life * 1.6);
          ctx.lineWidth = spark.width * (0.4 + 0.6 * life);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      } else if (painted) {
        ctx.clearRect(0, 0, width, height);
        painted = false;
      }

      if (queue.length || heading !== aim) frameId = requestAnimationFrame(frame);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const x = event.clientX;
      const y = event.clientY;
      const still = reduceMotion.matches;
      pointerX = x;
      pointerY = y;

      if (!tracking) {
        aimX = x;
        aimY = y;
      } else if (!still) {
        const dx = x - lastX;
        const dy = y - lastY;
        const distance = Math.hypot(dx, dy);
        if (distance > 0) {
          const step = Math.max(SPACING, distance / MAX_PER_EVENT);
          let at = step - Math.min(carry, step);
          while (at <= distance) {
            const t = at / distance;
            spawn(lastX + dx * t, lastY + dy * t, dx / distance, dy / distance);
            at += step;
          }
          carry = distance - (at - step);
        }
      }

      if (tilt && !still) {
        const ax = x - aimX;
        const ay = y - aimY;
        if (Math.hypot(ax, ay) >= TURN_DISTANCE) {
          aim = wrap((Math.atan2(ay, ax) * 180) / Math.PI - facing);
          if (!aimed) {
            heading = aim;
            aimed = true;
          }
          aimX = x;
          aimY = y;
          wake();
        }
      }

      place();
      if (aimed || !tilt || still) shown = true;
      lastX = x;
      lastY = y;
      tracking = true;
    };

    const onLeave = () => {
      tracking = false;
      carry = 0;
      shown = false;
    };

    const observer = new ResizeObserver(resize);
    observer.observe(surface);
    resize();
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      observer.disconnect();
      cancelAnimationFrame(frameId);
      queue.length = 0;
    };
  });
</script>

{#if enabled}
  <canvas bind:this={canvas} class="sparks" aria-hidden="true"></canvas>
  {#if image}
    <img
      bind:this={cursor}
      class="cursor"
      class:shown={shown && loaded}
      src={image}
      alt=""
      draggable="false"
      style:width="{size}px"
      style:--hx={hotspot[0]}
      style:--hy={hotspot[1]}
      onload={() => (loaded = true)}
      onerror={() => (loaded = false)}
    />
  {/if}
{/if}

<style>
  :global(html.has-custom-cursor),
  :global(html.has-custom-cursor *) {
    cursor: none !important;
  }

  .sparks {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
  }

  .cursor {
    position: fixed;
    top: 0;
    left: 0;
    height: auto;
    pointer-events: none;
    user-select: none;
    z-index: 9999;
    opacity: 0;
    transform-origin: calc(var(--hx) * 100%) calc(var(--hy) * 100%);
    translate: calc(var(--hx) * -100%) calc(var(--hy) * -100%);
    will-change: transform;
  }

  .cursor.shown {
    opacity: 1;
  }
</style>
