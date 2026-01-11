const express = require('express');
const router = express.Router();
const { Complaint, RoadProject, Contractor } = require('../config/models');
const { calculateContractorRating } = require('../utils/ratingCalculator');

/**
 * POST /api/complaints
 * Submit a new complaint for a road
 */
router.post('/', async (req, res) => {
  try {
    const { roadId, userId, userEmail, userPhone, damageType, description, photoUrl, location, severity } = req.body;

    // Validate required fields
    if (!roadId || !damageType || !description) {
      return res.status(400).json({ error: 'Missing required fields: roadId, damageType, description' });
    }

    // Fetch the road project by roadId (string field, not database ID)
    const roadProject = await RoadProject.findOne({ 
      where: { roadId: roadId },
      include: { association: 'contractor' }
    });
    if (!roadProject) {
      return res.status(404).json({ error: 'Road project not found' });
    }

    // Create complaint
    const complaintId = `COMPLAINT-${Date.now()}`;
    const complaint = await Complaint.create({
      complaintId,
      roadId: roadProject.id,
      userId: userId || 'anonymous',
      userEmail,
      userPhone,
      damageType,
      description,
      photoUrl,
      latitude: location?.latitude,
      longitude: location?.longitude,
      severity: severity || 'Medium'
    });

    // Update contractor's total complaints and recalculate rating
    let updatedRating = null;
    const contractor = await Contractor.findByPk(roadProject.contractorId);
    if (contractor) {
      contractor.totalComplaints += 1;

      // Recalculate rating
      const contractorProjects = await RoadProject.findAll({ 
        where: { contractorId: contractor.id }
      });
      const allComplaints = await Complaint.findAll({
        where: { 
          roadId: contractorProjects.map(p => p.id)
        }
      });

      const ratingResult = calculateContractorRating(contractor, contractorProjects, allComplaints);
      contractor.currentRating = ratingResult.finalRating;
      updatedRating = ratingResult.finalRating;
      await contractor.save();
    }

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint,
      updatedRating: updatedRating
    });

  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/complaints
 * Get all complaints
 */
router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.findAll({
      include: [
        {
          model: RoadProject,
          as: 'road',
          attributes: ['roadId', 'roadName', 'address']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      count: complaints.length,
      complaints
    });

  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/complaints/:roadId
 * Get all complaints for a specific road
 */
router.get('/:roadId', async (req, res) => {
  try {
    const { roadId } = req.params;

    const complaints = await Complaint.findAll({ 
      where: { roadId },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      count: complaints.length,
      complaints
    });

  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/complaints/:complaintId
 * Update complaint status
 */
router.put('/:complaintId', async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status, resolution } = req.body;

    const complaint = await Complaint.findOne({ where: { id: complaintId } });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    complaint.status = status;
    if (status === 'Resolved') {
      complaint.resolvedDate = new Date();
      complaint.resolutionDescription = resolution?.description;
    }
    await complaint.save();

    res.status(200).json({
      message: 'Complaint updated successfully',
      complaint
    });

  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
