import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../home/services/user/user.service';
import { User } from '../../home/types/user.type';
import { LoginToken } from '../../home/types/user.type';
import { FirebaseService } from '../../../services/firebase.service';

@Component({
  selector: 'app-seller-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg mt-10 border border-gray-100">
      <h2 class="text-3xl font-extrabold text-gray-900 mb-6 text-center">Become an eStore Seller</h2>
      <div *ngIf="alertMessage"
           class="mb-4 rounded-md px-4 py-3 text-sm"
           [class.bg-green-50]="alertType === 'success'"
           [class.text-green-700]="alertType === 'success'"
           [class.bg-amber-50]="alertType === 'warning'"
           [class.text-amber-700]="alertType === 'warning'"
           [class.bg-rose-50]="alertType === 'error'"
           [class.text-rose-700]="alertType === 'error'">
        {{ alertMessage }}
      </div>

      <div class="mb-6 border border-indigo-100 rounded-lg p-4 bg-indigo-50/60">
        <h3 class="text-base font-semibold text-indigo-900 mb-3">Already a seller?</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="email"
            [(ngModel)]="sellerLoginEmail"
            name="sellerLoginEmail"
            placeholder="Seller email"
            class="md:col-span-1 block w-full border border-indigo-200 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          />
          <input
            type="password"
            [(ngModel)]="sellerLoginPassword"
            name="sellerLoginPassword"
            placeholder="Password"
            class="md:col-span-1 block w-full border border-indigo-200 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          />
          <button
            type="button"
            (click)="onSellerLogin()"
            [disabled]="isLoginSubmitting"
            class="md:col-span-1 w-full py-2 px-4 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {{ isLoginSubmitting ? 'Signing in...' : 'Seller Login' }}
          </button>
        </div>

        <div class="my-3 text-center text-xs text-indigo-500 font-medium">or</div>

        <button
          type="button"
          (click)="onSellerSocialLogin('google')"
          [disabled]="socialLoadingProvider !== null"
          class="w-full py-2 px-4 rounded-md border border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50 disabled:opacity-50"
        >
          {{
            socialLoadingProvider === 'google'
              ? 'Please wait...'
              : 'Continue with Google (Seller)'
          }}
        </button>
      </div>
      
      <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="space-y-6">

        <!-- Step 0: Account Details -->
        <div class="border-b pb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">0. Account Details</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">First Name</label>
              <input type="text" [(ngModel)]="firstName" name="firstName" required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Last Name</label>
              <input type="text" [(ngModel)]="lastName" name="lastName"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" [(ngModel)]="email" name="email" required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" [(ngModel)]="password" name="password" required minlength="6"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
          </div>
        </div>
        
        <!-- Step 1: Store Details -->
        <div class="border-b pb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">1. Store Details</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Store Name</label>
              <input type="text" [(ngModel)]="storeName" name="storeName" required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Address</label>
              <input type="text" [(ngModel)]="address" name="address" required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">City</label>
              <input type="text" [(ngModel)]="city" name="city" required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">State</label>
              <input type="text" [(ngModel)]="state" name="state" required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">PIN / ZIP</label>
              <input type="text" [(ngModel)]="pin" name="pin" required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
          </div>
        </div>

        <!-- Step 2: Financial Details -->
        <div class="border-b pb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">2. Bank / Payout Details</h3>
          <p class="text-xs text-gray-500 mb-4">Where should we send your earnings?</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Bank Name</label>
              <input type="text" [(ngModel)]="bankName" name="bankName" required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Account Number</label>
              <input type="text" [(ngModel)]="accountNumber" name="accountNumber" required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Routing Number / Swift Code</label>
              <input type="text" [(ngModel)]="routingNumber" name="routingNumber" required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
          </div>
        </div>

        <!-- Step 3: Commission Agreement -->
        <div class="pt-4 bg-indigo-50 p-4 rounded-md">
          <h3 class="text-lg font-semibold text-indigo-800 mb-2">3. Commission Agreement</h3>
          <p class="text-sm text-indigo-700 mb-4">
            By registering as a seller, you agree that <strong>eStore will retain a 10% commission fee</strong> on all items sold. The remaining 90% will be paid out to the account specified above.
          </p>
          <div class="flex items-center">
            <input type="checkbox" [(ngModel)]="acceptedTerms" name="acceptedTerms" required
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
            <label class="ml-2 block text-sm text-gray-900">
              I accept the eStore platform terms & conditions and commission structure.
            </label>
          </div>
        </div>

        <button type="submit" [disabled]="!registerForm.form.valid || !acceptedTerms || isSubmitting"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
          {{ isSubmitting ? 'Registering...' : 'Register My Store' }}
        </button>
      </form>
    </div>
  `
})
export class SellerRegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  address = '';
  city = '';
  state = '';
  pin = '';
  storeName = '';
  bankName = '';
  accountNumber = '';
  routingNumber = '';
  acceptedTerms = false;
  isSubmitting = false;
  isLoginSubmitting = false;
  socialLoadingProvider: 'google' | 'github' | 'facebook' | null = null;
  sellerLoginEmail = '';
  sellerLoginPassword = '';
  alertMessage = '';
  alertType: 'success' | 'warning' | 'error' = 'warning';

  constructor(
    private router: Router,
    private userService: UserService,
    private firebaseService: FirebaseService
  ) {}

  onSellerLogin() {
    const email = this.sellerLoginEmail.trim();
    const password = this.sellerLoginPassword;
    if (!email || !password) {
      this.alertType = 'warning';
      this.alertMessage = 'Please enter seller email and password.';
      return;
    }
    this.isLoginSubmitting = true;
    this.userService.login(email, password).subscribe({
      next: (result: LoginToken) => {
        this.isLoginSubmitting = false;
        if (result?.token && result?.user?.role === 'seller') {
          result.user.email = email;
          this.userService.activateToken(result);
          this.alertType = 'success';
          this.alertMessage = 'Seller login successful.';
          setTimeout(() => this.router.navigate(['/seller/dashboard']), 700);
          return;
        }
        this.alertType = 'error';
        this.alertMessage = 'This account is not registered as seller.';
      },
      error: (err) => {
        this.isLoginSubmitting = false;
        this.alertType = 'error';
        this.alertMessage = err?.error?.message || 'Seller login failed.';
      },
    });
  }

  async onSellerSocialLogin(provider: 'google' | 'github' | 'facebook'): Promise<void> {
    if (!this.firebaseService.isConfigured()) {
      this.alertType = 'error';
      this.alertMessage = 'Social sign-in needs Firebase config in environment files.';
      return;
    }
    this.socialLoadingProvider = provider;
    try {
      const socialUser = await this.firebaseService.loginWithSocialProvider(provider);
      if (!socialUser) {
        this.alertType = 'success';
        this.alertMessage = 'Redirecting to secure sign-in...';
        return;
      }
      this.finishSellerSocialLogin(provider, socialUser);
    } catch (err: any) {
      this.alertType = 'error';
      this.alertMessage = err?.message || 'Seller social login failed.';
    } finally {
      this.socialLoadingProvider = null;
    }
  }

  private finishSellerSocialLogin(
    provider: 'google' | 'github' | 'facebook',
    socialUser: any
  ): void {
    const email = socialUser.email || '';
    if (!email) {
      this.alertType = 'warning';
      this.alertMessage = 'Social account has no email.';
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
          if (result?.token) {
            result.user.email = email;
            this.userService.activateToken(result);
            this.alertType = 'success';
            this.alertMessage = 'Seller login successful.';
            setTimeout(() => this.router.navigate(['/seller/dashboard']), 700);
          } else {
            this.alertType = 'warning';
            this.alertMessage = 'Seller social login failed.';
          }
        },
        error: (err) => {
          this.alertType = 'error';
          this.alertMessage =
            err?.error?.message ||
            'Seller social login failed. Ensure this email is registered as seller.';
        },
      });
  }

  onSubmit() {
    if (!this.acceptedTerms || this.isSubmitting) return;

    const sellerPayload: User = {
      firstName: this.firstName?.trim(),
      lastName: this.lastName?.trim(),
      address: this.address?.trim(),
      city: this.city?.trim(),
      state: this.state?.trim(),
      pin: this.pin?.trim(),
      email: this.email?.trim(),
      password: this.password,
      role: 'seller',
      storeName: this.storeName?.trim(),
      bankName: this.bankName?.trim(),
      accountNumber: this.accountNumber?.trim(),
      routingNumber: this.routingNumber?.trim(),
    };

    this.isSubmitting = true;
    this.userService.createUser(sellerPayload).subscribe({
      next: (result) => {
        this.isSubmitting = false;
        if (result?.message === 'Success') {
          this.alertType = 'success';
          this.alertMessage = 'Seller account created. Please login as seller.';
          setTimeout(() => this.router.navigate(['/seller/login']), 800);
          return;
        }
        this.alertType = 'warning';
        this.alertMessage = result?.message || 'Unable to create seller account.';
      },
      error: (err) => {
        this.isSubmitting = false;
        this.alertType = 'error';
        this.alertMessage = err?.error?.message || 'Seller registration failed.';
      },
    });
  }
}
