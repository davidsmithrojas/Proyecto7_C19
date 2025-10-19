const { test, expect } = require('@playwright/test');

test.describe('🔍 Verificación Básica del Frontend', () => {
  test('✅ Debería cargar la página principal', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Verificar que la página carga
    await expect(page).toHaveTitle(/E-commerce/);
    
    // Verificar que hay contenido en la página
    await expect(page.locator('body')).toBeVisible();
  });

  test('✅ Debería mostrar elementos básicos de navegación', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle');
    
    // Verificar que hay elementos de navegación
    const navigation = page.locator('nav');
    await expect(navigation).toBeVisible();
    
    // Verificar que hay enlaces de navegación
    const links = page.locator('a');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('✅ Debería poder acceder a la página de login', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Buscar enlace de login
    const loginLink = page.locator('a[href="/login"]');
    await expect(loginLink).toBeVisible();
    
    // Hacer clic en login
    await loginLink.click();
    
    // Verificar que estamos en la página de login
    await expect(page).toHaveURL(/.*login/);
  });

  test('✅ Debería poder acceder a la página de registro', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Buscar enlace de registro
    const registerLink = page.locator('a[href="/register"]');
    await expect(registerLink).toBeVisible();
    
    // Hacer clic en registro
    await registerLink.click();
    
    // Verificar que estamos en la página de registro
    await expect(page).toHaveURL(/.*register/);
  });
});
