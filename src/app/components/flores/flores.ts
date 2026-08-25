import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Flor {
  emoji: string;
  nombre: string;
  descripcion: string;
}

@Component({
  selector: 'app-flores',
  imports: [CommonModule],
  templateUrl: './flores.html',
  styleUrl: './flores.css',
})
export class Flores {
  flores: Flor[] = [
    {
      emoji: 'R',
      nombre: 'Rosas de jardín',
      descripcion: 'Románticas y atemporales, seleccionadas por su aroma y apertura.'
    },
    {
      emoji: 'P',
      nombre: 'Peonías',
      descripcion: 'Voluminosas y delicadas, para una composición de presencia serena.'
    },
    {
      emoji: 'T',
      nombre: 'Tulipanes',
      descripcion: 'Líneas limpias y elegantes para regalar sin caer en lo predecible.'
    },
    {
      emoji: 'E',
      nombre: 'Eucalipto',
      descripcion: 'Verde aromático que aporta textura y equilibrio a cada ramo.'
    }
  ];
}
