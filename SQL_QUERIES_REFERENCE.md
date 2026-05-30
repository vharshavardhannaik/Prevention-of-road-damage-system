# SQL Queries Reference - Smart Road System

**Database**: `smart_road_system`  
**Host**: `localhost:3306`  
**Port**: `3306`

## Common Queries

### 1. View All Roads
```sql
SELECT * FROM RoadProjects;
```

### 2. View All Contractors
```sql
SELECT * FROM Contractors;
```

### 3. View All Complaints
```sql
SELECT * FROM Complaints;
```

### 4. View All Ratings
```sql
SELECT * FROM Ratings;
```

### 5. View Admin User(s)
```sql
SELECT id, username, email, createdAt FROM Admins;
```

---

## Analytics Queries

### 6. Contractor Performance (Avg Rating)
```sql
SELECT 
  c.id,
  c.name,
  ROUND(AVG(r.rating), 2) as avg_rating,
  COUNT(r.id) as total_ratings,
  COUNT(DISTINCT com.id) as total_complaints
FROM Contractors c
LEFT JOIN Ratings r ON c.id = r.contractor_id
LEFT JOIN Complaints com ON c.id = com.contractor_id
GROUP BY c.id, c.name
ORDER BY avg_rating DESC;
```

### 7. Complaints by Road
```sql
SELECT 
  road_id,
  damage_type,
  severity,
  COUNT(*) as total
FROM Complaints
GROUP BY road_id, damage_type, severity
ORDER BY total DESC;
```

### 8. Complaints by Severity
```sql
SELECT 
  severity,
  COUNT(*) as count
FROM Complaints
GROUP BY severity
ORDER BY count DESC;
```

### 9. Total Complaints Per Road
```sql
SELECT 
  road_id,
  COUNT(*) as complaint_count
FROM Complaints
GROUP BY road_id
ORDER BY complaint_count DESC;
```

### 10. Recent Complaints (Last 10)
```sql
SELECT 
  id,
  road_id,
  damage_type,
  severity,
  reported_by,
  created_at
FROM Complaints
ORDER BY created_at DESC
LIMIT 10;
```

---

## Data Modification Queries

### 11. Delete All Test Data
```sql
DELETE FROM Complaints;
DELETE FROM Ratings;
DELETE FROM Contractors;
DELETE FROM RoadProjects;
```

### 12. Update Complaint Status
```sql
UPDATE Complaints 
SET status = 'Resolved' 
WHERE id = 'COMPLAINT-ID';
```

### 13. Update Contractor Info
```sql
UPDATE Contractors 
SET name = 'New Name', email = 'new@email.com' 
WHERE id = 'CONTRACTOR-ID';
```

### 14. Insert Test Road
```sql
INSERT INTO RoadProjects (id, name, location, length_km, surface_type, created_at, updated_at)
VALUES ('TEST-ROAD-001', 'Test Road', 'Test Location', 5.5, 'asphalt', NOW(), NOW());
```

---

## How to Run These Queries

### Option 1: Using MySQL CLI
```bash
mysql -h localhost -u root -p smart_road_system
```

Then paste any query above.

### Option 2: Using MySQL GUI (e.g., MySQL Workbench)
1. Connect to `localhost:3306`
2. Select database `smart_road_system`
3. Paste query in SQL editor
4. Execute

### Option 3: Using Node.js (from backend)
Create a file `query.js`:
```javascript
const sequelize = require('./config/database');
const Complaint = require('./models/Complaint');
const Contractor = require('./models/Contractor');

async function getStats() {
  const complaints = await Complaint.findAll();
  const contractors = await Contractor.findAll();
  console.log('Complaints:', complaints.length);
  console.log('Contractors:', contractors.length);
}

getStats();
```

Then run: `node query.js`

---

## Table Structure Summary

**RoadProjects**: Stores road information
- `id`, `name`, `location`, `length_km`, `surface_type`

**Contractors**: Stores contractor details
- `id`, `name`, `email`, `phone`, `license_number`, `specialization`

**Complaints**: Road damage reports
- `id`, `road_id`, `damage_type`, `severity`, `description`, `photo_base64`, `reported_by`, `status`

**Ratings**: Contractor performance ratings
- `id`, `contractor_id`, `rating`, `comment`, `created_at`

**Admins**: Admin users
- `id`, `username`, `email`, `password_hash`, `role`
