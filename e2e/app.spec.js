import { expect, test } from '@playwright/test';

const blankMapStyle = {
  version: 8,
  sources: {},
  layers: [],
};

async function stubExternalMapRequests(page) {
  await page.route('https://tiles.openfreemap.org/styles/liberty', (route) => {
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(blankMapStyle),
    });
  });

  await page.route('https://d2ad6b4ur7yvpq.cloudfront.net/**', (route) => {
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ type: 'FeatureCollection', features: [] }),
    });
  });
}

test.beforeEach(async ({ page }) => {
  await stubExternalMapRequests(page);
});

test('loads the map layer and nonblank game canvas', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');

  const canvas = page.locator('canvas:not(.maplibregl-canvas)');
  await expect(canvas).toBeVisible();
  await expect(page.locator('.maplibregl-map')).toBeVisible();

  const box = await canvas.boundingBox();
  expect(box.width).toBeGreaterThan(0);
  expect(box.height).toBeGreaterThan(0);

  await expect.poll(async () => page.evaluate(() => {
    const gameCanvas = document.querySelector('canvas:not(.maplibregl-canvas)');
    const ctx = gameCanvas.getContext('2d');
    const { data } = ctx.getImageData(0, 0, gameCanvas.width, gameCanvas.height);

    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) return true;
    }

    return false;
  })).toBe(true);

  expect(errors).toEqual([]);
});

test('shows game over, persists leaderboard, and starts a new game', async ({ page }) => {
  await page.goto('/?duration=1');

  await expect(page.getByRole('dialog', { name: /game over/i })).toBeVisible();
  await expect(page.getByLabel(/nickname/i)).toBeVisible();
  await page.getByLabel(/nickname/i).fill('Pilot');
  await page.getByRole('button', { name: /save/i }).click();
  await expect(page.getByText('Pilot')).toBeVisible();
  await expect(page.getByText('Top 6')).toBeVisible();

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('helicopter.leaderboard')));
  expect(saved).toHaveLength(1);
  expect(saved[0]).toEqual(expect.objectContaining({ score: expect.any(Number), nickname: 'Pilot' }));

  await page.getByRole('button', { name: /start new game/i }).click();
  await expect(page.getByRole('dialog', { name: /game over/i })).toBeHidden();
  await expect(page.locator('canvas:not(.maplibregl-canvas)')).toBeVisible();
});
