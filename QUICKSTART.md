# TourMate - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js v16+ installed
- MongoDB running locally or MongoDB Atlas account
- Git (optional)

## Step 1: Clone/Extract Project

```bash
cd "FINAL REVIEW PROJECT 1"
```

## Step 2: Setup Backend

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB connection
# MONGODB_URI=mongodb://localhost:27017/tourmate
# JWT_SECRET=your_secret_key

# Start server
npm run dev
```

Server runs on: `http://localhost:5000`

## Step 3: Setup Frontend (New Terminal)

```bash
cd client

# Install dependencies
npm install

# Create .env file (optional, defaults work)
cp .env.example .env

# Start frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

## Step 4: Test the Application

### Create a Tourist Account
1. Go to `http://localhost:5173`
2. Click "Sign Up"
3. Fill in details and create account
4. You'll be redirected to dashboard

### Create an Owner Account
1. Go to `http://localhost:5173`
2. Click "Owner Login" → "Sign up"
3. Fill in business details
4. You'll be redirected to owner dashboard

### Test Features
- **Weather**: Search for any city on home page
- **Plans**: Create a tour plan with activities
- **Places**: Add places as an owner
- **Reviews**: Add reviews to places in your plan

## 📁 File Structure

```
server/
├── models/          # Database schemas
├── controllers/     # Business logic
├── routes/          # API endpoints
├── middleware/      # Auth & error handling
└── server.js        # Main file

client/
├── pages/           # Page components
├── components/      # Reusable UI
├── api/             # API calls
└── store/           # State management
```

## 🔑 Key Endpoints

### Auth
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login

### Weather
- `GET /api/weather/today?lat=20&lon=78` - Current weather
- `GET /api/weather/past7?lat=20&lon=78` - 7-day history

### Plans
- `POST /api/plans/create` - Create plan
- `GET /api/plans/all` - Get all plans
- `GET /api/plans/:id` - Get plan details

### Owner
- `POST /api/owner/add-place` - Add place
- `GET /api/owner/my-places` - Get places
- `PUT /api/owner/place/:id` - Update place

## 🎨 Default Test Credentials

You can create your own accounts, but here are some test scenarios:

**Tourist Account:**
- Email: tourist@test.com
- Password: password123

**Owner Account:**
- Email: owner@test.com
- Password: password123

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Start MongoDB locally
mongod

# Or use MongoDB Atlas
# Update MONGODB_URI in .env
```

### Port Already in Use
```bash
# Change port in server/.env
PORT=5001

# Or kill process using port
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000
```

### CORS Error
- Ensure backend is running on port 5000
- Check frontend .env has correct API URL

### Dependencies Error
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

## 📚 Documentation

- Full setup: See `SETUP.md`
- Project details: See `PROJECT_SUMMARY.md`
- API docs: See backend route files
- Component docs: See component JSDoc comments

## 🌐 External APIs Used

1. **Open-Meteo** (Weather)
   - Free, no API key needed
   - Endpoint: `https://api.open-meteo.com/v1/forecast`

2. **OpenStreetMap Nominatim** (Geocoding)
   - Free, no API key needed
   - Endpoint: `https://nominatim.openstreetmap.org/search`

3. **Leaflet** (Maps)
   - Open-source map library
   - Uses OSM tiles

## 🎯 Common Tasks

### Create a Tour Plan
1. Go to Dashboard
2. Click "Create Plan"
3. Fill basic info (title, dates, destination)
4. Pick location on map
5. Search and add activities
6. Submit

### Add a Place (as Owner)
1. Go to Owner Dashboard
2. Click "Add New Place"
3. Fill place details
4. Pick location on map
5. Add contact info and features
6. Submit

### View Weather for a City
1. Go to Home page
2. Enter city name in search
3. View 7-day weather history

### Add Review
1. Go to your plan
2. Click "Add Review"
3. Select place and rate
4. Write review
5. Submit

## 📱 Responsive Design

The app is fully responsive:
- **Desktop**: Full layout with sidebars
- **Tablet**: Optimized grid layout
- **Mobile**: Single column, touch-friendly

## 🔒 Security Notes

- Passwords are hashed with bcryptjs
- JWT tokens expire after 30 days
- API has rate limiting (100 req/15 min)
- CORS enabled for localhost:5173
- Input validation on all endpoints

## 🚀 Production Deployment

### Backend
```bash
# Build
npm run build

# Deploy to Heroku, Railway, or Render
# Set environment variables
# Connect MongoDB Atlas
```

### Frontend
```bash
# Build
npm run build

# Deploy to Vercel, Netlify, or GitHub Pages
# Set VITE_API_URL to production API
```

## 💡 Tips

1. **Local Development**: Use `npm run dev` for hot reload
2. **Testing**: Create test accounts for different roles
3. **Maps**: Click on map to set location
4. **Weather**: Search works with city names or coordinates
5. **Plans**: You can edit plans after creation

## 📞 Support

For issues:
1. Check SETUP.md for detailed setup
2. Check PROJECT_SUMMARY.md for features
3. Review error messages in browser console
4. Check backend logs in terminal

## ✅ Verification Checklist

- [ ] MongoDB is running
- [ ] Backend started on port 5000
- [ ] Frontend started on port 5173
- [ ] Can access http://localhost:5173
- [ ] Can create account
- [ ] Can login
- [ ] Can view weather
- [ ] Can create plan
- [ ] Can add place (as owner)
- [ ] Can add review

## 🎉 You're Ready!

Your TourMate application is now running. Start exploring and building amazing tour plans!
