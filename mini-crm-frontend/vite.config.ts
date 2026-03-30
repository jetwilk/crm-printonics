import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,      // ← expõe na rede local
    port: 5173,      // ← porta do frontend
    allowedHosts: [
      "printonics.zyns.com"],
  },
});
