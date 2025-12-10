import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = 'http://localhost:5000/api/chatbot'; 


  constructor(private http: HttpClient) {}

 send(message: string, userName?: string): Observable<any> {
  return this.http.post(this.apiUrl, {
    text: message,           // <-- changer message → text
    userName: userName ?? '' // facultatif, si tu veux envoyer le nom
  });
}
}
