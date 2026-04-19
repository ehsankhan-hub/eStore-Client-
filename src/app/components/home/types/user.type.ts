export interface User {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  email: string;
  password: string;
  role?: 'buyer' | 'seller' | 'admin' | 'user';
  stripe_account_id?: string;
  is_stripe_connected?: boolean;
  /** Seller signup: persisted server-side with payout_verification_status pending until Stripe/admin */
  storeName?: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface LoggedInUser {
  id?: number;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  email: string; //new
  role?: string;
  stripe_account_id?: string;
  is_stripe_connected?: boolean;
  sellerStoreName?: string | null;
  payoutVerificationStatus?: string | null;
}

export interface LoginToken {
  token: string;
  expiresInSeconds: number;
  user: LoggedInUser;
}
