import { expect, Page, test } from '@playwright/test';

const appConfigResponse = {
  result: {
    _id: 'playwright-app',
    afterLoginPage: '/app/admin/apps',
    aiBot: {
      userId: '',
      chatId: '',
      status: 'off',
      greetingMessage: '',
      isRAG: false,
      trigger: '',
      prompt: '',
      siteLinks: [],
      siteUrlsV2: [],
      files: [],
      user: {
        _id: '',
        firstName: '',
        lastName: '',
        isBot: true,
      },
      chat: {
        _id: '',
        name: '',
        title: '',
        description: '',
        type: '',
        picture: '',
      },
    },
    allowUsersToCreateRooms: true,
    appTagline: 'Playwright smoke environment',
    appToken: 'playwright-app-token',
    availableMenuItems: {
      chats: true,
      profile: true,
      settings: true,
    },
    bundleId: 'com.ethora.playwright',
    coinName: 'Ethora',
    coinSymbol: 'ETHORA',
    createdAt: '2026-01-01T00:00:00.000Z',
    creatorId: 'playwright-user',
    defaultAccessAssetsOpen: true,
    defaultAccessProfileOpen: true,
    defaultRooms: [],
    displayName: 'Ethora Test App',
    domainName: 'playwright.local',
    firebaseWebConfigString: '',
    googleServiceInfoPlist: '',
    googleServicesJson: '',
    isAllowedNewAppCreate: true,
    isBaseApp: false,
    logoImage: '',
    parentAppId: '',
    primaryColor: '#0052CD',
    signonOptions: ['email'],
    stats: {
      recentlyApiCalls: 0,
      recentlyFiles: 0,
      recentlyIssuance: 0,
      recentlyRegistered: 0,
      recentlySessions: 0,
      recentlyTokens: 0,
      recentlyTransactions: 0,
      totalApiCalls: 0,
      totalFiles: 0,
      totalIssuance: 0,
      totalRegistered: 0,
      totalSessions: 0,
      totalTransactions: 0,
      totalChats: 0,
      totalTokens: 0,
      recentlyChats: 0,
    },
    sublogoImage: '',
    systemChatAccount: {
      jid: 'system@example.com',
    },
    updatedAt: '2026-01-01T00:00:00.000Z',
    usersCanFree: true,
  },
};

async function mockAppConfig(page: Page) {
  await page.route('**/v1/apps/get-config*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(appConfigResponse),
    });
  });
}

test.beforeEach(async ({ page }) => {
  await mockAppConfig(page);
});

test('login page renders public auth form', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  await expect(page.getByText("Don't have an account?")).toBeVisible();
  await expect(page.getByText('Playwright smoke environment')).toBeVisible();
});

test('register page renders public auth form', async ({ page }) => {
  await page.goto('/register');

  await expect(page.getByRole('heading', { name: 'Sign Up' })).toBeVisible();
  await expect(page.getByText('Already have an account?')).toBeVisible();
  await expect(page.getByText('Playwright smoke environment')).toBeVisible();
});

test('unknown route renders 404 page', async ({ page }) => {
  await page.goto('/does-not-exist');

  await expect(page.getByText(/We can.t find that page/i)).toBeVisible();
  await expect(
    page.getByText(/doesn.t exist or has been moved/i)
  ).toBeVisible();
});
