/**
 * Generadores de datos dinámicos para evitar colisiones (correos/cédulas duplicados)
 * al correr la suite varias veces contra el sitio real.
 *
 * Se usa Date.now() + un sufijo aleatorio en vez de una librería como @faker-js/faker
 * para no añadir una dependencia extra: aquí solo se necesita unicidad, no realismo
 * de los datos (el sitio no valida que la cédula/nombre correspondan a una persona real).
 */

export interface NewUserData {
  cedula: string;
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
}

function uniqueSuffix(): string {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export function generateCedula(): string {
  // Cédula colombiana ficticia de 10 dígitos, con prefijo fijo + timestamp para unicidad.
  const suffix = uniqueSuffix().slice(-9);
  return `1${suffix}`.slice(0, 10);
}

export function generateEmail(): string {
  return `qa.bonbonite.${uniqueSuffix()}@mailinator.com`;
}

export function generatePassword(): string {
  return `QaTest#${uniqueSuffix()}`;
}

export function generateNewUser(): NewUserData {
  const suffix = uniqueSuffix();
  return {
    cedula: generateCedula(),
    nombres: `QA${suffix.slice(-4)}`,
    apellidos: `Automation${suffix.slice(-4)}`,
    email: generateEmail(),
    password: generatePassword(),
  };
}
