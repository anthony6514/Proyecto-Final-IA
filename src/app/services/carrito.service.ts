import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductoCarrito } from '../models/producto.model';
import { ArregloPersonalizado } from '../models/arreglo.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private apiUrl = environment.apiUrl;
  private readonly CARRITO_KEY = 'flores_carrito';
  
  items = signal<ProductoCarrito[]>([]);
  arreglosPersonalizados = signal<ArregloPersonalizado[]>([]);
  private userId: string | null = null;
  
  cantidadTotal = computed(() => 
    this.items().reduce((sum, item) => sum + item.cantidad, 0) + 
    this.arreglosPersonalizados().length
  );
  
  precioTotal = computed(() => 
    this.items().reduce((sum, item) => sum + (item.precio * item.cantidad), 0) +
    this.arreglosPersonalizados().reduce((sum, arr) => sum + arr.precioTotal, 0)
  );

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadCarrito();
    
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.userId = user.id;
        this.loadCarritoFromBackend();
      } else {
        this.userId = null;
        this.items.set([]);
        this.arreglosPersonalizados.set([]);
      }
    });
  }

  // 🔥 Cargar carrito desde el backend (CON MAPEO)
  private async loadCarritoFromBackend(): Promise<void> {
    if (!this.userId) return;

    try {
      const headers = this.getAuthHeaders();
      const response = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/cart`, { headers })
      );
      
      console.log('📦 Carrito desde backend (sin mapear):', response);
      
      // ✅ MAPEAR los items del backend al frontend
      const itemsMapeados: ProductoCarrito[] = (response.items || []).map((item: any) => ({
        id: item.id || item.productId,
        nombre: item.productName || item.nombre || 'Producto',
        descripcion: item.notes || item.descripcion || '',
        precio: item.productPrice || item.precio || 0,
        categoria: item.category || 'otros',
        imagen: item.imageUrl || item.imagen || '',
        stock: item.stock || 999,
        disponible: true,
        cantidad: item.quantity || item.cantidad || 1
      }));
      
      this.items.set(itemsMapeados);
      this.arreglosPersonalizados.set(response.arreglos || []);
      this.saveCarrito();
      console.log('✅ Carrito mapeado desde Firebase:', this.items().length, 'items');
      console.log('📝 Primer item:', this.items()[0]);
    } catch (error) {
      console.error('❌ Error al cargar carrito:', error);
      this.loadCarrito();
    }
  }

  // 🔥 Agregar producto al carrito (backend)
  async addProducto(producto: ProductoCarrito): Promise<void> {
    if (!this.userId) {
      this.addProductoLocal(producto);
      return;
    }

    try {
      const headers = this.getAuthHeaders();
      await firstValueFrom(
        this.http.post(
          `${this.apiUrl}/cart/add?productId=${producto.id}&quantity=${producto.cantidad}`,
          {},
          { headers }
        )
      );
      
      await this.loadCarritoFromBackend();
      console.log('✅ Producto agregado al carrito en Firebase');
    } catch (error) {
      console.error('❌ Error al agregar al carrito:', error);
      this.addProductoLocal(producto);
    }
  }

  // 📦 Fallback local
  private addProductoLocal(producto: ProductoCarrito): void {
    const existingIndex = this.items().findIndex(item => item.id === producto.id);
    
    if (existingIndex >= 0) {
      this.items.update(items => {
        const updated = [...items];
        updated[existingIndex].cantidad += producto.cantidad;
        return updated;
      });
    } else {
      this.items.update(items => [...items, producto]);
    }
    
    this.saveCarrito();
  }

  // 🔥 Eliminar producto del carrito
  async removeProducto(id: string): Promise<void> {
    if (!this.userId) {
      this.removeProductoLocal(id);
      return;
    }

    try {
      const headers = this.getAuthHeaders();
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/cart/${id}`, { headers })
      );
      
      await this.loadCarritoFromBackend();
      console.log('✅ Producto eliminado del carrito en Firebase');
    } catch (error) {
      console.error('❌ Error al eliminar del carrito:', error);
      this.removeProductoLocal(id);
    }
  }

  // 📦 Fallback local
  private removeProductoLocal(id: string): void {
    this.items.update(items => items.filter(item => item.id !== id));
    this.saveCarrito();
  }

  // 🔥 Actualizar cantidad
  async updateCantidad(id: string, cantidad: number): Promise<void> {
    if (!this.userId) {
      this.updateCantidadLocal(id, cantidad);
      return;
    }

    if (cantidad <= 0) {
      await this.removeProducto(id);
      return;
    }

    try {
      const headers = this.getAuthHeaders();
      await firstValueFrom(
        this.http.put(
          `${this.apiUrl}/cart/${id}?quantity=${cantidad}`,
          {},
          { headers }
        )
      );
      
      await this.loadCarritoFromBackend();
      console.log('✅ Cantidad actualizada en Firebase');
    } catch (error) {
      console.error('❌ Error al actualizar cantidad:', error);
      this.updateCantidadLocal(id, cantidad);
    }
  }

  // 📦 Fallback local
  private updateCantidadLocal(id: string, cantidad: number): void {
    if (cantidad <= 0) {
      this.removeProductoLocal(id);
      return;
    }

    this.items.update(items => {
      const updated = [...items];
      const index = updated.findIndex(item => item.id === id);
      if (index >= 0) {
        updated[index].cantidad = cantidad;
      }
      return updated;
    });
    
    this.saveCarrito();
  }

  // 🔥 Vaciar carrito
  async clearCarrito(): Promise<void> {
    if (!this.userId) {
      this.clearCarritoLocal();
      return;
    }

    try {
      const headers = this.getAuthHeaders();
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/cart/clear`, { headers })
      );
      
      this.items.set([]);
      this.arreglosPersonalizados.set([]);
      this.saveCarrito();
      console.log('✅ Carrito vaciado en Firebase');
    } catch (error) {
      console.error('❌ Error al vaciar carrito:', error);
      this.clearCarritoLocal();
    }
  }

  // 📦 Fallback local
  private clearCarritoLocal(): void {
    this.items.set([]);
    this.arreglosPersonalizados.set([]);
    this.saveCarrito();
  }

  // 📦 Mantener persistencia local
  private loadCarrito(): void {
    const stored = localStorage.getItem(this.CARRITO_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.items.set(data.items || []);
        this.arreglosPersonalizados.set(data.arreglos || []);
        console.log('✅ Carrito cargado desde localStorage:', this.items().length, 'items');
      } catch (error) {
        console.error('❌ Error al cargar carrito:', error);
      }
    }
  }

  private saveCarrito(): void {
    localStorage.setItem(this.CARRITO_KEY, JSON.stringify({
      items: this.items(),
      arreglos: this.arreglosPersonalizados()
    }));
  }

  // 🔑 Headers de autenticación
  private getAuthHeaders() {
    const token = localStorage.getItem('firebase_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // 📦 Métodos públicos
  getItems(): ProductoCarrito[] {
    return this.items();
  }

  getArreglos(): ArregloPersonalizado[] {
    return this.arreglosPersonalizados();
  }

  getCantidadTotal(): number {
    return this.cantidadTotal();
  }

  getPrecioTotal(): number {
    return this.precioTotal();
  }

  // 🔥 Agregar arreglo personalizado
  addArregloPersonalizado(arreglo: ArregloPersonalizado): void {
    const arregloConId = {
      ...arreglo,
      id: Date.now().toString()
    };
    
    this.arreglosPersonalizados.update(arreglos => [...arreglos, arregloConId]);
    this.saveCarrito();
  }

  // 🔥 Eliminar arreglo personalizado
  removeArregloPersonalizado(id: string): void {
    this.arreglosPersonalizados.update(arreglos => 
      arreglos.filter(arr => arr.id !== id)
    );
    this.saveCarrito();
  }
}