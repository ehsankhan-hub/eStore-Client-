import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HomepageService } from '../../services/homepage/homepage.service';

@Component({
  selector: 'app-quad-offer-grid',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quad-offer-grid.component.html',
  styleUrl: './quad-offer-grid.component.css'
})
export class QuadOfferGridComponent implements OnInit {
  private router = inject(Router);
  private homepageService = inject(HomepageService);

  quadOffers: any[] = [];

  ngOnInit(): void {
    this.homepageService.getHomepageBlocks().subscribe({
      next: (blocks) => {
        // Filter for QUAD_GRID type and map SQL snake_case to camelCase if needed
        this.quadOffers = blocks
          .filter(b => b.block_type === 'QUAD_GRID')
          .map(b => ({
            title: b.title,
            linkText: b.link_text,
            link: b.link_url,
            params: typeof b.link_params === 'string' ? JSON.parse(b.link_params) : b.link_params,
            items: typeof b.items_payload === 'string' ? JSON.parse(b.items_payload) : b.items_payload
          }));
      },
      error: (err) => console.error('Error loading homepage blocks:', err)
    });
  }

  navigateToOffer(offer: any) {
    this.router.navigate([offer.link], { queryParams: offer.params });
  }
}
