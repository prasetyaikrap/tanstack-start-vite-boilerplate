import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Vitest uses this file instead of vite.config.ts. The app's TanStack Start / Nitro plugins set up SSR builds that
// load a second copy of React in tests ("Invalid hook call"), so tests only use the React plugin
export default defineConfig({
	resolve: {
		// Path aliases from tsconfig.json (@/* → src/*), built into Vite 8
		tsconfigPaths: true,
	},
	plugins: [viteReact()],
	test: {
		environment: "jsdom",
		include: ["src/**/*.test.{ts,tsx}"],
		setupFiles: ["./src/test/setup.ts"],
	},
});
