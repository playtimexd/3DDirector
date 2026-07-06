import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  assetsInclude: ["**/*.fbx", "**/*.obj", "**/*.glb", "**/*.gltf"],
  plugins: [react()],
  server: {
    fs: {
     allow: [
  ".",
  "../模型库",
],
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    pool: "threads",
    maxWorkers: 1,
    setupFiles: "./src/test/setup.ts",
  },
});
