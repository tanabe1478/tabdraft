import { test, expect } from "@playwright/test";

test.describe("Layout", () => {
  test("markdown editor textarea fills remaining height", async ({ page }) => {
    await page.goto("/newtab.html");
    await page.waitForSelector(".markdown-editor");

    const viewport = page.viewportSize()!;
    const textarea = page.locator(".markdown-editor");
    const box = await textarea.boundingBox();

    expect(box).not.toBeNull();
    // Textarea should use at least 60% of viewport height
    const minHeight = viewport.height * 0.6;
    console.log(`Viewport: ${viewport.height}px, Textarea: ${box!.height}px, Min: ${minHeight}px`);
    expect(box!.height).toBeGreaterThan(minHeight);
  });

  test("markdown editor textarea reaches near bottom of viewport", async ({ page }) => {
    await page.goto("/newtab.html");
    await page.waitForSelector(".markdown-editor");

    const viewport = page.viewportSize()!;
    const textarea = page.locator(".markdown-editor");
    const box = await textarea.boundingBox();

    expect(box).not.toBeNull();
    const bottomEdge = box!.y + box!.height;
    const gap = viewport.height - bottomEdge;
    console.log(`Bottom edge: ${bottomEdge}px, Gap to viewport bottom: ${gap}px`);
    // Should be within 32px of viewport bottom (padding)
    expect(gap).toBeLessThan(32);
  });

  test("todo panel has fixed width", async ({ page }) => {
    await page.goto("/newtab.html");
    await page.waitForSelector(".todo-panel");

    const panel = page.locator(".todo-panel");
    const box = await panel.boundingBox();
    expect(box).not.toBeNull();
    // Should be around 360px
    expect(box!.width).toBeGreaterThan(300);
    expect(box!.width).toBeLessThan(420);
  });
});
