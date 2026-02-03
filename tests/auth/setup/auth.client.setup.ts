import { test as setup } from '@playwright/test';
import { getSecrets } from './secrets.util';
import path from 'path';

const authFile = path.join(__dirname, '../storage/client.user.json');

setup('client authentication', async ({ page }) => {
  const clientPassword = (await getSecrets("auto-client-user-password"));

  //auth steps
  await page.goto(process.env.CLIENT_BASE_URL + 'auth/login?callbackUrl=%2F');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByLabel('Email').fill('' + process.env.CLIENT_USER_EMAIL_0);
  await page.getByLabel('Password', { exact: true }).fill(clientPassword);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('' + process.env.CLIENT_BASE_URL);

  //stores auth state
  await page.context().storageState({ path: authFile });
  console.log('client setup complete');
});