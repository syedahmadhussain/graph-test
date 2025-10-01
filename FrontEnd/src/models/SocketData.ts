import INode from "./INode";

interface IUpdatedNodes {
  [key: string]: {
    prev?: string,
    next?: string
  }
}

export interface INodesData {
  nodes: INode[]
}

export interface INodeAddedData {
  createdNode: INode,
  updatedNodes: IUpdatedNodes
}

export interface INodeRemovedData {
  deletedNodeId: string,
  updatedNodes: IUpdatedNodes
}
