const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Admin, RoadProject, Contractor } = require('../config/models');
const { verifyAdminToken } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * POST /api/admin/register
 * Register a new admin (only for super_admin)
 */
router.post('/register', verifyAdminToken, async (req, res) => {
  try {
    // Check if requester is super_admin
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admin can register new admins' });
    }

    const { username, email, password, fullName } = req.body;

    // Validation
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ 
      where: { $or: [{ username }, { email }] } 
    });

    if (existingAdmin) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Create new admin
    const newAdmin = await Admin.create({
      username,
      email,
      password,
      fullName,
      role: 'admin'
    });

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email,
        fullName: newAdmin.fullName,
        role: newAdmin.role
      }
    });

  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/login
 * Admin login endpoint
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find admin by username
    const admin = await Admin.findOne({ where: { username } });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({ error: 'Admin account is inactive' });
    }

    // Verify password
    const isPasswordValid = await admin.validatePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/roads
 * Add a new road (admin only)
 */
router.post('/roads', verifyAdminToken, async (req, res) => {
  try {
    const { roadId, roadName, contractorId, contractorName, latitude, longitude, address, constructionDate, completionDate, warrantyPeriodYears } = req.body;

    // Validation
    if (!roadId || !roadName) {
      return res.status(400).json({ error: 'Road ID and Road Name are required' });
    }

    // Check if road already exists
    const existingRoad = await RoadProject.findOne({ where: { roadId } });
    if (existingRoad) {
      return res.status(400).json({ error: 'Road with this ID already exists' });
    }

    // If contractorId is provided, verify contractor exists
    if (contractorId) {
      const contractor = await Contractor.findByPk(contractorId);
      if (!contractor) {
        return res.status(400).json({ error: 'Contractor not found' });
      }
    }

    // Generate QR Code data
    const qrCodeData = JSON.stringify({
      roadId,
      roadName,
      timestamp: new Date().toISOString()
    });

    // Calculate warranty end date (default 10 years from now)
    const warrantyYears = warrantyPeriodYears || 10;
    const warrantyEndDate = new Date();
    warrantyEndDate.setFullYear(warrantyEndDate.getFullYear() + warrantyYears);

    // Create new road
    const newRoad = await RoadProject.create({
      roadId,
      roadName,
      contractorId: contractorId || null,
      contractorName: contractorName || null,
      latitude: latitude || null,
      longitude: longitude || null,
      address: address || null,
      constructionDate: constructionDate || new Date(),
      completionDate: completionDate || new Date(),
      warrantyPeriodYears: warrantyYears,
      warrantyEndDate: warrantyEndDate,
      qrCodeData: qrCodeData,
      status: 'planned'
    });

    // Fetch the created road with contractor details
    const roadWithContractor = await RoadProject.findByPk(newRoad.id, {
      include: [{ association: 'contractor' }]
    });

    res.status(201).json({
      message: 'Road added successfully',
      road: roadWithContractor
    });

  } catch (error) {
    console.error('Error adding road:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/roads
 * Get all roads (admin only)
 */
router.get('/roads', verifyAdminToken, async (req, res) => {
  try {
    const roads = await RoadProject.findAll({
      include: [{ association: 'contractor' }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      count: roads.length,
      roads
    });

  } catch (error) {
    console.error('Error fetching roads:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/admin/roads/:id
 * Update road details (admin only)
 */
router.put('/roads/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { roadId, roadName, contractorId, contractorName, latitude, longitude, address, status } = req.body;

    // Find road
    const road = await RoadProject.findByPk(id);
    if (!road) {
      return res.status(404).json({ error: 'Road not found' });
    }

    // Check if new roadId is already taken by another road
    if (roadId && roadId !== road.roadId) {
      const existingRoad = await RoadProject.findOne({ where: { roadId } });
      if (existingRoad) {
        return res.status(400).json({ error: 'Road with this ID already exists' });
      }
    }

    // Update road
    if (roadId) road.roadId = roadId;
    if (roadName) road.roadName = roadName;
    if (contractorId !== undefined) road.contractorId = contractorId;
    if (contractorName !== undefined) road.contractorName = contractorName;
    if (latitude) road.latitude = latitude;
    if (longitude) road.longitude = longitude;
    if (address) road.address = address;
    if (status) road.status = status;

    await road.save();

    // Fetch updated road with contractor details
    const updatedRoad = await RoadProject.findByPk(id, {
      include: [{ association: 'contractor' }]
    });

    res.status(200).json({
      message: 'Road updated successfully',
      road: updatedRoad
    });

  } catch (error) {
    console.error('Error updating road:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/admin/roads/:id
 * Delete a road (admin only)
 */
router.delete('/roads/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    const road = await RoadProject.findByPk(id);
    if (!road) {
      return res.status(404).json({ error: 'Road not found' });
    }

    await road.destroy();

    res.status(200).json({ message: 'Road deleted successfully' });

  } catch (error) {
    console.error('Error deleting road:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/roads/:roadId/assign-contractor
 * Assign a contractor to a road (admin only)
 */
router.post('/roads/:roadId/assign-contractor', verifyAdminToken, async (req, res) => {
  try {
    const { roadId } = req.params;
    const { contractorId } = req.body;

    if (!contractorId) {
      return res.status(400).json({ error: 'Contractor ID is required' });
    }

    // Find road
    const road = await RoadProject.findByPk(roadId);
    if (!road) {
      return res.status(404).json({ error: 'Road not found' });
    }

    // Verify contractor exists
    const contractor = await Contractor.findByPk(contractorId);
    if (!contractor) {
      return res.status(400).json({ error: 'Contractor not found' });
    }

    // Assign contractor to road
    await road.update({ contractorId: contractorId });

    // Fetch updated road with contractor details
    const updatedRoad = await RoadProject.findByPk(roadId, {
      include: [{ association: 'contractor' }]
    });

    res.status(200).json({
      message: 'Contractor assigned successfully',
      road: updatedRoad
    });

  } catch (error) {
    console.error('Error assigning contractor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/contractors
 * Get all contractors available for assignment (admin only)
 */
router.get('/contractors', verifyAdminToken, async (req, res) => {
  try {
    const contractors = await Contractor.findAll({
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      count: contractors.length,
      contractors
    });

  } catch (error) {
    console.error('Error fetching contractors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/profile
 * Get logged-in admin profile
 */
router.get('/profile', verifyAdminToken, async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.admin.id, {
      attributes: { exclude: ['password'] }
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.status(200).json({ admin });

  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
