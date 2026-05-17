import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/auth';

  // REGISTER
  register(data: any) {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // LOGIN
  login(data: any) {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  // GET PROFILE (send token in header)
  getProfile() {
    return this.http.get(`${this.apiUrl}/profile`, {
      headers: { Authorization: `Bearer ${this.getToken()}` },
    });
  }

  // SAVE TOKEN
  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  // GET TOKEN
  getToken(): string {
    return localStorage.getItem('token') || '';
  }

  // LOGOUT
  logout() {
    localStorage.removeItem('token');
  }

  // CHECK IF LOGGED IN
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
