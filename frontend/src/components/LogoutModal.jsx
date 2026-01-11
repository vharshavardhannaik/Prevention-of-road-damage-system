import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleGoToUserLogin = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminUsername');
    navigate('/');
    onClose();
  };

  const handleGoToAdminLogin = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminUsername');
    navigate('/admin/login');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-5xl mb-4">👋</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Logout Confirmation</h2>
          <p className="text-gray-600 mb-6">Where would you like to go?</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoToUserLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <span>👤</span> Go to User Interface
          </button>

          <button
            onClick={handleGoToAdminLogin}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <span>🔐</span> Return to Admin Login
          </button>

          <button
            onClick={onClose}
            className="w-full bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            Cancel
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          You will be logged out from the admin panel
        </p>
      </div>
    </div>
  );
};

export default LogoutModal;
