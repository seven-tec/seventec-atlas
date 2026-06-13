import { expect, test, type Page } from "@playwright/test";

async function answerAssessment(page: Page, answers: Array<{ question: string; value: string }>) {
  for (const answer of answers) {
    const questionCard = page
      .locator("div.rounded-lg.border.border-border.bg-background.p-5")
      .filter({ hasText: answer.question });
    await questionCard.locator(`input[type="radio"][value="${answer.value}"]`).check();
  }
}

test("vertical slice: onboarding, scoring, compare runs, share-ready and export", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.addInitScript(() => {
    (window as Window & { __printed?: boolean }).__printed = false;
    window.print = () => {
      (window as Window & { __printed?: boolean }).__printed = true;
    };
  });

  const uniqueToken = Date.now().toString().slice(-6);
  const workspaceName = `SevenTec Advisory ${uniqueToken}`;
  const applicationName = `Atlas Customer Portal ${uniqueToken}`;

  await page.goto("/sign-in");

  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

  await page.getByLabel("Name").fill("SevenTec Architect");
  await page.getByLabel("Email").fill(`architect+${uniqueToken}@seventec.dev`);
  await page.getByRole("button", { name: "Enter development mode" }).click();

  await page.waitForURL("**/dashboard");
  await expect(
    page.getByRole("heading", {
      name: "Turn architecture signals into executive-grade reports",
    }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Create workspace" }).first().click();
  await page.waitForURL("**/workspaces/new");

  await expect(page.getByRole("heading", { name: "Create workspace" })).toBeVisible();
  await page.getByLabel("Workspace name").fill(workspaceName);
  await page.getByRole("button", { name: "Create workspace" }).click();

  await page.waitForURL(
    (url) =>
      /\/workspaces\/[^/]+$/.test(url.pathname) && !url.pathname.endsWith("/new"),
  );
  await expect(page.getByRole("heading", { name: workspaceName })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Register the first application" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Add first application" }).click();
  await page.waitForURL(/\/workspaces\/.+\/applications\/new/);

  await expect(page.getByRole("heading", { name: "Register application" })).toBeVisible();
  await page.getByLabel("Application name").fill(applicationName);
  await page
    .getByLabel("Description")
    .fill("Main SaaS platform under architecture review for the flagship flow.");
  await page.getByLabel("System type").selectOption("SAAS");
  await page
    .getByLabel("Primary goal")
    .fill("Reduce delivery risk before premium go-to-market expansion.");
  await page.getByRole("button", { name: "Create application" }).click();

  await page.waitForURL(
    (url) =>
      /\/applications\/[^/]+$/.test(url.pathname) && !url.pathname.endsWith("/new"),
  );
  await expect(page.getByRole("heading", { name: applicationName })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Start the first assessment cycle" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Create first assessment" }).click();
  await page.waitForURL(/\/assessments\/new/);

  await expect(page.getByRole("heading", { name: "Create draft" })).toBeVisible();
  await page.getByRole("button", { name: "Create assessment draft" }).click();

  await page.waitForURL(
    (url) =>
      /\/assessments\/[^/]+$/.test(url.pathname) && !url.pathname.endsWith("/new"),
  );
  await expect(page.getByRole("heading", { name: applicationName })).toBeVisible();
  await expect(page.getByText("Progress: 0/8 answers captured.")).toBeVisible();
  await expect(page.getByText("DRAFT", { exact: true })).toBeVisible();

  const runOneAnswers = [
    { question: "How modular is the system structure?", value: "strong" },
    { question: "How explicit are the architectural decisions?", value: "good" },
    { question: "How visible are performance bottlenecks today?", value: "good" },
    { question: "How mature is the performance strategy?", value: "fair" },
    { question: "How ready is the application for usage growth?", value: "fair" },
    { question: "How scalable is the operating model around the app?", value: "good" },
    { question: "How maintainable is the codebase?", value: "good" },
    { question: "How reliable is delivery quality today?", value: "strong" },
  ];

  await answerAssessment(page, runOneAnswers);

  await page.getByRole("button", { name: "Save draft answers" }).click();
  await expect(page.getByRole("button", { name: "Save draft answers" })).toBeVisible();
  await expect(page.getByText("Progress: 8/8 answers captured.")).toBeVisible();

  await page.getByRole("button", { name: "Submit and score" }).click();
  await expect(page.getByRole("button", { name: "Scoring assessment..." })).toBeVisible();
  await expect(page.getByText("ANALYZED", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Overall score:/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Open full report" })).toBeVisible();

  await page.getByRole("link", { name: "Open full report" }).click();
  await page.waitForURL(/\/reports\/[^/]+$/);
  await expect(
    page.getByRole("heading", {
      name: `${applicationName} Architecture Intelligence Report`,
    }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Execution priorities" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Improvement path by phase" })).toBeVisible();

  await page.getByRole("link", { name: "Back to application" }).click();
  await page.waitForURL(
    (url) =>
      /\/applications\/[^/]+$/.test(url.pathname) && !url.pathname.includes("/reports/"),
  );

  await page.getByRole("link", { name: "Create assessment draft" }).click();
  await page.waitForURL(/\/assessments\/new/);
  await page.getByRole("button", { name: "Create assessment draft" }).click();

  await page.waitForURL(
    (url) =>
      /\/assessments\/[^/]+$/.test(url.pathname) && !url.pathname.endsWith("/new"),
  );

  const runTwoAnswers = [
    { question: "How modular is the system structure?", value: "strong" },
    { question: "How explicit are the architectural decisions?", value: "strong" },
    { question: "How visible are performance bottlenecks today?", value: "strong" },
    { question: "How mature is the performance strategy?", value: "good" },
    { question: "How ready is the application for usage growth?", value: "good" },
    { question: "How scalable is the operating model around the app?", value: "strong" },
    { question: "How maintainable is the codebase?", value: "strong" },
    { question: "How reliable is delivery quality today?", value: "strong" },
  ];

  await answerAssessment(page, runTwoAnswers);

  await page.getByRole("button", { name: "Save draft answers" }).click();
  await expect(page.getByText("Progress: 8/8 answers captured.")).toBeVisible();
  await page.getByRole("button", { name: "Submit and score" }).click();
  await expect(page.getByText("ANALYZED", { exact: true }).first()).toBeVisible();
  await page.getByRole("link", { name: "Open full report" }).click();

  await page.waitForURL(/\/reports\/[^/]+$/);
  await expect(
    page.getByRole("heading", { name: "Score deltas & improvement narrative" }),
  ).toBeVisible();
  await expect(page.getByText(/Compared with the previous run/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Open previous" })).toBeVisible();

  await page.getByRole("link", { name: "Share-ready view" }).click();
  await page.waitForURL(/view=share/);
  await expect(page.getByText("Share-ready mode enabled.")).toBeVisible();
  await expect(page.getByText("Share-ready note")).toBeVisible();

  await page.goto(page.url().replace("?view=share", ""));
  await page.getByRole("button", { name: "Export to PDF" }).first().click();
  await expect
    .poll(async () =>
      page.evaluate(() => (window as Window & { __printed?: boolean }).__printed === true),
    )
    .toBe(true);
});
