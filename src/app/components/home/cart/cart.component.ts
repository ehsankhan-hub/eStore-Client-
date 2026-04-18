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
  
  private imageBasePath = '/assets/images/'; // Centralize base path

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

  getProgressWidth(): string {
    const step = this.activeStep();
    if (step === 1) return '0%';
    if (step === 2) return '33.33%';
    if (step === 3) return '66.66%';
    return '80%'; // For step 4 it stays at the end of circles
  }

  getImageUrl(imageName: string | undefined): string {
    const placeholder = 'assets/images/shop-1.jpg';
    
    if (!imageName || imageName === 'undefined' || imageName === 'null' || imageName.trim() === '') {
      return placeholder;
    }
    
    // 1. Full URLs
    if (imageName.startsWith('http')) {
      return imageName;
    }

    // 2. Local Assets
    if (imageName.startsWith('assets/') || imageName.startsWith('shop-')) {
      return imageName.startsWith('assets/') ? imageName : `assets/images/${imageName}`;
    }

    // 3. Backend Uploads
    const apiHost = `${API_BASE_URL}/`;
    
    // Remove uploads/ prefix if it already exists to avoid duplication with the apiHost
    const cleanName = imageName.replace(/^uploads\//, '');
    return `${apiHost}uploads/${cleanName}`;
  }

  // Get the first image from galleryImages or fallback to product_img
  getMainImage(cartItem: CartItem): string {
    const product = cartItem.product;
    if (product?.galleryImages && Array.isArray(product.galleryImages) && product.galleryImages.length > 0) {
      return this.getImageUrl(product.galleryImages[0]);
    }
    // Fallback to product_img if galleryImages is empty
    return this.getImageUrl(product?.product_img);
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.onerror = null;
    const placeholder = 'assets/images/shop-1.jpg';
    console.warn('Cart image not found, replaced with placeholder');
    imgElement.src = placeholder;
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
              error: (err) => {
                this.cardProcessing.set(false);
                this.disableCheckout = false;
                this.alertType = 2;
                this.alertMessage = 'Order created but DB sync failed. Contact support.';
              }
            });
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
}
