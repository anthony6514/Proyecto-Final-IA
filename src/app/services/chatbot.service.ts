import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';

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

export interface ChatResponse {
  response: string;
  needsConfirmation: boolean;
  needsCustomerData: boolean;
  isOrderQuery: boolean;
  history: any[];
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

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = 'http://localhost:8080/api/assistant';
  private conversationHistory: any[] = [];
  private userId: string = '';

  constructor(private http: HttpClient) {
    // Obtener userId del localStorage (o del servicio de autenticación)
    this.userId = localStorage.getItem('userId') || '';
  }

  /**
   * Enviar mensaje al chatbot real
   */
  async sendMessage(message: string): Promise<string> {
    try {
      const request: ChatRequest = {
        message: message,
        userId: this.userId,
        history: this.conversationHistory
      };

      const response = await firstValueFrom(
        this.http.post<ChatResponse>(`${this.apiUrl}/chat`, request)
      );

      // Actualizar historial
      this.conversationHistory = response.history || [];

      return response.response;
    } catch (error) {
      console.error('Error en el chat:', error);
      return '❌ Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.';
    }
  }

  /**
   * Confirmar pedido
   */
  async confirmOrder(response: string, customerData: any): Promise<string> {
    try {
      const request: OrderConfirmationRequest = {
        response: response,
        userId: this.userId,
        customerData: customerData
      };

      const result = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/confirm`, request)
      );

      return result.mensaje || '✅ Pedido confirmado correctamente';
    } catch (error) {
      console.error('Error confirmando pedido:', error);
      return '❌ Hubo un error al confirmar tu pedido. Por favor, intenta de nuevo.';
    }
  }

  /**
   * Buscar pedido por código
   */
  async trackOrder(codigo: string): Promise<string> {
    try {
      const result = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/track/${codigo}`)
      );
      return result.mensaje || 'No se encontró el pedido';
    } catch (error) {
      console.error('Error buscando pedido:', error);
      return '❌ Hubo un error al buscar tu pedido.';
    }
  }

  /**
   * Limpiar historial de conversación
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Establecer el userId (para cuando el usuario inicia sesión)
   */
  setUserId(userId: string) {
    this.userId = userId;
    localStorage.setItem('userId', userId);
  }

  // ===== MÉTODOS LEGACY (para compatibilidad con tu componente existente) =====

  /**
   * Obtener respuesta (versión simplificada para el componente actual)
   */
  getResponse(message: string): string {
    // Este método se mantiene por compatibilidad, pero usamos sendMessage() en su lugar
    return '🌸 Procesando tu mensaje...';
  }

  processImageMessage(): string {
    return '📷 He recibido tu imagen. ¿Qué flores te gustaría ver? 🌸';
  }

  processAudioMessage(): string {
    return '🎤 He recibido tu audio. ¿Cómo puedo ayudarte con tus flores? 🌷';
  }
}