# Graph Co-editing Framework

Real-time collaborative graph editing system using Node.js, MongoDB, and WebSockets.

## Solution Summary

Implemented a graph co-editing system where multiple users can edit the same graph simultaneously. The system handles conflicts automatically:

- Uses doubly-linked list structure with version numbers for optimistic locking
- Retry mechanism for temporary conflicts (version mismatches)
- Permanent rejection for impossible operations (adding after deleted nodes)
- MongoDB transactions ensure data consistency
- WebSocket provides real-time updates to all users
- Clean separation of retry logic from business logic

## Requirements

- Node.js >= 16
- MongoDB running locally
- MongoDB replica set configured

## Quick Start

```bash
# Build and test everything
./build.sh

# Run both backend and frontend
./run.sh
```

## Manual Setup

```bash
# Backend
cd BackEnd
npm install
cp .env.example .env
npm run build
npm start

# Frontend (separate terminal)
cd FrontEnd
npm install
cp .env.example .env
npm start
```

## Development

```bash
cd BackEnd
npm run dev     # Hot reload development
npm test        # Run tests
npm run lint    # Check code quality
```

## Features

- Multiple users edit same graph simultaneously
- Automatic conflict resolution with retry mechanism
- Optimistic locking with version numbers
- MongoDB transactions for data consistency
- WebSocket real-time updates

## Architecture

- addNodeExclusive(): Adds nodes with retry on conflict
- removeNodeExclusive(): Removes nodes with retry on conflict
- ConflictError: Permanent conflicts (node deleted)
- RETRY Error: Temporary conflicts (version mismatch)
- MongoDB sessions ensure ACID transactions

## WebSocket API

- addNode(prevNodeId) - Add node after specified node
- removeNode(nodeId) - Remove specified node
- nodes - Receive current graph state
- nodeAdded - Receive node addition updates
- nodeRemoved - Receive node removal updates