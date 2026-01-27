import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ComplaintForm from './components/ComplaintForm';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [roadData, setRoadData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  const handleQRScan = async () => {
    if (!qrInput) {
      alert('Please enter a Road ID');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/roads/${qrInput}`);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Navigation */}
      <nav className="glass-effect sticky top-0 z-50 border-b border-white/20 shadow-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">SmartRoad</h1>
                <p className="text-xs text-gray-600 font-medium">Civic Infrastructure Platform</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <NavButton
                label="Home"
                icon={<HomeIcon />}
                active={currentPage === 'home'}
                onClick={() => { setCurrentPage('home'); setRoadData(null); }}
              />
              <NavButton
                label="Report Damage"
                icon={<AlertIcon />}
                active={currentPage === 'complaint'}
                onClick={() => setCurrentPage('complaint')}
              />
              <NavButton
                label="Admin Portal"
                icon={<LockIcon />}
                active={false}
                onClick={() => navigate('/admin/login')}
              />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg hover:bg-white/50 transition"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-white/20 bg-white/60 backdrop-blur-lg animate-fade-in">
            <div className="px-4 py-3 space-y-2">
              <NavButton
                label="Home"
                icon={<HomeIcon />}
                active={currentPage === 'home'}
                onClick={() => { setCurrentPage('home'); setShowMobileMenu(false); setRoadData(null); }}
                mobile
              />
              <NavButton
                label="Report Damage"
                icon={<AlertIcon />}
                active={currentPage === 'complaint'}
                onClick={() => { setCurrentPage('complaint'); setShowMobileMenu(false); }}
                mobile
              />
              <NavButton
                label="Admin Portal"
                icon={<LockIcon />}
                active={false}
                onClick={() => { navigate('/admin/login'); setShowMobileMenu(false); }}
                mobile
              />
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="animate-fade-in">
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
    </div>
  );
};

// Navigation Button Component
const NavButton = ({ label, icon, active, onClick, mobile = false }) => (
  <button
    onClick={onClick}
    className={`
      ${mobile ? 'w-full justify-start' : ''}
      group relative px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 
      flex items-center space-x-2 overflow-hidden
      ${active
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
        : 'text-gray-700 hover:bg-white/70 hover:shadow-glass'
      }
    `}
  >
    <span className={`transition-transform duration-300 ${active ? '' : 'group-hover:scale-110'}`}>
      {icon}
    </span>
    <span>{label}</span>
    {active && (
      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
    )}
  </button>
);

// Icons
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);


// Home Page Component
const HomePage = ({ onReportClick }) => {
  const [stats, setStats] = useState({ roads: 0, contractors: 0, complaints: 0 });
  const [error, setError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [roadsRes, contractorsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/roads'),
        axios.get('http://localhost:8000/api/contractors')
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
    <div className="min-h-screen">
      {/* Hero Section with Premium Design */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-float"></div>
          <div className="absolute top-40 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-white space-y-8 animate-slide-up">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium">Live Road Monitoring System</span>
              </div>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                Building Better
                <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                  Roads Together
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed max-w-2xl">
                Empowering citizens to report road damage instantly. Track contractor accountability and improve infrastructure quality across your city.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={onReportClick}
                  className="group relative px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Report Road Damage</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </button>

                <button className="px-8 py-4 border-2 border-white/30 text-white rounded-xl font-semibold text-lg hover:bg-white/10 backdrop-blur-sm transition-all duration-300 flex items-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Learn More</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-8 pt-8 border-t border-white/20">
                <div>
                  <div className="text-3xl font-bold">{stats.roads}+</div>
                  <div className="text-blue-200 text-sm">Active Roads</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{stats.contractors}+</div>
                  <div className="text-blue-200 text-sm">Verified Contractors</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">99.9%</div>
                  <div className="text-blue-200 text-sm">Response Rate</div>
                </div>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="relative hidden lg:block animate-scale-in">
              <div className="relative">
                {/* Floating Card Effect */}
                <div className="absolute -top-10 -left-10 glass-effect-dark p-6 rounded-2xl shadow-2xl transform rotate-6 animate-float">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-white">
                      <div className="font-bold">Road Fixed</div>
                      <div className="text-sm opacity-75">Main Street</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-10 -right-10 glass-effect-dark p-6 rounded-2xl shadow-2xl transform -rotate-6 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-white">
                      <div className="font-bold">In Progress</div>
                      <div className="text-sm opacity-75">Highway 5</div>
                    </div>
                  </div>
                </div>

                {/* Main Illustration */}
                <div className="glass-effect p-8 rounded-3xl shadow-2xl">
                  <svg className="w-full h-auto" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="400" height="300" fill="url(#grid)" />
                    <defs>
                      <pattern id="grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <circle cx="200" cy="150" r="80" fill="url(#gradient1)" opacity="0.2"/>
                    <circle cx="200" cy="150" r="60" fill="url(#gradient1)" opacity="0.3"/>
                    <circle cx="200" cy="150" r="40" fill="url(#gradient1)"/>
                    <defs>
                      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6"/>
                        <stop offset="100%" stopColor="#6366f1"/>
                      </linearGradient>
                    </defs>
                    <path d="M 100 150 Q 150 100 200 150 T 300 150" stroke="white" strokeWidth="3" fill="none" opacity="0.5"/>
                    <circle cx="100" cy="150" r="8" fill="white"/>
                    <circle cx="200" cy="150" r="8" fill="white"/>
                    <circle cx="300" cy="150" r="8" fill="white"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248, 250, 252)"/>
          </svg>
        </div>
      </div>

      {/* Stats Section with Premium Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-16 relative z-10">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          <StatCard
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            }
            title="Active Roads"
            value={stats.roads}
            subtitle="Under monitoring"
            gradient="from-blue-500 to-indigo-500"
            hovered={hoveredCard === 'roads'}
            onHover={() => setHoveredCard('roads')}
            onLeave={() => setHoveredCard(null)}
          />
          <StatCard
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            title="Contractors"
            value={stats.contractors}
            subtitle="Verified partners"
            gradient="from-purple-500 to-pink-500"
            hovered={hoveredCard === 'contractors'}
            onHover={() => setHoveredCard('contractors')}
            onLeave={() => setHoveredCard(null)}
          />
          <StatCard
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="Reports Filed"
            value={stats.complaints}
            subtitle="Total complaints"
            gradient="from-green-500 to-emerald-500"
            hovered={hoveredCard === 'complaints'}
            onHover={() => setHoveredCard('complaints')}
            onLeave={() => setHoveredCard(null)}
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our streamlined process makes reporting road damage quick and efficient
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <FeatureCard
              number="01"
              title="Scan QR Code"
              description="Each road has a unique QR code. Simply scan it or enter the Road ID manually to identify the location."
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              }
              color="blue"
            />
            <FeatureCard
              number="02"
              title="Report Damage"
              description="Upload photos, describe the issue, and rate the severity. Your report is instantly logged in our system."
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              color="purple"
            />
            <FeatureCard
              number="03"
              title="Track Progress"
              description="Monitor contractor performance, view repair status, and see real-time updates on all reported issues."
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              color="green"
            />
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of citizens helping improve road infrastructure. Your report can save lives and improve quality of life for everyone.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={onReportClick}
              className="group px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-glow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
            >
              <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>Report Now</span>
            </button>

            <button className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center space-x-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Contact Support</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Premium Stat Card Component
const StatCard = ({ icon, title, value, subtitle, gradient, hovered, onHover, onLeave }) => (
  <div
    onMouseEnter={onHover}
    onMouseLeave={onLeave}
    className={`
      group relative overflow-hidden
      bg-white rounded-2xl shadow-glass
      p-8 transition-all duration-300 cursor-pointer
      ${hovered ? 'shadow-glow transform -translate-y-2 scale-105' : 'hover:shadow-glass-hover hover:-translate-y-1'}
    `}
  >
    {/* Gradient Background on Hover */}
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

    {/* Border Glow */}
    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 blur transition-opacity duration-300`}></div>

    <div className="relative">
      {/* Icon */}
      <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${gradient} text-white mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
        {icon}
      </div>

      {/* Stats */}
      <div className="space-y-2">
        <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wide">{title}</h3>
        <div className="flex items-baseline space-x-2">
          <p className={`text-5xl font-bold bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>
            {value}
          </p>
          <span className="text-green-500 text-sm font-semibold flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Live
          </span>
        </div>
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>

      {/* Corner Decoration */}
      <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-300"></div>
    </div>
  </div>
);

// Premium Feature Card Component
const FeatureCard = ({ number, title, description, icon, color }) => {
  const colors = {
    blue: 'from-blue-500 to-indigo-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
  };

  return (
    <div className="group relative">
      {/* Connector Line (except last item) */}
      <div className="hidden md:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 to-transparent transform translate-x-0 group-last:hidden"></div>

      <div className="relative bg-white rounded-2xl p-8 shadow-glass hover:shadow-xl-custom transition-all duration-300 hover:-translate-y-2">
        {/* Number Badge */}
        <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br ${colors[color]} rounded-2xl transform rotate-12 group-hover:rotate-0 transition-transform duration-300 shadow-lg opacity-20"></div>
        <div className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
          {number}
        </div>

        {/* Icon */}
        <div className={`inline-flex text-gray-400 group-hover:text-${color}-500 mb-6 mt-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
          {icon}
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gradient transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>

        {/* Hover Arrow */}
        <div className="mt-6 flex items-center text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-300">
          <span className="mr-2">Learn more</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  );
};


// QR Scan Page Component with Premium Design
const QRScanPage = ({ qrInput, setQrInput, handleQRScan, loading }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
    <div className="max-w-2xl mx-auto">
      <div className="animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl mb-4 shadow-glow animate-float">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Scan Road Code</h2>
          <p className="text-gray-600 text-lg">Enter the Road ID to begin reporting damage</p>
        </div>

        {/* Main Card */}
        <div className="glass-effect rounded-3xl shadow-xl-custom overflow-hidden">
          {/* Decorative Header */}
          <div className="relative h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '30px 30px'
              }}></div>
            </div>
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="white"/>
              </svg>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8 space-y-6">
            {/* Input Field */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Road Identifier</span>
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && handleQRScan()}
                  placeholder="Enter Road ID (e.g., ROAD-001)"
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl 
                    focus:border-blue-500 focus:ring-4 focus:ring-blue-100 
                    outline-none transition-all duration-300
                    placeholder:text-gray-400
                    group-hover:border-gray-300"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleQRScan}
              disabled={loading || !qrInput}
              className={`
                w-full py-4 rounded-xl font-bold text-lg 
                transition-all duration-300 transform
                flex items-center justify-center space-x-3
                ${loading || !qrInput
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-glow hover:-translate-y-1 active:translate-y-0'
                }
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Searching Road...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Find Road</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-sm text-gray-500 font-medium">Sample Road IDs</span>
              </div>
            </div>

            {/* Sample Roads List */}
            <div className="space-y-2">
              {[
                { id: 'ROAD-001', name: 'Main Street Downtown', status: 'Active' },
                { id: 'ROAD-002', name: 'Highway 5 Express', status: 'Active' },
                { id: 'ROAD-003', name: 'Park Avenue South', status: 'Active' },
                { id: 'ROAD-004', name: 'Industrial Road Corridor', status: 'Monitoring' },
                { id: 'ROAD-005', name: 'Residential Colony Road', status: 'Active' },
              ].map((road, index) => (
                <SampleRoadItem
                  key={road.id}
                  id={road.id}
                  name={road.name}
                  status={road.status}
                  onClick={() => setQrInput(road.id)}
                  delay={index * 50}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <div className="glass-effect rounded-2xl p-6 border border-blue-100">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-3 bg-blue-100 rounded-xl">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Need Help?</h3>
                <p className="text-sm text-gray-600">Find Road IDs on signposts or contact local authorities</p>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-6 border border-green-100">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-3 bg-green-100 rounded-xl">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Secure & Private</h3>
                <p className="text-sm text-gray-600">Your reports are encrypted and securely stored</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Sample Road Item Component
const SampleRoadItem = ({ id, name, status, onClick, delay }) => (
  <div
    onClick={onClick}
    style={{ animationDelay: `${delay}ms` }}
    className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white to-gray-50 border border-gray-100 hover:border-blue-200 hover:shadow-glass cursor-pointer transition-all duration-300 animate-slide-up"
  >
    <div className="flex items-center space-x-4 flex-1">
      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{name}</h4>
        <div className="flex items-center space-x-2 mt-1">
          <span className="font-mono text-sm text-blue-600 font-medium">{id}</span>
          <span className="text-gray-300">•</span>
          <span className="inline-flex items-center space-x-1">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs text-gray-500">{status}</span>
          </span>
        </div>
      </div>
    </div>
    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </div>
);

export default App;

