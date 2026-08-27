import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../../services/carrito.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-carrito',
  imports: [CommonModule, RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css'
})
export class Carrito {
  // Propiedad para controlar el estado de procesamiento
  procesando: boolean = false;

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
    Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Se quitará este producto del carrito',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e57399',
      cancelButtonColor: '#ab6fc8',
    }).then((result: import('sweetalert2').SweetAlertResult) => {
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
    }).then((result: import('sweetalert2').SweetAlertResult) => {
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
    }).then((result: import('sweetalert2').SweetAlertResult) => {
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

  // Método procesarCompra actualizado con manejo de estado
  async procesarCompra(): Promise<void> {
    // Activar estado de procesamiento
    this.procesando = true;
    
    try {
      // Simular proceso de compra (aquí iría tu llamada a API real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mostrar mensaje de éxito
      await Swal.fire({
        title: '¡Gracias por tu compra!',
        text: 'Tu pedido ha sido recibido con éxito',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#e57399',
        customClass: { popup: 'swal-floral' }
      });
      
      // Vaciar el carrito después de la compra exitosa
      this.carritoService.clearCarrito();
      
    } catch (error) {
      // Manejar errores
      await Swal.fire({
        title: 'Error al procesar la compra',
        text: 'Hubo un problema al procesar tu pedido. Por favor, intenta nuevamente.',
        icon: 'error',
        confirmButtonText: 'Intentar de nuevo',
        confirmButtonColor: '#e57399'
      });
    } finally {
      // Desactivar estado de procesamiento siempre
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