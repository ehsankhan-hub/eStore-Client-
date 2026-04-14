import { Component } from '@angular/core';
import { HeroSliderComponent } from './hero-slider/hero-slider.component';
import { OfferGridComponent } from './offer-grid/offer-grid.component';
import { HotDealsComponent } from '../hot-deals/hot-deals.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, HeroSliderComponent, OfferGridComponent, HotDealsComponent],
  template: `
    <div class="landing-container">
      <!-- Hero Slider Section -->
      <app-hero-slider></app-hero-slider>
      
      <!-- Primary Offers Grid (Overlapping Hero) -->
      <div class="max-w-[1500px] mx-auto px-6 -mt-36 relative z-10 pb-8">
        <app-offer-grid></app-offer-grid>
      </div>

      <!-- Secondary Content Area -->
      <div class="max-w-[1500px] mx-auto px-6 space-y-8 pb-12">
        <!-- Hot Deals Section -->
        <app-hot-deals></app-hot-deals>
        
        <!-- Additional banners can go here later -->
      </div>
    </div>
  `,
  styles: [`
    .landing-container {
      background-color: #eaeded;
      min-height: 100vh;
    }
  `]
})
export class LandingComponent {}
