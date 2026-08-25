import { Injectable, signal } from '@angular/core';
import { Producto } from '../models/producto.model';
import { PRODUCTOS_MOCK } from '../data/productos-mock';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private readonly PRODUCTOS_KEY = 'flores_productos';
  
  productos = signal<Producto[]>([]);

  constructor() {
    this.loadProductos();
  }

  private loadProductos(): void {
    const stored = localStorage.getItem(this.PRODUCTOS_KEY);
    if (stored) {
      this.productos.set(JSON.parse(stored));
    } else {
      // Inicializar con datos mock
      this.productos.set([...PRODUCTOS_MOCK]);
      this.saveProductos();
    }
  }

  private saveProductos(): void {
    localStorage.setItem(this.PRODUCTOS_KEY, JSON.stringify(this.productos()));
  }

  getProductos(): Producto[] {
    return this.productos();
  }

  getProductoById(id: string): Producto | undefined {
    return this.productos().find(p => p.id === id);
  }

  getProductosByCategoria(categoria: string): Producto[] {
    if (categoria === 'todos') {
      return this.productos();
    }
    return this.productos().filter(p => p.categoria === categoria);
  }

  searchProductos(term: string): Producto[] {
    const searchTerm = term.toLowerCase();
    return this.productos().filter(p => 
      p.nombre.toLowerCase().includes(searchTerm) ||
      p.descripcion.toLowerCase().includes(searchTerm) ||
      p.categoria.toLowerCase().includes(searchTerm)
    );
  }

  createProducto(producto: Omit<Producto, 'id'>): Producto {
    const newProducto: Producto = {
      ...producto,
      id: Date.now().toString()
    };
    
    this.productos.update(productos => [...productos, newProducto]);
    this.saveProductos();
    return newProducto;
  }

  updateProducto(id: string, updates: Partial<Producto>): boolean {
    const index = this.productos().findIndex(p => p.id === id);
    if (index === -1) return false;

    this.productos.update(productos => {
      const updated = [...productos];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
    
    this.saveProductos();
    return true;
  }

  deleteProducto(id: string): boolean {
    const index = this.productos().findIndex(p => p.id === id);
    if (index === -1) return false;

    this.productos.update(productos => productos.filter(p => p.id !== id));
    this.saveProductos();
    return true;
  }

  updateStock(id: string, cantidad: number): boolean {
    const producto = this.getProductoById(id);
    if (!producto) return false;

    return this.updateProducto(id, { 
      stock: producto.stock - cantidad,
      disponible: (producto.stock - cantidad) > 0
    });
  }

  getCategorias(): string[] {
    const categorias = new Set(this.productos().map(p => p.categoria));
    return ['todos', ...Array.from(categorias)];
  }

  getEstadisticas() {
    const productos = this.productos();
    return {
      total: productos.length,
      disponibles: productos.filter(p => p.disponible).length,
      sinStock: productos.filter(p => p.stock === 0).length,
      valorInventario: productos.reduce((sum, p) => sum + (p.precio * p.stock), 0)
    };
  }
}
