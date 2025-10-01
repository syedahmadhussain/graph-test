#!/bin/bash

echo "Building Graph Co-editing Framework..."

# Backend
echo "Installing backend dependencies..."
cd BackEnd
npm install

echo "Running tests..."
npm test

echo "Linting code..."
npm run lint

echo "Building backend..."
npm run build

echo "Backend build complete."

# Frontend
echo "Installing frontend dependencies..."
cd ../FrontEnd
npm install

echo "Building frontend..."
npm run build

echo "Frontend build complete."

cd ..
echo "Project build finished successfully!"