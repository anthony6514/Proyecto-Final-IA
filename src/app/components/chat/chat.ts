import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, Message } from '../../services/chatbot.service';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  messages: Message[] = [];
  userInput: string = '';
  isRecording: boolean = false;

  constructor(private chatbotService: ChatbotService) {
    this.addBotMessage('Hola. Soy el asistente de Flores Chat. Puedo ayudarte a elegir un ramo, conocer precios o preparar un pedido.');
  }

  sendMessage() {
    if (this.userInput.trim()) {
      this.addUserMessage(this.userInput);
      const response = this.chatbotService.getResponse(this.userInput);
      setTimeout(() => {
        this.addBotMessage(response);
      }, 500);
      this.userInput = '';
    }
  }

  sendQuickReply(message: string) {
    this.userInput = message;
    this.sendMessage();
  }

  sendImage() {
    this.addUserMessage('📷 [Imagen enviada]', 'image');
    setTimeout(() => {
      const response = this.chatbotService.processImageMessage();
      this.addBotMessage(response);
    }, 500);
  }

  sendAudio() {
    this.isRecording = !this.isRecording;
    if (!this.isRecording) {
      this.addUserMessage('🎤 [Audio enviado]', 'audio');
      setTimeout(() => {
        const response = this.chatbotService.processAudioMessage();
        this.addBotMessage(response);
      }, 500);
    }
  }

  private addUserMessage(text: string, type: 'text' | 'image' | 'audio' = 'text') {
    this.messages.push({
      text,
      isBot: false,
      timestamp: new Date(),
      type
    });
  }

  private addBotMessage(text: string) {
    this.messages.push({
      text,
      isBot: true,
      timestamp: new Date(),
      type: 'text'
    });
  }

  getTimeString(date: Date): string {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
}
