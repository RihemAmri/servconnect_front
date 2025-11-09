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

@Component({
  selector: 'app-myservices',
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './myservices.component.html',
  styleUrl: './myservices.component.scss'
})

export class MyservicesComponent implements OnInit, AfterViewInit {
  @ViewChild('lottieContainer', { static: false }) lottieContainer!: ElementRef;
  calendarOptions: CalendarOptions = {
  plugins: [],
  initialView: '', // valeur temporaire
};
  
  isBrowser = false;
  animation: any;
constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  
  ngOnInit(): void {
    if (this.isBrowser) {
      this.calendarOptions = {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: 'timeGridWeek',
        locale: frLocale,
        allDaySlot: false,
        slotMinTime: '08:00:00',
        slotMaxTime: '20:00:00',
        selectable: true,
        editable: false,
        nowIndicator: true,
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: [
          { title: 'Réparation - Client A', start: '2025-11-05T10:00:00', end: '2025-11-05T11:30:00', color: '#133b5fff' },
          { title: 'Installation - Client B', start: '2025-11-07T14:00:00', end: '2025-11-07T15:30:00', color: '#42a5f5' },
          { title: 'Consultation - Client C', start: '2025-11-10T09:30:00', end: '2025-11-10T10:30:00', color: '#46769eff' }
        ],
        dateClick: this.onDateClick.bind(this),
        eventClick: this.onEventClick.bind(this)
      };
    }
  
   
  }
 ngAfterViewInit(): void {
    if (this.isBrowser && this.lottieContainer) {
      this.animation = lottie.loadAnimation({
        container: this.lottieContainer.nativeElement,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/agenda.json'
      });
    }
  }
  ngAfterViewChecked(): void {
  if (this.isBrowser && !this.animation && document.getElementById('lottie-container')) {
    this.loadLottie();
  }
}
  private loadLottie() {
  const container = document.getElementById('lottie-container');
  if (!container || this.animation) return;

  this.animation = lottie.loadAnimation({
    container,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '/agenda.json'
  });
}

  onDateClick(info: any) {
    alert(`📅 Date sélectionnée : ${info.dateStr}`);
  }

  onEventClick(info: any) {
    alert(`🕓 Détails du rendez-vous : ${info.event.title}`);
  }

  goToPastServices() {
  this.router.navigate(['/past-services']);
}

  goToUpcomingServices() {
  this.router.navigate(['/upcoming-services']);
}
}
