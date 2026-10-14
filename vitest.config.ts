import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import { defineConfig, type ViteUserConfig } from "vitest/config";

// Vitest uses this file instead of vite.config.ts. The app's TanStack Start / Nitro plugins set up SSR builds that
// load a second copy of React in tests ("Invalid hook call"), so tests only use the React and path-alias plugins
export default defineConfig({
	// vitest bundles its own Vite version, so plugin types from the app's Vite need a cast (runtime is unaffected)
	plugins: [
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		viteReact(),
	] as unknown as ViteUserConfig["plugins"],
	test: {
		environment: "jsdom",
		include: ["src/**/*.test.{ts,tsx}"],
		setupFiles: ["./src/test/setup.ts"],
	},
});
