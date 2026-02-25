import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StoreService } from '../services/store.service';

export const storeInterceptor: HttpInterceptorFn = (req, next) => {
    const storeService = inject(StoreService);
    const activeStore = storeService.activeStore();

    if (activeStore && activeStore._id && req.url.includes('/api/')) {
        const clonedReq = req.clone({
            headers: req.headers.set('x-store-id', activeStore._id)
        });
        return next(clonedReq);
    }

    return next(req);
};
