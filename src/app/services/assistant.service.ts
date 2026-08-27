import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

export interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
  type: 'text' | 'image' | 'audio';
}

export interface ChatRequest {
  message: string;
  userId: string;
  history?: any[];
}

export interface OrderConfirmationRequest {
  response: string;
  userId: string;
  customerData?: {
    nombre?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    ciudad?: string;
  };
  items?: any[];
  total?: number;
}

export interface OrderConfirmationResponse {
  success: boolean;
  codigo: string;
  pedido: any;
  mensaje: string;
}

export interface TrackOrderResponse {
  encontrado: boolean;
  pedido: any;
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class AssistantService {
  private openaiApiKey = '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';
  private openaiUrl = 'https://api.openai.com/v1/chat/completions';
  private apiUrl = 'http://localhost:8080/api/assistant';
  
  private conversationHistory: any[] = [];
  private userId: string = '';

  constructor(private http: HttpClient) {
    this.userId = localStorage.getItem('userId') || '';
    console.log('🔗 AssistantService inicializado');
  }

  async sendMessage(message: string): Promise<string> {
    try {
      console.log('📤 sendMessage llamado con:', message);
      
      this.conversationHistory.push({ role: 'user', content: message });

      const body = {
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: this.getAssistantInstructions() 
          },
          ...this.conversationHistory
        ],
        temperature: 0.7
      };

      const headers = new HttpHeaders()
        .set('Authorization', `Bearer ${this.openaiApiKey}`)
        .set('Content-Type', 'application/json');

      console.log('⏳ Llamando a OpenAI...');
      
      const response = await this.http.post<any>(this.openaiUrl, body, { headers })
        .pipe(
          map(res => {
            const assistantMessage = res.choices[0].message.content;
            console.log('✅ Respuesta de OpenAI:', assistantMessage);
            this.conversationHistory.push({ role: 'assistant', content: assistantMessage });
            return assistantMessage;
          })
        )
        .toPromise();

      console.log('📤 Devolviendo respuesta al componente');
      return response || 'Lo siento, no pude procesar tu mensaje.';

    } catch (error) {
      console.error('❌ Error en OpenAI:', error);
      
      try {
        console.log('🔄 Intentando fallback...');
        return await this.fallbackToBackend(message);
      } catch (fallbackError) {
        console.error('❌ Error en fallback:', fallbackError);
        return '❌ Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.';
      }
    }
  }

  private async fallbackToBackend(message: string): Promise<string> {
    const request: ChatRequest = {
      message: message,
      userId: this.userId,
      history: this.conversationHistory
    };

    const response = await this.http.post<any>(`${this.apiUrl}/chat`, request)
      .toPromise();

    this.conversationHistory = response.history || this.conversationHistory;
    return response.response || 'Lo siento, no pude procesar tu mensaje.';
  }

  async confirmOrder(response: string, customerData: any): Promise<string> {
    try {
      const request: OrderConfirmationRequest = {
        response: response,
        userId: this.userId,
        customerData: customerData
      };

      const result = await this.http.post<OrderConfirmationResponse>(
        `${this.apiUrl}/confirm`, 
        request
      ).toPromise();

      this.clearHistory();
      return result?.mensaje || '✅ Pedido confirmado correctamente';
    } catch (error) {
      console.error('Error confirmando pedido:', error);
      return '❌ Hubo un error al confirmar tu pedido. Por favor, intenta de nuevo.';
    }
  }

  async trackOrder(codigo: string): Promise<string> {
    try {
      const result = await this.http.get<TrackOrderResponse>(
        `${this.apiUrl}/track/${codigo}`
      ).toPromise();

      return result?.mensaje || 'No se encontró el pedido';
    } catch (error) {
      console.error('Error buscando pedido:', error);
      return '❌ Hubo un error al buscar tu pedido.';
    }
  }

  async generateAudio(text: string): Promise<void> {
    try {
      console.log('🔊 Generando audio...');
      
      const response = await fetch(`${this.apiUrl}/audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error(`Error generando audio: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };
        audio.play().catch(reject);
      });

    } catch (error) {
      console.error('❌ Error generando audio:', error);
      throw error;
    }
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  setUserId(userId: string) {
    this.userId = userId;
    localStorage.setItem('userId', userId);
  }

  getResponse(message: string): string {
    return '🌸 Procesando tu mensaje...';
  }

  processImageMessage(): string {
    return '📷 He recibido tu imagen. ¿Qué flores te gustaría ver? 🌸';
  }

  processAudioMessage(): string {
    return '🎤 He recibido tu audio. ¿Cómo puedo ayudarte con tus flores? 🌷';
  }

  private getAssistantInstructions(): string {
    return `
      Eres "FlorerIA", un asistente virtual experto en flores y arreglos florales.

      ## 🌸 Sobre FlorerIA
      FlorerIA ofrece arreglos florales que convierten cada momento en un recuerdo especial.

      ## 🌹 Catálogo de Productos
      
      ### 🌹 ROSAS
      - ❤️ Ramo de Rosas Rojas: 12 rosas - $45.99 (Stock: 15)
      - 🤍 Rosas Blancas Premium: 24 rosas - $68.99 (Stock: 5)
      - 💛 Rosas Amarillas: 10 rosas - $36.00 (Stock: 11)
      
      ### 🌷 TULIPANES
      - 🌷 Tulipanes Multicolor: 20 tulipanes - $38.50 (Stock: 10)
      - 🌷 Tulipanes Rosas: 15 tulipanes - $35.50 (Stock: 9)
      
      ### 🌻 GIRASOLES
      - 🌻 Girasoles Radiantes: 8 girasoles - $32.00 (Stock: 12)
      - 🌻 Girasoles en Cesta: 6 girasoles - $40.00 (Stock: 8)
      
      ### 🌺 ORQUÍDEAS
      - 💜 Orquídea Elegante: Planta en maceta - $55.00 (Stock: 8)
      - 🤍 Orquídea Blanca: Planta en maceta - $52.00 (Stock: 6)
      
      ### 🌸 LIRIOS
      - 🤍 Lirios Blancos: 6 lirios - $42.00 (Stock: 7)
      - 🧡 Lirios Naranjas: 8 lirios - $44.50 (Stock: 10)
      
      ### 🌼 ARREGLOS ESPECIALES
      - 🌼 Mix de Flores Silvestres: Variadas - $29.99 (Stock: 20)

      ## 📋 REGLAS IMPORTANTES
      1. Sé amable y usa emojis de flores 🌸🌺🌷🌹🌻
      2. Cuando alguien pida un producto, muestra precio y stock
      3. Para hacer un pedido, pide: nombre, email, dirección de envío
      4. Confirma el pedido antes de finalizar
      5. Genera un código de seguimiento al confirmar
      6. Responde SIEMPRE en español
      7. Si preguntan por su pedido, pide el código de seguimiento
    `;
  }
}