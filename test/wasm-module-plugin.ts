import type { Plugin } from "vite";

// Node has no `import x from "file.wasm?module"` (a Workers feature), so the module is compiled from the file instead
export function wasmModule(): Plugin {
  return {
    name: "wasm-module",
    enforce: "pre",
    load(id) {
      if (!id.endsWith(".wasm?module")) return;
      const file = id.slice(0, -"?module".length);
      return `import { readFileSync } from "node:fs";
export default new WebAssembly.Module(readFileSync(${JSON.stringify(file)}));`;
    },
  };
}
