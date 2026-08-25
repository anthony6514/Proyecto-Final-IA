import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./components/home/home').then(({ Home }) => Home)
	},
	{
		path: 'login',
		loadComponent: () => import('./components/auth/login/login').then(({ Login }) => Login)
	},
	{
		path: 'register',
		loadComponent: () => import('./components/auth/register/register').then(({ Register }) => Register)
	},
	{
		path: 'tienda',
		loadComponent: () => import('./components/tienda/catalogo/catalogo').then(({ Catalogo }) => Catalogo),
		canActivate: [authGuard]
	},
	{
		path: 'carrito',
		loadComponent: () => import('./components/tienda/carrito/carrito').then(({ Carrito }) => Carrito),
		canActivate: [authGuard]
	},
	{
		path: 'arreglo-personalizado',
		loadComponent: () => import('./components/arreglo-personalizado/arreglo-personalizado').then(({ ArregloPersonalizadoComponent }) => ArregloPersonalizadoComponent),
		canActivate: [authGuard]
	},
	{
		path: 'chat',
		loadComponent: () => import('./components/chat/chat').then(({ Chat }) => Chat),
		canActivate: [authGuard]
	},
	{
		path: 'admin',
		loadComponent: () => import('./components/admin/dashboard/dashboard').then(({ Dashboard }) => Dashboard),
		canActivate: [adminGuard]
	},
	{
		path: 'admin/productos',
		loadComponent: () => import('./components/admin/productos-admin/productos-admin').then(({ ProductosAdmin }) => ProductosAdmin),
		canActivate: [adminGuard]
	},
	{ path: '**', redirectTo: '' }
];
