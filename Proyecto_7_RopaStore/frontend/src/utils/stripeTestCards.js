/**
 * Tarjetas de prueba para Stripe
 * Estas son tarjetas de prueba que funcionan en el entorno de desarrollo
 */

export const TEST_CARDS = {
  // Tarjetas exitosas
  VISA_SUCCESS: '4242424242424242',
  VISA_SUCCESS_2: '4000056655665556',
  MASTERCARD_SUCCESS: '5555555555554444',
  AMEX_SUCCESS: '378282246310005',
  
  // Tarjetas con errores específicos
  DECLINED: '4000000000000002',
  INSUFFICIENT_FUNDS: '4000000000009995',
  EXPIRED_CARD: '4000000000000069',
  INCORRECT_CVC: '4000000000000127',
  
  // Tarjetas 3D Secure
  REQUIRES_3D_SECURE: '4000002500003155',
  REQUIRES_ACTION: '4000002760003184'
}

export const TEST_CARD_DETAILS = {
  [TEST_CARDS.VISA_SUCCESS]: {
    type: 'Visa',
    description: 'Tarjeta exitosa',
    expiry: '12/25',
    cvc: '123'
  },
  [TEST_CARDS.MASTERCARD_SUCCESS]: {
    type: 'Mastercard',
    description: 'Tarjeta exitosa',
    expiry: '12/25',
    cvc: '123'
  },
  [TEST_CARDS.AMEX_SUCCESS]: {
    type: 'American Express',
    description: 'Tarjeta exitosa',
    expiry: '12/25',
    cvc: '1234'
  },
  [TEST_CARDS.DECLINED]: {
    type: 'Visa',
    description: 'Tarjeta rechazada',
    expiry: '12/25',
    cvc: '123'
  },
  [TEST_CARDS.INSUFFICIENT_FUNDS]: {
    type: 'Visa',
    description: 'Fondos insuficientes',
    expiry: '12/25',
    cvc: '123'
  },
  [TEST_CARDS.EXPIRED_CARD]: {
    type: 'Visa',
    description: 'Tarjeta expirada',
    expiry: '12/20',
    cvc: '123'
  },
  [TEST_CARDS.INCORRECT_CVC]: {
    type: 'Visa',
    description: 'CVC incorrecto',
    expiry: '12/25',
    cvc: '999'
  }
}

/**
 * Formatea el número de tarjeta para mostrar solo los últimos 4 dígitos
 */
export const maskCardNumber = (cardNumber) => {
  if (!cardNumber) return ''
  const cleaned = cardNumber.replace(/\s/g, '')
  if (cleaned.length <= 4) return cleaned
  return '•••• •••• •••• ' + cleaned.slice(-4)
}

/**
 * Valida si un número de tarjeta es una tarjeta de prueba
 */
export const isTestCard = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '')
  return Object.values(TEST_CARDS).includes(cleaned)
}

/**
 * Obtiene los detalles de una tarjeta de prueba
 */
export const getTestCardDetails = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '')
  return TEST_CARD_DETAILS[cleaned] || null
}

/**
 * Sugerencias de tarjetas de prueba para mostrar al usuario
 */
export const TEST_CARD_SUGGESTIONS = [
  {
    number: TEST_CARDS.VISA_SUCCESS,
    label: 'Visa exitosa',
    description: '4242 4242 4242 4242'
  },
  {
    number: TEST_CARDS.MASTERCARD_SUCCESS,
    label: 'Mastercard exitosa',
    description: '5555 5555 5555 4444'
  },
  {
    number: TEST_CARDS.DECLINED,
    label: 'Tarjeta rechazada',
    description: '4000 0000 0000 0002'
  }
]
