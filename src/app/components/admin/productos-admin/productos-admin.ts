import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../../services/productos.service';
import { Producto } from '../../../models/producto.model';

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
    alert('Producto creado exitosamente');
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
    alert('Producto actualizado exitosamente');
  }

  eliminarProducto(id: string): void {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productosService.deleteProducto(id);
      this.cargarProductos();
    }
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
      alert('El nombre es requerido');
      return false;
    }
    if (this.nuevoProducto.precio <= 0) {
      alert('El precio debe ser mayor a 0');
      return false;
    }
    return true;
  }
}
