import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-offer-grid',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './offer-grid.component.html',
  styleUrl: './offer-grid.component.css'
})
export class OfferGridComponent {
  private router = inject(Router);

  offers = [
    {
      title: 'Top Electronics Deals',
      image: 'assets/images/cat-electronics.jpg',
      linkText: 'See more',
      link: '/home/products',
      params: { maincategoryid: 1 }
    },
    {
      title: 'Latest Fashion Trends',
      image: 'assets/images/cat-fashion.jpg',
      linkText: 'Explore',
      link: '/home/products',
      params: { maincategoryid: 2 }
    },
    {
      title: 'New Smartphone Arrivals',
      image: 'assets/images/cat-phones.jpg',
      linkText: 'Shop now',
      link: '/home/products',
      params: { maincategoryid: 1, keyword: 'phone' }
    },
    {
      title: 'Home & Kitchen Essentials',
      image: 'assets/images/cat-electronics.jpg', // Using electronics again since cat-home.jpg is missing
      linkText: 'View more',
      link: '/home/products',
      params: { maincategoryid: 4 }
    }
  ];

  navigateToOffer(offer: any) {
    this.router.navigate([offer.link], { queryParams: offer.params });
  }
}
