// src/app/components/admin/pedidos-admin/pedidos-admin.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { Order, OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_OPTIONS, ORDER_STATUS_COLORS } from '../../../models/order.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pedidos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos-admin.html',
  styleUrls: ['./pedidos-admin.css']
})
export class PedidosAdmin implements OnInit, OnDestroy {
  OrderStatus = OrderStatus;
  
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  isLoading = true;
  errorMessage = '';
  filterStatus: string = 'TODOS';
  searchTerm: string = '';
  statusOptions = ORDER_STATUS_OPTIONS;

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef  // ✅ Inyectar ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  ngOnDestroy(): void {}

  async cargarPedidos(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const orders = await this.orderService.getAllOrders();
      this.orders = orders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      this.aplicarFiltros();
      console.log('✅ Pedidos cargados:', this.orders.length);
      
      if (this.orders.length > 0) {
        console.log('📝 Último pedido:', this.orders[0]);
      }
    } catch (error) {
      this.errorMessage = 'Error al cargar los pedidos';
      console.error('❌ Error:', error);
    } finally {
      this.isLoading = false;
      // ✅ FORZAR ACTUALIZACIÓN DE LA VISTA
      this.cdr.detectChanges();
    }
  }

  recargarPedidos(): void {
    this.cargarPedidos();
    Swal.fire({
      title: '🔄 Pedidos recargados',
      icon: 'success',
      timer: 1000,
      showConfirmButton: false
    });
  }

  aplicarFiltros(): void {
    this.filteredOrders = this.orders.filter(order => {
      const matchStatus = this.filterStatus === 'TODOS' || order.status === this.filterStatus;
      const matchSearch = !this.searchTerm ||
        order.userName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.userEmail?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }

  getStatusLabel(status: OrderStatus): string {
    return ORDER_STATUS_LABELS[status] || status;
  }

  getStatusClass(status: OrderStatus): string {
    return ORDER_STATUS_COLORS[status] || 'pending';
  }

  async updateOrderStatus(order: Order, newStatus: OrderStatus): Promise<void> {
    if (order.status === newStatus) return;

    const result = await Swal.fire({
      title: '¿Cambiar estado?',
      html: `El pedido pasará a <strong>${this.getStatusLabel(newStatus)}</strong>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e57399',
      cancelButtonColor: '#ab6fc8'
    });

    if (!result.isConfirmed) return;

    try {
      const updated = await this.orderService.updateOrderStatus(order.id, newStatus);
      if (updated) {
        const index = this.orders.findIndex(o => o.id === order.id);
        if (index !== -1) {
          this.orders[index] = updated;
        }
        this.aplicarFiltros();
        Swal.fire({
          title: '✅ Estado actualizado',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('❌ Error:', error);
      Swal.fire({ 
        title: '❌ Error', 
        text: 'No se pudo actualizar el estado', 
        icon: 'error' 
      });
    }
  }

  async eliminarPedido(order: Order): Promise<void> {
    const result = await Swal.fire({
      title: '🗑️ ¿Eliminar pedido?',
      text: `Se eliminará permanentemente el pedido de ${order.userName}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e57399',
      cancelButtonColor: '#ab6fc8'
    });

    if (!result.isConfirmed) return;

    try {
      await this.orderService.deleteOrder(order.id);
      this.orders = this.orders.filter(o => o.id !== order.id);
      this.aplicarFiltros();
      Swal.fire({
        title: '🗑️ Pedido eliminado',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('❌ Error:', error);
      Swal.fire({ 
        title: '❌ Error', 
        text: 'No se pudo eliminar el pedido', 
        icon: 'error' 
      });
    }
  }

  verDetalles(order: Order): void {
    this.selectedOrder = order;
  }

  cerrarDetalles(): void {
    this.selectedOrder = null;
  }

  getStatsCount(status: string): number {
    if (status === 'TODOS') return this.orders.length;
    return this.orders.filter(o => o.status === status).length;
  }

  formatDate(date: string | Date): string {
    if (!date) return 'Fecha no disponible';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  }

  formatCurrency(amount: number): string {
    if (amount === undefined || amount === null) return '$0.00';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  onImageError(event: any): void {
    event.target.src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
        <rect width="50" height="50" fill="#fce4ec"/>
        <text x="50%" y="60%" text-anchor="middle" font-size="25" fill="#f8bbd0" font-family="Arial">🌸</text>
      </svg>
    `);
  }
}