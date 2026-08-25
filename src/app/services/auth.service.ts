import { Injectable, signal } from '@angular/core';
import { Usuario, LoginCredentials, RegisterData } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USERS_KEY = 'flores_usuarios';
  private readonly CURRENT_USER_KEY = 'flores_current_user';
  
  currentUser = signal<Usuario | null>(null);
  isAuthenticated = signal<boolean>(false);
  isAdmin = signal<boolean>(false);

  constructor() {
    this.initializeDefaultUsers();
    this.loadCurrentUser();
  }

  private initializeDefaultUsers(): void {
    const users = this.getUsers();
    if (users.length === 0) {
      // Crear usuarios por defecto
      const defaultUsers: Usuario[] = [
        {
          id: '1',
          nombre: 'Administrador',
          email: 'admin@flores.com',
          password: 'admin123',
          rol: 'admin',
          fechaRegistro: new Date()
        },
        {
          id: '2',
          nombre: 'Usuario Demo',
          email: 'user@flores.com',
          password: 'user123',
          rol: 'usuario',
          fechaRegistro: new Date()
        }
      ];
      localStorage.setItem(this.USERS_KEY, JSON.stringify(defaultUsers));
    }
  }

  private getUsers(): Usuario[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  private saveUsers(users: Usuario[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  private loadCurrentUser(): void {
    const userData = localStorage.getItem(this.CURRENT_USER_KEY);
    if (userData) {
      const user: Usuario = JSON.parse(userData);
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
      this.isAdmin.set(user.rol === 'admin');
    }
  }

  login(credentials: LoginCredentials): { success: boolean; message: string; user?: Usuario } {
    const users = this.getUsers();
    const user = users.find(u => 
      u.email === credentials.email && u.password === credentials.password
    );

    if (user) {
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
      this.isAdmin.set(user.rol === 'admin');
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      return { 
        success: true, 
        message: `¡Bienvenido ${user.nombre}!`,
        user 
      };
    }

    return { 
      success: false, 
      message: 'Credenciales incorrectas' 
    };
  }

  register(data: RegisterData): { success: boolean; message: string } {
    const users = this.getUsers();
    
    // Verificar si el email ya existe
    if (users.some(u => u.email === data.email)) {
      return { 
        success: false, 
        message: 'El email ya está registrado' 
      };
    }

    // Crear nuevo usuario
    const newUser: Usuario = {
      id: Date.now().toString(),
      nombre: data.nombre,
      email: data.email,
      password: data.password,
      rol: 'usuario', // Los nuevos usuarios siempre son usuarios normales
      fechaRegistro: new Date()
    };

    users.push(newUser);
    this.saveUsers(users);

    return { 
      success: true, 
      message: 'Usuario registrado exitosamente' 
    };
  }

  logout(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.isAdmin.set(false);
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  getCurrentUser(): Usuario | null {
    return this.currentUser();
  }

  checkIsAdmin(): boolean {
    return this.isAdmin();
  }

  checkIsAuthenticated(): boolean {
    return this.isAuthenticated();
  }
}
