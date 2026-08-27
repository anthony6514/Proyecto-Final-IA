import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
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

  // 🔥 Obtener todos los pedidos (admin)
  async getAllOrders(): Promise<Order[]> {
    try {
      return await firstValueFrom(
        this.http.get<Order[]>(this.apiUrl, { headers: this.getHeaders() })
      );
    } catch (error) {
      console.error('❌ Error al obtener pedidos:', error);
      return [];
    }
  }

  // 🔥 Obtener pedido por ID
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

  // 🔥 Obtener pedidos del usuario actual
  async getUserOrders(): Promise<Order[]> {
    try {
      return await firstValueFrom(
        this.http.get<Order[]>(this.apiUrl, { headers: this.getHeaders() })
      );
    } catch (error) {
      console.error('❌ Error al obtener pedidos del usuario:', error);
      return [];
    }
  }

  // ✅ CREAR PEDIDO - CORREGIDO
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
      throw error;  // ✅ Lanzar el error para que el carrito lo maneje
    }
  }

  // 🔥 Actualizar estado del pedido
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    try {
      return await firstValueFrom(
        this.http.patch<Order>(
          `${this.apiUrl}/${orderId}/status`,
          { status },
          { headers: this.getHeaders() }
        )
      );
    } catch (error) {
      console.error('❌ Error al actualizar estado:', error);
      return null;
    }
  }

  // 🔥 Eliminar pedido
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