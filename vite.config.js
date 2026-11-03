import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          universe: ['three'],
          motion: ['gsap', 'gsap/ScrollTrigger'],
        },
      },
    },
  },
});
