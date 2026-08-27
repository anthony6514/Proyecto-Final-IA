import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CarritoService } from './services/carrito.service';
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
    if (confirm('¿Cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}