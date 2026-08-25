import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RegisterData } from '../../../models/usuario.model';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  registerData: RegisterData = {
    nombre: '',
    email: '',
    password: ''
  };

  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    // Validaciones
    if (!this.registerData.nombre || !this.registerData.email || !this.registerData.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    if (this.registerData.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if (this.registerData.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Simulamos un pequeño delay
    setTimeout(() => {
      const result = this.authService.register(this.registerData);
      
      if (result.success) {
        this.successMessage = result.message;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      } else {
        this.errorMessage = result.message;
      }
      
      this.isLoading = false;
    }, 500);
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
