import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService, SyncPayoutVerificationResponse } from '../../home/services/payment/payment.service';

@Component({
  selector: 'app-seller-payout-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="max-w-5xl mx-auto">
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 shadow-2xl mb-8">
        <p class="text-[11px] uppercase tracking-[0.25em] text-indigo-300 font-black">Payout Settings</p>
        <h1 class="text-3xl font-black mt-2">Stripe Treasury Console</h1>
        <p class="text-indigo-100 mt-2 text-sm">
          Manage payout readiness, sync verification, and continue Stripe onboarding.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p class="text-xs uppercase tracking-widest text-gray-400 font-black">Details Submitted</p>
          <p class="mt-2 text-2xl font-black" [class.text-emerald-600]="detailsSubmitted()" [class.text-rose-500]="!detailsSubmitted()">
            {{ detailsSubmitted() ? 'Yes' : 'No' }}
          </p>
        </div>
        <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p class="text-xs uppercase tracking-widest text-gray-400 font-black">Charges Enabled</p>
          <p class="mt-2 text-2xl font-black" [class.text-emerald-600]="chargesEnabled()" [class.text-rose-500]="!chargesEnabled()">
            {{ chargesEnabled() ? 'Yes' : 'No' }}
          </p>
        </div>
        <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p class="text-xs uppercase tracking-widest text-gray-400 font-black">Payouts Enabled</p>
          <p class="mt-2 text-2xl font-black" [class.text-emerald-600]="payoutsEnabled()" [class.text-rose-500]="!payoutsEnabled()">
            {{ payoutsEnabled() ? 'Yes' : 'No' }}
          </p>
        </div>
      </div>

      <div class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-widest text-gray-400 font-black">Verification Status</p>
            <p class="text-xl font-black mt-1"
               [class.text-emerald-600]="isStripeConnected()"
               [class.text-amber-600]="!isStripeConnected()">
              {{ isStripeConnected() ? 'Payouts Active' : 'Payouts Pending' }}
            </p>
            <p class="text-sm text-gray-500 mt-2">{{ statusMessage() }}</p>
          </div>
          <div class="flex gap-3">
            <button
              (click)="refreshStatus()"
              [disabled]="syncing()"
              class="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 font-semibold"
            >
              {{ syncing() ? 'Syncing...' : 'Refresh Status' }}
            </button>
            <button
              (click)="openStripeOnboarding()"
              [disabled]="onboarding()"
              class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 font-semibold shadow-sm"
            >
              {{ onboarding() ? 'Opening...' : (isStripeConnected() ? 'Manage Stripe' : 'Connect Stripe') }}
            </button>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class SellerPayoutSettingsComponent implements OnInit {
  syncing = signal(false);
  onboarding = signal(false);
  detailsSubmitted = signal(false);
  chargesEnabled = signal(false);
  payoutsEnabled = signal(false);
  isStripeConnected = signal(false);
  statusMessage = signal('Sync your status to view latest Stripe verification flags.');

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.refreshStatus();
  }

  refreshStatus(): void {
    this.syncing.set(true);
    this.paymentService.syncPayoutVerification().subscribe({
      next: (r: SyncPayoutVerificationResponse) => {
        this.syncing.set(false);
        if (r.mock) {
          this.statusMessage.set(r.message || 'Stripe is not configured.');
          return;
        }
        this.detailsSubmitted.set(!!r.detailsSubmitted);
        this.chargesEnabled.set(!!r.chargesEnabled);
        this.payoutsEnabled.set(!!r.payoutsEnabled);
        this.isStripeConnected.set(!!r.isStripeConnected);
        this.statusMessage.set(
          r.isStripeConnected
            ? 'Seller payout profile is fully active.'
            : 'Complete Stripe requirements to activate payouts.'
        );
      },
      error: (err) => {
        this.syncing.set(false);
        this.statusMessage.set(err?.error?.message || 'Could not sync payout status.');
      },
    });
  }

  openStripeOnboarding(): void {
    this.onboarding.set(true);
    this.paymentService.startSellerOnboarding().subscribe({
      next: (res) => {
        window.location.href = res.url;
      },
      error: (err) => {
        this.onboarding.set(false);
        this.statusMessage.set(err?.error?.message || 'Unable to open Stripe onboarding.');
      },
    });
  }
}

