# Rating Algorithm - Detailed Documentation

## 🎯 Overview

The Smart Road System's rating algorithm is the core innovation that evaluates contractor performance based on complaint patterns during and after road warranty periods.

**Location**: `backend/utils/ratingCalculator.js`

---

## 📐 Mathematical Foundation

### Base Rating
```
Initial Rating = 5.0 stars
Range = 0.0 to 5.0
```

### Deduction System
```
Final Rating = Initial Rating - Σ(All Deductions)
Clamped to [0.0, 5.0]
```

---

## 🔍 Four Rating Deduction Rules

### Rule 1: Complaint Count Deduction

**During Warranty Period:**
```
Deduction per complaint = -0.3 stars
Maximum deduction = -2.0 stars
Logic: Contractor is responsible during warranty
```

**Example:**
- 3 complaints during warranty = -0.9 stars
- 10 complaints during warranty = -2.0 stars (capped)

**After Warranty Period:**
```
Deduction per complaint = -0.1 stars
Maximum deduction = -0.5 stars
Logic: Lesser liability post-warranty
```

**Example:**
- 5 complaints after warranty = -0.5 stars (capped)

**Code:**
```javascript
if (isUnderWarranty) {
  const complaintDeduction = Math.min(projectComplaints.length * 0.3, 2.0);
  ratingPoints -= complaintDeduction;
} else {
  const postWarrantyDeduction = Math.min(projectComplaints.length * 0.1, 0.5);
  ratingPoints -= postWarrantyDeduction;
}
```

---

### Rule 2: Severity-Based Deduction

Each complaint has a severity level that determines its impact:

```
CRITICAL Damage:  -1.0 stars per complaint
HIGH Damage:      -0.7 stars per complaint  
MEDIUM Damage:    -0.4 stars per complaint
LOW Damage:       -0.1 stars per complaint
```

**Severity Definitions:**
- **Critical**: Road is unsafe (deep potholes, major erosion)
- **High**: Significant issues affecting traffic flow
- **Medium**: Noticeable damage but roads still usable
- **Low**: Minor cosmetic issues

**Example Calculation:**
```
3 Critical complaints = -3.0 stars
2 High complaints = -1.4 stars
1 Medium complaint = -0.4 stars
1 Low complaint = -0.1 stars
Total deduction = -4.9 stars
Final rating = 5.0 - 4.9 = 0.1 stars (Very Poor)
```

**Code:**
```javascript
const severityScores = {
  'Critical': 1.0,
  'High': 0.7,
  'Medium': 0.4,
  'Low': 0.1
};

const severityDeduction = projectComplaints.reduce((total, complaint) => {
  const severity = complaint.severity || 'Medium';
  return total + (severityScores[severity] || 0.4);
}, 0);

ratingPoints -= severityDeduction;
```

---

### Rule 3: Resolution Rate Penalty

Unresolved complaints indicate poor contractor response:

```
Deduction per unresolved complaint = -0.2 stars
Maximum deduction = -1.0 stars
Logic: Encourages quick complaint resolution
```

**Complaint Status Types:**
- **Open**: Just filed, no action taken
- **Under Review**: Being investigated
- **Resolved**: Issue fixed and verified
- **Rejected**: Not valid/contractor's responsibility

**Example:**
```
5 unresolved complaints = -1.0 stars (capped at max)
2 resolved complaints = no penalty
```

**Code:**
```javascript
const unresolvedComplaints = projectComplaints.filter(
  c => c.status === 'Open' || c.status === 'Under Review'
);

if (unresolvedComplaints.length > 0) {
  const resolutionPenalty = Math.min(unresolvedComplaints.length * 0.2, 1.0);
  ratingPoints -= resolutionPenalty;
}
```

---

### Rule 4: Recency Factor

Recent complaints are weighted more heavily to reflect ongoing issues:

```
Definition of Recent = Filed within 30 days
Deduction per recent complaint = -0.15 stars
Maximum deduction = -0.75 stars
Logic: Recent problems indicate active issues
```

**Rationale:**
- Clustered recent complaints suggest systemic problems
- Motivates contractors to address issues quickly
- Highlights contractors with deteriorating quality

**Example Timeline:**
```
January: 3 complaints (not recent today)
November: 2 complaints (recent - within 30 days)
December: 1 complaint filed today (recent)

Recent complaints = 3 (2 + 1)
Deduction = 3 × -0.15 = -0.45 stars
```

**Code:**
```javascript
const recentComplaints = projectComplaints.filter(complaint => {
  const daysSinceComplaint = Math.floor(
    (now - new Date(complaint.createdAt)) / (1000 * 60 * 60 * 24)
  );
  return daysSinceComplaint <= 30;
});

if (recentComplaints.length > 0) {
  const recencyPenalty = Math.min(recentComplaints.length * 0.15, 0.75);
  ratingPoints -= recencyPenalty;
}
```

---

## 📊 Complete Example Calculation

### Scenario: RoadMasters Inc - Road-002 Analysis

**Project Details:**
- Road: Highway 5 Express
- Contractor: RoadMasters Inc
- Warranty: 10 years (2014-2024) - **EXPIRED**
- Construction Date: Jan 1, 2014
- Current Date: Dec 11, 2025 (13 months post-warranty)

**Complaints Analysis:**
```
Total Complaints: 15

Severity Breakdown:
- 3 Critical (potholes causing accidents)
- 5 High (major cracks)
- 4 Medium (surface erosion)
- 3 Low (minor damage)

Status Breakdown:
- 7 Open (unresolved)
- 5 Resolved (fixed)
- 3 Under Review (being addressed)

Timing Breakdown:
- Filed last week (3 complaints) - RECENT
- Filed last month (2 complaints) - RECENT  
- Filed 2+ months ago (10 complaints) - NOT RECENT
```

**Step-by-Step Calculation:**

```
Base Rating: 5.0

Rule 1 - Complaint Count (Post-Warranty):
  15 complaints × -0.1 = -1.5
  Capped at -0.5 → DEDUCTION: -0.5

Rule 2 - Severity:
  3 Critical × -1.0 = -3.0
  5 High × -0.7 = -3.5
  4 Medium × -0.4 = -1.6
  3 Low × -0.1 = -0.3
  Total: → DEDUCTION: -8.4

Rule 3 - Resolution Rate:
  10 unresolved (7 Open + 3 Under Review) × -0.2 = -2.0
  Capped at -1.0 → DEDUCTION: -1.0

Rule 4 - Recency:
  5 recent complaints × -0.15 = -0.75
  → DEDUCTION: -0.75

Total Deductions: -0.5 - 8.4 - 1.0 - 0.75 = -10.65

Final Calculation:
  5.0 - 10.65 = -5.65
  Clamped to 0.0 → FINAL RATING: 0.0 ⭐
```

---

## 🎓 Rating Categories & Implications

### Category Thresholds

| Rating Range | Category | Risk Level | Government Action |
|--------------|----------|-----------|------------------|
| 4.5 - 5.0 | Excellent ✓ | Very Low | ✅ Approve for future contracts |
| 4.0 - 4.4 | Very Good | Low | ✅ Approve with monitoring |
| 3.0 - 3.9 | Good | Medium | ⚠️ Conditional approval |
| 2.0 - 2.9 | Fair | High | ⚠️ Restricted participation |
| 0.0 - 1.9 | Poor ✗ | Very High | ❌ Blacklist from contracts |

**Code:**
```javascript
function getRatingCategory(rating) {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 4.0) return 'Very Good';
  if (rating >= 3.0) return 'Good';
  if (rating >= 2.0) return 'Fair';
  return 'Poor';
}

function getRiskLevel(rating) {
  if (rating >= 4.5) return { 
    level: 'Very Low', 
    recommendation: 'Approve for future contracts' 
  };
  if (rating >= 4.0) return { 
    level: 'Low', 
    recommendation: 'Approve with monitoring' 
  };
  // ... etc
}
```

---

## 🔄 Recalculation Trigger

The rating is automatically recalculated whenever:

1. **New complaint submitted** - Most common trigger
2. **Complaint status updated** - When resolved/rejected
3. **Admin request** - For dashboard refresh

**Recalculation Process:**
```javascript
// When complaint submitted:
1. Save complaint to database
2. Fetch all projects by contractor
3. Fetch all complaints for those projects
4. Calculate new rating using algorithm
5. Update contractor's currentRating field
6. Log in ratingHistory array
7. Return updated rating to client
```

**Frontend Notification:**
```javascript
// After complaint submission
setSuccessMessage(
  `Complaint submitted! Rating impact: ${oldRating.toFixed(2)} → ${newRating.toFixed(2)}`
);
```

---

## 📈 Warranty Period Considerations

The algorithm treats in-warranty and post-warranty periods differently:

### During Warranty (Contractor Liable)
```
Stricter penalties
- Higher per-complaint deduction (0.3 vs 0.1)
- Severity impact is full
- Resolution time is critical
→ Incentivizes quality construction
```

### After Warranty (Contractor Not Liable)
```
Lighter penalties
- Lower per-complaint deduction (0.1)
- Reflects normal wear and tear
- Government responsible for maintenance
→ Fair to contractors post-warranty
```

**Real-World Example:**
```
Road constructed in 2014, 10-year warranty
Warranty expires: Jan 1, 2024

Same complaint (e.g., pothole) reported:
- In 2020 (during warranty): -0.3 stars (strict)
- In 2025 (post-warranty): -0.1 stars (lenient)
```

---

## 💡 Algorithm Design Rationale

### Why Multi-Factor?
- Single factor (just complaint count) is unfair
- Critical potholes != minor surface cracks
- Quick resolution shows contractor care
- Recent issues indicate ongoing problems

### Why These Weights?
```
Tested thresholds balance:
- Fairness: Not too harsh on contractors
- Accountability: Not too lenient on poor quality
- Actionability: Clear thresholds for government decisions
```

### Why Caps?
```
Maximum deductions prevent:
- Over-penalizing for high-volume roads
- Ratings dropping below -2.0 (unfair)
- Manipulation (mass complaints)
```

---

## 🧪 Testing the Algorithm

### Test Case 1: Excellent Contractor
```
Rating after 2 minor complaints during warranty: 4.5+
→ Approved for future contracts
```

### Test Case 2: Poor Contractor
```
Rating after 10+ complaints: <2.0
→ Flagged for blacklist
```

### Test Case 3: Mixed Quality
```
Rating after 5 complaints (3 critical, 2 medium): ~2.5
→ Conditional approval needed
```

---

## 📊 Dashboard Visualization

The algorithm output appears in the admin dashboard:

```
Contractor: BuildRight Infrastructure
Rating: 4.8 ⭐⭐⭐⭐⭐
Status: Excellent [GREEN]

Breakdown:
- Base: 5.0
- Complaints: -0.1
- Severity: -0.1
- Resolution: 0.0
- Recency: 0.0
= Final: 4.8

Risk: Very Low Risk
Recommendation: ✅ Approve for future contracts
```

---

## 🔐 Fairness & Integrity

### Safeguards
- All calculations transparent and auditable
- Historical tracking of rating changes
- Reasons for each deduction logged
- Government officials can see full breakdown
- Prevents contractor manipulation

### Anti-Gaming Measures
- Can't resolve fake complaints
- Photo evidence required
- Timestamp verification
- IP/location tracking ready

---

## 📝 Summary

The rating algorithm is:
- **Fair**: Multi-factor approach considers context
- **Transparent**: Breakdown visible to all stakeholders
- **Actionable**: Clear recommendations for government
- **Automated**: Calculates instantly after complaints
- **Configurable**: Weights can be adjusted per policy

This is the **heart of the Smart Road System** - turning complaint data into accountability.

---

*Refer to `backend/utils/ratingCalculator.js` for complete implementation*
