# QR Code Feature for Contractor Feedback

## Overview
Each contractor now has a unique QR code that allows the public to quickly rate and submit complaints without requiring authentication.

## Features Implemented

### 1. Backend (Django)
- ✅ Added `qr_code` field to Contractor model
- ✅ QR code generation using Python qrcode library
- ✅ Public API endpoints for:
  - Getting contractor information
  - Submitting ratings (1-5 stars)
  - Submitting complaints
- ✅ Automatic QR code generation on first request

### 2. Frontend (React)

#### Admin/Dashboard Features
- ✅ **Contractor Dashboard**: Added "View QR" button for each contractor
- ✅ **QR Code Modal**: Beautiful modal displaying:
  - QR code image
  - Contractor name and ID
  - Download button
  - Public feedback URL
  - Direct link to test the feedback page

#### Public Feedback Page
- ✅ **Two-tab interface**:
  - **Rating Tab**: 
    - Interactive 5-star rating system
    - Optional comment field
    - Real-time feedback
  - **Complaint Tab**:
    - Description field (required)
    - Location field (optional)
    - Form validation

## How to Use

### For Administrators:
1. Navigate to the Contractor Dashboard
2. Find a contractor in the list
3. Click the "📱 View QR" button
4. A modal will appear showing:
   - The QR code image
   - Download option
   - Public URL for testing
5. Download and print the QR code
6. Display it at project sites

### For Public Users:
1. Scan the QR code with any smartphone
2. Browser opens to contractor feedback page
3. View contractor information and current rating
4. Choose to either:
   - **Give a Rating**: Select 1-5 stars and add optional comment
   - **Submit a Complaint**: Provide description and location
5. Submit the form
6. Receive immediate confirmation

## API Endpoints

### Get Contractor QR Code
```
GET /api/contractors/{contractorId}/qr
```
Returns the QR code for a contractor (generates if doesn't exist)

### Get Public Contractor Info
```
GET /api/public/contractor/{contractorId}
```
Returns basic contractor information (no auth required)

### Submit Rating
```
POST /api/public/contractor/{contractorId}/rating
Body: {
  "ratingValue": 4,
  "comment": "Great work!"
}
```

### Submit Complaint
```
POST /api/public/contractor/{contractorId}/complaint
Body: {
  "description": "Issue description",
  "location": "Project site address"
}
```

## Routes

- **Public Feedback Page**: `/contractor/{contractorId}/feedback`
- **Admin Dashboard**: `/admin/dashboard`
- **Contractor Dashboard**: `/contractor-dashboard`

## Technology Stack

### Backend
- Django 4.2.9
- Python qrcode library
- Pillow (for image generation)
- Base64 encoding for QR code storage

### Frontend
- React with Hooks
- Axios for API calls
- Tailwind CSS for styling
- React Router for navigation

## Database Changes

New field added to `contractors` table:
- `qrCode` (TEXT, nullable) - Stores base64-encoded QR code image

## Benefits

1. **Easy Access**: Anyone can provide feedback by scanning QR code
2. **No Authentication**: Public can submit feedback without creating accounts
3. **Real-time Updates**: Ratings and complaints immediately update contractor stats
4. **Printable**: QR codes can be downloaded and printed for project sites
5. **Mobile-Friendly**: Optimized for smartphone access
6. **Professional**: Clean, modern UI for public interaction

## Future Enhancements

- [ ] Add photo upload for complaints
- [ ] GPS location capture
- [ ] Email notifications for new feedback
- [ ] QR code customization (colors, logos)
- [ ] Feedback analytics dashboard
- [ ] Multi-language support
- [ ] SMS notifications
- [ ] Feedback moderation system
t