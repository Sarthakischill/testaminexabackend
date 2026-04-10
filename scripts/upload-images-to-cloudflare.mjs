#!/usr/bin/env node

/**
 * Uploads local /public images to Cloudflare Images and replaces all references
 * in the codebase with Cloudflare delivery URLs.
 *
 * Tracks already-uploaded images in .cloudflare-images.json to avoid duplicates.
 * Re-run safely after adding new local images — only new ones get uploaded.
 *
 * Required env vars in .env.local:
 *   CLOUDFLARE_ACCOUNT_ID=<your account id>
 *   CLOUDFLARE_IMAGES_API_TOKEN=<your API token>
 *   CLOUDFLARE_IMAGES_ACCOUNT_HASH=<your account hash from the dashboard>
 *
 * Usage:
 *   node scripts/upload-images-to-cloudflare.mjs
 *   node scripts/upload-images-to-cloudflare.mjs --dry-run    (preview only)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const DRY_RUN = process.argv.includes("--dry-run");
const MANIFEST_PATH = path.join(ROOT, ".cloudflare-images.json");
const PUBLIC_DIR = path.join(ROOT, "public");
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // Cloudflare 10MB limit

const SKIP_FILES = new Set([
  "file.svg",
  "globe.svg",
  "next.svg",
  "vercel.svg",
  "window.svg",
]);

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".css"];
const SOURCE_DIRS = ["app", "components", "lib"];

// ─── Load env vars from .env.local ───────────────────────────────────────────

function loadEnv() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("❌ .env.local not found");
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    const value = trimmed.slice(eqIdx + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN = process.env.CLOUDFLARE_IMAGES_API_TOKEN;
const ACCOUNT_HASH = process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH;

if (!ACCOUNT_ID || !API_TOKEN || !ACCOUNT_HASH) {
  console.error("❌ Missing required env vars. Add to .env.local:");
  console.error("   CLOUDFLARE_ACCOUNT_ID=<your account id>");
  console.error("   CLOUDFLARE_IMAGES_API_TOKEN=<your API token>");
  console.error("   CLOUDFLARE_IMAGES_ACCOUNT_HASH=<your account hash>");
  process.exit(1);
}

// ─── Manifest (tracks uploaded images) ───────────────────────────────────────

function loadManifest() {
  if (fs.existsSync(MANIFEST_PATH)) {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  }
  return {};
}

function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
}

// ─── Discover local images ───────────────────────────────────────────────────

function walkDir(dir, base = "") {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(base, entry.name);
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full, rel));
    } else if (IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      if (!SKIP_FILES.has(entry.name)) {
        results.push({ relativePath: rel, absolutePath: full });
      }
    }
  }
  return results;
}

// ─── Upload to Cloudflare Images ─────────────────────────────────────────────

async function uploadImage(filePath, imageId) {
  const stat = fs.statSync(filePath);
  if (stat.size > MAX_FILE_SIZE) {
    console.warn(`⚠  Skipping ${imageId} (${(stat.size / 1024 / 1024).toFixed(1)}MB > 10MB limit)`);
    return null;
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1`;
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  const boundary = "----FormBoundary" + Date.now().toString(36);
  const bodyParts = [];

  bodyParts.push(
    `--${boundary}\r\n`,
    `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`,
    `Content-Type: application/octet-stream\r\n\r\n`
  );
  bodyParts.push(fileBuffer);
  bodyParts.push(`\r\n--${boundary}\r\n`);
  bodyParts.push(
    `Content-Disposition: form-data; name="id"\r\n\r\n`,
    imageId,
    `\r\n--${boundary}--\r\n`
  );

  const body = Buffer.concat(
    bodyParts.map((p) => (typeof p === "string" ? Buffer.from(p) : p))
  );

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  const json = await resp.json();

  if (!json.success) {
    const errMsg = json.errors?.[0]?.message || JSON.stringify(json.errors);
    if (errMsg.includes("already exists")) {
      console.log(`  ↳ Already exists on Cloudflare: ${imageId}`);
      return imageId;
    }
    console.error(`❌ Upload failed for ${imageId}:`, errMsg);
    return null;
  }

  return json.result.id;
}

// ─── Build Cloudflare delivery URL ───────────────────────────────────────────

function deliveryUrl(imageId, variant = "public") {
  return `https://imagedelivery.net/${ACCOUNT_HASH}/${imageId}/${variant}`;
}

// ─── Replace references in source files ──────────────────────────────────────

function collectSourceFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== ".next") {
      results.push(...collectSourceFiles(full));
    } else if (SOURCE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

function replaceInFiles(urlMap) {
  const allSourceFiles = [];
  for (const dir of SOURCE_DIRS) {
    const fullDir = path.join(ROOT, dir);
    if (fs.existsSync(fullDir)) {
      allSourceFiles.push(...collectSourceFiles(fullDir));
    }
  }

  const sortedPaths = Object.keys(urlMap).sort((a, b) => b.length - a.length);

  let totalReplacements = 0;

  for (const file of allSourceFiles) {
    let content = fs.readFileSync(file, "utf-8");
    let modified = false;

    for (const localPath of sortedPaths) {
      const cfUrl = urlMap[localPath];
      if (content.includes(localPath)) {
        content = content.split(localPath).join(cfUrl);
        modified = true;
      }
    }

    if (modified) {
      if (!DRY_RUN) {
        fs.writeFileSync(file, content);
      }
      const rel = path.relative(ROOT, file);
      const count = sortedPaths.reduce((n, p) => {
        const cfUrl = urlMap[p];
        return n + (content.split(cfUrl).length - 1);
      }, 0);
      totalReplacements += count;
      console.log(`  ✏️  ${rel} (${count} references updated)`);
    }
  }

  return totalReplacements;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(DRY_RUN ? "\n🔍 DRY RUN — no changes will be made\n" : "\n🚀 Uploading images to Cloudflare Images\n");

  const manifest = loadManifest();
  const images = walkDir(PUBLIC_DIR);

  console.log(`📁 Found ${images.length} images in /public\n`);

  const newImages = images.filter((img) => {
    const publicPath = "/" + img.relativePath.replace(/\\/g, "/");
    return !manifest[publicPath];
  });

  const alreadyUploaded = images.length - newImages.length;
  if (alreadyUploaded > 0) {
    console.log(`✅ ${alreadyUploaded} images already uploaded (skipping)\n`);
  }

  if (newImages.length === 0) {
    console.log("✨ Nothing new to upload!\n");

    const urlMap = {};
    for (const [localPath, entry] of Object.entries(manifest)) {
      urlMap[localPath] = entry.url;
    }
    if (Object.keys(urlMap).length > 0) {
      console.log("🔄 Checking for unreplaced references...\n");
      const replaced = replaceInFiles(urlMap);
      if (replaced > 0) {
        console.log(`\n✅ Updated ${replaced} references in source files`);
      } else {
        console.log("  All references already use Cloudflare URLs");
      }
    }
    console.log("");
    return;
  }

  console.log(`📤 Uploading ${newImages.length} new image(s)...\n`);

  let uploaded = 0;
  let failed = 0;

  for (const img of newImages) {
    const publicPath = "/" + img.relativePath.replace(/\\/g, "/");
    const imageId = img.relativePath
      .replace(/\\/g, "/")
      .replace(/[^a-zA-Z0-9/_.-]/g, "_")
      .replace(/^\//, "");

    if (DRY_RUN) {
      console.log(`  [dry-run] Would upload: ${publicPath} → ${imageId}`);
      uploaded++;
      continue;
    }

    process.stdout.write(`  ⬆  ${publicPath} ... `);
    const resultId = await uploadImage(img.absolutePath, imageId);

    if (resultId) {
      const url = deliveryUrl(resultId);
      manifest[publicPath] = {
        id: resultId,
        url,
        uploadedAt: new Date().toISOString(),
        fileSize: fs.statSync(img.absolutePath).size,
      };
      console.log(`✅`);
      uploaded++;
    } else {
      failed++;
    }

    await new Promise((r) => setTimeout(r, 200));
  }

  if (!DRY_RUN) {
    saveManifest(manifest);
  }

  console.log(`\n📊 Upload summary: ${uploaded} uploaded, ${failed} failed, ${alreadyUploaded} skipped\n`);

  if (!DRY_RUN && uploaded > 0) {
    const urlMap = {};
    for (const [localPath, entry] of Object.entries(manifest)) {
      urlMap[localPath] = entry.url;
    }

    console.log("🔄 Replacing local paths in source files...\n");
    const replaced = replaceInFiles(urlMap);
    console.log(`\n✅ Updated ${replaced} references across source files`);
  }

  console.log("");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
