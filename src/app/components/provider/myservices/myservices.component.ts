import { Component, ElementRef, OnInit, AfterViewInit, PLATFORM_ID, Inject, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import lottie from 'lottie-web';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-myservices',
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './myservices.component.html',
  styleUrl: './myservices.component.scss'
})
export class MyservicesComponent implements OnInit, AfterViewInit {
  @ViewChild('lottieContainer') lottieContainer!: ElementRef;

  calendarOptions!: CalendarOptions;
  animation: any;
  isBrowser = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      locale: frLocale,
      allDaySlot: false,
      nowIndicator: true,
      selectable: true,
      slotMinTime: '08:00:00',
      slotMaxTime: '20:00:00',

      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },

      events: [
        { title: 'Réparation - Client A', start: '2025-11-05T10:00', end: '2025-11-05T11:30', color: '#133b5fff' },
        { title: 'Installation - Client B', start: '2025-11-07T14:00', end: '2025-11-07T15:30', color: '#42a5f5' },
        { title: 'Consultation - Client C', start: '2025-11-10T09:30', end: '2025-11-10T10:30', color: '#46769eff' }
      ],

      dateClick: this.onDateClick.bind(this),
      eventClick: this.onEventClick.bind(this)
    };
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.loadLottie();
    }
  }

  private loadLottie() {
    this.animation = lottie.loadAnimation({
      container: this.lottieContainer.nativeElement,
      renderer: 'svg',
      autoplay: true,
      loop: true,
      path: '/agenda.json'
    });
  }

  onDateClick(info: any) {
    Swal.fire({
      title: '📅 Date sélectionnée',
      html: `
        <div style="padding: 1.5rem;">
          <div style="font-size: 1.5rem; font-weight: 700; color: #3b82f6; margin-bottom: 1rem; text-transform: capitalize;">
            ${new Date(info.dateStr).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <p style="color: #64748b; font-size: 0.95rem; margin: 0;">Cliquez sur "Nouveau" pour ajouter un rendez-vous</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3b82f6',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-2xl shadow-2xl border-0',
        title: 'text-2xl font-bold text-gray-800',
        confirmButton: 'rounded-xl px-8 py-3 font-semibold shadow-lg'
      }
    });
  }

  onEventClick(info: any) {
    const event = info.event;
    const startTime = event.start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const endTime = event.end ? event.end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
    const dateStr = event.start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    
    Swal.fire({
      title: '📋 Détails du Rendez-vous',
      html: `
        <div style="max-width: 100%;">
          <div style="border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            <div style="padding: 20px; color: white; display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, ${event.backgroundColor || '#3b82f6'} 0%, ${event.backgroundColor || '#2563eb'} 100%);">
              <i class="fas fa-briefcase" style="font-size: 24px;"></i>
              <h3 style="margin: 0; font-size: 1.25rem; font-weight: 700;">${event.title}</h3>
            </div>
            
            <div style="padding: 24px; background: #f8fafc; display: flex; flex-direction: column; gap: 16px;">
              <div style="display: flex; align-items: center; gap: 16px; background: white; padding: 16px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
                <div style="width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; background: #eff6ff; color: #3b82f6;">
                  <i class="fas fa-calendar-day"></i>
                </div>
                <div style="flex: 1; display: flex; flex-direction: column; gap: 4px; text-align: left;">
                  <span style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">Date</span>
                  <span style="font-size: 1rem; font-weight: 600; color: #1e293b;">${dateStr}</span>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; gap: 16px; background: white; padding: 16px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
                <div style="width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; background: #f0fdf4; color: #10b981;">
                  <i class="fas fa-clock"></i>
                </div>
                <div style="flex: 1; display: flex; flex-direction: column; gap: 4px; text-align: left;">
                  <span style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">Horaire</span>
                  <span style="font-size: 1rem; font-weight: 600; color: #1e293b;">${startTime} ${endTime ? '- ' + endTime : ''}</span>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; gap: 16px; background: white; padding: 16px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
                <div style="width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; background: #fef3c7; color: #f59e0b;">
                  <i class="fas fa-user"></i>
                </div>
                <div style="flex: 1; display: flex; flex-direction: column; gap: 4px; text-align: left;">
                  <span style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">Client</span>
                  <span style="font-size: 1rem; font-weight: 600; color: #1e293b;">À confirmer</span>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; gap: 16px; background: white; padding: 16px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
                <div style="width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; background: #fae8ff; color: #8b5cf6;">
                  <i class="fas fa-info-circle"></i>
                </div>
                <div style="flex: 1; display: flex; flex-direction: column; gap: 4px; text-align: left;">
                  <span style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">Statut</span>
                  <span style="font-size: 1rem; font-weight: 600; color: #1e293b;">
                    <span style="display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 0.875rem; font-weight: 600; background: #d1fae5; color: #065f46;">Confirmé</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
      confirmButtonText: 'Fermer',
      confirmButtonColor: '#3b82f6',
      background: '#ffffff',
      width: '600px',
      customClass: {
        popup: 'rounded-2xl shadow-2xl border-0',
        title: 'text-2xl font-bold text-gray-800',
        confirmButton: 'rounded-xl px-8 py-3 font-semibold shadow-lg'
      }
    });
  }

  goToPastServices() {
    this.router.navigate(['/past-services']);
  }

  goToUpcomingServices() {
    this.router.navigate(['/upcoming-services']);
  }
}
