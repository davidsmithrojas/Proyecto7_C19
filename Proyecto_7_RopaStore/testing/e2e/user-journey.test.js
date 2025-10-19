const { test, expect } = require('@playwright/test');

test.describe('🛍️ Flujo Completo de Usuario - E-commerce', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página principal
    await page.goto('http://localhost:3000');
  });

  test('✅ Flujo completo: Registro → Login → Compra → Checkout', async ({ page }) => {
    // 1. REGISTRO DE USUARIO
    await test.step('Registrar nuevo usuario', async () => {
      await page.click('text=Registrarse');
      await page.fill('input[name="username"]', 'testuser');
      await page.fill('input[name="email"]', 'testuser@example.com');
      await page.fill('input[name="password"]', 'Test123!');
      await page.fill('input[name="confirmPassword"]', 'Test123!');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=Usuario registrado exitosamente')).toBeVisible();
    });

    // 2. LOGIN
    await test.step('Iniciar sesión', async () => {
      await page.fill('input[name="email"]', 'testuser@example.com');
      await page.fill('input[name="password"]', 'Test123!');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=Inicio de sesión exitoso')).toBeVisible();
    });

    // 3. NAVEGAR Y AGREGAR PRODUCTOS AL CARRITO
    await test.step('Navegar a productos y agregar al carrito', async () => {
      await page.click('text=Productos');
      await page.waitForSelector('[data-testid="product-card"]');
      
      // Agregar primer producto
      await page.click('[data-testid="product-card"]:first-child button:has-text("Agregar al Carrito")');
      await expect(page.locator('text=Producto agregado al carrito')).toBeVisible();
      
      // Agregar segundo producto
      await page.click('[data-testid="product-card"]:nth-child(2) button:has-text("Agregar al Carrito")');
      await expect(page.locator('text=Producto agregado al carrito')).toBeVisible();
    });

    // 4. VERIFICAR CARRITO
    await test.step('Verificar carrito de compras', async () => {
      await page.click('text=Carrito');
      await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(2);
      
      // Verificar total
      const total = await page.textContent('[data-testid="cart-total"]');
      expect(total).toMatch(/\$\d+\.\d{2}/);
    });

    // 5. PROCEDER AL CHECKOUT
    await test.step('Proceder al checkout', async () => {
      await page.click('text=Proceder al Pago');
      await expect(page.locator('text=Información de Envío')).toBeVisible();
      
      // Llenar información de envío
      await page.fill('input[name="firstName"]', 'Juan');
      await page.fill('input[name="lastName"]', 'Pérez');
      await page.fill('input[name="address"]', 'Calle Test 123');
      await page.fill('input[name="city"]', 'Ciudad Test');
      await page.fill('input[name="zipCode"]', '12345');
      await page.fill('input[name="email"]', 'testuser@example.com');
    });

    // 6. PROCESAR PAGO
    await test.step('Procesar pago con tarjeta de prueba', async () => {
      // Usar tarjeta de prueba de Stripe
      await page.fill('[data-testid="card-number"]', '4242424242424242');
      await page.fill('[data-testid="card-expiry"]', '12/25');
      await page.fill('[data-testid="card-cvc"]', '123');
      await page.fill('[data-testid="card-name"]', 'Juan Pérez');
      
      await page.click('text=Procesar Pago');
      
      // Verificar confirmación de pago
      await expect(page.locator('text=Pago procesado exitosamente')).toBeVisible();
    });

    // 7. VERIFICAR ORDEN
    await test.step('Verificar orden creada', async () => {
      await page.click('text=Mis Pedidos');
      await expect(page.locator('[data-testid="order-item"]')).toHaveCount(1);
      
      const orderStatus = await page.textContent('[data-testid="order-status"]');
      expect(orderStatus).toBe('Pendiente');
    });
  });

  test('✅ Flujo de administrador: Login → Gestión → Estadísticas', async ({ page }) => {
    // 1. LOGIN COMO ADMIN
    await test.step('Login como administrador', async () => {
      await page.click('text=Iniciar Sesión');
      await page.fill('input[name="email"]', 'admin@proyecto6.com');
      await page.fill('input[name="password"]', 'Admin123!');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=Inicio de sesión exitoso')).toBeVisible();
    });

    // 2. ACCEDER AL PANEL DE ADMINISTRACIÓN
    await test.step('Acceder al panel de administración', async () => {
      await page.click('text=Panel de Administración');
      await expect(page.locator('text=Dashboard de Administración')).toBeVisible();
    });

    // 3. GESTIONAR PRODUCTOS
    await test.step('Gestionar productos', async () => {
      await page.click('text=Gestionar Productos');
      await expect(page.locator('text=Lista de Productos')).toBeVisible();
      
      // Crear nuevo producto
      await page.click('text=Agregar Producto');
      await page.fill('input[name="name"]', 'Producto Test E2E');
      await page.fill('input[name="price"]', '39.99');
      await page.fill('input[name="stock"]', '20');
      await page.selectOption('select[name="category"]', 'Camisas');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=Producto creado exitosamente')).toBeVisible();
    });

    // 4. GESTIONAR ÓRDENES
    await test.step('Gestionar órdenes', async () => {
      await page.click('text=Gestionar Órdenes');
      await expect(page.locator('text=Lista de Órdenes')).toBeVisible();
      
      // Cambiar estado de orden
      const firstOrder = page.locator('[data-testid="order-item"]:first-child');
      await firstOrder.click('text=Cambiar Estado');
      await page.selectOption('select[name="status"]', 'processing');
      await page.click('text=Actualizar Estado');
      
      await expect(page.locator('text=Estado actualizado exitosamente')).toBeVisible();
    });

    // 5. VER ESTADÍSTICAS
    await test.step('Ver estadísticas del dashboard', async () => {
      await page.click('text=Dashboard');
      await expect(page.locator('[data-testid="stats-card"]')).toHaveCount(4);
      
      // Verificar que las estadísticas se muestran
      await expect(page.locator('text=Usuarios Nuevos')).toBeVisible();
      await expect(page.locator('text=Ventas del Mes')).toBeVisible();
      await expect(page.locator('text=Productos Más Vendidos')).toBeVisible();
    });
  });

  test('✅ Pruebas de responsividad móvil', async ({ page }) => {
    // Configurar viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    await test.step('Verificar navegación móvil', async () => {
      await page.goto('http://localhost:3000');
      
      // Verificar que el menú hamburguesa está visible
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      
      // Abrir menú móvil
      await page.click('[data-testid="mobile-menu-button"]');
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    });

    await test.step('Verificar productos en móvil', async () => {
      await page.click('text=Productos');
      await page.waitForSelector('[data-testid="product-card"]');
      
      // Verificar que los productos se muestran en grid móvil
      const productCards = page.locator('[data-testid="product-card"]');
      await expect(productCards.first()).toBeVisible();
    });
  });

  test('✅ Pruebas de accesibilidad', async ({ page }) => {
    await test.step('Verificar elementos accesibles', async () => {
      await page.goto('http://localhost:3000');
      
      // Verificar que los botones tienen texto accesible
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        
        expect(text || ariaLabel).toBeTruthy();
      }
      
      // Verificar que las imágenes tienen alt text
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    });
  });
});
