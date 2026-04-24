import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PaymentService } from '../../home/services/payment/payment.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seller-pending',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg mt-10 border border-gray-100">
      <h2 class="text-3xl font-extrabold text-gray-900 mb-3 text-center">
        Seller Onboarding In Progress
      </h2>
      <p class="text-sm text-gray-600 text-center mb-6">
        Your Google account is verified. Complete seller details to activate your seller dashboard.
      </p>

      <div
        class="border rounded-md px-4 py-3 text-sm mb-6"
        [class.bg-amber-50]="status() !== 'verified'"
        [class.text-amber-800]="status() !== 'verified'"
        [class.border-amber-200]="status() !== 'verified'"
        [class.bg-emerald-50]="status() === 'verified'"
        [class.text-emerald-800]="status() === 'verified'"
        [class.border-emerald-200]="status() === 'verified'"
      >
        Account status:
        <strong>{{ status() === 'verified' ? 'Verified' : 'Pending' }}</strong>
        <span *ngIf="syncing()" class="ml-2 text-xs opacity-80">(syncing...)</span>
      </div>

      <p *ngIf="message()" class="text-xs text-center text-gray-500 mb-4">{{ message() }}</p>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          [routerLink]="['/seller/register']"
          class="inline-flex justify-center px-5 py-2.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 no-underline"
        >
          Complete Seller Registration
        </a>
        <a
          [routerLink]="['/seller/dashboard']"
          class="inline-flex justify-center px-5 py-2.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 no-underline"
        >
          Go to Dashboard
        </a>
        <button
          type="button"
          (click)="syncStatus()"
          [disabled]="syncing()"
          class="inline-flex justify-center px-5 py-2.5 rounded-md border border-indigo-200 text-indigo-700 hover:bg-indigo-50 disabled:opacity-50 cursor-pointer"
        >
          Refresh Status
        </button>
      </div>
    </div>
  `,
})
export class SellerPendingComponent implements OnInit {
  status = signal<'pending' | 'verified'>('pending');
  syncing = signal<boolean>(false);
  message = signal<string>('');

  constructor(
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.syncStatus();
  }

  syncStatus(): void {
    this.syncing.set(true);
    this.message.set('');
    this.paymentService.syncPayoutVerification().subscribe({
      next: (r) => {
        this.syncing.set(false);
        const connected = !!r?.isStripeConnected;
        const payoutStatus = String(r?.payoutVerificationStatus || '').toLowerCase();
        const verified = connected || payoutStatus === 'verified';
        this.status.set(verified ? 'verified' : 'pending');
        if (verified) {
          localStorage.setItem('isStripeConnected', 'true');
          localStorage.setItem('payoutVerificationStatus', 'verified');
          this.message.set('Stripe onboarding is complete. Redirecting to dashboard...');
          setTimeout(() => this.router.navigate(['/seller/dashboard']), 800);
          return;
        }
        this.message.set('Still pending. Complete Stripe onboarding and refresh again.');
      },
      error: () => {
        this.syncing.set(false);
        this.message.set('Unable to refresh verification right now. Please try again.');
      },
    });
  }
}

