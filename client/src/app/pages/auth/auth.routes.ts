import { Routes } from '@angular/router';

const routes: Routes = [
	{
		path: 'login',
		loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
	},
	{
		path: 'register',
		loadComponent: () => import('./login/register.component').then(m => m.RegisterComponent)
	},
	{
		path: '',
		redirectTo: 'login',
		pathMatch: 'full'
	}
];

export default routes;