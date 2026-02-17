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

---

## Troubleshooting

This section covers common issues and their solutions for this specific project environment.

### 1. Style Conflicts (Tailwind vs. PrimeNG)

-   **Symptom**: PrimeNG components look unstyled or incorrect.
-   **Cause**: Tailwind CSS is imported before PrimeNG, giving it higher precedence.
-   **Solution**: In `client/src/assets/styles.scss`, ensure Tailwind is imported **after** the PrimeNG styles.
    ```scss
    // 1. PrimeNG and Sakai layout styles
    @use './layout/layout.scss';
    @use 'primeicons/primeicons.css';
    @use './demo/demo.scss';

    // 2. Tailwind styles
    @use './tailwind.css';
    ```

### 2. API Requests Failing in Development

-   **Symptom**: API calls to `/api/*` from the Angular app fail, often returning an HTML page or a parsing error.
-   **Cause**: The Angular development server is intercepting API requests instead of forwarding them to the backend.
-   **Solution**: Use a proxy configuration.
    1.  Ensure a `proxy.conf.json` file exists in the `client` directory:
        ```json
        {
          "/api": {
            "target": "http://localhost:3000",
            "secure": false
          }
        }
        ```
    2.  Make sure your `angular.json` is configured to use this file for development.

### 3. TypeScript Compilation Errors

-   **Symptom**: `Cannot find module '...'` or errors related to dependency injection.
-   **Cause**: Using relative paths instead of the configured path aliases.
-   **Solution**: Always use the `@/` alias for absolute imports from the `src/app` directory.
    ```typescript
    // Incorrect
    import { UserService } from '../../core/services/user.service';

    // Correct
    import { UserService } from '@/core/services/user.service';
    ```

### 4. Non-compliance with Sakai CRUD Design

-   **Symptom**: A new CRUD page has a different layout than others (e.g., wrapped in an extra `<div class="card">`).
-   **Cause**: Not following the established "Raw CRUD" design pattern.
-   **Solution**: All new CRUD pages must follow the reference implementation in `UsersComponent`. The structure should start directly with `<p-toast>`, `<p-toolbar>`, and `<p-table>`, without any extra wrappers.
