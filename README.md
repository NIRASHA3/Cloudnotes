# CloudNotes

A full-stack MERN application for creating and managing notes with rich text editing, categories, and real-time updates.

<!-- Testing webhook connection -->

## Features

- 📝 Rich text editing with React Quill
- 🔍 Full-text search functionality
- 📁 Category organization
- 📌 Pin important notes
- 🔒 Secure authentication
- 📱 Responsive design

## Tech Stack

- Frontend: React, Vite
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: JWT, Passport
- UI: Custom CSS

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Environment Variables

1. Backend (.env):
   Copy `.env.example` to `.env` and fill in your values:
   ```
   PORT=5173
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

2. Frontend (.env):
   ```
   VITE_API_URL=http://localhost:5173/api
   ```

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/NIRASHA3/Cloudnotes.git
   cd Cloudnotes
   ```

2. Install backend dependencies
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Update .env with your values
   ```

3. Install frontend dependencies
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the backend server
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server
   ```bash
   cd frontend
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)# Build triggered after cache clear
