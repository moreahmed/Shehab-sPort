<script lang="ts">
    import { onMount } from "svelte";
	import Depthribbon from "../components/Depthribbon.svelte";
	import projects from "../data/projects";
	import ProjectPreview from "../components/ProjectPreview.svelte";
	import type { Project } from "../data/projects";

    let width = $state(0);
    let cardWidth = $derived(width < 480 ? 140 : width < 768 ? 180 : 220);
    let cardHeight = $derived(width < 480 ? 200 : width < 768 ? 250 : 300);
    const ribbonImages = projects.map(({ preview, title }) => ({ src: preview, alt: title }));

    const onResize = () => {
        width = window.innerWidth;
    }

    onMount(() => {
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    })

    let isProjectFocused = $state(false);
    let project = $state<Project | null>(null);

    function handleProjectFocus(i: number) {
        project = projects[i];
        isProjectFocused = true;
    }

    function closeProjectPreview() {
        isProjectFocused = false;
        project = null;
    }

</script>

<section id="work" class="relative h-screen overflow-hidden">
    <h2 class="work-heading text-shadow-sm">My Work</h2>
    <div class="ribbon-stage">
        <Depthribbon
            images={ribbonImages}
            {cardWidth}
            {cardHeight}
            onselect={handleProjectFocus}
        />
    </div>

    {#if isProjectFocused}
        {#if project}
            <ProjectPreview project={project} onclose={closeProjectPreview} />
        {/if}
    {/if}

</section>

<style>
    .work-heading {
        position: absolute;
        z-index: 10;
        top: clamp(1.5rem, 5vh, 3rem);
        right: 0;
        left: 0;
        margin: 0;
        font-size: clamp(2rem, 8vw, 3.75rem);
        line-height: 1;
        font-weight: 700;
        text-align: center;
    }

    .ribbon-stage {
        position: absolute;
        z-index: 0;
        inset: 0;
        display: grid;
        place-items: center;
    }
</style>