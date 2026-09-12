import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductListPage } from '../pages/ProductListPage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { checkoutBillingData } from '../test-data/checkout-data';

test.describe('Escenario 3 - Compra de producto (parcial, sin finalizar pago)', () => {
  test('el flujo de compra llega hasta facturación sin pagar con Wompi', async ({ page }) => {
    const homePage = new HomePage(page);
    const productListPage = new ProductListPage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    const cantidad = 1;
    let nombreProducto = '';
    let tallaSeleccionada = '';
    let precioProducto = '';

    await test.step('Navegar a la categoría Zapatos', async () => {
      await homePage.goto();
      await homePage.goToZapatos();
      await expect(page).toHaveURL(/categoria-producto\/zapatos-mujer/);
    });

    await test.step('Seleccionar un producto con stock disponible', async () => {
      await productListPage.openFirstProduct();
      nombreProducto = await productPage.getProductName();
      precioProducto = await productPage.getPrice();
      expect(nombreProducto).not.toHaveLength(0);
    });

    await test.step('Seleccionar una talla válida y la cantidad', async () => {
      tallaSeleccionada = await productPage.selectFirstAvailableSize();
      await productPage.setQuantity(cantidad);
    });

    await test.step('Añadir el producto al carrito', async () => {
      await productPage.addToCart();
    });

    await test.step('Verificar producto, talla, cantidad y subtotal en el carrito', async () => {
      await cartPage.goto();
      await cartPage.expectProductInCart(nombreProducto, tallaSeleccionada, cantidad);
      const subtotal = await cartPage.getSubtotalText();
      expect(subtotal.replace(/[^\d]/g, '')).toBe(precioProducto.replace(/[^\d]/g, ''));
    });

    await test.step('Iniciar el checkout como invitado', async () => {
      await cartPage.goToCheckout();
      await checkoutPage.continueFromCart();
      await checkoutPage.continueAsGuest();
    });

    await test.step('Diligenciar datos de facturación hasta la pantalla de pago', async () => {
      await checkoutPage.fillBillingDetails(checkoutBillingData);
    });

    await test.step('Verificar que se llegó a la pantalla de facturación sin pagar', async () => {
      await checkoutPage.expectBillingStepReached();
      // No se hace click en ningún botón de "Realizar el pedido" ni se
      // selecciona/interactúa con el widget de Wompi: el test termina aquí a
      // propósito, cumpliendo con no finalizar pagos reales.
    });
  });
});
