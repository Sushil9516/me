import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/upload';

  // UPLOAD FILE
  uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(this.apiUrl, formData);
  }

  // GET ALL FILES
  getFiles() {
    return this.http.get(this.apiUrl);
  }
}
