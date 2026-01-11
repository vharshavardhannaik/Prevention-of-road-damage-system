// API Testing Examples with cURL and JavaScript

// ============================================
// 1. COMPLAINT ENDPOINTS
// ============================================

// POST /api/complaints - Submit a new complaint
curl -X POST http://localhost:5000/api/complaints \
  -H "Content-Type: application/json" \
  -d '{
    "roadId": "ROAD-001",
    "userId": "John Doe",
    "userEmail": "john@example.com",
    "userPhone": "+91 9876543210",
    "damageType": "Pothole",
    "description": "Large pothole causing traffic congestion",
    "severity": "High",
    "location": {
      "latitude": 12.9716,
      "longitude": 77.5946
    }
  }'

// GET /api/complaints/:roadId - Get all complaints for a road
curl http://localhost:5000/api/complaints/ROAD-001

// PUT /api/complaints/:complaintId - Update complaint status
curl -X PUT http://localhost:5000/api/complaints/COMPLAINT-1234567890 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Resolved",
    "resolution": {
      "description": "Pothole repaired and sealed"
    }
  }'

// ============================================
// 2. CONTRACTOR ENDPOINTS
// ============================================

// GET /api/contractors - Get all contractors sorted by rating
curl "http://localhost:5000/api/contractors?sortBy=rating&order=desc"

// GET /api/contractors - Get all contractors sorted by complaints
curl "http://localhost:5000/api/contractors?sortBy=complaints&order=desc"

// GET /api/contractors/:contractorId - Get contractor details
curl http://localhost:5000/api/contractors/CONTR-001

// GET /api/contractors/:contractorId/projects - Get all projects
curl http://localhost:5000/api/contractors/CONTR-001/projects

// ============================================
// 3. ROAD ENDPOINTS
// ============================================

// GET /api/roads - Get all roads
curl http://localhost:5000/api/roads

// GET /api/roads/:roadId - Get specific road details
curl http://localhost:5000/api/roads/ROAD-001

// ============================================
// 4. HEALTH CHECK
// ============================================

curl http://localhost:5000/api/health

// ============================================
// JAVASCRIPT EXAMPLES
// ============================================

// Submit Complaint via JavaScript
async function submitComplaint(roadId, complaintData) {
  try {
    const response = await fetch('http://localhost:5000/api/complaints', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        roadId,
        userId: complaintData.name,
        userEmail: complaintData.email,
        userPhone: complaintData.phone,
        damageType: complaintData.damageType,
        description: complaintData.description,
        severity: complaintData.severity,
        photoUrl: complaintData.photo // base64 encoded
      })
    });

    const result = await response.json();
    console.log('Complaint submitted:', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Fetch Contractors with Ratings
async function fetchContractors() {
  try {
    const response = await fetch(
      'http://localhost:5000/api/contractors?sortBy=rating&order=desc'
    );
    const data = await response.json();
    
    console.log('Contractors:');
    data.contractors.forEach(contractor => {
      console.log(`${contractor.name}: ${contractor.currentRating.toFixed(2)} ⭐`);
      console.log(`  Risk Level: ${contractor.riskLevel}`);
      console.log(`  Recommendation: ${contractor.recommendation}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Get Road Details
async function getRoadDetails(roadId) {
  try {
    const response = await fetch(`http://localhost:5000/api/roads/${roadId}`);
    const data = await response.json();
    
    console.log('Road Details:');
    console.log(`Name: ${data.road.roadName}`);
    console.log(`Contractor: ${data.road.contractorId.name}`);
    console.log(`Warranty Until: ${new Date(data.road.warrantyEndDate).toLocaleDateString()}`);
    console.log(`Total Complaints: ${data.road.complaints.length}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Get Contractor Details with Rating Breakdown
async function getContractorDetails(contractorId) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/contractors/${contractorId}`
    );
    const data = await response.json();
    
    console.log('Contractor Details:');
    console.log(`Name: ${data.contractor.name}`);
    console.log(`Rating: ${data.contractor.currentRating.toFixed(2)} / 5.0`);
    console.log(`Total Complaints: ${data.contractor.totalComplaints}`);
    console.log(`Resolved: ${data.contractor.resolvedComplaints}`);
    console.log(`Pending: ${data.contractor.pendingComplaints}`);
    console.log(`Risk Level: ${data.contractor.riskLevel}`);
    console.log(`\nRating Deductions:`);
    data.contractor.ratingDeductions.forEach(deduction => {
      console.log(`  - ${deduction.reason}: -${deduction.deduction.toFixed(2)}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Monitor Contractor Ratings
async function monitorRatings() {
  setInterval(async () => {
    const response = await fetch('http://localhost:5000/api/contractors');
    const data = await response.json();
    
    // Find contractors with dropping ratings
    data.contractors.forEach(contractor => {
      if (contractor.currentRating < 3.0) {
        console.warn(`⚠️ ALERT: ${contractor.name} rating is ${contractor.currentRating}`);
      }
    });
  }, 60000); // Check every minute
}

// ============================================
// TESTING WORKFLOW
// ============================================

// 1. Get initial contractor rating
// 2. Submit multiple complaints for same road
// 3. Fetch contractor again and verify rating decreased
// 4. Check complaint details
// 5. Mark complaint as resolved
// 6. Monitor rating change

// Example Test Flow:
async function testWorkflow() {
  console.log('=== Starting Test Workflow ===\n');

  // Step 1: Get initial rating
  console.log('Step 1: Getting contractor rating...');
  await getContractorDetails('CONTR-002');

  // Step 2: Submit complaint
  console.log('\nStep 2: Submitting complaint...');
  const complaint = await submitComplaint('ROAD-002', {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+91 9876543210',
    damageType: 'Pothole',
    description: 'Test complaint',
    severity: 'High'
  });

  // Step 3: Check updated rating
  console.log('\nStep 3: Checking updated rating...');
  setTimeout(() => {
    getContractorDetails('CONTR-002');
  }, 1000);
}

// Run test
// testWorkflow();
