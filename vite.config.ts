import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		tailwindcss(),
		react(),
		babel({ presets: [reactCompilerPreset()] }),
		VitePWA({
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
				],
			},
			registerType: 'autoUpdate',
			workbox: {
				globPatterns: ['**/*.{css,js,html,svg,json,woff2}'],
				maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
			},
		}),
	],
});
