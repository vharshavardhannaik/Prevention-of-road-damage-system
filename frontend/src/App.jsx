import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ComplaintForm from './components/ComplaintForm';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' or 'complaint'
  const [roadData, setRoadData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  // Simulated QR scan - in real app, this would come from QR scanner
  const handleQRScan = async () => {
    if (!qrInput) {
      alert('Please enter a Road ID');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/roads/${qrInput}`);
      setRoadData(response.data.road);
      setCurrentPage('complaint');
    } catch (error) {
      alert('Road not found. Please check the ID and try again.');
      console.error('Error fetching road:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-3xl">🛣️</div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Smart Road</h1>
              <p className="text-xs text-gray-600">Damage Reporting System</p>
            </div>
          </div>
          <div className="hidden md:flex space-x-2">
            <NavButton
              label="Home"
              icon="🏠"
              active={currentPage === 'home'}
              onClick={() => { setCurrentPage('home'); setRoadData(null); }}
            />
            <NavButton
              label="Report Damage"
              icon="🚨"
              active={currentPage === 'complaint'}
              onClick={() => setCurrentPage('complaint')}
            />
            <NavButton
              label="Admin Portal"
              icon="🔐"
              active={false}
              onClick={() => navigate('/admin/login')}
            />
          </div>
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden text-2xl">☰</button>
        </div>
        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-gray-50 border-t p-4 space-y-2">
            <NavButton label="Home" icon="🏠" active={currentPage === 'home'} onClick={() => { setCurrentPage('home'); setShowMobileMenu(false); }} />
            <NavButton label="Report Damage" icon="🚨" active={currentPage === 'complaint'} onClick={() => { setCurrentPage('complaint'); setShowMobileMenu(false); }} />
            <NavButton label="Admin Portal" icon="🔐" active={false} onClick={() => { navigate('/admin/login'); setShowMobileMenu(false); }} />
          </div>
        )}
      </nav>

      {/* Main Content */}
      {currentPage === 'home' ? (
        <HomePage onReportClick={() => setCurrentPage('complaint')} />
      ) : (
        <div>
          {!roadData ? (
            <QRScanPage qrInput={qrInput} setQrInput={setQrInput} handleQRScan={handleQRScan} loading={loading} />
          ) : (
            <ComplaintForm roadData={roadData} onBack={() => setRoadData(null)} />
          )}
        </div>
      )}
    </div>
  );
};

// Navigation Button Component
const NavButton = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-semibold transition duration-300 flex items-center space-x-2 ${active
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      }`}
  >
    <span className="text-lg">{icon}</span>
    <span>{label}</span>
  </button>
);

// Home Page Component
const HomePage = ({ onReportClick }) => {
  const [stats, setStats] = useState({ roads: 0, contractors: 0, complaints: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [roadsRes, contractorsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/roads'),
        axios.get('http://localhost:5000/api/contractors')
      ]);
      setStats({
        roads: roadsRes.data.count || 0,
        contractors: contractorsRes.data.count || 0,
        complaints: 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Could not load statistics');
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white mb-12 shadow-2xl">
          <h2 className="text-5xl font-bold mb-4">Welcome to Smart Road System</h2>
          <p className="text-xl mb-8 opacity-90">Report road damage instantly and track contractor accountability</p>
          <button
            onClick={onReportClick}
            className="bg-white text-blue-600 font-bold py-4 px-8 rounded-lg hover:bg-gray-100 transition duration-300 text-lg shadow-lg"
          >
            🚨 Report Road Damage Now
          </button>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <StatCard icon="🛣️" title="Active Roads" value={stats.roads} />
          <StatCard icon="🏢" title="Contractors" value={stats.contractors} />
          <StatCard icon="📝" title="Complaints" value={stats.complaints} />
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h3 className="text-3xl font-bold text-gray-800 mb-8">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              number="1"
              title="Scan QR Code"
              description="Scan the QR code on the road sign or enter the Road ID manually"
              icon="📱"
            />
            <FeatureCard
              number="2"
              title="Report Damage"
              description="Take a photo and describe the road damage with severity level"
              icon="📸"
            />
            <FeatureCard
              number="3"
              title="Track Progress"
              description="Monitor contractor ratings and complaint resolution status"
              icon="📊"
            />
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Help Improve Our Roads</h3>
          <p className="mb-6 text-lg">Your feedback helps us maintain better quality roads for everyone</p>
          <button
            onClick={onReportClick}
            className="bg-white text-green-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition duration-300"
          >
            ✓ Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value }) => (
  <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-gray-600 text-sm font-semibold mb-2">{title}</h3>
    <p className="text-4xl font-bold text-blue-600">{value}</p>
  </div>
);

// Feature Card Component
const FeatureCard = ({ number, title, description, icon }) => (
  <div className="text-center">
    <div className="flex items-center justify-center mb-4">
      <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">{number}</div>
      <span className="text-4xl ml-4">{icon}</span>
    </div>
    <h4 className="text-lg font-bold text-gray-800 mb-2">{title}</h4>
    <p className="text-gray-600">{description}</p>
  </div>
);

// QR Scan Page Component
const QRScanPage = ({ qrInput, setQrInput, handleQRScan, loading }) => (
  <div className="min-h-[calc(100vh-140px)] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
          <div className="text-6xl mb-4">📱</div>
          <h2 className="text-3xl font-bold">Scan Road</h2>
          <p className="text-blue-100 mt-2">Enter Road ID to report damage</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Road ID</label>
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQRScan()}
                placeholder="e.g., ROAD-001"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            <button
              onClick={handleQRScan}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-lg text-lg"
            >
              {loading ? '⏳ Searching...' : '🔍 Find Road'}
            </button>
          </div>

          {/* Sample Roads */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border-l-4 border-blue-600">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center">
              <span className="mr-2">💡</span> Sample Road IDs
            </h3>
            <div className="space-y-2">
              <SampleRoadItem id="ROAD-001" name="Main Street Downtown" />
              <SampleRoadItem id="ROAD-002" name="Highway 5 Express" />
              <SampleRoadItem id="ROAD-003" name="Park Avenue South" />
              <SampleRoadItem id="ROAD-004" name="Industrial Road Corridor" />
              <SampleRoadItem id="ROAD-005" name="Residential Colony Road" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Sample Road Item
const SampleRoadItem = ({ id, name }) => (
  <div className="text-sm text-blue-800 flex items-center justify-between p-2 hover:bg-blue-100 rounded cursor-pointer transition">
    <span>• {name}</span>
    <span className="font-mono text-xs bg-blue-100 px-2 py-1 rounded">{id}</span>
  </div>
);

export default App;
