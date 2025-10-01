import _ from "lodash";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import INode from "../../models/INode";
import { INodeAddedData, INodeRemovedData, INodesData } from "../../models/SocketData";

interface NodesState {
  list: {[key: string]: INode};
  selectedNode: string | null;
}

const initialState: NodesState = {
  list: {},
  selectedNode: null
};

export const nodesSlice = createSlice({
  name: "nodes",
  initialState,
  reducers: {
    setNodes(state, action: PayloadAction<INodesData>) {
      const firstNode = action.payload.nodes.find((node) => !node.prev);

      if (firstNode) {
        state.selectedNode = firstNode.id;
      }

      state.list = _.keyBy(action.payload.nodes, "id");
    },
    addNode(state, action: PayloadAction<INodeAddedData>) {
      if (!state.selectedNode) {
        state.selectedNode = action.payload.createdNode.id;
      }

      Object.entries(action.payload.updatedNodes).forEach(([nodeId, update]) => {
        _.assign(state.list[nodeId], update);
      });

      state.list[action.payload.createdNode.id] = action.payload.createdNode;
    },
    removeNode(state, action: PayloadAction<INodeRemovedData>) {
      if (state.selectedNode === action.payload.deletedNodeId) {
        const deletedNode = state.list[action.payload.deletedNodeId];

        state.selectedNode = deletedNode?.next || deletedNode?.prev || null;
      }

      Object.entries(action.payload.updatedNodes).forEach(([nodeId, update]) => {
        _.assign(state.list[nodeId], update);
      });

      delete state.list[action.payload.deletedNodeId];
    },
    setSelectedNode(state, action: PayloadAction<string>) {
      state.selectedNode = action.payload;
    }
  }
});

export default nodesSlice.reducer;
