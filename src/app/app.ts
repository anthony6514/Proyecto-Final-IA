import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CarritoService } from './services/carrito.service';
import Swal from 'sweetalert2';
import { ProductosService } from './services/productos.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  constructor(
    public authService: AuthService,
    public carritoService: CarritoService,
    private router: Router,
    private productosService: ProductosService
  ) {}

  async ngOnInit(): Promise<void> {
    // ✅ SOLO cargar productos (sin subir nada)
    await this.productosService.cargarProductos();
    console.log('📦 Productos cargados:', this.productosService.getProductos().length);
  }

  logout(): void {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Tu sesión será terminada',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e57399',
      cancelButtonColor: '#ab6fc8',
      customClass: {
        popup: 'swal-floral',
        confirmButton: 'swal-btn-confirm',
        cancelButton: 'swal-btn-cancel'
      }
    }).then((result: import('sweetalert2').SweetAlertResult) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }
}