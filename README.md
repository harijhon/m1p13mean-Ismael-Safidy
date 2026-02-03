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
