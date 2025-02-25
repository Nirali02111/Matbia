import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class GenerateTokenGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const hasAccess = localStorage.getItem('generateTokenAccess') === 'true';

    if (!hasAccess) {
      this.router.navigate(['/dashboard']); // Redirect unauthorized users
      return false;
    }
    return true;
  }
}
