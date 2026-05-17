import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/users';

  // GET users with search, filter, sort, pagination
  getUsers(params: any = {}) {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get(this.apiUrl, { params: httpParams });
  }

  // POST add user
  addUser(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  // PUT update user
  updateUser(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // DELETE user
  deleteUser(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
