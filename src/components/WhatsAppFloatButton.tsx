import React from 'react'
import { MessageCircle } from 'lucide-react'

const WhatsAppFloatButton = () => {
  const whatsappLink = "https://wa.me/5548988114708"
  const whatsappMessage = "Olá! Gostaria de saber mais sobre as soluções de IA e Automação de Processos da Wolfx."

  return (
    <a
      href={`${whatsappLink}?text=${encodeURIComponent(whatsappMessage)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Fale conosco no WhatsApp"
    >
      <div className="relative">
        {/* Efeito de pulso */}
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75 group-hover:opacity-100"></div>
        <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse opacity-50"></div>
        
        {/* Botão principal */}
        <div className="relative w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group-hover:rotate-12">
          <MessageCircle className="w-7 h-7 text-white" fill="white" />
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block whitespace-nowrap">
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg">
            Fale conosco no WhatsApp
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </a>
  )
}

export default WhatsAppFloatButton

