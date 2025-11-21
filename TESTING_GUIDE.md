# TourMate - Testing Guide

## Manual Testing Scenarios

### 1. Authentication Testing

#### Test 1.1: User Signup
1. Navigate to http://localhost:5173
2. Click "Sign Up"
3. Fill in form:
   - Name: Test User
   - Email: testuser@example.com
   - Password: password123
   - Confirm: password123
4. Click "Create Account"
5. **Expected**: Redirected to dashboard, user logged in

#### Test 1.2: User Login
1. Go to http://localhost:5173/login
2. Enter credentials:
   - Email: testuser@example.com
   - Password: password123
3. Click "Sign In"
4. **Expected**: Redirected to dashboard

#### Test 1.3: Owner Signup
1. Go to http://localhost:5173/owner/signup
2. Fill in form:
   - Business Name: Test Hotel
   - Email: owner@example.com
   - Password: password123
   - Confirm: password123
3. Click "Create Account"
4. **Expected**: Redirected to owner dashboard

#### Test 1.4: Owner Login
1. Go to http://localhost:5173/owner/login
2. Enter credentials:
   - Email: owner@example.com
   - Password: password123
3. Click "Sign In"
4. **Expected**: Redirected to owner dashboard

#### Test 1.5: Logout
1. Click user name in navbar
2. Click "Logout"
3. **Expected**: Redirected to home, logged out

### 2. Weather Testing

#### Test 2.1: Current Weather Detection
1. Go to home page
2. **Expected**: Current weather displayed based on geolocation

#### Test 2.2: Weather Search
1. On home page, scroll to "Search Weather by City"
2. Enter city: "Paris"
3. Click "Search"
4. **Expected**: 7-day weather data displayed

#### Test 2.3: Dashboard Weather
1. Login as user
2. Go to dashboard
3. **Expected**: Current weather displayed in compact card

### 3. Plan Creation Testing

#### Test 3.1: Create Plan
1. Login as user
2. Go to Dashboard
3. Click "Create Plan"
4. **Step 1**: Fill basic info
   - Title: "Paris Trip"
   - Start Date: 2024-06-01
   - End Date: 2024-06-07
   - Destination: "Paris, France"
5. Click "Next: Location"
6. **Step 2**: Click on map to select location
7. Click "Next: Activities"
8. **Step 3**: Search for places
   - Search: "Eiffel Tower"
   - Click "+" to add
   - Repeat for more places
9. Click "Create Plan"
10. **Expected**: Plan created, redirected to dashboard

#### Test 3.2: View Plan
1. On dashboard, click "View" on a plan card
2. **Expected**: Plan details displayed with activities

#### Test 3.3: Add Review to Plan
1. On plan view page
2. Click "Add Review"
3. Select place from dropdown
4. Set rating: 5 stars
5. Write review: "Amazing experience!"
6. Click "Submit Review"
7. **Expected**: Review added and displayed

#### Test 3.4: Edit Plan
1. On plan view page
2. Click "Edit" button
3. Modify details
4. Click "Save Changes"
5. **Expected**: Plan updated

#### Test 3.5: Delete Plan
1. On dashboard or plan view
2. Click "Delete" button
3. Confirm deletion
4. **Expected**: Plan deleted, removed from list

### 4. Owner Place Management Testing

#### Test 4.1: Add Place
1. Login as owner
2. Go to Owner Dashboard
3. Click "Add New Place"
4. Fill form:
   - Place Name: "Test Hotel"
   - Category: "Hotel"
   - Description: "Beautiful hotel"
   - Address: "123 Main St"
   - Phone: "+1234567890"
   - Email: "hotel@example.com"
5. Click on map to select location
6. Add features: WiFi, Parking, AC
7. Set price range: "$$"
8. Click "Add Place"
9. **Expected**: Place added, appears in dashboard

#### Test 4.2: View Place Details
1. On owner dashboard
2. Click "Edit" on a place card
3. **Expected**: Place details displayed

#### Test 4.3: Edit Place
1. On place detail page
2. Click "Edit"
3. Modify details
4. Click "Save Changes"
5. **Expected**: Place updated

#### Test 4.4: View Place on Map
1. On owner dashboard
2. Click "Map" button
3. **Expected**: Opens OpenStreetMap in new tab with place location

#### Test 4.5: Delete Place
1. On owner dashboard
2. Click delete button (trash icon)
3. Confirm deletion
4. **Expected**: Place deleted

#### Test 4.6: View Place Reviews
1. On place detail page
2. Scroll to "Recent Reviews"
3. **Expected**: Reviews displayed with ratings

### 5. Search History Testing

#### Test 5.1: Track Search History
1. Login as user
2. Go to Home page
3. Search for weather: "Tokyo"
4. Go to History page
5. **Expected**: Search entry appears in history

#### Test 5.2: Delete History Entry
1. On History page
2. Click trash icon on an entry
3. **Expected**: Entry deleted

#### Test 5.3: Clear All History
1. On History page
2. Click "Clear All"
3. Confirm
4. **Expected**: All history cleared

### 6. Favorites Testing

#### Test 6.1: View Favorites
1. Login as user
2. Go to Favorites page
3. **Expected**: Favorites list displayed (empty if none)

### 7. Navigation Testing

#### Test 7.1: User Navigation
1. Login as user
2. Check navbar shows:
   - Dashboard link
   - Plan Tour link
   - History link
   - Favorites link
   - User name
   - Logout button

#### Test 7.2: Owner Navigation
1. Login as owner
2. Check navbar shows:
   - My Places link
   - Add Place link
   - User name
   - Logout button

#### Test 7.3: Mobile Navigation
1. Resize browser to mobile (< 768px)
2. Click hamburger menu
3. **Expected**: Mobile menu appears with all options

### 8. Responsive Design Testing

#### Test 8.1: Desktop View
1. Set browser width to 1920px
2. Navigate through pages
3. **Expected**: Full layout with proper spacing

#### Test 8.2: Tablet View
1. Set browser width to 768px
2. Navigate through pages
3. **Expected**: Optimized layout for tablet

#### Test 8.3: Mobile View
1. Set browser width to 375px
2. Navigate through pages
3. **Expected**: Single column, touch-friendly layout

### 9. Error Handling Testing

#### Test 9.1: Invalid Login
1. Go to login page
2. Enter wrong email/password
3. Click "Sign In"
4. **Expected**: Error message displayed

#### Test 9.2: Empty Form Submission
1. Go to signup page
2. Leave fields empty
3. Click "Create Account"
4. **Expected**: Validation error shown

#### Test 9.3: Invalid Email
1. Go to signup page
2. Enter invalid email
3. Click "Create Account"
4. **Expected**: Email validation error

#### Test 9.4: Password Mismatch
1. Go to signup page
2. Enter different passwords
3. Click "Create Account"
4. **Expected**: Password mismatch error

### 10. API Testing (Using Browser DevTools)

#### Test 10.1: Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Perform actions (login, create plan, etc.)
4. **Expected**: API calls visible with 200/201 status codes

#### Test 10.2: Check Response Data
1. Click on API request in Network tab
2. Go to Response tab
3. **Expected**: JSON data properly formatted

#### Test 10.3: Check Error Responses
1. Try invalid action
2. Check Network tab
3. **Expected**: Error response with proper status code

### 11. Map Testing

#### Test 11.1: Map Display
1. Go to Plan Create page (Step 2)
2. **Expected**: Map loads with OSM tiles

#### Test 11.2: Click to Select Location
1. On map, click anywhere
2. **Expected**: Marker appears, coordinates displayed

#### Test 11.3: View Place on OSM
1. On plan view or owner dashboard
2. Click "View on Map" button
3. **Expected**: Opens OSM in new tab with correct location

### 12. Performance Testing

#### Test 12.1: Page Load Time
1. Open DevTools
2. Go to Performance tab
3. Reload page
4. **Expected**: Page loads in < 3 seconds

#### Test 12.2: API Response Time
1. Check Network tab
2. Perform API calls
3. **Expected**: Responses in < 1 second

### 13. Data Persistence Testing

#### Test 13.1: Refresh Page
1. Create a plan
2. Refresh page (F5)
3. **Expected**: Plan still visible

#### Test 13.2: Clear Cache
1. Create a plan
2. Clear browser cache
3. Refresh page
4. **Expected**: Plan still visible (from database)

### 14. Security Testing

#### Test 14.1: Protected Routes
1. Try accessing /dashboard without login
2. **Expected**: Redirected to login

#### Test 14.2: Owner Routes
1. Login as regular user
2. Try accessing /owner/dashboard
3. **Expected**: Redirected or error

#### Test 14.3: Token Expiration
1. Login
2. Wait 30 days (or modify token in localStorage)
3. Try API call
4. **Expected**: Redirected to login

## Automated Testing (Recommended)

### Unit Tests
```javascript
// Test auth functions
test('signup creates user', async () => {
  const result = await signup('name', 'email@test.com', 'pass123', 'pass123');
  expect(result.success).toBe(true);
});
```

### Integration Tests
```javascript
// Test API endpoints
test('POST /api/auth/signup creates user', async () => {
  const response = await api.post('/auth/signup', {
    name: 'Test',
    email: 'test@test.com',
    password: 'pass123',
    passwordConfirm: 'pass123'
  });
  expect(response.status).toBe(201);
});
```

### E2E Tests
```javascript
// Test user workflows
test('User can create and view plan', async () => {
  // Login
  // Create plan
  // View plan
  // Verify data
});
```

## Test Data

### Test User Accounts
```
Email: testuser@example.com
Password: password123
Role: user

Email: testowner@example.com
Password: password123
Role: owner
```

### Test Locations
```
Paris: 48.8566, 2.3522
Tokyo: 35.6762, 139.6503
New York: 40.7128, -74.0060
London: 51.5074, -0.1278
Sydney: -33.8688, 151.2093
```

## Checklist

- [ ] All authentication flows work
- [ ] Weather data displays correctly
- [ ] Plans can be created and managed
- [ ] Places can be added and managed
- [ ] Reviews can be added
- [ ] Search history tracks correctly
- [ ] Navigation works on all devices
- [ ] Responsive design verified
- [ ] Error handling works
- [ ] API responses correct
- [ ] Maps display correctly
- [ ] Performance acceptable
- [ ] Data persists correctly
- [ ] Security features working

## Reporting Issues

When testing, note:
1. **Issue**: What happened?
2. **Steps**: How to reproduce?
3. **Expected**: What should happen?
4. **Actual**: What actually happened?
5. **Browser**: Which browser/version?
6. **Device**: Desktop/tablet/mobile?
7. **Screenshot**: Include if possible

## Performance Benchmarks

- Page load: < 3 seconds
- API response: < 1 second
- Map load: < 2 seconds
- Weather load: < 1 second

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Notes

- Use incognito mode to test fresh sessions
- Clear localStorage to test token refresh
- Check console for any errors
- Monitor network tab for failed requests
- Test on real devices if possible
