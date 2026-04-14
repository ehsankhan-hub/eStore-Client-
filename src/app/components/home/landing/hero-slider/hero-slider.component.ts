import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink],
  templateUrl: './hero-slider.component.html',
  styleUrl: './hero-slider.component.css'
})
export class HeroSliderComponent implements OnInit, OnDestroy {
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;

  slides = [
    {
      image: 'assets/images/hero-2.png',
      title: 'GREAT DEALS. EVERYDAY.',
      subtitle: 'Premium electronics up to 30% off. Limited time only.',
      cta: 'Shop Electronics',
      link: '/home/products',
      params: { maincategoryid: 1 }
    },
    {
      image: 'assets/images/hero-1.jpg',
      title: 'FASHION REVOLUTION',
      subtitle: 'Latest arrivals for the new season. Get up to 60% off.',
      cta: 'Explore Style',
      link: '/home/products',
      params: { maincategoryid: 2 }
    },
    {
      image: 'assets/images/hero-1.jpg', // Using hero-1 again since hero-3 is missing
      title: 'MOBILE EXCELLENCE',
      subtitle: 'The best smartphones at the best prices.',
      cta: 'View Phones',
      link: '/home/products',
      params: { maincategoryid: 1, keyword: 'phone' }
    }
  ];

  currentIndex = signal(0);
  private intervalId: any;

  ngOnInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 6000);
  }

  stopAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextSlide() {
    this.currentIndex.update(idx => (idx + 1) % this.slides.length);
  }

  prevSlide() {
    this.currentIndex.update(idx => (idx - 1 + this.slides.length) % this.slides.length);
  }

  setSlide(index: number) {
    this.currentIndex.set(index);
    this.stopAutoSlide();
    this.startAutoSlide();
  }
}
