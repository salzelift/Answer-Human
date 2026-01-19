"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitEvent = exports.getSocket = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io = null;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", (socket) => {
        socket.on("room:join", (room) => {
            if (typeof room === "string" && room.trim()) {
                socket.join(room);
            }
        });
        socket.on("room:leave", (room) => {
            if (typeof room === "string" && room.trim()) {
                socket.leave(room);
            }
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getSocket = () => io;
exports.getSocket = getSocket;
const emitEvent = (event, payload, room) => {
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
exports.emitEvent = emitEvent;
