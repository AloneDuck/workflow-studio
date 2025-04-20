import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("authors and undoes a field through the accessible editor", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Workflow Studio home" })).toBeVisible();
  await page.getByRole("button", { name: "Add number field" }).click();
  await expect(page.getByText("New number field").first()).toBeVisible();
  await page.getByRole("button", { name: "Undo last change" }).click();
  await expect(page.getByText("New number field")).toHaveCount(0);
});

test("persists a draft and passes automated accessibility checks", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Workflow name").fill("Vendor security review");
  await expect(page.getByRole("status")).toContainText("All changes saved", { timeout: 3_000 });
  const stored = await page.evaluate(() => localStorage.getItem("workflow-studio:draft"));
  expect(stored).toContain("Vendor security review");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
