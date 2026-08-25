import { Injectable } from '@angular/core';

export interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
  type?: 'text' | 'image' | 'audio';
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private responses: { [key: string]: string } = {
    'hola': 'Hola. Bienvenido a Flores Chat. ¿Buscas un ramo, un detalle o flores para un evento?',
    'que flores tienes': 'Esta semana trabajamos con rosas de jardín, peonías, tulipanes y eucalipto. ¿Qué estilo prefieres?',
    'precio': 'Nuestros ramos comienzan en $15. Una composición mediana cuesta $28 y una especial para evento se cotiza según la temporada.',
    'ayuda': 'Puedo ayudarte a elegir flores, consultar precios, recomendar un ramo o preparar un pedido.',
    'rosa': 'Las rosas de jardín son aromáticas y elegantes. Ideales para aniversarios y regalos con intención.',
    'girasol': 'El girasol aporta luz y carácter. Podemos combinarlo con verdes suaves para un arreglo más sobrio.',
    'tulipan': 'El tulipán tiene una silueta limpia y contemporánea. Es una opción elegante para regalar.',
    'peonia': 'La peonía es delicada y abundante. Está disponible durante su temporada y funciona muy bien sola.',
    'adios': 'Gracias por visitar Flores Chat. Que tengas un buen día.',
    'gracias': 'Con gusto. ¿Quieres que te recomiende una composición?',
    'default': 'Puedo ayudarte con flores disponibles, precios, recomendaciones o pedidos.'
  };

  constructor() {}

  getResponse(userMessage: string): string {
    const message = userMessage.toLowerCase().trim();
    
    // Buscar coincidencias
    for (const key in this.responses) {
      if (message.includes(key)) {
        return this.responses[key];
      }
    }
    
    return this.responses['default'];
  }

  processImageMessage(): string {
    return 'Imagen recibida. Puedo ayudarte a identificar el estilo del arreglo o recomendarte una composición parecida.';
  }

  processAudioMessage(): string {
    return 'Audio recibido. Cuéntame para quién es el arreglo y qué ocasión quieres acompañar.';
  }
}
