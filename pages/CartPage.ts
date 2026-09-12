import { Page, Locator, expect } from '@playwright/test';
import { dismissCookieBanner } from './CookieConsent';

export class CartPage {
  readonly page: Page;
  readonly checkoutLink: Locator;
  // Confirmado en vivo: la tabla de totales expone "Subtotal" y "Total" como
  // headings de fila, cada uno seguido del monto en la celda vecina.
  readonly cartSubtotalAmount: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutLink = page.getByRole('link', { name: 'Finalizar compra' });
    this.cartSubtotalAmount = page
      .locator('table')
      .filter({ hasText: 'Subtotal' })
      .getByText(/^\$?[\d.,]+$/)
      .first();
  }

  async goto(): Promise<void> {
    // El diálogo de cookies puede reaparecer en una navegación completa nueva
    // (confirmado en corridas reales) y bloquea clicks posteriores en esta
    // página, así que se vuelve a comprobar aquí.
    await this.page.goto('/carrito/', { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(this.page);
  }

  /**
   * Fila de línea de producto en el carrito. WooCommerce nombra el link del
   * producto como "Nombre del producto - Talla" (confirmado en vivo), lo que
   * permite validar en un solo locator que tanto el producto como la talla
   * elegida quedaron correctamente reflejados.
   */
  lineItemLink(productName: string, size: string): Locator {
    return this.page.getByRole('link', { name: `${productName} - ${size}`, exact: true });
  }

  quantityInputForItem(productName: string, size: string): Locator {
    // El <label> visual incluye "producto - talla cantidad"; el accessible
    // name del input de cantidad en sí es genérico ("Cantidad de productos"),
    // así que se acota por fila usando el link del producto como referencia.
    return this.page
      .locator('tr', { has: this.lineItemLink(productName, size) })
      .getByRole('spinbutton', { name: 'Cantidad de productos' });
  }

  async getSubtotalText(): Promise<string> {
    return (await this.cartSubtotalAmount.textContent())?.trim() ?? '';
  }

  async expectProductInCart(productName: string, size: string, quantity: number): Promise<void> {
    await expect(this.lineItemLink(productName, size)).toBeVisible();
    await expect(this.quantityInputForItem(productName, size)).toHaveValue(String(quantity));
  }

  async goToCheckout(): Promise<void> {
    await this.checkoutLink.click();
    await dismissCookieBanner(this.page);
  }
}
