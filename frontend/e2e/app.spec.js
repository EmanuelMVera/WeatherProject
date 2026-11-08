import { test, expect } from "@playwright/test";
import { mockApis, weather } from "./helpers.js";

const current = (page) => page.locator("#ahora");

test.describe("Buen Clima", () => {
  test("entrada al sitio: clima actual visible de inmediato", async ({ page }) => {
    await mockApis(page);
    await page.goto("/");

    await expect(page).toHaveTitle(/Buenos Aires · Buen Clima/);
    await expect(current(page).getByRole("heading", { name: "Buenos Aires" })).toBeVisible();
    await expect(current(page)).toContainText("Parcialmente nublado");
    // Horario de la ciudad aunque el navegador esté configurado en Europa/Madrid.
    await expect(current(page)).toContainText("Datos de las 01:30 (hora local, GMT-3)");
    await expect(page.getByRole("link", { name: /Acerca del proyecto|GitHub/i })).toHaveCount(0);
  });

  test("buscar, consultar y cambiar de ciudad", async ({ page }) => {
    const calls = await mockApis(page);
    await page.goto("/");
    await expect(current(page).getByRole("heading", { name: "Buenos Aires" })).toBeVisible();

    const search = page.getByRole("combobox", { name: /buscar una ciudad/i });
    await search.fill("Córdoba");
    const options = page.getByRole("option");
    await expect(options).toHaveCount(2);
    await expect(options.nth(1)).toContainText("Andalucía · España");
    await options.first().click();

    await expect(current(page).getByRole("heading", { name: "Córdoba" })).toBeVisible();
    expect(calls.at(-1)).toMatch(/lat=-31\.4135&lon=-64\.181\d/);

    // Cambiar de ciudad con el teclado.
    await search.fill("Córdoba");
    await expect(options).toHaveCount(2);
    await search.press("ArrowDown");
    await search.press("Enter");
    await expect(current(page)).toContainText("Andalucía, España");
  });

  test("guardar un favorito y recordarlo al volver", async ({ page }) => {
    await mockApis(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Guardar en favoritos" }).click();
    const favorites = page.getByRole("region", { name: "Localidades favoritas" });
    await expect(favorites).toContainText("Buenos Aires");

    await page.getByRole("combobox").fill("Córdoba");
    await page.getByRole("option").first().click();
    await expect(current(page).getByRole("heading", { name: "Córdoba" })).toBeVisible();

    await page.reload();
    await expect(current(page).getByRole("heading", { name: "Córdoba" })).toBeVisible();
    await favorites.getByRole("button", { name: "Buenos Aires", exact: true }).click();
    await expect(current(page).getByRole("heading", { name: "Buenos Aires" })).toBeVisible();
  });

  test("abrir un día del pronóstico de 7 días", async ({ page, isMobile }) => {
    await mockApis(page);
    await page.goto("/");
    const section = page.locator("#siete-dias");
    const monday = section.getByRole("button", { name: /Lunes|lun/ });
    await monday.click();
    if (isMobile) await expect(monday).toHaveAttribute("aria-expanded", "true");
    else await expect(monday).toHaveAttribute("aria-pressed", "true");
    await expect(section).toContainText("Lunes 9 de noviembre");
    await expect(section).toContainText("Lluvia acumulada");
  });

  test("error de API: aviso contextual y reintento", async ({ page }) => {
    let fail = true;
    await mockApis(page, {
      weatherHandler: (route) =>
        fail
          ? route.fulfill({
              status: 400,
              json: { error: { code: "INVALID_REQUEST", message: "La ubicación no es válida." } },
            })
          : route.fulfill({ json: weather }),
    });
    await page.goto("/");
    await expect(page.getByRole("alert").filter({ hasText: "No pudimos cargar el pronóstico" })).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    fail = false;
    await page.getByRole("button", { name: "Reintentar" }).click();
    await expect(current(page).getByRole("heading", { name: "Buenos Aires" })).toBeVisible();
  });
});

test.describe("diseño responsive", () => {
  for (const width of [320, 360, 375, 390, 430, 768, 1024, 1440]) {
    test(`sin scroll horizontal de página a ${width}px`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "desktop", "se recorre una sola vez");
      await page.setViewportSize({ width, height: 900 });
      await mockApis(page);
      await page.goto("/");
      await expect(current(page).getByRole("heading", { name: "Buenos Aires" })).toBeVisible();
      await page.locator("#siete-dias").getByRole("button").first().click();

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);

      for (const name of ["Usar mi ubicación", "Guardar en favoritos"]) {
        const box = await page.getByRole("button", { name }).first().boundingBox();
        expect(box.height, name).toBeGreaterThanOrEqual(44);
      }
    });
  }

  test("en el celular el clima actual entra en la primera pantalla", async ({ page, isMobile }) => {
    test.skip(!isMobile, "sólo mobile");
    await mockApis(page);
    await page.goto("/");
    await expect(current(page).getByRole("heading", { name: "Buenos Aires" })).toBeVisible();
    const box = await current(page).boundingBox();
    expect(box.y).toBeLessThan(page.viewportSize().height * 0.5);
    const scroller = page.getByRole("list", { name: /pronóstico por hora/i });
    expect(await scroller.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
  });
});
