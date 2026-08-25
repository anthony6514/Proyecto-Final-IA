export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  password: string;
  rol: 'usuario' | 'admin';
  fechaRegistro: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
}
