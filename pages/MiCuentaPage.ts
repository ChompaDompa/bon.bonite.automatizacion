import { Page, Locator, expect } from '@playwright/test';
import { NewUserData } from '../test-data/test-users';
import { dismissCookieBanner } from './CookieConsent';

export class MiCuentaPage {
  readonly page: Page;

  /** La página /mi-cuenta/ renderiza DOS <form>: login y registro, en el mismo DOM. */
  readonly registerForm: Locator;
  readonly loginForm: Locator;

  readonly registerCedulaInput: Locator;
  readonly registerNombresInput: Locator;
  readonly registerApellidosInput: Locator;
  readonly registerEmailInput: Locator;
  readonly registerPasswordInput: Locator;
  readonly registerConfirmPasswordInput: Locator;
  readonly registerConsentCheckbox: Locator;
  readonly registerSubmitButton: Locator;

  readonly loginCedulaInput: Locator;
  readonly loginPasswordInput: Locator;
  readonly loginSubmitButton: Locator;

  // El formulario de registro está oculto (clase Tailwind "hidden") hasta que
  // se hace click en este toggle "Regístrate". No es un link/button real sino
  // un <span> con un manejador de click (sin role/label accesible), y el DOM
  // trae una segunda copia oculta (variante de otro breakpoint). Por eso se
  // usa un selector CSS con :visible para tomar únicamente la copia interactuable
  // — único caso del proyecto sin alternativa razonable por rol/label.
  readonly registerToggle: Locator;

  constructor(page: Page) {
    this.page = page;

    // Se escopa cada form por su botón de submit (único y estable) para evitar
    // ambigüedad entre campos con el mismo label (ej. "Apellidos") que existen
    // tanto en el form de registro como, más adelante, en el de facturación.
    this.registerForm = page.locator('form').filter({
      has: page.getByRole('button', { name: 'Registrarme' }),
    });
    this.loginForm = page.locator('form').filter({
      has: page.getByRole('button', { name: 'Iniciar Sesión' }),
    });

    this.registerCedulaInput = this.registerForm.getByLabel('Número de cédula');
    // Bug confirmado en el sitio real: los <label> visuales de "Nombres" y
    // "Apellidos" tienen su atributo for="reg_username" apuntando por error al
    // campo de cédula (copiado del primer campo del formulario), en vez de a
    // "first_name"/"last_name". Por eso getByLabel/getByRole con esos nombres
    // resuelve al campo de cédula equivocado. Se usa el id real del input como
    // único selector confiable mientras el sitio no corrija esta asociación.
    this.registerNombresInput = this.registerForm.locator('#first_name');
    this.registerApellidosInput = this.registerForm.locator('#last_name');
    this.registerEmailInput = this.registerForm.getByLabel('Dirección de correo electrónico');
    // El <label for="reg_password"> real incluye un espacio "&nbsp;" antes del
    // asterisco de obligatoriedad, lo que hace que getByLabel(regex) no resuelva
    // el campo de forma confiable (verificado en corridas reales); getByRole
    // por accessible name sí funciona de forma estable. Se ancla al inicio
    // ("^Contraseña") porque "Confirmar contraseña Obligatorio" también
    // contiene la subcadena "contraseña".
    this.registerPasswordInput = this.registerForm.getByRole('textbox', {
      name: /^Contraseña\b/i,
    });
    this.registerConfirmPasswordInput = this.registerForm.getByRole('textbox', {
      name: /^Confirmar contraseña/i,
    });
    // El label envuelve un <a> ("Autorizo el tratamiento de mis datos personales"),
    // por eso se matchea por el texto del link en vez de un texto de label exacto.
    this.registerConsentCheckbox = this.registerForm.getByRole('checkbox', {
      name: /Autorizo el tratamiento de mis datos personales/i,
    });
    this.registerSubmitButton = this.registerForm.getByRole('button', { name: 'Registrarme' });

    this.loginCedulaInput = this.loginForm.getByLabel('Número de cédula');
    // getByLabel('Contraseña') también matchea el botón "Mostrar contraseña"
    // (su aria-label contiene la subcadena "contraseña"), así que se acota al
    // role textbox para evitar la violación de modo estricto (2 elementos).
    this.loginPasswordInput = this.loginForm.getByRole('textbox', { name: /^Contraseña\b/i });
    this.loginSubmitButton = this.loginForm.getByRole('button', { name: 'Iniciar Sesión' });

    this.registerToggle = page.locator('span:visible', { hasText: 'Regístrate' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/mi-cuenta/', { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(this.page);
  }

  /** Revela el formulario de registro (oculto por defecto) haciendo click en "Regístrate". */
  async openRegisterForm(): Promise<void> {
    await this.registerToggle.click();
    await expect(this.registerForm.getByRole('heading', { name: 'Crea tu cuenta' })).toBeVisible({
      timeout: 10_000,
    });
  }

  async register(user: NewUserData): Promise<void> {
    await this.registerCedulaInput.fill(user.cedula);
    await this.registerNombresInput.fill(user.nombres);
    await this.registerApellidosInput.fill(user.apellidos);
    await this.registerEmailInput.fill(user.email);
    await this.registerPasswordInput.fill(user.password);
    await this.registerConfirmPasswordInput.fill(user.password);
    await this.registerConsentCheckbox.check();
    await this.registerSubmitButton.click();
  }

  async login(cedula: string, password: string): Promise<void> {
    await this.loginCedulaInput.fill(cedula);
    await this.loginPasswordInput.fill(password);
    await this.loginSubmitButton.click();
  }

  /**
   * Confirma que la sesión quedó iniciada tras registro/login exitoso.
   * Confirmado en una corrida real: WooCommerce redirige a /mi-cuenta/ y
   * muestra un saludo "Hola, {nombre}." junto con la navegación del dashboard
   * (Pedidos/Datos/Créditos/PQRS). No hay un link visible de "Cerrar sesión"
   * en esta vista (vive en otro menú), así que se valida contra el saludo y
   * el link "Datos" del panel de cuenta, ambos confirmados en vivo.
   */
  async expectLoggedIn(): Promise<void> {
    await expect(this.page).toHaveURL(/mi-cuenta/);
    await expect(this.page.getByRole('heading', { name: /^Hola,/ })).toBeVisible({
      timeout: 15_000,
    });
    await expect(this.page.getByRole('link', { name: 'Datos', exact: true })).toBeVisible();
  }
}
