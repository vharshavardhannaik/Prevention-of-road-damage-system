import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GovernmentDashboard = () => {
  const [contractors, setContractors] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contractorsRes, complaintsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/contractors'),
        axios.get('http://localhost:5000/api/complaints')
      ]);
      setContractors(contractorsRes.data.contractors || []);
      setComplaints(complaintsRes.data.complaints || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingBadge = (rating) => {
    if (rating >= 4.5) return { bg: 'bg-green-100', text: 'text-green-800', icon: '⭐' };
    if (rating >= 4.0) return { bg: 'bg-blue-100', text: 'text-blue-800', icon: '✓' };
    if (rating >= 3.0) return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⚠' };
    if (rating >= 2.0) return { bg: 'bg-orange-100', text: 'text-orange-800', icon: '✗' };
    return { bg: 'bg-red-100', text: 'text-red-800', icon: '✗✗' };
  };

  const getRiskColor = (level) => {
    const colors = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-orange-100 text-orange-800',
      'Critical': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div className="text-center py-12 text-gray-600">Loading contractors...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="mb-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            ← Back to Admin Dashboard
          </button>
          <h1 className="text-5xl font-bold text-white mb-2">🏛️ Government Dashboard</h1>
          <p className="text-gray-400 text-lg">Monitor contractor performance and road project quality</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-10">
          <DashboardStat label="Total Contractors" value={contractors.length} icon="🏢" />
          <DashboardStat label="Avg Rating" value={(contractors.reduce((a, b) => a + b.currentRating, 0) / contractors.length || 0).toFixed(1)} icon="⭐" />
          <DashboardStat label="Total Complaints" value={complaints.length} icon="📝" />
          <DashboardStat label="Total Projects" value={contractors.reduce((a, b) => a + b.totalProjects, 0)} icon="🛣️" />
        </div>

        {/* Contractors Table */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Contractor Performance Metrics</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Contractor Name</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Rating</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-800">Complaints</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-800">Projects</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-800">Risk Level</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {contractors.map((c, idx) => {
                  const badge = getRatingBadge(c.currentRating);
                  return (
                    <tr key={c.id || idx} className="hover:bg-blue-50 transition duration-200">
                      <td className="px-6 py-4 font-semibold text-gray-800">{c.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-lg font-bold text-sm`}>
                            {c.currentRating.toFixed(2)} / 5.0
                          </span>
                          <span className="text-lg">{badge.icon}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-lg font-bold">{c.totalComplaints}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-bold">{c.totalProjects}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`${getRiskColor(c.riskLevel)} px-3 py-1 rounded-lg font-bold text-sm`}>
                          {c.riskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{c.recommendation}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-8 py-4 text-sm text-gray-600 border-t">
            Showing {contractors.length} contractors
          </div>
        </div>

        {/* Recent Complaints Section */}
        <div className="mt-10 bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Recent Damage Reports</h2>
          </div>
          {complaints.length === 0 ? (
            <div className="px-8 py-12 text-center text-gray-600">
              <p className="text-lg">No complaints submitted yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-gray-800">Complaint ID</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-800">Road</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-800">Damage Type</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-800">Severity</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-800">Reporter</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-800">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {complaints.slice(0, 10).map((complaint, idx) => (
                    <tr key={complaint.id || idx} className="hover:bg-yellow-50 transition duration-200">
                      <td className="px-6 py-4 font-semibold text-gray-800">{complaint.complaintId}</td>
                      <td className="px-6 py-4 text-gray-700">{complaint.road?.roadName || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-700">{complaint.damageType}</td>
                      <td className="px-6 py-4">
                        <span className={`${complaint.severity === 'High' ? 'bg-red-100 text-red-800' :
                            complaint.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                          } px-3 py-1 rounded-lg font-bold text-sm`}>
                          {complaint.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{complaint.userEmail}</td>
                      <td className="px-6 py-4 text-gray-700">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="bg-gray-50 px-8 py-4 text-sm text-gray-600 border-t">
            Showing {Math.min(complaints.length, 10)} of {complaints.length} complaints
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Stat Component
const DashboardStat = ({ label, value, icon }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600 hover:shadow-xl transition">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-semibold">{label}</p>
        <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
      </div>
      <div className="text-4xl opacity-20">{icon}</div>
    </div>
  </div>
);

export default GovernmentDashboard;
