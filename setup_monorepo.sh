#!/bin/bash

# MEAN Stack Monorepo Setup Script
# Creates a complete project structure with Angular 17+ frontend and Node.js/Express/Mongoose backend

set -e  # Exit immediately if a command exits with a non-zero status

echo "🚀 Setting up MEAN Stack Monorepo..."

# Create the main project directory structure
echo "📁 Creating directory structure..."

mkdir -p client/{src/app/{core,shared,features},assets,environments}
mkdir -p server/{config,controllers,models,routes,services,middlewares}

# Initialize package.json files
echo "📦 Initializing package.json files..."

# Server package.json
cat > server/package.json << 'EOF'
{
  "name": "mean-server",
  "version": "1.0.0",
  "description": "MEAN Stack Server with Express and Mongoose",
  "main": "app.js",
  "type": "module",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "keywords": [
    "mean",
    "mongodb",
    "express",
    "mongoose"
  ],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^5.0.0",
    "mongoose": "^9.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
EOF

# Client package.json
cat > client/package.json << 'EOF'
{
  "name": "mean-client",
  "version": "0.0.0",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test"
  },
  "private": true,
  "dependencies": {
    "@angular/animations": "^17.0.0",
    "@angular/common": "^17.0.0",
    "@angular/compiler": "^17.0.0",
    "@angular/core": "^17.0.0",
    "@angular/forms": "^17.0.0",
    "@angular/platform-browser": "^17.0.0",
    "@angular/platform-browser-dynamic": "^17.0.0",
    "@angular/router": "^17.0.0",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.14.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^17.0.0",
    "@angular/cli": "^17.0.0",
    "@angular/compiler-cli": "^17.0.0",
    "@types/jasmine": "~5.1.0",
    "jasmine-core": "~5.1.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.1.0",
    "typescript": "~5.2.0"
  }
}
EOF

# Create server skeleton files
echo "📝 Creating server skeleton files..."

# Server app.js
cat > server/app.js << 'EOF'
// TODO: Import necessary modules
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import { router as apiRoutes } from './routes/index.js';

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mean_app')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

export default app;
EOF

# Server config/db.js
cat > server/config/db.js << 'EOF'
// TODO: Database configuration
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mean_app');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
EOF

# Server controllers/exampleController.js
cat > server/controllers/exampleController.js << 'EOF'
// TODO: Controller implementation
// Example controller - implement your business logic here

export const getExample = async (req, res) => {
  try {
    // TODO: Implement GET logic
    res.status(200).json({ message: 'GET request successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createExample = async (req, res) => {
  try {
    // TODO: Implement POST logic
    res.status(201).json({ message: 'POST request successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
EOF

# Server services/exampleService.js
cat > server/services/exampleService.js << 'EOF'
// TODO: Service implementation
// Business logic layer - implement your core application logic here

// Example service function
export const getAllExamples = async () => {
  // TODO: Implement business logic
  return [];
};

export const createExample = async (data) => {
  // TODO: Implement business logic
  return { ...data };
};
EOF

# Server models/ExampleModel.js
cat > server/models/ExampleModel.js << 'EOF'
// TODO: Mongoose schema definition
import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Example', exampleSchema);
EOF

# Server routes/index.js
cat > server/routes/index.js << 'EOF'
// TODO: Define API routes
import express from 'express';
import { getExample, createExample } from '../controllers/exampleController.js';

const router = express.Router();

// Example routes
router.get('/examples', getExample);
router.post('/examples', createExample);

export { router };
EOF

# Server middlewares/errorHandler.js
cat > server/middlewares/errorHandler.js << 'EOF'
// TODO: Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  // Set default error values
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Handle specific Mongoose errors
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

export default errorHandler;
EOF

# Server .env
cat > server/.env << 'EOF'
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mean_app
JWT_SECRET=your_jwt_secret_here
EOF

# Create client skeleton files
echo "📝 Creating client skeleton files..."

# Client main.ts
cat > client/src/main.ts << 'EOF'
// TODO: Angular application entry point
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
EOF

# Client app.config.ts
cat > client/src/app/app.config.ts << 'EOF'
// TODO: Application configuration
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
};
EOF

# Client app.component.ts
cat > client/src/app/app.component.ts << 'EOF'
// TODO: Main application component
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <main>
      <header>
        <h1>MEAN Stack Application</h1>
      </header>
      <div class="body">
        <router-outlet />
      </div>
    </main>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'mean-client';
}
EOF

# Client app.component.css
cat > client/src/app/app.component.css << 'EOF'
/* TODO: Global styles */
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

main {
  min-height: 100vh;
  padding: 20px;
}

.body {
  max-width: 1200px;
  margin: 0 auto;
}
EOF

# Client app.routes.ts
cat > client/src/app/app.routes.ts << 'EOF'
// TODO: Define application routes
import { Routes } from '@angular/router';

export const routes: Routes = [
  // Define your routes here
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: '**', redirectTo: '/dashboard' }  // Wildcard route for 404 pages
];
EOF

# Client core module files
cat > client/src/app/core/auth.service.ts << 'EOF'
// TODO: Authentication service
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  
  constructor() { }

  login(credentials: { email: string, password: string }): Observable<any> {
    // TODO: Implement login logic
    return new Observable(observer => {
      // Simulate API call
      setTimeout(() => {
        this.isAuthenticatedSubject.next(true);
        observer.next({ success: true });
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    // TODO: Implement logout logic
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }
}
EOF

# Client shared module files
cat > client/src/app/shared/button.component.ts << 'EOF'
// TODO: Reusable button component
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button 
      [disabled]="disabled"
      (click)="onClick.emit($event)"
      [ngClass]="['btn', 'btn-' + variant]"
    >
      {{ label }}
    </button>
  `,
  styles: [`
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .btn-primary { background-color: #007bff; color: white; }
    .btn-secondary { background-color: #6c757d; color: white; }
    .btn-success { background-color: #28a745; color: white; }
    .btn-danger { background-color: #dc3545; color: white; }
    
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class ButtonComponent {
  @Input() label: string = 'Button';
  @Input() variant: 'primary' | 'secondary' | 'success' | 'danger' = 'primary';
  @Input() disabled: boolean = false;
  @Output() onClick = new EventEmitter<Event>();
}
EOF

# Client feature module files (dashboard example)
mkdir -p client/src/app/features/dashboard
cat > client/src/app/features/dashboard/dashboard.component.ts << 'EOF'
// TODO: Dashboard feature component
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="dashboard">
      <h2>Dashboard</h2>
      <p>Welcome to your MEAN Stack application!</p>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 20px;
    }
  `]
})
export class DashboardComponent {}
EOF

# Create README
cat > README.md << 'EOF'
# MEAN Stack Monorepo

This is a monorepo setup for a MEAN stack application with Angular 17+ frontend and Node.js/Express/Mongoose backend.

## Project Structure

```
monorepo/
├── client/                 # Angular 17+ frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/       # Singleton services, interceptors, guards
│   │   │   ├── shared/     # Reusable UI components
│   │   │   └── features/   # Feature modules
│   │   └── ...
│   └── ...
└── server/                 # Node.js/Express/Mongoose backend
    ├── config/             # Configuration files
    ├── controllers/        # Request/response handlers
    ├── models/             # Mongoose schemas
    ├── routes/             # API route definitions
    ├── services/           # Business logic
    ├── middlewares/        # Express middlewares
    └── ...
```

## Setup Instructions

### Backend Setup
1. Navigate to the server directory: `cd server`
2. Install dependencies: `npm install`
3. Set up environment variables in `.env`
4. Start the server: `npm run dev`

### Frontend Setup
1. Navigate to the client directory: `cd client`
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

## Technologies Used

- **Frontend**: Angular 17+, TypeScript
- **Backend**: Node.js, Express 5.x, Mongoose 9.x
- **Database**: MongoDB
- **Language**: JavaScript (ES Modules)
EOF

echo "✅ Monorepo structure created successfully!"
echo ""
echo "Next steps:"
echo "1. cd server && npm install"
echo "2. cd ../client && npm install"
echo "3. Set up your MongoDB connection in server/.env"
echo "4. Start developing!"

