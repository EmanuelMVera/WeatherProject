/**
 * Genera capturas reales de la app en ejecución y los íconos estáticos.
 *
 * Uso (con backend y frontend corriendo):
 *   node scripts/capture.mjs http://localhost:4173
 *
 * Salida:
 *   ../docs/screenshots/desktop.png, mobile.png, mobile-detalle.png
 *   public/og-image.png (1200x630), public/apple-touch-icon.png (180x180)
 */
import { chromium } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const shotsDir = path.join(root, "..", "docs", "screenshots");
const baseURL = process.argv[2] || "http://localhost:4173";

await mkdir(shotsDir, { recursive: true });
const browser = await chromium.launch();

async function open(viewport, opts = {}) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: opts.scale ?? 1,
    isMobile: opts.mobile ?? false,
    hasTouch: opts.mobile ?? false,
    locale: "es-AR",
  });
  const page = await context.newPage();
  await page.goto(baseURL);
  await page.locator("#ahora h2").waitFor({ timeout: 60_000 });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  return { page, context };
}

// Escritorio
{
  const { page, context } = await open({ width: 1440, height: 900 });
  await page.screenshot({ path: path.join(shotsDir, "desktop.png"), fullPage: true });
  await page.screenshot({
    path: path.join(root, "public", "og-image.png"),
    clip: { x: 120, y: 0, width: 1200, height: 630 },
  });
  await context.close();
}

// Mobile (390 px, pantalla de iPhone 12-15)
{
  const { page, context } = await open({ width: 390, height: 844 }, { mobile: true, scale: 2 });
  await page.screenshot({ path: path.join(shotsDir, "mobile.png") });
  const day = page.locator("#siete-dias li button").nth(1);
  await day.click();
  await page.locator("#siete-dias").scrollIntoViewIfNeeded();
  await page.locator("#siete-dias").screenshot({ path: path.join(shotsDir, "mobile-detalle.png") });
  await context.close();
}

// Ícono táctil para iOS a partir del favicon SVG.
{
  const svg = await readFile(path.join(root, "public", "favicon.svg"), "utf8");
  const context = await browser.newContext({ viewport: { width: 180, height: 180 } });
  const page = await context.newPage();
  await page.setContent(
    `<body style="margin:0;background:#0f1d3d">${svg.replace("<svg ", '<svg width="180" height="180" ')}</body>`
  );
  await page.screenshot({ path: path.join(root, "public", "apple-touch-icon.png") });
  await context.close();
}

await browser.close();
console.log(`Capturas guardadas en ${shotsDir}`);
