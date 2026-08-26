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

  onImageError(event: any): void {
    // Reemplazar con una imagen SVG de placeholder mejorada
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
