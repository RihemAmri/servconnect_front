import { Component, OnInit, AfterViewInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

const API_BASE_URL = 'http://localhost:5000/api';

interface Provider {
  _id: string;
  user?: {
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
  noteGenerale?: number;
  nombreAvis?: number;
}

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss'
})
export class ReservationComponent implements OnInit, AfterViewInit, OnDestroy {
  currentStep: number = 1;
  totalSteps: number = 4;
  
  provider: Provider | null = null;
  providerId: string = '';
  loading: boolean = true;
  submitting: boolean = false;
  error: string | null = null;
  
  // Form data
  reservationForm: FormGroup;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  
  // Map
  private map: any = null;
  private L: any = null;
  private marker: any = null;
  selectedLocation: { lat: number; lng: number; address: string } | null = null;
  
  // Time slots
  availableTimeSlots: string[] = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00'
  ];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private http: HttpClient,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.reservationForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      serviceType: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      urgency: ['normal', Validators.required]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.providerId = params['id'];
      if (this.providerId) {
        this.loadProvider();
      }
    });
  }

  ngAfterViewInit() {
    // Map will be initialized in step 3
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  loadProvider() {
    this.loading = true;
    this.http.get<any>(`${API_BASE_URL}/providers/${this.providerId}`).subscribe({
      next: (response) => {
        // Backend retourne { provider: ... }
        this.provider = response.provider || response;
        this.reservationForm.patchValue({
          serviceType: this.provider?.metier || ''
        });
        this.loading = false;
        console.log('Provider loaded:', this.provider);
      },
      error: (error) => {
        console.error('Error loading provider:', error);
        this.error = 'Impossible de charger les informations du prestataire';
        this.loading = false;
      }
    });
  }

  // Step navigation
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      if (this.validateCurrentStep()) {
        this.currentStep++;
        if (this.currentStep === 3) {
          setTimeout(() => this.initializeMap(), 100);
        }
      }
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number) {
    if (step <= this.currentStep || this.validateStepsUntil(step - 1)) {
      this.currentStep = step;
      if (step === 3 && !this.map) {
        setTimeout(() => this.initializeMap(), 100);
      }
    }
  }

  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!this.reservationForm.get('date')?.valid && !!this.reservationForm.get('time')?.valid;
      case 2:
        return !!this.reservationForm.get('description')?.valid;
      case 3:
        return !!this.selectedLocation;
      default:
        return true;
    }
  }

  validateStepsUntil(step: number): boolean {
    for (let i = 1; i <= step; i++) {
      const prevStep = this.currentStep;
      this.currentStep = i;
      if (!this.validateCurrentStep()) {
        this.currentStep = prevStep;
        return false;
      }
    }
    this.currentStep = step + 1;
    return true;
  }

  // Map initialization
  initializeMap() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    import('leaflet').then((L) => {
      this.L = L.default || L;

      if (this.map) {
        this.map.remove();
      }

      // Default center: Tunisia or provider location
      const defaultLat = this.provider?.user?.adresse?.lat || 36.8065;
      const defaultLng = this.provider?.user?.adresse?.lng || 10.1815;

      this.map = this.L.map('reservation-map').setView([defaultLat, defaultLng], 13);

      this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map);

      // Add click handler for location selection
      this.map.on('click', (e: any) => {
        this.selectLocation(e.latlng.lat, e.latlng.lng);
      });

      // Add provider marker if available
      if (this.provider?.user?.adresse?.lat && this.provider?.user?.adresse?.lng) {
        const providerIcon = this.L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        this.L.marker([this.provider.user.adresse.lat, this.provider.user.adresse.lng], { icon: providerIcon })
          .addTo(this.map)
          .bindPopup(`<strong>Position du prestataire</strong><br>${this.provider.user.adresse.street}`);
      }
    }).catch(err => {
      console.error('Error loading Leaflet:', err);
    });
  }

  selectLocation(lat: number, lng: number) {
    if (!this.L) return;

    // Remove old marker
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    // Add new marker
    const icon = this.L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    this.marker = this.L.marker([lat, lng], { icon: icon }).addTo(this.map);
    
    // Reverse geocoding (simplified - you can use a real service)
    this.selectedLocation = {
      lat: lat,
      lng: lng,
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    };

    this.marker.bindPopup(`<strong>Lieu du service</strong><br>${this.selectedLocation.address}`).openPopup();
  }

  // File handling
  onFileSelect(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length && this.selectedFiles.length < 5; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          this.selectedFiles.push(file);
          
          // Create preview
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.previewUrls.push(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  // Form submission
  async submitReservation() {
    if (!this.reservationForm.valid || !this.selectedLocation) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Get client ID from localStorage (assuming user is logged in)
    const user = localStorage.getItem('user');
    if (!user) {
      alert('❌ Vous devez être connecté pour réserver');
      this.router.navigate(['/login']);
      return;
    }

    let clientId;
    try {
      const userData = JSON.parse(user);
      clientId = userData._id || userData.id;
    } catch (e) {
      alert('❌ Erreur d\'authentification');
      return;
    }

    this.submitting = true;

    try {
      const formData = new FormData();
      formData.append('providerId', this.providerId);
      formData.append('clientId', clientId);
      formData.append('date', this.reservationForm.get('date')?.value);
      formData.append('time', this.reservationForm.get('time')?.value);
      formData.append('serviceType', this.reservationForm.get('serviceType')?.value);
      formData.append('description', this.reservationForm.get('description')?.value);
      formData.append('urgency', this.reservationForm.get('urgency')?.value);
      formData.append('location', JSON.stringify(this.selectedLocation));

      // Add files
      this.selectedFiles.forEach((file, index) => {
        formData.append(`photos`, file);
      });

      this.http.post(`${API_BASE_URL}/bookings`, formData).subscribe({
        next: (response: any) => {
          this.submitting = false;
          alert(`✅ ${response.message}`);
          this.router.navigate(['/explore']);
        },
        error: (error) => {
          console.error('Error submitting reservation:', error);
          this.submitting = false;
          const errorMsg = error.error?.message || 'Erreur lors de l\'envoi de la réservation';
          alert(`❌ ${errorMsg}`);
        }
      });
    } catch (error) {
      console.error('Error:', error);
      this.submitting = false;
      alert('❌ Une erreur est survenue');
    }
  }

  // Get minimum date (today)
  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Get provider photo
  getProviderPhoto(): string {
    if (this.provider?.user?.photo) {
      return this.provider.user.photo;
    }
    const nom = this.provider?.user?.nom || 'U';
    const prenom = this.provider?.user?.prenom || 'S';
    return `https://ui-avatars.com/api/?name=${prenom}+${nom}&background=025ddd&color=fff&size=400&bold=true`;
  }
}
