export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen: string;
  stock: number;
  disponible: boolean;
}

export interface ProductoCarrito extends Producto {
  cantidad: number;
}

export type Categoria = 'rosas' | 'tulipanes' | 'girasoles' | 'orquideas' | 'lirios' | 'otros';
