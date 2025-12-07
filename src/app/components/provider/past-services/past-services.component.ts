import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

interface Client {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  photo?: string;
}

interface CompletedBooking {
  _id: string;
  client: Client;
  service: string;
  cause: string;
  date: string;
  time?: string;
  proposedPrice: number;
  estimatedDuration: number;
  actualDuration?: number;
  completedAt: string;
  location?: {
    address: string;
    lat: number;
    lng: number;
  };
  attachments?: string[];
  completionNotes?: string;
  status: string;
}

interface Stats {
  totalCompleted: number;
  totalRevenue: number;
  totalDuration: number;
  thisMonthCompleted: number;
  thisMonthRevenue: number;
}

@Component({
  selector: 'app-past-services',
  imports: [CommonModule, FormsModule],
  templateUrl: './past-services.component.html',
  styleUrl: './past-services.component.scss'
})
export class PastServicesComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  completedBookings: CompletedBooking[] = [];
  filteredBookings: CompletedBooking[] = [];
  loading = true;
  
  // Stats
  stats: Stats = {
    totalCompleted: 0,
    totalRevenue: 0,
    totalDuration: 0,
    thisMonthCompleted: 0,
    thisMonthRevenue: 0
  };

  // Filters
  searchTerm = '';
  selectedMonth = '';
  sortBy = 'date-desc';

  // Provider ID - dynamique
  providerId = '';

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user && user._id) {
      // Get the provider profile to get the real provider ID
      this.http.get<any>(`${environment.apiUrl}/api/providers/${user._id}`)
        .subscribe({
          next: (response) => {
            if (response.provider && response.provider._id) {
              this.providerId = response.provider._id;
              console.log('✅ PastServices - Provider ID:', this.providerId);
              this.loadCompletedBookings();
            }
          },
          error: (err) => {
            console.error('Error getting provider profile:', err);
            this.loading = false;
          }
        });
    }
  }

  loadCompletedBookings() {
    this.loading = true;
    
    this.http.get<any>(`${environment.apiUrl}/api/bookings/provider/${this.providerId}/completed`)
      .subscribe({
        next: (response) => {
          console.log('Past services loaded:', response);
          this.completedBookings = response.data || [];
          this.filteredBookings = [...this.completedBookings];
          this.calculateStats();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading past services:', error);
          this.loading = false;
        }
      });
  }

  calculateStats() {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    this.stats.totalCompleted = this.completedBookings.length;
    this.stats.totalRevenue = this.completedBookings.reduce((sum, b) => sum + (b.proposedPrice || 0), 0);
    this.stats.totalDuration = this.completedBookings.reduce((sum, b) => sum + (b.estimatedDuration || 0), 0);

    // This month stats
    const thisMonthBookings = this.completedBookings.filter(b => {
      const date = new Date(b.completedAt);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });
    
    this.stats.thisMonthCompleted = thisMonthBookings.length;
    this.stats.thisMonthRevenue = thisMonthBookings.reduce((sum, b) => sum + (b.proposedPrice || 0), 0);
  }

  applyFilters() {
    let filtered = [...this.completedBookings];

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        b.client.nom.toLowerCase().includes(term) ||
        b.client.prenom.toLowerCase().includes(term) ||
        b.service.toLowerCase().includes(term) ||
        b.location?.address?.toLowerCase().includes(term)
      );
    }

    // Month filter
    if (this.selectedMonth) {
      const [year, month] = this.selectedMonth.split('-').map(Number);
      filtered = filtered.filter(b => {
        const date = new Date(b.completedAt);
        return date.getFullYear() === year && date.getMonth() === month - 1;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'date-desc':
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
        case 'date-asc':
          return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
        case 'price-desc':
          return (b.proposedPrice || 0) - (a.proposedPrice || 0);
        case 'price-asc':
          return (a.proposedPrice || 0) - (b.proposedPrice || 0);
        default:
          return 0;
      }
    });

    this.filteredBookings = filtered;
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedMonth = '';
    this.sortBy = 'date-desc';
    this.filteredBookings = [...this.completedBookings];
  }

  viewDetails(bookingId: string) {
    this.router.navigate(['/manage-bookings', bookingId]);
  }

  goBack() {
    this.router.navigate(['/my-services']);
  }

  formatDuration(minutes: number): string {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  }

  getMonthOptions(): { value: string; label: string }[] {
    const months: { value: string; label: string }[] = [];
    const dates = this.completedBookings.map(b => new Date(b.completedAt));
    const uniqueMonths = new Set(dates.map(d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`));
    
    uniqueMonths.forEach(monthStr => {
      const [year, month] = monthStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      months.push({
        value: monthStr,
        label: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      });
    });

    return months.sort((a, b) => b.value.localeCompare(a.value));
  }
}
