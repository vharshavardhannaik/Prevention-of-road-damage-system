// Frontend API service for managing requests
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Complaint Service
export const complaintService = {
  // Submit new complaint
  submitComplaint: async (complaintData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaintData)
      });
      if (!response.ok) throw new Error('Failed to submit complaint');
      return await response.json();
    } catch (error) {
      console.error('Complaint submission error:', error);
      throw error;
    }
  },

  // Get complaints for a road
  getComplaintsForRoad: async (roadId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/complaints/${roadId}`);
      if (!response.ok) throw new Error('Failed to fetch complaints');
      return await response.json();
    } catch (error) {
      console.error('Get complaints error:', error);
      throw error;
    }
  },

  // Update complaint status
  updateComplaint: async (complaintId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update complaint');
      return await response.json();
    } catch (error) {
      console.error('Update complaint error:', error);
      throw error;
    }
  }
};

// Contractor Service
export const contractorService = {
  // Get all contractors
  getAllContractors: async (sortBy = 'rating', order = 'desc') => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/contractors?sortBy=${sortBy}&order=${order}`
      );
      if (!response.ok) throw new Error('Failed to fetch contractors');
      return await response.json();
    } catch (error) {
      console.error('Get contractors error:', error);
      throw error;
    }
  },

  // Get contractor details
  getContractorDetails: async (contractorId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contractors/${contractorId}`);
      if (!response.ok) throw new Error('Failed to fetch contractor');
      return await response.json();
    } catch (error) {
      console.error('Get contractor error:', error);
      throw error;
    }
  },

  // Get contractor projects
  getContractorProjects: async (contractorId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/contractors/${contractorId}/projects`
      );
      if (!response.ok) throw new Error('Failed to fetch projects');
      return await response.json();
    } catch (error) {
      console.error('Get projects error:', error);
      throw error;
    }
  }
};

// Road Service
export const roadService = {
  // Get all roads
  getAllRoads: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/roads`);
      if (!response.ok) throw new Error('Failed to fetch roads');
      return await response.json();
    } catch (error) {
      console.error('Get roads error:', error);
      throw error;
    }
  },

  // Get road details by ID
  getRoadDetails: async (roadId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/roads/${roadId}`);
      if (!response.ok) throw new Error('Failed to fetch road');
      return await response.json();
    } catch (error) {
      console.error('Get road error:', error);
      throw error;
    }
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`);
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};
