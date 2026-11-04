import { expect, test, type Page } from '@playwright/test';

/** O que a página de teste expõe: o `dist` real do pacote e um `fetch` do caso pedido. */
interface TecWindow {
  tec: {
    initPreferences(): unknown;
    setPreferences(change: Record<string, string | boolean>): boolean;
    loadSeasonalTheme(
      fetchTheme: (signal: AbortSignal) => Promise<unknown>,
      options?: { timeoutMs?: number },
    ): Promise<{ applied: boolean; reason?: string }>;
    watchPreferencesForSeasonalTheme(): () => void;
  };
  fetchCase(name: string): (signal: AbortSignal) => Promise<unknown>;
  __violations: string[];
  __ready: boolean;
}

const DEFAULT_ACCENT_LIGHT = 'rgb(85, 98, 214)'; // #5562d6
const DEFAULT_ACCENT_DARK = 'rgb(140, 151, 250)'; // #8c97fa
const HIGH_CONTRAST_ACCENT_LIGHT = 'rgb(34, 41, 176)'; // #2229b0
const CHRISTMAS_ACCENT_LIGHT = 'rgb(179, 0, 27)'; // #b3001b
const CHRISTMAS_ACCENT_DARK = 'rgb(255, 154, 166)'; // #ff9aa6

async function open(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForFunction(() => (window as unknown as TecWindow).__ready);
  await page.evaluate(() => {
    const w = window as unknown as TecWindow;
    localStorage.clear();
    w.tec.initPreferences();
    w.__violations = []; // daqui para frente, qualquer violação de CSP é culpa do aplicador
  });
}

async function load(page: Page, name: string): Promise<{ applied: boolean; reason?: string }> {
  return page.evaluate(async (caseName) => {
    const w = window as unknown as TecWindow;
    w.tec.watchPreferencesForSeasonalTheme();
    return w.tec.loadSeasonalTheme(w.fetchCase(caseName));
  }, name);
}

const accent = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.getElementById('probe')!).color);

const violations = (page: Page) =>
  page.evaluate(() => (window as unknown as TecWindow).__violations);

test.describe('CSP estrita: os controles continuam bloqueados', () => {
  test('atributo style inline não se aplica e o aplicador não gera violação', async ({ page }) => {
    await open(page);
    const inline = await page.evaluate(
      () => getComputedStyle(document.getElementById('inline-control')!).color,
    );
    expect(inline).not.toBe('rgb(255, 0, 0)');
    const result = await load(page, 'christmas');
    expect(result).toEqual({ applied: true });
    expect(await violations(page)).toEqual([]);
  });
});

test.describe('o detector de violações de CSP funciona (senão "zero violações" não prova nada)', () => {
  test('<style> sem nonce e setAttribute("style") geram violação e não se aplicam', async ({
    page,
  }) => {
    await open(page);
    const applied = await page.evaluate(async () => {
      const probe = document.getElementById('probe')!;
      const style = document.createElement('style');
      style.textContent = '#probe { border-top: 7px solid rgb(1, 2, 3); }';
      document.head.appendChild(style);
      probe.setAttribute('style', 'border-bottom: 7px solid rgb(1, 2, 3)');
      await new Promise((resolve) => setTimeout(resolve, 100));
      const css = getComputedStyle(probe);
      return css.borderTopWidth === '7px' || css.borderBottomWidth === '7px';
    });
    expect(applied).toBe(false);
    expect((await violations(page)).length).toBeGreaterThan(0);
  });
});

test.describe('tema claro', () => {
  test.use({ colorScheme: 'light' });

  test('padrão antes, Natal depois, sem violação de CSP', async ({ page }) => {
    await open(page);
    expect(await accent(page)).toBe(DEFAULT_ACCENT_LIGHT);
    expect(await load(page, 'christmas')).toEqual({ applied: true });
    expect(await accent(page)).toBe(CHRISTMAS_ACCENT_LIGHT);
    expect(await page.locator('html').getAttribute('data-seasonal')).toBe('christmas-2026');
    expect(await violations(page)).toEqual([]);
  });

  test('alto contraste do usuário vence o tema sazonal', async ({ page }) => {
    await open(page);
    await page.evaluate(() =>
      (window as unknown as TecWindow).tec.setPreferences({ contrast: 'high' }),
    );
    expect(await load(page, 'christmas')).toEqual({ applied: true });
    expect(await accent(page)).toBe(HIGH_CONTRAST_ACCENT_LIGHT);
  });

  test('desligar e religar "tema sazonal" reaplica sem nova busca', async ({ page }) => {
    await open(page);
    await load(page, 'christmas');
    await page.evaluate(() =>
      (window as unknown as TecWindow).tec.setPreferences({ seasonal: 'off' }),
    );
    expect(await accent(page)).toBe(DEFAULT_ACCENT_LIGHT);
    expect(await page.locator('html').getAttribute('data-seasonal')).toBeNull();
    await page.evaluate(() =>
      (window as unknown as TecWindow).tec.setPreferences({ seasonal: 'on' }),
    );
    expect(await accent(page)).toBe(CHRISTMAS_ACCENT_LIGHT);
  });

  for (const hostile of ['protected-token', 'css-injection', 'low-contrast', 'inexistente']) {
    test(`tema hostil "${hostile}" é recusado e a página fica intacta`, async ({ page }) => {
      await open(page);
      const result = await load(page, hostile);
      expect(result.applied).toBe(false);
      expect(await accent(page)).toBe(DEFAULT_ACCENT_LIGHT);
      expect(await page.locator('html').getAttribute('data-seasonal')).toBeNull();
      const bodyDisplay = await page.evaluate(() => getComputedStyle(document.body).display);
      expect(bodyDisplay).not.toBe('none');
      expect(await violations(page)).toEqual([]);
    });
  }

  test('busca que nunca responde vira tema padrão no prazo', async ({ page }) => {
    await open(page);
    const result = await page.evaluate(() =>
      (window as unknown as TecWindow).tec.loadSeasonalTheme(() => new Promise(() => undefined), {
        timeoutMs: 50,
      }),
    );
    expect(result).toEqual({ applied: false, reason: 'none' });
    expect(await accent(page)).toBe(DEFAULT_ACCENT_LIGHT);
  });
});

test.describe('tema escuro', () => {
  test.use({ colorScheme: 'dark' });

  test('light-dark() resolve o par escuro do tema', async ({ page }) => {
    await open(page);
    expect(await accent(page)).toBe(DEFAULT_ACCENT_DARK);
    await load(page, 'christmas');
    expect(await accent(page)).toBe(CHRISTMAS_ACCENT_DARK);
  });
});

test.describe('animação', () => {
  const snowDisplay = (page: Page) =>
    page.evaluate(() => getComputedStyle(document.documentElement, '::before').display);
  const snowAnimation = (page: Page) =>
    page.evaluate(() => getComputedStyle(document.documentElement, '::before').animationName);

  test('neve aparece e não captura clique', async ({ page }) => {
    await open(page);
    await load(page, 'christmas');
    expect(await snowAnimation(page)).toBe('tec-snow');
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement, '::before').pointerEvents,
      ),
    ).toBe('none');
  });

  test('prefers-reduced-motion desliga a neve', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await load(page, 'christmas');
    expect(await snowDisplay(page)).toBe('none');
  });

  test('a preferência "reduzir animações" do usuário desliga a neve', async ({ page }) => {
    await open(page);
    await load(page, 'christmas');
    await page.evaluate(() =>
      (window as unknown as TecWindow).tec.setPreferences({ motion: 'reduced' }),
    );
    expect(await snowDisplay(page)).toBe('none');
  });
});
