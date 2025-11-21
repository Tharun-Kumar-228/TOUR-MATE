# TourMate - Tourist Assistant Application

A full-stack web application for tourists to plan their trips, check weather, and explore places.

## Features

- User authentication (Tourists & Place Owners)
- Weather information and forecasts
- Interactive map with OpenStreetMap
- Tour planning with date ranges and places
- Place reviews and ratings
- Favorites and search history
- Place owner dashboard for managing locations

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Leaflet (OpenStreetMap)
- React Icons

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs
- CORS
- Multer (for file uploads)

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=30d
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Auth
- `POST /api/auth/signup` - User/Owner registration
- `POST /api/auth/login` - User/Owner login

### Weather
- `GET /api/weather/today?lat=&lon=` - Get today's weather
- `GET /api/weather/past7?lat=&lon=` - Get past 7 days weather

### Search History
- `POST /api/history/add` - Add search to history
- `GET /api/history/get` - Get user's search history

### Plans
- `POST /api/plans/create` - Create new tour plan
- `GET /api/plans/all` - Get all user's plans
- `GET /api/plans/:id` - Get single plan
- `PUT /api/plans/:id` - Update plan
- `DELETE /api/plans/:id` - Delete plan

### Reviews
- `POST /api/reviews/add` - Add review
- `GET /api/reviews/place/:placeId` - Get reviews for a place

### Owner
- `POST /api/owner/add-place` - Add new place (owner only)
- `GET /api/owner/my-places` - Get owner's places
- `PUT /api/owner/place/:id` - Update place
- `DELETE /api/owner/place/:id` - Delete place

## Environment Variables

### Server (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT token
- `JWT_EXPIRES_IN` - JWT expiration time

## License

This project is licensed under the MIT License.
