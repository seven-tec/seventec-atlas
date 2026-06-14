import { expect, test } from "@playwright/test";

test("local release smoke: dev sign-in, demo dashboard, flagship report, compare flow", async ({
  page,
}) => {
  test.setTimeout(120_000);

  await page.goto("/sign-in");

  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await page.getByLabel("Name").fill("SevenTec Architect");
  await page.getByLabel("Email").fill("architect@seventec.dev");
  await page.getByRole("button", { name: "Enter development mode" }).click();

  await page.waitForURL("**/dashboard");
  await expect(
    page.getByRole("heading", {
      name: "Turn architecture signals into executive-grade reports",
    }),
  ).toBeVisible();
  await expect(page.getByText("Demo workspace loaded")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open demo report" })).toBeVisible();

  await page.getByRole("link", { name: "Open demo report" }).click();
  await page.waitForURL(/\/reports\/[^/]+$/);

  await expect(
    page.getByRole("heading", {
      name: "Atlas Commerce Platform Architecture Intelligence Report",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Score deltas & improvement narrative" }),
  ).toBeVisible();
  await expect(page.getByText(/Compared with the previous run/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Open previous" })).toBeVisible();

  await page.getByRole("link", { name: "Open previous" }).click();
  await page.waitForURL(/\/reports\/[^/]+$/);
  await expect(
    page.getByRole("heading", {
      name: "Atlas Commerce Platform Architecture Intelligence Report",
    }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "This is the first completed report for this application, so it establishes the baseline for future comparisons.",
    ),
  ).toBeVisible();
});
