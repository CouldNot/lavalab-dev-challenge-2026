import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /continue as demo farmer/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
});

test("renders the high-fidelity dashboard and expands a recording", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Today's Recordings")).toBeVisible();
  for (const label of ["Audit Manager", "Reports", "Schedule", "Employees", "Performance", "Messages", "Settings", "Support"]) {
    await expect(page.getByRole("button", { name: label })).toBeDisabled();
  }
  const metricCard = page.getByRole("region", { name: "Farm summary" }).getByRole("article").first();
  const metricCardBox = await metricCard.boundingBox();
  const metricValueBox = await metricCard.locator("strong").boundingBox();
  if (!metricCardBox || !metricValueBox) throw new Error("Could not measure the first metric card");
  expect(metricCardBox.y + metricCardBox.height - (metricValueBox.y + metricValueBox.height)).toBeGreaterThan(4);
  await expect(page.getByRole("row")).toHaveCount(5);
  const viewButtonBox = await page.getByRole("button", { name: "View", exact: true }).first().boundingBox();
  const viewport = page.viewportSize();
  if (!viewButtonBox || !viewport) throw new Error("Could not measure the first View button");
  expect(viewButtonBox.x).toBeGreaterThanOrEqual(0);
  expect(viewButtonBox.x + viewButtonBox.width).toBeLessThanOrEqual(viewport.width + 1);
  await expect(page.getByRole("combobox", { name: "Sort logs" })).toHaveValue("date-asc");
  await expect(page.getByRole("combobox", { name: "Log range" })).toHaveValue("month");
  for (const name of ["Sort logs", "Log range"]) {
    const select = page.getByRole("combobox", { name });
    const box = await select.locator("xpath=..").boundingBox();
    if (!box) throw new Error(`Could not measure ${name} control`);
    await page.mouse.click(box.x + box.width - 8, box.y + box.height / 2);
    await expect(select).toBeFocused();
    await page.keyboard.press("Escape");
  }
  await page.getByRole("combobox", { name: "Log range" }).selectOption("all");
  await expect(page.getByRole("heading", { name: "Employee Logs (11)" })).toBeVisible();
  await page.getByRole("combobox", { name: "Sort logs" }).selectOption("date-desc");
  await expect(page.getByRole("row").nth(1)).toContainText("Benjamin Moore");
  await page.getByRole("button", { name: "View", exact: true }).first().click();
  await expect(page.getByText("Play Recording")).toBeVisible();
  await expect(page.getByText("Expand Map")).toBeVisible();
});

test("searches and persists a tag", async ({ page }) => {
  await page.getByRole("searchbox", { name: "Search employee logs" }).fill("Maya");
  await page.getByRole("searchbox", { name: "Search employee logs" }).press("Enter");
  await expect(page.getByText("Maya Patel")).toBeVisible();
  await expect(page.getByText("Isaac Wang")).not.toBeVisible();

  await page.getByRole("button", { name: "View", exact: true }).click();
  await page.getByRole("button", { name: "Add Tag" }).click();
  await page.getByLabel("Tag name").fill("Needs follow-up");
  await page.getByRole("button", { name: "Save tag" }).click();
  await expect(page.getByRole("status")).toContainText("Added");
  await page.reload();
  await page.getByRole("button", { name: "Add Tag" }).click();
  await expect(page.getByText("Needs follow-up")).toBeVisible();
});

test("reviews, flags, and filters recordings in local-demo mode", async ({ page }) => {
  await page.getByRole("button", { name: "View", exact: true }).first().click();
  await expect(page.getByRole("region", { name: "Recording review" })).toContainText("Needs review");
  await page.getByRole("combobox", { name: "Decision" }).selectOption("flagged");
  await page.getByRole("textbox", { name: /Review note/ }).fill("Please verify the application rate.");
  await page.getByRole("button", { name: "Flag for follow-up" }).click();
  await expect(page.getByRole("row").nth(1)).toContainText("Flagged");
  await page.reload();
  await expect(page.getByRole("row").nth(1)).toContainText("Flagged");
  await page.getByText("0 to review").click();
  await expect(page.getByRole("heading", { name: "Employee Logs (0)" })).toBeVisible();
});
