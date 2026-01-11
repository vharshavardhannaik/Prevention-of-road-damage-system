const express = require('express');
const router = express.Router();
const { RoadProject, Contractor, Complaint } = require('../config/models');

/**
 * GET /api/roads/:roadId
 * Get road details by ID (roadId field, not database ID)
 */
router.get('/:roadId', async (req, res) => {
  try {
    const { roadId } = req.params;

    const road = await RoadProject.findOne({
      where: { roadId: roadId },
      include: [
        { association: 'contractor' },
        { association: 'complaints' }
      ]
    });

    if (!road) {
      return res.status(404).json({ error: 'Road not found' });
    }

    res.status(200).json({ road });

  } catch (error) {
    console.error('Error fetching road:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/roads
 * Get all roads
 */
router.get('/', async (req, res) => {
  try {
    const roads = await RoadProject.findAll({
      include: [
        { association: 'contractor' }
      ],
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

module.exports = router;
