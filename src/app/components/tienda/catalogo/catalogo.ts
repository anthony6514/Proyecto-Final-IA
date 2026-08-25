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
}
