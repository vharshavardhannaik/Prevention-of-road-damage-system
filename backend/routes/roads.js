const express = require('express');
const router = express.Router();
const { RoadProject, Contractor, Complaint } = require('../config/models');
const QRCode = require('qrcode');

/**
 * GET /api/roads/:roadId
 * Get road details by ID (roadId field, not database ID)
 * Case-insensitive search
 */
router.get('/:roadId', async (req, res) => {
  try {
    const { roadId } = req.params;

    // Get all roads and filter case-insensitively
    const roads = await RoadProject.findAll({
      include: [
        { association: 'contractor' },
        { association: 'complaints' }
      ]
    });

    const road = roads.find(r => r.roadId.toLowerCase() === roadId.toLowerCase());

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

/**
 * GET /api/roads/:roadId/qr
 * Generate a QR code PNG that encodes a public URL to the road report page
 */
router.get('/:roadId/qr', async (req, res) => {
  try {
    const { roadId } = req.params;
    const road = await RoadProject.findOne({ where: { roadId } });
    if (!road) return res.status(404).send('Road not found');

    // Allow specifying frontend URL via query param (useful for dev where frontend port may differ)
    const frontendFromQuery = req.query.frontendUrl;
    const FRONTEND_URL = frontendFromQuery || process.env.FRONTEND_URL || `${req.protocol}://${req.get('host').split(':')[0]}:3000`;
    const publicUrl = `${FRONTEND_URL.replace(/\/$/, '')}/report/${road.roadId}`;
    const qrBuffer = await QRCode.toBuffer(publicUrl, { type: 'png', width: 400 });
    res.set('Content-Type', 'image/png');
    res.send(qrBuffer);
  } catch (err) {
    console.error('QR generation error', err);
    res.status(500).json({ error: 'Unable to generate QR' });
  }
});
