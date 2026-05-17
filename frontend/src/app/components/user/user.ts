import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user';
import { AuthService } from '../../services/auth';
import { UploadService } from '../../services/upload';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class UserComponent {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private uploadService = inject(UploadService);
  private router = inject(Router);

  // ===== USER CRUD =====
  users = signal<any[]>([]);
  name = '';
  age = '';
  editingId: string | null = null;
  editName = '';
  editAge = '';

  // ===== SEARCH & FILTER =====
  searchTerm = '';
  minAge = '';
  maxAge = '';

  // ===== SORT =====
  sortBy = '';
  sortOrder = 'asc';

  // ===== PAGINATION =====
  currentPage = signal(1);
  totalPages = signal(1);
  totalUsers = signal(0);

  // ===== FILE UPLOAD =====
  selectedFile: File | null = null;
  uploadedFiles = signal<any[]>([]);
  uploadMsg = '';

  constructor() {
    this.getUsers();
    this.getFiles();
  }

  // ===== READ (with search, filter, sort, pagination) =====
  getUsers() {
    const params: any = {
      page: this.currentPage(),
      limit: 5,
    };
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.minAge) params.minAge = this.minAge;
    if (this.maxAge) params.maxAge = this.maxAge;
    if (this.sortBy) {
      params.sortBy = this.sortBy;
      params.order = this.sortOrder;
    }

    this.userService.getUsers(params).subscribe((res: any) => {
      this.users.set(res.users);
      this.totalPages.set(res.totalPages);
      this.totalUsers.set(res.total);
    });
  }

  // ===== SEARCH =====
  onSearch() {
    this.currentPage.set(1);
    this.getUsers();
  }

  // ===== SORT =====
  onSort(field: string) {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.getUsers();
  }

  // ===== PAGINATION =====
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.getUsers();
  }

  // ===== CREATE =====
  addUser() {
    if (!this.name || !this.age) return;
    this.userService.addUser({ name: this.name, age: this.age }).subscribe(() => {
      this.getUsers();
      this.name = '';
      this.age = '';
    });
  }

  // ===== UPDATE =====
  editUser(user: any) {
    this.editingId = user._id;
    this.editName = user.name;
    this.editAge = user.age;
  }

  updateUser() {
    if (!this.editingId) return;
    this.userService
      .updateUser(this.editingId, { name: this.editName, age: this.editAge })
      .subscribe(() => {
        this.getUsers();
        this.cancelEdit();
      });
  }

  cancelEdit() {
    this.editingId = null;
    this.editName = '';
    this.editAge = '';
  }

  // ===== DELETE =====
  deleteUser(id: string) {
    this.userService.deleteUser(id).subscribe(() => this.getUsers());
  }

  // ===== FILE UPLOAD =====
  onFileSelect(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
    if (!this.selectedFile) return;
    this.uploadService.uploadFile(this.selectedFile).subscribe((res: any) => {
      this.uploadMsg = res.message;
      this.selectedFile = null;
      this.getFiles();
      setTimeout(() => (this.uploadMsg = ''), 3000);
    });
  }

  getFiles() {
    this.uploadService.getFiles().subscribe((res: any) => {
      this.uploadedFiles.set(res);
    });
  }

  // ===== AUTH =====
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
