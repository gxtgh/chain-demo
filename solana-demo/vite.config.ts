import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true
      },
      protocolImports: true
    })
  ],
  define: {
    global: "globalThis"
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("@metaplex-foundation/mpl-token-metadata")) {
            return "metaplex-metadata-vendor";
          }

          if (id.includes("@metaplex-foundation/umi") || id.includes("@metaplex-foundation/mpl-toolbox")) {
            return "metaplex-umi-vendor";
          }

          if (id.includes("@solana/web3.js") || id.includes("@solana/spl-token") || id.includes("bs58")) {
            return "solana-vendor";
          }

          if (id.includes("zustand")) {
            return "state-vendor";
          }

          if (id.includes("@solana/wallet-adapter") || id.includes("react") || id.includes("scheduler")) {
            return "react-vendor";
          }

          return undefined;
        }
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: 3001
  }
});
