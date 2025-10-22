import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		port: 5173,
		strictPort: true,

		// Make CORS explicit (module scripts are CORS-fetched)
		cors: { origin: "*" }, // or provide the specific webview origin if you prefer
		headers: { "Access-Control-Allow-Origin": "*" },

		// If you’re in a remote/codespaces/https tunnel, HMR over 443 often helps:
		// hmr: { clientPort: 443 }
	},
	base: "./",
});
