import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginCredentials } from '../../../models/usuario.model';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  credentials: LoginCredentials = {
    email: '',
    password: ''
  };

  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Simulamos un pequeño delay para parecer más real
    setTimeout(() => {
      const result = this.authService.login(this.credentials);
      
      if (result.success) {
        // Redirigir según el rol
        if (result.user?.rol === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/tienda']);
        }
      } else {
        this.errorMessage = result.message;
      }
      
      this.isLoading = false;
    }, 500);
  }

  clearError(): void {
    this.errorMessage = '';
  }
}
