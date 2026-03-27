# Library Management System

A web-based Library Management System built with modern Vanilla JavaScript, CSS, and HTML (using Vite for the build setup).

The application features a sleek, glassmorphic dark-mode design and manages temporary state directly in your browser using `localStorage`. 

## Features
- **Role-based Authentication:** Separate views for `admin` and `user`.
- **Maintenance Module (Admin only):** Manage users, add/update memberships, and add new books/movies into the registry.
- **Transactions Module:** Check book availability, issue books, process returns, and pay simulated fines with date-based validations.
- **Reports Module:** Overview of currently added users and the entire library inventory.

## Running Locally

To run this project on your local machine:

1. Clone or download the repository.
2. Ensure you have [Node.js](https://nodejs.org/) installed.
3. Open your terminal in the project directory and run:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to the local URL (typically `http://localhost:5173/`).

## Demo Credentials

To test the application, you can use the following default accounts.

**Admin Account:**
- **User ID:** `admin`
- **Password:** `adminpassword`

**Regular User Account:**
- **User ID:** `user`
- **Password:** `userpassword`

*You can also create a brand new account by clicking the "Sign up" button on the login screen! New accounts default to the `user` role.*
