import mongoose from "mongoose";
import Node, { INode } from "../components/node/node.model";
import { IUpdatedNodes } from "../models/SocketData";
import { conflictError, withRetry } from "../utils/retry";

interface INodeAddedResult {
  createdNode: INode & { id?: string };
  updatedNodes: IUpdatedNodes;
}

interface INodeRemovedResult {
  deletedNodeId: string;
  updatedNodes: IUpdatedNodes;
}

async function insertAtHead(session: mongoose.ClientSession): Promise<INodeAddedResult> {
  const updatedNodes: IUpdatedNodes = {};

  const head = await Node.findOne({ prev: null }).session(session);
  const newNode = new Node({ prev: null, next: head?._id ?? null, version: 0 });

  if (head) {
    const updatedHead = await Node.findOneAndUpdate(
      { _id: head._id, prev: null, version: head.version }, // only update if still head
      { prev: newNode._id, $inc: { version: 1 } },
      { session, new: true }
    );
    if (!updatedHead) throw new Error("RETRY");

    updatedNodes[head._id.toString()] = { prev: newNode._id.toString() };
  }

  await newNode.save({ session });

  return {
    createdNode: newNode.toObject({ getters: true, virtuals: true }),
    updatedNodes,
  };
}

async function insertAfter(
  session: mongoose.ClientSession,
  prevId: string
): Promise<INodeAddedResult> {
  const updatedNodes: IUpdatedNodes = {};

  const prev = await Node.findById(prevId).session(session);
  if (!prev) throw conflictError("Reference node was deleted");

  const nextId = prev.next ?? null;
  const newNode = new Node({ prev: prev._id, next: nextId, version: 0 });

  const updatedPrev = await Node.findOneAndUpdate(
    { _id: prev._id, version: prev.version, next: nextId },
    { next: newNode._id, $inc: { version: 1 } },
    { session, new: true }
  );
  if (!updatedPrev) throw new Error("RETRY");

  updatedNodes[prevId] = { next: newNode._id.toString() };

  if (nextId) {
    const next = await Node.findById(nextId).session(session);
    if (!next) throw conflictError("Next node deleted concurrently");

    const updatedNext = await Node.findOneAndUpdate(
      { _id: next._id, version: next.version, prev: prev._id },
      { prev: newNode._id, $inc: { version: 1 } },
      { session, new: true }
    );
    if (!updatedNext) throw new Error("RETRY");

    updatedNodes[nextId.toString()] = { prev: newNode._id.toString() };
  }

  await newNode.save({ session });

  return {
    createdNode: newNode.toObject({ getters: true, virtuals: true }),
    updatedNodes,
  };
}

export async function addNodeExclusive(prevNodeId: string | null): Promise<INodeAddedResult> {
  return withRetry(async (session) => {
    if (prevNodeId === null) {
      return insertAtHead(session);
    }
    return insertAfter(session, prevNodeId);
  });
}

export async function removeNodeExclusive(nodeId: string): Promise<INodeRemovedResult> {
  return withRetry(async (session) => {
    const updatedNodes: IUpdatedNodes = {};
    const nodeToDelete = await Node.findById(nodeId).session(session);
    if (!nodeToDelete) throw conflictError("Node not found or already deleted");

    const prevId = nodeToDelete.prev;
    const nextId = nodeToDelete.next;

    if (prevId) {
      const prev = await Node.findById(prevId).session(session);
      if (!prev) throw conflictError("Previous node deleted concurrently");
      const updatedPrev = await Node.findOneAndUpdate(
        { _id: prevId, version: prev.version, next: nodeId },
        { next: nextId, $inc: { version: 1 } },
        { session, new: true }
      );
      if (!updatedPrev) throw new Error("RETRY");
      updatedNodes[prevId.toString()] = { next: nextId?.toString() || null };
    }

    if (nextId) {
      const next = await Node.findById(nextId).session(session);
      if (!next) throw conflictError("Next node deleted concurrently");
      const updatedNext = await Node.findOneAndUpdate(
        { _id: nextId, version: next.version, prev: nodeId },
        { prev: prevId, $inc: { version: 1 } },
        { session, new: true }
      );
      if (!updatedNext) throw new Error("RETRY");
      updatedNodes[nextId.toString()] = { prev: prevId?.toString() || null };
    }

    const deleted = await Node.findOneAndDelete(
      { _id: nodeId, version: nodeToDelete.version },
      { session }
    );
    if (!deleted) throw new Error("RETRY");

    return { deletedNodeId: nodeId, updatedNodes };
  });
}
