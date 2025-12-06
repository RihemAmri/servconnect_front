import { Component, OnInit, AfterViewInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

const API_BASE_URL = 'http://localhost:5000/api';

interface Provider {
  _id: string;
  user: {
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    adresse?: {
      street: string;
      lat: number;
      lng: number;
    };
    photo?: string;
  };
  metier: string;
  description?: string;
  experience?: number;
  certifications: string[];
  isVerified: boolean;
  noteGenerale: number;
  nombreAvis: number;
  reviews: Review[];
  disponibilite: Availability[];
}

interface Review {
  _id: string;
  client: {
    nom: string;
    prenom: string;
  };
  note: number;
  commentaire: string;
  createdAt: string;
}

interface Availability {
  day: string;
  isAvailable: boolean;
  timeSlots: { start: string; end: string }[];
}

@Component({
  selector: 'app-provider-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './provider-details.component.html',
  styleUrl: './provider-details.component.scss'
})
export class ProviderDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  provider: Provider | null = null;
  loading = true;
  error: string | null = null;
  providerId: string = '';
  private map: any = null;
  private L: any = null;

  daysMap: { [key: string]: string } = {
    'monday': 'Lundi',
    'tuesday': 'Mardi',
    'wednesday': 'Mercredi',
    'thursday': 'Jeudi',
    'friday': 'Vendredi',
    'saturday': 'Samedi',
    'sunday': 'Dimanche'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.providerId = params['id'];
      if (this.providerId) {
        this.loadProviderDetails();
      }
    });
    window.scrollTo({ top: 0 });
  this.loadProviderDetails();
  }

  ngAfterViewInit() {
    // Map will be initialized after provider data is loaded
  }

  ngOnDestroy() {
    // Clean up map instance
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  loadProviderDetails() {
    this.loading = true;
    this.error = null;

    this.http.get<any>(`${API_BASE_URL}/providers/${this.providerId}`).subscribe({
      next: (response) => {
        this.provider = response.provider;
        this.loading = false;
        console.log('Provider details:', this.provider);
        
        // Initialize map after data is loaded
        setTimeout(() => {
          this.initializeMap();
        }, 100);
      },
      error: (error) => {
        console.error('Erreur lors du chargement du provider:', error);
        this.error = 'Impossible de charger les détails du prestataire';
        this.loading = false;
      }
    });
  }

  initializeMap() {
    // Only run in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!this.provider?.user?.adresse) return;

    const address = this.provider.user.adresse;
    
    // Default to Tunisia center if no coordinates
    const lat = address.lat || 36.8065;
    const lng = address.lng || 10.1815;

    // Dynamically import Leaflet only in browser
    import('leaflet').then((L) => {
      this.L = L.default || L;

      // Remove existing map if any
      if (this.map) {
        this.map.remove();
      }

      // Create map
      this.map = this.L.map('provider-map').setView([lat, lng], 13);

      // Add OpenStreetMap tiles
      this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map);

      // Custom icon for provider
      const customIcon = this.L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Add marker
      const marker = this.L.marker([lat, lng], { icon: customIcon }).addTo(this.map);
      
      const popupContent = `
        <div style="text-align: center;">
          <strong>${this.provider!.user.prenom} ${this.provider!.user.nom}</strong><br>
          <span style="color: #666;">${this.provider!.metier}</span><br>
          <small>${address.street || 'Adresse non spécifiée'}</small>
        </div>
      `;
      
      marker.bindPopup(popupContent).openPopup();
    }).catch(err => {
      console.error('Error loading Leaflet:', err);
    });
  }

  getProviderPhoto(): string {
    if (this.provider?.user?.photo) {
      return this.provider.user.photo;
    }
    const nom = this.provider?.user?.nom || 'U';
    const prenom = this.provider?.user?.prenom || 'S';
    return `https://ui-avatars.com/api/?name=${prenom}+${nom}&background=025ddd&color=fff&size=500&bold=true&font-size=0.35`;
  }

  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, index) => index < Math.floor(rating) ? 1 : 0);
  }

  bookProvider() {
    this.router.navigate(['/reservation', this.providerId]);
  }

  goBack() {
    this.router.navigate(['/explore']);
  }

  getDayName(day: string): string {
    return this.daysMap[day] || day;
  }

  getAvailableDays(): Availability[] {
    return this.provider?.disponibilite?.filter(d => d.isAvailable) || [];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }

  getAddressString(): string {
    if (!this.provider?.user?.adresse) return 'Non spécifiée';
    
    const addr = this.provider.user.adresse;
    if (typeof addr === 'string') return addr;
    return addr.street || 'Adresse non disponible';
  }

  hasValidCoordinates(): boolean {
    const addr = this.provider?.user?.adresse;
    return !!(addr && typeof addr !== 'string' && addr.lat && addr.lng);
  }

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
