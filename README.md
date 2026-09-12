# Automatización QA - bon-bonite.com

Suite de pruebas end-to-end con [Playwright](https://playwright.dev/) + TypeScript, usando el patrón **Page Object Model (POM)**, sobre el sitio real `https://www.bon-bonite.com/`.

Cubre 3 escenarios:

1. **Registro exitoso de usuario nuevo** (`tests/01-registro.spec.ts`)
2. **Edición de datos del usuario registrado** (`tests/02-edicion-cuenta.spec.ts`)
3. **Compra de producto — parcial, sin finalizar pago con Wompi** (`tests/03-compra-producto.spec.ts`)

## 1. Instalación

```bash
npm install
npx playwright install chromium
```

## 2. Configuración de datos de prueba

### 2.1 Escenario 2 — cuenta fija (`.env`)

El Escenario 2 necesita una cuenta **ya existente** en bon-bonite.com (no la crea el propio test, para mantenerlo independiente del Escenario 1).

```bash
cp .env.example .env
```

Edita `.env` con una cédula y contraseña reales de una cuenta que ya exista en el sitio:

```
TEST_USER_CEDULA=1234567890
TEST_USER_PASSWORD=tu-password
```

Si no se configuran estas variables, el test 2 se **omite automáticamente** (`test.skip`) en vez de fallar.

### 2.2 Escenario 3 — datos de facturación (`test-data/checkout-data.ts`)

Antes de correr el test de compra, reemplaza los placeholders `COMPLETAR_...` en [`test-data/checkout-data.ts`](test-data/checkout-data.ts) con datos de prueba reales (documento, nombre, apellidos, email, teléfono). Estos datos solo se usan para llenar el formulario de "Detalles de facturación"; el test **nunca** llega a la pasarela de pago Wompi ni hace submit del pedido.

Los datos de registro del Escenario 1 (cédula, nombres, correo, contraseña) son **dinámicos** y se generan automáticamente en cada corrida (`test-data/test-users.ts`), no requieren configuración.

## 3. Ejecutar las pruebas

```bash
# Todas las pruebas
npm test

# Una prueba puntual
npm run test:registro
npm run test:edicion
npm run test:compra

# En modo headed (ver el navegador)
npm run test:headed

# Con la UI interactiva de Playwright
npm run test:ui
```

## 4. Ver el reporte HTML

Al finalizar la ejecución, Playwright genera un reporte HTML automáticamente. Para abrirlo:

```bash
npm run report
```

## 5. Estructura del proyecto

```
pages/                  Page Objects (POM)
  HomePage.ts
  MiCuentaPage.ts       Login y registro (ambos forms viven en /mi-cuenta/)
  EditarCuentaPage.ts   Edición de datos de cuenta ya logueada
  ProductListPage.ts    Listado/categoría de productos
  ProductPage.ts        Ficha de producto: talla, cantidad, añadir al carrito
  CartPage.ts           Carrito de compras
  CheckoutPage.ts       Checkout: invitado + detalles de facturación
test-data/
  test-users.ts         Generadores de cédula/correo/contraseña únicos por corrida
  checkout-data.ts      Datos fijos de facturación (editar antes de correr el test 3)
tests/
  01-registro.spec.ts
  02-edicion-cuenta.spec.ts
  03-compra-producto.spec.ts
playwright.config.ts
```

## 6. Notas importantes

- El sitio bajo prueba es **real y en producción**. El Escenario 1 crea una cuenta nueva cada vez que se ejecuta (usa datos dinámicos para no colisionar), así que se recomienda correrlo con moderación.
- El Escenario 3 se detiene deliberadamente en la pantalla de "Detalles de facturación" / selección de medio de pago y **no** interactúa con el widget de Wompi ni completa ningún pago.
- Los selectores de `EditarCuentaPage` ya fueron verificados en vivo contra una cuenta real (incluyendo el id del formulario y el atributo `name` del teléfono); están documentados en el propio archivo junto con las particularidades del DOM que motivaron cada elección.
- Los selectores priorizan `getByRole()` / `getByLabel()` / `getByText()`. Los pocos casos donde se usó un selector por atributo/CSS (tarjetas de producto en el listado, mensajes de notice de WooCommerce) están comentados en el código explicando por qué no había una alternativa accesible razonable.
