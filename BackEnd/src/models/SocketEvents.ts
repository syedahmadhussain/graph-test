import { INodeAddedData, INodeRemovedData, INodesData } from "./SocketData";

export interface ClientToServerEvents {
  addNode: (prevNodeId: string | null) => void;
  removeNode: (nodeId: string) => void;
}

export interface ServerToClientEvents {
  nodes: (data: INodesData) => void;
  nodeAdded: (data: INodeAddedData) => void;
  nodeRemoved: (data: INodeRemovedData) => void;
  error: (data: { message: string; operation: string }) => void;
}
