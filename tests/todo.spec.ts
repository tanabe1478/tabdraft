import { test, expect } from "@playwright/test";

test.describe("TODO", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/newtab.html");
    await page.waitForSelector(".todo-panel");
  });

  test("add a task with Cmd+Enter", async ({ page }) => {
    const input = page.locator(".todo-input");
    await input.click();
    await input.fill("テスト用タスク");
    await input.press("Meta+Enter");

    const item = page.locator(".todo-item-text").first();
    await expect(item).toHaveText("テスト用タスク");
    // Input should be cleared
    await expect(input).toHaveValue("");
  });

  test("add a multiline task", async ({ page }) => {
    const input = page.locator(".todo-input");
    await input.click();
    await input.fill("行1\n行2\n行3");
    await input.press("Meta+Enter");

    const item = page.locator(".todo-item-text").first();
    await expect(item).toContainText("行1");
    await expect(item).toContainText("行2");
    await expect(item).toContainText("行3");
  });

  test("toggle task completion", async ({ page }) => {
    const input = page.locator(".todo-input");
    await input.click();
    await input.fill("完了テスト");
    await input.press("Meta+Enter");

    const checkbox = page.locator(".todo-item input[type=checkbox]").first();
    await checkbox.check();

    const item = page.locator(".todo-item").first();
    await expect(item).toHaveClass(/done/);
  });

  test("delete a task", async ({ page }) => {
    const input = page.locator(".todo-input");
    await input.click();
    await input.fill("削除テスト");
    await input.press("Meta+Enter");

    await expect(page.locator(".todo-item")).toHaveCount(1);

    const deleteBtn = page.locator(".todo-item-delete").first();
    // Force click since it's opacity:0 until hover
    await deleteBtn.click({ force: true });

    await expect(page.locator(".todo-item")).toHaveCount(0);
  });

  test("navigate todo list with keyboard", async ({ page }) => {
    const input = page.locator(".todo-input");
    // Add 2 tasks
    await input.click();
    await input.fill("タスク1");
    await input.press("Meta+Enter");
    await input.fill("タスク2");
    await input.press("Meta+Enter");

    // ArrowDown from input to first item (Cmd+ArrowDown)
    await input.press("Meta+ArrowDown");
    const firstItem = page.locator(".todo-item").first();
    await expect(firstItem).toBeFocused();

    // ArrowDown to second item
    await firstItem.press("ArrowDown");
    const secondItem = page.locator(".todo-item").nth(1);
    await expect(secondItem).toBeFocused();

    // ArrowUp back to first
    await secondItem.press("ArrowUp");
    await expect(firstItem).toBeFocused();

    // Space to toggle
    await firstItem.press("Space");
    await expect(firstItem).toHaveClass(/done/);

    // Backspace to delete
    await firstItem.press("Backspace");
    await expect(page.locator(".todo-item")).toHaveCount(1);
  });

  test("plain Enter does not add task (allows newline)", async ({ page }) => {
    const input = page.locator(".todo-input");
    await input.click();
    await input.fill("行1");
    await input.press("Enter");

    // No task should be added yet
    await expect(page.locator(".todo-item")).toHaveCount(0);
  });
});
