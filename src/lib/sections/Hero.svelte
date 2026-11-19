<script lang="ts">
    import Aurora from "#lib/animated/Aurora.svelte";
    import ShootingStars from "#lib/animated/ShootingStars.svelte";
    import Icon from "@iconify/svelte";
    import { asset } from "$app/paths";
</script>

<!-- Removed bottom padding/margins and set up flex-col to control remaining space -->
<section id="about" class="relative z-10 flex h-screen flex-col overflow-hidden px-6 pt-24 md:px-12 lg:px-16">
    <ShootingStars class="position: absolute; inset: 0; z-index: -1;" count={7} />
    <Aurora style="position: absolute; inset: 0; z-index: -1;" colorStops={[
        "#00b4d8",
        "#03045e"
    ]} />

    <!-- Changed to flex-1 to take up all vertical space inside the section -->
    <div class="stagger-children mx-auto flex w-full max-w-7xl flex-1 flex-col items-center z-100">

        <!-- Social Media -->
        <ul class="text-3xl flex items-center justify-center gap-4 text-white mb-8">
            <li><a href="https://www.linkedin.com/in/shehab-ehab-121731304/" target="_blank"><Icon icon="akar-icons:linkedin-box-fill"/></a></li>
            <li><a href="https://www.freelancer.com/u/shehab1ehab" target="_blank"><Icon icon="simple-icons:freelancer"/></a></li>
            <li><a href="https://www.artstation.com/user-9937728" target="_blank"><Icon icon="bxl:artstation"/></a></li>
            <li><a href="https://www.upwork.com/freelancers/~010dab3331e1a94710"><Icon icon="simple-icons:upwork"/></a></li>
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
                alt="Shehab Ehab — Game Artist"
                class="photo-bw relative z-0 h-full max-h-[70vh] w-full max-w-xs object-contain object-bottom md:max-w-sm lg:max-w-xl mask-[linear-gradient(to_bottom,black_80%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]"
            />
        </div>
    </div>
</section>