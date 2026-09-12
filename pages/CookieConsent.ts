import { Page } from '@playwright/test';

/**
 * El sitio muestra un diálogo de cookies en la primera visita que intercepta
 * clicks sobre el resto de la página. Se rechaza (opción más privacy-friendly)
 * si aparece; si no aparece (ya fue aceptado/rechazado en una visita previa de
 * la misma sesión de navegador), simplemente no hace nada.
 *
 * Se usa un margen fijo + isVisible() (sin reintentos) en vez de waitFor con
 * timeout: como el banner solo aparece la primera vez, cualquier waitFor
 * posterior agotaría su timeout, y Playwright marca esa llamada como acción
 * fallida en el trace/UI mode aunque el error se descarte con try/catch.
 */
export async function dismissCookieBanner(page: Page): Promise<void> {
  const rejectButton = page.getByRole('button', { name: 'Rechazar todo' });
  await page.waitForTimeout(1_000);
  if (await rejectButton.isVisible()) {
    await rejectButton.click();
  }
}
