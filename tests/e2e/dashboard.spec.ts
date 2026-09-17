import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /continue as demo farmer/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
});

test("renders the high-fidelity dashboard and expands a recording", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Todays Recordings")).toBeVisible();
  await expect(page.getByRole("row")).toHaveCount(5);
  await page.getByRole("button", { name: "View", exact: true }).first().click();
  await expect(page.getByText("Play Recording")).toBeVisible();
  await expect(page.getByText("Expand Map")).toBeVisible();
});

test("searches and persists a tag in local-demo mode", async ({ page, context }) => {
  await page.getByRole("searchbox", { name: "Search employee logs" }).fill("Maya");
  await page.getByRole("searchbox", { name: "Search employee logs" }).press("Enter");
  await expect(page.getByText("Maya Patel")).toBeVisible();
  await expect(page.getByText("Isaac Wang")).not.toBeVisible();

  await page.goto("/dashboard?log=isaac-wang");
  await page.getByRole("button", { name: "Add Tag" }).click();
  await page.getByLabel("Tag name").fill("Needs follow-up");
  await page.getByRole("button", { name: "Save tag" }).click();
  await expect(page.getByRole("status")).toContainText("Added");
  const cookies = await context.cookies();
  expect(cookies.some((cookie) => cookie.name === "toph-local-tags")).toBeTruthy();
});
