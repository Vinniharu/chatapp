import { Server as SocketIOServer } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';

interface SocketServer extends HTTPServer {
  io?: SocketIOServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

// Singleton pattern for Socket.io server
export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (res.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  console.log('Setting up socket.io');
  const io = new SocketIOServer(res.socket.server);
  res.socket.server.io = io;

  // Socket.io event handlers
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join-room', (roomId: string, userId: string) => {
      console.log(`User ${userId} joined room ${roomId}`);
      socket.join(roomId);
      socket.to(roomId).emit('user-connected', userId);
    });

    socket.on('send-message', (roomId: string, message: any) => {
      console.log(`Message in room ${roomId}: ${JSON.stringify(message)}`);
      io.to(roomId).emit('receive-message', message);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  res.end();
} 