import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE } from '../services/api';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);

  useEffect(() => {
    const socketInstance = io(API_BASE);

    socketInstance.on('connect', () => {
      console.log('Socket.io connected to server:', API_BASE);
    });

    socketInstance.on('new_event', (event) => {
      // Buffer live events, keeping only the 20 most recent to avoid memory leaks
      setLiveEvents((prev) => [event, ...prev].slice(0, 20));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const clearLiveEvents = () => setLiveEvents([]);

  return (
    <SocketContext.Provider value={{ socket, liveEvents, clearLiveEvents }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
