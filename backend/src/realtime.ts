import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("room:join", (room: string) => {
      if (typeof room === "string" && room.trim()) {
        socket.join(room);
      }
    });

    socket.on("room:leave", (room: string) => {
      if (typeof room === "string" && room.trim()) {
        socket.leave(room);
      }
    });
  });

  return io;
};

export const getSocket = () => io;

export const emitEvent = (event: string, payload: unknown, room?: string) => {
  if (!io) {
    console.warn(`Socket.IO not initialized. Skipping emit for ${event}.`);
    return;
  }

  if (room) {
    io.to(room).emit(event, payload);
    return;
  }

  io.emit(event, payload);
};

