import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ContractorFeedback = () => {
  const { contractorId } = useParams();
  const navigate = useNavigate();
  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rating'); // 'rating' or 'complaint'
  
  // Rating state
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);
  
  // Complaint state
  const [complaintDescription, setComplaintDescription] = useState('');
  const [complaintLocation, setComplaintLocation] = useState('');
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);
  const [complaintSuccess, setComplaintSuccess] = useState(false);

  const fetchContractorInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/public/contractor/${contractorId}`);
      setContractor(response.data);
    } catch (error) {
      console.error('Error fetching contractor:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractorInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractorId]);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      setRatingSubmitting(true);
      await axios.post(`http://localhost:8000/api/public/contractor/${contractorId}/rating`, {
        ratingValue: rating,
        comment: ratingComment
      });
      
      setRatingSuccess(true);
      setRating(0);
      setRatingComment('');
      
      // Refresh contractor info
      fetchContractorInfo();
      
      setTimeout(() => setRatingSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!complaintDescription.trim()) {
      alert('Please provide a description');
      return;
    }

    try {
      setComplaintSubmitting(true);
      await axios.post(`http://localhost:8000/api/public/contractor/${contractorId}/complaint`, {
        description: complaintDescription,
        location: complaintLocation
      });
      
      setComplaintSuccess(true);
      setComplaintDescription('');
      setComplaintLocation('');
      
      // Refresh contractor info
      fetchContractorInfo();
      
      setTimeout(() => setComplaintSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Failed to submit complaint. Please try again.');
    } finally {
      setComplaintSubmitting(false);
    }
  };

  const renderStars = (count, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      const filled = interactive 
        ? (hoveredRating || rating) >= starValue 
        : count >= starValue;
      
      return (
        <span
          key={i}
          className={`text-4xl cursor-pointer transition-all ${
            filled ? 'text-yellow-400' : 'text-gray-300'
          } ${interactive ? 'hover:scale-110' : ''}`}
          onClick={interactive ? () => setRating(starValue) : undefined}
          onMouseEnter={interactive ? () => setHoveredRating(starValue) : undefined}
          onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
        >
          ★
        </span>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl text-red-600">Contractor not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all font-semibold"
          >
            <span className="text-xl">←</span>
            <span>Back to Home</span>
          </button>
        </div>

        {/* Header - Enhanced Contractor Details */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🏗️</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{contractor.name}</h1>
            <p className="text-gray-600 mb-2 text-lg">
              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                ID: {contractor.contractorId}
              </span>
            </p>
            <p className="text-gray-500 mb-6">
              📧 {contractor.email}
            </p>
            
            {/* Rating Display */}
            <div className="flex justify-center gap-8 mt-8 mb-6">
              <div className="text-center bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl shadow-md">
                <div className="text-lg text-gray-700 font-semibold mb-2">Current Rating</div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {renderStars(contractor.currentRating)}
                </div>
                <span className="text-4xl font-bold text-orange-600 mt-3 block">
                  {contractor.currentRating.toFixed(1)}/5.0
                </span>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{contractor.totalProjects}</div>
                <div className="text-sm text-gray-600 mt-1">Total Projects</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-red-600">{contractor.totalComplaints}</div>
                <div className="text-sm text-gray-600 mt-1">Complaints</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {contractor.totalProjects - contractor.totalComplaints >= 0 
                    ? contractor.totalProjects - contractor.totalComplaints 
                    : 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">Successful Projects</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {contractor.totalProjects > 0 
                    ? Math.round(((contractor.totalProjects - contractor.totalComplaints) / contractor.totalProjects) * 100)
                    : 100}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Success Rate</div>
              </div>
            </div>

            {/* Performance Badge */}
            <div className="mt-6">
              {contractor.currentRating >= 4.5 && (
                <span className="bg-green-500 text-white px-6 py-2 rounded-full text-sm font-bold inline-flex items-center">
                  ✓ Excellent Performance
                </span>
              )}
              {contractor.currentRating >= 3.5 && contractor.currentRating < 4.5 && (
                <span className="bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-bold inline-flex items-center">
                  ✓ Good Performance
                </span>
              )}
              {contractor.currentRating >= 2.5 && contractor.currentRating < 3.5 && (
                <span className="bg-yellow-500 text-white px-6 py-2 rounded-full text-sm font-bold inline-flex items-center">
                  ⚠ Average Performance
                </span>
              )}
              {contractor.currentRating < 2.5 && (
                <span className="bg-red-500 text-white px-6 py-2 rounded-full text-sm font-bold inline-flex items-center">
                  ⚠ Needs Improvement
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('rating')}
              className={`flex-1 py-4 px-6 text-lg font-semibold transition-colors ${
                activeTab === 'rating'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ⭐ Give Rating
            </button>
            <button
              onClick={() => setActiveTab('complaint')}
              className={`flex-1 py-4 px-6 text-lg font-semibold transition-colors ${
                activeTab === 'complaint'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📝 Submit Complaint
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'rating' ? (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Rate Your Experience</h2>
                
                {ratingSuccess && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                    ✓ Thank you! Your rating has been submitted successfully.
                  </div>
                )}
                
                <form onSubmit={handleRatingSubmit}>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Select Your Rating *
                    </label>
                    <div className="flex justify-center gap-2 py-4">
                      {renderStars(rating, true)}
                    </div>
                    {rating > 0 && (
                      <p className="text-center text-gray-600 mt-2">
                        You selected: {rating} star{rating !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Additional Comments (Optional)
                    </label>
                    <textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      rows="4"
                      placeholder="Share your experience with this contractor..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={ratingSubmitting || rating === 0}
                    className={`w-full py-4 rounded-lg text-white font-semibold text-lg transition-all ${
                      ratingSubmitting || rating === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                    }`}
                  >
                    {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit a Complaint</h2>
                
                {complaintSuccess && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                    ✓ Thank you! Your complaint has been submitted successfully.
                  </div>
                )}
                
                <form onSubmit={handleComplaintSubmit}>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Description *
                    </label>
                    <textarea
                      value={complaintDescription}
                      onChange={(e) => setComplaintDescription(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      rows="5"
                      placeholder="Describe the issue or concern..."
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={complaintLocation}
                      onChange={(e) => setComplaintLocation(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter the location related to this complaint"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={complaintSubmitting || !complaintDescription.trim()}
                    className={`w-full py-4 rounded-lg text-white font-semibold text-lg transition-all ${
                      complaintSubmitting || !complaintDescription.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                    }`}
                  >
                    {complaintSubmitting ? 'Submitting...' : 'Submit Complaint'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p>Your feedback helps improve our services</p>
        </div>
      </div>
    </div>
  );
};

export default ContractorFeedback;
