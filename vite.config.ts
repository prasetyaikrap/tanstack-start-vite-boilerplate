import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";

const config = defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    // Path aliases from tsconfig.json (@/* → src/*), built into Vite 8
    tsconfigPaths: true,
  },
  plugins: [
    devtools(),
    nitro(),
    tanstackStart({
      router: {
        routeFileIgnorePattern:
          "components|utils|hooks|types|type|schema|constants",
      },
    }),
    viteReact(),
  ],
});

export default config;
