import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../../services/carrito.service';

@Component({
  selector: 'app-carrito',
  imports: [CommonModule, RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css'
})
export class Carrito {
  constructor(public carritoService: CarritoService) {}

  aumentarCantidad(id: string, cantidadActual: number): void {
    this.carritoService.updateCantidad(id, cantidadActual + 1);
  }

  disminuirCantidad(id: string, cantidadActual: number): void {
    if (cantidadActual > 1) {
      this.carritoService.updateCantidad(id, cantidadActual - 1);
    }
  }

  eliminarProducto(id: string): void {
    if (confirm('¿Eliminar este producto del carrito?')) {
      this.carritoService.removeProducto(id);
    }
  }

  eliminarArreglo(id: string): void {
    if (confirm('¿Eliminar este arreglo personalizado del carrito?')) {
      this.carritoService.removeArregloPersonalizado(id);
    }
  }

  vaciarCarrito(): void {
    if (confirm('¿Estás seguro de vaciar todo el carrito?')) {
      this.carritoService.clearCarrito();
    }
  }

  procesarCompra(): void {
    alert('¡Gracias por tu compra! (Funcionalidad de pago no implementada - solo frontend)');
    this.carritoService.clearCarrito();
  }
}
