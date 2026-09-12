import { test, expect } from '@playwright/test';
import { MiCuentaPage } from '../pages/MiCuentaPage';
import { EditarCuentaPage } from '../pages/EditarCuentaPage';

/**
 * Usa una cuenta FIJA ya existente en bon-bonite.com, provista por variables de
 * entorno (.env, ver .env.example). Esto independiza este test del Escenario 1
 * (no depende de que el registro haya corrido antes).
 */
const TEST_USER_CEDULA = process.env.TEST_USER_CEDULA ?? '';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD ?? '';

test.describe('Escenario 2 - Edición de datos del usuario registrado', () => {
  test.skip(
    !TEST_USER_CEDULA || !TEST_USER_PASSWORD,
    'Configura TEST_USER_CEDULA y TEST_USER_PASSWORD en .env (ver .env.example) antes de correr este test.'
  );

  test('un usuario logueado puede editar y persistir un dato de su cuenta', async ({ page }) => {
    const miCuentaPage = new MiCuentaPage(page);
    const editarCuentaPage = new EditarCuentaPage(page);
    const nuevoTelefono = `300${Date.now().toString().slice(-7)}`;

    await test.step('Iniciar sesión con el usuario fijo de prueba', async () => {
      await miCuentaPage.goto();
      await miCuentaPage.login(TEST_USER_CEDULA, TEST_USER_PASSWORD);
      await miCuentaPage.expectLoggedIn();
    });

    await test.step('Ir a la sección de datos de la cuenta', async () => {
      await editarCuentaPage.goto();
      await editarCuentaPage.openEditForm();
      await expect(editarCuentaPage.phoneInput).toBeVisible();
    });

    await test.step('Modificar el teléfono', async () => {
      await editarCuentaPage.updatePhone(nuevoTelefono);
    });

    await test.step('Guardar los cambios', async () => {
      await editarCuentaPage.save();
      await editarCuentaPage.expectSuccessMessageVisible();
    });

    await test.step('Recargar y confirmar que el cambio persiste', async () => {
      await editarCuentaPage.reload();
      await expect(editarCuentaPage.phoneInput).toHaveValue(nuevoTelefono);
    });
  });
});
