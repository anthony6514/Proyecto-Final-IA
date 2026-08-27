import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario, LoginCredentials, RegisterData } from '../models/usuario.model';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private readonly CURRENT_USER_KEY = 'flores_current_user';
  
  currentUser = signal<Usuario | null>(null);
  isAuthenticated = signal<boolean>(false);
  isAdmin = signal<boolean>(false);
  
  // ✅ Bandera para controlar el flujo de autenticación
  private isProcessingAuth = false;
  private isRegistering = false;
  // ✅ NUEVA: Para evitar que el monitor dispare verificaciones innecesarias
  private isInitialLoad = true;

  constructor(private http: HttpClient) {
    this.loadCurrentUser();
    this.monitorAuthState();
  }

  // ✅ MONITOR: Solo se activa cuando NO estamos en login/registro
  private monitorAuthState(): void {
    onAuthStateChanged(auth, async (user) => {
      // ⛔ Ignorar si estamos procesando autenticación
      if (this.isProcessingAuth || this.isRegistering) {
        console.log('⏳ Ignorando cambio de estado durante operación en curso');
        return;
      }

      // ✅ Si es la primera carga y ya hay usuario, verificar
      if (this.isInitialLoad) {
        this.isInitialLoad = false;
        if (user) {
          try {
            const token = await user.getIdToken();
            localStorage.setItem('firebase_token', token);
            await this.verifyToken(token);
          } catch (error) {
            console.error('❌ Error en monitorAuthState:', error);
            this.clearAuthState();
          }
        }
        return;
      }

      // ⛔ Si ya estamos autenticados, no hacer nada
      if (this.isAuthenticated()) {
        console.log('✅ Usuario ya autenticado, monitor ignorado');
        return;
      }
      
      // 🔥 SOLO cuando el usuario hace LOGIN manualmente
      if (user) {
        try {
          const token = await user.getIdToken();
          localStorage.setItem('firebase_token', token);
          await this.verifyToken(token);
        } catch (error) {
          console.error('❌ Error en monitorAuthState:', error);
          this.clearAuthState();
        }
      } else {
        this.clearAuthState();
      }
    });
  }

  // ✅ LOGIN: Correcto, solo una llamada
  async login(credentials: LoginCredentials): Promise<{ success: boolean; message: string; user?: Usuario }> {
    // ⛔ Evitar login si ya estamos procesando
    if (this.isProcessingAuth) {
      console.log('⏳ Ya hay una operación en curso, espera...');
      return { success: false, message: 'Ya hay una operación en curso' };
    }

    try {
      this.isProcessingAuth = true;
      console.log('1️⃣ Iniciando login...');
      
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('firebase_token', token);
      
      // ✅ ÚNICA llamada a verifyToken desde login
      await this.verifyToken(token);
      
      console.log('✅ Login completado exitosamente');
      this.isProcessingAuth = false;
      
      return { 
        success: true, 
        message: `¡Bienvenido ${this.currentUser()?.nombre}!`,
        user: this.currentUser()!
      };
    } catch (error: any) {
      console.error('❌ Error de login:', error);
      this.isProcessingAuth = false;
      this.clearAuthState();
      return { 
        success: false, 
        message: this.getFirebaseErrorMessage(error.code) 
      };
    }
  }

  // ✅ REGISTRO: Enviar rol en MAYÚSCULAS
async register(data: RegisterData): Promise<{ success: boolean; message: string }> {
    if (this.isProcessingAuth) {
        return { success: false, message: 'Ya hay una operación en curso' };
    }

    try {
        this.isRegistering = true;
        this.isProcessingAuth = true;
        
        console.log('1️⃣ Iniciando registro con Firebase...');
        
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            data.email,
            data.password
        );
        
        console.log('2️⃣ Registro exitoso en Firebase');
        
        // ✅ ENVIAR REGISTRO al backend (rol en MAYÚSCULAS)
        try {
            await firstValueFrom(
                this.http.post(`${this.apiUrl}/auth/register`, {
                    uid: userCredential.user.uid,
                    email: data.email,
                    nombre: data.nombre || data.email.split('@')[0],
                    rol: 'CLIENT'  // ✅ En MAYÚSCULAS
                })
            );
            console.log('✅ Usuario creado en Realtime Database');
        } catch (error) {
            console.error('❌ Error al crear usuario en DB:', error);
            await userCredential.user.delete();
            throw new Error('Error al crear el usuario en la base de datos');
        }
        
        // CERRAR SESIÓN
        await signOut(auth);
        this.clearAuthState();
        
        console.log('3️⃣ Sesión cerrada - Usuario debe hacer login');
        
        this.isRegistering = false;
        this.isProcessingAuth = false;
        
        return { 
            success: true, 
            message: '✅ Usuario registrado exitosamente. ¡Ahora inicia sesión!' 
        };
    } catch (error: any) {
        console.error('❌ Error de registro:', error);
        this.isRegistering = false;
        this.isProcessingAuth = false;
        this.clearAuthState();
        return { 
            success: false, 
            message: this.getFirebaseErrorMessage(error.code) 
        };
    }
}

// ✅ VERIFY TOKEN - Mapear correctamente el usuario
private async verifyToken(token: string): Promise<void> {
    try {
        console.log('🔍 Verificando token con backend...');
        
        const response = await firstValueFrom(
            this.http.post<{ uid: string, email: string, user: any }>(
                `${this.apiUrl}/auth/verify`,
                { token }
            )
        );
        
        console.log('✅ Token verificado:', response);
        
        // 🔥 Mapear correctamente el usuario del backend
        const backendUser = response.user;
        const user: Usuario = {
            id: response.uid,
            nombre: backendUser?.fullName || response.email.split('@')[0],
            email: response.email,
            password: '',
            // 🔥 El backend devuelve 'role' (con 'e'), el frontend usa 'rol' (con 'l')
            rol: backendUser?.role?.toLowerCase() === 'admin' ? 'admin' : 'usuario',
            fechaRegistro: backendUser?.createdAt ? new Date(backendUser.createdAt) : new Date()
        };
        
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        this.isAdmin.set(user.rol === 'admin');
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
        
        console.log('✅ Usuario autenticado:', user.email);
    } catch (error) {
        console.error('❌ Error al verificar token:', error);
        throw error;
    }
}

  // ✅ LOGOUT: Limpieza completa
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
    }
    this.clearAuthState();
    this.isProcessingAuth = false;
    this.isRegistering = false;
  }

  // ✅ LIMPIAR ESTADO
  private clearAuthState(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.isAdmin.set(false);
    localStorage.removeItem(this.CURRENT_USER_KEY);
    localStorage.removeItem('firebase_token');
  }

  // ✅ CARGAR USUARIO DESDE LOCALSTORAGE
  private loadCurrentUser(): void {
    const userData = localStorage.getItem(this.CURRENT_USER_KEY);
    if (userData) {
      try {
        const user: Usuario = JSON.parse(userData);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        this.isAdmin.set(user.rol === 'admin');
        console.log('✅ Usuario cargado desde localStorage:', user.email);
      } catch (error) {
        console.error('❌ Error al cargar usuario:', error);
        this.clearAuthState();
      }
    }
  }

  // ✅ MÉTODOS PÚBLICOS
  getCurrentUser(): Usuario | null {
    return this.currentUser();
  }

  checkIsAdmin(): boolean {
    return this.isAdmin();
  }

  checkIsAuthenticated(): boolean {
    return this.isAuthenticated();
  }

  // ✅ MANEJO DE ERRORES
  private getFirebaseErrorMessage(code: string): string {
    const errors: { [key: string]: string } = {
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'El email ya está registrado',
      'auth/invalid-email': 'Email inválido',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/too-many-requests': 'Demasiados intentos, intenta más tarde',
      'auth/network-request-failed': 'Error de conexión, verifica tu internet'
    };
    return errors[code] || 'Error de autenticación: ' + code;
  }
}