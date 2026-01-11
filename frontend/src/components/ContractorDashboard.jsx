import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ContractorDashboard = () => {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('rating');
  const [filterRisk, setFilterRisk] = useState('all');

  useEffect(() => {
    fetchContractors();
  }, [sortBy]);

  const fetchContractors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/contractors?sortBy=${sortBy}&order=desc`);
      setContractors(response.data.contractors);
    } catch (error) {
      console.error('Error fetching contractors:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingBadge = (rating) => {
    if (rating >= 4.5) return { bg: 'bg-green-100', text: 'text-green-800', label: 'Excellent ✓' };
    if (rating >= 4.0) return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Very Good' };
    if (rating >= 3.0) return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Good' };
    if (rating >= 2.0) return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Fair ⚠' };
    return { bg: 'bg-red-100', text: 'text-red-800', label: 'Poor ✗' };
  };

  const getRiskBadgeColor = (riskLevel) => {
    if (riskLevel === 'Very Low') return 'bg-green-100 text-green-800';
    if (riskLevel === 'Low') return 'bg-blue-100 text-blue-800';
    if (riskLevel === 'Medium') return 'bg-yellow-100 text-yellow-800';
    if (riskLevel === 'High') return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const filteredContractors = filterRisk === 'all'
    ? contractors
    : contractors.filter(c => c.riskLevel === filterRisk);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">🏛️ Government Contract Dashboard</h1>
          <p className="text-slate-300">Monitor contractor performance and make informed contract decisions</p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="rating">Rating (Highest First)</option>
                <option value="complaints">Complaints (Most Issues)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Risk</label>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Risk Levels</option>
                <option value="Very Low">Very Low Risk</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
                <option value="Very High">Very High Risk</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchContractors}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                🔄 Refresh Data
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Excellent Rating</p>
              <p className="text-2xl font-bold text-green-600">{contractors.filter(c => c.currentRating >= 4.5).length}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">At Risk</p>
              <p className="text-2xl font-bold text-yellow-600">{contractors.filter(c => c.currentRating < 3.0).length}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Contractors</p>
              <p className="text-2xl font-bold text-blue-600">{contractors.length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Complaints</p>
              <p className="text-2xl font-bold text-purple-600">{contractors.reduce((sum, c) => sum + c.totalComplaints, 0)}</p>
            </div>
          </div>
        </div>

        {/* Contractors Table */}
        {loading ? (
          <div className="text-center text-white py-12">
            <p className="text-lg">Loading contractor data...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Contractor Name</th>
                    <th className="px-6 py-4 text-left font-semibold">Rating</th>
                    <th className="px-6 py-4 text-center font-semibold">Status</th>
                    <th className="px-6 py-4 text-center font-semibold">Complaints</th>
                    <th className="px-6 py-4 text-center font-semibold">Projects</th>
                    <th className="px-6 py-4 text-center font-semibold">Risk Level</th>
                    <th className="px-6 py-4 text-center font-semibold">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredContractors.length > 0 ? (
                    filteredContractors.map((contractor) => {
                      const badge = getRatingBadge(contractor.currentRating);
                      const riskColor = getRiskBadgeColor(contractor.riskLevel);

                      return (
                        <tr key={contractor._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-900">{contractor.name}</p>
                              <p className="text-sm text-gray-500">{contractor.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full font-bold text-lg`}>
                                {contractor.currentRating.toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-600">/ 5.0</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{badge.label}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
                              {contractor.ratingCategory}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-lg font-bold text-gray-900">{contractor.totalComplaints}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-lg font-bold text-gray-900">{contractor.totalProjects}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${riskColor}`}>
                              {contractor.riskLevel}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <p className="text-sm font-medium text-gray-700">{contractor.recommendation}</p>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        No contractors found matching the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Risk Level Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">Very Low</span>
              <p className="text-sm text-gray-600">Approve for future contracts</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">Medium</span>
              <p className="text-sm text-gray-600">Conditional approval</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">Very High</span>
              <p className="text-sm text-gray-600">Blacklist from contracts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorDashboard;
