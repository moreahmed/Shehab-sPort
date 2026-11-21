<script lang="ts">
    import Aurora from "#lib/animated/Aurora.svelte";
    import ShootingStars from "#lib/animated/ShootingStars.svelte";
    import Icon from "@iconify/svelte";
    import { asset } from "$app/paths";
    import { onMount } from "svelte";

    const icons = {
        linkedin: { width: 24, height: 24, body: '<path fill="currentColor" fill-rule="evenodd" d="M1 2.838A1.84 1.84 0 0 1 2.838 1H21.16A1.837 1.837 0 0 1 23 2.838V21.16A1.84 1.84 0 0 1 21.161 23H2.838A1.84 1.84 0 0 1 1 21.161zm8.708 6.55h2.979v1.496c.43-.86 1.53-1.634 3.183-1.634c3.169 0 3.92 1.713 3.92 4.856v5.822h-3.207v-5.106c0-1.79-.43-2.8-1.522-2.8c-1.515 0-2.145 1.089-2.145 2.8v5.106H9.708zm-5.5 10.403h3.208V9.25H4.208zM7.875 5.812a2.063 2.063 0 1 1-4.125 0a2.063 2.063 0 0 1 4.125 0" clip-rule="evenodd"/>' },
        freelancer: { width: 24, height: 24, body: '<path fill="currentColor" d="m14.096 3.076l1.634 2.292L24 3.076M5.503 20.924l4.474-4.374l-2.692-2.89m6.133-10.584L11.027 5.23l4.022.15M4.124 3.077l.857 1.76l4.734.294m-3.058 7.072l3.497-6.522L0 5.13m7.064 7.485l3.303 3.548l3.643-3.57l1.13-6.652l-4.439-.228Z"/>' },
        artstation: { width: 24, height: 24, body: '<path fill="currentColor" d="M5.48 20.8h11.21l-2.33-4H2l1.68 2.91a2 2 0 0 0 1.8 1.09M15.1 4.28a2 2 0 0 0-1.78-1.08H9.84L20 20.78L21.6 18a2 2 0 0 0 .4-1.21a2 2 0 0 0-.32-1.09zM8.2 6.05L3.66 13.9h9.06z"/>' },
        upwork: { width: 24, height: 24, body: '<path fill="currentColor" d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076l.008-.042c.207-1.143.849-3.06 2.839-3.06a2.705 2.705 0 0 1 2.703 2.703a2.707 2.707 0 0 1-2.704 2.702m0-8.14c-2.539 0-4.51 1.649-5.31 4.366c-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112a2.55 2.55 0 0 1-2.547 2.548a2.55 2.55 0 0 1-2.545-2.548V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303c2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109c3 0 5.439-2.452 5.439-5.45c0-3-2.439-5.439-5.439-5.439"/>' }
    };

    let auroraDpr = $state<number | undefined>(undefined);

    onMount(() => {
        auroraDpr = matchMedia("(max-width: 767px)").matches ? 1 : undefined;
    });
</script>

<!-- Removed bottom padding/margins and set up flex-col to control remaining space -->
<section id="about" class="relative z-10 flex h-[max(100svh,46rem)] flex-col md:h-[max(100svh,44rem)] overflow-hidden px-6 pt-24 md:px-12 lg:px-16">
    <ShootingStars class="position: absolute; inset: 0; z-index: -1;" count={12} />
    <Aurora style="position: absolute; inset: 0; z-index: -1;" dpr={auroraDpr} colorStops={[
        "#00b4d8",
        "#03045e"
    ]} />

    <!-- Changed to flex-1 to take up all vertical space inside the section -->
    <div class="stagger-children mx-auto flex w-full max-w-7xl flex-1 flex-col items-center z-100">

        <!-- Social Media -->
        <ul class="text-3xl flex items-center justify-center gap-0.5 text-white -my-1 mb-8">
            <li><a class="grid size-11 place-items-center" aria-label="LinkedIn" href="https://www.linkedin.com/in/shehab-ehab-121731304/" target="_blank"><Icon icon={icons.linkedin}/></a></li>
            <li><a class="grid size-11 place-items-center" aria-label="Freelancer" href="https://www.freelancer.com/u/shehab1ehab" target="_blank"><Icon icon={icons.freelancer}/></a></li>
            <li><a class="grid size-11 place-items-center" aria-label="ArtStation" href="https://www.artstation.com/user-9937728" target="_blank"><Icon icon={icons.artstation}/></a></li>
            <li><a class="grid size-11 place-items-center" aria-label="Upwork" href="https://www.upwork.com/freelancers/~010dab3331e1a94710"><Icon icon={icons.upwork}/></a></li>
        </ul>

        <!-- Hero Heading (Stays at the top) -->
        <div class="relative z-10 shrink-0">
            <h1 class="text-center font-display text-display font-bold text-white">
                Hi I'm Shehab
            </h1>
            <p class="text-center font-display text-display italic text-white">
                Game Artist
            </p>
        </div>

        <!-- Mobile-only badges (Moved above the image so they don't push the image up) -->
        <div class="mt-8 flex w-full shrink-0 flex-col items-center gap-3 z-20 md:hidden">
            <div class="inline-flex items-center gap-2 rounded-full border border-border bg-soft px-4 py-2">
                <span class="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                <span class="font-body text-body-sm font-medium text-main"
                    >Available for new opportunities</span
                >
            </div>
            <p class="max-w-70 text-center font-body text-body-sm leading-relaxed text-muted">
                passionate about creating immersive game worlds and stunning visual experiences that
                captivate players.
            </p>
        </div>

        <!-- Hero Image Container (flex-1 pushes it completely to the bottom) -->
        <div class="relative flex w-full flex-1 items-end justify-center md:-mt-12 z-10">
            
            <!-- Availability Badge (Desktop - left side) -->
            <div
                class="absolute top-1/4 left-0 z-10 hidden items-center gap-2 rounded-full border border-border bg-soft px-4 py-2 shadow-sm md:inline-flex lg:left-4"
            >
                <span class="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                <span class="font-body text-body-sm font-medium text-main"
                    >Available for new opportunities</span
                >
            </div>

            <!-- Description Text (Desktop - right side) -->
            <p
                class="absolute top-1/4 right-0 z-10 hidden max-w-55 text-right font-body text-body-sm leading-relaxed text-muted md:block lg:right-4"
            >
                passionate about creating immersive game worlds and stunning visual experiences that
                captivate players.
            </p>

            <!-- Person Image 
                 1. Added object-bottom so it anchors to the base. 
                 2. Added mask-image to create the smooth fade at the bottom. 
            -->
            <img
                src={asset("Person.png")}
                fetchpriority="high"
                alt="Shehab Ehab — Game Artist"
                class="photo-bw relative z-0 h-full max-h-[70vh] w-full max-w-xs object-contain object-bottom md:max-w-sm lg:max-w-xl mask-[linear-gradient(to_bottom,black_80%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]"
            />
        </div>
    </div>
</section>