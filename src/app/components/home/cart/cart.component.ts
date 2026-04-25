import { Component, effect, signal, WritableSignal } from '@angular/core';
import { faBoxOpen, faShoppingCart, faTrash, faTruckFast, faShieldHeart, faAward, faClockRotateLeft, faMoneyBillWave, faCreditCard, faCheck, faPlus, faCircle, faCircleCheck, faGift, faChevronRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartStoreItem } from '../services/cart/cart.storeItem';
import { UserService } from '../services/user/user.service';
import { OrderService } from '../services/order/order.service';
import { OrderStore } from '../services/order/order.store';
import { ProductsStoreItem } from '../services/product/products.storeItem';
import { RatingsComponent } from '../../ratings/ratings.component';
import { CartItem } from '../types/cart.type';
import { LoggedInUser } from '../types/user.type';
import { PaymentService } from '../services/payment/payment.service';
import { API_BASE_URL } from '../../../api-url';
import { StripeCardElement, StripeElements } from '@stripe/stripe-js';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

@Component({
  selector: 'app-cart',
  imports: [
    FontAwesomeModule,
    CommonModule,
    ReactiveFormsModule,
    NgClass,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  faTrash = faTrash;
  faBoxOpen = faBoxOpen;
  faShoppingCart = faShoppingCart;
  faTruckFast = faTruckFast;
  faShieldHeart = faShieldHeart;
  faAward = faAward;
  faClockRotateLeft = faClockRotateLeft;
  faMoneyBillWave = faMoneyBillWave;
  faCreditCard = faCreditCard;
  faCheck = faCheck;
  faPlus = faPlus;
  faCircle = faCircle;
  faCircleCheck = faCircleCheck;
  faGift = faGift;
  faChevronRight = faChevronRight;
  faSpinner = faSpinner;
  
  alertType: number = 0; //new
  alertMessage: string = '';
  disableCheckout: boolean = false;
  
  // Multi-step Checkout State
  activeStep = signal<number>(1); // 1: Cart, 2: Delivery, 3: Payment, 4: Success
  
  // Mock Data for "Real-world" feel
  savedAddresses = signal<any[]>([
    { id: 1, name: 'Ehsan Khan', address: '123 Business Bay', city: 'Riyadh', state: 'Riyadh Province', pin: '12211', isDefault: true },
    { id: 2, name: 'Ehsan Ahmad Khan', address: '456 Tech Park, Office 202', city: 'Jeddah', state: 'Makkah Region', pin: '21577', isDefault: false }
  ]);

  savedCards = signal<any[]>([
    { id: 1, type: 'Mastercard', last4: '3561', name: 'Ehsan Ahmad khan', expiry: '02/2030', expired: false, brandImg: 'assets/images/mastercard.png' },
    { id: 2, type: 'Visa', last4: '7595', name: 'Ehsan ahmad khan', expiry: '11/2023', expired: true, brandImg: 'assets/images/visa.png' }
  ]);

  selectedAddressId = signal<number>(1);
  selectedCardId = signal<number>(1);
  showAddCardForm = signal<boolean>(false);
  cardProcessing = signal<boolean>(false);
  selectedPaymentMethod = signal<'stripe' | 'razorpay'>('stripe');

  // Stripe Elements
  private elements: StripeElements | undefined;
  private card: StripeCardElement | undefined;

  user = signal<LoggedInUser>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    pin: '',
    email: '', //new
  });

  orderForm: WritableSignal<FormGroup>;
  addCardForm: FormGroup;

  constructor(
    public cartStore: CartStoreItem,
    private router: Router,
    public userService: UserService,
    private fb: FormBuilder,
    private orderService: OrderService,
    private orderStore: OrderStore,
    private productsStoreItem: ProductsStoreItem,
    private paymentService: PaymentService
  ) {
    this.orderForm = signal(this.createOrderForm(this.savedAddresses()[0]));
    
    this.addCardForm = this.fb.group({
      cardName: ['', Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      expiry: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\\/([0-9]{2})$')]],
      cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]]
    });

    this.userService.loggedInUser$.subscribe((u) => {
       if (u && u.email) this.user.set(u);
    });

    effect(() => {
      // Sync form when address changes
      const currentAddress = this.savedAddresses().find((a: any) => a.id === this.selectedAddressId());
      if (currentAddress) {
        this.orderForm.set(this.createOrderForm(currentAddress));
      }
    });

    effect(async () => {
      // Initialize Stripe when entering Payment step
      if (this.activeStep() === 3) {
        // Wait for next tick to ensure #card-element is in DOM
        setTimeout(async () => {
          const stripe = await this.paymentService.getStripe();
          if (stripe && !this.card) {
            this.elements = stripe.elements();
            this.card = this.elements.create('card', {
              style: {
                base: {
                  fontSize: '16px',
                  color: '#1e293b',
                  fontFamily: '"Outfit", sans-serif',
                  '::placeholder': { color: '#94a3b8' }
                }
              }
            });
            this.card.mount('#card-element');
          }
        }, 100);
      }
    });
  }

  addNewCard() {
    if (this.addCardForm.valid) {
      const newCard = {
        id: this.savedCards().length + 1,
        type: this.addCardForm.value.cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
        last4: this.addCardForm.value.cardNumber.slice(-4),
        name: this.addCardForm.value.cardName,
        expiry: this.addCardForm.value.expiry,
        expired: false,
        brandImg: this.addCardForm.value.cardNumber.startsWith('4') ? 'assets/images/visa.png' : 'assets/images/mastercard.png'
      };
      
      this.savedCards.update(cards => [...cards, newCard]);
      this.selectedCardId.set(newCard.id);
      this.showAddCardForm.set(false);
      this.addCardForm.reset();
    }
  }

  devAutoLogin() {
    console.log('Attempting Dev Auto-Login...');
    const testEmail = 'ehsan@example.com';
    const testPass = '123456';
    
    this.userService.login(testEmail, testPass).subscribe({
      next: (res) => {
        console.log('Login successful!', res);
        this.userService.activateToken(res);
        this.alertType = 1;
        this.alertMessage = 'Dev Login Successful! You can now place your order.';
      },
      error: () => {
        console.log('Login failed, attempting signup...');
        const newUser = {
          firstName: 'Ehsan',
          lastName: 'Khan',
          email: testEmail,
          password: testPass,
          address: '123 Business Bay',
          city: 'Riyadh',
          state: 'Central',
          pin: '12211',
          phone: '0501234567'
        } as any;
        
        this.userService.createUser(newUser).subscribe({
          next: () => {
            console.log('Signup successful, retrying login...');
            this.devAutoLogin();
          },
          error: (err) => {
            console.error('Auto-login failed completely:', err);
            this.alertType = 2;
            this.alertMessage = 'Dev Login failed. Please create an account manually.';
          }
        });
      }
    });
  }

  toggleAddCard() {
    this.showAddCardForm.update(v => !v);
  }

  nextStep() {
    this.disableCheckout = false;
    if (this.activeStep() < 4) {
      this.activeStep.update(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevStep() {
    this.disableCheckout = false;
    if (this.activeStep() > 1) {
      this.activeStep.update(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  selectAddress(id: number) {
    this.selectedAddressId.set(id);
  }

  selectCard(id: number) {
    this.selectedCardId.set(id);
  }

  selectPaymentMethod(method: 'stripe' | 'razorpay') {
    this.selectedPaymentMethod.set(method);
  }

  getProgressWidth(): string {
    const step = this.activeStep();
    if (step === 1) return '0%';
    if (step === 2) return '33.33%';
    if (step === 3) return '66.66%';
    return '80%'; // For step 4 it stays at the end of circles
  }

  getImageUrl(imageName: string | undefined): string {
    const raw = String(imageName || '').trim();
    if (!raw || raw === 'undefined' || raw === 'null') {
      return '';
    }

    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw;
    }

    const normalized = raw.replace(/\\/g, '/').replace(/^\/+/, '');
    const withoutUploadsPrefix = normalized.replace(/^uploads\//i, '');
    const encodedPath = withoutUploadsPrefix
      .split('/')
      .filter(Boolean)
      .map((part) => encodeURIComponent(part))
      .join('/');

    return `${API_BASE_URL}/uploads/${encodedPath}`;
  }

  // Get the first image from galleryImages or fallback to product_img
  getMainImage(cartItem: CartItem): string {
    const product = cartItem.product;
    if (product?.galleryImages && Array.isArray(product.galleryImages) && product.galleryImages.length > 0) {
      const first = product.galleryImages[0] as any;
      const imageName = typeof first === 'string' ? first : (first?.src || first?.imageFiles || first?.url || first?.path);
      return this.getImageUrl(imageName);
    }
    return this.getImageUrl(product?.product_img);
  }

  private parsePrice(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const n = parseFloat(value.replace(/[^0-9.-]/g, ''));
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  }

  getOriginalLineTotal(cartItem: CartItem): number {
    const unitOriginal = this.parsePrice(cartItem?.product?.price);
    return parseFloat((unitOriginal * (cartItem?.quantity || 0)).toFixed(2));
  }

  hasDiscountedPrice(cartItem: CartItem): boolean {
    if (!cartItem?.product) return false;
    const original = this.parsePrice(cartItem.product.price);
    const discounted = this.parsePrice((cartItem.product as any).offer_price);
    return discounted > 0 && discounted < original;
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.onerror = null;
    console.warn('Cart server image failed to load.', { attemptedSrc: imgElement?.src });
  }

  private createOrderForm(data: any): FormGroup {
    const name = data?.name || (data?.firstName && data?.lastName ? `${data.firstName} ${data.lastName}`.trim() : '');
    return this.fb.group({
      name: [name, Validators.required],
      address: [data?.address || '', Validators.required],
      city: [data?.city || '', Validators.required],
      state: [data?.state || '', Validators.required],
      pin: [data?.pin || '', Validators.required],
    });
  }

  navigateToHome(): void {
    this.router.navigate(['home/products']);
  }

  navigateToOrderHistory(): void {
    this.router.navigate(['/home/pastorders']);
  }

  updateQuantity($event: any, cartItem: CartItem): void {
    if ($event.target.innerText === '+') {
      this.cartStore.addProduct(cartItem.product);
    } else if ($event.target.innerText === '-') {
      this.cartStore.decreaseProductQuantity(cartItem);
    }
  }

  removeItem(cartItem: CartItem): void {
    this.cartStore.removeProduct(cartItem);
  }

  onSubmit(): void {
    if (!this.userService.isAuthenticated() && !this.user()?.email) {
      this.alertType = 2;
      this.alertMessage = 'Please log in to place an order.';
      return;
    }

    const form = this.orderForm();
    if (form.invalid) {
      this.alertType = 2;
      this.alertMessage = 'Please fill out all shipping details.';
      form.markAllAsTouched();
      return;
    }

    if (this.selectedPaymentMethod() === 'razorpay') {
      this.startRazorpayCheckout(form);
      return;
    }

    if (!this.card) {
      this.alertType = 2;
      this.alertMessage = 'Payment module not initialized. Please try again.';
      return;
    }

    this.cardProcessing.set(true);
    this.disableCheckout = true;

    const lines = this.cartStore.cart().products.map((item) => ({
      productId: item.product.id,
      qty: item.quantity,
    }));

    // 1. Create Payment Intent (amount computed on server from lines)
    this.paymentService.createPaymentIntent(lines).subscribe({
      next: (clientSecret) => {
        // 2. Confirm Payment with Stripe
        this.paymentService.confirmCardPayment(clientSecret, this.card!).subscribe({
          next: (paymentIntent) => {
            console.log('Payment Successful!', paymentIntent);
            
            // 3. Create actual order in DB
            this.finalizeSuccessfulOrder(form);
          },
          error: (stripeErr) => {
            this.cardProcessing.set(false);
            this.disableCheckout = false;
            this.alertType = 2;
            this.alertMessage = stripeErr.message || 'Payment failed. Please check your card.';
          }
        });
      },
      error: (intentErr) => {
        this.cardProcessing.set(false);
        this.disableCheckout = false;
        this.alertType = 2;
        this.alertMessage = 'Could not contact payment server.';
      }
    });
  }

  private async startRazorpayCheckout(form: FormGroup): Promise<void> {
    if (!this.userService.isAuthenticated() && !this.user()?.email) {
      this.alertType = 2;
      this.alertMessage = 'Please log in to place an order.';
      return;
    }

    this.cardProcessing.set(true);
    this.disableCheckout = true;

    const lines = this.cartStore.cart().products.map((item) => ({
      productId: item.product.id,
      qty: item.quantity,
    }));

    try {
      await this.ensureRazorpayLoaded();
    } catch {
      this.cardProcessing.set(false);
      this.disableCheckout = false;
      this.alertType = 2;
      this.alertMessage = 'Could not load Razorpay checkout.';
      return;
    }

    this.paymentService.createRazorpayOrder(lines, 'INR').subscribe({
      next: (res) => {
        if (!res?.id || !res?.keyId || !res?.amount) {
          this.cardProcessing.set(false);
          this.disableCheckout = false;
          this.alertType = 2;
          this.alertMessage =
            res?.message ||
            'Unable to start Razorpay checkout.';
          return;
        }

        const options = {
          key: res.keyId,
          amount: res.amount,
          currency: res.currency || 'INR',
          name: 'eStore',
          description: 'Order payment',
          order_id: res.id,
          prefill: {
            name: form.get('name')?.value || '',
            email: this.user()?.email || '',
          },
          theme: { color: '#2563eb' },
          handler: (response: any) => {
            this.paymentService.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }).subscribe({
              next: () => this.finalizeSuccessfulOrder(form),
              error: (verifyErr) => {
                this.cardProcessing.set(false);
                this.disableCheckout = false;
                this.alertType = 2;
                this.alertMessage =
                  verifyErr?.error?.message || 'Razorpay payment verification failed.';
              },
            });
          },
          modal: {
            ondismiss: () => {
              this.cardProcessing.set(false);
              this.disableCheckout = false;
              this.alertType = 2;
              this.alertMessage = 'Payment was cancelled.';
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      },
      error: (err) => {
        this.cardProcessing.set(false);
        this.disableCheckout = false;
        this.alertType = 2;
        this.alertMessage =
          err?.error?.message || 'Could not start Razorpay checkout at this time.';
      },
    });
  }

  private finalizeSuccessfulOrder(form: FormGroup): void {
    const deliveryAddress = {
      userName: form.get('name')?.value,
      address: form.get('address')?.value,
      city: form.get('city')?.value,
      state: form.get('state')?.value,
      pin: form.get('pin')?.value,
    };

    const email = this.user()?.email;
    this.orderStore.createOrder(deliveryAddress, email).subscribe({
      next: () => {
        this.cartStore.clearCart();
        this.cardProcessing.set(false);
        this.nextStep();
        setTimeout(() => this.productsStoreItem.loadProducts(), 500);
      },
      error: () => {
        this.cardProcessing.set(false);
        this.disableCheckout = false;
        this.alertType = 2;
        this.alertMessage = 'Order created but DB sync failed. Contact support.';
      },
    });
  }

  private ensureRazorpayLoaded(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }
      const existing = document.querySelector('script[data-razorpay="checkout"]') as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.setAttribute('data-razorpay', 'checkout');
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    });
  }
}
