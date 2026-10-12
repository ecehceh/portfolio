import { expect, test, type Page } from '@playwright/test';

/** Collects console errors and uncaught exceptions (CSP violations show up here too). */
function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test.describe('home page', () => {
  test('serves the prerendered content with SEO metadata', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/');

    await expect(page).toHaveTitle('Christopher Evan Wijaksana — Portfolio');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('CHRISTOPHER');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /opengraph-image/);
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
    await page.waitForTimeout(1_000);
    expect(errors).toEqual([]);
  });

  test('renders the 3D avatar instead of the no-WebGL fallback', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('#character-canvas');
    // The intro animation fades the avatar in.
    await expect
      .poll(async () => Number(await canvas.evaluate((node) => getComputedStyle(node).opacity)), { timeout: 15_000 })
      .toBeGreaterThan(0.9);
    await expect(page.locator('html')).not.toHaveClass(/no-webgl/);
  });

  test('fades the hero in once the intro takes over', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/js-motion/);
    await expect(page.locator('html')).toHaveClass(/motion-ready/);
    await expect(page.locator('.hero-hello')).toHaveCSS('opacity', '1', { timeout: 10_000 });
  });

  test('rotates the hero word', async ({ page }) => {
    await page.goto('/');
    const word = page.locator('.hero-word.gradient');
    const first = await word.textContent();
    await expect(word).not.toHaveText(first ?? '', { timeout: 8_000 });
  });

  test('scrolls to a section from the navigation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Contact' }).click();
    await expect(page.getByRole('heading', { name: 'Contact', level: 2 })).toBeInViewport();
    await expect(page.locator('header.nav')).toHaveClass(/is-scrolled/);
  });

  test('shows the techstack scene when scrolled into view', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/');
    await page.locator('#techstack').scrollIntoViewIfNeeded();
    const canvas = page.locator('#techstack-canvas');
    await expect(canvas).toBeVisible();
    await expect.poll(() => canvas.evaluate((node: HTMLCanvasElement) => node.width)).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });

  test('never scrolls sideways', async ({ page }) => {
    await page.goto('/');
    // Wait for ScrollTrigger to pin the work section, which wraps it in a pin-spacer.
    await page.waitForTimeout(1_500);
    const scrollX = await page.evaluate(() => {
      window.scrollTo(10_000, window.scrollY);
      return window.scrollX;
    });
    expect(scrollX).toBe(0);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('keeps the hero still and visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero-word.gradient')).toHaveText('DEVOPS');
    await page.waitForTimeout(3_500);
    await expect(page.locator('.hero-word.gradient')).toHaveText('DEVOPS');
    await expect(page.locator('#character-canvas')).toHaveCSS('opacity', '1');
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('still shows the full prerendered page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/js-motion/);
    await expect(page.locator('.hero-hello')).toHaveCSS('opacity', '1');
    await expect(page.getByRole('heading', { name: 'Contact', level: 2 })).toBeAttached();
  });
});

test.describe('platform routes', () => {
  test('send the security headers', async ({ request }) => {
    const response = await request.get('/');
    const headers = response.headers();
    expect(headers['content-security-policy']).toContain("default-src 'self'");
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-powered-by']).toBeUndefined();
  });

  test('serve robots.txt, the sitemap, the Open Graph image and the resume', async ({ request }) => {
    expect((await request.get('/robots.txt')).ok()).toBe(true);
    expect(await (await request.get('/sitemap.xml')).text()).toContain('<urlset');
    const og = await request.get('/opengraph-image');
    expect(og.headers()['content-type']).toBe('image/png');
    const resume = await request.get('/assets/Christopher_Evan_Wijaksana_CV.pdf');
    expect(resume.headers()['content-type']).toBe('application/pdf');
  });
});
