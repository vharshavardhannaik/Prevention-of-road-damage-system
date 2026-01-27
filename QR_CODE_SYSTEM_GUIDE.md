# 🎯 QR Code System for Contractor Feedback

## Overview
This system generates unique QR codes for each contractor. When citizens scan these QR codes, they are directed to a feedback page where they can:
- ⭐ Rate the contractor (1-5 stars)
- 📝 Submit complaints about the road/contractor work

## Features

### 1. Generate QR Codes for All Contractors
- Navigate to the **Contractor Performance Metrics** page
- Click the green button: **"📱 Generate QR Codes for All Contractors"**
- System will generate unique QR codes for all contractors in the database
- Each QR code contains a URL to that contractor's public feedback page

### 2. View Individual QR Codes
- In the contractor table, click **"📱 View QR"** button next to any contractor
- A modal will popup displaying:
  - Contractor name and ID
  - QR code image (scannable)
  - Feedback URL link
  - Download button to save the QR code as PNG

### 3. Download QR Codes
- Click **"📥 Download QR Code"** button in the modal
- QR code will be saved as: `{contractorId}_QRCode.png`
- You can print this and place it at the road site

### 4. Public Feedback Page
When someone scans the QR code, they are taken to: `http://localhost:3000/contractor/{contractorId}/feedback`

The feedback page has two tabs:

#### ⭐ Rating Tab
- Select rating from 1-5 stars (interactive star selection)
- Optional: Add comments about the work quality
- Submit rating (no login required)

#### 📝 Complaint Tab
- Enter their name
- Enter email address
- Describe the complaint/issue
- Select severity: Low, Medium, or High
- Submit complaint (no login required)

## How It Works

### Backend Implementation

#### 1. QR Code Generation Endpoint
```
POST /api/contractors/generate-all-qr
```
Generates QR codes for all contractors at once.

#### 2. Individual QR Code Endpoints
```
GET /api/contractors/{contractorId}/qr
POST /api/contractors/{contractorId}/qr/generate
```
Get or generate QR code for a specific contractor.

#### 3. Public Feedback Endpoints (No Authentication Required)
```
GET /api/public/contractor/{contractorId}
POST /api/public/contractor/{contractorId}/rating
POST /api/public/contractor/{contractorId}/complaint
```

### Frontend Components

#### 1. ContractorDashboard.jsx
- Displays all contractors with performance metrics
- "Generate All QR Codes" button
- Individual "View QR" buttons for each contractor
- QR code modal with download functionality
- Status indicator showing which contractors have QR codes

#### 2. ContractorFeedback.jsx
- Public-facing feedback page
- No authentication required
- Two-tab interface (Rating/Complaint)
- Form validation
- Success/error messages

## Database Schema

### Contractor Model
```python
class Contractor(models.Model):
    contractor_id = CharField (unique identifier)
    name = CharField
    email = EmailField
    qr_code = TextField (base64 encoded QR image)
    # ... other fields
    
    def get_qr_url(self):
        return f"http://localhost:3000/contractor/{self.contractor_id}/feedback"
```

### Rating Model
```python
class Rating(models.Model):
    contractor = ForeignKey(Contractor)
    rating_value = IntegerField (1-5)
    user_email = CharField
    comment = TextField
    created_at = DateTimeField
```

### Complaint Model
```python
class Complaint(models.Model):
    road = ForeignKey(RoadProject)
    contractor_name = CharField
    complaint_text = TextField
    severity = CharField (Low/Medium/High)
    reporter_name = CharField
    reporter_email = EmailField
    status = CharField
    created_at = DateTimeField
```

## Usage Workflow

### For Government Officials:

1. **Generate QR Codes**
   - Log into admin dashboard
   - Go to "Contractor Performance Metrics"
   - Click "Generate QR Codes for All Contractors"
   - Wait for confirmation message

2. **Download QR Codes**
   - Click "View QR" for any contractor
   - Click "Download QR Code"
   - Print the QR code

3. **Display QR Codes**
   - Place printed QR codes at road construction sites
   - Add signage: "Scan to report issues or rate contractor"
   - QR codes should be weather-resistant and visible

### For Citizens:

1. **Scan QR Code**
   - Use phone camera or QR scanner app
   - Point at the QR code at the road site
   - Automatically opens feedback page

2. **Provide Feedback**
   - Choose "Rating" tab to rate contractor (1-5 stars)
   - Choose "Complaint" tab to report issues
   - Fill in required information
   - Submit feedback

3. **Confirmation**
   - Success message displayed
   - Feedback immediately added to database
   - Government officials can view in admin dashboard

## API Examples

### Generate QR for All Contractors
```javascript
axios.post('http://localhost:8000/api/contractors/generate-all-qr')
  .then(response => {
    console.log(`Generated ${response.data.generated} QR codes`);
  });
```

### Get Contractor QR Code
```javascript
axios.get(`http://localhost:8000/api/contractors/${contractorId}/qr`)
  .then(response => {
    // response.data.qrCode - base64 image
    // response.data.qrUrl - feedback page URL
  });
```

### Submit Public Rating
```javascript
axios.post(`http://localhost:8000/api/public/contractor/${contractorId}/rating`, {
  ratingValue: 4,
  comment: "Good work, smooth road"
});
```

### Submit Public Complaint
```javascript
axios.post(`http://localhost:8000/api/public/contractor/${contractorId}/complaint`, {
  name: "John Doe",
  email: "john@example.com",
  complaintText: "Pothole on main road",
  severity: "High"
});
```

## Benefits

1. **🔒 No Authentication Required**
   - Citizens don't need to create accounts
   - Quick and easy feedback submission

2. **📱 Mobile-Friendly**
   - QR codes work on all smartphones
   - Responsive feedback page design

3. **📊 Real-Time Data**
   - Ratings and complaints immediately available in admin dashboard
   - Track contractor performance in real-time

4. **🎯 Accountability**
   - Contractors can be evaluated by public feedback
   - Transparent rating system
   - Historical complaint records

5. **📈 Data-Driven Decisions**
   - Government can make informed contract decisions
   - Identify problematic contractors
   - Reward high-performing contractors

## Security Notes

- QR codes are public (anyone can scan)
- Feedback submission doesn't require authentication (to encourage participation)
- Rate limiting should be implemented to prevent spam (future enhancement)
- Email validation can be added for complaint submission (future enhancement)

## Troubleshooting

### QR Code Not Generating
- Check that contractor exists in database
- Ensure qrcode library is installed: `pip install qrcode[pil]`
- Check server logs for errors

### Feedback Page Not Loading
- Verify contractorId in URL is correct
- Check that frontend server is running on port 3000
- Check browser console for errors

### Ratings Not Saving
- Verify backend API is accessible
- Check network tab in browser dev tools
- Ensure rating value is between 1-5

## Future Enhancements

1. Rate limiting on feedback submission
2. Email verification for complaints
3. Captcha to prevent spam
4. SMS notifications for new complaints
5. QR code expiration/rotation for security
6. Analytics dashboard for QR code scans
7. Offline QR code scanning capability

---

**Last Updated:** January 12, 2026  
**Version:** 1.0  
**Status:** Production Ready ✅
