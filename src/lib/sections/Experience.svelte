<script lang="ts">
	import { onMount } from 'svelte';
	import experiences from '../data/experience';

	let sectionRef: HTMLElement;
	let activeIndex = $state(0);

	function setSectionRef(element: HTMLElement) {
		sectionRef = element;
	}

	function updateActiveExperience() {
		if (!sectionRef || experiences.length <= 1) {
			activeIndex = 0;
			return;
		}

		const sectionTop = sectionRef.offsetTop;
		const scrollableDistance = sectionRef.offsetHeight - window.innerHeight;
		const progress = scrollableDistance > 0
			? Math.min(Math.max((window.scrollY - sectionTop) / scrollableDistance, 0), 1)
			: 0;
		activeIndex = Math.min(Math.floor(progress * experiences.length), experiences.length - 1);
	}

	function selectExperience(index: number) {
		activeIndex = index;
		if (!sectionRef) return;

		const distance = Math.max(sectionRef.offsetHeight - window.innerHeight, 0);
		const targetProgress = experiences.length > 1 ? index / (experiences.length - 1) : 0;
		window.scrollTo({
			top: sectionRef.offsetTop + distance * targetProgress,
			behavior: 'smooth'
		});
	}

	onMount(() => {
		updateActiveExperience();
		window.addEventListener('scroll', updateActiveExperience, { passive: true });
		window.addEventListener('resize', updateActiveExperience);

		return () => {
			window.removeEventListener('scroll', updateActiveExperience);
			window.removeEventListener('resize', updateActiveExperience);
		};
	});
</script>

<section
	id="experience"
	{@attach setSectionRef}
	class="relative bg-bg"
	style:height={`${Math.max(experiences.length, 1) * 100}svh`}
>
	<div class="sticky top-0 h-svh overflow-hidden">
		{#if experiences.length > 0}
			<div class="mx-auto grid h-full w-full max-w-7xl grid-cols-[minmax(0,1fr)_1.5rem] items-center gap-4 px-6 md:grid-cols-[minmax(0,1fr)_14rem] md:gap-8 md:px-12 lg:px-16">
				<div class="relative min-w-0">
					<p class="mb-4 font-body text-body-sm font-semibold uppercase tracking-[0.22em] text-primary">
						Experience
					</p>

					<div class="relative grid">
						{#each experiences as item, index (item.company + item.start)}
							<article
								class={['experience-card', { active: index === activeIndex }]}
								aria-hidden={index !== activeIndex}
							>
								<div class="mb-10 flex items-center gap-4 font-body text-body-sm font-medium text-muted">
									<span>{item.start}</span>
									<span class="h-px flex-1 bg-border"></span>
									<span>{item.end}</span>
								</div>
								<h2 class="max-w-3xl font-display text-section font-bold leading-tight text-main">
									{item.title}
								</h2>
								<p class="mt-3 font-display text-subheading text-primary-dark">
									{item.company}
								</p>
								<p class="mt-8 max-w-2xl font-body text-body-lg leading-relaxed text-muted">
									{item.description}
								</p>
							</article>
						{/each}
					</div>
				</div>

				<nav class="timeline" aria-label="Experience timeline">
					<div class="timeline-track" aria-hidden="true">
						<span
							class="timeline-progress"
							style:height={`${experiences.length > 1 ? (activeIndex / (experiences.length - 1)) * 100 : 100}%`}
						></span>
					</div>
					{#each experiences as item, index (item.company + item.start + item.end)}
						<button
							class={['timeline-point', { active: index === activeIndex }]}
							type="button"
							onclick={() => selectExperience(index)}
							aria-current={index === activeIndex ? 'step' : undefined}
							style={`--timeline-position: ${experiences.length > 1 ? (index / (experiences.length - 1)) * 100 : 50}%`}
						>
							<span class="timeline-dot" aria-hidden="true"></span>
							<span class="timeline-date">
								<strong>{item.start}</strong>
								{#if item.end !== item.start}
									<small>{item.end}</small>
								{/if}
							</span>
						</button>
					{/each}
				</nav>
			</div>
		{:else}
			<div class="mx-auto flex h-full max-w-7xl items-center px-6 md:px-12 lg:px-16">
				<div>
					<p class="mb-4 font-body text-body-sm font-semibold uppercase tracking-[0.22em] text-primary">
						Experience
					</p>
					<h2 class="max-w-3xl font-display text-section font-bold leading-tight text-main">
						Still looking for my first launch :D
					</h2>
				</div>
			</div>
		{/if}
	</div>
</section>

<style>
	.experience-card {
		grid-area: 1 / 1;
		opacity: 0;
		pointer-events: none;
		transform: translateY(28px);
		transition: opacity 600ms ease, transform 600ms ease;
	}

	.experience-card.active {
		position: relative;
		opacity: 1;
		pointer-events: auto;
		transform: translateY(0);
	}

	.timeline {
		position: relative;
		align-self: stretch;
		height: min(70svh, 620px);
		margin-block: auto;
	}

	.timeline-track {
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
		width: 2px;
		background: var(--color-border);
	}

	.timeline-progress {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		background: var(--color-primary);
		transition: height 500ms ease;
	}

	.timeline-point {
		position: absolute;
		top: var(--timeline-position);
		right: -7px;
		display: flex;
		align-items: center;
		flex-direction: row-reverse;
		transform: translateY(-50%);
		border: 0;
		padding: 0;
		background: transparent;
		cursor: pointer;
		color: var(--color-muted);
	}

	.timeline-dot {
		width: 16px;
		height: 16px;
		border: 2px solid var(--color-border);
		border-radius: 9999px;
		background: var(--color-bg);
		transition: border-color 300ms ease, background 300ms ease, transform 300ms ease;
	}

	.timeline-point.active {
		color: var(--color-main);
	}

	.timeline-point.active .timeline-dot {
		border-color: var(--color-primary);
		background: var(--color-primary);
		transform: scale(1.25);
	}

	.timeline-date {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		min-width: 8rem;
		margin-right: 1rem;
		font-family: var(--font-body);
		text-align: right;
	}

	.timeline-date strong {
		font-size: var(--text-body-sm);
	}

	.timeline-date small {
		margin-top: 0.15rem;
		font-size: 0.75rem;
	}

	@media (max-width: 767px) {
		.timeline-date {
			min-width: 0;
			margin: 0;
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip-path: inset(50%);
			white-space: nowrap;
		}

		.timeline-point {
			right: -21px;
			width: 44px;
			height: 44px;
			justify-content: center;
		}
	}

	@media (pointer: coarse) {
		.timeline-point {
			min-height: 2.75rem;
		}
	}
</style>