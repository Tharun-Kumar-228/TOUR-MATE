# TourMate - Setup and Installation Guide

## Project Overview

TourMate is a full-stack web application for tourists to plan their trips, check weather, and explore places. It features dual login (tourists and place owners), interactive maps with OpenStreetMap, real-time weather data from Open-Meteo API, and comprehensive tour planning tools.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- Git

## Project Structure

```
FINAL REVIEW PROJECT 1/
├── server/                 # Express backend
│   ├── models/            # MongoDB schemas
│   ├── controllers/        # Route controllers
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── server.js          # Main server file
│   ├── package.json
│   └── .env.example
├── client/                # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── api/           # API utilities
│   │   ├── store/         # Zustand stores
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
└── README.md
```

## Backend Setup

### 1. Navigate to Server Directory

```bash
cd server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Create a `.env` file in the server directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/tourmate
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=30d
```

**For MongoDB Atlas:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tourmate?retryWrites=true&w=majority
```

### 4. Start MongoDB (if using local)

```bash
# Windows
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 5. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## Frontend Setup

### 1. Navigate to Client Directory

```bash
cd client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Create a `.env` file in the client directory:

```bash
cp .env.example .env
```

The default configuration should work:

```
VITE_API_URL=http://localhost:5000/api
```

### 4. Start the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173`

## Running Both Servers

### Option 1: Two Terminal Windows

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Option 2: Using Concurrently (Optional)

From the root directory, you can create a script to run both servers simultaneously.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user/owner
- `POST /api/auth/login` - User/owner login
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/updatePassword` - Update password

### Weather
- `GET /api/weather/today?lat=&lon=` - Get today's weather
- `GET /api/weather/past7?lat=&lon=` - Get past 7 days weather
- `GET /api/weather/forecast?lat=&lon=&days=` - Get forecast

### Search History
- `POST /api/history/add` - Add search to history
- `GET /api/history/get` - Get user's search history
- `DELETE /api/history/:id` - Delete history entry
- `DELETE /api/history/clear` - Clear all history

### Plans
- `POST /api/plans/create` - Create new plan
- `GET /api/plans/all` - Get all user's plans
- `GET /api/plans/:id` - Get single plan
- `PUT /api/plans/:id` - Update plan
- `DELETE /api/plans/:id` - Delete plan
- `POST /api/plans/:id/activities` - Add activity to plan
- `DELETE /api/plans/:id/activities/:activityId` - Remove activity

### Reviews
- `POST /api/reviews/add` - Add review
- `GET /api/reviews/place/:placeId` - Get place reviews
- `GET /api/reviews/user/my-reviews` - Get user's reviews
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Owner
- `POST /api/owner/add-place` - Add new place
- `GET /api/owner/my-places` - Get owner's places
- `GET /api/owner/place/:id` - Get place details
- `PUT /api/owner/place/:id` - Update place
- `DELETE /api/owner/place/:id` - Delete place
- `GET /api/owner/place/:id/reviews` - Get place reviews

## Features Implemented

### Public Features
- ✅ Home page with current weather and 7-day forecast search
- ✅ User and owner authentication (signup/login)
- ✅ Geolocation-based weather detection
- ✅ Weather data from Open-Meteo API
- ✅ Place search using OpenStreetMap Nominatim API

### User Features
- ✅ Dashboard with current weather and plans overview
- ✅ Create tour plans with multiple activities
- ✅ Interactive map picker using Leaflet
- ✅ Search history tracking
- ✅ Favorites management
- ✅ View plans with activities
- ✅ Add reviews to places
- ✅ View OpenStreetMap links for places

### Owner Features
- ✅ Owner dashboard with statistics
- ✅ Add new places with category and details
- ✅ Edit place information
- ✅ Delete places
- ✅ View reviews for their places
- ✅ Contact information management
- ✅ Features and amenities listing

### Technical Features
- ✅ JWT authentication
- ✅ Password hashing with bcryptjs
- ✅ MongoDB with Mongoose
- ✅ RESTful API design
- ✅ Error handling and validation
- ✅ Rate limiting
- ✅ CORS enabled
- ✅ Responsive design with Tailwind CSS
- ✅ Interactive maps with Leaflet
- ✅ Real-time weather updates
- ✅ Search history tracking

## Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/owner),
  searchHistory: Array,
  favorites: Array,
  timestamps
}
```

### Place
```javascript
{
  owner: ObjectId,
  name: String,
  category: String,
  description: String,
  address: String,
  location: GeoJSON Point,
  images: Array,
  contact: Object,
  features: Array,
  averageRating: Number,
  ratingsQuantity: Number,
  timestamps
}
```

### Plan
```javascript
{
  user: ObjectId,
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  destination: Object,
  activities: Array,
  budget: Object,
  status: String,
  timestamps
}
```

### Review
```javascript
{
  user: ObjectId,
  place: ObjectId,
  plan: ObjectId,
  rating: Number (1-5),
  review: String,
  images: Array,
  timestamps
}
```

### SearchHistory
```javascript
{
  user: ObjectId,
  query: String,
  type: String,
  results: Number,
  location: GeoJSON Point,
  timestamp: Date
}
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB credentials (if using Atlas)

### CORS Error
- Ensure frontend URL is allowed in backend CORS config
- Check that both servers are running

### API Not Found
- Verify backend server is running on port 5000
- Check that API URL in frontend `.env` is correct

### Weather Data Not Loading
- Verify internet connection
- Check Open-Meteo API status
- Ensure coordinates are valid

### Map Not Displaying
- Verify Leaflet CSS is loaded
- Check browser console for errors
- Ensure coordinates are within valid ranges

## Building for Production

### Backend
```bash
cd server
npm start
```

### Frontend
```bash
cd client
npm run build
npm run preview
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secret**: Use a strong, random secret in production
3. **CORS**: Configure CORS properly for production domain
4. **Password**: Ensure passwords are hashed with bcryptjs
5. **Rate Limiting**: Enable rate limiting on API endpoints
6. **HTTPS**: Use HTTPS in production

## Performance Tips

1. Use MongoDB indexes for frequently queried fields
2. Implement pagination for large datasets
3. Cache weather data to reduce API calls
4. Optimize images before upload
5. Use CDN for static assets in production

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.

## License

This project is licensed under the MIT License.
