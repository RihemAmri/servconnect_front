import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Reservation {
  _id: string;
  clientId: string;
  clientNom: string;
  clientPhoto?: string;
  clientTelephone: string;
  prestataireId: string;
  prestataireNom: string;
  prestatairePhoto?: string;
  prestataireTelephone: string;
  metier: string;
  dateReservation: Date;
  dateService: Date;
  heureService?: string;
  statut: 'en_attente' | 'confirmee' | 'en_cours' | 'terminee' | 'annulee';
  prix: number;
  description: string;
  adresse: string;
  ville: string;
  notes?: string;
  motifAnnulation?: string;
  dateAnnulation?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationsService {
  
  private reservationsSubject = new BehaviorSubject<Reservation[]>([
    {
      _id: 'res1',
      clientId: '1',
      clientNom: 'Omar Ben Ali',
      clientPhoto: 'https://i.pravatar.cc/150?img=12',
      clientTelephone: '+216 98 123 456',
      prestataireId: '2',
      prestataireNom: 'Leila Trabelsi',
      prestatairePhoto: 'https://i.pravatar.cc/150?img=5',
      prestataireTelephone: '+216 22 456 789',
      metier: 'Plombier',
      dateReservation: new Date('2024-11-01'),
      dateService: new Date('2024-11-15'),
      heureService: '10:00',
      statut: 'confirmee',
      prix: 80,
      description: 'Réparation fuite d\'eau cuisine',
      adresse: '25 Avenue Habib Bourguiba, La Marsa',
      ville: 'Tunis',
      notes: 'Urgence - fuite importante'
    },
    {
      _id: 'res2',
      clientId: '1',
      clientNom: 'Omar Ben Ali',
      clientPhoto: 'https://i.pravatar.cc/150?img=12',
      clientTelephone: '+216 98 123 456',
      prestataireId: '3',
      prestataireNom: 'Mohamed Khediri',
      prestatairePhoto: 'https://i.pravatar.cc/150?img=33',
      prestataireTelephone: '+216 55 789 012',
      metier: 'Électricien',
      dateReservation: new Date('2024-11-08'),
      dateService: new Date('2024-11-20'),
      heureService: '14:00',
      statut: 'en_attente',
      prix: 120,
      description: 'Installation éclairage LED salon',
      adresse: '25 Avenue Habib Bourguiba, La Marsa',
      ville: 'Tunis'
    },
    {
      _id: 'res3',
      clientId: '4',
      clientNom: 'Fatma Amari',
      clientPhoto: 'https://i.pravatar.cc/150?img=9',
      clientTelephone: '+216 20 345 678',
      prestataireId: '2',
      prestataireNom: 'Leila Trabelsi',
      prestatairePhoto: 'https://i.pravatar.cc/150?img=5',
      prestataireTelephone: '+216 22 456 789',
      metier: 'Plombier',
      dateReservation: new Date('2024-10-20'),
      dateService: new Date('2024-11-05'),
      heureService: '09:00',
      statut: 'terminee',
      prix: 100,
      description: 'Installation toilettes',
      adresse: 'Rue Ibn Khaldoun, Carthage',
      ville: 'Tunis'
    },
    {
      _id: 'res4',
      clientId: '6',
      clientNom: 'Ines Souissi',
      clientPhoto: 'https://i.pravatar.cc/150?img=10',
      clientTelephone: '+216 54 321 098',
      prestataireId: '5',
      prestataireNom: 'Youssef Gharbi',
      prestatairePhoto: 'https://i.pravatar.cc/150?img=15',
      prestataireTelephone: '+216 99 876 543',
      metier: 'Menuisier',
      dateReservation: new Date('2024-11-07'),
      dateService: new Date('2024-11-25'),
      heureService: '11:00',
      statut: 'confirmee',
      prix: 250,
      description: 'Fabrication armoire sur mesure',
      adresse: 'Résidence Les Pins, Lac 2',
      ville: 'Tunis'
    },
    {
      _id: 'res5',
      clientId: '9',
      clientNom: 'Ali Chakroun',
      clientPhoto: 'https://i.pravatar.cc/150?img=51',
      clientTelephone: '+216 21 987 654',
      prestataireId: '8',
      prestataireNom: 'Samia Mejri',
      prestatairePhoto: 'https://i.pravatar.cc/150?img=20',
      prestataireTelephone: '+216 26 654 321',
      metier: 'Femme de ménage',
      dateReservation: new Date('2024-11-10'),
      dateService: new Date('2024-11-18'),
      heureService: '08:00',
      statut: 'en_cours',
      prix: 45,
      description: 'Ménage complet appartement 3 pièces',
      adresse: 'Avenue de la Corniche, Bizerte',
      ville: 'Bizerte'
    },
    {
      _id: 'res6',
      clientId: '10',
      clientNom: 'Nour Hamdi',
      clientPhoto: 'https://i.pravatar.cc/150?img=25',
      clientTelephone: '+216 58 111 222',
      prestataireId: '11',
      prestataireNom: 'Karim Saidi',
      prestatairePhoto: 'https://i.pravatar.cc/150?img=68',
      prestataireTelephone: '+216 97 444 555',
      metier: 'Jardinier',
      dateReservation: new Date('2024-11-05'),
      dateService: new Date('2024-11-12'),
      heureService: '07:00',
      statut: 'annulee',
      prix: 60,
      description: 'Entretien jardin et taille arbres',
      adresse: 'Villa Les Jasmins, Raoued',
      ville: 'Ariana',
      motifAnnulation: 'Client indisponible',
      dateAnnulation: new Date('2024-11-11')
    },
    {
      _id: 'res7',
      clientId: '1',
      clientNom: 'Omar Ben Ali',
      clientPhoto: 'https://i.pravatar.cc/150?img=12',
      clientTelephone: '+216 98 123 456',
      prestataireId: '5',
      prestataireNom: 'Youssef Gharbi',
      prestatairePhoto: 'https://i.pravatar.cc/150?img=15',
      prestataireTelephone: '+216 99 876 543',
      metier: 'Menuisier',
      dateReservation: new Date('2024-11-12'),
      dateService: new Date('2024-12-01'),
      heureService: '10:00',
      statut: 'en_attente',
      prix: 180,
      description: 'Réparation porte d\'entrée',
      adresse: '25 Avenue Habib Bourguiba, La Marsa',
      ville: 'Tunis'
    },
    {
      _id: 'res8',
      clientId: '4',
      clientNom: 'Fatma Amari',
      clientPhoto: 'https://i.pravatar.cc/150?img=9',
      clientTelephone: '+216 20 345 678',
      prestataireId: '3',
      prestataireNom: 'Mohamed Khediri',
      prestatairePhoto: 'https://i.pravatar.cc/150?img=33',
      prestataireTelephone: '+216 55 789 012',
      metier: 'Électricien',
      dateReservation: new Date('2024-10-28'),
      dateService: new Date('2024-11-10'),
      heureService: '15:00',
      statut: 'terminee',
      prix: 95,
      description: 'Dépannage électrique urgent',
      adresse: 'Rue Ibn Khaldoun, Carthage',
      ville: 'Tunis'
    }
  ]);

  reservations$ = this.reservationsSubject.asObservable();

  getReservations(): Observable<Reservation[]> {
    return this.reservations$;
  }

  getReservationById(id: string): Reservation | undefined {
    return this.reservationsSubject.value.find(r => r._id === id);
  }

  getClientReservations(clientId: string): Reservation[] {
    return this.reservationsSubject.value.filter(r => r.clientId === clientId);
  }

  getPrestataireReservations(prestataireId: string): Reservation[] {
    return this.reservationsSubject.value.filter(r => r.prestataireId === prestataireId);
  }

  updateReservationStatus(id: string, statut: Reservation['statut']): void {
    const reservations = this.reservationsSubject.value;
    const index = reservations.findIndex(r => r._id === id);
    if (index !== -1) {
      reservations[index].statut = statut;
      this.reservationsSubject.next([...reservations]);
    }
  }

  cancelReservation(id: string, motif: string): void {
    const reservations = this.reservationsSubject.value;
    const index = reservations.findIndex(r => r._id === id);
    if (index !== -1) {
      reservations[index].statut = 'annulee';
      reservations[index].motifAnnulation = motif;
      reservations[index].dateAnnulation = new Date();
      this.reservationsSubject.next([...reservations]);
    }
  }

  deleteReservation(id: string): void {
    const reservations = this.reservationsSubject.value.filter(r => r._id !== id);
    this.reservationsSubject.next(reservations);
  }
}