/**
 * Datos fijos de facturación para el Escenario 3 (compra parcial, checkout como invitado).
 *
 * IMPORTANTE: reemplaza los placeholders "COMPLETAR_..." con datos reales/de prueba
 * antes de correr tests/03-compra-producto.spec.ts. Estos datos NO se envían a ninguna
 * pasarela de pago: el test se detiene en la pantalla de "Detalles de facturación" /
 * selección de método de pago, sin completar el pago con Wompi.
 */

export interface CheckoutBillingData {
  /** Texto visible exacto de la opción en el combobox "Tipo de documento" */
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellidos: string;
  /** Texto visible exacto de la opción en el combobox "Género" */
  genero: string;
  email: string;
  telefono: string;
}

export const checkoutBillingData: CheckoutBillingData = {
  tipoDocumento: 'Cédula de Ciudadanía (CC)',
  numeroDocumento: '000000000',
  nombre: 'Prueb Q-Vision',
  apellidos: 'Automatizador QA',
  genero: 'Hombre',
  email: 'prueba.qvision.automatizador.qa@yopmail.com',
  telefono: '0000000000',
};
