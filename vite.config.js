import { defineConfig } from "vite";
import { resolve, relative, join } from "path";
import { readdirSync, statSync } from "fs";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");
const srcDir = resolve(__dirname, "src");

// Helper to recursively find index.html files in subdirectories of src
function getHtmlInputs(dir, fileList = {}) {
  const files = readdirSync(dir);

  for (const file of files) {
    if (file === "node_modules" || file === "dist" || file === ".git" || file === ".github") {
      continue;
    }

    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      getHtmlInputs(filePath, fileList);
    } else if (file === "index.html") {
      const relPath = relative(srcDir, filePath);
      if (relPath === "index.html") {
        fileList["main"] = resolve(filePath);
      } else {
        // e.g. 'ai-token-economy/index.html' -> key 'ai-token-economy'
        const key = relPath.replace("/index.html", "").replace("\\index.html", "");
        fileList[key] = resolve(filePath);
      }
    }
  }

  return fileList;
}

export default defineConfig({
  root: srcDir,
  publicDir: resolve(__dirname, "public"),
  plugins: [tailwindcss()],
  // Base configuration should match repository name for sub-path hosting on GitHub Pages
  base: "/coaching-content/",
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: getHtmlInputs(srcDir),
    },
  },
});
