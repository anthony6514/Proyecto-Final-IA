import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { 
  ArregloPersonalizado, 
  FlorSeleccionada, 
  Extra,
  CONTENEDORES, 
  FLORES_DISPONIBLES, 
  EXTRAS_DISPONIBLES 
} from '../../models/arreglo.model';

@Component({
  selector: 'app-arreglo-personalizado',
  imports: [CommonModule, FormsModule],
  templateUrl: './arreglo-personalizado.html',
  styleUrl: './arreglo-personalizado.css'
})
export class ArregloPersonalizadoComponent {
  contenedores = CONTENEDORES;
  floresDisponibles = FLORES_DISPONIBLES;
  extras: Extra[] = JSON.parse(JSON.stringify(EXTRAS_DISPONIBLES)); // Deep copy

  contenedorSeleccionado = 'ramo';
  floresSeleccionadas: FlorSeleccionada[] = [];
  mensaje = '';

  // Para el formulario de añadir flores
  florActual = this.floresDisponibles[0];
  colorActual = this.florActual.colores[0];
  cantidadActual = 1;

  constructor(
    private carritoService: CarritoService,
    private router: Router
  ) {}

  get precioContenedor(): number {
    const contenedor = this.contenedores.find(c => c.id === this.contenedorSeleccionado);
    return contenedor?.precio || 0;
  }

  get precioFlores(): number {
    return this.floresSeleccionadas.reduce((sum, f) => 
      sum + (f.cantidad * f.precioUnitario), 0
    );
  }

  get precioExtras(): number {
    return this.extras
      .filter(e => e.seleccionado)
      .reduce((sum, e) => sum + e.precio, 0);
  }

  get precioTotal(): number {
    return this.precioContenedor + this.precioFlores + this.precioExtras;
  }

  onFlorChange(): void {
    const flor = this.floresDisponibles.find(f => f.tipo === this.florActual.tipo);
    if (flor) {
      this.florActual = flor;
      this.colorActual = flor.colores[0];
    }
  }

  agregarFlor(): void {
    if (this.cantidadActual <= 0) return;

    const florExistente = this.floresSeleccionadas.find(f => 
      f.tipo === this.florActual.tipo && f.color === this.colorActual
    );

    if (florExistente) {
      florExistente.cantidad += this.cantidadActual;
    } else {
      this.floresSeleccionadas.push({
        tipo: this.florActual.tipo,
        color: this.colorActual,
        cantidad: this.cantidadActual,
        precioUnitario: this.florActual.precio
      });
    }

    this.cantidadActual = 1;
  }

  eliminarFlor(index: number): void {
    this.floresSeleccionadas.splice(index, 1);
  }

  toggleExtra(extra: Extra): void {
    extra.seleccionado = !extra.seleccionado;
  }

  agregarAlCarrito(): void {
    if (this.floresSeleccionadas.length === 0) {
      alert('Debes seleccionar al menos un tipo de flor');
      return;
    }

    const arreglo: ArregloPersonalizado = {
      contenedor: this.contenedorSeleccionado as any,
      flores: this.floresSeleccionadas,
      extras: this.extras.filter(e => e.seleccionado),
      mensaje: this.mensaje || undefined,
      precioTotal: this.precioTotal
    };

    this.carritoService.addArregloPersonalizado(arreglo);
    
    alert('¡Arreglo personalizado añadido al carrito!');
    this.router.navigate(['/carrito']);
  }

  reiniciar(): void {
    this.contenedorSeleccionado = 'ramo';
    this.floresSeleccionadas = [];
    this.mensaje = '';
    this.extras.forEach(e => e.seleccionado = false);
    this.cantidadActual = 1;
  }
}
