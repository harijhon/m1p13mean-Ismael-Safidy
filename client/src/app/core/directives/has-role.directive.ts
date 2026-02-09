import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  private requiredRoles: string[] = [];
  private isHidden = true;

  @Input() set appHasRole(roles: string[]) {
    this.requiredRoles = roles;
    this.updateView(); // Update immediately on input change
  }

  constructor() {
    effect(() => {
      // Trigger dependency on currentUser signal
      this.authService.currentUser();
      this.updateView();
    });
  }

  private updateView() {
    const userRole = this.authService.currentUser()?.role;
    const hasRole = userRole ? this.requiredRoles.includes(userRole) : false;

    if (hasRole && this.isHidden) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isHidden = false;
    } else if (!hasRole && !this.isHidden) {
      this.viewContainer.clear();
      this.isHidden = true;
    }
  }
}
