# VOLTS Smart Device Investment Platform

A full-stack demonstration platform for digital device investments using React, Tailwind CSS, Node.js, Express, and PostgreSQL.

## Features

- Landing page with promotions, testimonials, and live statistics
- User authentication with JWT and bcrypt
- Product investment catalog and dashboard
- Deposit/withdrawal transaction history
- Referral tracking and notifications center
- Admin endpoint scaffold for management
- Real-time mock updates via Socket.io

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: PostgreSQL (via `pg`)
- Authentication: JWT + bcrypt
- Real-time: Socket.io

## Getting started

1. Install dependencies:
   - `cd server && npm install`
   - `cd ../client && npm install`
2. Create a `.env` file in `server/` based on `.env.example`
3. Initialize the database schema: `cd server && node seed.js`
4. Start the backend: `npm run dev` in `server/`
5. Start the frontend: `npm run dev` in `client/`

## Admin access

- Email: `admin@volts.local`
- Password: `Admin123!`

## Docker PostgreSQL setup

1. Start the database and server with Docker:
   - `docker compose up --build`
2. This will expose:
   - Backend: `http://localhost:4000`
   - PostgreSQL: `localhost:5432`
3. Use `server/.env.example` to configure SMTP and admin credentials.

## Notes

This starter includes a working UI and backend scaffold. You can extend the database models, email verification flows, and admin controls as needed.