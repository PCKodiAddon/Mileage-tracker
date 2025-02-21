export default {
  server: {
    port: 8000
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
}