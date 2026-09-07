import { test, expect } from '@playwright/test';

/**
 * saucedemo.com дээрх нэвтрэх болон сагслах үйлдлийг шалгах тестүүд.
 *
 * Локатор сонголтын тухай (README-д дэлгэрэнгүй бичсэн):
 * - Бид XPath ашиглаагүй. Учир нь XPath нь DOM-ийн бүтэц дээр шууд хамааралтай
 *   тул HTML-ийн зохион байгуулалт бага зэрэг өөрчлөгдмөгц эвдэрдэг (fragile).
 *   getByRole / getByPlaceholder / getByText / getByTestId нь хэрэглэгчийн
 *   харж, унших зүйл дээр (button-ий нэр, placeholder текст гэх мэт) тулгуурладаг
 *   тул илүү тогтвортой бөгөөд screen reader-тэй ижил төстэй "accessibility tree"
 *   ашигладаг тул хандалтын хувьд ч давуу тал өгдөг.
 * - Menu/Logout товчлуурыг CSS id (#react-burger-menu-btn гэх мэт) -аар биш,
 *   харин getByRole ашиглан олсон — товчлуурын дизайн/id өөрчлөгдсөн ч тест
 *   эвдрэхгүй байх магадлал өндөр.
 * - getByText ашиглахдаа exact: true өгсөн эсвэл эсрэгээр getByRole ашигласан,
 *   учир нь "Products" гэх мэт текст хуудсан дээр өөр элементийн доторх текстэй
 *   давхацвал (жишээ нь webkit дээр) тест тогтворгүй (flaky) болдог байсан.
 *
 * Хугацаа хүлээх тухай:
 * - Хаана ч waitForTimeout() ашиглаагүй. Playwright-ийн auto-wait механизм
 *   элемент "actionable" (харагдах, идэвхтэй) болтол өөрөө хүлээдэг тул
 *   гар аргаар sleep хийх шаардлагагүй. Хэрэв тест тогтворгүй байвал
 *   шийдэл нь хүлээлт нэмэх биш, локаторыг илүү тодорхой болгох явдал.
 */

const USERNAME = 'standard_user';
const PASSWORD = 'secret_sauce';

/** Нэвтэрсэн хэрэглэгчийг цэсээр гарган (logout) URL-ийг шалгах тусламж функц. */
async function logout(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page).toHaveURL('https://www.saucedemo.com/');
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
}

test.describe('Нэвтрэх (login) үйлдэл', () => {
  test('амжилттай нэвтрэх бол Products хуудас гарч, дараа нь гарна (logout)', async ({ page }) => {
    await page.goto('/');

    await page.getByPlaceholder('Username').fill(USERNAME);
    await page.getByPlaceholder('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    // Амжилттай нэвтэрсний нотолгоо: URL болон гарчиг хоёулаа шалгав.
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(page.getByText('Products', { exact: true })).toBeVisible();

    // Тест бүр logout-оор төгсдөг байх ёстой (Алхам 5).
    await logout(page);
  });

  test('буруу нууц үгээр нэвтрэхэд алдааны мессеж гарна', async ({ page }) => {
    await page.goto('/');

    await page.getByPlaceholder('Username').fill(USERNAME);
    await page.getByPlaceholder('Password').fill('wrong_password');
    await page.getByRole('button', { name: 'Login' }).click();

    // Амжилтгүй нэвтрэлтийн тохиолдолд Products хуудас руу шилжихгүй,
    // харин алдааны мессеж харагдана.
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(
      page.getByText('Epic sadface: Username and password do not match any user in this service')
    ).toBeVisible();
  });

  test('нэвтэрсний дараа бараа сагслаж, сагсны тоо нэмэгдэнэ', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Username').fill(USERNAME);
    await page.getByPlaceholder('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Products', { exact: true })).toBeVisible();

    // data-test атрибутаар олох нь CSS id ашиглахтай адил тогтвортой,
    // гэхдээ playwright.config.ts дээрх testIdAttribute тохиргоог ашиглаж байгаа тул
    // "яагаад тухайн элементийг сонгосон бэ" гэдэг нь кодоос ойлгомжтой хэвээр байна.
    await page.getByTestId('add-to-cart-sauce-labs-backpack').click();

    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');

    await logout(page);
  });
});
