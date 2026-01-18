import { io, Socket } from "socket.io-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || API_BASE_URL.replace(/\/api$/, "");

let socket: Socket | null = null;

export const getSocket = () => {
  if (typeof window === "undefined") {
    return null;
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });
  }

  return socket;
};

