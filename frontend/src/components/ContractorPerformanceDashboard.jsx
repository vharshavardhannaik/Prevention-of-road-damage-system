import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ContractorDashboard = () => {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedContractor, setSelectedContractor] = useState(null);
  const navigate = useNavigate();
  const [ratingForm, setRatingForm] = useState({
    ratingValue: 5,
    userEmail: '',
    userId: '',
    comment: ''
  });

  useEffect(() => {
    fetchContractors();
  }, []);

  const fetchContractors = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        'http://localhost:8000/api/contractors'
      );
      setContractors(response.data.contractors || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch contractor data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (e) => {
    const { name, value } = e.target;
    setRatingForm({
      ...ratingForm,
      [name]: value
    });
  };

  const submitRating = async () => {
    if (!selectedContractor) return;

    if (!ratingForm.userEmail) {
      setError('Email is required to submit a rating');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/contractors/${selectedContractor.id}/rate`,
        {
          ...ratingForm,
          roadId: 1 // Default road ID for ratings
        }
      );
      setSuccess(`Rating submitted successfully! New average: ${response.data.contractorAvgRating}/5.0`);
      setError('');
      setRatingForm({ ratingValue: 5, userEmail: '', userId: '', comment: '' });
      setSelectedContractor(null);
      setTimeout(() => {
        setSuccess('');
        fetchContractors();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit rating');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600 text-lg">Loading contractor data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          ← Back to Admin Dashboard
        </button>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Contractor Performance Metrics</h1>
        <p className="text-gray-600">Rate contractors based on their work quality and performance</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* All Contractors */}
      {contractors.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 text-lg">No contractors added yet. Contact admin to add contractors.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Contractor Name</th>
                  <th className="px-6 py-4 text-center font-semibold">Rating</th>
                  <th className="px-6 py-4 text-center font-semibold">Complaints</th>
                  <th className="px-6 py-4 text-center font-semibold">Projects</th>
                  <th className="px-6 py-4 text-center font-semibold">Risk Level</th>
                  <th className="px-6 py-4 text-left font-semibold">Recommendation</th>
                  <th className="px-6 py-4 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {contractors.map((contractor, index) => (
                  <tr
                    key={contractor.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 hover:bg-blue-50`}
                  >
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      <div>
                        <p className="font-bold">{contractor.name}</p>
                        <p className="text-sm text-gray-500">{contractor.contractorId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-bold ${contractor.currentRating >= 4
                              ? 'bg-green-100 text-green-800'
                              : contractor.currentRating >= 3
                                ? 'bg-yellow-100 text-yellow-800'
                                : contractor.currentRating > 0
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                          {contractor.currentRating > 0
                            ? `${contractor.currentRating.toFixed(2)} / 5.0`
                            : 'No ratings yet'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {contractor.totalRatings > 0 ? `(${contractor.totalRatings} ratings)` : '(0 ratings)'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${contractor.totalComplaints === 0
                            ? 'bg-green-100 text-green-800'
                            : contractor.totalComplaints < 5
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {contractor.totalComplaints}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                        {contractor.totalProjects || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${contractor.riskLevel === 'Low'
                            ? 'bg-green-100 text-green-800'
                            : contractor.riskLevel === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {contractor.riskLevel || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <p className="text-sm">{contractor.recommendation || 'Pending ratings'}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedContractor(contractor)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                      >
                        ⭐ Rate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {selectedContractor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Rate {selectedContractor.name}
            </h2>
            <p className="text-gray-600 text-sm mb-4">ID: {selectedContractor.contractorId}</p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Rating (1-5) *</label>
                <select
                  name="ratingValue"
                  value={ratingForm.ratingValue}
                  onChange={handleRatingChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                >
                  <option value={1}>⭐ 1 - Poor</option>
                  <option value={2}>⭐⭐ 2 - Fair</option>
                  <option value={3}>⭐⭐⭐ 3 - Good</option>
                  <option value={4}>⭐⭐⭐⭐ 4 - Very Good</option>
                  <option value={5}>⭐⭐⭐⭐⭐ 5 - Excellent</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Your Email *</label>
                <input
                  type="email"
                  name="userEmail"
                  value={ratingForm.userEmail}
                  onChange={handleRatingChange}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Your Name (Optional)</label>
                <input
                  type="text"
                  name="userId"
                  value={ratingForm.userId}
                  onChange={handleRatingChange}
                  placeholder="Your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Comments (Optional)</label>
                <textarea
                  name="comment"
                  value={ratingForm.comment}
                  onChange={handleRatingChange}
                  placeholder="Share your experience with this contractor..."
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  rows="3"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={submitRating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Submit Rating
                </button>
                <button
                  onClick={() => {
                    setSelectedContractor(null);
                    setError('');
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorDashboard;
