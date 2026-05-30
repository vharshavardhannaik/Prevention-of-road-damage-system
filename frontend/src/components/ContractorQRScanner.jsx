import React, { useRef, useState } from 'react';
import axios from 'axios';

const ContractorQRScanner = () => {
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [contractor, setContractor] = useState(null);
  const [error, setError] = useState('');
  const [input, setInput] = useState('');

  const fetchContractor = async (id) => {
    if (!id) return;
    try {
      setError('');
      const res = await axios.get(`http://localhost:5000/api/contractors/${id}`);
      setContractor(res.data.contractor || null);
    } catch (err) {
      console.error('Error fetching contractor:', err);
      setContractor(null);
      setError('Contractor not found');
    }
  };

  const startCameraScan = async () => {
    if (!('BarcodeDetector' in window)) {
      setError('Camera QR scanning not supported in this browser. Use manual input.');
      return;
    }

    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setScanning(true);

      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const scan = async () => {
        if (!scanning) return;
        try {
          canvas.width = videoRef.current.videoWidth || 320;
          canvas.height = videoRef.current.videoHeight || 240;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const bitmap = await createImageBitmap(canvas);
          const codes = await detector.detect(bitmap);
          if (codes && codes.length > 0) {
            const raw = codes[0].rawValue;
            stopCamera();
            fetchContractor(raw.trim());
            return;
          }
        } catch (e) {
          // ignore intermittent detection errors
        }
        requestAnimationFrame(scan);
      };

      requestAnimationFrame(scan);
    } catch (err) {
      console.error('Camera error', err);
      setError('Unable to access camera');
    }
  };

  const stopCamera = () => {
    setScanning(false);
    try {
      const stream = videoRef.current && videoRef.current.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(t => t.stop());
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Scan Contractor QR</h2>

      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={startCameraScan}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            disabled={scanning}
          >
            {scanning ? 'Scanning...' : 'Start Camera Scan'}
          </button>
          <button
            onClick={stopCamera}
            className="px-4 py-2 bg-gray-200 rounded-lg"
          >
            Stop
          </button>
        </div>

        <video ref={videoRef} className="w-full rounded-md bg-black" playsInline muted />

        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-700">Or enter Contractor ID</label>
          <div className="flex gap-2 mt-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="CONTRACTOR-001"
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <button
              onClick={() => fetchContractor(input.trim())}
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Find
            </button>
          </div>
        </div>

        {error && <div className="text-red-600">{error}</div>}

        {contractor && (
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Contractor Details</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <div><strong>Name:</strong> {contractor.name}</div>
              <div><strong>Contractor ID:</strong> {contractor.contractorId || contractor.id}</div>
              {contractor.age && <div><strong>Age:</strong> {contractor.age}</div>}
              {contractor.adNo && <div><strong>Ad No:</strong> {contractor.adNo}</div>}
              {contractor.licenseNo && <div><strong>License No:</strong> {contractor.licenseNo}</div>}
              <div><strong>Email:</strong> {contractor.email}</div>
              <div><strong>Current Rating:</strong> {contractor.currentRating}</div>
              <div><strong>Total Complaints:</strong> {contractor.totalComplaints}</div>
              <div><strong>Total Projects:</strong> {contractor.totalProjects}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractorQRScanner;
