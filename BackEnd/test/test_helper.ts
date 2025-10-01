import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const { MONGODB_PRIMARY_HOST, MONGODB_PORT, MONGODB_TEST_DATABASE, MONGODB_REPLICA_SET } =
  process.env;

const dbUrl = `mongodb://${MONGODB_PRIMARY_HOST}:${MONGODB_PORT},${MONGODB_PRIMARY_HOST}:27018,${MONGODB_PRIMARY_HOST}:27019/${MONGODB_TEST_DATABASE}?replicaSet=${MONGODB_REPLICA_SET}`;

mongoose.connect(dbUrl);
mongoose.connection
  .on("error", () => {
    console.log(`unable to connect to database: ${dbUrl}`);
  });

beforeEach((done) => {
  mongoose.connection.collections.nodes.drop(() => {
    done();
  });
});