import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private apiUrl = "http://localhost:5000/api/profile";

  constructor(private http: HttpClient) {}

  // ===============================  
  // GET USER
  // ===============================
  getUser(userId: string) {
    return this.http.get(`${this.apiUrl}/users/${userId}`);
  }

  // ===============================
  // GET PROVIDER
  // ===============================
  getProvider(userId: string) {
    return this.http.get(`${this.apiUrl}/providers/${userId}`);
  }

  // ===============================
  // UPDATE USER (txt)
  // ===============================
  updateUser(userId: string, data: any) {
    return this.http.put(`${this.apiUrl}/users/${userId}`, data);
  }

  // ===============================
  // UPDATE PROVIDER (txt)
  // ===============================
  updateProvider(userId: string, data: any) {
    return this.http.put(`${this.apiUrl}/providers/${userId}/profile`, data);
  }

  // ===============================
  // 🔵 UPDATE PHOTO
  // ===============================
  updatePhoto(userId: string, file: File) {
    const form = new FormData();
    form.append("photo", file);
    return this.http.put(`${this.apiUrl}/users/${userId}/photo`, form);
  }
  

  // ===============================
  // 🔵 ADD CERTIFICATIONS
  // ===============================
  updateCertifications(userId: string, files: File[]) {
    const form = new FormData();
    files.forEach(f => form.append("certifications", f));
    return this.http.put(`${this.apiUrl}/providers/${userId}/certifications`, form);
  }

  // ===============================
  // 🔵 ADD DOCUMENTS
  // ===============================
  updateDocuments(userId: string, files: File[]) {
    const form = new FormData();
    files.forEach(f => form.append("documents", f));
    return this.http.put(`${this.apiUrl}/providers/${userId}/documents`, form);
  }
uploadFiles(userId: string, type: 'documents' | 'certifications', data: FormData) {
  return this.http.put(`${this.apiUrl}/providers/${userId}/${type}`, data);
}



}
