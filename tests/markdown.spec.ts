import { test, expect } from "@playwright/test";

test.describe("Markdown editor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/newtab.html");
    await page.waitForSelector(".markdown-editor");
  });

  test("type and persist text", async ({ page }) => {
    const editor = page.locator(".markdown-editor");
    await editor.click();
    await editor.fill("# Hello World");

    await expect(editor).toHaveValue("# Hello World");
  });

  test("switch to preview and back", async ({ page }) => {
    const editor = page.locator(".markdown-editor");
    await editor.click();
    // Use pressSequentially to ensure React onChange fires
    await editor.pressSequentially("# Title", { delay: 10 });

    // Click Preview tab
    const previewBtn = page.locator("button.tab-btn", { hasText: "Preview" });
    await previewBtn.click();

    const preview = page.locator(".markdown-preview");
    await expect(preview).toBeVisible();
    await expect(preview.locator("h1")).toHaveText("Title");

    // Editor textarea should not be visible
    await expect(editor).not.toBeVisible();

    // Click Edit tab to go back
    await page.locator("button.tab-btn", { hasText: "Edit" }).click();
    await expect(editor).toBeVisible();
  });

  test("list continuation on Enter", async ({ page }) => {
    const editor = page.locator(".markdown-editor");
    await editor.click();
    await editor.fill("");

    // Type a list item and press Enter
    await editor.pressSequentially("- item1");
    await editor.press("Enter");

    const value = await editor.inputValue();
    // Should have auto-inserted "- " on the new line
    expect(value).toContain("- item1\n- ");
  });

  test("Ctrl+B is NOT captured (Emacs backward)", async ({ page }) => {
    const editor = page.locator(".markdown-editor");
    await editor.click();
    await editor.fill("hello");

    // Place cursor at end, press Ctrl+B (should move cursor back, not bold)
    await editor.press("End");
    await editor.press("Control+b");

    // Value should remain unchanged (no ** wrapping)
    await expect(editor).toHaveValue("hello");
  });
});
