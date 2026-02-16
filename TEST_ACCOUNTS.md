# Test Accounts

This document lists the default account created by the seed script (`server/scripts/seed.js`).

## Default Administrator

The seed script will create a default administrator **only if the `users` collection in the database is empty**.

-   **Name**: `Admin`
-   **Email**: `admin@example.com`
-   **Password**: `admin123`
-   **Role**: `admin`

If other users already exist in the database, this account will not be created, and the seed script will use the first existing user to associate with the generated test data (store, products, orders).

To run the seed script:
```bash
cd server
npm run seed
```
