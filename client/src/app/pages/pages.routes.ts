import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { StoreGrid } from './admin/store-grid/store-grid';
import { RentsComponent } from './admin/rents/rents';
import { EvictionsComponent } from './admin/evictions/evictions';
import { StoreValidationComponent } from './admin/store-validation/store-validation';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'store-grid', component: StoreGrid },
    { path: 'rent', component: RentsComponent },
    { path: 'evictions', component: EvictionsComponent },
    { path: 'validation', component: StoreValidationComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
