# Graph Co-editing Framework

A real-time collaborative graph editing system using Node.js, MongoDB, and WebSockets.

## Features

- Multiple users can edit the same graph simultaneously
- Automatic conflict resolution with retry mechanism
- Optimistic locking with version numbers
- MongoDB transactions for data consistency
- WebSocket real-time updates

## Requirements

- Node.js >= 16
- MongoDB running locally
- MongoDB replica set configured

## Setup

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
# Backend development with hot reload
cd BackEnd
npm run dev

# Run tests
npm test

# Check code quality
npm run lint
npm run build
```

## Architecture

- **addNodeExclusive()**: Adds nodes with retry on conflict
- **removeNodeExclusive()**: Removes nodes with retry on conflict
- **ConflictError**: Permanent conflicts (node deleted)
- **"RETRY" Error**: Temporary conflicts (version mismatch)
- Up to 10 retry attempts for version conflicts
- MongoDB sessions ensure ACID transactions

## API

WebSocket events:
- `addNode(prevNodeId)` - Add node after specified node
- `removeNode(nodeId)` - Remove specified node
- `nodes` - Receive current graph state
- `nodeAdded` - Receive node addition updates
- `nodeRemoved` - Receive node removal updates

## Testing

All tests pass including:
- Basic operations
- Concurrent non-conflicting operations
- Concurrent conflicting operations
- Data integrity under load
- Stress testing with rapid concurrent operations