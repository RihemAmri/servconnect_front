import { Component, OnInit, AfterViewInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// API Configuration
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
    } | string;
    photo?: string; // ✅ AJOUTÉ
  };
  metier: string;
  description?: string;
  experience?: number;
  certifications: string[];
  isVerified: boolean;
  noteGenerale: number;
  nombreAvis: number;
  reviews: any[];
}

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.scss'
})
export class ExploreComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedCategory: string = 'Tous';
  selectedRating: string = 'all';
  selectedPrice: string = 'all';
  searchQuery: string = '';
  
  // Backend data
  providers: Provider[] = [];
  loading = true;
  error: string | null = null;
  
  // Map
  private map: any = null;
  private L: any = null;
  private markers: any[] = [];
  showMap: boolean = false;
  private cardMaps: Map<string, any> = new Map(); // Store individual card maps

  categories = [
    { name: 'Tous', icon: '🏠' },
    { name: 'Plomberie', icon: '🔧' },
    { name: 'Ménage', icon: '🧹' },
    { name: 'Babysitting', icon: '👶' },
    { name: 'Électricité', icon: '⚡' },
    { name: 'Jardinage', icon: '🌱' },
    { name: 'Peinture', icon: '🎨' },
    { name: 'Déménagement', icon: '📦' },
    { name: 'Climatisation', icon: '❄️' }
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.loadProviders();
  }

  ngAfterViewInit() {
    // Initialize card maps after view is ready
    setTimeout(() => {
      this.initializeCardMaps();
    }, 100);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    // Clean up card maps
    this.cardMaps.forEach(map => {
      if (map) map.remove();
    });
    this.cardMaps.clear();
  }

  loadProviders() {
    this.loading = true;
    this.error = null;

    // Build query parameters
    const params: any = {};
    if (this.selectedCategory !== 'Tous') {
      params.category = this.selectedCategory;
    }
    if (this.selectedRating !== 'all') {
      params.minRating = this.selectedRating;
    }

    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/providers${queryString ? '?' + queryString : ''}`;

    this.http.get<any>(url).subscribe({
      next: (response) => {
        this.providers = response.providers || [];
        this.loading = false;
        console.log(response);
        
        // Initialize card maps after providers are loaded
        setTimeout(() => {
          this.initializeCardMaps();
        }, 200);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des providers:', error);
        this.error = 'Impossible de charger les prestataires';
        this.loading = false;
      }
    });
  }

  get filteredProviders() {
    return this.providers.filter(provider => {
      const matchCategory = this.selectedCategory === 'Tous' || 
        provider.metier.toLowerCase().includes(this.selectedCategory.toLowerCase());
      
      const matchRating = this.selectedRating === 'all' || 
        (this.selectedRating === '4.5' && provider.noteGenerale >= 4.5) ||
        (this.selectedRating === '4.0' && provider.noteGenerale >= 4.0);
      
      const matchSearch = !this.searchQuery || 
        provider.metier.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        `${provider.user.nom} ${provider.user.prenom}`.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (provider.description && provider.description.toLowerCase().includes(this.searchQuery.toLowerCase()));

      return matchCategory && matchRating && matchSearch;
    });
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.loadProviders();
  }

  onFilterChange() {
    this.loadProviders();
  }

  // Navigation methods
  viewProviderProfile(providerId: string) {
    this.router.navigate(['/detailsProvider', providerId]);
  }

  bookProvider(providerId: string) {
    this.router.navigate(['/reservation', providerId]);
  }

  getStarsArray(rating: number): number[] {
    return Array(5).fill(0).map((_, index) => index < Math.floor(rating) ? 1 : 0);
  }

  getCategoryIcon(metier: string): string {
    const categoryMap: { [key: string]: string } = {
      'plomberie': '🔧',
      'ménage': '🧹',
      'babysitting': '👶',
      'électricité': '⚡',
      'jardinage': '🌱',
      'peinture': '🎨',
      'déménagement': '📦',
      'climatisation': '❄️'
    };
    
    const key = metier.toLowerCase();
    return categoryMap[key] || '🏠';
  }

  // ✅ Nouvelle méthode pour obtenir la photo du provider
  getProviderPhoto(provider: Provider): string {
    console.log('Provider photo:', provider.user?.photo);
    if (provider.user?.photo) {
      return provider.user.photo;
    }
    // Fallback vers UI Avatars avec les initiales du provider
    const nom = provider.user?.nom || 'U';
    const prenom = provider.user?.prenom || 'S';
    return `https://ui-avatars.com/api/?name=${prenom}+${nom}&background=025ddd&color=fff&size=400&bold=true&font-size=0.4`;
  }

  // ✅ Nouvelle méthode pour obtenir les initiales
  getProviderInitials(provider: Provider): string {
    const nom = provider.user?.nom || '';
    const prenom = provider.user?.prenom || '';
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }

  // Get address as a string
  getAddressString(provider: Provider): string {
    if (!provider.user?.adresse) return 'Tunisie';
    
    const addr = provider.user.adresse;
    if (typeof addr === 'string') return addr;
    return addr.street || 'Tunisie';
  }

  // Check if provider has valid coordinates
  hasValidCoordinates(provider: Provider): boolean {
    const addr = provider.user?.adresse;
    return !!(addr && typeof addr !== 'string' && addr.lat && addr.lng);
  }

  // Initialize small maps in each card
  initializeCardMaps() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    import('leaflet').then((L) => {
      this.L = L.default || L;

      // Clean up old maps
      this.cardMaps.forEach(map => {
        if (map) map.remove();
      });
      this.cardMaps.clear();

      // Initialize map for each provider with coordinates
      this.filteredProviders.forEach(provider => {
        if (this.hasValidCoordinates(provider)) {
          setTimeout(() => {
            this.initializeSingleCardMap(provider);
          }, 50);
        }
      });
    }).catch(err => {
      console.error('Error loading Leaflet for card maps:', err);
    });
  }

  // Initialize a single card map
  private initializeSingleCardMap(provider: Provider) {
    const mapId = 'map-' + provider._id;
    const mapElement = document.getElementById(mapId);

    if (!mapElement || !this.L) {
      return;
    }

    const addr = provider.user.adresse as any;
    
    // Remove old map if exists
    if (this.cardMaps.has(provider._id)) {
      this.cardMaps.get(provider._id)?.remove();
    }

    try {
      // Create small map
      const cardMap = this.L.map(mapId, {
        dragging: false,
        zoomControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false
      }).setView([addr.lat, addr.lng], 13);

      // Add tiles
      this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
      }).addTo(cardMap);

      // Add marker
      const iconColor = this.getCategoryColor(provider.metier);
      const customIcon = this.L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${iconColor}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [20, 33],
        iconAnchor: [10, 33],
        popupAnchor: [0, -28],
        shadowSize: [33, 33]
      });

      this.L.marker([addr.lat, addr.lng], { icon: customIcon }).addTo(cardMap);

      // Store the map
      this.cardMaps.set(provider._id, cardMap);

      // Invalidate size to fix rendering
      setTimeout(() => {
        cardMap.invalidateSize();
      }, 100);
    } catch (error) {
      console.error('Error creating card map for provider:', provider._id, error);
    }
  }

  toggleMap() {
    this.showMap = !this.showMap;
    console.log('Toggle map clicked. showMap:', this.showMap);
    if (this.showMap) {
      setTimeout(() => {
        this.initializeMap();
      }, 100);
    }
  }

  initializeMap() {
    console.log('Initializing map...');
    // Only run in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      console.log('Not in browser, skipping map');
      return;
    }

    // Get providers with valid coordinates
    const providersWithCoords = this.filteredProviders.filter(p => {
      const addr = p.user?.adresse;
      return addr && typeof addr !== 'string' && addr.lat && addr.lng;
    });

    console.log('Providers with coords:', providersWithCoords.length);
    console.log('All providers:', this.providers);

    if (providersWithCoords.length === 0) {
      console.log('No providers with coordinates');
      return;
    }

    // Dynamically import Leaflet only in browser
    import('leaflet').then((L) => {
      this.L = L.default || L;

      // Remove existing map if any
      if (this.map) {
        this.map.remove();
      }

      // Calculate center point (average of all coordinates)
      const avgLat = providersWithCoords.reduce((sum, p) => sum + (p.user.adresse as any).lat, 0) / providersWithCoords.length;
      const avgLng = providersWithCoords.reduce((sum, p) => sum + (p.user.adresse as any).lng, 0) / providersWithCoords.length;

      // Create map
      this.map = this.L.map('explore-map').setView([avgLat, avgLng], 11);

      // Add OpenStreetMap tiles
      this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map);

      // Clear old markers
      this.markers = [];

      // Add markers for each provider
      providersWithCoords.forEach(provider => {
        const addr = provider.user.adresse as any;
        
        // Custom icon colors based on category
        const iconColor = this.getCategoryColor(provider.metier);
        
        const customIcon = this.L.icon({
          iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${iconColor}.png`,
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        const marker = this.L.marker([addr.lat, addr.lng], { icon: customIcon }).addTo(this.map);
        
        const popupContent = `
          <div style="text-align: center; min-width: 200px;">
            <strong style="font-size: 16px; color: #025ddd;">${provider.user.prenom} ${provider.user.nom}</strong><br>
            <span style="color: #666; font-size: 14px;">${provider.metier}</span><br>
            <div style="margin: 8px 0;">
              <span style="color: #fbbf24;">⭐</span> <strong>${provider.noteGenerale}</strong> (${provider.nombreAvis} avis)
            </div>
            <small style="color: #888;">${addr.street}</small><br>
            <button onclick="window.location.href='#/detailsProvider/${provider._id}'" 
                    style="margin-top: 10px; background: linear-gradient(135deg, #025ddd, #0047b3); color: white; border: none; 
                           padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;">
              Voir le profil
            </button>
          </div>
        `;
        
        marker.bindPopup(popupContent);
        this.markers.push(marker);
      });

      // Fit bounds to show all markers
      if (this.markers.length > 0) {
        const group = this.L.featureGroup(this.markers);
        this.map.fitBounds(group.getBounds().pad(0.1));
      }

    }).catch(err => {
      console.error('Error loading Leaflet:', err);
    });
  }

  getCategoryColor(metier: string): string {
    const colorMap: { [key: string]: string } = {
      'plomberie': 'blue',
      'ménage': 'green',
      'babysitting': 'violet',
      'électricité': 'yellow',
      'jardinage': 'green',
      'peinture': 'orange',
      'déménagement': 'red',
      'climatisation': 'blue'
    };
    
    const key = metier.toLowerCase();
    return colorMap[key] || 'blue';
  }
}