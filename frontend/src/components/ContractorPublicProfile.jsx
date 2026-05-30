import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ContractorPublicProfile = () => {
  const { contractorId } = useParams();
  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/contractors/${contractorId}`);
        setContractor(res.data.contractor);
      } catch (err) {
        console.error(err);
        setError('Contractor not found');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [contractorId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Contractor Profile</h1>
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <div className="text-lg font-semibold mb-2">{contractor.name}</div>
        <div className="text-sm text-gray-600 mb-4">ID: {contractor.contractorId || contractor.id}</div>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          {contractor.age && <div><strong>Age:</strong> {contractor.age}</div>}
          {contractor.adNo && <div><strong>Ad No:</strong> {contractor.adNo}</div>}
          {contractor.licenseNo && <div><strong>License No:</strong> {contractor.licenseNo}</div>}
          <div><strong>Email:</strong> {contractor.email}</div>
          <div><strong>Rating:</strong> {contractor.currentRating}</div>
          <div><strong>Total Complaints:</strong> {contractor.totalComplaints}</div>
        </div>
      </div>
    </div>
  );
};

export default ContractorPublicProfile;
