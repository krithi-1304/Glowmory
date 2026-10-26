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
  expect(
    await page.evaluate(
      () =>
        document.fonts.check('16px Nunito') &&
        document.fonts.check('32px Caveat'),
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
  await page.getByRole('button', { name: 'Write' }).click();
  await page
    .getByPlaceholder('Write it down so it can glow…')
    .fill('A warm cup of chai with my sister.');
  await page.getByRole('button', { name: 'Let it glow' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Shake the jar' }).click();
  await page.getByRole('button', { name: 'Surprise me' }).click();
  await expect(
    page.getByText('A warm cup of chai with my sister.'),
  ).toBeVisible();
});
