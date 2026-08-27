// src/app/services/order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Order, OrderStatus } from '../models/order.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('firebase_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ✅ OBTENER TODOS LOS PEDIDOS (ADMIN) - Endpoint específico
  async getAllOrders(): Promise<Order[]> {
    try {
      console.log('📦 Obteniendo TODOS los pedidos (admin)...');
      // ✅ Usar el mismo endpoint pero con un parámetro o header especial
      const result = await firstValueFrom(
        this.http.get<Order[]>(`${this.apiUrl}/admin/all`, { headers: this.getHeaders() })
      );
      console.log('✅ Pedidos obtenidos:', result?.length || 0);
      return result || [];
    } catch (error) {
      console.error('❌ Error al obtener todos los pedidos:', error);
      // ✅ FALLBACK: Si el endpoint admin no existe, usar el normal pero filtrar
      return this.getUserOrders();
    }
  }

  // ✅ OBTENER PEDIDOS DEL USUARIO ACTUAL
  async getUserOrders(): Promise<Order[]> {
    try {
      const result = await firstValueFrom(
        this.http.get<Order[]>(this.apiUrl, { headers: this.getHeaders() })
      );
      return result || [];
    } catch (error) {
      console.error('❌ Error al obtener pedidos del usuario:', error);
      return [];
    }
  }

  // ✅ OBTENER PEDIDO POR ID
  async getOrderById(id: string): Promise<Order | null> {
    try {
      return await firstValueFrom(
        this.http.get<Order>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      );
    } catch (error) {
      console.error('❌ Error al obtener pedido:', error);
      return null;
    }
  }

  // ✅ CREAR PEDIDO
  async createOrder(orderData: any): Promise<Order | null> {
    try {
      console.log('📤 Enviando al backend:', orderData);
      const result = await firstValueFrom(
        this.http.post<Order>(this.apiUrl, orderData, { headers: this.getHeaders() })
      );
      console.log('✅ Pedido creado:', result);
      return result;
    } catch (error) {
      console.error('❌ Error al crear pedido:', error);
      throw error;
    }
  }

  // ✅ Actualizar estado del pedido - CORREGIDO
async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    try {
        console.log(`🔄 Actualizando pedido ${orderId} a estado: ${status}`);
        
        const body = { status: status };
        console.log('📤 Enviando body:', body);
        
        const result = await firstValueFrom(
            this.http.patch<Order>(
                `${this.apiUrl}/${orderId}/status`,
                body,
                { headers: this.getHeaders() }
            )
        );
        console.log('✅ Estado actualizado:', result);
        return result;
    } catch (error) {
        console.error('❌ Error al actualizar estado:', error);
        return null;
    }
}

  // ✅ ELIMINAR PEDIDO
  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/${orderId}`, { headers: this.getHeaders() })
      );
      return true;
    } catch (error) {
      console.error('❌ Error al eliminar pedido:', error);
      return false;
    }
  }
}