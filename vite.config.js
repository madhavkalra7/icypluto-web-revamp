import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          universe: ['three'],
          'world-support': ['three/addons/environments/RoomEnvironment.js', 'three/addons/geometries/RoundedBoxGeometry.js'],
          motion: ['gsap', 'gsap/ScrollTrigger'],
        },
      },
    },
  },
});
