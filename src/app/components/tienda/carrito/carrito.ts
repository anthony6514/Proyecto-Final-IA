import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../../services/carrito.service';
import { AuthService } from '../../../services/auth.service';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-carrito',
  imports: [CommonModule, RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css'
})
export class Carrito {
  procesando = false;

  constructor(
    public carritoService: CarritoService,
    public authService: AuthService,
    private orderService: OrderService
  ) {}

  async aumentarCantidad(id: string, cantidadActual: number): Promise<void> {
    await this.carritoService.updateCantidad(id, cantidadActual + 1);
  }

  async disminuirCantidad(id: string, cantidadActual: number): Promise<void> {
    if (cantidadActual > 1) {
      await this.carritoService.updateCantidad(id, cantidadActual - 1);
    }
  }

  async eliminarProducto(id: string): Promise<void> {
    if (confirm('¿Eliminar este producto del carrito?')) {
      await this.carritoService.removeProducto(id);
    }
  }

  eliminarArreglo(id: string): void {
    if (confirm('¿Eliminar este arreglo personalizado del carrito?')) {
      this.carritoService.removeArregloPersonalizado(id);
    }
  }

  async vaciarCarrito(): Promise<void> {
    if (confirm('¿Estás seguro de vaciar todo el carrito?')) {
      await this.carritoService.clearCarrito();
    }
  }

  // carrito.ts - procesarCompra
async procesarCompra(): Promise<void> {
  if (!this.authService.isAuthenticated()) {
    alert('Por favor, inicia sesión para realizar una compra');
    return;
  }

  if (this.carritoService.cantidadTotal() === 0) {
    alert('El carrito está vacío');
    return;
  }

  this.procesando = true;
  try {
    const user = this.authService.getCurrentUser();
    if (!user) {
      alert('Usuario no encontrado');
      return;
    }

    // ✅ CREAR EL PEDIDO CON EL FORMATO CORRECTO
    const items = this.carritoService.getItems().map(item => ({
      productId: item.id,
      productName: item.nombre,
      quantity: item.cantidad,
      unitPrice: item.precio,        // ✅ Cambiar price a unitPrice
      subtotal: item.precio * item.cantidad,  // ✅ Agregar subtotal
      notes: ''
    }));

    const orderData = {
      userId: user.id,
      userName: user.nombre,
      userEmail: user.email,
      shippingAddress: 'Dirección de entrega',
      paymentMethod: 'Efectivo',
      notes: 'Pedido desde FlorerIA',
      items: items,
      total: this.carritoService.getPrecioTotal(),
      status: 'PENDIENTE'
    };

    console.log('📦 Enviando pedido al backend:', orderData);

    const created = await this.orderService.createOrder(orderData);
    if (created) {
      alert('✅ ¡Pedido creado exitosamente!');
      await this.carritoService.clearCarrito();
    } else {
      alert('❌ Error al crear el pedido');
    }
  } catch (error) {
    console.error('❌ Error al procesar compra:', error);
    alert('Error al procesar la compra: ' + (error as any).message);
  } finally {
    this.procesando = false;
  }
}

  onImageError(event: any): void {
    const placeholder = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f5f0ea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e8e3dc;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#bg)"/>
        <text x="50%" y="60%" text-anchor="middle" font-size="40" fill="#d4cfc5" font-family="Arial, sans-serif">🌸</text>
      </svg>
    `);
    event.target.src = placeholder;
    event.target.style.objectFit = 'contain';
  }
}