#!/bin/bash

# Graph Co-editing Framework - Run Script
# Builds and starts both frontend and backend

echo "🚀 Starting Graph Co-editing Framework..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if MongoDB replica set is running
check_mongodb() {
    echo -e "${BLUE}📊 Checking MongoDB replica set...${NC}"
    if mongosh --port 27017 --eval "rs.status()" --quiet > /dev/null 2>&1; then
        echo -e "${GREEN}✅ MongoDB replica set is running${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  MongoDB replica set not found. Starting it...${NC}"
        return 1
    fi
}

# Function to start MongoDB replica set
start_mongodb() {
    if [ -f "/tmp/mongodb-replica/start-replica.sh" ]; then
        echo -e "${BLUE}🔧 Starting MongoDB replica set...${NC}"
        chmod +x /tmp/mongodb-replica/start-replica.sh
        /tmp/mongodb-replica/start-replica.sh > /tmp/mongodb-setup.log 2>&1
        
        # Wait for replica set to be ready
        echo -e "${YELLOW}⏳ Waiting for replica set to initialize...${NC}"
        sleep 10
        
        if check_mongodb; then
            echo -e "${GREEN}✅ MongoDB replica set started successfully${NC}"
        else
            echo -e "${RED}❌ Failed to start MongoDB replica set${NC}"
            echo "Check /tmp/mongodb-setup.log for details"
            exit 1
        fi
    else
        echo -e "${RED}❌ MongoDB setup script not found${NC}"
        echo "Please ensure MongoDB replica set is configured"
        exit 1
    fi
}

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js >= 16${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm not found. Please install npm${NC}"
    exit 1
fi

if ! command_exists mongosh; then
    echo -e "${RED}❌ MongoDB not found. Please install MongoDB${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites found${NC}"

# Check MongoDB
if ! check_mongodb; then
    start_mongodb
fi

# Build and start backend
echo -e "\n${BLUE}🔧 Building and starting backend...${NC}"
cd BackEnd

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    npm install
fi

# Build backend
echo -e "${YELLOW}🔨 Building backend...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend build failed${NC}"
    exit 1
fi

# Start backend in background
echo -e "${GREEN}🚀 Starting backend server...${NC}"
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Build and start frontend
echo -e "\n${BLUE}🔧 Building and starting frontend...${NC}"
cd ../FrontEnd

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
fi

# Start frontend in background
echo -e "${GREEN}🚀 Starting frontend server...${NC}"
npm start &
FRONTEND_PID=$!

# Display status
echo -e "\n${GREEN}🎉 Application started successfully!${NC}"
echo "========================================"
echo -e "${BLUE}Backend:${NC}  http://localhost:4040"
echo -e "${BLUE}Frontend:${NC} http://localhost:3000"
echo -e "${BLUE}MongoDB:${NC}  mongodb://localhost:27017,localhost:27018,localhost:27019"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Function to cleanup processes
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Services stopped${NC}"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Keep script running
wait