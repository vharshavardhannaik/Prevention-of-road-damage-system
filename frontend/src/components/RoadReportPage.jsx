import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ComplaintForm from './ComplaintForm';

const RoadReportPage = () => {
  const { roadId } = useParams();
  const [roadData, setRoadData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoad = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/roads/${roadId}`);
        setRoadData(res.data.road);
      } catch (err) {
        console.error('Error fetching road for report:', err);
        setError('Road not found');
      } finally {
        setLoading(false);
      }
    };
    fetchRoad();
  }, [roadId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-3xl mx-auto">
        <ComplaintForm roadData={roadData} />
      </div>
    </div>
  );
};

export default RoadReportPage;
