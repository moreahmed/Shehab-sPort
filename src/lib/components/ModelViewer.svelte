<script lang="ts">
	import type * as THREE from "three";

	type ThreeModule = typeof import("three");
	type GLTFLoaderConstructor = typeof import("three/addons/loaders/GLTFLoader.js").GLTFLoader;
	type OrbitControlsConstructor = typeof import("three/addons/controls/OrbitControls.js").OrbitControls;
	type DRACOLoaderConstructor = typeof import("three/addons/loaders/DRACOLoader.js").DRACOLoader;

	let { src, label }: { src: string; label: string } = $props();
	let status = $state<"loading" | "ready" | "error">("loading");

	function disposeObject(object: THREE.Object3D, three: ThreeModule) {
		object.traverse((child) => {
			if (!(child instanceof three.Mesh)) return;

			child.geometry.dispose();
			const materials = Array.isArray(child.material) ? child.material : [child.material];
			for (const material of materials) {
				for (const value of Object.values(material)) {
					if (value instanceof three.Texture) value.dispose();
				}
				material.dispose();
			}
		});
	}

	function initializeRenderer(
		canvas: HTMLCanvasElement,
		viewport: HTMLElement,
		modelUrl: string,
		three: ThreeModule,
		GLTFLoader: GLTFLoaderConstructor,
		OrbitControls: OrbitControlsConstructor,
		DRACOLoader: DRACOLoaderConstructor,
		dracoWrapperUrl: string,
		dracoDecoderUrl: string,
		isDisposed: () => boolean
	) {
		const updateStatus = (nextStatus: "loading" | "ready" | "error") => {
			if (!isDisposed()) status = nextStatus;
		};

		let renderer: InstanceType<ThreeModule["WebGLRenderer"]>;
		try {
			renderer = new three.WebGLRenderer({ canvas, antialias: true, alpha: true });
		} catch (error) {
			console.error("Unable to initialize the 3D preview.", error);
			updateStatus("error");
			return;
		}

		const scene = new three.Scene();
		const camera = new three.PerspectiveCamera(35, 1, 0.01, 100);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.outputColorSpace = three.SRGBColorSpace;
		renderer.toneMapping = three.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.1;

		scene.add(new three.HemisphereLight(0xffffff, 0x4a5568, 1.8));

		const keyLight = new three.DirectionalLight(0xfff1d6, 3.2);
		keyLight.position.set(4, 6, 5);
		scene.add(keyLight);

		const fillLight = new three.DirectionalLight(0xd5e5ff, 1.5);
		fillLight.position.set(-5, 2, 3);
		scene.add(fillLight);

		const rimLight = new three.DirectionalLight(0xffffff, 2.2);
		rimLight.position.set(0, 4, -5);
		scene.add(rimLight);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.08;
		controls.enablePan = false;
		controls.enableZoom = false;
		controls.rotateSpeed = 0.8;

		let loadedModel: THREE.Object3D | undefined;

		const resizeObserver = new ResizeObserver(([entry]) => {
			const { width, height } = entry.contentRect;
			if (width === 0 || height === 0) return;

			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height, false);
		});
		resizeObserver.observe(viewport);

		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath({ js: dracoWrapperUrl, wasm: dracoDecoderUrl });
		const loader = new GLTFLoader().setDRACOLoader(dracoLoader);
		loader.load(
			modelUrl,
			(gltf) => {
				if (isDisposed()) {
					disposeObject(gltf.scene, three);
					return;
				}

				const bounds = new three.Box3().setFromObject(gltf.scene);
				if (bounds.isEmpty()) {
					console.error(`The 3D model at ${modelUrl} contains no renderable bounds.`);
					updateStatus("error");
					return;
				}

				const center = bounds.getCenter(new three.Vector3());
				const size = bounds.getSize(new three.Vector3());
				const maxDimension = Math.max(size.x, size.y, size.z);
				const scale = 2.4 / maxDimension;
				const modelGroup = new three.Group();
				gltf.scene.position.sub(center);
				modelGroup.add(gltf.scene);
				modelGroup.scale.setScalar(scale);
				scene.add(modelGroup);
				loadedModel = modelGroup;

				const radius = (size.length() * scale) / 2;
				const cameraDistance = radius / Math.sin(three.MathUtils.degToRad(camera.fov / 2)) * 1.15;
				camera.position.set(0, radius * 0.15, cameraDistance);
				camera.near = Math.max(radius / 100, 0.01);
				camera.far = cameraDistance + radius * 10;
				camera.updateProjectionMatrix();
				controls.target.set(0, 0, 0);
				controls.update();
				updateStatus("ready");
			},
			undefined,
			(error) => {
				if (isDisposed()) return;
				console.error(`Unable to load the 3D model at ${modelUrl}.`, error);
				updateStatus("error");
			}
		);

		renderer.setAnimationLoop(() => {
			controls.update();
			renderer.render(scene, camera);
		});

		return () => {
			resizeObserver.disconnect();
			renderer.setAnimationLoop(null);
			controls.dispose();
			dracoLoader.dispose();
			if (loadedModel) disposeObject(loadedModel, three);
			scene.clear();
			renderer.dispose();
		};
	}

	function setupRenderer(canvas: HTMLCanvasElement) {
		const viewport = canvas.parentElement;
		if (!viewport) {
			console.error("Unable to initialize the 3D preview because its canvas has no container.");
			status = "error";
			return;
		}

		let disposed = false;
		let cleanup: (() => void) | undefined;
		const modelUrl = new URL(src.startsWith("/") ? src : `/${src}`, window.location.origin).toString();
		void Promise.all([
			import("three"),
			import("three/addons/loaders/GLTFLoader.js"),
			import("three/addons/controls/OrbitControls.js"),
			import("three/addons/loaders/DRACOLoader.js"),
			import("three/examples/jsm/libs/draco/gltf/draco_wasm_wrapper.js?url"),
			import("three/examples/jsm/libs/draco/gltf/draco_decoder.wasm?url")
		])
			.then(([three, { GLTFLoader }, { OrbitControls }, { DRACOLoader }, { default: dracoWrapperUrl }, { default: dracoDecoderUrl }]) => {
				if (disposed) return;
				cleanup = initializeRenderer(
					canvas,
					viewport,
					modelUrl,
					three,
					GLTFLoader,
					OrbitControls,
					DRACOLoader,
					dracoWrapperUrl,
					dracoDecoderUrl,
					() => disposed
				);
			})
			.catch((error: unknown) => {
				if (disposed) return;
				console.error("Unable to load the 3D preview renderer.", error);
				status = "error";
			});

		return () => {
			disposed = true;
			cleanup?.();
		};
	}
</script>

<div
	class="model-viewer"
	role="group"
	aria-label={`${label}. Drag to rotate the model.`}
	aria-busy={status === "loading"}
>
	<canvas aria-hidden="true" {@attach setupRenderer}></canvas>
	{#if status === "loading"}
		<p class="status-message" role="status">Loading 3D preview…</p>
	{:else if status === "error"}
		<p class="status-message" role="alert">3D preview is unavailable.</p>
	{:else}
		<p class="interaction-hint" aria-hidden="true">Drag to rotate</p>
	{/if}
</div>

<style>
	.model-viewer {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 12rem;
		overflow: hidden;
		background:
			radial-gradient(ellipse at 50% 40%, rgba(116, 132, 156, 0.28), transparent 68%),
			#111827;
		cursor: grab;
		touch-action: none;
	}

	.model-viewer:active {
		cursor: grabbing;
	}

	.model-viewer canvas {
		display: block;
		width: 100%;
		height: 100%;
	}

	.status-message,
	.interaction-hint {
		position: absolute;
		z-index: 1;
		left: 50%;
		transform: translateX(-50%);
		margin: 0;
		color: #f8fafc;
		font-size: 0.8rem;
		text-align: center;
		pointer-events: none;
	}

	.status-message {
		top: 50%;
		width: 100%;
		padding: 0 1rem;
		transform: translate(-50%, -50%);
	}

	.interaction-hint {
		bottom: 1rem;
		padding: 0.4rem 0.75rem;
		border-radius: 9999px;
		background: rgba(15, 23, 42, 0.65);
	}
</style>
