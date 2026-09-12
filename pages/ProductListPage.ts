import { Page, Locator } from '@playwright/test';

export class ProductListPage {
  readonly page: Page;
  // La grilla de productos no expone ningún role/label accesible que agrupe o
  // distinga sus tarjetas (no hay "Mostrar detalles" en el listado, y el DOM
  // trae otros links a "/producto/" fuera de la grilla, ej. "Bonos de regalo"
  // en el menú del footer). Verificado en el DOM real: cada tarjeta de la
  // grilla SÍ tiene un ancestro con la clase "product-wrapper-with-variation"
  // (clase semántica del tema, no una utilidad de Tailwind), a diferencia de
  // cualquier otro link "/producto/" del sitio. Es el único selector CSS del
  // proyecto usado por necesidad, ya que no existe alternativa por rol/label.
  readonly firstProductCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstProductCard = page
      .locator('.product-wrapper-with-variation a[href*="/producto/"]')
      .first();
  }

  async openFirstProduct(): Promise<void> {
    await this.firstProductCard.click();
  }
}
