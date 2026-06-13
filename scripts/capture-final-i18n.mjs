const { chromium } = await import("playwright");
const path = await import("node:path");
const fs = await import("node:fs/promises");

const baseUrl = "http://localhost:3004";
const screenshotDir = path.resolve("docs/screenshots/final-i18n");

await fs.mkdir(screenshotDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});

const context = await browser.newContext({
  viewport: { width: 1510, height: 1100 },
  deviceScaleFactor: 1,
});

const page = await context.newPage();

async function login(locale) {
  await page.goto(`${baseUrl}/${locale}/sign-in`, { waitUntil: "networkidle" });
  await page.getByLabel(/Nombre|Name/).fill("SevenTec Architect");
  await page.getByLabel(/Correo|Email/).fill("architect@seventec.dev");
  await page
    .getByRole("button", {
      name: /Entrar en modo desarrollo|Enter development mode/,
    })
    .click();
  await page.waitForURL(new RegExp(`/${locale}/dashboard`), {
    timeout: 20_000,
  });
  await page.waitForLoadState("networkidle");
}

async function capture(name, url, waitFor) {
  await page.goto(url, { waitUntil: "networkidle" });

  if (waitFor) {
    await page.getByText(waitFor, { exact: false }).first().waitFor({
      timeout: 20_000,
    });
  }

  await page.screenshot({
    path: path.join(screenshotDir, `${name}.png`),
    fullPage: false,
  });
}

const reportId = "cmqb1799t001415lcbdb6tk5l";
const reportPath = `/workspaces/atlas-demo-workspace/applications/atlas-commerce-platform/reports/${reportId}`;

await login("es");

await capture("dashboard-es", `${baseUrl}/es/dashboard`, "Artefacto flagship");
await capture("report-es", `${baseUrl}/es${reportPath}`, "Resumen ejecutivo");
await capture(
  "report-share-es",
  `${baseUrl}/es${reportPath}?view=share`,
  "Resumen ejecutivo",
);
await capture("dashboard-en", `${baseUrl}/en/dashboard`, "Flagship artifact");
await capture("report-en", `${baseUrl}/en${reportPath}`, "Executive summary");
await capture(
  "report-share-en",
  `${baseUrl}/en${reportPath}?view=share`,
  "Executive summary",
);

await browser.close();

console.log(
  JSON.stringify(
    {
      ok: true,
      screenshotDir,
    },
    null,
    2,
  ),
);
