const { addNodeExclusive } = require('./dist/src/handlers/node');
const mongoose = require('mongoose');

const dbUrl = 'mongodb://localhost:27017,localhost:27018,localhost:27019/debug-test?replicaSet=myReplicaSet';

async function debug() {
  try {
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');
    
    const result = await addNodeExclusive(null);
    console.log('Result:', result);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debug();