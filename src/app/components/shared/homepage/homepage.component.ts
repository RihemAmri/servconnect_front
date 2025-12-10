import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { LottieComponent } from 'ngx-lottie';
import { ButtonModule } from 'primeng/button';
import { AppRoutingModule } from "../../../app-routing.module";
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, LottieComponent, ButtonModule, RouterModule],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('800ms 200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class HomepageComponent implements OnInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // Configuration Lottie optimisée
  lottieOptions = {
    path: 'assets/animations/office-team-hello.json',
    loop: true,
    autoplay: true,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid meet',
      progressiveLoad: true,
      hideOnTransparent: true
    }
  };

  // Statistiques
  stats = [
    { value: '500+', label: 'Prestataires Inscrits', icon: '👥' },
    { value: '1K+', label: 'Clients Satisfaits', icon: '😊' },
    { value: '4.8★', label: 'Note Moyenne', icon: '⭐' },
    { value: '24/7', label: 'Support & Assistance', icon: '🛟' }
  ];

  // Services populaires
  services = [
    { icon: '🔧', name: 'Plomberie', count: '120+ pros', color: '#3B82F6' },
    { icon: '⚡', name: 'Électricité', count: '95+ pros', color: '#FBBF24' },
    { icon: '🧹', name: 'Ménage', count: '200+ pros', color: '#10B981' },
    { icon: '✂️', name: 'Coiffure', count: '85+ pros', color: '#EC4899' },
    { icon: '📚', name: 'Cours particuliers', count: '150+ pros', color: '#8B5CF6' },
    { icon: '🎨', name: 'Peinture', count: '70+ pros', color: '#F59E0B' }
  ];

  // Fonctionnalités
  features = [
    {
      icon: '🔍',
      title: 'Recherche Intelligente',
      description: 'Trouvez le professionnel parfait par localisation, service et prix'
    },
    {
      icon: '✅',
      title: 'Professionnels Vérifiés',
      description: 'Tous nos prestataires sont vérifiés avec badge de confiance'
    },
    {
      icon: '⭐',
      title: 'Avis Authentiques',
      description: 'Consultez les notes et commentaires de vrais clients'
    },
    {
      icon: '💬',
      title: 'Chat Intégré',
      description: 'Communiquez directement avec votre prestataire'
    },
    {
      icon: '📅',
      title: 'Réservation Simple',
      description: 'Réservez en un clic, immédiatement ou plus tard'
    },
    {
      icon: '📍',
      title: 'Géolocalisation',
      description: 'Trouvez les professionnels les plus proches de vous'
    }
  ];

  // Témoignages
  testimonials = [
    {
      name: 'Sarah Ben Ali',
      role: 'Cliente',
      avatar: '👩',
      rating: 5,
      comment: 'Service excellent ! J\'ai trouvé un plombier en 5 minutes. Professionnel et rapide.'
    },
    {
      name: 'Mohamed Trabelsi',
      role: 'Électricien',
      avatar: '👨',
      rating: 5,
      comment: 'ServConnect m\'a permis de trouver plus de clients. Interface simple et efficace !'
    },
    {
      name: 'Leila Mansour',
      role: 'Cliente',
      avatar: '👩',
      rating: 5,
      comment: 'Très pratique pour trouver des services de qualité près de chez moi.'
    }
  ];

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0 });
      this.animateCounters();
    }
  }

  /**
   * Callback appelé quand l'animation Lottie est créée
   * @param event L'événement d'AnimationCreated
   */
  onAnimationCreated(event: any): void {
    // L'animation est prête et en cours de lecture
    console.log('Animation Lottie chargée et prête ✅');
    
    // Accédez à l'AnimationItem via event.animationItem si nécessaire
    const animationItem = event.animationItem;
    if (animationItem) {
      console.log('Vitesse animation:', animationItem.playSpeed);
    }
  }

  /**
   * Anime les compteurs de statistiques lors du scroll
   */


private initScrollAnimations(): void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        if (entry.target.classList.contains('stat-card')) {
          this.startCounter(entry.target.querySelector('.stat-value'));
        }
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.service-card, .feature-card, .testimonial-card, .stat-card').forEach(el => {
    observer.observe(el);
  });
}

private startCounter(element: HTMLElement | null): void {
  if (!element) return;
  const target = element.textContent?.includes('+') ? parseInt(element.textContent!) : 0;
  let count = 0;
  const increment = target / 50;
  const timer = setInterval(() => {
    count += increment;
    if (count >= target) {
      element.textContent = target + (element.textContent?.includes('+') ? '+' : '');
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(count) + '+';
    }
  }, 30);
}



  animateCounters(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    });

    setTimeout(() => {
      const counters = document.querySelectorAll('.stat-value');
      counters.forEach(counter => observer.observe(counter));
    }, 100);
  }

  /**
   * Scroll vers la section services
   */
  scrollToServices(): void {
    const servicesElement = document.getElementById('services');
    if (servicesElement) {
      servicesElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
}