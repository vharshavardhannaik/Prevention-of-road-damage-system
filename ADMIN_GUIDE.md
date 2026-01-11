# Admin Portal Setup and Usage Guide

## Overview
A complete admin portal has been integrated into the Smart Road System to allow administrators to:
- **Add new roads** with Road ID and Road Name
- **Manage roads** (edit, delete)
- **Control which roads appear** in the user app for complaint reporting

## Admin Credentials

### Default Login Credentials:

```
Super Admin:
  Username: superadmin
  Password: Admin@123

Admin:
  Username: admin
  Password: Admin@456
```

⚠️ **IMPORTANT**: Change these passwords in production!

## Admin Portal Access

### Web Access:
```
http://localhost:3000/admin/login
```

## Features

### 1. Admin Login Page (`/admin/login`)
- Username and password authentication
- Token-based session management
- Secure JWT authentication

### 2. Admin Dashboard (`/admin/dashboard`)
After login, admins can:

#### **Add New Road**
- Click "Add New Road" button
- Fill in the form:
  - **Road ID**: Unique identifier (e.g., ROAD-001)
  - **Road Name**: Display name for users (e.g., "Highway to Delhi")
  - **Latitude**: Road location latitude (optional)
  - **Longitude**: Road location longitude (optional)
  - **Address**: Road address (optional)

#### **View All Roads**
- Displays table of all roads in the system
- Shows Road ID, Road Name, Address, and Status
- Shows created timestamp

#### **Edit Road**
- Click "Edit" button on any road
- Update road details
- Click "Update Road" to save

#### **Delete Road**
- Click "Delete" button on any road
- Confirms deletion before removing

## API Endpoints

### Authentication

#### Admin Login
```
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin@456"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "username": "admin",
    "email": "roadmanager@smartroad.com",
    "fullName": "Road Manager",
    "role": "admin"
  }
}
```

#### Register New Admin (Super Admin Only)
```
POST /api/admin/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newadmin",
  "email": "newadmin@smartroad.com",
  "password": "SecurePassword123",
  "fullName": "New Administrator"
}
```

### Road Management

#### Add New Road
```
POST /api/admin/roads
Authorization: Bearer <token>
Content-Type: application/json

{
  "roadId": "ROAD-001",
  "roadName": "Main Highway",
  "latitude": "28.6139",
  "longitude": "77.2090",
  "address": "New Delhi, India",
  "contractorId": null
}

Response:
{
  "message": "Road added successfully",
  "road": {
    "id": 1,
    "roadId": "ROAD-001",
    "roadName": "Main Highway",
    "status": "planned",
    ...
  }
}
```

#### Get All Roads
```
GET /api/admin/roads
Authorization: Bearer <token>

Response:
{
  "count": 5,
  "roads": [
    {
      "id": 1,
      "roadId": "ROAD-001",
      "roadName": "Main Highway",
      ...
    }
  ]
}
```

#### Update Road
```
PUT /api/admin/roads/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "roadName": "Updated Highway Name",
  "address": "New Address"
}
```

#### Delete Road
```
DELETE /api/admin/roads/:id
Authorization: Bearer <token>
```

#### Get Admin Profile
```
GET /api/admin/profile
Authorization: Bearer <token>

Response:
{
  "admin": {
    "id": 1,
    "username": "admin",
    "email": "roadmanager@smartroad.com",
    "fullName": "Road Manager",
    "role": "admin"
  }
}
```

## User App Integration

### Users will see added roads:
1. When they go to "Report Damage" section
2. They can search for roads by Road ID
3. Roads are displayed with:
   - Road ID (unique identifier)
   - Road Name (display name)
   - Address (if provided)

### User Workflow:
1. Open user app at `http://localhost:3000`
2. Click "Report Damage" or "🚨 Report Road Damage Now"
3. Search/scan road ID (e.g., ROAD-001)
4. See road details
5. File complaint/damage report

## Security Features

- **JWT Token Authentication**: Token expires in 24 hours
- **Role-Based Access Control**: 
  - `admin` - Can manage roads
  - `super_admin` - Can manage roads + register new admins
- **Password Hashing**: bcryptjs for secure password storage
- **Protected Routes**: Only authenticated admins can access `/admin/dashboard`

## Database Schema

### Admin Table
```
- id (PK)
- username (unique)
- email (unique)
- password (hashed)
- fullName
- role (enum: 'admin', 'super_admin')
- isActive (boolean)
- createdAt
- updatedAt
```

### RoadProject Table (Updated)
```
- id (PK)
- roadId (unique)
- roadName
- contractorId (FK - optional)
- latitude
- longitude
- address
- status
- createdAt
- updatedAt
```

## Troubleshooting

### Issue: Login fails
- Verify username and password are correct
- Check that the backend server is running
- Look for CORS errors in browser console

### Issue: Can't add road
- Make sure Road ID is unique
- All required fields must be filled
- Check token hasn't expired (login again)

### Issue: Roads don't show in user app
- Make sure roads are added through admin portal
- Refresh the user app page
- Check backend API is returning roads correctly

## Next Steps

1. **Deploy to Production**:
   - Update default admin credentials
   - Set proper environment variables
   - Use HTTPS for secure communication

2. **Add More Admins**:
   - Login as super_admin
   - Register new admin users through register endpoint

3. **Monitor Roads**:
   - Track complaints against each road
   - Update road status as construction progresses
   - Link roads to contractors

## Support

For issues or questions:
1. Check backend logs: `npm start` in backend folder
2. Check frontend console: Press F12 in browser
3. Verify API endpoints are accessible: `http://localhost:5000/api/health`
