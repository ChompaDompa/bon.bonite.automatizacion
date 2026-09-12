import { Page, Locator } from '@playwright/test';

export class ProductPage {
  readonly page: Page;
  readonly productNameHeading: Locator;
  readonly priceText: Locator;
  readonly sizeButtons: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly outOfStockNotice: Locator;

  constructor(page: Page) {
    this.page = page;
    // El <h1> del producto es único en la página, buen selector accesible.
    this.productNameHeading = page.getByRole('heading', { level: 1 });
    // El precio se muestra como texto plano sin role/label propio (no es un
    // <label> ni tiene aria-label). Se usa un patrón de texto ("$" + dígitos)
    // en vez de una clase CSS, ya que WooCommerce no expone un role para precios.
    this.priceText = page.getByText(/^\$[\d.,]+$/).first();
    // Los botones de talla (34–40) son "swatches" custom sin agrupación por
    // radiogroup; se seleccionan por su texto (el número de talla).
    this.sizeButtons = page.getByRole('button', { name: /^\d{2}$/ });
    // Accessible name fijo e independiente del nombre del producto (confirmado
    // en el sitio real), a diferencia del <label> visual que sí varía por producto.
    this.quantityInput = page.getByRole('spinbutton', { name: 'Cantidad de productos' });
    this.addToCartButton = page.getByRole('button', { name: 'Añadir al carrito' });
    this.outOfStockNotice = page.getByText('Este producto no está en stock actualmente');
  }

  async getProductName(): Promise<string> {
    return (await this.productNameHeading.textContent())?.trim() ?? '';
  }

  async getPrice(): Promise<string> {
    return (await this.priceText.textContent())?.trim() ?? '';
  }

  /**
   * Selecciona la primera talla habilitada (no deshabilitada por falta de stock)
   * y devuelve su texto, para poder validarlo luego en el carrito.
   */
  async selectFirstAvailableSize(): Promise<string> {
    const count = await this.sizeButtons.count();
    for (let i = 0; i < count; i += 1) {
      const button = this.sizeButtons.nth(i);
      const isDisabled = await button.isDisabled();
      if (!isDisabled) {
        const size = (await button.textContent())?.trim() ?? '';
        await button.click();
        return size;
      }
    }
    throw new Error('No se encontró ninguna talla disponible para este producto.');
  }

  /**
   * Algunos productos con existencia limitada no renderizan el input de
   * cantidad (WooCommerce lo oculta cuando el máximo permitido es 1) y la
   * compra queda fija en cantidad = 1. En ese caso no hay nada que llenar.
   */
  async setQuantity(quantity: number): Promise<void> {
    const hasQuantityInput = await this.quantityInput
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
    if (hasQuantityInput) {
      await this.quantityInput.fill(String(quantity));
    }
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }
}
