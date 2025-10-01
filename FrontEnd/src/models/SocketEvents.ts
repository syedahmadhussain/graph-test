import { INodeAddedData, INodeRemovedData, INodesData } from "./SocketData";

export interface ServerToClientEvents {
  nodes: (data: INodesData) => void;
  nodeAdded: (data: INodeAddedData) => void;
  nodeRemoved: (data: INodeRemovedData) => void;
}

export interface ClientToServerEvents {
  addNode: (prevNodeId: string | null) => void;
  removeNode: (nodeId: string) => void;
}
