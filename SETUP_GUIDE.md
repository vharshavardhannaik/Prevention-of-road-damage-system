# Setup & Deployment Guide

## 🔧 Prerequisites

- **Node.js** v14+ ([Download](https://nodejs.org))
- **MongoDB** (Local or Atlas Cloud)
- **Git**
- **npm** or **yarn**

## 🚀 Quick Start (Development)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure .env
MONGODB_URI=mongodb://localhost:27017/smart-road-system
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development

# Ensure MongoDB is running, then start server
npm start

# In another terminal, seed sample data
npm install -g nodemon
node seed.js
```

**Backend will run on**: `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Frontend will open on: http://localhost:3000
```

## 📱 Testing the Application

### Test Scenario 1: Submit a Complaint

1. Open `http://localhost:3000`
2. Click "Report Damage"
3. Enter Road ID: `ROAD-001`
4. Fill complaint form with:
   - Damage Type: Pothole
   - Severity: High
   - Description: "Large pothole on main street"
   - Upload a photo (optional)
5. Submit complaint
6. Check contractor rating in dashboard

### Test Scenario 2: View Dashboard

1. Click "Admin Dashboard"
2. View all contractors sorted by rating
3. Notice color-coded risk levels:
   - 🟢 Green (≥4.5): Excellent
   - 🟡 Yellow (3.0-3.9): Good
   - 🔴 Red (<2.0): Poor
4. Filter by risk level
5. Sort by complaints to see problematic contractors

### Test Scenario 3: Multiple Complaints

Submit 3+ complaints for the same contractor to see rating decrease:
1. Submit complaint for ROAD-002
2. Go to dashboard and check contractor rating
3. Submit another complaint for ROAD-002
4. Refresh and observe rating further decreased

## 🗄️ MongoDB Setup

### Option 1: Local MongoDB

```bash
# Windows (with MongoDB installed)
mongod

# Verify connection
mongo
> db.version()
```

### Option 2: MongoDB Atlas (Recommended for Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create a cluster
4. Get connection string
5. Update `.env`:
   ```
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/smart-road-system
   ```

## 📊 Sample Data Queries

### Get All Contractors with Ratings
```bash
curl http://localhost:5000/api/contractors
```

### Get Specific Road Details
```bash
curl http://localhost:5000/api/roads/ROAD-001
```

### Submit a Complaint
```bash
curl -X POST http://localhost:5000/api/complaints \
  -H "Content-Type: application/json" \
  -d '{
    "roadId": "ROAD-001",
    "userId": "Test User",
    "damageType": "Pothole",
    "description": "Test pothole",
    "severity": "High"
  }'
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process on Windows
taskkill /PID <PID> /F

# Try different port
PORT=5001 npm start
```

### MongoDB connection fails
```bash
# Verify MongoDB is running
mongosh

# Check connection string in .env
# Make sure firewall allows MongoDB access
```

### Frontend can't reach backend
```bash
# Verify backend is running
curl http://localhost:5000/api/health

# Check CORS settings in backend/server.js
# Update API URL in frontend if different
```

### Database issues
```bash
# Clear all data and reseed
node seed.js

# Backup data before clearing
mongodump --db smart-road-system
```

## 🔐 Production Deployment

### Environment Variables
```env
# .env (Production)
MONGODB_URI=mongodb+srv://prod_user:password@prod-cluster.mongodb.net/smart-road-system
JWT_SECRET=very_long_random_secret_key
PORT=5000
NODE_ENV=production
```

### Backend Deployment (Heroku)

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create smart-road-backend

# Set environment variables
heroku config:set MONGODB_URI="..."
heroku config:set JWT_SECRET="..."

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel/Netlify)

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel

# Or Netlify
netlify deploy --prod --dir=build
```

## 📈 Scaling Considerations

### Database Indexing
```javascript
// Add indexes in Mongoose schemas
contractorSchema.index({ 'currentRating': -1 });
roadProjectSchema.index({ 'contractorId': 1 });
complaintSchema.index({ 'roadId': 1, 'createdAt': -1 });
```

### Caching
- Implement Redis for contractor ratings
- Cache dashboard data (refresh every 5 min)

### Load Balancing
- Use PM2 for Node.js process management
- Nginx reverse proxy for multiple instances

## 🧪 Testing

### Backend Unit Tests
```bash
npm install --save-dev jest supertest

# Create test files in backend/__tests__/
npm test
```

### Frontend Testing
```bash
npm install --save-dev @testing-library/react jest

npm test
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

**Questions?** Refer to README.md or review the source code comments.
