/**
 * Utilidades para formateo de moneda en pesos chilenos
 */

/**
 * Formatea un número como precio en pesos chilenos
 * @param {number} amount - Cantidad a formatear
 * @param {boolean} showCurrency - Si mostrar el símbolo de moneda (default: true)
 * @returns {string} Precio formateado
 */
export const formatPrice = (amount, showCurrency = true) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return showCurrency ? '$0' : '0';
  }

  const formatted = amount.toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  return formatted;
};

/**
 * Formatea un número como precio sin símbolo de moneda
 * @param {number} amount - Cantidad a formatear
 * @returns {string} Precio formateado sin símbolo
 */
export const formatPriceNumber = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0';
  }

  return amount.toLocaleString('es-CL');
};

/**
 * Calcula el IVA (19%) para un monto
 * @param {number} amount - Monto base
 * @returns {number} IVA calculado
 */
export const calculateIVA = (amount) => {
  return Math.round(amount * 0.19);
};

/**
 * Calcula el total con IVA incluido
 * @param {number} amount - Monto base
 * @returns {number} Total con IVA
 */
export const calculateTotalWithIVA = (amount) => {
  return amount + calculateIVA(amount);
};

/**
 * Calcula el costo de envío
 * @param {number} amount - Monto del pedido
 * @param {number} freeShippingThreshold - Umbral para envío gratis (default: 50000)
 * @returns {number} Costo de envío
 */
export const calculateShipping = (amount, freeShippingThreshold = 50000) => {
  return amount >= freeShippingThreshold ? 0 : 5000;
};

/**
 * Calcula el total final de una orden
 * @param {number} subtotal - Subtotal de la orden
 * @param {number} freeShippingThreshold - Umbral para envío gratis (default: 50000)
 * @returns {object} Objeto con desglose de totales
 */
export const calculateOrderTotals = (subtotal, freeShippingThreshold = 50000) => {
  const shipping = calculateShipping(subtotal, freeShippingThreshold);
  const iva = calculateIVA(subtotal);
  const total = subtotal + shipping + iva;

  return {
    subtotal,
    shipping,
    iva,
    total
  };
};
