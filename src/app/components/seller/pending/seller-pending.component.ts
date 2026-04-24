import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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

      <div class="bg-amber-50 text-amber-800 border border-amber-200 rounded-md px-4 py-3 text-sm mb-6">
        Account status: <strong>Pending</strong>
      </div>

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
      </div>
    </div>
  `,
})
export class SellerPendingComponent {}

