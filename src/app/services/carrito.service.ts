import { Injectable, signal, computed } from '@angular/core';
import { ProductoCarrito } from '../models/producto.model';
import { ArregloPersonalizado } from '../models/arreglo.model';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private readonly CARRITO_KEY = 'flores_carrito';
  
  items = signal<ProductoCarrito[]>([]);
  arreglosPersonalizados = signal<ArregloPersonalizado[]>([]);
  
  // Computed signals
  cantidadTotal = computed(() => 
    this.items().reduce((sum, item) => sum + item.cantidad, 0) + 
    this.arreglosPersonalizados().length
  );
  
  precioTotal = computed(() => 
    this.items().reduce((sum, item) => sum + (item.precio * item.cantidad), 0) +
    this.arreglosPersonalizados().reduce((sum, arr) => sum + arr.precioTotal, 0)
  );

  constructor() {
    this.loadCarrito();
  }

  private loadCarrito(): void {
    const stored = localStorage.getItem(this.CARRITO_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      this.items.set(data.items || []);
      this.arreglosPersonalizados.set(data.arreglos || []);
    }
  }

  private saveCarrito(): void {
    localStorage.setItem(this.CARRITO_KEY, JSON.stringify({
      items: this.items(),
      arreglos: this.arreglosPersonalizados()
    }));
  }

  addProducto(producto: ProductoCarrito): void {
    const existingIndex = this.items().findIndex(item => item.id === producto.id);
    
    if (existingIndex >= 0) {
      // Actualizar cantidad si ya existe
      this.items.update(items => {
        const updated = [...items];
        updated[existingIndex].cantidad += producto.cantidad;
        return updated;
      });
    } else {
      // Agregar nuevo producto
      this.items.update(items => [...items, producto]);
    }
    
    this.saveCarrito();
  }

  removeProducto(id: string): void {
    this.items.update(items => items.filter(item => item.id !== id));
    this.saveCarrito();
  }

  updateCantidad(id: string, cantidad: number): void {
    if (cantidad <= 0) {
      this.removeProducto(id);
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

  addArregloPersonalizado(arreglo: ArregloPersonalizado): void {
    const arregloConId = {
      ...arreglo,
      id: Date.now().toString()
    };
    
    this.arreglosPersonalizados.update(arreglos => [...arreglos, arregloConId]);
    this.saveCarrito();
  }

  removeArregloPersonalizado(id: string): void {
    this.arreglosPersonalizados.update(arreglos => 
      arreglos.filter(arr => arr.id !== id)
    );
    this.saveCarrito();
  }

  clearCarrito(): void {
    this.items.set([]);
    this.arreglosPersonalizados.set([]);
    this.saveCarrito();
  }

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
}
