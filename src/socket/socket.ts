import { Server as HttpServer } from "http";
import { DefaultEventsMap, Server, Socket } from "socket.io";
import jwt from 'jsonwebtoken'; // Token'ı çözmek için
import  registerCallHandlers  from "./socket_call";
let io: Server;

export const initIO = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    transports: ["websocket", "polling"],
    allowEIO3: true
  });

  io.use((socket: Socket, next) => {
    const raw = socket.handshake.auth?.token || socket.handshake.headers?.token;
    if (!raw) return next(new Error("Unauthorized: no token"));

    const token = (typeof raw === "string" && raw.startsWith("Bearer "))
      ? raw.slice(7)
      : raw;

    try {
      console.log(token);
      const payload = jwt.verify(token, "refreshkey") as { id: string };
      socket.data.userId = payload.id;
      return next();
    } catch (err) {
      return next(new Error("Unauthorized: invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;

    if (userId) {
      socket.join(userId);
      console.log(`✅ Kullanıcı Bağlandı: ${userId} (Socket ID: ${socket.id})`);
    }

    registerCallHandlers(io, socket);
    socket.on("disconnect", () => {
      console.log(`❌ Kullanıcı Ayrıldı: ${userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

