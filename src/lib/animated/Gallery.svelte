<script module lang="ts">
	export type GalleryItem = { preview: string; types?: '3D' | '2D' | 'VIDEO' };
	type ItemDef = { preview: string; types: '3D' | '2D' | 'VIDEO'; originalIndex: number; x: number; y: number; sizeX: number; sizeY: number };

	const DEFAULT_ITEMS: GalleryItem[] = [
		{ preview: 'https://images.unsplash.com/photo-1755331039789-7e5680e26e8f?q=80&w=774&auto=format&fit=crop', types: '2D' },
		{ preview: 'https://images.unsplash.com/photo-1755569309049-98410b94f66d?q=80&w=772&auto=format&fit=crop', types: '3D' },
		{ preview: 'https://images.unsplash.com/photo-1755497595318-7e5e3523854f?q=80&w=774&auto=format&fit=crop', types: '2D' },
		{ preview: 'https://images.unsplash.com/photo-1755353985163-c2a0fe5ac3d8?q=80&w=774&auto=format&fit=crop', types: 'VIDEO' },
		{ preview: 'https://images.unsplash.com/photo-1745965976680-d00be7dc0377?q=80&w=774&auto=format&fit=crop', types: '2D' },
		{ preview: 'https://images.unsplash.com/photo-1752588975228-21f44630bb3c?q=80&w=774&auto=format&fit=crop', types: '3D' }
	];

	const clamp = (v: number, mn: number, mx: number) => Math.min(Math.max(v, mn), mx);
	const wrapSigned = (d: number) => { const a = (((d + 180) % 360) + 360) % 360; return a - 180; };

	function buildItems(pool: GalleryItem[], seg: number): ItemDef[] {
		const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
		const evenY = [-4, -2, 0, 2, 4];
		const oddY = [-3, -1, 1, 3, 5];
		const coords = xCols.flatMap((x, c) => (c % 2 === 0 ? evenY : oddY).map((y) => ({ x, y, sizeX: 2, sizeY: 2 })));
		
		if (pool.length === 0) return coords.map((c) => ({ ...c, preview: '', types: '2D', originalIndex: -1 }));
		
		const used = Array.from({ length: coords.length }, (_, i) => ({ 
			...pool[i % pool.length], 
			originalIndex: i % pool.length 
		}));

		for (let i = 1; i < used.length; i++) {
			if (used[i].preview === used[i - 1].preview) {
				for (let j = i + 1; j < used.length; j++) {
					if (used[j].preview !== used[i].preview) {
						const tmp = used[i];
						used[i] = used[j];
						used[j] = tmp;
						break;
					}
				}
			}
		}
		return coords.map((c, i) => ({ ...c, preview: used[i].preview, types: used[i].types ?? '2D', originalIndex: used[i].originalIndex }));
	}

	export { DEFAULT_ITEMS };
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		items?: GalleryItem[];
		onItemClick?: (index: number) => void;
		fit?: number;
		fitBasis?: 'auto' | 'min' | 'max' | 'width' | 'height';
		minRadius?: number;
		maxRadius?: number;
		overlayBlurColor?: string;
		maxVerticalRotationDeg?: number;
		dragSensitivity?: number;
		segments?: number;
		dragDampening?: number;
		imageBorderRadius?: string;
		grayscale?: boolean;
	};

	let {
		items = DEFAULT_ITEMS,
		onItemClick,
		fit = 0.5,
		fitBasis = 'auto',
		minRadius = 600,
		maxRadius = Infinity,
		overlayBlurColor = '#ffffff',
		maxVerticalRotationDeg = 5,
		dragSensitivity = 20,
		segments = 35,
		dragDampening = 2,
		imageBorderRadius = '30px',
		grayscale = true
	}: Props = $props();

	let rootRef: HTMLDivElement;
	let sphereRef: HTMLDivElement;

	const sphereItems = $derived(buildItems(items, segments));

	let rotation = { x: 0, y: 0 };
	let startRot = { x: 0, y: 0 };
	let startPos: { x: number; y: number } | null = null;
	let lastPos = { x: 0, y: 0, t: 0 };
	let velocity = { x: 0, y: 0 };
	let dragging = false;
	let moved = false;
	let pointerType: 'mouse' | 'pen' | 'touch' = 'mouse';
	let lastDragEndAt = 0;
	let inertiaRAF: number | null = null;
	let scrollLocked = false;

	function applyTransform(x: number, y: number) {
		if (sphereRef) sphereRef.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${x}deg) rotateY(${y}deg)`;
	}
	function lockScroll() {
		if (scrollLocked) return;
		scrollLocked = true;
		document.body.classList.add('dg-scroll-lock');
	}
	function unlockScroll() {
		if (!scrollLocked) return;
		scrollLocked = false;
		document.body.classList.remove('dg-scroll-lock');
	}
	function stopInertia() {
		if (inertiaRAF != null) {
			cancelAnimationFrame(inertiaRAF);
			inertiaRAF = null;
		}
	}
	function startInertia(vx: number, vy: number) {
		const MAX = 1.4;
		let vX = clamp(vx, -MAX, MAX) * 80;
		let vY = clamp(vy, -MAX, MAX) * 80;
		let frames = 0;
		const d = clamp(dragDampening ?? 0.6, 0, 1);
		const fric = 0.94 + 0.055 * d;
		const stop = 0.015 - 0.01 * d;
		const maxF = Math.round(90 + 270 * d);
		const step = () => {
			vX *= fric;
			vY *= fric;
			if (Math.abs(vX) < stop && Math.abs(vY) < stop) { inertiaRAF = null; return; }
			if (++frames > maxF) { inertiaRAF = null; return; }
			const nx = clamp(rotation.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
			const ny = wrapSigned(rotation.y + vX / 200);
			rotation = { x: nx, y: ny };
			applyTransform(nx, ny);
			inertiaRAF = requestAnimationFrame(step);
		};
		stopInertia();
		inertiaRAF = requestAnimationFrame(step);
	}

	function onPointerDown(e: PointerEvent) {
		stopInertia();
		sphereRef?.classList.add('is-dragging');
		pointerType = (e.pointerType as 'mouse' | 'pen' | 'touch') || 'mouse';
		if (pointerType === 'touch') { e.preventDefault(); lockScroll(); }
		(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
		dragging = true;
		moved = false;
		startRot = { ...rotation };
		startPos = { x: e.clientX, y: e.clientY };
		lastPos = { x: e.clientX, y: e.clientY, t: performance.now() };
		velocity = { x: 0, y: 0 };
	}
	function onPointerMove(e: PointerEvent) {
		if (!dragging || !startPos) return;
		if (pointerType === 'touch') e.preventDefault();
		const dx = e.clientX - startPos.x;
		const dy = e.clientY - startPos.y;
		if (!moved && dx * dx + dy * dy > 16) moved = true;
		const nx = clamp(startRot.x - dy / dragSensitivity, -maxVerticalRotationDeg, maxVerticalRotationDeg);
		const ny = startRot.y + dx / dragSensitivity;
		rotation = { x: nx, y: ny };
		applyTransform(nx, ny);
		// velocity sample
		const t = performance.now();
		const dt = Math.max(1, t - lastPos.t);
		velocity = { x: (e.clientX - lastPos.x) / dt, y: (e.clientY - lastPos.y) / dt };
		lastPos = { x: e.clientX, y: e.clientY, t };
	}
	function onPointerUp(e: PointerEvent) {
		if (!dragging) return;
		dragging = false;
		sphereRef?.classList.remove('is-dragging');
		const tap = !moved && startPos && Math.hypot(e.clientX - startPos.x, e.clientY - startPos.y) <= (pointerType === 'touch' ? 10 : 6);
		if (!tap && (Math.abs(velocity.x) > 0.005 || Math.abs(velocity.y) > 0.005)) {
			startInertia(velocity.x, velocity.y);
		}
		
		startPos = null;
		if (pointerType === 'touch') unlockScroll();
		if (moved) lastDragEndAt = performance.now();
		moved = false;
	}

	onMount(() => {
		const ro = new ResizeObserver((entries) => {
			const cr = entries[0].contentRect;
			const w = Math.max(1, cr.width);
			const h = Math.max(1, cr.height);
			const minDim = Math.min(w, h);
			const maxDim = Math.max(w, h);
			const aspect = w / h;
			let basis: number;
			switch (fitBasis) {
				case 'min': basis = minDim; break;
				case 'max': basis = maxDim; break;
				case 'width': basis = w; break;
				case 'height': basis = h; break;
				default: basis = aspect >= 1.3 ? w : minDim;
			}
			let radius = basis * fit;
			radius = Math.min(radius, h * 1.35);
			radius = clamp(radius, minRadius, maxRadius);
			const r = Math.round(radius);
			rootRef.style.setProperty('--radius', `${r}px`);
			rootRef.style.setProperty('--overlay-blur-color', overlayBlurColor);
			rootRef.style.setProperty('--tile-radius', imageBorderRadius);
			rootRef.style.setProperty('--image-filter', grayscale ? 'grayscale(1)' : 'none');
			applyTransform(rotation.x, rotation.y);
		});
		ro.observe(rootRef);
		applyTransform(0, 0);

		return () => {
			ro.disconnect();
			document.body.classList.remove('dg-scroll-lock');
			stopInertia();
		};
	});

	function tileClick(e: MouseEvent | PointerEvent, itemIndex: number) {
		if (dragging) return;
		if (moved) return;
		if (performance.now() - lastDragEndAt < 80) return;

		if (onItemClick) {
			onItemClick(itemIndex);
		}
	}
</script>

<div
	bind:this={rootRef}
	class="sphere-root relative w-full h-full"
	style="--segments-x:{segments};--segments-y:{segments};--overlay-blur-color:{overlayBlurColor};--tile-radius:{imageBorderRadius};--image-filter:{grayscale ? 'grayscale(1)' : 'none'};"
>
	<div
		class="absolute inset-0 grid place-items-center overflow-hidden select-none bg-transparent"
		style="touch-action:none;-webkit-user-select:none;"
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointercancel={onPointerUp}
		role="presentation"
	>
		<div class="stage">
			<div bind:this={sphereRef} class="sphere">
				{#each sphereItems as it, i (`${it.x},${it.y},${i}`)}
					<div
						class="sphere-item absolute m-auto"
						data-preview={it.preview}
						data-types={it.types}
						data-index={it.originalIndex}
						data-offset-x={it.x}
						data-offset-y={it.y}
						data-size-x={it.sizeX}
						data-size-y={it.sizeY}
						style="--offset-x:{it.x};--offset-y:{it.y};--item-size-x:{it.sizeX};--item-size-y:{it.sizeY};top:-999px;bottom:-999px;left:-999px;right:-999px;"
					>
						<div
							class="item__image absolute block overflow-hidden cursor-pointer bg-gray-200 transition-transform duration-300"
							role="button"
							tabindex="0"
							aria-label={`Open item ${it.originalIndex}`}
							onclick={(e) => tileClick(e, it.originalIndex)}
							onpointerdown={(e) => e.stopPropagation()}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									onItemClick?.(it.originalIndex);
								}
							}}
							style="inset:10px;border-radius:var(--tile-radius, {imageBorderRadius});backface-visibility:hidden;"
						>
							<img
								src={it.preview}
								draggable="false"
								alt={it.types}
								class="w-full h-full object-cover pointer-events-none"
								style="backface-visibility:hidden;filter:var(--image-filter, {grayscale ? 'grayscale(1)' : 'none'});"
							/>
						</div>
					</div>
				{/each}
			</div>
		</div>
		<div
			class="absolute inset-0 m-auto z-3 pointer-events-none"
			style="background-image:radial-gradient(rgba(235,235,235,0) 65%, var(--overlay-blur-color, {overlayBlurColor}) 100%);"
		></div>
		<div
			class="absolute inset-0 m-auto z-3 pointer-events-none"
			style="-webkit-mask-image:radial-gradient(rgba(235,235,235,0) 70%, var(--overlay-blur-color, {overlayBlurColor}) 90%);mask-image:radial-gradient(rgba(235,235,235,0) 70%, var(--overlay-blur-color, {overlayBlurColor}) 90%);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);"
		></div>
		<div
			class="absolute left-0 right-0 top-0 h-30 z-5 pointer-events-none rotate-180"
			style="background:linear-gradient(to bottom, transparent, var(--overlay-blur-color, {overlayBlurColor}));"
		></div>
		<div
			class="gallery-bottom-overlay absolute bottom-0 left-0 right-0 z-5 pointer-events-none"
			style={`z-index:50;height:7.5rem;background:linear-gradient(to bottom, transparent 0%, ${overlayBlurColor} 100%);`}
		></div>
	</div>
</div>

<style>
	:global(.sphere-root) {
		--radius: 520px;
		--circ: calc(var(--radius) * 3.14);
		--rot-y: calc((360deg / var(--segments-x)) / 2);
		--rot-x: calc((360deg / var(--segments-y)) / 2);
		--item-width: calc(var(--circ) / var(--segments-x));
		--item-height: calc(var(--circ) / var(--segments-y));
	}
	:global(.sphere-root *) { box-sizing: border-box; }
	.gallery-bottom-overlay {
		height: 7.5rem;
		backdrop-filter: blur(3px);
		-webkit-backdrop-filter: blur(3px);
	}
	:global(.sphere-root .sphere),
	:global(.sphere-root .sphere-item),
	:global(.sphere-root .item__image) { transform-style: preserve-3d; }
	:global(.sphere-root .stage) {
		width: 100%; height: 100%;
		display: grid; place-items: center;
		position: absolute; inset: 0; margin: auto;
		perspective: calc(var(--radius) * 2);
		perspective-origin: 50% 50%;
	}
	:global(.sphere-root .sphere) {
		transform: translateZ(calc(var(--radius) * -1));
		will-change: transform;
		position: absolute;
		transition: transform 140ms cubic-bezier(0.22, 1, 0.36, 1);
	}
	:global(.sphere-root .sphere.is-dragging) {
		transition: none;
	}
	:global(.sphere-root .sphere-item) {
		width: calc(var(--item-width) * var(--item-size-x));
		height: calc(var(--item-height) * var(--item-size-y));
		position: absolute;
		top: -999px; bottom: -999px; left: -999px; right: -999px;
		margin: auto;
		transform-origin: 50% 50%;
		backface-visibility: hidden;
		transition: transform 300ms;
		transform:
			rotateY(calc(var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2)) + var(--rot-y-delta, 0deg)))
			rotateX(calc(var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2)) + var(--rot-x-delta, 0deg)))
			translateZ(var(--radius));
	}
	:global(.item__image) {
		position: absolute;
		inset: 10px;
		border-radius: var(--tile-radius, 12px);
		overflow: hidden;
		cursor: pointer;
		backface-visibility: hidden;
		transition: transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 420ms ease, filter 420ms ease;
		pointer-events: auto;
		transform: translateZ(0);
	}
	:global(.item__image::after) {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(120deg, transparent 20%, rgba(255, 255, 255, 0.42) 50%, transparent 80%);
		transform: translateX(-130%);
		transition: transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1);
		pointer-events: none;
	}
	:global(.item__image img) {
		transition: transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1), filter 420ms ease;
	}
	@media (hover: hover) {
		:global(.sphere-root .item__image:hover),
		:global(.sphere-root .item__image:focus-visible) {
			transform: translateZ(28px) scale(1.08);
			box-shadow: 0 22px 38px rgba(0, 0, 0, 0.32);
			filter: saturate(1.12);
		}
		:global(.sphere-root .item__image:hover::after),
		:global(.sphere-root .item__image:focus-visible::after) {
			transform: translateX(130%);
		}
		:global(.sphere-root .item__image:hover img),
		:global(.sphere-root .item__image:focus-visible img) {
			transform: scale(1.06);
			filter: var(--image-filter, none) contrast(1.06);
		}
	}
	:global(.item__image--reference) {
		position: absolute;
		inset: 10px;
		pointer-events: none;
	}
</style>