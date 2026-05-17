# 🚀 MEAN Stack — Complete Revision Cheatsheet

> **One file to revise everything before your coding challenge!**
> Each section has the concept + code + link to your actual project file.

---

## 📁 Project Structure

```
mean-user-app/
├── backend/
│   ├── server.js              ← Express entry point
│   ├── middleware/auth.js     ← JWT middleware
│   ├── models/User.js         ← Mongoose schema (CRUD entity)
│   ├── models/Auth.js         ← Mongoose schema (Auth user)
│   ├── routes/userRoutes.js   ← CRUD + Search + Sort + Pagination
│   ├── routes/authRoutes.js   ← Register + Login + Profile
│   ├── routes/uploadRoutes.js ← File upload (multer)
│   └── uploads/               ← Uploaded files
└── frontend/src/app/
    ├── app.config.ts          ← provideHttpClient + provideRouter
    ├── app.routes.ts          ← Route definitions
    ├── app.ts                 ← Root component (router-outlet)
    ├── guards/auth.guard.ts   ← Route protection
    ├── services/user.ts       ← User CRUD API
    ├── services/auth.ts       ← Auth API
    ├── services/upload.ts     ← Upload API
    ├── components/login/      ← Login page
    ├── components/register/   ← Register page
    └── components/user/       ← Dashboard (all features)
```

---

## 🔧 STEP 1 — Backend Setup

### Packages: `npm install express mongoose cors bcryptjs jsonwebtoken multer`

### [server.js](file:///c:/Users/sonis/OneDrive/Desktop/mean-user-app/backend/server.js)

```javascript
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

app.use(cors());                    // Allow Angular (port 4200) to call API
app.use(express.json());            // Parse JSON request body
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve files

mongoose.connect("mongodb://127.0.0.1:27017/meanapp")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/api/users", userRoutes);   // CRUD routes
app.use("/api/auth", authRoutes);    // Auth routes
app.use("/api/upload", uploadRoutes); // Upload routes

app.listen(3000, () => console.log("Server running on port 3000"));
```

> [!TIP]
> **3 middleware to always remember:** `cors()`, `express.json()`, `express.static()`

---

## 🔧 STEP 2 — Mongoose Models

### [models/User.js](file:///c:/Users/sonis/OneDrive/Desktop/mean-user-app/backend/models/User.js) — CRUD Entity

```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age:  { type: Number, required: true }
});

module.exports = mongoose.model("User", userSchema);
// Creates collection "users" in MongoDB
```

### [models/Auth.js](file:///c:/Users/sonis/OneDrive/Desktop/mean-user-app/backend/models/Auth.js) — Auth User

```javascript
const mongoose = require("mongoose");

const authSchema = new mongoose.Schema({
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true }  // stored as bcrypt hash
});

module.exports = mongoose.model("Auth", authSchema);
```

> [!IMPORTANT]
> **`mongoose.model("Name", schema)`** → collection name becomes lowercase plural: "names"

---

## 🔧 STEP 3 — JWT Auth Middleware

### [middleware/auth.js](file:///c:/Users/sonis/OneDrive/Desktop/mean-user-app/backend/middleware/auth.js)

```javascript
const jwt = require("jsonwebtoken");
const SECRET = "meanapp_secret_key";

function auth(req, res, next) {
  const token = req.headers["authorization"];           // Get token from header
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET);
    req.userId = decoded.id;   // Attach user ID to request
    next();                    // Continue to route handler
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = auth;
module.exports.SECRET = SECRET;
```

> [!NOTE]
> **Flow:** Client sends `Authorization: Bearer <token>` → middleware verifies → attaches `req.userId` → route handler uses it

---

## 🔧 STEP 4 — Auth Routes (Register + Login)

### [routes/authRoutes.js](file:///c:/Users/sonis/OneDrive/Desktop/mean-user-app/backend/routes/authRoutes.js)

```javascript
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Auth = require("../models/Auth");
const authMiddleware = require("../middleware/auth");
const { SECRET } = require("../middleware/auth");

// ===== REGISTER =====
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await Auth.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);  // Hash password
    const user = new Auth({ name, email, password: hashedPassword });
    await user.save();
    res.json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== LOGIN =====
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Auth.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password); // Compare
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1h" });
    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== PROFILE (Protected) =====
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await Auth.findById(req.userId).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

| Auth Concept | Method | Key Code |
|---|---|---|
| Hash password | `bcrypt.hash(password, 10)` | 10 = salt rounds |
| Compare password | `bcrypt.compare(plain, hashed)` | Returns boolean |
| Create token | `jwt.sign({ id }, SECRET, { expiresIn })` | Payload + secret |
| Verify token | `jwt.verify(token, SECRET)` | Returns decoded payload |
| Hide password | `.select("-password")` | Exclude field from response |

---

## 🔧 STEP 5 — CRUD + Search + Sort + Pagination

### [routes/userRoutes.js](file:///c:/Users/sonis/OneDrive/Desktop/mean-user-app/backend/routes/userRoutes.js)

```javascript
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ===== GET ALL (Search + Filter + Sort + Pagination) =====
router.get("/", async (req, res) => {
  try {
    const { search, minAge, maxAge, sortBy, order, page, limit } = req.query;

    let filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };  // Case-insensitive
    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = Number(minAge);
      if (maxAge) filter.age.$lte = Number(maxAge);
    }

    let sortOption = {};
    if (sortBy) sortOption[sortBy] = order === "desc" ? -1 : 1;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 5;

    const users = await User.find(filter)
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await User.countDocuments(filter);

    res.json({ users, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== CREATE =====
router.post("/", async (req, res) => {
  const newUser = new User({ name: req.body.name, age: req.body.age });
  const saved = await newUser.save();
  res.json(saved);
});

// ===== UPDATE =====
router.put("/:id", async (req, res) => {
  const updated = await User.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, age: req.body.age },
    { new: true }    // Return UPDATED document
  );
  res.json(updated);
});

// ===== DELETE =====
router.delete("/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

module.exports = router;
```

| MongoDB Operator | Meaning | Example |
|---|---|---|
| `$regex` | Pattern match | `{ name: { $regex: "su", $options: "i" } }` |
| `$gte` | Greater than or equal | `{ age: { $gte: 18 } }` |
| `$lte` | Less than or equal | `{ age: { $lte: 60 } }` |
| `.sort({field: 1})` | Ascending sort | `-1` for descending |
| `.skip(n)` | Skip first n docs | For pagination |
| `.limit(n)` | Return max n docs | Page size |
| `{ new: true }` | In findByIdAndUpdate | Returns updated doc |

---

## 🔧 STEP 6 — File Upload (Multer)

### [routes/uploadRoutes.js](file:///c:/Users/sonis/OneDrive/Desktop/mean-user-app/backend/routes/uploadRoutes.js)

```javascript
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// UPLOAD
router.post("/", upload.single("file"), (req, res) => {
  res.json({ message: "File uploaded", filename: req.file.filename,
             path: `/uploads/${req.file.filename}` });
});

// LIST FILES
router.get("/", (req, res) => {
  const files = fs.readdirSync(path.join(__dirname, "../uploads"))
    .map((f) => ({ filename: f, path: `/uploads/${f}` }));
  res.json(files);
});

module.exports = router;
```

> [!NOTE]
> **Multer key points:** `upload.single("file")` for one file, `upload.array("files", 5)` for multiple. Field name must match `FormData.append("file", ...)` on frontend.

---

## 🅰️ STEP 7 — Angular App Config

### [app.config.ts](file:///c:/Users/sonis/OneDrive/Desktop/mean-user-app/frontend/src/app/app.config.ts)

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(), provideRouter(routes)],
};
```

### [app.routes.ts](file:///c:/Users/sonis/OneDrive/Desktop/mean-user-app/frontend/src/app/app.routes.ts)

```typescript
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { UserComponent } from './components/user/user';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: UserComponent, canActivate: [authGuard] },
];
```

### [app.ts](file:///c:/Users/sonis/OneDrive/Desktop/mean-user-app/frontend/src/app/app.ts)

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent {}
```

---

## 🅰️ STEP 8 — Auth Guard

### [guards/auth.guard.ts](file:///c:/Users/sonis/OneDrive/Desktop/mean-user-app/frontend/src/app/guards/auth.guard.ts)

```typescript
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (typeof localStorage !== 'undefined' && localStorage.getItem('token')) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
```

---

## 🅰️ STEP 9 — Angular Services

### [services/auth.ts](file:///c:/Users/sonis/OneDrive/Desktop/mean-user-app/frontend/src/app/services/auth.ts)

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/auth';

  register(data: any) { return this.http.post(`${this.apiUrl}/register`, data); }
  login(data: any)    { return this.http.post(`${this.apiUrl}/login`, data); }

  saveToken(token: string) { localStorage.setItem('token', token); }
  getToken(): string       { return localStorage.getItem('token') || ''; }
  logout()                 { localStorage.removeItem('token'); }
  isLoggedIn(): boolean    { return !!localStorage.getItem('token'); }
}
```

### [services/user.ts](file:///c:/Users/sonis/OneDrive/Desktop/mean-user-app/frontend/src/app/services/user.ts)

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/users';

  getUsers(params: any = {}) {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== '' && params[key] != null)
        httpParams = httpParams.set(key, params[key]);
    });
    return this.http.get(this.apiUrl, { params: httpParams });
  }

  addUser(data: any)                { return this.http.post(this.apiUrl, data); }
  updateUser(id: string, data: any) { return this.http.put(`${this.apiUrl}/${id}`, data); }
  deleteUser(id: string)            { return this.http.delete(`${this.apiUrl}/${id}`); }
}
```

### [services/upload.ts](file:///c:/Users/sonis/OneDrive/Desktop/mean-user-app/frontend/src/app/services/upload.ts)

```typescript
@Injectable({ providedIn: 'root' })
export class UploadService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/upload';

  uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);         // 'file' must match multer field name
    return this.http.post(this.apiUrl, formData);
  }

  getFiles() { return this.http.get(this.apiUrl); }
}
```

---

## 🅰️ STEP 10 — Login Component

### [components/login/login.ts](file:///c:/Users/sonis/OneDrive/Desktop/mean-user-app/frontend/src/app/components/login/login.ts)

```typescript
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  email = '';  password = '';  error = '';

  login() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.authService.saveToken(res.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => { this.error = err.error?.message || 'Login failed'; }
    });
  }
}
```

### [login.html](file:///c:/Users/sonis/OneDrive/Desktop/mean-user-app/frontend/src/app/components/login/login.html) — Key template parts

```html
@if (error) { <div class="error-msg">{{ error }}</div> }

<input type="email" [(ngModel)]="email" placeholder="Email" />
<input type="password" [(ngModel)]="password" placeholder="Password" />
<button (click)="login()">Login</button>

<a routerLink="/register">Register here</a>
```

---

## 🅰️ STEP 11 — Dashboard Component (CRUD + Search + Pagination + Upload)

### [components/user/user.ts](file:///c:/Users/sonis/OneDrive/Desktop/mean-user-app/frontend/src/app/components/user/user.ts) — Key logic

```typescript
export class UserComponent {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private uploadService = inject(UploadService);
  private router = inject(Router);

  // SIGNALS for zoneless change detection
  users = signal<any[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);
  totalUsers = signal(0);
  uploadedFiles = signal<any[]>([]);

  // Form fields (plain properties — ngModel handles them)
  name = '';  age = '';  searchTerm = '';  sortBy = '';  sortOrder = 'asc';

  constructor() { this.getUsers(); this.getFiles(); }

  // READ with params
  getUsers() {
    const params: any = { page: this.currentPage(), limit: 5 };
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.sortBy) { params.sortBy = this.sortBy; params.order = this.sortOrder; }

    this.userService.getUsers(params).subscribe((res: any) => {
      this.users.set(res.users);           // signal.set() triggers re-render
      this.totalPages.set(res.totalPages);
      this.totalUsers.set(res.total);
    });
  }

  addUser()    { this.userService.addUser({...}).subscribe(() => this.getUsers()); }
  updateUser() { this.userService.updateUser(id, {...}).subscribe(() => this.getUsers()); }
  deleteUser() { this.userService.deleteUser(id).subscribe(() => this.getUsers()); }

  // FILE UPLOAD
  uploadFile() {
    this.uploadService.uploadFile(this.selectedFile).subscribe(() => this.getFiles());
  }

  logout() { this.authService.logout(); this.router.navigate(['/login']); }
}
```

### [user.html](file:///c:/Users/sonis/OneDrive/Desktop/mean-user-app/frontend/src/app/components/user/user.html) — Key template patterns

```html
<!-- SIGNAL READ: use users() not users -->
<span>{{ totalUsers() }}</span>

<!-- LOOP with @for (Angular 21 control flow) -->
@for (user of users(); track user._id) {
  <p>{{ user.name }} - {{ user.age }}</p>
  <button (click)="editUser(user)">Edit</button>
  <button (click)="deleteUser(user._id)">Delete</button>
}

<!-- CONDITIONAL with @if -->
@if (users().length === 0) {
  <p>No users found</p>
}

<!-- PAGINATION -->
<button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() === 1">Prev</button>
<span>Page {{ currentPage() }} of {{ totalPages() }}</span>
<button (click)="goToPage(currentPage() + 1)">Next</button>

<!-- FILE UPLOAD -->
<input type="file" (change)="onFileSelect($event)" />
<button (click)="uploadFile()">Upload</button>
```

---

## ⚡ Quick Reference Table

| Angular 21 Concept | What to Remember |
|---|---|
| `signal()` | Reactive state — use `.set()` to update, `()` to read in template |
| `inject()` | Modern DI — replaces constructor injection |
| `@for / @if` | New control flow — replaces `*ngFor / *ngIf` |
| `track user._id` | Required in `@for` — DOM reconciliation key |
| `standalone: true` | No NgModule needed |
| `[(ngModel)]` | Two-way binding — needs `FormsModule` in imports |
| `provideHttpClient()` | Must add in app.config.ts |
| `provideRouter(routes)` | Must add in app.config.ts for routing |
| `.subscribe()` | Must call to fire Observable (HTTP won't work without it) |
| `FormData` | For file uploads — `formData.append('file', file)` |

---

## 🏃 Interview Day — Quick Setup Commands

```bash
# === BACKEND ===
mkdir backend && cd backend
npm init -y
npm install express mongoose cors bcryptjs jsonwebtoken multer
mkdir models routes middleware uploads
# Create: server.js, models/User.js, routes/userRoutes.js
node server.js

# === FRONTEND ===
ng new frontend
cd frontend
# Edit: app.config.ts (add provideHttpClient, provideRouter)
# Create: services/, components/, guards/
ng serve
```

> [!CAUTION]
> **Top 3 mistakes to avoid:**
> 1. Forgetting `app.use(express.json())` — POST body will be `undefined`
> 2. Forgetting `provideHttpClient()` in app.config — HttpClient won't work
> 3. Using `users` instead of `users()` in template — signal must be called as function
