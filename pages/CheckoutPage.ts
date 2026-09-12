import { Page, Locator, expect } from '@playwright/test';
import { CheckoutBillingData } from '../test-data/checkout-data';
import { dismissCookieBanner } from './CookieConsent';

export class CheckoutPage {
  readonly page: Page;
  readonly continueFromCartButton: Locator;
  readonly continueAsGuestLink: Locator;
  readonly billingHeading: Locator;
  readonly tipoDocumentoSelect: Locator;
  readonly numeroDocumentoInput: Locator;
  readonly nombreInput: Locator;
  readonly apellidosInput: Locator;
  readonly generoSelect: Locator;
  readonly emailInput: Locator;
  readonly telefonoInput: Locator;

  constructor(page: Page) {
    this.page = page;
    // El checkout es un wizard de 3 pasos (Carrito -> Ingreso -> Facturación)
    // renderizado por completo en el DOM desde el primer momento; solo el paso
    // activo tiene ancho visible, los demás quedan colapsados a 0px hasta que
    // se avanza con este botón. Confirmado en vivo: sin este click, los campos
    // de facturación existen en el DOM pero nunca llegan a ser interactuables.
    this.continueFromCartButton = page.getByRole('button', { name: 'Continuar' });
    this.continueAsGuestLink = page.getByRole('link', { name: 'Comprar como invitado' });
    this.billingHeading = page.getByRole('heading', { name: 'Detalles de facturación' });
    // Estos campos exponen su accessible name vía aria-label directamente en el
    // input (el texto visible "Nombre *", etc. es un <span> decorativo, no un
    // <label for>), por lo que getByRole+name es más confiable aquí que
    // getByLabel (que solo resuelve asociaciones reales de <label>).
    this.tipoDocumentoSelect = page.getByRole('combobox', { name: 'Tipo de documento' });
    this.numeroDocumentoInput = page.getByRole('textbox', { name: 'Número de documento' });
    this.nombreInput = page.getByRole('textbox', { name: 'Nombre', exact: true });
    this.apellidosInput = page.getByRole('textbox', { name: 'Apellidos', exact: true });
    this.generoSelect = page.getByRole('combobox', { name: 'Género' });
    this.emailInput = page.getByRole('textbox', { name: 'Dirección de correo electrónico' });
    this.telefonoInput = page.getByRole('textbox', { name: 'Teléfono', exact: true });
  }

  async goto(): Promise<void> {
    await this.page.goto('/finalizar-compra/', { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(this.page);
  }

  /** Paso 1 (Carrito) -> Paso 2 (Ingreso). */
  async continueFromCart(): Promise<void> {
    await this.continueFromCartButton.scrollIntoViewIfNeeded();
    await this.continueFromCartButton.click();
    await expect(this.continueAsGuestLink).toBeVisible({ timeout: 15_000 });
  }

  /** Paso 2 (Ingreso) -> Paso 3 (Facturación). */
  async continueAsGuest(): Promise<void> {
    await this.continueAsGuestLink.scrollIntoViewIfNeeded();
    await this.continueAsGuestLink.click();
    await expect(this.billingHeading).toBeVisible({ timeout: 15_000 });
  }

  async fillBillingDetails(data: CheckoutBillingData): Promise<void> {
    await this.tipoDocumentoSelect.selectOption({ label: data.tipoDocumento });
    await this.numeroDocumentoInput.fill(data.numeroDocumento);
    await this.nombreInput.fill(data.nombre);
    await this.apellidosInput.fill(data.apellidos);
    await this.generoSelect.selectOption({ label: data.genero });
    await this.emailInput.fill(data.email);
    await this.telefonoInput.fill(data.telefono);
  }

  /**
   * Assertion final del Escenario 3: confirma que el flujo de compra llegó a la
   * pantalla de datos de facturación (paso previo a la selección del medio de
   * pago con Wompi), sin haber interactuado con el pago en ningún momento.
   */
  async expectBillingStepReached(): Promise<void> {
    await expect(this.billingHeading).toBeVisible({ timeout: 15_000 });
    await expect(this.numeroDocumentoInput).toBeVisible();
  }
}
