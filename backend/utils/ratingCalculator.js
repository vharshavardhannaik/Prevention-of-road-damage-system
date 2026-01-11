/**
 * Rating Calculation Algorithm
 * 
 * The rating system evaluates contractors based on:
 * 1. Number of complaints received during warranty period
 * 2. Severity of complaints
 * 3. Resolution rate and time
 * 4. Project history and track record
 */

const calculateContractorRating = (contractor, roadProjects, allComplaints) => {
  const now = new Date();
  let ratingPoints = 5.0; // Start with perfect 5 stars
  let deductions = [];

  // Iterate through all projects of the contractor
  roadProjects.forEach(project => {
    const warrantyEndDate = new Date(project.warrantyEndDate);
    const isUnderWarranty = now <= warrantyEndDate;
    const daysIntoWarranty = Math.floor((now - new Date(project.constructionDate)) / (1000 * 60 * 60 * 24));
    const totalWarrantyDays = (project.warrantyPeriodYears * 365);
    const warrantyPercentage = (daysIntoWarranty / totalWarrantyDays) * 100;

    // Get complaints for this specific road
    const projectComplaints = allComplaints.filter(
      complaint => complaint.roadId === project.id
    );

    if (projectComplaints.length > 0) {
      // Rule 1: Complaint count deduction (during warranty period)
      if (isUnderWarranty) {
        const complaintDeduction = Math.min(projectComplaints.length * 0.3, 2.0);
        ratingPoints -= complaintDeduction;
        deductions.push({
          reason: `${projectComplaints.length} complaints during warranty (Road: ${project.roadName})`,
          deduction: complaintDeduction
        });
      } else {
        // Post-warranty complaints have lesser impact
        const postWarrantyDeduction = Math.min(projectComplaints.length * 0.1, 0.5);
        ratingPoints -= postWarrantyDeduction;
        deductions.push({
          reason: `${projectComplaints.length} complaints post-warranty (Road: ${project.roadName})`,
          deduction: postWarrantyDeduction
        });
      }

      // Rule 2: Severity-based deduction
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
      deductions.push({
        reason: `Severity impact from complaints`,
        deduction: severityDeduction
      });

      // Rule 3: Resolution rate (unresolved complaints penalty)
      const unresolvedComplaints = projectComplaints.filter(c => c.status === 'Open' || c.status === 'Under Review');
      if (unresolvedComplaints.length > 0) {
        const resolutionPenalty = Math.min(unresolvedComplaints.length * 0.2, 1.0);
        ratingPoints -= resolutionPenalty;
        deductions.push({
          reason: `${unresolvedComplaints.length} unresolved complaints`,
          deduction: resolutionPenalty
        });
      }

      // Rule 4: Time since complaint (recent complaints have more impact)
      const recentComplaints = projectComplaints.filter(complaint => {
        const daysSinceComplaint = Math.floor((now - new Date(complaint.createdAt)) / (1000 * 60 * 60 * 24));
        return daysSinceComplaint <= 30; // Recent = within 30 days
      });

      if (recentComplaints.length > 0) {
        const recencyPenalty = Math.min(recentComplaints.length * 0.15, 0.75);
        ratingPoints -= recencyPenalty;
        deductions.push({
          reason: `Recent complaints (within 30 days): ${recentComplaints.length}`,
          deduction: recencyPenalty
        });
      }
    }
  });

  // Ensure rating stays within 0-5 range
  ratingPoints = Math.max(0, Math.min(5.0, ratingPoints));

  return {
    finalRating: parseFloat(ratingPoints.toFixed(2)),
    deductions: deductions,
    totalDeduction: 5.0 - ratingPoints,
    ratingCategory: getRatingCategory(ratingPoints),
    timestamp: new Date()
  };
};

/**
 * Categorize rating for display purposes
 */
const getRatingCategory = (rating) => {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 4.0) return 'Very Good';
  if (rating >= 3.0) return 'Good';
  if (rating >= 2.0) return 'Fair';
  return 'Poor';
};

/**
 * Get rating color for UI display
 */
const getRatingColor = (rating) => {
  if (rating >= 4.5) return '#10b981'; // Green
  if (rating >= 4.0) return '#3b82f6'; // Blue
  if (rating >= 3.0) return '#f59e0b'; // Amber
  if (rating >= 2.0) return '#ef6354'; // Orange
  return '#dc2626'; // Red
};

/**
 * Get risk level for government contract decisions
 */
const getRiskLevel = (rating) => {
  if (rating >= 4.5) return { level: 'Very Low', recommendation: 'Approve for future contracts' };
  if (rating >= 4.0) return { level: 'Low', recommendation: 'Approve with monitoring' };
  if (rating >= 3.0) return { level: 'Medium', recommendation: 'Conditional approval' };
  if (rating >= 2.0) return { level: 'High', recommendation: 'Restricted participation' };
  return { level: 'Very High', recommendation: 'Blacklist from contracts' };
};

module.exports = {
  calculateContractorRating,
  getRatingCategory,
  getRatingColor,
  getRiskLevel
};
