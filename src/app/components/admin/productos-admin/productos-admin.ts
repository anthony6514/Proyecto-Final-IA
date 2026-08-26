import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../../services/productos.service';
import { Producto } from '../../../models/producto.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-productos-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './productos-admin.html',
  styleUrl: './productos-admin.css'
})
export class ProductosAdmin implements OnInit {
  productos: Producto[] = [];
  modoEdicion = false;
  productoEditando: Producto | null = null;
  
  nuevoProducto: Omit<Producto, 'id'> = {
    nombre: '',
    descripcion: '',
    precio: 0,
    categoria: 'rosas',
    imagen: '',
    stock: 0,
    disponible: true
  };

  constructor(private productosService: ProductosService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productos = this.productosService.getProductos();
  }

  crearProducto(): void {
    if (!this.validarFormulario()) return;
    this.productosService.createProducto(this.nuevoProducto);
    this.cargarProductos();
    this.limpiarFormulario();
    Swal.fire({
      title: '¡Producto creado!',
      icon: 'success',
      confirmButtonColor: '#e57399',
      timer: 1800,
      showConfirmButton: false,
      customClass: { popup: 'swal-floral' }
    });
  }

  editarProducto(producto: Producto): void {
    this.modoEdicion = true;
    this.productoEditando = producto;
    this.nuevoProducto = { ...producto };
  }

  guardarEdicion(): void {
    if (!this.productoEditando || !this.validarFormulario()) return;
    this.productosService.updateProducto(this.productoEditando.id, this.nuevoProducto);
    this.cargarProductos();
    this.cancelarEdicion();
    Swal.fire({
      title: '¡Producto actualizado!',
      icon: 'success',
      confirmButtonColor: '#e57399',
      timer: 1800,
      showConfirmButton: false,
      customClass: { popup: 'swal-floral' }
    });
  }

  eliminarProducto(id: string): void {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e57399',
      cancelButtonColor: '#ab6fc8',
      customClass: { popup: 'swal-floral' }
    }).then((result) => {
      if (result.isConfirmed) {
        this.productosService.deleteProducto(id);
        this.cargarProductos();
      }
    });
  }

  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.productoEditando = null;
    this.limpiarFormulario();
  }

  limpiarFormulario(): void {
    this.nuevoProducto = {
      nombre: '',
      descripcion: '',
      precio: 0,
      categoria: 'rosas',
      imagen: '',
      stock: 0,
      disponible: true
    };
  }

  validarFormulario(): boolean {
    if (!this.nuevoProducto.nombre.trim()) {
      Swal.fire({ title: 'Campo requerido', text: 'El nombre del producto es obligatorio', icon: 'warning', confirmButtonColor: '#e57399', customClass: { popup: 'swal-floral' } });
      return false;
    }
    if (this.nuevoProducto.precio <= 0) {
      Swal.fire({ title: 'Precio inválido', text: 'El precio debe ser mayor a 0', icon: 'warning', confirmButtonColor: '#e57399', customClass: { popup: 'swal-floral' } });
      return false;
    }
    return true;
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
