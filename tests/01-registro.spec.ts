import { test, expect } from '@playwright/test';
import { MiCuentaPage } from '../pages/MiCuentaPage';
import { generateNewUser } from '../test-data/test-users';

test.describe('Escenario 1 - Registro exitoso de usuario nuevo', () => {
  test('un visitante nuevo puede crear una cuenta con datos únicos', async ({ page }) => {
    const nuevoUsuario = generateNewUser();
    const miCuentaPage = new MiCuentaPage(page);

    await test.step('Ir a /mi-cuenta/ y abrir el formulario de registro', async () => {
      await miCuentaPage.goto();
      await miCuentaPage.openRegisterForm();
      await expect(page.getByRole('heading', { name: 'Crea tu cuenta' })).toBeVisible();
    });

    await test.step('Diligenciar el formulario de registro con datos dinámicos', async () => {
      await expect(miCuentaPage.registerCedulaInput).toBeVisible();
      await miCuentaPage.registerCedulaInput.fill(nuevoUsuario.cedula);
      await miCuentaPage.registerNombresInput.fill(nuevoUsuario.nombres);
      await miCuentaPage.registerApellidosInput.fill(nuevoUsuario.apellidos);
      await miCuentaPage.registerEmailInput.fill(nuevoUsuario.email);
      await miCuentaPage.registerPasswordInput.fill(nuevoUsuario.password);
      await miCuentaPage.registerConfirmPasswordInput.fill(nuevoUsuario.password);
    });

    await test.step('Marcar el checkbox de autorización de datos personales', async () => {
      await miCuentaPage.registerConsentCheckbox.check();
      await expect(miCuentaPage.registerConsentCheckbox).toBeChecked();
    });

    await test.step('Enviar el formulario de registro', async () => {
      await miCuentaPage.registerSubmitButton.click();
    });

    await test.step('Verificar que el registro fue exitoso y la sesión quedó iniciada', async () => {
      await miCuentaPage.expectLoggedIn();
    });
  });
});
