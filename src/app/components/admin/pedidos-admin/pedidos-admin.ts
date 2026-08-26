import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { Order, OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../../models/order.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pedidos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos-admin.html',
  styleUrls: ['./pedidos-admin.css']
})
export class PedidosAdmin implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  isLoading = false;
  errorMessage = '';
  filterStatus: string = 'TODOS';
  searchTerm: string = '';
  
  OrderStatus = OrderStatus;
  ORDER_STATUS_LABELS = ORDER_STATUS_LABELS;
  ORDER_STATUS_COLORS = ORDER_STATUS_COLORS;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.errorMessage = 'Error al cargar los pedidos. Por favor, intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredOrders = this.orders.filter(order => {
      const matchesStatus = this.filterStatus === 'TODOS' || order.status === this.filterStatus;
      const matchesSearch = !this.searchTerm || 
        order.userName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.userEmail.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  updateOrderStatus(order: Order, newStatus: OrderStatus): void {
    if (order.status === newStatus) return;

    Swal.fire({
      title: '¿Cambiar estado?',
      html: `El pedido pasará a <strong>${ORDER_STATUS_LABELS[newStatus]}</strong>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e57399',
      cancelButtonColor: '#ab6fc8',
      customClass: { popup: 'swal-floral' }
    }).then((result: import('sweetalert2').SweetAlertResult) => {
      if (!result.isConfirmed) return;
      this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
        next: (updatedOrder) => {
          const index = this.orders.findIndex(o => o.id === order.id);
          if (index !== -1) this.orders[index] = updatedOrder;
          this.applyFilters();
          const Toast = Swal.mixin({ toast: true, position: 'bottom-end', showConfirmButton: false, timer: 2000 });
          Toast.fire({ icon: 'success', title: `Estado actualizado a ${ORDER_STATUS_LABELS[newStatus]}` });
        },
        error: () => {
          this.errorMessage = 'Error al actualizar el estado del pedido.';
        }
      });
    });
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }

  getStatusClass(status: OrderStatus): string {
    return ORDER_STATUS_COLORS[status];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  private showSuccessMessage(message: string): void {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }

  getOrderStatusOptions(currentStatus: OrderStatus): OrderStatus[] {
    if (currentStatus === OrderStatus.PENDIENTE) {
      return [OrderStatus.PENDIENTE, OrderStatus.COMPLETADO, OrderStatus.CANCELADO];
    } else if (currentStatus === OrderStatus.COMPLETADO) {
      return [OrderStatus.COMPLETADO];
    } else {
      return [OrderStatus.CANCELADO];
    }
  }

  getStatsCount(status: string): number {
    if (status === 'TODOS') {
      return this.orders.length;
    }
    return this.orders.filter(order => order.status === status).length;
  }

  getTotalRevenue(): number {
    return this.orders
      .filter(order => order.status === OrderStatus.COMPLETADO)
      .reduce((sum, order) => sum + order.total, 0);
  }

  onImageError(event: any): void {
    const placeholder = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" fill="#f5f0ea"/>
        <text x="50%" y="50%" text-anchor="middle" font-size="16" fill="#d4cfc5" font-family="Arial">🌸</text>
      </svg>
    `);
    event.target.src = placeholder;
  }
}
