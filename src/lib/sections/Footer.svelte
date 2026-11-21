<script lang="ts">
	import Icon from "@iconify/svelte";

	const email = "shehabehabb701@gmail.com";
	const freelanceUrl = "https://www.freelancer.com/u/shehab1ehab";
	const arrowIcon = { width: 24, height: 24, body: '<path fill="currentColor" d="M14 16.94v-4H5.08l-.03-2.01H14V6.94l5 5Z"/>' };
</script>

<footer class="contact-footer">

	<div class="contact-intro">
		<p class="eyebrow">Start a new project</p>
		<h2>Let&apos;s Make It Happen</h2>
		<p class="contact-copy">
			Open to new opportunities, collaborations, and creative challenges.<br class="hidden sm:block" />
			Every great world begins with a blank canvas.
		</p>

		<div class="contact-actions">
			<a class="cta-button" href={`mailto:${email}`}>
				<Icon icon={arrowIcon} />
				Get in Touch
			</a>
			<a
				class="freelance-link"
				href={freelanceUrl}
				target="_blank"
				rel="noreferrer"
			>
				or hire me on Freelancer
			</a>
		</div>
	</div>

	<div class="footer-bar">
		<nav aria-label="Footer navigation">
			<a href="#top">Home</a>
			<a href="#about">About</a>
			<a href="#work">Work</a>
			<a href="#experience">Experience</a>
			<a href={`mailto:${email}`}>Contact</a>
		</nav>
		<p>&copy; {new Date().getFullYear()} Shehab Ehab. All rights reserved.</p>
	</div>

	<!-- <div class="signature" aria-hidden="true">Shehab Ehab</div> -->
</footer>

<style>
	.contact-footer {
		position: relative;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		background: var(--color-bg);
		color: var(--color-main);
		margin-top: clamp(4rem, 10vw, 10rem);
		gap: clamp(3rem, 10vw, 10.5rem);
		padding: 0 clamp(1.25rem, 10vw, 10rem);
	}

	.contact-intro {
		position: relative;
		z-index: 1;
		align-self: center;
		width: 100%;
		padding: 6rem 1.5rem 2rem;
		text-align: center;
	}

	.eyebrow {
		margin-bottom: 0.75rem;
		color: var(--color-primary-dark);
		font-family: var(--font-body);
		font-size: var(--text-caption);
		font-weight: 700;
		letter-spacing: 0.24em;
		text-transform: uppercase;
	}

	.contact-intro h2 {
		font-family: var(--font-display);
		font-size: clamp(3.25rem, 7vw, 7.25rem);
		font-weight: 400;
		line-height: 0.95;
		letter-spacing: -0.04em;
	}

	.contact-copy {
		margin: 1.25rem auto 0;
		max-width: 48rem;
		font-family: var(--font-body);
		font-size: clamp(0.95rem, 1.25vw, 1.125rem);
		line-height: 1.55;
		color: var(--color-muted);
	}

	.contact-actions {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		margin-top: 1.8rem;
	}

	.cta-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		border-radius: 9999px;
		padding: 0.75rem 1.15rem;
		background: var(--color-dark);
		font-family: var(--font-body);
		font-size: var(--text-body-sm);
		color: var(--color-soft);
		box-shadow: 0 8px 25px rgba(10, 10, 10, 0.14);
		transition: transform 200ms ease, background-color 200ms ease;
	}

	.cta-button:hover {
		transform: translateY(-2px);
		background: var(--color-primary-dark);
	}

	.freelance-link {
		margin-top: 0.65rem;
		font-family: var(--font-body);
		font-size: var(--text-caption);
		text-decoration: underline;
		text-underline-offset: 0.2rem;
		color: var(--color-muted);
	}

	.cta-button :global(svg) {
		width: 1rem;
		height: 1rem;
	}

	.footer-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		border-top: 1px solid rgba(10, 10, 10, 0.06);
		padding: 1.25rem clamp(1.5rem, 3vw, 4rem);
		font-family: var(--font-body);
		font-size: var(--text-body-sm);
	}

	.footer-bar nav {
		display: flex;
		flex-wrap: wrap;
		gap: clamp(1rem, 2.5vw, 2.25rem);
	}

	.footer-bar nav a {
		transition: color 200ms ease;
	}

	.footer-bar nav a:hover {
		color: var(--color-primary-dark);
	}

	.footer-bar p {
		color: var(--color-muted);
		font-size: var(--text-caption);
		text-align: right;
	}

	@media (max-width: 767px) {
		.contact-footer {
			margin-top: 4rem;
			gap: 3rem;
			padding-inline: 0;
		}

		.contact-intro {
			padding-inline: 1rem;
		}

		.footer-bar {
			align-items: flex-start;
			flex-direction: column;
			padding-inline: 1.25rem;
		}

		.footer-bar nav {
			width: 100%;
			justify-content: space-between;
			gap: 0.75rem;
		}

		.footer-bar p {
			width: 100%;
			text-align: left;
		}
	}

	@media (pointer: coarse) {
		.freelance-link,
		.footer-bar nav a {
			display: inline-flex;
			align-items: center;
			min-height: 2.75rem;
		}

		.footer-bar nav a {
			padding-inline: 0.35rem;
		}
	}
</style>
