# Cloudnotes - Login & Register (MERN)

A secure, modern login and registration flow for a MERN stack application with Google OAuth integration.

## Features

- Email/Username/Password Registration
- Username/Password Login
- Google Sign-In (OAuth 2.0)
- JWT Authentication
- Responsive Design

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT + Passport.js
- **Styling**: CSS with custom color palette

## Color Palette

Using the color palette from [Coolors](https://coolors.co/palette/d1f0b1-b6cb9e-92b4a7-8c8a93-81667a):
- Primary: #D1F0B1
- Secondary: #B6CB9E
- Accent: #92B4A7
- Text: #8C8A93
- Dark: #81667A

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- Google OAuth Client ID and Secret (for Google Sign-In)

### Environment Variables

1. Copy `backend/.env.example` to `backend/.env`
2. Update the following variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secret key for JWT tokens
   - `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
   - `FRONTEND_URL`: Your frontend URL (default: http://localhost:5173)

### Running with Docker

1. Clone the repository
2. Navigate to the project directory
3. Run: `docker-compose up -d`

This will start:
- MongoDB on port 27017
- Backend server on port 5000
- Frontend server on port 5173

### Running without Docker

#### Backend

1. Navigate to the `backend` directory
2. Run `npm install`
3. Run `npm run dev`

#### Frontend

1. Navigate to the `frontend` directory
2. Run `npm install`
3. Run `npm run dev`

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

## Usage

1. Open your browser and go to `http://localhost:5173`
2. Register a new account or login with existing credentials
3. Alternatively, use Google Sign-In

## License

MIT