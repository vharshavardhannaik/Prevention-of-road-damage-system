import React, { useState } from 'react';
import axios from 'axios';

const ComplaintForm = ({ roadData }) => {
  const [formData, setFormData] = useState({
    userId: '',
    userEmail: '',
    userPhone: '',
    damageType: 'Pothole',
    description: '',
    severity: 'Medium',
    photoFile: null,
    contractorRating: 0
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);

  const damageTypes = ['Pothole', 'Crack', 'Erosion', 'Flooding', 'Other'];
  const severityLevels = ['Low', 'Medium', 'High', 'Critical'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        photoFile: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    if (!formData.description.trim()) {
      setErrorMessage('Please provide a description of the damage');
      setLoading(false);
      return;
    }

    if (!formData.damageType) {
      setErrorMessage('Please select a type of damage');
      setLoading(false);
      return;
    }

    try {
      let photoUrl = '';

      // If photo is uploaded, convert to base64
      if (formData.photoFile) {
        const reader = new FileReader();
        photoUrl = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(formData.photoFile);
        });
      }

      const complaintPayload = {
        roadId: roadData.roadId,
        userId: formData.userId || 'anonymous',
        userEmail: formData.userEmail || 'user@example.com',
        userPhone: formData.userPhone || 'N/A',
        damageType: formData.damageType,
        description: formData.description,
        severity: formData.severity,
        photoUrl: photoUrl,
        location: {
          latitude: roadData.latitude || 0,
          longitude: roadData.longitude || 0
        }
      };

      const response = await axios.post(
        'http://localhost:8000/api/complaints',
        complaintPayload
      );

      // Submit contractor rating if provided
      if (formData.contractorRating > 0 && roadData.contractorId) {
        try {
          await axios.post(
            'http://localhost:8000/api/contractors/rate',
            {
              contractorId: roadData.contractorId,
              roadId: roadData.id,
              ratingValue: formData.contractorRating,
              userId: formData.userId || 'anonymous',
              userEmail: formData.userEmail || 'user@example.com',
              comment: `Rating from complaint: ${formData.description.substring(0, 50)}`
            }
          );
        } catch (ratingError) {
          console.error('Failed to submit rating:', ratingError);
          // Don't fail the complaint submission if rating fails
        }
      }

      setSuccessMessage(`✓ Complaint submitted successfully! ID: ${response.data.complaint.complaintId}`);

      // Reset form
      setFormData({
        userId: '',
        userEmail: '',
        userPhone: '',
        damageType: 'Pothole',
        description: '',
        severity: 'Medium',
        photoFile: null,
        contractorRating: 0
      });
      setPhotoPreview(null);

      // Show contractor rating impact
      console.log('Updated Contractor Rating:', response.data.updatedRating);

    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Road Info Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">🚨 Report Road Damage</h1>
            <p className="text-blue-100">Help us maintain better roads in your community</p>
          </div>

          <div className="p-8">
            {/* Road Details */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-blue-900">{roadData.roadName}</h2>
                  <p className="text-sm text-blue-700">Road ID: {roadData.roadId}</p>
                </div>
                <div className="text-4xl">🛣️</div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <RoadInfoItem label="Location" value={roadData.location?.address || 'Not specified'} />
                <RoadInfoItem label="Status" value={roadData.status || 'Active'} />
                <RoadInfoItem label="Length" value={`${roadData.roadLength || 0} km`} />
                <RoadInfoItem label="Warranty Until" value={new Date(roadData.warrantyEndDate).toLocaleDateString()} />
              </div>
            </div>

            {/* Complaint Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Your Details */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">👤</span>
                  <h3 className="text-xl font-bold text-gray-800">Your Details</h3>
                  <span className="text-xs text-gray-500">(Optional)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Name"
                    name="userId"
                    type="text"
                    value={formData.userId}
                    onChange={handleInputChange}
                    placeholder="Your name"
                  />
                  <FormInput
                    label="Email"
                    name="userEmail"
                    type="email"
                    value={formData.userEmail}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="mt-4">
                  <FormInput
                    label="Phone"
                    name="userPhone"
                    type="tel"
                    value={formData.userPhone}
                    onChange={handleInputChange}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              {/* Damage Information */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">⚠️</span>
                  <h3 className="text-xl font-bold text-gray-800">Damage Details</h3>
                  <span className="text-xs text-red-600 font-semibold">Required</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type of Damage</label>
                    <select
                      name="damageType"
                      value={formData.damageType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    >
                      {damageTypes.map(type => (
                        <option key={type} value={type}>
                          {type === 'Pothole' && '🕳️ '}{type === 'Crack' && '🔨 '}{type === 'Erosion' && '💧 '}{type === 'Flooding' && '🌊 '}{type === 'Other' && '❓ '}{type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Severity Level</label>
                    <select
                      name="severity"
                      value={formData.severity}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    >
                      {severityLevels.map(level => {
                        const severityEmoji = {
                          'Low': '✅',
                          'Medium': '⚠️',
                          'High': '🔴',
                          'Critical': '🚨'
                        };
                        return (
                          <option key={level} value={level}>{severityEmoji[level]} {level}</option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description of Damage</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the damage in detail... (e.g., Large pothole near intersection, water pooling on road, etc.)"
                    rows="4"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Contractor Rating */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">⭐</span>
                  <h3 className="text-xl font-bold text-gray-800">Rate the Contractor</h3>
                  <span className="text-xs text-gray-500">(Optional)</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-sm text-gray-600 mb-4">Rate the contractor's work quality for this road</p>
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, contractorRating: star }))}
                        className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                      >
                        {star <= formData.contractorRating ? '⭐' : '☆'}
                      </button>
                    ))}
                  </div>
                  <div className="text-center">
                    {formData.contractorRating > 0 ? (
                      <p className="text-lg font-bold text-blue-600">
                        {formData.contractorRating === 1 && 'Poor'}
                        {formData.contractorRating === 2 && 'Fair'}
                        {formData.contractorRating === 3 && 'Good'}
                        {formData.contractorRating === 4 && 'Very Good'}
                        {formData.contractorRating === 5 && 'Excellent'}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">Click stars to rate</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">📸</span>
                  <h3 className="text-xl font-bold text-gray-800">Photo Evidence</h3>
                </div>
                <div className="border-2 border-dashed border-gray-400 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition duration-300 cursor-pointer bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-input"
                  />
                  <label htmlFor="photo-input" className="cursor-pointer block">
                    <p className="text-4xl mb-2">📷</p>
                    <p className="text-gray-700 font-semibold mb-1">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </label>
                </div>

                {photoPreview && (
                  <div className="mt-4 relative">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-semibold text-green-600">✓ Photo selected</span>
                    </div>
                    <img src={photoPreview} alt="preview" className="max-w-full h-64 object-cover rounded-lg shadow-lg" />
                  </div>
                )}
              </div>

              {/* Messages */}
              {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <p className="font-semibold text-green-800">Success!</p>
                      <p className="text-green-700 text-sm">{successMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">✗</span>
                    <div>
                      <p className="font-semibold text-red-800">Error</p>
                      <p className="text-red-700 text-sm">{errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-4 rounded-lg transition duration-200 text-lg shadow-lg"
              >
                {loading ? '⏳ Submitting...' : '✓ Submit Complaint'}
              </button>

              <p className="text-xs text-gray-600 text-center bg-gray-50 p-3 rounded-lg">
                💡 This report will help us track road quality and hold contractors accountable for their work
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Component - Form Input
const FormInput = ({ label, name, type = 'text', value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
    />
  </div>
);

// Helper Component - Road Info Item
const RoadInfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-blue-600 uppercase">{label}</p>
    <p className="text-sm font-bold text-blue-900 mt-1">{value}</p>
  </div>
);

export default ComplaintForm;
