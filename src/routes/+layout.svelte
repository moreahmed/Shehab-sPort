<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import SparkCursor from '#lib/animated/SparkCursor.svelte';
	import { asset } from '$app/paths';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Shehab Ehab</title>
</svelte:head>

{@render children()}

<SparkCursor image={asset('cursor.png')} size={40} hotspot={[0.8, 0.5]} />
