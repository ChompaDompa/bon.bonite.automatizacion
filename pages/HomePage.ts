import { Page, Locator } from '@playwright/test';
import { dismissCookieBanner } from './CookieConsent';

export class HomePage {
  readonly page: Page;
  readonly zapatosLink: Locator;
  readonly bolsosLink: Locator;
  readonly cinturonesLink: Locator;
  readonly accesoriosLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // Nav principal: hay dos <nav> (desktop + mobile) que repiten estos links.
    // A diferencia de los toggles ocultos de MiCuentaPage/EditarCuentaPage
    // (display:none real), verificado en vivo que ambas copias del nav son
    // "visibles" para Playwright (ninguna usa display:none/visibility:hidden;
    // la copia mobile queda fuera del viewport por otro medio), así que
    // .visible() viola el modo estricto al resolver ambas. Se usa .first()
    // para apuntar siempre a la primera del DOM (desktop).
    this.zapatosLink = page.getByRole('link', { name: 'Zapatos', exact: true }).first();
    this.bolsosLink = page.getByRole('link', { name: 'Bolsos', exact: true }).first();
    this.cinturonesLink = page.getByRole('link', { name: 'Cinturones', exact: true }).first();
    this.accesoriosLink = page.getByRole('link', { name: 'Accesorios', exact: true }).first();
  }

  async goto(): Promise<void> {
    // 'domcontentloaded' en vez de 'load': el sitio carga scripts de terceros
    // (analytics, chat, Hotjar) que a veces retrasan el evento "load" bastante
    // más de lo necesario para interactuar con la página.
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(this.page);
  }

  async goToZapatos(): Promise<void> {
    await this.zapatosLink.click();
  }
}
