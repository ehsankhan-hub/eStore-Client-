import { Component, signal } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { CategoryService } from './services/category/category.service';
import { CategoriesStoreItem } from './services/category/categories.storeItem';
import { ProductsStoreItem } from './services/product/products.storeItem';
import { ProductsService } from './services/product/products.service';
import { SearchKeyword } from './types/searchKeyword.type';
import { RouterOutlet } from '@angular/router';
import { CartStoreItem } from './services/cart/cart.storeItem';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { UserService } from './services/user/user.service';
import { OrderService } from './services/order/order.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, faAngleDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Category } from './types/category';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [
    HeaderComponent, 
    RouterOutlet,
    FontAwesomeModule,
    CommonModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  faBars = faBars;
  faAngleDown = faAngleDown;
  faTimes = faTimes;
  
  isSidenavOpen = false;
  expandedCategories = new Set<number>();
  showHotDeals = signal(false);

  constructor(
    private productsStoreItem: ProductsStoreItem,
    private router: Router,
    private categoryStore: CategoriesStoreItem
  ) {
    this.productsStoreItem.loadProducts();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = (event as NavigationEnd).url;
        // Only show Hot Deals on the products page (it's already integrated inside LandingComponent)
        this.showHotDeals.set(url === '/home/products');
      });
  }

  getCategories(parentCategoryId?: number): Category[] {
    return this.categoryStore.categories().filter((category) =>
      parentCategoryId
        ? category.parent_category_id === parentCategoryId
        : category.parent_category_id === null
    );
  }

  toggleCategory(categoryId: number): void {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
  }

  isCategoryExpanded(categoryId: number): boolean {
    return this.expandedCategories.has(categoryId);
  }

  onSubCategoryClick(subCategory: Category): void {
    this.productsStoreItem.loadProducts({ maincategoryid: subCategory.id });
  }

  onSelectCategory(mainCategoryId: number): void {
    this.productsStoreItem.loadProducts({ maincategoryid: mainCategoryId });
  }
  


  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  closeSidenav(): void {
    this.isSidenavOpen = false;
  }
}
