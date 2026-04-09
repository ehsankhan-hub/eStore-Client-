import { Component, inject, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, faAngleDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Category } from '../types/category';
import { CategoriesStoreItem } from '../services/category/categories.storeItem';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-material-sidenav',
  imports: [
    FontAwesomeModule,
    CommonModule
  ],
  templateUrl: './material-sidenav.component.html',
  styleUrl: './material-sidenav.component.css',
})
export class MaterialSidenavComponent {
  faBars = faBars;
  faAngleDown = faAngleDown;
  faTimes = faTimes;
  private categoryStore = inject(CategoriesStoreItem);

  readonly categories = this.categoryStore.categories;
  readonly subCategoryClicked = output<number>();
  readonly toggleSidenav = output<void>();

  isSidenavOpen = false;
  expandedCategories = new Set<number>();

  getCategories(parentCategoryId?: number): Category[] {
    return this.categories().filter((category) =>
      parentCategoryId
        ? category.parent_category_id === parentCategoryId
        : category.parent_category_id === null
    );
  }

  onSubCategoryClick(subCategory: Category): void {
    this.subCategoryClicked.emit(subCategory.id);
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

  toggleSidenavVisibility(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  closeSidenav(): void {
    this.isSidenavOpen = false;
  }

  onToggleButtonClick(): void {
    this.toggleSidenavVisibility();
    this.toggleSidenav.emit();
  }
}
