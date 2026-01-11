# Admin Dashboard - Quick Start Guide

## 🚀 Getting Started

Welcome to the redesigned Smart Road Admin Dashboard! This guide will help you navigate and use all the new features efficiently.

---

## 📋 Table of Contents

1. [Accessing the Dashboard](#accessing-the-dashboard)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Roads](#managing-roads)
4. [Managing Contractors](#managing-contractors)
5. [Keyboard Shortcuts](#keyboard-shortcuts)
6. [Tips & Best Practices](#tips--best-practices)
7. [Troubleshooting](#troubleshooting)

---

## 1. Accessing the Dashboard

### **Login**
1. Navigate to the Admin Login page
2. Enter credentials:
   - **Username**: `admin`
   - **Password**: `Admin@456`
3. Click "Login" button
4. You'll be redirected to the Dashboard

### **Dashboard URL**
```
http://localhost:3000/admin-dashboard
```

---

## 2. Dashboard Overview

### **Header Section**
```
┌─────────────────────────────────────────────────┐
│ [Logo] ADMIN DASHBOARD     [Dashboard] [Logout] │
└─────────────────────────────────────────────────┘
```

**Components:**
- **Logo**: Click to refresh dashboard
- **Title & Subtitle**: Shows current page
- **Dashboard Button**: Returns to main view
- **Logout Button**: Securely logout (shows confirmation modal)

### **Statistics Cards**

Four key metrics are displayed:

| Card | Shows | Color |
|------|-------|-------|
| 🛣️ Total Roads | Number of registered roads | Blue |
| 👥 Active Contractors | Verified contractor count | Purple |
| ⚠️ Open Complaints | Unresolved issues | Yellow |
| ✅ Resolved Issues | Successfully closed cases | Green |

**Features:**
- Real-time data
- Trend indicators
- Hover for details (if tooltips enabled)

### **Tab Navigation**

Switch between sections:
- **Roads Tab**: Manage road infrastructure
- **Contractors Tab**: Manage contractor profiles

**Active tab** has:
- Gradient background (blue/indigo)
- White text
- Shadow elevation

---

## 3. Managing Roads

### **View All Roads**

1. Ensure you're on the **Roads** tab
2. View the roads table with columns:
   - **Road ID**: Unique identifier
   - **Road Name**: Full name
   - **Contractor**: Assigned contractor (or "Not assigned")
   - **Location**: Coordinates
   - **Status**: Active/Inactive/Planned
   - **Actions**: Edit and Delete buttons

### **Add New Road**

#### **Method 1: Floating Action Button (Recommended)**
1. Look for the blue **+ Add Road** button at bottom-right
2. Click it (icon will rotate)
3. Form will slide in

#### **Method 2: Empty State**
If no roads exist:
1. Click **"Add First Road"** in the empty state illustration

#### **Fill the Form:**

```
┌─────────────────────────────────────────┐
│ ADD NEW ROAD                       [✕]  │
├─────────────────────────────────────────┤
│ Road ID *                               │
│ [🔢] Enter ID (e.g., ROAD-001)          │
│                                         │
│ Road Name *                             │
│ [🛣️] Enter name (e.g., Main Highway)   │
│                                         │
│ Latitude * │ Longitude *                │
│ [📍] 12.97  │ [📍] 77.59                │
│                                         │
│ Complete Address *                      │
│ [📍] Full address...                    │
│                                         │
│ Assign Contractor (Optional)            │
│ [👤] ▼ Select contractor                │
│                                         │
│ [✅ Add Road]  [✕ Cancel]               │
└─────────────────────────────────────────┘
```

**Required Fields** (marked with *):
- Road ID
- Road Name
- Latitude
- Longitude
- Address

**Optional Fields:**
- Contractor assignment

**Tips:**
- Use unique Road IDs (e.g., ROAD-001, ROAD-002)
- Coordinates should be decimal degrees
- Address should be complete and accurate

**Submit:**
1. Click **"✅ Add Road"** button
2. Success message appears (green notification)
3. Form closes automatically
4. Table updates with new road

**Cancel:**
1. Click **"✕ Cancel"** button OR
2. Click **"✕"** icon in header OR
3. Press **ESC** key

### **Edit Existing Road**

1. Find the road in the table
2. Click the **blue edit icon (✏️)** in Actions column
3. Form opens pre-filled with current data
4. Modify fields as needed
5. Click **"Update Road"** button
6. Success notification appears

**What You Can Edit:**
- Road Name
- Location (Latitude/Longitude)
- Address
- Contractor assignment
- Status

**What You CANNOT Edit:**
- Road ID (primary key)

### **Delete Road**

1. Find the road in the table
2. Click the **red delete icon (🗑️)** in Actions column
3. Confirmation modal appears:

```
┌─────────────────────────────────────┐
│ ⚠️  CONFIRM DELETION                │
├─────────────────────────────────────┤
│ Are you sure you want to delete     │
│ this road? This action cannot be    │
│ undone...                           │
│                                     │
│ ⚠️  Warning: This will also affect  │
│     all related data and reports.   │
│                                     │
│ [🗑️ Delete Road]  [Cancel]         │
└─────────────────────────────────────┘
```

4. Choose:
   - **Delete Road**: Permanently removes the road
   - **Cancel**: Closes modal, no changes made

**Warning:** Deletion is permanent and affects:
- All complaints linked to this road
- Historical data
- Reports and statistics

### **Search & Filter** (Future Feature)
Currently not implemented. Manually scroll through the table.

---

## 4. Managing Contractors

### **View All Contractors**

1. Click the **Contractors** tab
2. View contractor cards in a responsive grid (1-3 columns)

Each card shows:
- **Header**: Gradient banner with star rating
- **Name**: Contractor company name
- **ID**: Contractor ID badge
- **Email**: Contact email with icon
- **Stats**: 
  - Ratings count (blue)
  - Projects completed (green)
  - Issues reported (red)
- **Recommendation**: Color-coded badge
  - 🟢 Highly Recommended (rating ≥ 4.0)
  - 🔵 Recommended (rating 3.0-3.9)
  - 🔴 Not Recommended (rating < 3.0)
  - ⚪ No ratings yet

### **Add New Contractor**

#### **Method 1: Floating Action Button (Recommended)**
1. Look for the green **+ Add Contractor** button at bottom-right
2. Click it
3. Form will slide in

#### **Method 2: Empty State**
If no contractors exist:
1. Click **"Add First Contractor"** in the empty state

#### **Fill the Form:**

```
┌─────────────────────────────────────────┐
│ ADD NEW CONTRACTOR                 [✕]  │
├─────────────────────────────────────────┤
│ Contractor ID *                         │
│ [🔢] Enter ID (e.g., CONT-001)          │
│                                         │
│ Contractor Name *                       │
│ [🏢] Enter name (e.g., ABC Construct.)  │
│                                         │
│ Email Address *                         │
│ [✉️] contractor@company.com             │
│                                         │
│ [✅ Add Contractor]  [✕ Cancel]         │
└─────────────────────────────────────────┘
```

**Required Fields**:
- Contractor ID (unique)
- Contractor Name (company name)
- Email Address (valid email format)

**Submit:**
1. Click **"✅ Add Contractor"** button
2. Success message appears
3. Form closes
4. New contractor card appears in grid

**Cancel:**
1. Click **"✕ Cancel"** button OR
2. Click **"✕"** icon in header OR
3. Press **ESC** key

### **View Contractor Details**

Hover over any contractor card to see:
- Border color change (green highlight)
- Shadow elevation
- Name color change to green

**Card Layout:**
```
╔═══════════════════════════════╗
║ ▓▓▓ Green Gradient ▓▓▓  ⭐4.5 ║
╠═══════════════════════════════╣
║ ABC Construction              ║
║ [CONT-001]                    ║
║ ✉️ abc@company.com            ║
║                               ║
║ ┌─────┬──────┬──────┐         ║
║ │  12 │   5  │   2  │         ║
║ │Rate │ Proj │ Iss  │         ║
║ └─────┴──────┴──────┘         ║
║                               ║
║ ▓ Highly Recommended ▓        ║
╚═══════════════════════════════╝
```

### **Contractor Ratings**

Ratings are calculated automatically based on:
- Complaint feedback
- Project completion rate
- Response time
- Quality of work

**Rating Breakdown:**
- ⭐ 5.0: Perfect performance
- ⭐ 4.0-4.9: Highly Recommended
- ⭐ 3.0-3.9: Recommended
- ⭐ 2.0-2.9: Average
- ⭐ 1.0-1.9: Not Recommended
- ⭐ 0.0: No ratings yet

---

## 5. Keyboard Shortcuts

### **Global Shortcuts**

| Key | Action |
|-----|--------|
| `ESC` | Close any open modal/form |
| `Tab` | Navigate between form fields |
| `Enter` | Submit focused form |
| `Ctrl+/` | Show keyboard shortcuts (future) |

### **Tab Navigation**

| Key | Action |
|-----|--------|
| `Alt+1` | Switch to Roads tab (future) |
| `Alt+2` | Switch to Contractors tab (future) |

### **Form Shortcuts**

| Key | Action |
|-----|--------|
| `Ctrl+S` | Save form (future) |
| `Ctrl+Enter` | Submit form (future) |
| `ESC` | Close form |

---

## 6. Tips & Best Practices

### **Data Entry**

✅ **DO:**
- Use consistent ID formats (ROAD-001, CONT-001)
- Provide complete addresses with city/state
- Verify coordinates using Google Maps
- Assign contractors to appropriate roads
- Double-check email addresses

❌ **DON'T:**
- Use duplicate IDs
- Leave required fields empty
- Enter invalid coordinates
- Use personal emails for companies

### **Performance**

✅ **For Best Performance:**
- Keep browser tabs minimal
- Clear browser cache periodically
- Use modern browsers (Chrome, Firefox, Edge)
- Ensure stable internet connection

### **Data Management**

✅ **Best Practices:**
- Regularly update road statuses
- Monitor contractor performance
- Respond to complaints promptly
- Keep contractor information current
- Archive completed projects

### **Workflow**

**Recommended Flow for New Road:**
```
1. Add Road → 2. Assign Contractor → 3. Monitor Complaints → 4. Update Status
```

**Recommended Flow for New Contractor:**
```
1. Add Contractor → 2. Assign to Roads → 3. Monitor Performance → 4. Adjust Ratings
```

---

## 7. Troubleshooting

### **Common Issues**

#### **Issue: Form won't submit**
**Solution:**
1. Check all required fields are filled
2. Verify email format is correct
3. Ensure coordinates are valid numbers
4. Look for red error messages
5. Try refreshing the page

#### **Issue: Table not loading**
**Solution:**
1. Check internet connection
2. Verify backend server is running (port 5000)
3. Check browser console for errors (F12)
4. Clear browser cache and reload

#### **Issue: Modal stuck open**
**Solution:**
1. Press `ESC` key
2. Click outside modal backdrop
3. Click close button (X)
4. Refresh page if needed

#### **Issue: Floating button not visible**
**Solution:**
1. Scroll down - buttons are fixed at bottom-right
2. Check browser zoom level (should be 100%)
3. Try different browser

#### **Issue: Statistics not updating**
**Solution:**
1. Refresh dashboard (Dashboard button or F5)
2. Wait a few seconds for data sync
3. Check if backend is responding
4. Verify database connection

### **Browser Compatibility**

**Supported:**
✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+

**Not Supported:**
❌ Internet Explorer (any version)
❌ Old browsers (2+ years old)

### **Error Messages**

| Message | Meaning | Solution |
|---------|---------|----------|
| "Road ID already exists" | Duplicate ID | Use a different ID |
| "Invalid coordinates" | Lat/Long out of range | Check coordinate values |
| "Failed to fetch data" | Backend error | Check server status |
| "Network error" | Connection issue | Check internet |
| "Unauthorized" | Session expired | Log in again |

### **Getting Help**

**If problems persist:**

1. **Check Console Logs:**
   - Press `F12` in browser
   - Go to "Console" tab
   - Look for red error messages
   - Take screenshot

2. **Verify Backend:**
   ```bash
   # Check if Django server is running
   cd backend_django
   python manage.py runserver
   ```

3. **Check Database:**
   ```bash
   # Verify database file exists
   ls smart_road_system.db
   ```

4. **Reset Application:**
   - Clear browser cache (Ctrl+Shift+Delete)
   - Close all browser tabs
   - Restart browser
   - Log in again

---

## 📖 Additional Resources

### **Documentation Files**
- `ADMIN_DASHBOARD_REDESIGN.md` - Complete redesign documentation
- `ADMIN_VISUAL_GUIDE.md` - Visual before/after comparison
- `UI_REDESIGN_SUMMARY.md` - Main app redesign summary
- `README.md` - Project overview

### **API Documentation**
- **Endpoint**: `http://localhost:5000/api/`
- **Roads API**: `/api/roads/`
- **Contractors API**: `/api/contractors/`
- **Authentication**: `/api/auth/login/`

### **Video Tutorials** (Future)
- Dashboard navigation walkthrough
- Adding roads step-by-step
- Managing contractors
- Understanding statistics

---

## 🎯 Quick Reference Card

### **Essential Actions**

```
┌────────────────────────────────────────┐
│ Action              │ Location         │
├────────────────────────────────────────┤
│ Add Road            │ Blue FAB (↘)     │
│ Edit Road           │ Blue ✏️ icon     │
│ Delete Road         │ Red 🗑️ icon      │
│ Add Contractor      │ Green FAB (↘)    │
│ Switch Tabs         │ Pill buttons     │
│ View Statistics     │ Top cards        │
│ Logout              │ Header button    │
│ Close Form          │ ESC or X button  │
└────────────────────────────────────────┘
```

### **Color Code Legend**

```
🔵 Blue/Indigo   → Primary actions, Roads
🟢 Green/Emerald → Contractors, Success
🔴 Red/Rose      → Delete, Errors
🟡 Yellow/Orange → Warnings, Pending
⚪ Gray          → Inactive, Neutral
🟣 Purple/Pink   → Statistics, Highlights
```

---

## 🎉 You're All Set!

You now know how to:
✅ Navigate the dashboard  
✅ Manage roads efficiently  
✅ Handle contractor profiles  
✅ Use keyboard shortcuts  
✅ Troubleshoot common issues  

**Happy administrating! 🚀**

---

**Last Updated**: January 2025  
**Version**: 2.0 (Redesigned)  
**Support**: Check documentation or console logs for issues
