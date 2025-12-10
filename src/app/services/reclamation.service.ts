import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReclamationService {
  private apiUrl = "http://localhost:5000/api/reclamations";

  constructor(private http: HttpClient) {}

  // Ajouter une réclamation
  sendReclamation(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // Récupérer toutes les réclamations de l'utilisateur
    getMyReclamations(userId: string): Observable<any> {
      return this.http.get(`${this.apiUrl}/me?userId=${userId}`);
    }


  // Pour l'admin : récupérer toutes les réclamations
  getAllReclamations(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Pour l'admin : répondre à une réclamation
  respondReclamation(id: string, payload: { reponse: string, status: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/respond`, payload);
  }

}
