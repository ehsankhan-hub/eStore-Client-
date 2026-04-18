import { Component, effect, output, signal, inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faUserCircle,
  faShoppingCart,
  faChevronDown,
  faHeart,
  faTag,
  faEye,
  faShoppingBag,
  faSignOutAlt,
  faUser,
  faCog,
  faMapMarkerAlt,
  faHeadset,
  faPhone,
  faEnvelope,
  faGlobe,
  faMobileAlt,
  faUndo,
  faCreditCard,
  faCoins,
  faShieldAlt,
  faQuestionCircle,
  faBars,
} from '@fortawesome/free-solid-svg-icons';
import { CategoriesStoreItem } from '../services/category/categories.storeItem';
import { Category } from '../types/category';
import { SearchKeyword } from '../types/searchKeyword.type';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
} from '@angular/router';
import { filter } from 'rxjs';
import { CartStoreItem } from '../services/cart/cart.storeItem';
import { UserService } from '../services/user/user.service';
import { LoggedInUser } from '../types/user.type';
import { ProfileDetailsComponent } from '../profile-details/profile-details.component';

@Component({
  selector: 'app-header',
  imports: [FontAwesomeModule, RouterLink, ProfileDetailsComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements AfterViewInit {
  @ViewChild('profileDetails') profileDetails!: ProfileDetailsComponent;

  faSearch = faSearch;
  faUserCircle = faUserCircle;
  faShoppingCart = faShoppingCart;
  faChevronDown = faChevronDown;
  faHeart = faHeart;
  faTag = faTag;
  faEye = faEye;
  faShoppingBag = faShoppingBag;
  faSignOutAlt = faSignOutAlt;
  faUser = faUser;
  faCog = faCog;
  faMapMarkerAlt = faMapMarkerAlt;
  faHeadset = faHeadset;
  faPhone = faPhone;
  faEnvelope = faEnvelope;
  faGlobe = faGlobe;
  faMobileAlt = faMobileAlt;
  faUndo = faUndo;
  faCreditCard = faCreditCard;
  faCoins = faCoins;
  faShieldAlt = faShieldAlt;
  faQuestionCircle = faQuestionCircle;
  faBars = faBars;

  dropdownVisible = signal(false);
  myAccountSubmenuVisible = signal(false);
  toggleDropdown = () => this.dropdownVisible.update((val) => !val);
  toggleMyAccountSubmenu = () => this.myAccountSubmenuVisible.update((val) => !val);

  showProfile() {
    console.log('showProfile() called');
    // Use the static method to show the profile
    ProfileDetailsComponent.showProfile();
  }

  readonly searchClicked = output<SearchKeyword>();
  readonly menuClicked = output<void>();
  displaySearch = signal(true);

  isUserAuthenticated = signal(false);
  isAdmin = signal(false);
  userName = signal('');
  loggedInUser = signal<LoggedInUser>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    pin: '',
    email: '',
  });

  private router = inject(Router);
  private userService = inject(UserService);
  public categoryStore = inject(CategoriesStoreItem);
  public cart = inject(CartStoreItem);
  private route = inject(ActivatedRoute);

  constructor() {
    this.displaySearch.set(this.router.url.startsWith('/home/products'));

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.displaySearch.set(event.url.startsWith('/home/products'));
      });

    // Initialize authentication state and user data from UserService
    this.isUserAuthenticated.set(this.userService.isAuthenticated());
    this.loggedInUser.set(this.userService.loggedInUserInfo());
    this.isAdmin.set(this.userService.loggedInUserInfo().role === 'admin');

    // Update the userName signal whenever loggedInUser changes
    effect(() => {
      const isAuth = this.userService.isAuthenticated();
      this.isUserAuthenticated.set(isAuth);

      const user = this.userService.loggedInUserInfo();
      this.loggedInUser.set(user);
      this.isAdmin.set(user.role === 'admin');

      if (isAuth) {
        this.userName.set(user.firstName);
      } else {
        this.userName.set('');
        this.isAdmin.set(false);
      }
    });
  }

  navigateToAdmin(): void {
    this.dropdownVisible.set(false);
    this.router.navigate(['/admin']);
  }

  onClickSearch(keyword: string, categoryIdInput: string): void {
    const categoryId = categoryIdInput === '0' ? null : categoryIdInput;
    // Navigate to the products page with the search parameters
    this.router.navigate(['/home/products'], {
      queryParams: {
        keyword: keyword,
        maincategoryid: categoryId,
      },
    });
  }

  onCategoryClick(mainCategory: Category) {
    this.router.navigate(['/home/products'], {
      queryParams: { maincategoryid: mainCategory.id },
    });
  }

  navigateToCart(): void {
    this.router.navigate(['home/cart']);
  }

  pastOrders(): void {
    this.dropdownVisible.set(false);
    this.router.navigate(['home/pastorders']);
  }

  logout(): void {
    this.dropdownVisible.set(false);
    this.userService.logout();
  }

  // New methods for product features
  navigateToWishlist(): void {
    this.dropdownVisible.set(false);
    // Navigate to wishlist page or show wishlist modal
    console.log('Navigate to wishlist');
    // For now, navigate to products with wishlist filter
    this.router.navigate(['home/products'], { queryParams: { view: 'wishlist' } });
  }

  navigateToCompare(): void {
    this.dropdownVisible.set(false);
    // Navigate to compare page or show compare modal
    console.log('Navigate to compare');
    // For now, navigate to products with compare view
    this.router.navigate(['home/products'], { queryParams: { view: 'compare' } });
  }

  navigateToQuickView(): void {
    this.dropdownVisible.set(false);
    // Show quick view of recently viewed products
    console.log('Navigate to quick view');
    // For now, navigate to products
    this.router.navigate(['home/products']);
  }

  // Count methods for badges
  wishlistCount(): number {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      return wishlist.length;
    } catch {
      return 0;
    }
  }

  compareCount(): number {
    try {
      const compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
      return compareList.length;
    } catch {
      return 0;
    }
  }

  // New navigation methods for My Account submenu
  navigateToOrders(): void {
    this.myAccountSubmenuVisible.set(false);
    this.dropdownVisible.set(false);
    console.log('Navigate to Orders');
    this.router.navigate(['home/orders']);
  }

  navigateToReturns(): void {
    this.myAccountSubmenuVisible.set(false);
    this.dropdownVisible.set(false);
    console.log('Navigate to Returns');
    this.router.navigate(['home/returns']);
  }

  navigateToAddress(): void {
    this.myAccountSubmenuVisible.set(false);
    this.dropdownVisible.set(false);
    console.log('Navigate to Address');
    this.router.navigate(['home/address']);
  }

  navigateToPayments(): void {
    this.myAccountSubmenuVisible.set(false);
    this.dropdownVisible.set(false);
    console.log('Navigate to Payments');
    this.router.navigate(['home/payments']);
  }

  navigateToNoonCredits(): void {
    this.myAccountSubmenuVisible.set(false);
    this.dropdownVisible.set(false);
    console.log('Navigate to noon credits');
    this.router.navigate(['home/noon-credits']);
  }

  navigateToWarrantyClaims(): void {
    this.myAccountSubmenuVisible.set(false);
    this.dropdownVisible.set(false);
    console.log('Navigate to Warranty claims');
    this.router.navigate(['home/warranty-claims']);
  }

  navigateToNeedHelp(): void {
    this.myAccountSubmenuVisible.set(false);
    this.dropdownVisible.set(false);
    console.log('Navigate to Need help');
    this.router.navigate(['home/need-help']);
  }

  // New navigation methods for additional menu items
  navigateToMyAccount(): void {
    this.dropdownVisible.set(false);
    console.log('Navigate to my account');
    // Navigate to account profile page
    this.router.navigate(['home/account']);
  }

  navigateToStoreLocator(): void {
    this.dropdownVisible.set(false);
    console.log('Navigate to store locator');
    // Navigate to store locator page
    this.router.navigate(['home/store-locator']);
  }

  navigateToCustomerService(): void {
    this.dropdownVisible.set(false);
    console.log('Navigate to customer service');
    // Navigate to customer service page
    this.router.navigate(['home/customer-service']);
  }

  navigateToContactUs(): void {
    this.dropdownVisible.set(false);
    console.log('Navigate to contact us');
    // Navigate to contact page
    this.router.navigate(['home/contact']);
  }

  navigateToSubscribe(): void {
    this.dropdownVisible.set(false);
    console.log('Navigate to subscribe');
    // Navigate to newsletter subscription page
    this.router.navigate(['home/subscribe']);
  }

  navigateToMobileApp(): void {
    this.dropdownVisible.set(false);
    console.log('Navigate to mobile app');
    // Navigate to mobile app download page
    this.router.navigate(['home/mobile-app']);
  }

  navigateToInternational(): void {
    this.dropdownVisible.set(false);
    console.log('Navigate to international');
    // Navigate to international shipping page
    this.router.navigate(['home/international']);
  }

  ngAfterViewInit(): void {
    console.log('Header component initialized, profileDetails:', this.profileDetails);
  }
}
