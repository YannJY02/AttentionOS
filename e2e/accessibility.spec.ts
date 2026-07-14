import { expect, type Page, test } from '@playwright/test';

interface AccessibilityIssue {
  readonly message: string;
  readonly target: string;
}

interface ContrastIssue {
  readonly ratio: number;
  readonly required: number;
  readonly target: string;
  readonly text: string;
}

async function expectNoBasicAccessibilityIssues(page: Page) {
  const issues = await page.evaluate<AccessibilityIssue[]>(() => {
    const collectedIssues: AccessibilityIssue[] = [];

    function selectorFor(element: Element) {
      const tagName = element.tagName.toLowerCase();
      const id = element.getAttribute('id');

      if (id) {
        return `${tagName}#${id}`;
      }

      const label =
        element.getAttribute('aria-label') ??
        element.textContent?.replace(/\s+/g, ' ').trim().slice(0, 48);

      return label ? `${tagName}[${label}]` : tagName;
    }

    function addIssue(element: Element | null, message: string) {
      collectedIssues.push({
        message,
        target: element ? selectorFor(element) : 'document',
      });
    }

    function isVisible(element: Element) {
      const htmlElement = element as HTMLElement;

      if (htmlElement.hidden || element.closest('[hidden],[aria-hidden="true"]')) {
        return false;
      }

      const style = window.getComputedStyle(htmlElement);

      if (style.display === 'none' || style.visibility === 'hidden') {
        return false;
      }

      return Array.from(htmlElement.getClientRects()).some(
        (rect) => rect.width > 0 && rect.height > 0,
      );
    }

    function getReferencedText(element: Element, attribute: string) {
      const value = element.getAttribute(attribute);

      if (!value) {
        return '';
      }

      return value
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
        .filter(Boolean)
        .join(' ')
        .trim();
    }

    function getControlLabelText(element: Element) {
      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement
      ) {
        return Array.from(element.labels ?? [])
          .map((label) => label.textContent?.replace(/\s+/g, ' ').trim() ?? '')
          .filter(Boolean)
          .join(' ')
          .trim();
      }

      return '';
    }

    function getAccessibleName(element: Element) {
      const ariaLabel = element.getAttribute('aria-label')?.trim();

      if (ariaLabel) {
        return ariaLabel;
      }

      const ariaLabelledBy = getReferencedText(element, 'aria-labelledby');

      if (ariaLabelledBy) {
        return ariaLabelledBy;
      }

      const controlLabel = getControlLabelText(element);

      if (controlLabel) {
        return controlLabel;
      }

      if (element instanceof HTMLInputElement) {
        const type = element.type.toLowerCase();

        if (['button', 'submit', 'reset'].includes(type)) {
          return element.value.trim();
        }
      }

      if (element instanceof HTMLImageElement) {
        return element.alt.trim();
      }

      return element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    }

    const documentLanguage = document.documentElement.lang.trim();

    if (!documentLanguage) {
      addIssue(null, 'Document must declare a language.');
    }

    const visibleMainElements = Array.from(document.querySelectorAll('main')).filter(isVisible);

    if (visibleMainElements.length === 0) {
      addIssue(null, 'Route must expose a visible main landmark.');
    }

    const visibleHeadings = Array.from(document.querySelectorAll('h1')).filter(isVisible);

    if (visibleHeadings.length === 0) {
      addIssue(null, 'Route must expose at least one visible h1.');
    }

    for (const heading of visibleHeadings) {
      if (!heading.textContent?.trim()) {
        addIssue(heading, 'Visible h1 must not be empty.');
      }
    }

    const ids = new Map<string, Element>();

    for (const element of Array.from(document.querySelectorAll('[id]'))) {
      const id = element.getAttribute('id');

      if (!id) {
        continue;
      }

      const existing = ids.get(id);

      if (existing) {
        addIssue(element, `Duplicate id "${id}" also appears on ${selectorFor(existing)}.`);
      } else {
        ids.set(id, element);
      }
    }

    for (const element of Array.from(document.querySelectorAll('[aria-labelledby]'))) {
      for (const id of element.getAttribute('aria-labelledby')?.split(/\s+/) ?? []) {
        if (id && !document.getElementById(id)) {
          addIssue(element, `aria-labelledby references missing id "${id}".`);
        }
      }
    }

    for (const element of Array.from(document.querySelectorAll('[aria-describedby]'))) {
      for (const id of element.getAttribute('aria-describedby')?.split(/\s+/) ?? []) {
        if (id && !document.getElementById(id)) {
          addIssue(element, `aria-describedby references missing id "${id}".`);
        }
      }
    }

    const interactiveSelector = [
      'a[href]',
      'button',
      'input',
      'select',
      'summary',
      'textarea',
      '[role="button"]',
      '[role="checkbox"]',
      '[role="link"]',
      '[role="tab"]',
      '[tabindex]',
    ].join(',');

    for (const element of Array.from(document.querySelectorAll(interactiveSelector))) {
      if (!isVisible(element)) {
        continue;
      }

      const htmlElement = element as HTMLElement;

      if (htmlElement.tabIndex > 0) {
        addIssue(element, 'Interactive elements must not use positive tabindex.');
      }

      if (!getAccessibleName(element)) {
        addIssue(element, 'Interactive element must have an accessible name.');
      }
    }

    for (const image of Array.from(document.querySelectorAll('img')).filter(isVisible)) {
      const role = image.getAttribute('role');
      const isDecorative =
        image.getAttribute('aria-hidden') === 'true' || role === 'presentation' || role === 'none';

      if (!isDecorative && !image.hasAttribute('alt')) {
        addIssue(image, 'Visible images must declare alt text or be marked decorative.');
      }
    }

    return collectedIssues;
  });

  expect(issues, issues.map((issue) => `${issue.target}: ${issue.message}`).join('\n')).toEqual([]);
}

async function expectNoTextContrastIssues(page: Page) {
  const issues = await page.evaluate<ContrastIssue[]>(() => {
    const collectedIssues: ContrastIssue[] = [];

    function selectorFor(element: Element) {
      const tagName = element.tagName.toLowerCase();
      const id = element.getAttribute('id');

      if (id) {
        return `${tagName}#${id}`;
      }

      const label =
        element.getAttribute('aria-label') ??
        element.textContent?.replace(/\s+/g, ' ').trim().slice(0, 48);

      return label ? `${tagName}[${label}]` : tagName;
    }

    function isVisible(element: Element) {
      const htmlElement = element as HTMLElement;

      if (htmlElement.hidden || element.closest('[hidden],[aria-hidden="true"],svg')) {
        return false;
      }

      const style = window.getComputedStyle(htmlElement);

      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false;
      }

      return Array.from(htmlElement.getClientRects()).some(
        (rect) => rect.width > 1 && rect.height > 1,
      );
    }

    function parseColorComponent(value: string) {
      if (value.endsWith('%')) {
        return (Number.parseFloat(value) / 100) * 255;
      }

      return Number.parseFloat(value);
    }

    function linearChannelToSrgb(channel: number) {
      const normalized =
        channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;

      return Math.min(255, Math.max(0, normalized * 255));
    }

    function parseOklchColor(value: string) {
      const match = value.match(
        /oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)(?:deg)?(?:\s*\/\s*([0-9.]+%?))?\s*\)/,
      );

      if (!match) {
        return null;
      }

      const lightness = match[1].endsWith('%')
        ? Number.parseFloat(match[1]) / 100
        : Number.parseFloat(match[1]);
      const chroma = Number.parseFloat(match[2]);
      const hue = (Number.parseFloat(match[3]) * Math.PI) / 180;
      const alpha = match[4]
        ? match[4].endsWith('%')
          ? Number.parseFloat(match[4]) / 100
          : Number.parseFloat(match[4])
        : 1;

      const a = chroma * Math.cos(hue);
      const b = chroma * Math.sin(hue);
      const lPrime = lightness + 0.3963377774 * a + 0.2158037573 * b;
      const mPrime = lightness - 0.1055613458 * a - 0.0638541728 * b;
      const sPrime = lightness - 0.0894841775 * a - 1.291485548 * b;
      const l = lPrime ** 3;
      const m = mPrime ** 3;
      const s = sPrime ** 3;

      return {
        alpha,
        blue: linearChannelToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
        green: linearChannelToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
        red: linearChannelToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
      };
    }

    function parseColor(value: string) {
      const oklch = parseOklchColor(value);

      if (oklch) {
        return oklch;
      }

      const hex = value.match(/^#([0-9a-f]{6})$/i);

      if (hex) {
        return {
          alpha: 1,
          blue: Number.parseInt(hex[1].slice(4, 6), 16),
          green: Number.parseInt(hex[1].slice(2, 4), 16),
          red: Number.parseInt(hex[1].slice(0, 2), 16),
        };
      }

      const match = value.match(/rgba?\(([^)]+)\)/);

      if (!match) {
        return null;
      }

      const parts = match[1]
        .replace(/\//g, ' ')
        .split(/[\s,]+/)
        .filter(Boolean);
      const red = parseColorComponent(parts[0] ?? '');
      const green = parseColorComponent(parts[1] ?? '');
      const blue = parseColorComponent(parts[2] ?? '');
      const alpha = parts[3]?.endsWith('%')
        ? Number.parseFloat(parts[3]) / 100
        : Number.parseFloat(parts[3] ?? '1');

      if ([red, green, blue, alpha].some((part) => Number.isNaN(part))) {
        return null;
      }

      return {
        alpha,
        blue,
        green,
        red,
      };
    }

    function channelToLinear(channel: number) {
      const normalized = channel / 255;
      return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    }

    function luminance(color: { red: number; green: number; blue: number }) {
      return (
        0.2126 * channelToLinear(color.red) +
        0.7152 * channelToLinear(color.green) +
        0.0722 * channelToLinear(color.blue)
      );
    }

    function contrastRatio(
      foreground: { red: number; green: number; blue: number },
      background: { red: number; green: number; blue: number },
    ) {
      const lighter = Math.max(luminance(foreground), luminance(background));
      const darker = Math.min(luminance(foreground), luminance(background));
      return (lighter + 0.05) / (darker + 0.05);
    }

    function effectiveBackground(element: Element) {
      let current: Element | null = element;

      while (current) {
        const color = parseColor(window.getComputedStyle(current).backgroundColor);

        if (color && color.alpha > 0) {
          return color;
        }

        current = current.parentElement;
      }

      return { alpha: 1, blue: 249, green: 250, red: 250 };
    }

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let currentNode = walker.nextNode();

    while (currentNode) {
      const text = currentNode.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      const element = currentNode.parentElement;

      if (
        text &&
        element &&
        isVisible(element) &&
        !element.closest('[disabled],[aria-disabled="true"],.sr-only')
      ) {
        const style = window.getComputedStyle(element);
        const foreground = parseColor(style.color);
        const background = effectiveBackground(element);

        if (foreground) {
          const fontSize = Number.parseFloat(style.fontSize);
          const fontWeight = Number.parseInt(style.fontWeight, 10);
          const required = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700) ? 3 : 4.5;
          const ratio = contrastRatio(foreground, background);

          if (ratio < required) {
            collectedIssues.push({
              ratio: Number(ratio.toFixed(2)),
              required,
              target: selectorFor(element),
              text: text.slice(0, 80),
            });
          }
        }
      }

      currentNode = walker.nextNode();
    }

    return collectedIssues.slice(0, 50);
  });

  expect(
    issues,
    issues
      .map(
        (issue) =>
          `${issue.target}: ${issue.ratio}:1 below ${issue.required}:1 for "${issue.text}"`,
      )
      .join('\n'),
  ).toEqual([]);
}

async function expectRouteAccessibility(page: Page) {
  await expectNoBasicAccessibilityIssues(page);
  await expectNoTextContrastIssues(page);
}

async function isFocused(locator: ReturnType<Page['locator']>) {
  return locator.evaluate((element) => element === document.activeElement).catch(() => false);
}

async function tabTo(page: Page, locator: ReturnType<Page['locator']>, label: string) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    await page.keyboard.press('Tab');

    if (await isFocused(locator)) {
      return;
    }
  }

  throw new Error(`Could not reach "${label}" with keyboard tab navigation.`);
}

async function activateFocusedControl(page: Page) {
  const focusIndicator = await page.locator(':focus').evaluate((element) => {
    const style = window.getComputedStyle(element);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
    };
  });

  expect(focusIndicator.outlineStyle).not.toBe('none');
  expect(focusIndicator.outlineWidth).toBeGreaterThanOrEqual(2);

  await page.keyboard.press('Enter');
}

async function expectReducedMotionDisablesTransitions(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/overview');
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();

  const motionIssues = await page.evaluate<string[]>(() => {
    function isVisible(element: Element) {
      const htmlElement = element as HTMLElement;
      const style = window.getComputedStyle(htmlElement);

      return (
        !htmlElement.hidden &&
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        Array.from(htmlElement.getClientRects()).some((rect) => rect.width > 0 && rect.height > 0)
      );
    }

    function hasDuration(value: string) {
      return value
        .split(',')
        .map((part) => part.trim())
        .some((part) => {
          if (part.endsWith('ms')) {
            return Number.parseFloat(part) > 0;
          }

          if (part.endsWith('s')) {
            return Number.parseFloat(part) > 0;
          }

          return false;
        });
    }

    return Array.from(document.querySelectorAll('*'))
      .filter(isVisible)
      .filter((element) => {
        const style = window.getComputedStyle(element);
        return hasDuration(style.animationDuration) || hasDuration(style.transitionDuration);
      })
      .map((element) => element.tagName.toLowerCase())
      .slice(0, 20);
  });

  expect(motionIssues).toEqual([]);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
}

test.describe('basic route accessibility', () => {
  test('onboarding exposes usable landmarks, controls, and names', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(
      page.getByRole('heading', { name: /set up attentionos around the workflow it protects/i }),
    ).toBeVisible();

    await expectRouteAccessibility(page);
  });

  test('ritual exposes usable landmarks, controls, and names', async ({ page }) => {
    await page.goto('/ritual');
    await expect(page.getByRole('heading', { name: 'Ritual' })).toBeVisible();

    await expectRouteAccessibility(page);
  });

  test('overview exposes usable landmarks, controls, and names', async ({ page }) => {
    await page.goto('/overview');
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();

    await expectRouteAccessibility(page);
  });

  test('execution plan exposes usable landmarks, controls, and names', async ({ page }) => {
    await page.goto('/execution/plan');
    await expect(page.getByRole('heading', { name: 'Execution Plan' })).toBeVisible();

    await expectRouteAccessibility(page);
  });

  test('execution focus exposes usable landmarks, controls, and names', async ({ page }) => {
    await page.goto('/execution/plan');
    await page.getByLabel('Title').fill('Accessibility focus candidate');
    await page
      .getByLabel('Clarification')
      .fill('Verify that Focus remains navigable with named controls.');
    await page.getByLabel('Planning role').selectOption('current');
    await page.getByRole('button', { name: 'Create work item' }).click();
    await page.getByRole('button', { name: 'Enter focus' }).click();
    await expect(page.getByRole('heading', { name: 'Execution Focus' })).toBeVisible();

    await expectRouteAccessibility(page);
  });

  test('settings exposes usable landmarks, controls, and names', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: 'Data & Settings' })).toBeVisible();

    await expectRouteAccessibility(page);
  });

  test('primary daily workflow can be operated with keyboard only', async ({ page }) => {
    await page.goto('/onboarding');

    const localFirst = page.getByLabel(/workspace starts local to this Mac/i);
    await tabTo(page, localFirst, 'local-first acknowledgement');
    await page.keyboard.press('Space');
    await expect(localFirst).toBeChecked();

    const nonMedical = page.getByLabel(/not medical advice or clinical diagnosis/i);
    await tabTo(page, nonMedical, 'non-medical acknowledgement');
    await page.keyboard.press('Space');
    await expect(nonMedical).toBeChecked();

    await tabTo(page, page.getByRole('button', { name: 'Begin with Ritual' }), 'Begin with Ritual');
    await activateFocusedControl(page);
    await expect(page.getByRole('heading', { name: 'Ritual' })).toBeVisible();

    await tabTo(page, page.getByRole('button', { name: 'Start meditation' }), 'Start meditation');
    await activateFocusedControl(page);
    await tabTo(
      page,
      page.getByRole('button', { name: 'Complete meditation' }),
      'Complete meditation',
    );
    await activateFocusedControl(page);
    await expect(page.getByRole('heading', { name: 'Reflection' })).toBeVisible();

    const reflection = page.getByLabel('Reflection');
    await tabTo(page, reflection, 'Reflection');
    await page.keyboard.type('Keyboard-only release candidate reflection.');
    await tabTo(page, page.getByRole('button', { name: 'Save reflection' }), 'Save reflection');
    await activateFocusedControl(page);
    await expect(page.getByRole('heading', { name: 'Dedication' })).toBeVisible();

    await tabTo(page, page.getByRole('button', { name: 'Complete ritual' }), 'Complete ritual');
    await activateFocusedControl(page);
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();

    for (const name of [
      'Open Personal Context OS',
      'Open Product development',
      'Open Coherent stage experience',
      'Open Overview scan redesign',
    ]) {
      await tabTo(page, page.getByRole('button', { name }), name);
      await activateFocusedControl(page);
    }

    await tabTo(
      page,
      page.getByRole('button', { name: 'Start execution for Clarify overview scan' }),
      'Start execution for Clarify overview scan',
    );
    await activateFocusedControl(page);
    await expect(page.getByRole('heading', { name: 'Execution Plan' })).toBeVisible();

    await tabTo(page, page.getByRole('button', { name: 'Enter focus' }), 'Enter focus');
    await activateFocusedControl(page);
    await expect(page.getByRole('heading', { name: 'Execution Focus' })).toBeVisible();

    for (const name of ['Start task', 'Add 5 minutes', 'Submit for review', 'Complete task']) {
      await tabTo(page, page.getByRole('button', { name }), name);
      await activateFocusedControl(page);
    }

    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
  });

  test('reduced motion removes visible transition and animation durations', async ({ page }) => {
    await expectReducedMotionDisablesTransitions(page);
  });
});
