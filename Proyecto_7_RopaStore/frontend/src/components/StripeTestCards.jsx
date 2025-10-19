import React, { useState } from 'react'
import { CreditCard, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import { TEST_CARD_SUGGESTIONS } from '../utils/stripeTestCards'

const StripeTestCards = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedCard, setCopiedCard] = useState(null)

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCard(text)
      setTimeout(() => setCopiedCard(null), 2000)
    })
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center">
          <CreditCard className="h-4 w-4 text-blue-600 mr-2" />
          <span className="text-sm font-medium text-blue-800">
            Tarjetas de prueba para desarrollo
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-blue-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-blue-600" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-blue-700">
            Usa estas tarjetas de prueba para simular diferentes escenarios de pago:
          </p>
          
          {TEST_CARD_SUGGESTIONS.map((card, index) => (
            <div key={index} className="bg-white rounded-lg p-3 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{card.label}</div>
                  <div className="text-xs text-gray-600">{card.description}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(card.number)}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-xs"
                >
                  {copiedCard === card.number ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  {copiedCard === card.number ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
          ))}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Nota:</strong> Estas son tarjetas de prueba. Usa cualquier fecha futura para la expiración y cualquier CVC de 3 dígitos.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default StripeTestCards
