#!/bin/bash
# Quick Start Script for Smart Road System

echo "🚀 Smart Road Construction & Monitoring System"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✓ Backend dependencies already installed"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your MongoDB URI"
fi

cd ..

# Setup Frontend
echo ""
echo "🎨 Setting up Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✓ Frontend dependencies already installed"
fi

cd ..

echo ""
echo "✨ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Configure backend/.env with your MongoDB URI"
echo "2. Start MongoDB:"
echo "   - Local: mongod"
echo "   - Or update MONGODB_URI in .env for MongoDB Atlas"
echo ""
echo "3. In one terminal, start the backend:"
echo "   cd backend && npm start"
echo ""
echo "4. In another terminal, start the frontend:"
echo "   cd frontend && npm start"
echo ""
echo "5. Seed sample data (optional):"
echo "   cd backend && node seed.js"
echo ""
echo "📱 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:5000/api"
echo ""
echo "🎯 Sample Road IDs for testing:"
echo "   - ROAD-001"
echo "   - ROAD-002"
echo "   - ROAD-003"
echo ""
