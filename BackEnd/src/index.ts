import http from "http";
import express from "express";
import mongoose from "mongoose";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { ClientToServerEvents, ServerToClientEvents } from "./models/SocketEvents";
import { addNodeExclusive, removeNodeExclusive } from "./handlers/node";
import Node from "./components/node/node.model";

dotenv.config();

const app = express();

const { PORT, MONGODB_PRIMARY_HOST, MONGODB_PORT, MONGODB_DATABASE, MONGODB_REPLICA_SET } =
  process.env;

const dbUrl = `mongodb://${MONGODB_PRIMARY_HOST}:${MONGODB_PORT},${MONGODB_PRIMARY_HOST}:27018,${MONGODB_PRIMARY_HOST}:27019/${MONGODB_DATABASE}?replicaSet=${MONGODB_REPLICA_SET}`;

mongoose.connect(dbUrl);
mongoose.connection.on("error", () => {
  throw new Error(`unable to connect to database: ${dbUrl}`);
});

const server = http.createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: "*"
  }
});

io.on("connection", async (socket) => {
  console.log(`[${new Date().toISOString()}] Client connected: ${socket.id}`);

  // Send current nodes to new client
  try {
    const nodes = await Node.find({}).sort({ _id: 1 });
    socket.emit("nodes", { nodes });
  } catch (error) {
    console.error("Error fetching nodes:", error);
  }

  // Handle add node operation
  socket.on("addNode", async (prevNodeId) => {
    try {
      const result = await addNodeExclusive(prevNodeId);
      io.emit("nodeAdded", result);
      console.log(`[${new Date().toISOString()}] Node added successfully`);
    } catch (error) {
      console.error("Error adding node:", error);
      socket.emit("error", { message: error.message, operation: "addNode" });
    }
  });

  // Handle remove node operation
  socket.on("removeNode", async (nodeId) => {
    try {
      const result = await removeNodeExclusive(nodeId);
      io.emit("nodeRemoved", result);
      console.log(`[${new Date().toISOString()}] Node removed successfully`);
    } catch (error) {
      console.error("Error removing node:", error);
      socket.emit("error", { message: error.message, operation: "removeNode" });
    }
  });

  socket.on("disconnect", () => {
    console.log(`[${new Date().toISOString()}] Client disconnected: ${socket.id}`);
  });
});

server.on("error", (err) => {
  console.error(err);
});

server.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
