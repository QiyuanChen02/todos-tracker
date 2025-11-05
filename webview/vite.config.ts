import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export const PORT = 5174;

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		port: PORT,
		strictPort: true,
		cors: { origin: "*" },
		headers: { "Access-Control-Allow-Origin": "*" },
	},
	base: "./",
});
