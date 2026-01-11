# 🔐 Admin Portal Quick Start

## What's New? 
A complete **Admin Portal** has been added to manage roads in the Smart Road System!

## 🚀 Quick Access

| What | URL |
|------|-----|
| **Admin Login** | [http://localhost:3000/admin/login](http://localhost:3000/admin/login) |
| **Admin Dashboard** | [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard) |
| **User App** | [http://localhost:3000](http://localhost:3000) |

---

## 📝 Default Admin Accounts

Copy and paste these credentials to login:

### Account 1: Super Admin (can add more admins)
```
Username: superadmin
Password: Admin@123
```

### Account 2: Regular Admin (can manage roads)
```
Username: admin
Password: Admin@456
```

---

## ✨ What You Can Do

### 1. **Login to Admin Portal**
   - Go to [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
   - Enter username and password
   - Click "Login"

### 2. **Add New Roads**
   - Click "**+ Add New Road**" button
   - Fill in the form:
     - **Road ID**: e.g., `ROAD-001`, `ROAD-MAIN-01`
     - **Road Name**: e.g., `Highway to Delhi`, `Main Street`
     - **Latitude** (optional): e.g., `28.6139`
     - **Longitude** (optional): e.g., `77.2090`
     - **Address** (optional): e.g., `New Delhi, India`
   - Click "**Add Road**"

### 3. **View All Roads**
   - See all roads in a table
   - Shows Road ID, Name, Address, and Status
   - Displays total count of roads

### 4. **Edit Road**
   - Click "**Edit**" button on any road
   - Update the details
   - Click "**Update Road**"

### 5. **Delete Road**
   - Click "**Delete**" button on any road
   - Confirm the deletion

### 6. **Logout**
   - Click "**Logout**" button in top-right corner

---

## 👥 User App Integration

When you add roads in Admin Portal, they automatically appear in:
- **User App** at [http://localhost:3000](http://localhost:3000)
- **"Report Damage"** section
- Users can search by Road ID to report issues

### User Workflow:
1. User opens app → Clicks "Report Damage" 🚨
2. Enters Road ID (e.g., ROAD-001)
3. System shows the road details
4. User files damage complaint
5. Admin can track complaints through dashboard

---

## 📊 Admin Dashboard Features

| Feature | What It Does |
|---------|-------------|
| **Add New Road** | Create new roads with unique IDs |
| **View All Roads** | See all roads in table format |
| **Edit** | Update road information |
| **Delete** | Remove roads from system |
| **Search** | Find roads by ID or name |
| **Logout** | Securely logout |

---

## 🔒 Security

- ✅ JWT Token-based authentication
- ✅ Passwords are securely hashed
- ✅ Admin sessions expire after 24 hours
- ✅ Only authenticated admins can access dashboard
- ✅ Role-based access control

---

## 🛠️ Backend Files Created

```
backend/
├── models/
│   └── Admin.js                    ← Admin user model
├── routes/
│   └── admin.js                    ← Admin API routes
├── middleware/
│   └── auth.js                     ← JWT authentication
└── seedAdmin.js                    ← Initial admin seeder
```

---

## 🎯 Frontend Files Created

```
frontend/src/
├── components/
│   ├── AdminLogin.jsx              ← Login page
│   └── AdminDashboard.jsx          ← Dashboard page
├── index.jsx                       ← Updated with routing
└── App.jsx                         ← Updated with admin link
```

---

## 📡 API Endpoints Available

### Login
```bash
POST http://localhost:5000/api/admin/login
```

### Roads Management
```bash
GET    http://localhost:5000/api/admin/roads          # List all roads
POST   http://localhost:5000/api/admin/roads          # Add new road
PUT    http://localhost:5000/api/admin/roads/{id}     # Update road
DELETE http://localhost:5000/api/admin/roads/{id}     # Delete road
```

### Admin Account
```bash
GET    http://localhost:5000/api/admin/profile        # Get profile
POST   http://localhost:5000/api/admin/register       # Add new admin (Super Admin only)
```

---

## 🧪 Test It Out

### Step 1: Login as Admin
1. Go to [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
2. Username: `admin`
3. Password: `Admin@456`
4. Click Login

### Step 2: Add a Test Road
1. Click "**+ Add New Road**"
2. Fill in:
   - Road ID: `ROAD-001`
   - Road Name: `Main Highway`
   - Address: `Downtown Area`
3. Click "**Add Road**"

### Step 3: Check User App
1. Go to [http://localhost:3000](http://localhost:3000)
2. Click "**Report Damage**"
3. Enter Road ID: `ROAD-001`
4. See the road appear in the system

---

## ⚙️ Configuration

All settings are in:
- **Backend**: `backend/.env` (set JWT_SECRET, DB connection)
- **Frontend**: `frontend/src/services/api.js` (API base URL)

---

## 📞 Troubleshooting

| Problem | Solution |
|---------|----------|
| **Login fails** | Check username/password - should be `admin` / `Admin@456` |
| **Page doesn't load** | Make sure backend is running on port 5000 |
| **Road won't save** | Check console for errors - Road ID must be unique |
| **Can't logout** | Click logout button - clears token from localStorage |

---

## 🎓 Learn More

Full documentation available in: [ADMIN_GUIDE.md](ADMIN_GUIDE.md)

---

## 🚀 Next Steps

1. ✅ Add sample roads for testing
2. ✅ Have users report complaints via app
3. ✅ Track contractor performance
4. ✅ Create new admin accounts (as super_admin)
5. ✅ Monitor road project status

---

**Everything is ready to use!** 🎉

Both backend (port 5000) and frontend (port 3000) are running and connected.
