//Base Page Model
//Provides common functionality for all page models

//UI Layer - User Actions

import { Page, Locator } from '@playwright/test';
import { createLogger } from '../core/logger';
import { config } from '../core/config';
import { heal, getHealedDef } from '../core/healing/healer';
import { toLocator } from '../core/healing/candidates';
import { LocatorDef } from '../core/healing/types';
import { Locators } from './locators';

const logger = createLogger('BasePage');

type LocatorSections = typeof Locators;

//Dot path to an entry in ui/locators.ts, e.g. 'login.submitButton'
export type LocatorKey = {
  [S in keyof LocatorSections]: `${S & string}.${keyof LocatorSections[S] & string}`;
}[keyof LocatorSections];

//A locator that knows its entry in ui/locators.ts, so it can be self-healed and patched
export interface HealableLocator {
  key: LocatorKey;
  def: LocatorDef;
}

export type Target = Locator | HealableLocator;

function isHealable(target: Target): target is HealableLocator {
  return 'key' in target && 'def' in target;
}

export class BasePage {
  protected page: Page;
  protected baseURL: string;

  constructor(page: Page) {
    this.page = page;
    this.baseURL = config.getBaseURL();
  }

  //Reference a central locator by key; actions on it self-heal when HEALING_ENABLED=true
  protected loc(key: LocatorKey): HealableLocator {
    const [section, name] = key.split('.');
    const def = (Locators as Record<string, Record<string, LocatorDef>>)[section][name];
    return { key, def };
  }

  //Resolve a target to a visible Locator, healing it if it no longer matches
  protected async resolve(target: Target, action: string = 'locate'): Promise<Locator> {
    if (!isHealable(target)) {
      await this.waitForVisible(target);
      return target;
    }

    const def = getHealedDef(target.key) ?? target.def;
    const locator = toLocator(this.page, def, def !== target.def);
    const healing = config.getHealing();
    if (!healing.enabled) {
      await this.waitForVisible(locator);
      return locator;
    }

    try {
      await locator.waitFor({ state: 'visible', timeout: healing.probeTimeout });
      return locator;
    } catch {
      // Slow pages look like broken locators - let the page settle before deciding it changed.
      // An ambiguous match (strict mode violation) counts as broken too.
      await this.page.waitForLoadState('networkidle').catch(() => undefined);
      if (await this.isVisible(locator)) return locator;

      const result = await heal(this.page, { key: target.key, original: def, action, url: this.page.url() });
      if (result) return toLocator(this.page, result.def, true);

      // Nothing trustworthy found: wait out the normal timeout so the failure reads as usual
      await this.waitForVisible(locator);
      return locator;
    }
  }

  //Navigate to URL
  async goto(path: string = ''): Promise<void> {
    const url = `${this.baseURL}${path}`;
    logger.info(`Navigating to: ${url}`);
    await this.page.goto(url);
  }

  //Wait for page load
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  //Get page title
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  //Get current URL
  getCurrentURL(): string {
    return this.page.url();
  }

  //Wait for element to be visible
  async waitForVisible(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
  }

  //Wait for element to be hidden
  async waitForHidden(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'hidden' });
  }

  //Click element
  async click(target: Target): Promise<void> {
    await (await this.resolve(target, 'click')).click();
  }

  //Fill input field
  async fill(target: Target, value: string): Promise<void> {
    await (await this.resolve(target, 'fill')).fill(value);
  }

  //Type into input field
  async type(target: Target, value: string): Promise<void> {
    await (await this.resolve(target, 'type')).pressSequentially(value);
  }

  //Get text content
  async getText(target: Target): Promise<string> {
    return (await (await this.resolve(target, 'read text')).textContent()) || '';
  }

  //Check if element is visible
  async isVisible(locator: Locator): Promise<boolean> {
    try {
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  //Check if element is enabled
  async isEnabled(locator: Locator): Promise<boolean> {
    return await locator.isEnabled();
  }

  //Select dropdown option
  async selectOption(target: Target, value: string): Promise<void> {
    await (await this.resolve(target, 'select option')).selectOption(value);
  }

  //Check checkbox
  async check(target: Target): Promise<void> {
    const locator = await this.resolve(target, 'check');
    if (!(await locator.isChecked())) {
      await locator.check();
    }
  }

  //Uncheck checkbox
  async uncheck(target: Target): Promise<void> {
    const locator = await this.resolve(target, 'uncheck');
    if (await locator.isChecked()) {
      await locator.uncheck();
    }
  }

  //Take screenshot
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `${config.getScreenshotsDir()}/${name}.png` });
    logger.info(`Screenshot saved: ${name}.png`);
  }

  //Reload page
  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  //Go back
  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.waitForPageLoad();
  }
}
