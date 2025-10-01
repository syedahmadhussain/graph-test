import React from "react";
import { useDispatch, useSelector } from "react-redux";
import useSocket from "./hooks/useSocket";
import INode from "./models/INode";
import { nodesSlice } from "./store/reducers/NodesSlice";
import { AppDispatch, RootState } from "./store/store";

function App() {
  const socket = useSocket();
  const dispatch = useDispatch<AppDispatch>();
  const { setSelectedNode } = nodesSlice.actions;
  const { list: nodeList, selectedNode } = useSelector((state: RootState) => state.nodes);

  const handleSelectNode = (nodeId: string) => {
    dispatch(setSelectedNode(nodeId));
  };

  const addNode = () => {
    socket.current?.emit("addNode", selectedNode);
  };

  const removeNode = () => {
    if (selectedNode) {
      socket.current?.emit("removeNode", selectedNode);
    }
  };

  const sortNodes = (nodes: {[key: string]: INode}) => {
    const sortedNodes: INode[] = [];

    let currentNode = Object.values(nodes).find((node) => !node.prev) || null;

    while (currentNode) {
      sortedNodes.push(currentNode);

      currentNode = currentNode.next ? nodes[currentNode.next] : null;
    }

    return sortedNodes;
  };

  return (
    <div className="graph-edit-conatiner">
      <div className="graph-edit-nodes">
        {sortNodes(nodeList).map((node) => (
          <div
            key={node.id}
            onClick={() => handleSelectNode(node.id)}
            className={`graph-edit-node ${
              node.id === selectedNode ? "graph-edit-node-selected" : ""
            }`}
          >
            {node.id}
          </div>
        ))}
      </div>
      <div className="graph-edit-controls">
        <button className="graph-edit-button" type="button" onClick={addNode}>
          Add Node
        </button>
        <button
          className="graph-edit-button"
          type="button"
          disabled={!selectedNode}
          onClick={removeNode}
        >
          Remove Node
        </button>
      </div>
    </div>
  );
}

export default App;
