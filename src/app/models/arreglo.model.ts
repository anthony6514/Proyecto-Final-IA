export interface FlorSeleccionada {
  tipo: string;
  cantidad: number;
  precioUnitario: number;
  color?: string;
}

export interface Extra {
  id: string;
  nombre: string;
  precio: number;
  seleccionado: boolean;
}

export interface ArregloPersonalizado {
  id?: string;
  contenedor: 'florero' | 'cesta' | 'caja' | 'ramo';
  flores: FlorSeleccionada[];
  extras: Extra[];
  mensaje?: string;
  precioTotal: number;
}

export const CONTENEDORES = [
  { id: 'florero', nombre: 'Florero', precio: 15 },
  { id: 'cesta', nombre: 'Cesta', precio: 12 },
  { id: 'caja', nombre: 'Caja decorativa', precio: 10 },
  { id: 'ramo', nombre: 'Ramo envuelto', precio: 5 }
];

export const FLORES_DISPONIBLES = [
  { tipo: 'Rosa', colores: ['Roja', 'Blanca', 'Rosa', 'Amarilla'], precio: 3.5 },
  { tipo: 'Tulipán', colores: ['Rojo', 'Amarillo', 'Rosa', 'Morado'], precio: 2.8 },
  { tipo: 'Girasol', colores: ['Amarillo'], precio: 4.0 },
  { tipo: 'Orquídea', colores: ['Blanca', 'Morada', 'Rosa'], precio: 6.5 },
  { tipo: 'Lirio', colores: ['Blanco', 'Naranja', 'Rosa'], precio: 4.5 },
  { tipo: 'Margarita', colores: ['Blanca', 'Amarilla'], precio: 2.0 },
  { tipo: 'Clavel', colores: ['Rojo', 'Rosa', 'Blanco'], precio: 2.5 }
];

export const EXTRAS_DISPONIBLES: Extra[] = [
  { id: '1', nombre: 'Tarjeta con mensaje', precio: 2, seleccionado: false },
  { id: '2', nombre: 'Lazo decorativo premium', precio: 3, seleccionado: false },
  { id: '3', nombre: 'Osito de peluche', precio: 12, seleccionado: false },
  { id: '4', nombre: 'Caja de chocolates', precio: 15, seleccionado: false },
  { id: '5', nombre: 'Globo con helio', precio: 8, seleccionado: false }
];
