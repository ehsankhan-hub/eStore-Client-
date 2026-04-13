import { Routes } from '@angular/router';
import { SellerComponent } from './seller.component';
import { SellerDashboardComponent } from './dashboard/seller-dashboard.component';
import { SellerRegisterComponent } from './register/seller-register.component';
import { ProductListComponent } from './product/product-list/product-list.component';
import { AddProductComponent } from './product/add-product/add-product.component';
import { OffersComponent } from './offers/offers.component';

export const sellerRoutes: Routes = [
  {
    path: '',
    component: SellerComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: SellerDashboardComponent },
      { path: 'register', component: SellerRegisterComponent },
      { path: 'products', component: ProductListComponent },
      { path: 'add-product', component: AddProductComponent },
      { path: 'offers', component: OffersComponent }
    ]
  }
];
