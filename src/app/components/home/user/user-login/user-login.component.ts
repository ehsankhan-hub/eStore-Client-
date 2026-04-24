import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { LoginToken } from '../../types/user.type';
import { NgClass } from '@angular/common';
import { Location } from '@angular/common';
import { FirebaseService } from '../../../../services/firebase.service';

@Component({
  selector: 'app-user-login',
  imports: [ReactiveFormsModule, RouterLink, NgClass],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css',
})
export class UserLoginComponent implements OnInit {
  userLoginForm: FormGroup;
  alertType: number = 0;
  alertMessage: string = '';
  socialLoadingProvider: 'google' | 'github' | 'facebook' | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private location: Location,
    private firebaseService: FirebaseService
  ) {
    this.userLoginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  get email(): AbstractControl<any, any> | null {
    return this.userLoginForm.get('email');
  }
  get password(): AbstractControl<any, any> | null {
    return this.userLoginForm.get('password');
  }

  ngOnInit(): void {
    this.handleRedirectLoginResult();
  }

  onSubmit(): void {
    if (this.userLoginForm.invalid) {
      this.alertMessage = 'Please fill both email and password.';
      this.alertType = 1;
      this.userLoginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.userLoginForm.value;

    this.userLoginForm.disable();

    this.userService.login(email, password).subscribe({
      next: (result: LoginToken) => {
        this.userLoginForm.enable();

        if (result.token) {
          result.user.email = this.email?.value; //new
          this.userService.activateToken(result); //new
          this.alertMessage = 'Login successful';
          this.alertType = 0;
          this.userLoginForm.reset();
        } else {
          this.alertMessage = 'Invalid login attempt.';
          this.alertType = 1;
        }
        setTimeout(() => {
          this.location.back();
        }, 1000);
      },
      error: (err) => {
        this.userLoginForm.enable();
        this.alertMessage =
          err.error?.message || 'Login failed. Please try again.';
        this.alertType = 2;
      },
    });
  }

  async onSocialLogin(provider: 'google' | 'github' | 'facebook'): Promise<void> {
    if (!this.firebaseService.isConfigured()) {
      this.alertMessage =
        'Social sign-in needs your real Firebase Web config. Firebase Console → Project settings → Your apps → copy the full `firebaseConfig` into `src/environments/environment.ts` (the `firebase` object), then restart the dev server.';
      this.alertType = 2;
      return;
    }
    this.socialLoadingProvider = provider;
    try {
      const socialUser = await this.firebaseService.loginWithSocialProvider(provider);
      if (!socialUser) {
        this.alertMessage = 'Redirecting to secure sign-in...';
        this.alertType = 0;
        return;
      }
      this.finishSocialLogin(provider, socialUser);
    } catch (err: any) {
      this.alertMessage = this.getSocialLoginError(err);
      this.alertType = 2;
    } finally {
      this.socialLoadingProvider = null;
    }
  }

  private async handleRedirectLoginResult(): Promise<void> {
    try {
      const redirectUser = await this.firebaseService.getRedirectSocialLoginResult();
      if (!redirectUser) return;
      const providerId = redirectUser.providerData?.[0]?.providerId || '';
      const provider = this.getProviderKey(providerId);
      if (!provider) return;
      this.finishSocialLogin(provider, redirectUser);
    } catch (err: any) {
      this.alertMessage = this.getSocialLoginError(err);
      this.alertType = 2;
    }
  }

  private finishSocialLogin(provider: 'google' | 'github' | 'facebook', socialUser: any): void {
      const email = socialUser.email || '';
      if (!email) {
        this.alertMessage = 'Social account has no email. Please use another account.';
        this.alertType = 1;
        return;
      }

      const [firstName, ...rest] = (socialUser.displayName || '').trim().split(' ');
      const lastName = rest.join(' ').trim();

      this.userService
        .socialLogin({
          email,
          firstName: firstName || 'User',
          lastName: lastName || provider,
          provider,
          providerUid: socialUser.uid,
          expectedRole: 'buyer',
        })
        .subscribe({
          next: (result: LoginToken) => {
            if (result.token) {
              result.user.email = email;
              this.userService.activateToken(result);
              this.alertMessage = 'Login successful';
              this.alertType = 0;
              setTimeout(() => this.location.back(), 1000);
            } else {
              this.alertMessage = 'Social login failed.';
              this.alertType = 1;
            }
          },
          error: (err) => {
            this.alertMessage =
              err.error?.message || 'Social login failed. Please try again.';
            this.alertType = 2;
          },
        });
  }

  private getProviderKey(providerId: string): 'google' | 'github' | 'facebook' | null {
    if (providerId.includes('google')) return 'google';
    if (providerId.includes('github')) return 'github';
    if (providerId.includes('facebook')) return 'facebook';
    return null;
  }

  private getSocialLoginError(err: any): string {
    const code = err?.code || '';
    if (code === 'auth/operation-not-allowed') {
      return 'Provider is not enabled in Firebase Authentication.';
    }
    if (code === 'auth/unauthorized-domain') {
      return 'Current domain is not authorized in Firebase settings.';
    }
    if (code === 'auth/invalid-api-key') {
      return 'Firebase API key is invalid. Paste the Web app config from Firebase Console into `environment.ts` / `environment.prod.ts` (all six `firebase` fields must match one Web app).';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Sign-in popup was closed before completing login.';
    }
    if (code === 'auth/popup-blocked') {
      return 'Popup blocked by browser. Allow popups and try again.';
    }
    return err?.message || 'Social login failed. Please try again.';
  }
}
