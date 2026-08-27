// src/app/components/tienda/carrito/carrito.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../../services/carrito.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';
import { OrderService } from '../../../services/order.service';

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

  eliminarProducto(id: string): void {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Se quitará este producto del carrito',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e57399',
      cancelButtonColor: '#ab6fc8',
    }).then((result) => {
      if (result.isConfirmed) {
        this.carritoService.removeProducto(id);
      }
    });
  }

  eliminarArreglo(id: string): void {
    Swal.fire({
      title: '¿Eliminar arreglo?',
      text: 'Se quitará este arreglo personalizado del carrito',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e57399',
      cancelButtonColor: '#ab6fc8',
    }).then((result) => {
      if (result.isConfirmed) {
        this.carritoService.removeArregloPersonalizado(id);
      }
    });
  }

  vaciarCarrito(): void {
    Swal.fire({
      title: '¿Vaciar carrito?',
      text: 'Se eliminarán todos los productos y arreglos',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, vaciar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e57399',
      cancelButtonColor: '#ab6fc8',
    }).then((result) => {
      if (result.isConfirmed) {
        this.carritoService.clearCarrito();
        Swal.fire({
          title: 'Carrito vacío',
          icon: 'success',
          confirmButtonColor: '#e57399',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }

  // ✅ PROCESAR COMPRA - CORREGIDO
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
        unitPrice: item.precio,
        subtotal: item.precio * item.cantidad,
        notes: ''
      }));

      // ✅ DATOS DEL PEDIDO
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
        Swal.fire({
          title: '✅ ¡Pedido creado!',
          text: 'Tu pedido ha sido registrado exitosamente',
          icon: 'success',
          confirmButtonColor: '#e57399',
          timer: 2000,
          showConfirmButton: false
        });
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
        <rect width="100" height="100" fill="#fce4ec"/>
        <text x="50%" y="60%" text-anchor="middle" font-size="40" fill="#f8bbd0" font-family="Arial">✿</text>
      </svg>
    `);
    event.target.src = placeholder;
    event.target.style.objectFit = 'contain';
  }
}