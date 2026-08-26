import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Order, OrderStatus } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllOrders(): Observable<Order[]> {
    return this.http
      .get<Order[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(catchError(() => of(this.getMockOrders())));
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getUserOrders(): Observable<Order[]> {
    return this.http
      .get<Order[]>(`${this.apiUrl}/user`, { headers: this.getHeaders() })
      .pipe(catchError(() => of([])));
  }

  createOrder(order: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order, { headers: this.getHeaders() });
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(
      `${this.apiUrl}/${orderId}/status`,
      { status },
      { headers: this.getHeaders() }
    );
  }

  deleteOrder(orderId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${orderId}`, { headers: this.getHeaders() });
  }

  private getMockOrders(): Order[] {
    return [
      {
        id: 'demo-001-abcd-efgh',
        userId: 'user-001',
        userName: 'Ana García',
        userEmail: 'ana.garcia@ejemplo.com',
        phoneNumber: '555-1234',
        shippingAddress: 'Calle Flores 123, Col. Primavera',
        items: [
          {
            productId: 'prod-001',
            productName: 'Ramo de Rosas Rojas',
            quantity: 1,
            price: 350,
            imageUrl: ''
          },
          {
            productId: 'prod-002',
            productName: 'Tulipanes Multicolor',
            quantity: 2,
            price: 180,
            imageUrl: ''
          }
        ],
        total: 710,
        status: OrderStatus.PENDIENTE,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'demo-002-ijkl-mnop',
        userId: 'user-002',
        userName: 'Carlos Mendoza',
        userEmail: 'carlos.m@ejemplo.com',
        phoneNumber: '555-5678',
        shippingAddress: 'Av. Girasoles 456, Col. Jardín',
        items: [
          {
            productId: 'prod-003',
            productName: 'Orquídeas Elegantes',
            quantity: 1,
            price: 520,
            imageUrl: ''
          }
        ],
        total: 520,
        status: OrderStatus.COMPLETADO,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000)
      },
      {
        id: 'demo-003-qrst-uvwx',
        userId: 'user-003',
        userName: 'María López',
        userEmail: 'maria.lopez@ejemplo.com',
        items: [
          {
            productId: 'prod-004',
            productName: 'Lirios Blancos',
            quantity: 3,
            price: 150,
            imageUrl: ''
          },
          {
            productId: 'prod-005',
            productName: 'Girasoles Radiantes',
            quantity: 1,
            price: 220,
            imageUrl: ''
          }
        ],
        total: 670,
        status: OrderStatus.CANCELADO,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 46 * 60 * 60 * 1000)
      },
      {
        id: 'demo-004-yzab-cdef',
        userId: 'user-004',
        userName: 'Laura Ruiz',
        userEmail: 'laura.ruiz@ejemplo.com',
        phoneNumber: '555-9012',
        items: [
          {
            productId: 'prod-006',
            productName: 'Rosas Amarillas',
            quantity: 2,
            price: 290,
            imageUrl: ''
          }
        ],
        total: 580,
        status: OrderStatus.PENDIENTE,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000)
      }
    ];
  }
}
