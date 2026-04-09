import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { CatnavigationComponent } from './catnavigation/catnavigation.component';
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
    CatnavigationComponent, 
    RouterOutlet,
    FontAwesomeModule,
    CommonModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [
    CategoryService,
    CategoriesStoreItem,
    ProductsStoreItem,
    ProductsService,
    CartStoreItem,
    UserService,
    OrderService,
  ],
})
export class HomeComponent {
  faBars = faBars;
  faAngleDown = faAngleDown;
  faTimes = faTimes;
  
  isSidenavOpen = false;
  expandedCategories = new Set<number>();

  constructor(
    private productsStoreItem: ProductsStoreItem,
    private router: Router,
    private categoryStore: CategoriesStoreItem
  ) {
    this.productsStoreItem.loadProducts();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        if ((event as NavigationEnd).url === '/home') {
          this.router.navigate(['/home/products']);
        }
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
  
  onSearchKeyword(searchKeyword: SearchKeyword): void {
    this.productsStoreItem.loadProducts({
      maincategoryid: searchKeyword.categoryId,
      keyword: searchKeyword.keyword,
    });
  }

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  closeSidenav(): void {
    this.isSidenavOpen = false;
  }
}
