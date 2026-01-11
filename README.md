# Smart Road Construction & Monitoring System

A comprehensive web/mobile application for reporting road damage via QR codes and tracking contractor performance through a trust score system.

## 🎯 Project Overview

Citizens can scan QR codes on roads to report damage, which automatically affects the "Trust Score" (Rating) of the Civil Engineer or Contractor who built that road. A government dashboard helps officials make informed decisions about future contracts.

## 🏗️ Project Structure

```
SmartRoadSystem/
├── backend/                    # Node.js + Express Backend
│   ├── models/
│   │   ├── Contractor.js      # Contractor schema
│   │   ├── RoadProject.js     # Road project schema
│   │   └── Complaint.js       # Complaint/issue schema
│   ├── routes/
│   │   ├── complaints.js      # Complaint endpoints
│   │   ├── contractors.js     # Contractor endpoints
│   │   └── roads.js           # Road endpoints
│   ├── utils/
│   │   └── ratingCalculator.js # Rating calculation algorithm
│   ├── server.js              # Main server file
│   ├── package.json           # Dependencies
│   └── .env.example           # Environment variables
│
└── frontend/                   # React.js + Tailwind CSS Frontend
    ├── src/
    │   ├── components/
    │   │   ├── ComplaintForm.jsx      # User complaint form
    │   │   └── ContractorDashboard.jsx # Admin dashboard
    │   ├── App.jsx              # Main app component
    │   ├── index.jsx            # React entry point
    │   └── index.css            # Global styles
    ├── public/
    │   └── index.html           # HTML template
    └── package.json             # Dependencies
```

## 🔑 Key Features

### 1. QR Code Scanning System
- Citizens scan QR codes on roads
- Automatically loads road information
- No authentication needed (anonymous reports supported)

### 2. Complaint Submission
- Report damage type: Pothole, Crack, Erosion, Flooding, Other
- Severity levels: Low, Medium, High, Critical
- Photo evidence upload
- Optional contact information

### 3. Smart Rating Algorithm
The contractor rating is calculated based on:

**Rating Formula:**
```
Base Rating = 5.0 stars
- Complaint count deduction (during warranty): 0.3 per complaint (max 2.0)
- Post-warranty complaints: 0.1 per complaint (max 0.5)
- Severity impact: Critical (1.0), High (0.7), Medium (0.4), Low (0.1)
- Unresolved complaints penalty: 0.2 per complaint (max 1.0)
- Recent complaints (30 days): 0.15 per complaint (max 0.75)
- Final rating clamped between 0-5.0
```

**Rating Categories:**
- ⭐⭐⭐⭐⭐ 4.5+ : Excellent → Very Low Risk
- ⭐⭐⭐⭐ 4.0-4.4 : Very Good → Low Risk
- ⭐⭐⭐ 3.0-3.9 : Good → Medium Risk
- ⭐⭐ 2.0-2.9 : Fair → High Risk
- ⭐ <2.0 : Poor → Very High Risk

### 4. Government Dashboard
- View all contractors with real-time ratings
- Sort by rating or complaint count
- Filter by risk level
- Color-coded risk indicators
- Recommendations for contract awards

### 5. Rating Recalculation
- Automatic recalculation whenever a new complaint is filed
- Considers warranty period (e.g., 10 years)
- Tracks rating history with timestamps and reasons

## 📊 Database Schemas

### Contractor Model
```javascript
{
  contractorId: String (unique),
  name: String,
  email: String,
  password: String,
  currentRating: Number (0-5, default 5),
  totalComplaints: Number,
  totalProjects: Number,
  projectHistory: [ObjectId],
  ratingHistory: [{
    date: Date,
    rating: Number,
    reason: String
  }],
  createdAt: Date
}
```

### RoadProject Model
```javascript
{
  roadId: String (unique),
  roadName: String,
  contractorId: ObjectId (ref: Contractor),
  location: { latitude, longitude, address },
  constructionDate: Date,
  completionDate: Date,
  warrantyPeriodYears: Number (default 10),
  warrantyEndDate: Date,
  qrCodeData: String,
  projectCost: Number,
  roadLength: Number,
  status: String (Active/Completed/UnderMaintenance),
  complaints: [ObjectId],
  createdAt: Date
}
```

### Complaint Model
```javascript
{
  complaintId: String (unique),
  roadId: ObjectId (ref: RoadProject),
  userId: String,
  userEmail: String,
  userPhone: String,
  damageType: String (Pothole/Crack/Erosion/Flooding/Other),
  description: String,
  photoUrl: String (base64),
  location: { latitude, longitude },
  status: String (Open/UnderReview/Resolved/Rejected),
  severity: String (Low/Medium/High/Critical),
  resolution: { resolvedDate, description },
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Setup Instructions

### Backend Setup

1. **Install Dependencies:**
```bash
cd backend
npm install
```

2. **Configure Environment:**
```bash
cp .env.example .env
# Edit .env and update:
# - MONGODB_URI (ensure MongoDB is running)
# - JWT_SECRET
# - PORT
```

3. **Start MongoDB:**
```bash
# Windows (with MongoDB installed):
mongod

# Or use MongoDB Atlas (cloud):
# Update MONGODB_URI in .env
```

4. **Run Backend:**
```bash
npm start
# Server will run on http://localhost:5000
```

### Frontend Setup

1. **Install Dependencies:**
```bash
cd frontend
npm install
```

2. **Start Development Server:**
```bash
npm start
# App will open on http://localhost:3000
```

## 📡 API Endpoints

### Complaints
- **POST** `/api/complaints` - Submit new complaint
  ```json
  {
    "roadId": "ROAD-001",
    "userId": "John Doe",
    "userEmail": "john@example.com",
    "userPhone": "+91 9876543210",
    "damageType": "Pothole",
    "description": "Large pothole on main street",
    "severity": "High",
    "photoUrl": "base64 image data"
  }
  ```

- **GET** `/api/complaints/:roadId` - Get complaints for a road
- **PUT** `/api/complaints/:complaintId` - Update complaint status

### Contractors
- **GET** `/api/contractors` - Get all contractors (sorted by rating)
  - Query params: `sortBy=rating|complaints`, `order=asc|desc`
- **GET** `/api/contractors/:contractorId` - Get contractor details with rating breakdown
- **GET** `/api/contractors/:contractorId/projects` - Get all projects by contractor

### Roads
- **GET** `/api/roads` - Get all roads
- **GET** `/api/roads/:roadId` - Get specific road details

## 🔬 Rating Calculation Algorithm (In-Depth)

Location: `backend/utils/ratingCalculator.js`

The algorithm implements a **multi-factor scoring system**:

### Rule 1: Complaint Count Deduction
```
During Warranty:
  - Each complaint: -0.3 stars (max -2.0)
  - Reason: Contractor is responsible

After Warranty:
  - Each complaint: -0.1 stars (max -0.5)
  - Reason: Lesser liability post-warranty
```

### Rule 2: Severity-Based Deduction
```
Critical: -1.0 stars per complaint
High: -0.7 stars per complaint
Medium: -0.4 stars per complaint
Low: -0.1 stars per complaint
```

### Rule 3: Resolution Penalty
```
- Unresolved complaints: -0.2 stars each (max -1.0)
- Encourages quick resolution
```

### Rule 4: Recency Penalty
```
- Complaints filed within 30 days: -0.15 stars each (max -0.75)
- Recent issues weigh more heavily
```

### Risk Assessment
```
4.5 - 5.0  → Very Low Risk  → ✓ Approve for future contracts
4.0 - 4.4  → Low Risk       → Approve with monitoring
3.0 - 3.9  → Medium Risk    → Conditional approval
2.0 - 2.9  → High Risk      → Restricted participation
< 2.0      → Very High Risk → ✗ Blacklist from contracts
```

## 💻 Sample Data

Create sample contractors and roads for testing:

```bash
# Run seed script (create this file: backend/seed.js)
node backend/seed.js
```

Sample Road IDs for testing:
- ROAD-001: Main Street
- ROAD-002: Highway 5
- ROAD-003: Park Avenue

## 🎨 Frontend Components

### ComplaintForm Component
- **Location**: `frontend/src/components/ComplaintForm.jsx`
- **Features**:
  - Road information display
  - Multi-step form with validation
  - Photo upload with preview
  - Real-time contractor rating updates
  - Success/error notifications

### ContractorDashboard Component
- **Location**: `frontend/src/components/ContractorDashboard.jsx`
- **Features**:
  - Contractor table with sorting/filtering
  - Color-coded risk levels
  - Performance statistics
  - Government recommendations
  - Refresh functionality

## 🔒 Security Considerations

- Implement JWT authentication for admin endpoints
- Validate all inputs on backend
- Hash contractor passwords with bcryptjs
- Implement rate limiting for complaint submission
- Sanitize file uploads (image validation)
- Use HTTPS in production

## 📈 Future Enhancements

1. **Real QR Code Integration**
   - Generate QR codes for roads
   - Mobile app for scanning

2. **Machine Learning**
   - Predict high-risk contractors
   - Pattern analysis in complaints

3. **Notifications**
   - Email alerts for contractors
   - SMS updates for resolution status

4. **Analytics Dashboard**
   - Complaint trends over time
   - Regional analysis
   - Seasonal patterns

5. **Payment Integration**
   - Fine system for contractors
   - Penalty enforcement

6. **Multi-Language Support**
   - Hindi, Telugu, Tamil, etc.

## 📝 License

This project is open source and available for hackathon use.

---

**Built with ❤️ for Better Roads & Transparency in Government**
