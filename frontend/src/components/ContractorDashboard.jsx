import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ContractorDashboard = () => {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('rating');
  const [filterRisk, setFilterRisk] = useState('all');
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);

  useEffect(() => {
    fetchContractors();
  }, [sortBy]);

  const fetchContractors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/contractors?sortBy=${sortBy}&order=desc`);
      setContractors(response.data.contractors);
    } catch (error) {
      console.error('Error fetching contractors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async (contractor) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/contractors/${contractor.contractorId}/qr`);
      setSelectedContractor({ ...contractor, qrCode: response.data.qrCode, qrUrl: response.data.qrUrl });
      setShowQRModal(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code');
    }
  };

  const handleGenerateAllQR = async () => {
    try {
      setGeneratingAll(true);
      const response = await axios.post('http://localhost:8000/api/contractors/generate-all-qr');
      alert(`Successfully generated QR codes for ${response.data.generated} contractors!`);
      fetchContractors();
    } catch (error) {
      console.error('Error generating QR codes:', error);
      alert('Failed to generate QR codes for all contractors');
    } finally {
      setGeneratingAll(false);
    }
  };

  const downloadQR = () => {
    if (selectedContractor && selectedContractor.qrCode) {
      const link = document.createElement('a');
      link.href = selectedContractor.qrCode;
      link.download = `${selectedContractor.contractorId}_QRCode.png`;
      link.click();
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
                

          {/* Generate All QR Codes Button */}
          <div className="mt-4">
            <button
              onClick={handleGenerateAllQR}
              disabled={generatingAll}
              className={`w-full ${generatingAll ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2`}
            >
              {generatingAll ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating QR Codes...
                </>
              ) : (
                <>
                  📱 Generate QR Codes for All Contractors
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              This will create QR codes for all contractors so citizens can scan and provide feedback
            </p>
          </div><option value="Medium">Medium Risk</option>
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
                    <th className="px-6 py-4 text-center font-semibold">Recommendation</th>                    <th className="px-6 py-4 text-center font-semibold">QR Code</th>                  </tr>
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
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <button
                                onClick={() => handleGenerateQR(contractor)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                              >
                                📱 View QR
                              </button>
                              {contractor.hasQRCode && (
                                <span className="text-xs text-green-600 font-semibold">✓ QR Generated</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
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

      {/* QR Code Modal */}
      {showQRModal && selectedContractor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">QR Code</h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {selectedContractor.name}
              </h3>
              <p className="text-gray-600 mb-6">ID: {selectedContractor.contractorId}</p>
              
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <img 
                  src={selectedContractor.qrCode} 
                  alt="QR Code" 
                  className="mx-auto w-64 h-64"
                />
              </div>
              
              <p className="text-sm text-gray-600 mb-6">
                Scan this QR code to rate and provide feedback about this contractor
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={downloadQR}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  📥 Download QR Code
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition"
                >
                  Close
                </button>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold mb-2">Feedback URL:</p>
                <a 
                  href={selectedContractor.qrUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 break-all"
                >
                  {selectedContractor.qrUrl}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorDashboard;
