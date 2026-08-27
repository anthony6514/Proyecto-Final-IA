import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssistantService, Message } from '../../services/assistant.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('messageContainer') messageContainer!: ElementRef;

  messages: Message[] = [];
  userInput: string = '';
  isRecording: boolean = false;
  isLoading: boolean = false;
  voiceEnabled: boolean = false;

  showConfirmationForm: boolean = false;
  pendingResponse: string = '';
  customerData = {
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: ''
  };

  constructor(private assistantService: AssistantService) {
    this.addBotMessage('🌸 ¡Bienvenido a FlorerIA! Soy tu asistente virtual especializado en arreglos florales. ¿En qué puedo ayudarte hoy?');
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  // 👈 BOTÓN DE RECARGA (invisible para el usuario)
  refreshChat() {
    console.log('🔄 Recargando chat...');
    
    // Clonar el array para forzar actualización
    this.messages = [...this.messages];
    
    // Forzar scroll al final
    setTimeout(() => {
      this.scrollToBottom();
    }, 50);
    
    // Mensaje de confirmación (solo en consola)
    console.log('✅ Chat actualizado correctamente');
  }

  // 👈 Forzar actualización sin ChangeDetectorRef
  private forceUpdate() {
    setTimeout(() => {
      this.messages = [...this.messages];
      this.scrollToBottom();
    }, 10);
  }

  async sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    const message = this.userInput.trim();
    console.log('📤 Enviando mensaje:', message);
    
    this.addUserMessage(message);
    this.userInput = '';
    this.isLoading = true;

    try {
      const botMessageIndex = this.messages.length;
      this.messages.push({
        text: '',
        isBot: true,
        timestamp: new Date(),
        type: 'text'
      });

      const response = await this.assistantService.sendMessage(message);
      console.log('✅ Respuesta recibida:', response);
      
      this.messages[botMessageIndex].text = response;
      this.isLoading = false;
      this.pendingResponse = response;
      
      // 👈 Forzar actualización
      setTimeout(() => {
        this.messages = [...this.messages];
        this.scrollToBottom();
      }, 50);

      if (this.voiceEnabled && response) {
        try {
          await this.assistantService.generateAudio(response);
        } catch (error) {
          console.error('Error reproduciendo audio:', error);
        }
      }

      if (response.includes('Para confirmar tu pedido') || 
          response.includes('necesito tus datos') ||
          response.includes('confirmar tu pedido')) {
        this.showConfirmationForm = true;
        setTimeout(() => {
          this.messages = [...this.messages];
        }, 10);
      } else {
        this.showConfirmationForm = false;
      }

    } catch (error) {
      console.error('Error:', error);
      this.isLoading = false;
      const lastMessage = this.messages[this.messages.length - 1];
      if (lastMessage && lastMessage.isBot) {
        lastMessage.text = '❌ Lo siento, hubo un error. Por favor, intenta de nuevo.';
      } else {
        this.addBotMessage('❌ Lo siento, hubo un error. Por favor, intenta de nuevo.');
      }
      this.forceUpdate();
    }
  }

  async confirmOrder() {
    if (!this.customerData.nombre || !this.customerData.email || !this.customerData.direccion) {
      this.addBotMessage('⚠️ Por favor, completa todos los campos obligatorios.');
      this.forceUpdate();
      return;
    }

    this.isLoading = true;
    this.showConfirmationForm = false;

    try {
      const mensaje = await this.assistantService.confirmOrder(
        this.pendingResponse,
        this.customerData
      );
      this.addBotMessage(mensaje);
      this.isLoading = false;
      this.forceUpdate();

      if (this.voiceEnabled) {
        try {
          await this.assistantService.generateAudio(mensaje);
        } catch (error) {
          console.error('Error reproduciendo audio:', error);
        }
      }

      this.customerData = {
        nombre: '',
        email: '',
        telefono: '',
        direccion: '',
        ciudad: ''
      };

    } catch (error) {
      console.error('Error:', error);
      this.isLoading = false;
      this.addBotMessage('❌ Hubo un error al confirmar tu pedido.');
      this.forceUpdate();
    }
  }

  cancelOrder() {
    this.showConfirmationForm = false;
    this.customerData = {
      nombre: '',
      email: '',
      telefono: '',
      direccion: '',
      ciudad: ''
    };
    this.addBotMessage('❌ Pedido cancelado. ¿Te gustaría hacer otro pedido?');
    this.forceUpdate();
  }

  sendQuickReply(message: string) {
    this.userInput = message;
    this.sendMessage();
  }

  sendImage() {
    this.addUserMessage('📷 [Imagen enviada]', 'image');
    setTimeout(() => {
      const response = this.assistantService.processImageMessage();
      this.addBotMessage(response);
      this.forceUpdate();
    }, 500);
  }

  sendAudio() {
    this.isRecording = !this.isRecording;
    if (!this.isRecording) {
      this.addUserMessage('🎤 [Audio enviado]', 'audio');
      setTimeout(() => {
        const response = this.assistantService.processAudioMessage();
        this.addBotMessage(response);
        this.forceUpdate();
      }, 500);
    }
  }

  async trackOrder() {
    const codigo = prompt('📦 Ingresa tu código de seguimiento:');
    if (!codigo) return;

    this.isLoading = true;
    
    try {
      const mensaje = await this.assistantService.trackOrder(codigo);
      this.addBotMessage(mensaje);
      this.isLoading = false;
      this.forceUpdate();

      if (this.voiceEnabled) {
        await this.assistantService.generateAudio(mensaje);
      }
    } catch (error) {
      console.error('Error:', error);
      this.isLoading = false;
      this.addBotMessage('❌ Hubo un error al buscar tu pedido.');
      this.forceUpdate();
    }
  }

  async toggleVoice() {
    this.voiceEnabled = !this.voiceEnabled;
    if (this.voiceEnabled) {
      this.addBotMessage('🔊 Modo de voz activado');
      this.forceUpdate();
      try {
        await this.assistantService.generateAudio('🔊 Modo de voz activado');
      } catch (error) {
        console.error('Error reproduciendo audio:', error);
      }
    } else {
      this.addBotMessage('🔇 Modo de voz desactivado');
      this.forceUpdate();
    }
  }

  clearChat() {
    this.messages = [];
    this.assistantService.clearHistory();
    this.addBotMessage('🌸 Conversación reiniciada. ¿En qué puedo ayudarte?');
    this.forceUpdate();
  }

  private addUserMessage(text: string, type: 'text' | 'image' | 'audio' = 'text') {
    this.messages.push({
      text,
      isBot: false,
      timestamp: new Date(),
      type
    });
    this.forceUpdate();
  }

  private addBotMessage(text: string) {
    this.messages.push({
      text,
      isBot: true,
      timestamp: new Date(),
      type: 'text'
    });
    this.forceUpdate();
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  getTimeString(date: Date): string {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  formatMessage(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }
}