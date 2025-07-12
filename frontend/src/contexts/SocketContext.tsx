import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext.tsx';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [connected, setConnected] = React.useState(false);

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
        newSocket.emit('join', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
      });

      // Handle swap request notifications
      newSocket.on('newSwapRequest', (data) => {
        toast.success(
          `New swap request from ${data.requesterName}!`,
          {
            duration: 6000,
            action: {
              label: 'View',
              onClick: () => {
                // Navigate to swaps page
                window.location.href = '/swaps';
              }
            }
          }
        );
      });

      // Handle swap status updates
      newSocket.on('swapAccepted', (data) => {
        toast.success('Your swap request was accepted!', {
          duration: 5000,
          action: {
            label: 'View',
            onClick: () => {
              window.location.href = '/swaps';
            }
          }
        });
      });

      newSocket.on('swapRejected', (data) => {
        toast.error('Your swap request was rejected', {
          duration: 5000,
          action: {
            label: 'View',
            onClick: () => {
              window.location.href = '/swaps';
            }
          }
        });
      });

      newSocket.on('swapCancelled', (data) => {
        toast('A swap request was cancelled', {
          duration: 4000,
          action: {
            label: 'View',
            onClick: () => {
              window.location.href = '/swaps';
            }
          }
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [user]);

  const value: SocketContextType = {
    socket,
    connected,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 