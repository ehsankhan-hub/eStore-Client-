import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faCreditCard,
  faShoppingBag,
  faHeart,
  faTag,
  faCog,
  faSignOutAlt,
  faEdit,
  faTimes,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { UserService } from '../services/user/user.service';
import { ProfileService, ProfileData } from '../services/profile/profile.service';

@Component({
  selector: 'app-profile-details',
  imports: [FontAwesomeModule],
  templateUrl: './profile-details.component.html',
  styleUrl: './profile-details.component.css',
})
export class ProfileDetailsComponent implements OnInit, OnDestroy {
  faUser = faUser;
  faEnvelope = faEnvelope;
  faPhone = faPhone;
  faMapMarkerAlt = faMapMarkerAlt;
  faCreditCard = faCreditCard;
  faShoppingBag = faShoppingBag;
  faHeart = faHeart;
  faTag = faTag;
  faCog = faCog;
  faSignOutAlt = faSignOutAlt;
  faEdit = faEdit;
  faTimes = faTimes;
  faSpinner = faSpinner;

  isVisible = signal(false);
  isLoading = signal(true);
  error = signal<string | null>(null);
  
  private router = inject(Router);
  private userService = inject(UserService);
  private profileService = inject(ProfileService);

  // Profile data from backend
  profileData = signal<ProfileData | null>(null);

  // Static instance for global access
  static instance: ProfileDetailsComponent | null = null;

  constructor() {
    ProfileDetailsComponent.instance = this;
  }

  static showProfile() {
    if (ProfileDetailsComponent.instance) {
      ProfileDetailsComponent.instance.show();
    }
  }

  static hideProfile() {
    if (ProfileDetailsComponent.instance) {
      ProfileDetailsComponent.instance.hide();
    }
  }

  ngOnInit() {
    // Load profile data when component initializes
    this.loadProfileData();
  }

  loadProfileData() {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.profileService.getProfile().subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.profileData.set(response.data);
          console.log('Profile data loaded:', response.data);
        } else {
          this.error.set(response.message || 'Failed to load profile data');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set('Failed to connect to server');
        console.error('Profile loading error:', err);
      }
    });
  }

  show() {
    console.log('ProfileDetailsComponent.show() called');
    this.isVisible.set(true);
    
    // Refresh data when showing
    if (!this.profileData()) {
      this.loadProfileData();
    }
    
    // Hide sidebar when profile is shown
    document.body.classList.add('profile-open');
  }

  hide() {
    console.log('ProfileDetailsComponent.hide() called');
    this.isVisible.set(false);
    // Show sidebar when profile is hidden
    document.body.classList.remove('profile-open');
  }

  toggle() {
    if (this.isVisible()) {
      this.hide();
    } else {
      this.show();
    }
  }

  // Navigation methods
  navigateToOrders() {
    this.hide();
    this.router.navigate(['/home/orders']);
  }

  navigateToWishlist() {
    this.hide();
    this.router.navigate(['/home/products'], { queryParams: { view: 'wishlist' } });
  }

  navigateToCompare() {
    this.hide();
    this.router.navigate(['/home/products'], { queryParams: { view: 'compare' } });
  }

  navigateToAddress() {
    this.hide();
    this.router.navigate(['/home/address']);
  }

  navigateToPayments() {
    this.hide();
    this.router.navigate(['/home/payments']);
  }

  navigateToSettings() {
    this.hide();
    this.router.navigate(['/home/settings']);
  }

  logout() {
    this.hide();
    this.userService.logout();
  }

  editProfile() {
    console.log('Edit profile clicked');
    // Navigate to edit profile page
    this.hide();
    this.router.navigate(['/home/edit-profile']);
  }

  // Helper methods for template
  getPersonalInfo() {
    return this.profileData()?.personalInfo;
  }

  getShoppingStats() {
    return this.profileData()?.shoppingStats;
  }

  getRecentOrders() {
    return this.profileData()?.recentOrders || [];
  }

  getAccountStatus() {
    return this.profileData()?.accountStatus;
  }

  // Format date helper
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  // Format currency helper
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  // Retry loading profile data
  retryLoading() {
    this.loadProfileData();
  }

  ngOnDestroy() {
    ProfileDetailsComponent.instance = null;
  }
}
