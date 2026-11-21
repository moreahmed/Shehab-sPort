<script lang="ts">
	import { type Project } from "../data/projects";
	import { onMount } from "svelte";
	import Icon from "@iconify/svelte";
	import ModelViewer from "./ModelViewer.svelte";

	let { project, onclose }: { project: Project; onclose: () => void } = $props();
	const closeIcon = { width: 24, height: 24, body: '<path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/>' };
	let prioritizedAssets = $derived(
		[...project.assets].sort((left, right) => (right.priority ?? 0) - (left.priority ?? 0))
	);
	let primaryAsset = $derived(prioritizedAssets[0]);

	onMount(() => {
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onclose();
		};
		window.addEventListener("keydown", handleKeydown);

		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", handleKeydown);
		};
	});

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) onclose();
	}
</script>

<div class="preview-backdrop" role="presentation" onclick={handleBackdropClick}>
	<div class="preview-panel" role="dialog" tabindex="-1" aria-modal="true" aria-label={`${project.title} project preview`}>
		<button type="button" class="close-button cursor-pointer" aria-label="Close project preview" onclick={onclose}>
			<Icon icon={closeIcon} />
		</button>

		<div class="project-layout">
			<div class={["main-view w-full md:h-[85vh] md:w-fit", primaryAsset?.type === "3d" ? "h-[62svh]" : "h-auto"]}>
				<h2>{project.title}</h2>
				{#if primaryAsset?.type === "video"}
					<video src={primaryAsset.url} controls poster={project.thumb ?? project.preview}>
						<track kind="captions" />
					</video>
				{:else if primaryAsset?.type === "3d"}
					<ModelViewer src={primaryAsset.url} label={project.title} />
				{:else}
					<img src={primaryAsset?.url ?? project.preview} alt={primaryAsset?.alt ?? project.title} />
				{/if}
			</div>

			<aside class="project-rail">
				<div class="detail-views">
					{#each prioritizedAssets.slice(1) as asset, index (asset.url + index)}
						<div class="detail-view">
							{#if asset.type === "video"}
								<video src={asset.url} controls poster={project.thumb ?? project.preview}>
									<track kind="captions" />
								</video>
							{:else if asset.type === "3d"}
								<ModelViewer src={asset.url} label={`${project.title} detail ${index + 1}`} />
							{:else}
								<img src={asset.url} alt={asset.alt ?? `${project.title} detail ${index + 1}`} />
							{/if}
						</div>
					{/each}
				</div>
			</aside>
		</div>
	</div>
</div>

<style>
	.preview-backdrop {
		position: fixed;
		z-index: 1000;
		inset: 0;
		overflow-y: auto;
		background: rgba(210, 210, 210, 0.78);
		backdrop-filter: blur(18px);
		display: flex;
	}

	.preview-panel {
		position: relative;
		width: 100%;
		min-height: 100svh;
	}

	.project-layout {
		display: grid;
		min-height: 100svh;
		grid-template-columns: minmax(0, 3fr) minmax(14rem, 1fr);
		gap: clamp(0.75rem, 1.5vw, 1.5rem);
		padding: clamp(4rem, 8vh, 7rem) clamp(1rem, 5vw, 5rem) clamp(1rem, 4vw, 3rem);
	}

	.close-button {
		position: absolute;
		z-index: 2;
		top: clamp(1rem, 2vw, 2rem);
		right: clamp(1rem, 2vw, 2rem);
		display: grid;
		flex: 0 0 auto;
		width: 3rem;
		height: 3rem;
		place-items: center;
		border-radius: 9999px;
		background: var(--color-dark);
		color: var(--color-soft);
	}

	.close-button :global(svg) {
		width: 1.35rem;
		height: 1.35rem;
	}

	.main-view {
		min-height: 0;
		overflow: hidden;
		border-radius: 0.5rem;
	}

	.main-view img,
	.main-view video,
	.main-view :global(.model-viewer) {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	
	.main-view h2 {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 3vw, 3.25rem);
		line-height: 1;
		margin-bottom: 1rem;
	}

	.project-rail {
		min-height: 0;
		max-height: 85vh;
		overflow-y: auto;
	}

	.detail-views {
		display: grid;
		grid-auto-rows: minmax(7rem, 14rem);
		gap: clamp(0.75rem, 2vh, 1.5rem);
	}

	.detail-view {
		min-height: 7rem;
		overflow: hidden;
		border-radius: 0.4rem;
		background: var(--color-dark);
	}

	.detail-view img,
	.detail-view video,
	.detail-view :global(.model-viewer) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	@media (max-width: 767px) {
		.preview-backdrop {
			padding: 0;
			backdrop-filter: none;
			background: rgba(214, 214, 214, 0.96);
		}

		.preview-panel {
			min-height: 100svh;
		}

		.project-layout {
			grid-template-columns: 1fr;
			grid-template-rows: auto auto;
			align-content: start;
			padding: 4.5rem 1rem 1rem;
		}

		.project-rail {
			max-height: none;
			overflow-y: visible;
		}

		.detail-views {
			grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
			grid-auto-rows: 8rem;
		}

		.main-view {
			display: flex;
			flex-direction: column;
		}

		.main-view img,
		.main-view video {
			flex: none;
			height: auto;
			max-height: 62svh;
		}

		.main-view :global(.model-viewer) {
			flex: 1 1 0;
			min-height: 0;
			height: auto;
		}
	}
</style>