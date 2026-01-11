import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LogoutModal from './LogoutModal';

// StatCard Component for Dashboard Statistics
const StatCard = ({ icon, title, value, subtitle, gradient, trend }) => {
  return (
    <div className="glass-effect rounded-2xl p-6 shadow-xl-custom border border-white/20 hover:shadow-2xl transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        {trend && (
          <span className="text-sm font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-lg font-semibold text-gray-700">{title}</p>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
};

const AdminDashboard = () => {
  const [roads, setRoads] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('roads');
  const [showRoadForm, setShowRoadForm] = useState(false);
  const [showContractorForm, setShowContractorForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
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
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/complaints-roads/complaints');
      setComplaints(response.data.complaints || []);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    }
  };

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
    setDeleteTarget(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const token = getAuthToken();
      await axios.delete(
        `http://localhost:5000/api/admin/roads/${deleteTarget}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setSuccess('Road deleted successfully!');
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchRoads();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete road');
      setShowDeleteModal(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  // Calculate statistics
  const stats = {
    totalRoads: roads.length,
    activeContractors: contractors.filter(c => c.currentRating > 0).length,
    openComplaints: complaints.filter(c => c.status !== 'resolved').length,
    resolvedIssues: complaints.filter(c => c.status === 'resolved').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header with Glassmorphism */}
      <header className="sticky top-0 z-50 glass-effect border-b border-white/20 shadow-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-50"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">Admin Dashboard</h1>
                <p className="text-xs text-gray-600 font-medium">Infrastructure Management Panel</p>
              </div>
            </div>

            {/* Action Buttons - Pill Style */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => navigate('/contractor-dashboard')}
                className="group flex items-center space-x-2 px-4 py-2.5 rounded-full bg-white/70 hover:bg-white border border-purple-200 hover:border-purple-300 hover:shadow-glass transition-all duration-300"
              >
                <svg className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-semibold text-gray-700">Performance</span>
              </button>

              <button
                onClick={() => navigate('/admin/dashboard/government')}
                className="group flex items-center space-x-2 px-4 py-2.5 rounded-full bg-white/70 hover:bg-white border border-green-200 hover:border-green-300 hover:shadow-glass transition-all duration-300"
              >
                <svg className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                <span className="font-semibold text-gray-700">Government</span>
              </button>

              <button
                onClick={handleLogout}
                className="group flex items-center space-x-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Messages */}
        {error && (
          <div className="mb-6 glass-effect border-l-4 border-red-500 p-4 rounded-xl animate-slide-up">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
              <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 glass-effect border-l-4 border-green-500 p-4 rounded-xl animate-slide-up">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-700 font-medium">{success}</p>
              <button onClick={() => setSuccess('')} className="ml-auto text-green-500 hover:text-green-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
          <StatCard
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            }
            title="Total Roads"
            value={stats.totalRoads}
            subtitle="Infrastructure count"
            gradient="from-blue-500 to-indigo-500"
            trend="+12%"
          />

          <StatCard
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            title="Active Contractors"
            value={stats.activeContractors}
            subtitle="Verified partners"
            gradient="from-purple-500 to-pink-500"
            trend="+5"
          />

          <StatCard
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            title="Open Complaints"
            value={stats.openComplaints}
            subtitle="Pending resolution"
            gradient="from-yellow-500 to-orange-500"
            trend="Priority"
          />

          <StatCard
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="Resolved Issues"
            value={stats.resolvedIssues}
            subtitle="Successfully closed"
            gradient="from-green-500 to-emerald-500"
            trend="+8%"
          />
        </div>

        {/* Modern Tab Navigation */}
        <div className="glass-effect rounded-2xl p-2 mb-8 inline-flex space-x-2 shadow-glass">
          <button
            onClick={() => setActiveTab('roads')}
            className={`
              relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2
              ${activeTab === 'roads'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>Roads</span>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'roads' ? 'bg-white/20' : 'bg-gray-200'}`}>
              {roads.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('contractors')}
            className={`
              relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2
              ${activeTab === 'contractors'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Contractors</span>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'contractors' ? 'bg-white/20' : 'bg-gray-200'}`}>
              {contractors.length}
            </span>
          </button>
        </div>

        {/* ROADS TAB */}
        {activeTab === 'roads' && (
          <div className="space-y-6">
            {/* Floating Add Button */}
            {!showRoadForm && (
              <div className="flex justify-end">
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
                  className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full font-bold shadow-lg hover:shadow-glow transform hover:-translate-y-1 transition-all duration-300"
                >
                  <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add New Road</span>
                </button>
              </div>
            )}

            {/* Add/Edit Road Form - Modern Design */}
            {showRoadForm && (
              <div className="glass-effect rounded-2xl shadow-xl-custom overflow-hidden border border-white/20 animate-scale-in">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-white/20 rounded-xl">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          {editingId ? 'Edit Road Details' : 'Add New Road'}
                        </h2>
                        <p className="text-blue-100 text-sm">Fill in the infrastructure information below</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowRoadForm(false);
                        setEditingId(null);
                      }}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Form Body */}
                <form onSubmit={handleRoadSubmit} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Road ID */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                        Road ID <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="roadId"
                          value={roadFormData.roadId}
                          onChange={handleRoadChange}
                          placeholder="e.g., ROAD-001"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
                          required
                        />
                      </div>
                    </div>

                    {/* Road Name */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                        Road Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="roadName"
                        value={roadFormData.roadName}
                        onChange={handleRoadChange}
                        placeholder="e.g., Main Street Highway"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                        required
                      />
                    </div>

                    {/* Latitude */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                        Latitude
                      </label>
                      <input
                        type="number"
                        name="latitude"
                        value={roadFormData.latitude}
                        onChange={handleRoadChange}
                        placeholder="e.g., 28.6139"
                        step="0.00001"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      />
                    </div>

                    {/* Longitude */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                        Longitude
                      </label>
                      <input
                        type="number"
                        name="longitude"
                        value={roadFormData.longitude}
                        onChange={handleRoadChange}
                        placeholder="e.g., 77.2090"
                        step="0.00001"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={roadFormData.address}
                      onChange={handleRoadChange}
                      placeholder="Enter complete road address"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>

                  {/* Contractor Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                      Assign Contractor
                    </label>
                    <select
                      name="contractorId"
                      value={roadFormData.contractorId}
                      onChange={handleRoadChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-white"
                    >
                      <option value="">-- Select from existing --</option>
                      {contractors.map(contractor => (
                        <option key={contractor.id} value={contractor.id}>
                          {contractor.name} ({contractor.contractorId})
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center space-x-3 mt-3">
                      <div className="flex-1 border-t border-gray-200"></div>
                      <span className="text-sm text-gray-500 font-medium">OR</span>
                      <div className="flex-1 border-t border-gray-200"></div>
                    </div>
                    <input
                      type="text"
                      name="contractorName"
                      value={roadFormData.contractorName}
                      onChange={handleRoadChange}
                      placeholder="Type contractor name manually"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    />
                    <p className="text-xs text-gray-500 flex items-center space-x-1 mt-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Select from dropdown or type a new contractor name</span>
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{editingId ? 'Update Road' : 'Create Road'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRoadForm(false);
                        setEditingId(null);
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all duration-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Cancel</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Modern Roads Table */}
            <div className="glass-effect rounded-2xl shadow-xl-custom overflow-hidden border border-white/20">
              {/* Table Header */}
              <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Road Infrastructure
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Manage all roads in the system</p>
                  </div>
                  <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span className="font-bold text-2xl text-gray-900">{roads.length}</span>
                    <span className="text-sm text-gray-600">Total</span>
                  </div>
                </div>
              </div>

              {/* Table Content */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                  <p className="text-gray-600 font-medium">Loading roads data...</p>
                </div>
              ) : roads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="p-6 bg-gray-100 rounded-full">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">No Roads Yet</h3>
                  <p className="text-gray-600">Get started by adding your first road infrastructure</p>
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
                    className="mt-4 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add First Road</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    {/* Table Header */}
                    <thead className="bg-white/50 sticky top-0 backdrop-blur-sm">
                      <tr className="border-b-2 border-gray-200">
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Road ID</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Road Name</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contractor</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="divide-y divide-gray-100">
                      {roads.map((road, index) => (
                        <tr
                          key={road.id}
                          className="hover:bg-blue-50/50 transition-colors duration-200 group"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {/* Road ID */}
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                              </div>
                              <span className="font-bold text-blue-600">{road.roadId}</span>
                            </div>
                          </td>

                          {/* Road Name */}
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{road.roadName}</div>
                            {road.address && (
                              <div className="text-sm text-gray-500 mt-1 flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="truncate max-w-xs">{road.address}</span>
                              </div>
                            )}
                          </td>

                          {/* Contractor */}
                          <td className="px-6 py-4">
                            {road.contractor || road.contractorName ? (
                              <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full border border-green-200">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-sm font-semibold text-green-800">
                                  {road.contractor?.name || road.contractorName}
                                </span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                <span className="text-sm font-medium text-gray-600">Not assigned</span>
                              </div>
                            )}
                          </td>

                          {/* Location */}
                          <td className="px-6 py-4">
                            {road.latitude && road.longitude ? (
                              <div className="text-sm space-y-1">
                                <div className="font-mono text-gray-600">
                                  {Number(road.latitude).toFixed(4)}°, {Number(road.longitude).toFixed(4)}°
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-bold ${
                              road.status === 'active'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : road.status === 'inactive'
                                ? 'bg-gray-100 text-gray-800 border border-gray-200'
                                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${
                                road.status === 'active' ? 'bg-green-500' : road.status === 'inactive' ? 'bg-gray-500' : 'bg-yellow-500'
                              }`}></span>
                              <span>{road.status || 'planned'}</span>
                            </span>
                          </td>

                          {/* Actions - Icon Buttons */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleEdit(road)}
                                className="group/btn p-2 bg-blue-100 hover:bg-blue-600 rounded-lg transition-all duration-300 border border-blue-200 hover:border-blue-600"
                                title="Edit Road"
                              >
                                <svg className="w-5 h-5 text-blue-600 group-hover/btn:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>

                              <button
                                onClick={() => handleDelete(road.id)}
                                className="group/btn p-2 bg-red-100 hover:bg-red-600 rounded-lg transition-all duration-300 border border-red-200 hover:border-red-600"
                                title="Delete Road"
                              >
                                <svg className="w-5 h-5 text-red-600 group-hover/btn:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTRACTORS TAB */}
        {activeTab === 'contractors' && (
          <div className="space-y-6">
            {/* Floating Add Contractor Button */}
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
                className="fixed bottom-8 right-8 z-50 flex items-center space-x-3 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold shadow-2xl hover:shadow-green-500/50 transform hover:-translate-y-1 transition-all duration-300 group"
              >
                <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Contractor</span>
              </button>
            )}

            {/* Modern Add Contractor Form */}
            {showContractorForm && (
              <div className="glass-effect rounded-2xl shadow-xl-custom overflow-hidden border border-white/20 animate-fade-in">
                {/* Form Header */}
                <div className="px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Add New Contractor</h2>
                      <p className="text-green-100 mt-1">Register a new contractor in the system</p>
                    </div>
                    <button
                      onClick={() => setShowContractorForm(false)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Form Body */}
                <form onSubmit={handleAddContractor} className="p-8 space-y-6 bg-white/80 backdrop-blur-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contractor ID */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Contractor ID *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="contractorId"
                          value={contractorFormData.contractorId}
                          onChange={handleContractorChange}
                          placeholder="e.g., CONT-001"
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Contractor Name */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Contractor Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={contractorFormData.name}
                          onChange={handleContractorChange}
                          placeholder="e.g., ABC Construction Co."
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={contractorFormData.email}
                        onChange={handleContractorChange}
                        placeholder="e.g., contractor@company.com"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Add Contractor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowContractorForm(false)}
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Cancel</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Modern Contractors Grid */}
            <div className="glass-effect rounded-2xl shadow-xl-custom overflow-hidden border border-white/20">
              {/* Header */}
              <div className="px-8 py-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Registered Contractors
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Manage contractor profiles and performance</p>
                  </div>
                  <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-bold text-2xl text-gray-900">{contractors.length}</span>
                    <span className="text-sm text-gray-600">Active</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              {contractors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="p-6 bg-gray-100 rounded-full">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">No Contractors Yet</h3>
                  <p className="text-gray-600">Start by adding your first contractor profile</p>
                  <button
                    onClick={() => {
                      setShowContractorForm(true);
                      setContractorFormData({
                        contractorId: '',
                        name: '',
                        email: ''
                      });
                    }}
                    className="mt-4 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add First Contractor</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-8">
                  {contractors.map((contractor, index) => (
                    <div
                      key={contractor.id}
                      className="bg-white rounded-2xl border-2 border-gray-100 hover:border-green-300 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Card Header with Gradient */}
                      <div className="relative h-24 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute top-4 right-4 z-10">
                          <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-bold ${
                            contractor.currentRating >= 4
                              ? 'bg-white text-green-600'
                              : contractor.currentRating >= 3
                              ? 'bg-white text-yellow-600'
                              : 'bg-white text-red-600'
                          }`}>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>{contractor.currentRating?.toFixed(1) || '0.0'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6 space-y-4">
                        {/* Contractor Info */}
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                            {contractor.name}
                          </h3>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-mono rounded">
                              {contractor.contractorId}
                            </span>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{contractor.email}</span>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{contractor.totalRatings || 0}</div>
                            <div className="text-xs text-gray-600 font-medium">Ratings</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{contractor.totalProjects || 0}</div>
                            <div className="text-xs text-gray-600 font-medium">Projects</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{contractor.totalComplaints || 0}</div>
                            <div className="text-xs text-gray-600 font-medium">Issues</div>
                          </div>
                        </div>

                        {/* Recommendation */}
                        <div className={`p-3 rounded-lg text-sm font-semibold text-center ${
                          contractor.recommendation === 'Highly Recommended'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : contractor.recommendation === 'Recommended'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : contractor.recommendation === 'Not Recommended'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-gray-50 text-gray-700 border border-gray-200'
                        }`}>
                          {contractor.recommendation || 'No ratings yet'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Confirm Deletion</h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-gray-700 text-base leading-relaxed">
                Are you sure you want to delete this road? This action cannot be undone and will permanently remove the road from the system.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-semibold">
                  ⚠️ Warning: This will also affect all related data and reports.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete Road</span>
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </div>
  );
};

export default AdminDashboard;
