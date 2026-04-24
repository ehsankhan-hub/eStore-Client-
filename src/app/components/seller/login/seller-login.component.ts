import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../../../services/firebase.service';
import { UserService } from '../../home/services/user/user.service';
import { LoginToken } from '../../home/types/user.type';

@Component({
  selector: 'app-seller-login',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg mt-10 border border-gray-100">
      <h2 class="text-3xl font-extrabold text-gray-900 mb-3 text-center">
        Seller Login
      </h2>
      <p class="text-sm text-gray-500 text-center mb-6">
        Continue with your seller account.
      </p>

      <div
        *ngIf="alertMessage"
        class="mb-4 rounded-md px-4 py-3 text-sm"
        [class.bg-green-50]="alertType === 0"
        [class.text-green-700]="alertType === 0"
        [class.bg-amber-50]="alertType === 1"
        [class.text-amber-700]="alertType === 1"
        [class.bg-rose-50]="alertType === 2"
        [class.text-rose-700]="alertType === 2"
      >
        {{ alertMessage }}
      </div>

      <button
        type="button"
        (click)="onSocialLogin('google')"
        [disabled]="socialLoadingProvider !== null"
        class="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
      >
        {{
          socialLoadingProvider === 'google'
            ? 'Please wait...'
            : 'Continue with Google (Seller)'
        }}
      </button>

      <p class="text-xs text-gray-500 mt-5 text-center">
        Not a seller yet?
        <a [routerLink]="['/seller/register']" class="text-indigo-600 hover:underline"
          >Register your seller account</a
        >
      </p>
    </div>
  `,
})
export class SellerLoginComponent implements OnInit {
  alertType = 0;
  alertMessage = '';
  socialLoadingProvider: 'google' | 'github' | 'facebook' | null = null;

  constructor(
    private userService: UserService,
    private firebaseService: FirebaseService,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.handleRedirectLoginResult();
  }

  async onSocialLogin(provider: 'google' | 'github' | 'facebook'): Promise<void> {
    if (!this.firebaseService.isConfigured()) {
      this.alertMessage =
        'Social sign-in needs Firebase config in environment files.';
      this.alertType = 2;
      return;
    }
    this.socialLoadingProvider = provider;
    try {
      const socialUser = await this.firebaseService.loginWithSocialProvider(provider);
      if (!socialUser) {
        this.alertMessage = 'Redirecting to secure sign-in...';
        this.alertType = 0;
        return;
      }
      this.finishSocialLogin(provider, socialUser);
    } catch (err: any) {
      this.alertMessage = err?.message || 'Social login failed. Please try again.';
      this.alertType = 2;
    } finally {
      this.socialLoadingProvider = null;
    }
  }

  private async handleRedirectLoginResult(): Promise<void> {
    try {
      const redirectUser = await this.firebaseService.getRedirectSocialLoginResult();
      if (!redirectUser) return;
      const providerId = redirectUser.providerData?.[0]?.providerId || '';
      const provider = providerId.includes('google')
        ? 'google'
        : providerId.includes('github')
          ? 'github'
          : providerId.includes('facebook')
            ? 'facebook'
            : null;
      if (!provider) return;
      this.finishSocialLogin(provider, redirectUser);
    } catch (err: any) {
      this.alertMessage = err?.message || 'Social login failed. Please try again.';
      this.alertType = 2;
    }
  }

  private finishSocialLogin(
    provider: 'google' | 'github' | 'facebook',
    socialUser: any
  ): void {
    const email = socialUser.email || '';
    if (!email) {
      this.alertMessage = 'Social account has no email.';
      this.alertType = 1;
      return;
    }

    const [firstName, ...rest] = (socialUser.displayName || '').trim().split(' ');
    const lastName = rest.join(' ').trim();

    this.userService
      .socialLogin({
        email,
        firstName: firstName || 'Seller',
        lastName: lastName || provider,
        provider,
        providerUid: socialUser.uid,
        expectedRole: 'seller',
      })
      .subscribe({
        next: (result: LoginToken) => {
          if (result.token) {
            result.user.email = email;
            this.userService.activateToken(result);
            this.alertMessage = 'Seller login successful';
            this.alertType = 0;
            setTimeout(() => this.router.navigate(['/seller/dashboard']), 700);
          } else {
            this.alertMessage = 'Seller social login failed.';
            this.alertType = 1;
          }
        },
        error: (err) => {
          this.alertMessage =
            err.error?.message ||
            'Seller social login failed. Ensure this email is registered as seller.';
          this.alertType = 2;
        },
      });
  }
}

