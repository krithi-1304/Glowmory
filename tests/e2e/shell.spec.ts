import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('production shell loads with local assets, no errors and accessible text', async ({
  page,
  baseURL,
}, testInfo) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== new URL(baseURL!).origin)
      external.push(request.url());
  });
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) => {
      throw new Error(`CSP violation: ${event.violatedDirective}`);
    });
  });
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Glowmory', level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("Good days don't go. They glow.")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  // The handwritten note face is loaded on demand after opening a note.
  await page.evaluate(() => document.fonts.load('32px Caveat'));
  expect(
    await page.evaluate(
      () =>
        document.fonts.check('16px Nunito') &&
        document.fonts.check('32px Caveat') &&
        document.fonts.check('32px "Cinzel Decorative"'),
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
  await page.screenshot({
    path: testInfo.outputPath('shell.png'),
    fullPage: true,
  });
});

test('text remains readable at 200% and with reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await expect(page.getByText('Save a spark for the dark.')).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});

test('saves a memory, survives reload, and recalls it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Leave a Little Light' }).click();
  await expect(page.locator('.feeling-grid')).toHaveCount(0);
  await page
    .getByPlaceholder('Write it down so it can glow…')
    .fill('A warm cup of chai with my sister.');
  await page.getByRole('button', { name: 'Let it glow' }).evaluate((button: HTMLButtonElement) => {
    button.click();
    button.click();
  });
  await expect(page.getByText('A new firefly was born.')).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Ask the Jar' }).click();
  await page.getByRole('button', { name: 'Surprise me' }).click();
  await expect(
    page.getByText('A warm cup of chai with my sister.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Let this light go' }).click();
  await expect(page.locator('.jar-chit')).toHaveCount(0);
  const count = await page.evaluate(() => new Promise<number>((resolve, reject) => {
    const request = indexedDB.open('keyval-store');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const read = db.transaction('keyval').objectStore('keyval').get('glowmory-v1');
      read.onsuccess = () => { resolve(read.result.memories.length); db.close(); };
      read.onerror = () => reject(read.error);
    };
  }));
  expect(count).toBe(1);
});

test('caterpillar supports keyboard dismissal and the moon opens settings', async ({ page }) => {
  await page.goto('/');
  const caterpillar = page.getByRole('button', { name: 'Visit the caterpillar' });
  await caterpillar.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Even the tiniest light can brighten the night.')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(caterpillar).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});


test('offline reload retains scenery, opening plate and versioned app icons', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(async () => (await caches.keys()).length > 0);
  await page.reload();
  await context.setOffline(true);
  try {
    await page.reload();
    const assets = await page.evaluate(async () => Promise.all([
      'assets/glowmory-night-clearing.jpg', 'assets/jar-open-plate.jpg',
      'assets/glowmory-tab.png?v=20261028', 'assets/glowmory-app-512.png?v=20261028',
    ].map(async path => (await fetch(path)).ok)));
    expect(assets).toEqual([true, true, true, true]);
    await page.getByRole('button', { name: 'Ask the Jar', exact: true }).click();
    await page.getByRole('button', { name: 'Surprise me' }).click();
    await expect(page.getByRole('dialog', { name: 'A comforting thought' })).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});
