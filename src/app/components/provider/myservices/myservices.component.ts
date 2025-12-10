import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

// FullCalendar Imports
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import frLocale from '@fullcalendar/core/locales/fr';

interface Booking {
  _id: string;
  client: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  date: string;
  time?: string; // Optional
  location?: { address: string };
  status: string;
  cause?: string;
  urgency?: string;
  proposedPrice?: number;
  estimatedDuration?: number;
}

interface Stats {
  total: number;
  pending: number;
  accepted: number;
  paid: number;
  completed: number;
  totalRevenue: number;
  thisMonth: {
    total: number;
    revenue: number;
  };
}

@Component({
  selector: 'app-myservices',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './myservices.component.html',
  styleUrls: ['./myservices.component.scss']
})
export class MyservicesComponent implements OnInit {
  bookings: Booking[] = [];
  stats: Stats = {
    total: 0,
    pending: 0,
    accepted: 0,
    paid: 0,
    completed: 0,
    totalRevenue: 0,
    thisMonth: { total: 0, revenue: 0 }
  };
  isLoading = true;
  providerId = '';

  // FullCalendar Configuration
  calendarOptions = signal<CalendarOptions>({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'dayGridMonth',
    locale: frLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    height: 'auto',
    contentHeight: 'auto',
    aspectRatio: 1.8,
    expandRows: true,
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    allDaySlot: false,
    nowIndicator: true,
    editable: false,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    eventClick: this.handleEventClick.bind(this),
    events: [],
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    buttonText: {
      today: "Aujourd'hui",
      month: 'Mois',
      week: 'Semaine',
      day: 'Jour',
      list: 'Liste'
    }
  });

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user && user._id) {
      // Get the provider profile to get the real provider ID
      this.http.get<any>(`${environment.apiUrl}/api/providers/${user._id}`)
        .subscribe({
          next: (response) => {
            if (response.provider && response.provider._id) {
              this.providerId = response.provider._id;
              console.log('✅ MyServices - Provider ID:', this.providerId);
              this.loadAllBookings();
            }
          },
          error: (err) => {
            console.error('Error getting provider profile:', err);
            this.isLoading = false;
          }
        });
    }
  }

  loadAllBookings() {
    this.isLoading = true;
    this.http
      .get<{ success: boolean; stats: Stats; data: any }>(
        `${environment.apiUrl}/api/bookings/provider/${this.providerId}/all`
      )
      .subscribe({
        next: (response) => {
          console.log('📊 Réponse API:', response);
          if (response.success) {
            this.stats = response.stats;
            
            // Combine all bookings
            const allBookings = [
              ...(response.data.pending || []),
              ...(response.data.accepted || []),
              ...(response.data.paid || []),
              ...(response.data.completed || []),
              ...(response.data.refused || [])
            ];
            
            this.bookings = allBookings;
            console.log('📅 Bookings chargés:', this.bookings.length, this.bookings);
            this.updateCalendarEvents();
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur chargement r�servations:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de charger les r�servations'
          });
          this.isLoading = false;
        }
      });
  }

  updateCalendarEvents() {
    console.log('🗓️ Mise à jour calendrier avec', this.bookings.length, 'réservations');
    const events = this.bookings.map(booking => {
      // Handle missing time (default to 09:00)
      const time = booking.time || '09:00';
      const [hours, minutes] = time.split(':');
      const eventDate = new Date(booking.date);
      eventDate.setHours(parseInt(hours), parseInt(minutes), 0);

      // Calculate end time (default 1h30 if no estimatedDuration)
      const endDate = new Date(eventDate);
      const duration = booking.estimatedDuration || 90;
      endDate.setMinutes(endDate.getMinutes() + duration);

      // Color coding by status - Explore style
      let backgroundColor = '#025ddd'; // primary blue
      let borderColor = '#0047b3';
      let textColor = '#ffffff';

      switch (booking.status) {
        case 'pending':
          backgroundColor = '#fbbf24'; // gold
          borderColor = '#f59e0b';
          textColor = '#1f2937'; // dark text for better visibility
          break;
        case 'accepted':
          backgroundColor = '#025ddd'; // primary blue
          borderColor = '#0047b3';
          break;
        case 'paid':
          backgroundColor = '#8b5cf6'; // purple
          borderColor = '#7c3aed';
          break;
        case 'completed':
          backgroundColor = '#10b981'; // green
          borderColor = '#059669';
          break;
        case 'refused':
          backgroundColor = '#ef4444'; // red
          borderColor = '#dc2626';
          break;
      }

      return {
        id: booking._id,
        title: `${booking.client.nom} ${booking.client.prenom}${booking.urgency === 'urgent' ? ' 🔥' : ''}`,
        start: eventDate.toISOString(),
        end: endDate.toISOString(),
        backgroundColor,
        borderColor,
        textColor,
        extendedProps: {
          bookingData: booking
        }
      };
    });

    console.log('✅ Events générés:', events.length, events);
    this.calendarOptions.update(options => ({
      ...options,
      events
    }));
  }

  handleEventClick(clickInfo: EventClickArg) {
    const booking: Booking = clickInfo.event.extendedProps['bookingData'];
    this.router.navigate(['/manage-bookings', booking._id]);
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'En attente',
      accepted: 'Accepté',
      paid: 'Payé',
      completed: 'Terminé',
      refused: 'Refusé'
    };
    return labels[status] || status;
  }
}
