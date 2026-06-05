import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
	server: {
		host: true,
		allowedHosts: true
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('@heroui')) {
						return 'heroui';
					}

					if (
						id.includes('node_modules/react') ||
						id.includes('node_modules/react-dom') ||
						id.includes('node_modules/react-router')
					) {
						return 'vendor';
					}
				},
			},
		},
	},
	plugins: [
		tailwindcss(),
		react(),
		VitePWA({
			strategies: 'injectManifest',
			srcDir: 'src',
			filename: 'sw.ts',
			manifest: {
				name: 'Manna - Telugu Bible',
				short_name: 'Manna',
				description: 'Offline Telugu Bible reader',
				theme_color: '#ffffff',
				background_color: '#ffffff',
				display: 'standalone',
				lang: 'te',
				icons: [
					{
						src: 'favicon.svg',
						sizes: 'any',
						type: 'image/svg+xml',
						purpose: 'any',
					},
					{
						src: 'icon-192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any',
					},
					{
						src: 'icon-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any',
					},
					{
						src: 'icon-192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'maskable',
					},
					{
						src: 'icon-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable',
					},
				],
			},
			registerType: 'autoUpdate',
			injectManifest: {
				globPatterns: ['**/*.{css,js,html,svg,woff2}'],
				globIgnores: ['**/bible.json'],
				maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
			},
			devOptions: {
				enabled: true,
				type: 'module',
			},
		}),
	],
});
