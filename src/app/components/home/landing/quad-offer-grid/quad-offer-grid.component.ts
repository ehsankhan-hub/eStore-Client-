import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-quad-offer-grid',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quad-offer-grid.component.html',
  styleUrl: './quad-offer-grid.component.css'
})
export class QuadOfferGridComponent {
  private router = inject(Router);

  quadOffers = [
    {
      title: 'Continue shopping deals',
      linkText: 'See more deals',
      link: '/home/products',
      params: { maincategoryid: 1 },
      items: [
        { name: 'Phones', image: 'assets/images/cat-phones.jpg' },
        { name: 'Electronics', image: 'assets/images/cat-electronics.jpg' },
        { name: 'Accessories', image: 'assets/images/permotion3.jpg' },
        { name: 'Gadgets', image: 'assets/images/hero-1.jpg' }
      ]
    },
    {
      title: 'Up to 30% off - Headsets & Speakers',
      linkText: 'Shop now',
      link: '/home/products',
      params: { maincategoryid: 1 },
      items: [
        { name: 'Headsets', image: 'assets/images/cat-electronics.jpg' },
        { name: 'Earbuds', image: 'assets/images/cat-phones.jpg' },
        { name: 'Speakers', image: 'assets/images/permotion3.jpg' },
        { name: 'Soundbars', image: 'assets/images/hero-1.jpg' }
      ]
    },
    {
      title: 'Fashion & Style',
      linkText: 'Explore fashion',
      link: '/home/products',
      params: { maincategoryid: 2 },
      items: [
        { name: 'Clothing', image: 'assets/images/cat-fashion.jpg' },
        { name: 'Shoes', image: 'assets/images/cat-fashion.jpg' },
        { name: 'Watches', image: 'assets/images/cat-fashion.jpg' },
        { name: 'Bags', image: 'assets/images/cat-fashion.jpg' }
      ]
    },
    {
      title: 'Home & Kitchen Essentials',
      linkText: 'Discover more',
      link: '/home/products',
      params: { maincategoryid: 4 },
      items: [
        { name: 'Decor', image: 'assets/images/hero-2.png' },
        { name: 'Furniture', image: 'assets/images/hero-2.png' },
        { name: 'Appliances', image: 'assets/images/cat-electronics.jpg' },
        { name: 'Kitchenware', image: 'assets/images/permotion3.jpg' }
      ]
    }
  ];

  navigateToOffer(offer: any) {
    this.router.navigate([offer.link], { queryParams: offer.params });
  }
}
