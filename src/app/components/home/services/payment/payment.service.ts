import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, map, switchMap, catchError, throwError } from 'rxjs';
import { loadStripe, Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js';
import { UserService } from '../user/user.service';
import { API_BASE_URL } from '../../../../api-url';

/** Response from POST /payments/sync-payout-verification */
export interface SyncPayoutVerificationResponse {
  mock?: boolean;
  updated?: boolean;
  message?: string;
  isStripeConnected?: boolean;
  payoutVerificationStatus?: string | null;
  detailsSubmitted?: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private stripePromise: Promise<Stripe | null>;
  // YOUR PUBLIC STRIPE KEY (Placeholder)
  private publishableKey = 'pk_test_51RYrfkPt4WH3BimtsPfCeCYW86qGyJSH1joQqfQDUnLTQtEHZI4ZJ81vDD51A8mWDVPMe3DqLzNwxpHONWEnXUfj000pkGkdHX';

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {
    this.stripePromise = loadStripe(this.publishableKey);
  }

  // 1. Create PaymentIntent on the Server (amount derived from lines — not client totals)
  createPaymentIntent(
    lines: { productId: number; qty: number }[],
    currency: string = 'usd'
  ): Observable<string> {
    const url = `${API_BASE_URL}/payments/create-intent`;
    const authToken = this.userService.authToken();
    const headers = new HttpHeaders().set('Authorization', authToken || '');

    return this.http.post<{ clientSecret: string }>(url, { lines, currency }, { headers })
      .pipe(
        map(res => res.clientSecret),
        catchError(err => {
          console.error('PaymentService: Error creating intent', err);
          return throwError(() => err);
        })
      );
  }

  // 2. Initialize Stripe Elements
  async getStripe() {
    return await this.stripePromise;
  }

  // 3. Confirm Payment
  /** After Stripe Connect return URL — refreshes is_stripe_connected / payout verification. */
  syncPayoutVerification(): Observable<SyncPayoutVerificationResponse> {
    const url = `${API_BASE_URL}/payments/sync-payout-verification`;
    const headers = new HttpHeaders().set('Authorization', this.userService.authToken() || '');
    return this.http.post<SyncPayoutVerificationResponse>(url, {}, { headers });
  }

  /** Masked seller payout summary (no full account numbers). */
  getPayoutProfile(): Observable<Record<string, unknown>> {
    const url = `${API_BASE_URL}/payments/payout-profile`;
    const headers = new HttpHeaders().set('Authorization', this.userService.authToken() || '');
    return this.http.get<Record<string, unknown>>(url, { headers });
  }

  /** Start (or continue) Stripe Connect onboarding and return hosted link. */
  startSellerOnboarding(): Observable<{ url: string }> {
    const url = `${API_BASE_URL}/payments/onboard-seller`;
    const headers = new HttpHeaders().set('Authorization', this.userService.authToken() || '');
    return this.http.post<{ url: string }>(url, {}, { headers });
  }

  confirmCardPayment(clientSecret: string, cardElement: StripeCardElement): Observable<any> {
    // MOCK FLOW: If secret is from our mock mode, simulate immediate success
    if (clientSecret.startsWith('pi_mock_')) {
      return from(new Promise(resolve => setTimeout(() => resolve({ 
        id: clientSecret,
        status: 'succeeded' 
      }), 1000)));
    }

    return from(this.getStripe()).pipe(
      switchMap(stripe => {
        if (!stripe) return throwError(() => new Error('Stripe not loaded'));

        return from(stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: this.userService.loggedInUserInfo().email || 'Guest'
            }
          }
        }));
      }),
      map(result => {
        if (result.error) {
          throw result.error;
        }
        return result.paymentIntent;
      })
    );
  }
}
