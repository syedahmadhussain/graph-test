#!/bin/bash

echo "Starting backend..."
cd BackEnd
npm start &
BACKEND_PID=$!

echo "Starting frontend..."
cd ../FrontEnd
npm start &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop both services"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM
wait