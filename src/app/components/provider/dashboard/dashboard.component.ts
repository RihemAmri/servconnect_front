import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
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
  isLoading = true;
  providerId: string = '';
  
  // Stats
  stats: DashboardStats = {
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
  };

  // Revenue chart data
  revenueData: RevenueData[] = [];
  maxRevenue: number = 0;

  // Recent bookings
  recentBookings: RecentBooking[] = [];

  // Time period filter
  selectedPeriod: 'week' | 'month' | 'year' = 'month';

  // Animation counters
  animatedRevenue = 0;
  animatedBookings = 0;
  animatedRating = 0;

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
              this.providerId = response.provider._id;
              console.log('✅ Provider ID récupéré:', this.providerId);
              
              // Store rating from provider profile
              this.stats.averageRating = response.provider.noteGenerale || 0;
              this.stats.totalReviews = response.provider.nombreAvis || 0;
              
              this.loadDashboardData();
            } else {
              // Fallback to user._id
              this.providerId = user._id;
              this.loadDashboardData();
            }
          },
          error: (err) => {
            console.error('Error getting provider profile:', err);
            // Fallback to user._id
            this.providerId = user._id;
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
    this.isLoading = true;
    console.log('📊 Loading dashboard data for provider:', this.providerId);
    
    // Save rating data that was loaded from provider profile
    const savedRating = this.stats.averageRating;
    const savedReviews = this.stats.totalReviews;
    
    // Load all bookings with stats (same API as myservices)
    this.http.get<any>(`${environment.apiUrl}/api/bookings/provider/${this.providerId}/all`)
      .subscribe({
        next: (response) => {
          console.log('📊 Bookings API response:', response);
          if (response.success && response.stats) {
            // Map stats from bookings API to dashboard format
            const apiStats = response.stats;
            this.stats = {
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
            };
            
            console.log('📊 Stats mapped:', this.stats);
            
            // Get recent bookings from the response
            const allBookings = response.data?.all || [];
            this.recentBookings = allBookings.slice(0, 5).map((b: any) => ({
              _id: b._id,
              client: b.client,
              service: b.cause || 'Service',
              date: b.date,
              proposedPrice: b.proposedPrice || 0,
              status: b.status
            }));
            
            this.animateNumbers();
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading bookings stats:', err);
          this.loadDemoData();
          this.isLoading = false;
        }
      });

    // Load revenue chart data
    this.http.get<any>(`${environment.apiUrl}/api/providers/${this.providerId}/revenue-chart`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.revenueData = response.data;
            this.maxRevenue = Math.max(...this.revenueData.map(d => d.revenue), 1);
          }
        },
        error: () => {
          this.loadDemoChartData();
        }
      });
  }

  loadDemoData() {
    this.stats = {
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
    };
    this.animateNumbers();
  }

  loadDemoChartData() {
    this.revenueData = [
      { month: 'Jan', revenue: 1200 },
      { month: 'Fév', revenue: 1850 },
      { month: 'Mar', revenue: 2100 },
      { month: 'Avr', revenue: 1750 },
      { month: 'Mai', revenue: 2400 },
      { month: 'Jun', revenue: 2800 },
      { month: 'Jul', revenue: 3250 }
    ];
    this.maxRevenue = Math.max(...this.revenueData.map(d => d.revenue));
  }

  loadDemoBookings() {
    this.recentBookings = [
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
    ];
  }

  animateNumbers() {
    if (!this.isBrowser) return;

    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      this.animatedRevenue = Math.floor(this.stats.totalRevenue * easeOut);
      this.animatedBookings = Math.floor(this.stats.totalBookings * easeOut);
      this.animatedRating = Math.round(this.stats.averageRating * easeOut * 10) / 10;

      if (step >= steps) {
        clearInterval(timer);
        this.animatedRevenue = this.stats.totalRevenue;
        this.animatedBookings = this.stats.totalBookings;
        this.animatedRating = this.stats.averageRating;
      }
    }, interval);
  }

  getBarHeight(revenue: number): number {
    if (this.maxRevenue === 0) return 0;
    return (revenue / this.maxRevenue) * 100;
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
    this.selectedPeriod = period;
    // Could reload data based on period
  }

  getRevenueChange(): number {
    // Calculate percentage change (demo)
    return 12.5;
  }

  getBookingsChange(): number {
    return 8.3;
  }

  getHoursProgress(): number {
    // Calculate progress based on total hours (max 100 hours = 100%)
    const totalMinutes = this.stats.totalDuration || 0;
    const maxMinutes = 6000; // 100 hours
    return Math.min((totalMinutes / maxMinutes) * 100, 100);
  }

  // Donut chart percentages
  getCompletedPercent(): number {
    if (this.stats.totalBookings === 0) return 0;
    return (this.stats.completedBookings / this.stats.totalBookings) * 100;
  }

  getPendingPercent(): number {
    if (this.stats.totalBookings === 0) return 0;
    return (this.stats.pendingBookings / this.stats.totalBookings) * 100;
  }

  getCancelledPercent(): number {
    if (this.stats.totalBookings === 0) return 0;
    return (this.stats.cancelledBookings / this.stats.totalBookings) * 100;
  }
}
