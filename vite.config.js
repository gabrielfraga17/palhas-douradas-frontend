import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Config mínima — sem necessidade de proxy de dev, já que o frontend
// consome a Sales Platform API diretamente pela URL pública do Cloud Run
// (ver src/App.jsx), não por um backend local.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
