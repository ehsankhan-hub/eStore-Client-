import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface PersonalInfo {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  memberSince: string;
}

export interface ShoppingStats {
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  wishlistItems: number;
  compareItems: number;
}

export interface RecentOrder {
  id: number;
  orderId: string;
  amount: number;
  status: string;
  date: string;
}

export interface AccountStatus {
  accountType: string;
  verificationStatus: string;
  memberLevel: string;
}

export interface ProfileData {
  personalInfo: PersonalInfo;
  shoppingStats: ShoppingStats;
  recentOrders: RecentOrder[];
  accountStatus: AccountStatus;
}

export interface ProfileResponse {
  success: boolean;
  data: ProfileData;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly apiUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5004/api/users'
    : 'http://192.168.1.21:5004/api/users';
  
  // Signals for reactive state management
  profileData = signal<ProfileData | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  
  constructor(private http: HttpClient) {}
  
  /**
   * Get user profile data from backend
   */
  getProfile(): Observable<ProfileResponse> {
    this.isLoading.set(true);
    this.error.set(null);
    
    // Get user email from localStorage
    const userEmail = localStorage.getItem('email');
    
    if (!userEmail) {
      this.error.set('User not authenticated');
      this.isLoading.set(false);
      return new Observable(observer => {
        observer.error('User not authenticated');
        observer.complete();
      });
    }
    
    return this.http.get<ProfileResponse>(`${this.apiUrl}/profile?email=${encodeURIComponent(userEmail)}`).pipe(
      map(response => {
        this.isLoading.set(false);
        if (response.success) {
          this.profileData.set(response.data);
        } else {
          this.error.set(response.message || 'Failed to load profile data');
        }
        return response;
      })
    );
  }
  
  /**
   * Update user profile data
   */
  updateProfile(profileData: Partial<PersonalInfo>): Observable<any> {
    this.isLoading.set(true);
    this.error.set(null);
    
    return this.http.put(`${this.apiUrl}/profile`, profileData).pipe(
      map(response => {
        this.isLoading.set(false);
        return response;
      })
    );
  }
  
  /**
   * Get profile data synchronously (from signal)
   */
  getProfileData(): ProfileData | null {
    return this.profileData();
  }
  
  /**
   * Get loading state
   */
  getLoadingState(): boolean {
    return this.isLoading();
  }
  
  /**
   * Get error message
   */
  getError(): string | null {
    return this.error();
  }
  
  /**
   * Clear error state
   */
  clearError(): void {
    this.error.set(null);
  }
  
  /**
   * Refresh profile data
   */
  refreshProfile(): Observable<ProfileResponse> {
    return this.getProfile();
  }
}
