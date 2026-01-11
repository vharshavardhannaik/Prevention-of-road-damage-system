const express = require('express');
const router = express.Router();
const { Contractor, RoadProject, Complaint, Rating } = require('../config/models');
const { calculateContractorRating, getRiskLevel } = require('../utils/ratingCalculator');

/**
 * POST /api/contractors
 * Create a new contractor
 */
router.post('/', async (req, res) => {
  try {
    const { contractorId, name, email } = req.body;

    // Validation
    if (!contractorId || !name || !email) {
      return res.status(400).json({ error: 'contractorId, name, and email are required' });
    }

    // Check if contractor already exists
    const existingContractor = await Contractor.findOne({
      where: { contractorId }
    });

    if (existingContractor) {
      return res.status(409).json({ error: 'Contractor with this ID already exists' });
    }

    // Create contractor
    const newContractor = await Contractor.create({
      contractorId,
      name,
      email,
      password: 'DefaultPassword@123', // Default password
      currentRating: 0,
      totalComplaints: 0,
      totalProjects: 0
    });

    res.status(201).json({
      message: 'Contractor created successfully',
      contractor: {
        id: newContractor.id,
        contractorId: newContractor.contractorId,
        name: newContractor.name,
        email: newContractor.email,
        currentRating: 0,
        totalComplaints: 0,
        totalProjects: 0
      }
    });
  } catch (error) {
    console.error('Error creating contractor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/contractors
 * Fetch all contractors sorted by rating
 */
router.get('/', async (req, res) => {
  try {
    const { sortBy = 'rating', order = 'desc' } = req.query;

    const contractors = await Contractor.findAll({
      attributes: { exclude: ['password'] },
      include: [
        { association: 'ratings' }
      ]
    });

    // Get real ratings from database
    const enrichedContractors = await Promise.all(
      contractors.map(async (contractor) => {
        const ratings = contractor.ratings || [];
        const avgRating = ratings.length > 0
          ? (ratings.reduce((sum, r) => r.ratingValue ? sum + parseFloat(r.ratingValue) : sum, 0) / ratings.length)
          : 0;

        const projects = await RoadProject.findAll({ 
          where: { contractorId: contractor.id }
        });
        const complaints = await Complaint.findAll({
          where: { 
            roadId: projects.map(p => p.id)
          }
        });

        return {
          id: contractor.id,
          contractorId: contractor.contractorId,
          name: contractor.name,
          email: contractor.email,
          currentRating: parseFloat(avgRating.toFixed(2)),
          totalRatings: ratings.length,
          totalComplaints: complaints.length,
          totalProjects: projects.length,
          riskLevel: avgRating < 2 ? 'High' : avgRating < 3.5 ? 'Medium' : 'Low',
          recommendation: avgRating < 2 ? 'Review required' : avgRating < 3.5 ? 'Conditional approval' : 'Approve for future contracts',
          createdAt: contractor.createdAt
        };
      })
    );

    // Sort contractors
    if (sortBy === 'rating') {
      enrichedContractors.sort((a, b) => 
        order === 'desc' ? b.currentRating - a.currentRating : a.currentRating - b.currentRating
      );
    } else if (sortBy === 'complaints') {
      enrichedContractors.sort((a, b) =>
        order === 'desc' ? b.totalComplaints - a.totalComplaints : a.totalComplaints - b.totalComplaints
      );
    }

    res.status(200).json({
      count: enrichedContractors.length,
      contractors: enrichedContractors
    });

  } catch (error) {
    console.error('Error fetching contractors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/contractors/rate
 * Submit a rating for a contractor (simpler endpoint)
 */
router.post('/rate', async (req, res) => {
  try {
    const { contractorId, roadId, ratingValue, userEmail, userId, comment } = req.body;

    // Validation
    if (!contractorId) {
      return res.status(400).json({ error: 'Contractor ID is required' });
    }

    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Verify contractor exists
    const contractor = await Contractor.findByPk(contractorId);
    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }

    // Create rating
    const rating = await Rating.create({
      contractorId,
      roadId: roadId || null,
      ratingValue,
      userEmail: userEmail || 'anonymous@example.com',
      userId: userId || 'anonymous',
      comment: comment || null
    });

    // Recalculate and update contractor's average rating
    const allRatings = await Rating.findAll({
      where: { contractorId }
    });

    const avgRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r.ratingValue, 0) / allRatings.length
      : 5.0;

    await contractor.update({ currentRating: avgRating });

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: rating.toJSON(),
      contractorAvgRating: avgRating.toFixed(2)
    });

  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/contractors/:contractorId
 * Get detailed information about a specific contractor
 */
router.get('/:contractorId', async (req, res) => {
  try {
    const { contractorId } = req.params;

    const contractor = await Contractor.findByPk(contractorId, {
      attributes: { exclude: ['password'] }
    });

    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }

    const projects = await RoadProject.findAll({ 
      where: { contractorId: contractor.id }
    });
    const complaints = await Complaint.findAll({
      where: { 
        roadId: projects.map(p => p.id)
      }
    });

    const ratingResult = calculateContractorRating(contractor, projects, complaints);
    const riskLevel = getRiskLevel(ratingResult.finalRating);

    res.status(200).json({
      contractor: {
        ...contractor.toJSON(),
        currentRating: ratingResult.finalRating,
        ratingDeductions: ratingResult.deductions,
        totalComplaints: complaints.length,
        resolvedComplaints: complaints.filter(c => c.status === 'Resolved').length,
        pendingComplaints: complaints.filter(c => c.status === 'Open' || c.status === 'Under Review').length,
        riskLevel: riskLevel.level,
        recommendation: riskLevel.recommendation,
        ratingCategory: ratingResult.ratingCategory
      }
    });

  } catch (error) {
    console.error('Error fetching contractor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/contractors/:contractorId/projects
 * Get all projects of a contractor
 */
router.get('/:contractorId/projects', async (req, res) => {
  try {
    const { contractorId } = req.params;

    const projects = await RoadProject.findAll({
      where: { contractorId },
      include: { association: 'complaints' }
    });

    res.status(200).json({
      count: projects.length,
      projects
    });

  } catch (error) {
    console.error('Error fetching contractor projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/contractors/:contractorId/rate
 * Submit a rating for a contractor on a specific road
 */
router.post('/:contractorId/rate', async (req, res) => {
  try {
    const { contractorId } = req.params;
    const { roadId, ratingValue, userEmail, userId, comment } = req.body;

    // Validation
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (!roadId) {
      return res.status(400).json({ error: 'Road ID is required' });
    }

    // Verify contractor exists
    const contractor = await Contractor.findByPk(contractorId);
    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }

    // Create rating
    const rating = await Rating.create({
      contractorId,
      roadId,
      ratingValue,
      userEmail: userEmail || 'anonymous@example.com',
      userId: userId || 'anonymous',
      comment: comment || null
    });

    // Recalculate and update contractor's average rating
    const allRatings = await Rating.findAll({
      where: { contractorId }
    });

    const avgRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r.ratingValue, 0) / allRatings.length
      : 5.0;

    await contractor.update({ currentRating: avgRating });

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: rating.toJSON(),
      contractorAvgRating: avgRating.toFixed(2)
    });

  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/contractors/:contractorId/performance
 * Get detailed performance metrics for a contractor
 */
router.get('/:contractorId/performance', async (req, res) => {
  try {
    const { contractorId } = req.params;

    const contractor = await Contractor.findByPk(contractorId, {
      include: [
        { association: 'ratings' }
      ]
    });

    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }

    const ratings = contractor.ratings || [];
    const projects = await RoadProject.findAll({ 
      where: { contractorId: contractor.id }
    });

    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.ratingValue, 0) / ratings.length).toFixed(2)
      : 0;

    const performanceScore = calculatePerformanceScore(avgRating, contractor.totalComplaints);

    res.status(200).json({
      contractor: {
        id: contractor.id,
        name: contractor.name,
        contractorId: contractor.contractorId
      },
      performance: {
        averageRating: parseFloat(avgRating),
        totalRatings: ratings.length,
        totalComplaints: contractor.totalComplaints,
        totalProjects: projects.length,
        performanceScore: performanceScore,
        performanceRank: getPerformanceRank(performanceScore),
        ratingDistribution: getRatingDistribution(ratings),
        recentRatings: ratings.slice(-5).reverse()
      }
    });

  } catch (error) {
    console.error('Error fetching performance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/contractors/performance/dashboard
 * Get all contractors ranked by performance
 */
router.get('/performance/dashboard', async (req, res) => {
  try {
    const contractors = await Contractor.findAll({
      include: [
        { association: 'ratings' }
      ]
    });

    const performanceData = contractors.map(contractor => {
      const ratings = contractor.ratings || [];
      const avgRating = ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + r.ratingValue, 0) / ratings.length).toFixed(2)
        : 0;

      const performanceScore = calculatePerformanceScore(avgRating, contractor.totalComplaints);

      return {
        id: contractor.id,
        contractorId: contractor.contractorId,
        name: contractor.name,
        averageRating: parseFloat(avgRating),
        totalRatings: ratings.length,
        totalComplaints: contractor.totalComplaints,
        totalProjects: contractor.totalProjects,
        performanceScore: parseFloat(performanceScore),
        status: contractor.totalComplaints < 5 && avgRating >= 4 ? 'TOP' : 
                contractor.totalComplaints > 15 || avgRating < 3 ? 'BOTTOM' : 'AVERAGE'
      };
    });

    // Sort by performance score
    performanceData.sort((a, b) => b.performanceScore - a.performanceScore);

    const topPerformers = performanceData.filter(c => c.status === 'TOP');
    const bottomPerformers = performanceData.filter(c => c.status === 'BOTTOM');
    const averagePerformers = performanceData.filter(c => c.status === 'AVERAGE');

    res.status(200).json({
      totalContractors: performanceData.length,
      topPerformers,
      averagePerformers,
      bottomPerformers,
      allContractors: performanceData
    });

  } catch (error) {
    console.error('Error fetching performance dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to calculate performance score
function calculatePerformanceScore(avgRating, totalComplaints) {
  const ratingWeight = 60;
  const complaintWeight = 40;
  
  const ratingScore = (parseFloat(avgRating) / 5) * ratingWeight;
  const complaintScore = Math.max(0, (100 - (totalComplaints * 5)) / 100) * complaintWeight;
  
  return (ratingScore + complaintScore).toFixed(2);
}

// Helper function to get performance rank
function getPerformanceRank(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Average';
  return 'Poor';
}

// Helper function to get rating distribution
function getRatingDistribution(ratings) {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach(r => {
    distribution[r.ratingValue]++;
  });
  return distribution;
}

module.exports = router;
