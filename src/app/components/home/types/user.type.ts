export interface User {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  email: string;
  password: string;
  stripe_account_id?: string;
  is_stripe_connected?: boolean;
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
}

export interface LoginToken {
  token: string;
  expiresInSeconds: number;
  user: LoggedInUser;
}
