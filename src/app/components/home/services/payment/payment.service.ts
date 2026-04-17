import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, map, switchMap, catchError, throwError } from 'rxjs';
import { loadStripe, Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js';
import { UserService } from '../user/user.service';

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

  // 1. Create PaymentIntent on the Server
  createPaymentIntent(amount: number, currency: string = 'usd'): Observable<string> {
    const url = 'http://localhost:5004/api/payments/create-intent';
    const authToken = this.userService.authToken();
    const headers = new HttpHeaders().set('Authorization', authToken || '');

    return this.http.post<{ clientSecret: string }>(url, { amount, currency }, { headers })
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
