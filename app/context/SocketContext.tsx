'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (roomId: string, message: any) => void;
  joinRoom: (roomId: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Only connect to socket if user is authenticated
    if (!user) return;

    let socketIo: Socket | null = null;

    // Initialize the socket connection
    const initSocket = async () => {
      try {
        // Call the API endpoint to initialize the Socket.io server
        await fetch('/api/socket');
        
        // Connect to the Socket.io server
        socketIo = io();
        
        socketIo.on('connect', () => {
          console.log('Socket.io connected');
          setIsConnected(true);
        });

        socketIo.on('disconnect', () => {
          console.log('Socket.io disconnected');
          setIsConnected(false);
        });

        setSocket(socketIo);
      } catch (error) {
        console.error('Error initializing Socket.io:', error);
      }
    };

    // Initialize the socket
    initSocket();

    // Cleanup function
    return () => {
      if (socketIo) {
        console.log('Disconnecting socket');
        socketIo.disconnect();
      }
    };
  }, [user]);

  // Function to send a message
  const sendMessage = (roomId: string, message: any) => {
    if (socket && isConnected) {
      socket.emit('send-message', roomId, message);
    } else {
      console.error('Socket not connected, cannot send message');
    }
  };

  // Function to join a room
  const joinRoom = (roomId: string) => {
    if (socket && isConnected && user) {
      socket.emit('join-room', roomId, user.uid);
    } else {
      console.error('Socket not connected or user not authenticated, cannot join room');
    }
  };

  const value = {
    socket,
    isConnected,
    sendMessage,
    joinRoom,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 