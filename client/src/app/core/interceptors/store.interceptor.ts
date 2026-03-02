import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StoreService } from '../services/store.service';

export const storeInterceptor: HttpInterceptorFn = (req, next) => {
    const storeService = inject(StoreService);
    const activeStore = storeService.activeStore();

    if (req.headers.has('X-Skip-Store-Interceptor')) {
        const clonedReq = req.clone({
            headers: req.headers.delete('X-Skip-Store-Interceptor')
        });
        return next(clonedReq);
    }

    if (activeStore && activeStore._id && req.url.includes('/api/')) {
        const clonedReq = req.clone({
            headers: req.headers.set('x-store-id', activeStore._id)
        });
        return next(clonedReq);
    }

    return next(req);
};
