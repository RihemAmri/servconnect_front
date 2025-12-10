import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  todayRevenue: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageRating: number;
  totalReviews: number;
  conversionRate: number;
  repeatCustomers: number;
  totalHours: number;
  totalMinutes: number;
  totalDuration: number;
}

interface RevenueData {
  month: string;
  revenue: number;
}

interface RecentBooking {
  _id: string;
  client: {
    nom: string;
    prenom: string;
    photo?: string;
  };
  service: string;
  date: string;
  proposedPrice: number;
  status: string;
}

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class ProviderDashboardComponent implements OnInit, AfterViewInit {
  isBrowser: boolean;
  
  // Signals
  isLoading = signal(true);
  providerId = signal('');
  
  // Stats signal
  stats = signal<DashboardStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    todayRevenue: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    averageRating: 0,
    totalReviews: 0,
    conversionRate: 0,
    repeatCustomers: 0,
    totalHours: 0,
    totalMinutes: 0,
    totalDuration: 0
  });

  // Revenue chart data
  revenueData = signal<RevenueData[]>([]);
  maxRevenue = computed(() => Math.max(...this.revenueData().map(d => d.revenue), 1));

  // Recent bookings
  recentBookings = signal<RecentBooking[]>([]);

  // Time period filter
  selectedPeriod = signal<'week' | 'month' | 'year'>('month');

  // Animation counters
  animatedRevenue = signal(0);
  animatedBookings = signal(0);
  animatedRating = signal(0);

  // Computed values
  completedPercent = computed(() => {
    const s = this.stats();
    return s.totalBookings === 0 ? 0 : (s.completedBookings / s.totalBookings) * 100;
  });

  pendingPercent = computed(() => {
    const s = this.stats();
    return s.totalBookings === 0 ? 0 : (s.pendingBookings / s.totalBookings) * 100;
  });

  cancelledPercent = computed(() => {
    const s = this.stats();
    return s.totalBookings === 0 ? 0 : (s.cancelledBookings / s.totalBookings) * 100;
  });

  hoursProgress = computed(() => {
    const totalMinutes = this.stats().totalDuration || 0;
    const maxMinutes = 6000; // 100 hours
    return Math.min((totalMinutes / maxMinutes) * 100, 100);
  });

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user && user._id) {
      // Get the provider profile to get the real provider ID
      this.http.get<any>(`${environment.apiUrl}/api/providers/${user._id}`)
        .subscribe({
          next: (response) => {
            if (response.provider && response.provider._id) {
              this.providerId.set(response.provider._id);
              console.log('✅ Provider ID récupéré:', this.providerId());
              
              // Store rating from provider profile
              this.stats.update(s => ({
                ...s,
                averageRating: response.provider.noteGenerale || 0,
                totalReviews: response.provider.nombreAvis || 0
              }));
              
              this.loadDashboardData();
            } else {
              // Fallback to user._id
              this.providerId.set(user._id);
              this.loadDashboardData();
            }
          },
          error: (err) => {
            console.error('Error getting provider profile:', err);
            // Fallback to user._id
            this.providerId.set(user._id);
            this.loadDashboardData();
          }
        });
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      setTimeout(() => this.animateNumbers(), 500);
    }
  }

  loadDashboardData() {
    this.isLoading.set(true);
    console.log('📊 Loading dashboard data for provider:', this.providerId());
    
    // Save rating data that was loaded from provider profile
    const savedRating = this.stats().averageRating;
    const savedReviews = this.stats().totalReviews;
    
    // Load all bookings with stats (same API as myservices)
    this.http.get<any>(`${environment.apiUrl}/api/bookings/provider/${this.providerId()}/all`)
      .subscribe({
        next: (response) => {
          console.log('📊 Bookings API response:', response);
          if (response.success && response.stats) {
            // Map stats from bookings API to dashboard format
            const apiStats = response.stats;
            this.stats.set({
              totalRevenue: apiStats.totalRevenue || 0,
              monthlyRevenue: apiStats.thisMonth?.revenue || 0,
              weeklyRevenue: 0,
              todayRevenue: 0,
              totalBookings: apiStats.total || 0,
              pendingBookings: apiStats.pending || 0,
              completedBookings: apiStats.completed || 0,
              cancelledBookings: apiStats.cancelled || 0,
              averageRating: savedRating, // Keep the rating from provider profile
              totalReviews: savedReviews, // Keep the reviews from provider profile
              conversionRate: apiStats.total > 0 ? Math.round((apiStats.completed / apiStats.total) * 100) : 0,
              repeatCustomers: 0,
              totalHours: Math.floor((apiStats.totalDuration || 0) / 60),
              totalMinutes: (apiStats.totalDuration || 0) % 60,
              totalDuration: apiStats.totalDuration || 0
            });
            
            console.log('📊 Stats mapped:', this.stats());
            
            // Get recent bookings from the response
            const allBookings = response.data?.all || [];
            this.recentBookings.set(allBookings.slice(0, 5).map((b: any) => ({
              _id: b._id,
              client: b.client,
              service: b.cause || 'Service',
              date: b.date,
              proposedPrice: b.proposedPrice || 0,
              status: b.status
            })));
            
            this.animateNumbers();
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading bookings stats:', err);
          this.loadDemoData();
          this.isLoading.set(false);
        }
      });

    // Load revenue chart data
    this.http.get<any>(`${environment.apiUrl}/api/providers/${this.providerId()}/revenue-chart`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.revenueData.set(response.data);
          }
        },
        error: () => {
          this.loadDemoChartData();
        }
      });
  }

  loadDemoData() {
    this.stats.set({
      totalRevenue: 15750,
      monthlyRevenue: 3250,
      weeklyRevenue: 890,
      todayRevenue: 150,
      totalBookings: 127,
      pendingBookings: 8,
      completedBookings: 112,
      cancelledBookings: 7,
      averageRating: 4.8,
      totalReviews: 89,
      conversionRate: 88,
      repeatCustomers: 34,
      totalHours: 45,
      totalMinutes: 30,
      totalDuration: 2730
    });
    this.animateNumbers();
  }

  loadDemoChartData() {
    this.revenueData.set([
      { month: 'Jan', revenue: 1200 },
      { month: 'Fév', revenue: 1850 },
      { month: 'Mar', revenue: 2100 },
      { month: 'Avr', revenue: 1750 },
      { month: 'Mai', revenue: 2400 },
      { month: 'Jun', revenue: 2800 },
      { month: 'Jul', revenue: 3250 }
    ]);
  }

  loadDemoBookings() {
    this.recentBookings.set([
      {
        _id: '1',
        client: { nom: 'Ben Ali', prenom: 'Ahmed', photo: '' },
        service: 'Plomberie',
        date: new Date().toISOString(),
        proposedPrice: 150,
        status: 'pending'
      },
      {
        _id: '2',
        client: { nom: 'Trabelsi', prenom: 'Sami', photo: '' },
        service: 'Électricité',
        date: new Date(Date.now() - 86400000).toISOString(),
        proposedPrice: 200,
        status: 'completed'
      },
      {
        _id: '3',
        client: { nom: 'Gharbi', prenom: 'Fatma', photo: '' },
        service: 'Climatisation',
        date: new Date(Date.now() - 172800000).toISOString(),
        proposedPrice: 350,
        status: 'accepted'
      }
    ]);
  }

  animateNumbers() {
    if (!this.isBrowser) return;

    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    const currentStats = this.stats();

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      this.animatedRevenue.set(Math.floor(currentStats.totalRevenue * easeOut));
      this.animatedBookings.set(Math.floor(currentStats.totalBookings * easeOut));
      this.animatedRating.set(Math.round(currentStats.averageRating * easeOut * 10) / 10);

      if (step >= steps) {
        clearInterval(timer);
        this.animatedRevenue.set(currentStats.totalRevenue);
        this.animatedBookings.set(currentStats.totalBookings);
        this.animatedRating.set(currentStats.averageRating);
      }
    }, interval);
  }

  getBarHeight(revenue: number): number {
    const max = this.maxRevenue();
    if (max === 0) return 0;
    return (revenue / max) * 100;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'pending': 'status-pending',
      'accepted': 'status-accepted',
      'completed': 'status-completed',
      'paid': 'status-paid',
      'cancelled': 'status-cancelled',
      'refused': 'status-refused'
    };
    return classes[status] || 'status-pending';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pending': 'En attente',
      'accepted': 'Acceptée',
      'completed': 'Terminée',
      'paid': 'Payée',
      'cancelled': 'Annulée',
      'refused': 'Refusée'
    };
    return labels[status] || status;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('fr-TN') + ' TND';
  }

  getClientInitials(client: any): string {
    return (client.prenom?.charAt(0) || '') + (client.nom?.charAt(0) || '');
  }

  selectPeriod(period: 'week' | 'month' | 'year') {
    this.selectedPeriod.set(period);
    // Could reload data based on period
  }

  getRevenueChange(): number {
    // Calculate percentage change (demo)
    return 12.5;
  }

  getBookingsChange(): number {
    return 8.3;
  }
}
