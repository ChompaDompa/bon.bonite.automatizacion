import { Page, Locator, expect } from '@playwright/test';
import { dismissCookieBanner } from './CookieConsent';

/**
 * Página "Datos" de la cuenta ya logueada (/mi-cuenta/edit-account/).
 *
 * Los datos personales (Nombres, Apellidos, Teléfono, etc.) se muestran primero
 * en modo solo-lectura; hay que hacer click en "Actualizar Información" para
 * revelar el formulario editable (id="profile-update-form", confirmado en vivo
 * con la cuenta de prueba). Los <label> de ese formulario no tienen atributo
 * "for" (mismo defecto de accesibilidad que el formulario de registro), así
 * que los campos se referencian por su atributo "name" real.
 */
export class EditarCuentaPage {
  readonly page: Page;
  readonly profileForm: Locator;
  readonly editInfoToggle: Locator;
  readonly phoneInput: Locator;
  readonly saveButton: Locator;
  // Confirmado en vivo: al guardar, aparece el texto exacto "Datos personales
  // actualizados correctamente" (sin role ARIA propio).
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.profileForm = page.locator('#profile-update-form');
    // El DOM trae una copia duplicada oculta (variante de otro breakpoint) del
    // botón "Actualizar Información", igual que el toggle "Regístrate" del
    // registro; se usa :visible para tomar solo la interactuable.
    this.editInfoToggle = page.locator('button:visible', {
      hasText: /Actualizar\s+Información/i,
    });
    this.phoneInput = this.profileForm.locator('input[name="billing_phone"]');
    this.saveButton = this.profileForm.getByRole('button', { name: /Guardar/i });
    this.successMessage = page.getByText('Datos personales actualizados correctamente');
  }

  async goto(): Promise<void> {
    await this.page.goto('/mi-cuenta/edit-account/', { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(this.page);
  }

  /** Revela el formulario editable de datos personales. */
  async openEditForm(): Promise<void> {
    await this.editInfoToggle.click();
    await expect(this.phoneInput).toBeVisible({ timeout: 10_000 });
  }

  async updatePhone(newPhone: string): Promise<void> {
    await this.phoneInput.fill(newPhone);
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  async expectSuccessMessageVisible(): Promise<void> {
    await expect(this.successMessage).toBeVisible({ timeout: 15_000 });
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await this.openEditForm();
  }
}
