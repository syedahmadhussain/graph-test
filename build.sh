#!/bin/bash

# Build backend
cd BackEnd
npm install
npm test
npm run lint
npm run build

# Build frontend
cd ../FrontEnd
npm install
npm run build

cd ..
echo "Build complete"