import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const RAW_DIR = path.join(ROOT_DIR, "raw");

// Define where optimized images should go based on their subfolder in /raw
// e.g. raw/ai-token-economy/hero.png -> src/ai-token-economy/assets/hero.webp
// raw/hero.png -> src/assets/hero.webp
function getDestDir(subDir) {
  if (!subDir || subDir === ".") {
    return path.join(ROOT_DIR, "src", "assets");
  }
  return path.join(ROOT_DIR, "src", subDir, "assets");
}

async function processDirectory(dir, relPath = "") {
  const currentDir = path.join(dir, relPath);
  if (!fs.existsSync(currentDir)) return;

  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const entryRelPath = path.join(relPath, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(dir, entryRelPath);
    } else if (entry.isFile() && /\.(png|jpe?g)$/i.test(entry.name)) {
      const srcPath = path.join(dir, entryRelPath);
      const destDir = getDestDir(path.dirname(entryRelPath));

      // Ensure destination directory exists
      fs.mkdirSync(destDir, { recursive: true });

      const filename = path.parse(entry.name).name;
      const destPath = path.join(destDir, `${filename}.webp`);

      console.log(`Optimizing: ${entryRelPath} -> ${path.relative(ROOT_DIR, destPath)}`);

      await sharp(srcPath)
        .webp({ quality: 80, effort: 6 }) // Convert to WebP, set quality to 80%
        .toFile(destPath);
    }
  }
}

async function run() {
  if (!fs.existsSync(RAW_DIR)) {
    fs.mkdirSync(RAW_DIR);
    console.log(
      "Created /raw directory. Place your large PNGs here in subfolders (e.g. raw/ai-token-economy/)",
    );
    return;
  }
  await processDirectory(RAW_DIR);
  console.log("Optimization complete!");
}

run().catch(console.error);
