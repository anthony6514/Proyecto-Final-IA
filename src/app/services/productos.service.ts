import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Producto } from '../models/producto.model';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { PRODUCTOS_MOCK } from '../data/productos-mock';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private apiUrl = environment.apiUrl;
  productos = signal<Producto[]>([]);
  private loaded = false;  // ✅ Bandera para saber si ya se cargaron

  constructor(private http: HttpClient) {}

  // ✅ Cargar productos desde Firebase con MAPEO
  async cargarProductos(): Promise<void> {
    // ✅ Si ya están cargados, no hacer nada
    if (this.loaded && this.productos().length > 0) {
      console.log('✅ Productos ya cargados, usando caché');
      return;
    }

    try {
      const productosBackend = await firstValueFrom(
        this.http.get<any[]>(`${this.apiUrl}/products`)
      );
      
      console.log('📦 Productos del backend (sin mapear):', productosBackend);
      
      const productosMapeados: Producto[] = productosBackend.map((p: any) => ({
        id: p.id || p.id,
        nombre: p.name || p.nombre || 'Sin nombre',
        descripcion: p.description || p.descripcion || 'Sin descripción',
        precio: p.price || p.precio || 0,
        categoria: p.category || p.categoria || 'otros',
        imagen: p.imageUrl || p.imagen || '',
        stock: p.stock || 0,
        disponible: p.active !== undefined ? p.active : true
      }));
      
      this.productos.set(productosMapeados);
      this.loaded = true;  // ✅ Marcar como cargados
      console.log('✅ Productos mapeados:', this.productos().length);
      console.log('📝 Primer producto:', this.productos()[0]);
      
    } catch (error) {
      console.error('❌ Error al cargar productos:', error);
      this.cargarProductosMock();
    }
  }

  // ✅ Fallback: Cargar desde MOCK si falla el backend
  private cargarProductosMock(): void {
    try {
      if (PRODUCTOS_MOCK && PRODUCTOS_MOCK.length > 0) {
        this.productos.set(PRODUCTOS_MOCK);
        this.loaded = true;
        console.log('✅ Productos cargados desde MOCK:', PRODUCTOS_MOCK.length);
      } else {
        this.productos.set([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar MOCK:', error);
      this.productos.set([]);
    }
  }

  // ✅ Obtener productos (signal)
  getProductos(): Producto[] {
    return this.productos();
  }

  // ✅ Obtener producto por ID
  async getProductoById(id: string): Promise<Producto | undefined> {
    try {
      const producto = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/products/${id}`)
      );
      
      if (producto) {
        return {
          id: producto.id,
          nombre: producto.name || producto.nombre || 'Sin nombre',
          descripcion: producto.description || producto.descripcion || 'Sin descripción',
          precio: producto.price || producto.precio || 0,
          categoria: producto.category || producto.categoria || 'otros',
          imagen: producto.imageUrl || producto.imagen || '',
          stock: producto.stock || 0,
          disponible: producto.active !== undefined ? producto.active : true
        };
      }
      return undefined;
    } catch (error) {
      console.error('❌ Error al obtener producto:', error);
      return undefined;
    }
  }

  // ✅ Crear producto
  async createProducto(producto: Omit<Producto, 'id'>): Promise<Producto | null> {
    try {
      const headers = this.getAuthHeaders();
      
      const productoBackend = {
        name: producto.nombre,
        description: producto.descripcion,
        price: producto.precio,
        category: producto.categoria,
        imageUrl: producto.imagen,
        stock: producto.stock,
        active: producto.disponible
      };
      
      const nuevo = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/products`, productoBackend, { headers })
      );
      
      const productoMapeado: Producto = {
        id: nuevo.id,
        nombre: nuevo.name || producto.nombre,
        descripcion: nuevo.description || producto.descripcion,
        precio: nuevo.price || producto.precio,
        categoria: nuevo.category || producto.categoria,
        imagen: nuevo.imageUrl || producto.imagen,
        stock: nuevo.stock || producto.stock,
        disponible: nuevo.active !== undefined ? nuevo.active : producto.disponible
      };
      
      this.productos.update(lista => [...lista, productoMapeado]);
      return productoMapeado;
    } catch (error) {
      console.error('❌ Error al crear producto:', error);
      return null;
    }
  }

  // ✅ Actualizar producto
  async updateProducto(id: string, updates: Partial<Producto>): Promise<boolean> {
    try {
      const headers = this.getAuthHeaders();
      const productoActual = this.productos().find(p => p.id === id);
      if (!productoActual) return false;

      const updatesBackend: any = {};
      if (updates.nombre !== undefined) updatesBackend.name = updates.nombre;
      if (updates.descripcion !== undefined) updatesBackend.description = updates.descripcion;
      if (updates.precio !== undefined) updatesBackend.price = updates.precio;
      if (updates.categoria !== undefined) updatesBackend.category = updates.categoria;
      if (updates.imagen !== undefined) updatesBackend.imageUrl = updates.imagen;
      if (updates.stock !== undefined) updatesBackend.stock = updates.stock;
      if (updates.disponible !== undefined) updatesBackend.active = updates.disponible;

      await firstValueFrom(
        this.http.put(`${this.apiUrl}/products/${id}`, updatesBackend, { headers })
      );

      this.productos.update(lista => 
        lista.map(p => p.id === id ? { ...p, ...updates } : p)
      );
      return true;
    } catch (error) {
      console.error('❌ Error al actualizar producto:', error);
      return false;
    }
  }

  // ✅ Eliminar producto
  async deleteProducto(id: string): Promise<boolean> {
    try {
      const headers = this.getAuthHeaders();
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/products/${id}`, { headers })
      );
      this.productos.update(lista => lista.filter(p => p.id !== id));
      return true;
    } catch (error) {
      console.error('❌ Error al eliminar producto:', error);
      return false;
    }
  }

  // ✅ Obtener categorías
  getCategorias(): string[] {
    const categorias = new Set(this.productos().map(p => p.categoria));
    return ['todos', ...Array.from(categorias)];
  }

  // ✅ Estadísticas
  getEstadisticas() {
    const productos = this.productos();
    return {
      total: productos.length,
      disponibles: productos.filter(p => p.disponible).length,
      sinStock: productos.filter(p => p.stock === 0).length,
      valorInventario: productos.reduce((sum, p) => sum + (p.precio * p.stock), 0)
    };
  }

  // 🔑 Headers de autenticación
  private getAuthHeaders() {
    const token = localStorage.getItem('firebase_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
}