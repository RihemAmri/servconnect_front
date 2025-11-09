import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.scss'
})
export class ExploreComponent {
  selectedCategory: string = 'Tous';
  selectedRating: string = 'all';
  selectedPrice: string = 'all';
  searchQuery: string = '';

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

  allServices = [
    {
      title: 'Plombier Professionnel',
      provider: 'Ahmed Ben Ali',
      rating: 4.8,
      reviews: 127,
      price: 50,
      priceLabel: '50 DT/heure',
      image: '🔧',
      category: 'Plomberie',
      location: 'Tunis',
      verified: true,
      description: 'Expert en réparation et installation de plomberie avec 10 ans d\'expérience',
      features: ['Disponible 24/7', 'Devis gratuit', 'Garantie 1 an']
    },
    {
      title: 'Service de Ménage Premium',
      provider: 'Fatma Trabelsi',
      rating: 4.9,
      reviews: 203,
      price: 30,
      priceLabel: '30 DT/heure',
      image: '🧹',
      category: 'Ménage',
      location: 'Ariana',
      verified: true,
      description: 'Service de ménage complet avec produits écologiques et équipement professionnel',
      features: ['Produits bio', 'Assurance incluse', 'Équipe formée']
    },
    {
      title: 'Garde d\'Enfants Certifiée',
      provider: 'Sarah Mansour',
      rating: 5.0,
      reviews: 89,
      price: 25,
      priceLabel: '25 DT/heure',
      image: '👶',
      category: 'Babysitting',
      location: 'Ben Arous',
      verified: true,
      description: 'Nounou diplômée avec certification en secourisme et pédagogie infantile',
      features: ['Diplômée petite enfance', 'Bilingue', 'Flexibilité horaires']
    },
    {
      title: 'Électricien Agréé',
      provider: 'Mohamed Hamdi',
      rating: 4.7,
      reviews: 156,
      price: 60,
      priceLabel: '60 DT/heure',
      image: '⚡',
      category: 'Électricité',
      location: 'Tunis',
      verified: true,
      description: 'Installation électrique complète et dépannage d\'urgence certifié',
      features: ['Certifié STEG', 'Intervention rapide', 'Matériel fourni']
    },
    {
      title: 'Jardinier Expert',
      provider: 'Karim Zouari',
      rating: 4.6,
      reviews: 94,
      price: 40,
      priceLabel: '40 DT/heure',
      image: '🌱',
      category: 'Jardinage',
      location: 'La Marsa',
      verified: true,
      description: 'Entretien de jardins et espaces verts avec expertise en horticulture',
      features: ['Taille artistique', 'Système arrosage', 'Conseil gratuit']
    },
    {
      title: 'Peintre Professionnel',
      provider: 'Nabil Gharbi',
      rating: 4.8,
      reviews: 112,
      price: 45,
      priceLabel: '45 DT/heure',
      image: '🎨',
      category: 'Peinture',
      location: 'Manouba',
      verified: true,
      description: 'Peinture intérieure et extérieure avec finition impeccable',
      features: ['Peinture écologique', 'Finition premium', 'Nettoyage inclus']
    },
    {
      title: 'Réparation de Climatisation',
      provider: 'Ali Jendoubi',
      rating: 4.5,
      reviews: 78,
      price: 55,
      priceLabel: '55 DT/heure',
      image: '❄️',
      category: 'Climatisation',
      location: 'Tunis',
      verified: false,
      description: 'Installation, maintenance et réparation de tous types de climatiseurs',
      features: ['Diagnostic gratuit', 'Pièces d\'origine', 'Entretien annuel']
    },
    {
      title: 'Service de Déménagement',
      provider: 'Transport Express',
      rating: 4.3,
      reviews: 145,
      price: 150,
      priceLabel: '150 DT/service',
      image: '📦',
      category: 'Déménagement',
      location: 'Tunis',
      verified: true,
      description: 'Déménagement complet avec emballage et transport sécurisé',
      features: ['Assurance complète', 'Emballage inclus', 'Équipe pro']
    },
    {
      title: 'Plomberie d\'Urgence',
      provider: 'Rami Bouazizi',
      rating: 4.9,
      reviews: 198,
      price: 70,
      priceLabel: '70 DT/heure',
      image: '🔧',
      category: 'Plomberie',
      location: 'Sfax',
      verified: true,
      description: 'Intervention d\'urgence 24h/24 pour fuites et problèmes de plomberie',
      features: ['Urgence 24/7', 'Équipement moderne', 'Prix transparents']
    },
    {
      title: 'Ménage Écologique',
      provider: 'Clean & Green',
      rating: 4.7,
      reviews: 167,
      price: 35,
      priceLabel: '35 DT/heure',
      image: '🧹',
      category: 'Ménage',
      location: 'Sousse',
      verified: true,
      description: 'Nettoyage respectueux de l\'environnement avec produits 100% naturels',
      features: ['Produits naturels', 'Zéro plastique', 'Efficacité garantie']
    },
    {
      title: 'Babysitter Bilingue',
      provider: 'Amira Ferjani',
      rating: 4.8,
      reviews: 134,
      price: 30,
      priceLabel: '30 DT/heure',
      image: '👶',
      category: 'Babysitting',
      location: 'Tunis',
      verified: true,
      description: 'Garde d\'enfants avec activités éducatives et apprentissage des langues',
      features: ['Français/Anglais', 'Activités ludiques', 'Aide aux devoirs']
    },
    {
      title: 'Installation Électrique',
      provider: 'Elec Pro Services',
      rating: 4.6,
      reviews: 201,
      price: 65,
      priceLabel: '65 DT/heure',
      image: '⚡',
      category: 'Électricité',
      location: 'Monastir',
      verified: false,
      description: 'Installation complète de systèmes électriques pour maisons et bureaux',
      features: ['Domotique', 'Économie énergie', 'Maintenance']
    }
  ];

  get filteredServices() {
    return this.allServices.filter(service => {
      const matchCategory = this.selectedCategory === 'Tous' || service.category === this.selectedCategory;
      
      const matchRating = this.selectedRating === 'all' || 
        (this.selectedRating === '4.5' && service.rating >= 4.5) ||
        (this.selectedRating === '4.0' && service.rating >= 4.0);
      
      const matchPrice = this.selectedPrice === 'all' ||
        (this.selectedPrice === 'low' && service.price < 40) ||
        (this.selectedPrice === 'medium' && service.price >= 40 && service.price <= 60) ||
        (this.selectedPrice === 'high' && service.price > 60);

      return matchCategory && matchRating && matchPrice;
    });
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }
}
