import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useDispatch } from "react-redux";
import { nodesSlice } from "../store/reducers/NodesSlice";
import { AppDispatch } from "../store/store";
import { ClientToServerEvents, ServerToClientEvents } from "../models/SocketEvents";

const useSocket = () => {
  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const { setNodes, addNode, removeNode } = nodesSlice.actions;
  const dispatch = useDispatch<AppDispatch>();

  const { REACT_APP_BACKEND_URL } = process.env;

  useEffect(() => {
    socketRef.current = io(REACT_APP_BACKEND_URL || "localhost:4040", {
      reconnectionDelayMax: 10000
    });

    socketRef.current.on("nodes", (nodes) => {
      dispatch(setNodes(nodes));
    });

    socketRef.current.on("nodeAdded", (data) => {
      dispatch(addNode(data));
    });

    socketRef.current.on("nodeRemoved", (data) => {
      dispatch(removeNode(data));
    });

    return () => {
      if (socketRef.current !== null) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return socketRef;
};

export default useSocket;
