import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Admin } from './admin/admin';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'admin', component: Admin },
];
