<script lang="ts">
  import { onMount } from 'svelte';

  /**
   * DepthRibbon — images placed along a 3D sine/cosine curve (CSS 3D, no deps).
   * Svelte 5 (runes). Drag, wheel, arrow keys, and optional autoplay.
   *
   * Path for item at wrapped offset u (in item units):
   *   x = u * spread
   *   z = cos(u * frequency) * depth      // centre card is nearest
   *   y = sin(u * frequency * 0.7) * rise
   * Yaw follows the path tangent: atan2(-dz/du, dx/du).
   */
  type Item = string | { src: string; alt?: string };

  interface Props {
    images: Item[];
    cardWidth?: number; // px
    cardHeight?: number; // px
    spread?: number; // px between items along x
    depth?: number; // z amplitude, px
    rise?: number; // y amplitude, px
    frequency?: number; // radians per item
    perspective?: number; // px
    tangent?: number; // 0 = always face camera, 1 = fully follow path
    visible?: number; // half-range of items shown before fading out
    autoplay?: number; // items/sec, 0 disables
    wheel?: boolean; // hijack wheel to scroll the ribbon
    onselect?: (index: number) => void;
  }

  let {
    images,
    cardWidth = 220,
    cardHeight = 300,
    spread: spreadOverride,
    depth = 320,
    rise = 70,
    frequency = 0.6,
    perspective = 1200,
    tangent = 0.85,
    visible = 5,
    autoplay = 0.35,
    wheel = false,
    onselect
  }: Props = $props();

  let spread = $derived(spreadOverride ?? cardWidth * 1.25);
  let offset = $state(0); // in item units
  let focusedIndex = $state<number | null>(null);
  let velocity = 0; // items/sec
  let dragging = false;
  let hovering = false;
  let moved = 0;
  let pointerCaptureTarget: HTMLElement | null = null;
  let lastX = 0;
  let lastT = 0;

  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

  const n = $derived(images.length);

  const cards = $derived.by(() => {
    if (n === 0) return [];
    const half = Math.min(visible, n / 2);
    return images.map((img, i) => {
      // wrap to [-n/2, n/2)
      let u = (((i - offset) % n) + n) % n;
      if (u > n / 2) u -= n;

      const phase = u * frequency;
      const x = u * spread;
      const z = Math.cos(phase) * depth;
      const y = Math.sin(phase * 0.7) * rise;

      const dzdu = -Math.sin(phase) * depth * frequency;
      const yaw = (Math.atan2(-dzdu, spread) * 180) / Math.PI * tangent;

      const near = (Math.cos(phase) + 1) / 2; // 1 = nearest, 0 = farthest
      const edge = clamp((half - Math.abs(u)) / 1.5, 0, 1);
      const opacity = edge * (0.35 + 0.65 * near);
      const brightness = 0.55 + 0.45 * near;

      const src = typeof img === 'string' ? img : img.src;
      const alt = typeof img === 'string' ? '' : (img.alt ?? '');

      return {
        i,
        src,
        alt,
        style:
          `transform: translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) ` +
          `rotateY(${yaw.toFixed(2)}deg); opacity: ${opacity.toFixed(3)}; ` +
          `filter: brightness(${brightness.toFixed(3)}); ` +
          `pointer-events: ${edge > 0.05 ? 'auto' : 'none'};`
      };
    });
  });

  let inView = true;
  let wakeLoop: (() => void) | undefined;

  // Animation loop: inertia + autoplay
  onMount(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      raf = 0;
      if (!inView) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!dragging) {
        if (focusedIndex !== null && n > 0) {
          velocity = 0;
          const delta = (((focusedIndex - offset + n / 2) % n) + n) % n - n / 2;
          if (Math.abs(delta) < 0.002) offset = focusedIndex;
          else offset += delta * Math.min(1, dt * 8);
        } else {
          velocity *= Math.pow(0.04, dt); // decays to 4% per second
          if (Math.abs(velocity) < 0.001) velocity = 0;
          const auto = reduce || hovering ? 0 : autoplay;
          offset += (velocity + auto) * dt;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    wakeLoop = () => {
      if (raf || !inView) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    return () => {
      cancelAnimationFrame(raf);
      wakeLoop = undefined;
    };
  });

  function onpointerdown(e: PointerEvent) {
    dragging = true;
    moved = 0;
    velocity = 0;
    lastX = e.clientX;
    lastT = performance.now();
    const card = e.target instanceof Element ? e.target.closest<HTMLButtonElement>('.card') : null;
    pointerCaptureTarget = card ?? (e.currentTarget as HTMLElement);
    pointerCaptureTarget.setPointerCapture(e.pointerId);
  }

  function onpointermove(e: PointerEvent) {
    if (!dragging) {
      if (e.pointerType !== 'mouse' || !(e.target instanceof Element)) return;
      const card = e.target.closest<HTMLButtonElement>('.card[data-index]');
      if (!card) return;
      const index = Number(card.dataset.index);
      if (Number.isInteger(index) && index >= 0 && index < n) focusedIndex = index;
      return;
    }

    const now = performance.now();
    const dx = e.clientX - lastX;
    const dt = Math.max((now - lastT) / 1000, 0.001);
    const items = -dx / spread;
    offset += items;
    velocity = velocity * 0.6 + (items / dt) * 0.4; // smoothed release velocity
    moved += Math.abs(dx);
    if (moved > 5) focusedIndex = null;
    lastX = e.clientX;
    lastT = now;
  }

  function onpointerup(e: PointerEvent) {
    if (!dragging) return;
    dragging = false;
    if (pointerCaptureTarget?.hasPointerCapture(e.pointerId)) {
      pointerCaptureTarget.releasePointerCapture(e.pointerId);
    }
    pointerCaptureTarget = null;
  }

  function onkeydown(e: KeyboardEvent) {
    focusedIndex = null;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      velocity += 2;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      velocity -= 2;
    }
  }

  function select(i: number) {
    const wasDragged = moved > 5;
    moved = 0;
    if (wasDragged) return;
    onselect?.(i);
  }

  function attachRibbon(element: HTMLDivElement) {
    const onpointerenter = () => (hovering = true);
    const onpointerleave = () => {
      hovering = false;
      focusedIndex = null;
    };
    const onwheel = (e: WheelEvent) => {
      e.preventDefault();
      velocity += (e.deltaY + e.deltaX) * 0.004;
    };

    const visibility = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) wakeLoop?.();
    });
    visibility.observe(element);

    element.addEventListener('pointerdown', onpointerdown);
    element.addEventListener('pointermove', onpointermove);
    element.addEventListener('pointerup', onpointerup);
    element.addEventListener('pointercancel', onpointerup);
    element.addEventListener('pointerenter', onpointerenter);
    element.addEventListener('pointerleave', onpointerleave);
    if (wheel) element.addEventListener('wheel', onwheel, { passive: false });

    return () => {
      visibility.disconnect();
      element.removeEventListener('pointerdown', onpointerdown);
      element.removeEventListener('pointermove', onpointermove);
      element.removeEventListener('pointerup', onpointerup);
      element.removeEventListener('pointercancel', onpointerup);
      element.removeEventListener('pointerenter', onpointerenter);
      element.removeEventListener('pointerleave', onpointerleave);
      element.removeEventListener('wheel', onwheel);
    };
  }
</script>

<div
  class="ribbon"
  role="group"
  aria-label="Image ribbon"
  {@attach attachRibbon}
  style:--perspective="{perspective}px"
  style:--h="{cardHeight + rise * 2 + 80}px"
>
  <div class="stage">
    {#each cards as c (c.i)}
      <button
        type="button"
        class={['card', { focused: c.i === focusedIndex }]}
        data-index={c.i}
        style="width:{cardWidth}px;height:{cardHeight}px;margin:{-cardHeight / 2}px 0 0 {-cardWidth / 2}px;{c.style}"
        onclick={() => select(c.i)}
        {onkeydown}
        aria-label={c.alt || `Image ${c.i + 1}`}
      >
        <img src={c.src} alt={c.alt} draggable="false" decoding="async" />
      </button>
    {/each}
  </div>
</div>

<style>
  .ribbon {
    position: relative;
    width: 100%;
    height: var(--h);
    perspective: var(--perspective);
    perspective-origin: 50% 50%;
    overflow: hidden;
    cursor: grab;
    touch-action: pan-y;
    user-select: none;
    outline: none;
  }
  .ribbon:active {
    cursor: grabbing;
  }
  .ribbon:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: -2px;
  }
  .stage {
    position: absolute;
    inset: 0;
    transform-style: preserve-3d;
  }
  .card {
    position: absolute;
    left: 50%;
    top: 50%;
    padding: 0;
    border: 0;
    border-radius: 12px;
    overflow: hidden;
    background: #111;
    cursor: inherit;
    backface-visibility: hidden;
    will-change: transform, opacity, filter;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
  }
  .card.focused {
    box-sizing: border-box;
    border: 3px solid #fff;
    box-shadow:
      0 0 0 2px rgba(15, 23, 42, 0.45),
      0 12px 32px rgba(0, 0, 0, 0.35);
  }
  .card img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
  }
</style>