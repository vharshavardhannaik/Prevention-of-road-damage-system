import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LogoutModal from './LogoutModal';

const AdminDashboard = () => {
  const [roads, setRoads] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('roads');
  const [showRoadForm, setShowRoadForm] = useState(false);
  const [showContractorForm, setShowContractorForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const [roadFormData, setRoadFormData] = useState({
    roadId: '',
    roadName: '',
    latitude: '',
    longitude: '',
    address: '',
    contractorId: '',
    contractorName: ''
  });

  const [contractorFormData, setContractorFormData] = useState({
    contractorId: '',
    name: '',
    email: ''
  });

  const getAuthToken = () => {
    const token = localStorage.getItem('adminToken');
    return token;
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchRoads();
    fetchContractors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRoads = async () => {
    setLoading(true);
    setError(''); // Clear any previous errors
    try {
      const response = await axios.get('http://localhost:5000/api/admin/roads');
      console.log('Fetched roads:', response.data);
      setRoads(response.data.roads || []);
      setError(''); // Clear error on success
    } catch (err) {
      console.error('Fetch roads error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.error || 'Failed to fetch roads');
      setRoads([]); // Clear roads on error
    } finally {
      setLoading(false);
    }
  };

  const fetchContractors = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/contractors');
      setContractors(response.data.contractors);
    } catch (err) {
      console.error('Failed to fetch contractors:', err);
    }
  };

  const handleRoadChange = (e) => {
    const { name, value } = e.target;
    setRoadFormData({
      ...roadFormData,
      [name]: value
    });
  };

  const handleContractorChange = (e) => {
    const { name, value } = e.target;
    setContractorFormData({
      ...contractorFormData,
      [name]: value
    });
  };

  const handleAddContractor = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/contractors',
        contractorFormData
      );

      setSuccess('Contractor added successfully!');
      setContractorFormData({
        contractorId: '',
        name: '',
        email: ''
      });
      setShowContractorForm(false);

      // Refresh contractors list
      setTimeout(() => {
        fetchContractors();
      }, 500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add contractor');
    }
  };

  const handleRoadSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = getAuthToken();

      if (editingId) {
        // Update existing road
        await axios.put(
          `http://localhost:5000/api/admin/roads/${editingId}`,
          roadFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setSuccess('Road updated successfully!');
      } else {
        // Create new road
        await axios.post(
          'http://localhost:5000/api/admin/roads',
          roadFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setSuccess('Road added successfully!');
      }

      // Reset form
      setRoadFormData({
        roadId: '',
        roadName: '',
        latitude: '',
        longitude: '',
        address: '',
        contractorId: '',
        contractorName: ''
      });
      setShowRoadForm(false);
      setEditingId(null);

      // Refresh roads list
      setTimeout(() => {
        fetchRoads();
      }, 500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save road');
    }
  };

  const handleEdit = (road) => {
    setRoadFormData({
      roadId: road.roadId,
      roadName: road.roadName,
      latitude: road.latitude || '',
      longitude: road.longitude || '',
      address: road.address || '',
      contractorId: road.contractorId || '',
      contractorName: road.contractorName || ''
    });
    setEditingId(road.id);
    setShowRoadForm(true);
    setActiveTab('roads');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this road?')) return;

    try {
      const token = getAuthToken();
      await axios.delete(
        `http://localhost:5000/api/admin/roads/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setSuccess('Road deleted successfully!');
      fetchRoads();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete road');
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/contractor-dashboard')}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white font-semibold"
            >
              📊 Contractor Performance
            </button>
            <button
              onClick={() => navigate('/admin/dashboard/government')}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold"
            >
              📊 Government Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Alerts */}
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

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('roads')}
            className={`px-6 py-3 font-semibold border-b-4 ${activeTab === 'roads'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
          >
            🛣️ Roads ({roads.length})
          </button>
          <button
            onClick={() => setActiveTab('contractors')}
            className={`px-6 py-3 font-semibold border-b-4 ${activeTab === 'contractors'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
          >
            👷 Contractors ({contractors.length})
          </button>
        </div>

        {/* ROADS TAB */}
        {activeTab === 'roads' && (
          <>
            {/* Add Road Button */}
            {!showRoadForm && (
              <button
                onClick={() => {
                  setShowRoadForm(true);
                  setEditingId(null);
                  setRoadFormData({
                    roadId: '',
                    roadName: '',
                    latitude: '',
                    longitude: '',
                    address: '',
                    contractorId: '',
                    contractorName: ''
                  });
                }}
                className="mb-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                + Add New Road
              </button>
            )}

            {/* Add/Edit Road Form */}
            {showRoadForm && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4">
                  {editingId ? 'Edit Road' : 'Add New Road'}
                </h2>
                <form onSubmit={handleRoadSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Road ID *
                    </label>
                    <input
                      type="text"
                      name="roadId"
                      value={roadFormData.roadId}
                      onChange={handleRoadChange}
                      placeholder="e.g., ROAD-001"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Road Name *
                    </label>
                    <input
                      type="text"
                      name="roadName"
                      value={roadFormData.roadName}
                      onChange={handleRoadChange}
                      placeholder="e.g., Highway to Delhi"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      name="latitude"
                      value={roadFormData.latitude}
                      onChange={handleRoadChange}
                      placeholder="e.g., 28.6139"
                      step="0.00001"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      name="longitude"
                      value={roadFormData.longitude}
                      onChange={handleRoadChange}
                      placeholder="e.g., 77.2090"
                      step="0.00001"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={roadFormData.address}
                      onChange={handleRoadChange}
                      placeholder="Enter road address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Contractor (Select or Type)
                    </label>
                    <div className="space-y-2">
                      <select
                        name="contractorId"
                        value={roadFormData.contractorId}
                        onChange={handleRoadChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      >
                        <option value="">-- Select from existing --</option>
                        {contractors.map(contractor => (
                          <option key={contractor.id} value={contractor.id}>
                            {contractor.name} ({contractor.contractorId})
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm">OR</span>
                      </div>
                      <input
                        type="text"
                        name="contractorName"
                        value={roadFormData.contractorName}
                        onChange={handleRoadChange}
                        placeholder="Type contractor name manually"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500">
                        💡 Tip: Select from dropdown or type a new contractor name
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                      {editingId ? 'Update Road' : 'Add Road'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRoadForm(false);
                        setEditingId(null);
                      }}
                      className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Roads List */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">
                  Roads ({roads.length})
                </h2>
              </div>

              {loading ? (
                <div className="p-6 text-center text-gray-500">Loading roads...</div>
              ) : roads.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No roads added yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Road ID</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Road Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Contractor</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Address</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roads.map((road) => (
                        <tr key={road.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4 font-semibold text-blue-600">{road.roadId}</td>
                          <td className="px-6 py-4 text-gray-800">{road.roadName}</td>
                          <td className="px-6 py-4 text-gray-600">
                            {road.contractor || road.contractorName ? (
                              <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                                {road.contractor?.name || road.contractorName || 'N/A'}
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                                Not assigned
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600">{road.address || '-'}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                              {road.status || 'planned'}
                            </span>
                          </td>
                          <td className="px-6 py-4 flex gap-2">
                            <button
                              onClick={() => handleEdit(road)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(road.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* CONTRACTORS TAB */}
        {activeTab === 'contractors' && (
          <>
            {/* Add Contractor Button */}
            {!showContractorForm && (
              <button
                onClick={() => {
                  setShowContractorForm(true);
                  setContractorFormData({
                    contractorId: '',
                    name: '',
                    email: ''
                  });
                }}
                className="mb-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                + Add New Contractor
              </button>
            )}

            {/* Add Contractor Form */}
            {showContractorForm && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4">Add New Contractor</h2>
                <form onSubmit={handleAddContractor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Contractor ID *
                    </label>
                    <input
                      type="text"
                      name="contractorId"
                      value={contractorFormData.contractorId}
                      onChange={handleContractorChange}
                      placeholder="e.g., CONT-001"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Contractor Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={contractorFormData.name}
                      onChange={handleContractorChange}
                      placeholder="e.g., ABC Construction Co."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={contractorFormData.email}
                      onChange={handleContractorChange}
                      placeholder="e.g., contractor@company.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2 flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                      Add Contractor
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowContractorForm(false);
                      }}
                      className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Contractors List */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">
                  Contractors ({contractors.length})
                </h2>
              </div>

              {contractors.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No contractors added yet</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {contractors.map((contractor) => (
                    <div
                      key={contractor.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{contractor.name}</h3>
                          <p className="text-sm text-gray-600">{contractor.contractorId}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${contractor.currentRating >= 4
                              ? 'bg-green-100 text-green-800'
                              : contractor.currentRating >= 3
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                        >
                          ⭐ {contractor.currentRating?.toFixed(1) || '0.0'}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <p>
                          <span className="font-semibold">Email:</span> {contractor.email}
                        </p>
                        <p>
                          <span className="font-semibold">Ratings:</span> {contractor.totalRatings || 0}
                        </p>
                        <p>
                          <span className="font-semibold">Projects:</span> {contractor.totalProjects || 0}
                        </p>
                        <p>
                          <span className="font-semibold">Complaints:</span> {contractor.totalComplaints || 0}
                        </p>
                      </div>

                      <div className="bg-gray-50 px-3 py-2 rounded text-sm">
                        <p className="font-semibold text-gray-700">
                          {contractor.recommendation || 'No ratings yet'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Logout Modal */}
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </div>
  );
};

export default AdminDashboard;
