import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../../core/services/store.service';
import { Store } from '../../../models/store.model';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-evictions',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, ButtonModule, InputTextModule],
  templateUrl: './evictions.html',
  styleUrls: ['./evictions.scss']
})
export class EvictionsComponent implements OnInit {
  private storeService = inject(StoreService);

  // Filter only PRE_NOTICE stores
  evictions = signal<Store[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.loadEvictions();
  }

  loadEvictions() {
    this.loading.set(true);
    this.storeService.getStores().subscribe({
      next: (stores) => {
        const preNoticeStores = stores.filter(s => s.status === 'PRE_NOTICE');
        this.evictions.set(preNoticeStores);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading evictions', err);
        this.loading.set(false);
      }
    });
  }

  calculateRemainingDays(evictionDate?: string): number {
    if (!evictionDate) return 0;
    const target = new Date(evictionDate);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDaysSeverity(days: number) {
    if (days <= 0) return 'danger';
    if (days <= 7) return 'warning';
    return 'info';
  }
}
