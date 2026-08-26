import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../../services/productos.service';
import { CarritoService } from '../../../services/carrito.service';
import { AuthService } from '../../../services/auth.service';
import { Producto, ProductoCarrito } from '../../../models/producto.model';

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

    // Filtrar por categoría
    if (this.categoriaSeleccionada !== 'todos') {
      resultado = resultado.filter(p => p.categoria === this.categoriaSeleccionada);
    }

    // Filtrar por búsqueda
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
      alert('Producto sin stock disponible');
      return;
    }

    const productoCarrito: ProductoCarrito = {
      ...producto,
      cantidad: 1
    };

    this.carritoService.addProducto(productoCarrito);
    
    // Mostrar notificación temporal
    this.mostrarNotificacion(`${producto.nombre} añadido al carrito`);
  }

  mostrarNotificacion(mensaje: string): void {
    // Crear elemento de notificación
    const notif = document.createElement('div');
    notif.className = 'notification-toast';
    notif.textContent = mensaje;
    document.body.appendChild(notif);

    setTimeout(() => notif.classList.add('show'), 10);
    setTimeout(() => {
      notif.classList.remove('show');
      setTimeout(() => document.body.removeChild(notif), 300);
    }, 2000);
  }

  editarProducto(producto: Producto): void {
    // Esta función se implementará en el componente admin
    console.log('Editar producto:', producto);
  }

  eliminarProducto(producto: Producto): void {
    if (confirm(`¿Estás seguro de eliminar "${producto.nombre}"?`)) {
      this.productosService.deleteProducto(producto.id);
      this.cargarProductos();
      this.mostrarNotificacion('Producto eliminado');
    }
  }

  getCategoriaLabel(categoria: string): string {
    const labels: { [key: string]: string } = {
      'todos': 'Todos',
      'rosas': 'Rosas',
      'tulipanes': 'Tulipanes',
      'girasoles': 'Girasoles',
      'orquideas': 'Orquídeas',
      'lirios': 'Lirios',
      'otros': 'Otros'
    };
    return labels[categoria] || categoria;
  }

  onImageError(event: any): void {
    // Reemplazar con una imagen SVG de placeholder mejorada
    const placeholder = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f5f0ea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e8e3dc;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#bg)"/>
        <text x="50%" y="40%" text-anchor="middle" font-size="80" fill="#d4cfc5" font-family="Arial, sans-serif">🌸</text>
        <text x="50%" y="65%" text-anchor="middle" font-size="18" fill="#a89584" font-family="Arial, sans-serif" font-weight="500">Imagen no disponible</text>
      </svg>
    `);
    event.target.src = placeholder;
    event.target.style.objectFit = 'contain';
  }
}
