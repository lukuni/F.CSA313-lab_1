import { defineConfig, devices } from '@playwright/test';

/**
 * Лабораторийн тохиргоо.
 * - trace/video "retain-on-failure": бүх ажилтай тестийн trace хадгалахгүй,
 *   зөвхөн унасан тестийн trace/video-г диск дээр үлдээнэ. Ингэснээр
 *   Алхам 4-т санаатай унагасан тестийн жинхэнэ нотолгоог амархан авч,
 *   docs/ хавтсанд хуулж болно.
 * - testIdAttribute: 'data-test' — saucedemo сайт data-test атрибут ашигладаг
 *   тул getByTestId() ашиглахад id селектор шиг тогтвортой, гэхдээ CSS id-аас
 *   илүү уншигдахуйц байдаг.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,
  reporter: 'html',
  use: {
    baseURL: 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
