import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../../services/productos.service';
import { CarritoService } from '../../../services/carrito.service';
import { AuthService } from '../../../services/auth.service';
import { Producto, ProductoCarrito } from '../../../models/producto.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-catalogo',
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})
export class Catalogo implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categoriaSeleccionada = 'todos';
  terminoBusqueda = '';
  categorias: string[] = [];

  constructor(
    public productosService: ProductosService,
    private carritoService: CarritoService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.categorias = this.productosService.getCategorias();
  }

  cargarProductos(): void {
    this.productos = this.productosService.getProductos();
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let resultado = this.productos;
    if (this.categoriaSeleccionada !== 'todos') {
      resultado = resultado.filter(p => p.categoria === this.categoriaSeleccionada);
    }
    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.toLowerCase();
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(termino) ||
        p.descripcion.toLowerCase().includes(termino)
      );
    }
    this.productosFiltrados = resultado;
  }

  onCategoriaChange(categoria: string): void {
    this.categoriaSeleccionada = categoria;
    this.aplicarFiltros();
  }

  onBusquedaChange(): void {
    this.aplicarFiltros();
  }

  agregarAlCarrito(producto: Producto): void {
    if (producto.stock === 0) {
      Swal.fire({
        title: 'Sin stock',
        text: 'Este producto no está disponible por el momento',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#e57399',
        customClass: { popup: 'swal-floral' }
      });
      return;
    }
    const productoCarrito: ProductoCarrito = { ...producto, cantidad: 1 };
    this.carritoService.addProducto(productoCarrito);
    this.mostrarNotificacion(`${producto.nombre} añadido al carrito`);
  }

  mostrarNotificacion(mensaje: string): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 2200,
      timerProgressBar: true,
      customClass: { popup: 'swal-toast-floral' }
    });
    Toast.fire({ icon: 'success', title: mensaje });
  }

  editarProducto(producto: Producto): void {
    console.log('Editar producto:', producto);
  }

  eliminarProducto(producto: Producto): void {
    Swal.fire({
      title: '¿Eliminar producto?',
      html: `Se eliminará <strong>${producto.nombre}</strong> permanentemente`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e57399',
      cancelButtonColor: '#ab6fc8',
      customClass: { popup: 'swal-floral' }
    }).then((result) => {
      if (result.isConfirmed) {
        this.productosService.deleteProducto(producto.id);
        this.cargarProductos();
        this.mostrarNotificacion('Producto eliminado');
      }
    });
  }

  getCategoriaLabel(categoria: string): string {
    const labels: { [key: string]: string } = {
      'todos': 'Todos', 'rosas': 'Rosas', 'tulipanes': 'Tulipanes',
      'girasoles': 'Girasoles', 'orquideas': 'Orquídeas',
      'lirios': 'Lirios', 'otros': 'Otros'
    };
    return labels[categoria] || categoria;
  }

  onImageError(event: any): void {
    const placeholder = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#fce4ec"/>
        <text x="50%" y="45%" text-anchor="middle" font-size="80" fill="#f8bbd0" font-family="Arial">✿</text>
        <text x="50%" y="68%" text-anchor="middle" font-size="18" fill="#e57399" font-family="Arial">Imagen no disponible</text>
      </svg>
    `);
    event.target.src = placeholder;
    event.target.style.objectFit = 'contain';
  }
}
