---
name: playwright-e2e-testing
description: "Playwright 現代端對端測試框架，具備跨瀏覽器自動化、自動等待和內建測試執行器"
progressive_disclosure:
  entry_point:
    summary: "Playwright 現代端對端測試框架，具備跨瀏覽器自動化、自動等待和內建測試執行器"
    when_to_use: "當撰寫測試、實作 playwright-e2e-testing 或確保程式碼品質時。"
    quick_start: "1. 檢視下方的核心概念。2. 將模式應用於您的案例。3. 遵循實作的最佳實踐。"
---
# Playwright 端對端 (E2E) 測試技術

---
progressive_disclosure:
  entry_point:
    summary: "現代端對端測試框架，具備跨瀏覽器自動化與內建測試執行器"
    when_to_use:
      - "當對 Web 應用程式進行端對端測試時"
      - "當需要跨瀏覽器測試時"
      - "當測試使用者流程與互動時"
      - "當需要螢幕截圖/影片錄製時"
    quick_start:
      - "npm init playwright @latest"
      - "選擇 TypeScript 與測試位置"
      - "npx playwright test"
      - "npx playwright show-report"
  token_estimate:
    entry: 75-90
    full: 4200-5200
---

<!-- ENTRY POINT - 預設載入此章節 (75-90 tokens) -->

## 總覽

Playwright 是一個現代化的端對端測試框架，提供具備內建測試執行器、自動等待機制以及卓越開發體驗的跨瀏覽器自動化。

### 核心特性
- **自動等待 (Auto-wait)**：自動等待元素就緒
- **跨瀏覽器 (Cross-browser)**：支援 Chromium、Firefox、WebKit
- **內建執行器 (Built-in runner)**：並行執行、重試、報告程式
- **網路控制 (Network control)**：模擬與截獲網路請求
- **偵錯 (Debugging)**：UI 模式、追蹤檢視器、檢查器

---

<!-- FULL CONTENT - 隨需載入 (4200-5200 tokens) -->

## 安裝

```bash
# 初始化新的 Playwright 專案
npm init playwright @packages/server/api/src/app/database/migration/postgres/1765993826655-MigrateOldTemplatesToNewSchema.ts

# 或新增至現有專案
npm install -D @playwright/test

# 安裝瀏覽器
npx playwright install
```

### 設定

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 基礎知識

### 基本測試結構

```typescript
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('https://example.com');

  // 等待元素並檢查可見性
  const title = page.locator('h1');
  await expect(title).toBeVisible();
  await expect(title).toHaveText('Example Domain');

  // 取得頁面標題
  await expect(page).toHaveTitle(/Example/);
});

test.describe('使用者驗證', () => {
  test('應成功登入', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('.welcome-message')).toContainText('Welcome');
  });

  test('應針對無效憑證顯示錯誤', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="username"]', 'invalid');
    await page.fill('[name="password"]', 'wrong');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toHaveText('Invalid credentials');
  });
});
```

### 測試鉤子 (Test Hooks)

```typescript
import { test, expect } from '@playwright/test';

test.describe('儀表板測試', () => {
  test.beforeEach(async ({ page }) => {
    // 在每個測試前執行
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    // 在每個測試後清理
    await page.close();
  });

  test.beforeAll(async ({ browser }) => {
    // 在 describe 區塊的所有測試前執行一次
    console.log('Starting test suite');
  });

  test.afterAll(async ({ browser }) => {
    // 在所有測試後執行一次
    console.log('Test suite complete');
  });

  test('顯示使用者資料', async ({ page }) => {
    await expect(page.locator('.user-name')).toBeVisible();
  });
});
```

## 定位器策略

### 最佳實踐：基於角色的定位器

```typescript
import { test, expect } from '@playwright/test';

test('accessible locators', async ({ page }) => {
  await page.goto('/form');

  // 依角色定位 (最佳實踐 - 具無障礙性且穩定)
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');
  await page.getByRole('checkbox', { name: 'Subscribe' }).check();
  await page.getByRole('link', { name: 'Learn more' }).click();

  // 依標籤定位 (適用於表單)
  await page.getByLabel('Password').fill('secret123');

  // 依佔位符定位
  await page.getByPlaceholder('Search...').fill('query');

  // 依文字定位
  await page.getByText('Welcome back').click();
  await page.getByText(/hello/i).isVisible();

  // 依測試 ID 定位 (適用於動態內容)
  await page.getByTestId('user-profile').click();

  // 依標題定位
  await page.getByTitle('Close dialog').click();

  // 依替代文字定位 (圖片)
  await page.getByAltText('User avatar').click();
});
```

### CSS 與 XPath 定位器

```typescript
test('CSS and XPath locators', async ({ page }) => {
  // CSS 選擇器
  await page.locator('button.primary').click();
  await page.locator('#user-menu').click();
  await page.locator('[data-testid="submit-btn"]').click();
  await page.locator('div.card:first-child').click();

  // XPath (請謹慎使用)
  await page.locator('xpath=//button[contains(text(), "Submit")]').click();

  // 鏈式定位器
  const form = page.locator('form#login-form');
  await form.locator('input[name="email"]').fill('user@example.com');
  await form.locator('button[type="submit"]').click();

  // 篩選定位器
  await page.getByRole('listitem')
    .filter({ hasText: 'Product 1' })
    .getByRole('button', { name: 'Add to cart' })
    .click();
});
```

## 頁面物件模型 (Page Object Model)

### 頁面類別模式

```typescript
// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Log in' });
    this.errorMessage = page.locator('.error-message');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectErrorMessage(message: string) {
    await this.errorMessage.waitFor({ state: 'visible' });
    await expect(this.errorMessage).toHaveText(message);
  }
}

// pages/DashboardPage.ts
export class DashboardPage {
  readonly page: Page;
  readonly welcomeMessage: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeMessage = page.locator('.welcome-message');
    this.logoutButton = page.getByRole('button', { name: 'Logout' });
  }

  async waitForLoad() {
    await this.welcomeMessage.waitFor({ state: 'visible' });
  }

  async logout() {
    await this.logoutButton.click();
  }
}

// tests/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test('successful login flow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboard = new DashboardPage(page);

  await loginPage.goto();
  await loginPage.login('testuser', 'password123');

  await dashboard.waitForLoad();
  await expect(dashboard.welcomeMessage).toContainText('Welcome');
});
```

### 元件模式

```typescript
// components/NavigationComponent.ts
import { Page, Locator } from '@playwright/test';

export class NavigationComponent {
  readonly page: Page;
  readonly homeLink: Locator;
  readonly profileLink: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    const nav = page.locator('nav');
    this.homeLink = nav.getByRole('link', { name: 'Home' });
    this.profileLink = nav.getByRole('link', { name: 'Profile' });
    this.searchInput = nav.getByPlaceholder('Search...');
  }

  async navigateToProfile() {
    await this.profileLink.click();
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }
}
```

## 使用者互動

### 表單互動

```typescript
test('form interactions', async ({ page }) => {
  await page.goto('/form');

  // 文字輸入
  await page.fill('input[name="email"]', 'user@example.com');
  await page.type('textarea[name="message"]', 'Hello', { delay: 100 });

  // 核取方塊
  await page.check('input[type="checkbox"][name="subscribe"]');
  await page.uncheck('input[type="checkbox"][name="spam"]');

  // 單選按鈕
  await page.check('input[type="radio"][value="option1"]');

  // 下拉選單
  await page.selectOption('select[name="country"]', 'US');
  await page.selectOption('select[name="color"]', { label: 'Blue' });
  await page.selectOption('select[name="size"]', { value: 'large' });

  // 多重選擇
  await page.selectOption('select[multiple]', ['value1', 'value2']);

  // 檔案上傳
  await page.setInputFiles('input[type="file"]', 'path/to/file.pdf');
  await page.setInputFiles('input[type="file"]', [
    'file1.jpg',
    'file2.jpg'
  ]);

  // 清除檔案輸入
  await page.setInputFiles('input[type="file"]', []);
});
```

### 滑鼠與鍵盤

```typescript
test('mouse and keyboard interactions', async ({ page }) => {
  // 點擊變化
  await page.click('button');
  await page.dblclick('button'); // 雙擊
  await page.click('button', { button: 'right' }); // 右鍵點擊
  await page.click('button', { modifiers: ['Shift'] }); // Shift+點擊

  // 懸停
  await page.hover('.tooltip-trigger');
  await expect(page.locator('.tooltip')).toBeVisible();

  // 拖放
  await page.dragAndDrop('#draggable', '#droppable');

  // 鍵盤
  await page.keyboard.press('Enter');
  await page.keyboard.press('Control+A');
  await page.keyboard.type('Hello World');
  await page.keyboard.down('Shift');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.up('Shift');

  // 聚焦
  await page.focus('input[name="email"]');
  await page.fill('input[name="email"]', 'test@example.com');
});
```

### 等待策略

```typescript
test('waiting strategies', async ({ page }) => {
  // 等待元素
  await page.waitForSelector('.dynamic-content');
  await page.waitForSelector('.modal', { state: 'visible' });
  await page.waitForSelector('.loading', { state: 'hidden' });

  // 等待載入狀態
  await page.waitForLoadState('load');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  // 等待 URL
  await page.waitForURL('**/dashboard');
  await page.waitForURL(/\/product\/\d+/);

  // 等待函式
  await page.waitForFunction(() => {
    return document.querySelectorAll('.item').length > 5;
  });

  // 等待超時 (儘可能避免使用)
  await page.waitForTimeout(1000);

  // 等待事件
  await page.waitForEvent('load');
  await page.waitForEvent('popup');
});
```

## 斷言 (Assertions)

### 常見斷言

```typescript
import { test, expect } from '@playwright/test';

test('assertions', async ({ page }) => {
  await page.goto('/dashboard');

  // 可見性
  await expect(page.locator('.header')).toBeVisible();
  await expect(page.locator('.loading')).toBeHidden();
  await expect(page.locator('.optional')).not.toBeVisible();

  // 文字內容
  await expect(page.locator('h1')).toHaveText('Dashboard');
  await expect(page.locator('h1')).toContainText('Dash');
  await expect(page.locator('.message')).toHaveText(/welcome/i);

  // 屬性
  await expect(page.locator('button')).toBeEnabled();
  await expect(page.locator('button')).toBeDisabled();
  await expect(page.locator('input')).toHaveAttribute('type', 'email');
  await expect(page.locator('input')).toHaveValue('test@example.com');

  // CSS
  await expect(page.locator('.button')).toHaveClass('btn-primary');
  await expect(page.locator('.button')).toHaveClass(/btn-/);
  await expect(page.locator('.element')).toHaveCSS('color', 'rgb(255, 0, 0)');

  // 數量
  await expect(page.locator('.item')).toHaveCount(5);

  // URL 與標題
  await expect(page).toHaveURL('http://localhost:3000/dashboard');
  await expect(page).toHaveURL(/dashboard$/);
  await expect(page).toHaveTitle('Dashboard - My App');
  await expect(page).toHaveTitle(/Dashboard/);

  // 螢幕截圖比較
  await expect(page).toHaveScreenshot('dashboard.png');
  await expect(page.locator('.widget')).toHaveScreenshot('widget.png');
});
```

### 自定義斷言

```typescript
test('custom matchers', async ({ page }) => {
  // 軟斷言 (Soft assertions) (失敗時繼續執行測試)
  await expect.soft(page.locator('.title')).toHaveText('Welcome');
  await expect.soft(page.locator('.subtitle')).toBeVisible();

  // 多個元素
  const items = page.locator('.item');
  await expect(items).toHaveCount(3);
  await expect(items.nth(0)).toContainText('First');
  await expect(items.nth(1)).toContainText('Second');

  // 輪詢斷言 (Poll assertions)
  await expect(async () => {
    const response = await page.request.get('/api/status');
    expect(response.ok()).toBeTruthy();
  }).toPass({
    timeout: 10000,
    intervals: [1000, 2000, 5000],
  });
});
```

## 驗證模式

### 儲存狀態模式 (Storage State Pattern)

```typescript
// auth.setup.ts - 執行一次以儲存驗證狀態
import { test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="username"]', 'testuser');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.waitForURL('/dashboard');

  // 儲存驗證狀態
  await page.context().storageState({ path: authFile });
});

// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
      dependencies: ['setup'],
    },
  ],
});

// tests/dashboard.spec.ts - 已經過驗證
test('view dashboard', async ({ page }) => {
  await page.goto('/dashboard');
  // 已經登入！
  await expect(page.locator('.user-menu')).toBeVisible();
});
```

### 多個使用者角色

```typescript
// fixtures/auth.ts
import { test as base } from '@playwright/test';

type Fixtures = {
  adminPage: Page;
  userPage: Page;
};

export const test = base.extend<Fixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/admin.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  userPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

// tests/permissions.spec.ts
import { test } from '../fixtures/auth';

test('管理員可以存取管理面板', async ({ adminPage }) => {
  await adminPage.goto('/admin');
  await expect(adminPage.locator('.admin-panel')).toBeVisible();
});

test('一般使用者無法存取管理面板', async ({ userPage }) => {
  await userPage.goto('/admin');
  await expect(userPage.locator('.access-denied')).toBeVisible();
});
```

## 網路控制

### 請求模擬 (Request Mocking)

```typescript
test('mock API responses', async ({ page }) => {
  // 模擬 API 回應
  await page.route('**/api/users', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        users: [
          { id: 1, name: 'John Doe' },
          { id: 2, name: 'Jane Smith' },
        ],
      }),
    });
  });

  await page.goto('/users');
  await expect(page.locator('.user-list')).toContainText('John Doe');
});

test('mock with conditions', async ({ page }) => {
  await page.route('**/api/**', route => {
    const url = route.request().url();

    if (url.includes('/users/1')) {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ id: 1, name: 'Test User' }),
      });
    } else if (url.includes('/users')) {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ users: [] }),
      });
    } else {
      route.continue();
    }
  });
});

test('simulate network errors', async ({ page }) => {
  await page.route('**/api/data', route => {
    route.abort('failed');
  });

  await page.goto('/data');
  await expect(page.locator('.error-message')).toBeVisible();
});
```

### 請求截獲 (Request Interception)

```typescript
test('intercept and modify requests', async ({ page }) => {
  // 修改請求標頭 (Headers)
  await page.route('**/api/**', route => {
    const headers = route.request().headers();
    route.continue({
      headers: {
        ...headers,
        'X-Custom-Header': 'test-value',
      },
    });
  });

  // 修改 POST 資料
  await page.route('**/api/submit', route => {
    const postData = route.request().postDataJSON();
    route.continue({
      postData: JSON.stringify({
        ...postData,
        timestamp: Date.now(),
      }),
    });
  });
});

test('wait for API response', async ({ page }) => {
  // 等待特定請求
  const responsePromise = page.waitForResponse('**/api/users');
  await page.click('button#load-users');
  const response = await responsePromise;

  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.users).toHaveLength(10);
});
```

## 測試組織

### 自定義 Fixtures

```typescript
// fixtures/todos.ts
import { test as base } from '@playwright/test';

type TodoFixtures = {
  todoPage: TodoPage;
  createTodo: (title: string) => Promise<void>;
};

export const test = base.extend<TodoFixtures>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await use(todoPage);
  },

  createTodo: async ({ page }, use) => {
    const create = async (title: string) => {
      await page.fill('.new-todo', title);
      await page.press('.new-todo', 'Enter');
    };
    await use(create);
  },
});

// tests/todos.spec.ts
import { test } from '../fixtures/todos';

test('can create new todo', async ({ todoPage, createTodo }) => {
  await createTodo('Buy groceries');
  await expect(todoPage.todoItems).toHaveCount(1);
  await expect(todoPage.todoItems).toHaveText('Buy groceries');
});
```

### 測試標籤與篩選

```typescript
test('smoke test', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Home');
});

test('regression test', { tag: ['@regression', '@critical'] }, async ({ page }) => {
  // 複雜測試
});

// 執行：npx playwright test --grep @smoke
// 排除執行：npx playwright test --grep-invert @packages/server/sandbox/test/fixtures/test-engine-slow.js
```

## 視覺化測試

### 螢幕截圖比較

```typescript
test('visual regression', async ({ page }) => {
  await page.goto('/dashboard');

  // 全頁螢幕截圖
  await expect(page).toHaveScreenshot('dashboard.png', {
    maxDiffPixels: 100,
  });

  // 元素螢幕截圖
  await expect(page.locator('.widget')).toHaveScreenshot('widget.png');

  // 包含捲動的全頁截圖
  await expect(page).toHaveScreenshot('full-page.png', {
    fullPage: true,
  });

  // 遮罩動態元素
  await expect(page).toHaveScreenshot('masked.png', {
    mask: [page.locator('.timestamp'), page.locator('.avatar')],
  });

  // 自定義閾值
  await expect(page).toHaveScreenshot('comparison.png', {
    maxDiffPixelRatio: 0.05, // 允許 5% 的差異
  });
});
```

### 影片與追蹤

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
});

// 以程式化方式記錄影片
test('record video', async ({ page }) => {
  await page.goto('/');
  // 測試動作...

  // 影片會自動儲存到 test-results/
});

// 查看追蹤：npx playwright show-trace trace.zip
```

## 並行執行

### 測試分片 (Test Sharding)

```typescript
// playwright.config.ts
export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
});

// 在 CI 中執行分片
// npx playwright test --shard=1/4
// npx playwright test --shard=2/4
// npx playwright test --shard=3/4
// npx playwright test --shard=4/4
```

### 序列測試 (Serial Tests)

```typescript
test.describe.configure({ mode: 'serial' });

test.describe('order matters', () => {
  let orderId: string;

  test('create order', async ({ page }) => {
    // 建立訂單
    orderId = await createOrder(page);
  });

  test('verify order', async ({ page }) => {
    // 使用前一個測試得到的 orderId
    await verifyOrder(page, orderId);
  });
});
```

## CI/CD 整合

### GitHub Actions

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@packages/server/api/src/app/flows/flow-version/migrations/migrate-v4-agent-piece.ts

      - uses: actions/setup-node@packages/server/api/src/app/flows/flow-version/migrations/migrate-v4-agent-piece.ts
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test

      - uses: actions/upload-artifact@packages/server/api/src/app/flows/flow-version/migrations/migrate-v4-agent-piece.ts
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Docker

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npx", "playwright", "test"]
```

## 偵錯 (Debugging)

### UI 模式

```bash
# 互動式偵錯
npx playwright test --ui

# 偵錯特定測試
npx playwright test --debug login.spec.ts

# 逐步執行測試
npx playwright test --headed --slow-mo=1000
```

### 追蹤檢視器 (Trace Viewer)

```typescript
// 產生追蹤
test('with trace', async ({ page }) => {
  await page.context().tracing.start({ screenshots: true, snapshots: true });

  // 測試動作
  await page.goto('/');

  await page.context().tracing.stop({ path: 'trace.zip' });
});

// 查看：npx playwright show-trace trace.zip
```

### 主控台日誌 (Console Logs)

```typescript
test('capture console', async ({ page }) => {
  page.on('console', msg => console.log(`Browser: ${msg.text()}`));
  page.on('pageerror', error => console.error(`Error: ${error.message}`));

  await page.goto('/');
});
```

## 最佳實踐

### 1. 使用穩定的定位器
```typescript
// ✅ 建議 - 基於角色且穩定
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByLabel('Email').fill('test@example.com');

// ❌ 不建議 - 脆弱，依賴實作細節
await page.click('button.btn-primary.submit-btn');
await page.fill('div > form > input:nth-child(3)');
```

### 2. 利用自動等待
```typescript
// ✅ 建議 - 自動等待
await page.click('button');
await expect(page.locator('.result')).toBeVisible();

// ❌ 不建議 - 手動等待
await page.waitForTimeout(2000);
await page.click('button');
```

### 3. 使用頁面物件模型 (Page Object Model)
```typescript
// ✅ 建議 - 可重複使用且易於維護
const loginPage = new LoginPage(page);
await loginPage.login('user', 'pass');

// ❌ 不建議 - 重複的選擇器
await page.fill('[name="username"]', 'user');
await page.fill('[name="password"]', 'pass');
```

### 4. 並行安全測試
```typescript
// ✅ 建議 - 彼此隔離
test('user signup', async ({ page }) => {
  const uniqueEmail = `user-${Date.now()}@test.com`;
  await signUp(page, uniqueEmail);
});

// ❌ 不建議 - 共享狀態
test('user signup', async ({ page }) => {
  await signUp(page, 'test@test.com'); // 在並行執行時會產生衝突
});
```

### 5. 處理不穩定性 (Flakiness)
```typescript
// ✅ 建議 - 等待網路閒置
await page.goto('/', { waitUntil: 'networkidle' });
await expect(page.locator('.data')).toBeVisible();

// 設定重試機制
test.describe(() => {
  test.use({ retries: 2 });

  test('flaky test', async ({ page }) => {
    // 具備自動重試的測試
  });
});
```

## 常見模式

### 多頁面場景

```typescript
test('popup handling', async ({ page, context }) => {
  // 監聽新頁面
  const popupPromise = context.waitForEvent('page');
  await page.click('a[target="_blank"]');
  const popup = await popupPromise;

  await popup.waitForLoadState();
  await expect(popup).toHaveTitle('New Window');
  await popup.close();
});
```

### 條件邏輯

```typescript
test('handle optional elements', async ({ page }) => {
  await page.goto('/');

  // 如果彈出視窗存在則關閉
  const modal = page.locator('.modal');
  if (await modal.isVisible()) {
    await page.click('.modal .close-button');
  }

  // 或者使用數量判斷
  const cookieBanner = page.locator('.cookie-banner');
  if ((await cookieBanner.count()) > 0) {
    await page.click('.accept-cookies');
  }
});
```

### 資料驅動測試 (Data-Driven Tests)

```typescript
const testCases = [
  { input: 'hello', expected: 'HELLO' },
  { input: 'World', expected: 'WORLD' },
  { input: '123', expected: '123' },
];

for (const { input, expected } of testCases) {
  test(`將 "${input}" 轉換為 "${expected}"`, async ({ page }) => {
    await page.goto('/transform');
    await page.fill('input', input);
    await page.click('button');
    await expect(page.locator('.result')).toHaveText(expected);
  });
}
```

## 資源

- [Playwright 文件](https://playwright.dev/)
- [最佳實踐指南](https://playwright.dev/docs/best-practices)
- [API 參考](https://playwright.dev/docs/api/class-playwright)
- [GitHub 範例](https://github.com/microsoft/playwright/tree/main/examples)