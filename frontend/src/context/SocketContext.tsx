import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinDeliveryRoom: (assignmentId: string) => void;
  leaveDeliveryRoom: (assignmentId: string) => void;
  emitLocationUpdate: (data: {
    assignmentId: string;
    latitude: number;
    longitude: number;
    volunteerName: string;
  }) => void;
  emitStatusChange: (data: {
    assignmentId: string;
    donationId: string;
    status: string;
    message: string;
  }) => void;
  emitNewDonation: (data: {
    donationId: string;
    foodName: string;
    quantity: number;
    pickupAddress: string;
  }) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Connect to local Socket.IO server (relies on Vite proxy during development)
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('Connected to FoodBridge Socket Server');
      setIsConnected(true);
      
      // Join role room for global notifications
      newSocket.emit('join-role', user.role);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket Server');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  const joinDeliveryRoom = (assignmentId: string) => {
    if (socket) {
      socket.emit('join-delivery', assignmentId);
    }
  };

  const leaveDeliveryRoom = (assignmentId: string) => {
    if (socket) {
      socket.emit('leave-delivery', assignmentId);
    }
  };

  const emitLocationUpdate = (data: {
    assignmentId: string;
    latitude: number;
    longitude: number;
    volunteerName: string;
  }) => {
    if (socket) {
      socket.emit('volunteer-location-update', data);
    }
  };

  const emitStatusChange = (data: {
    assignmentId: string;
    donationId: string;
    status: string;
    message: string;
  }) => {
    if (socket) {
      socket.emit('delivery-status-changed', data);
    }
  };

  const emitNewDonation = (data: {
    donationId: string;
    foodName: string;
    quantity: number;
    pickupAddress: string;
  }) => {
    if (socket) {
      socket.emit('new-donation-created', data);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinDeliveryRoom,
        leaveDeliveryRoom,
        emitLocationUpdate,
        emitStatusChange,
        emitNewDonation,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
