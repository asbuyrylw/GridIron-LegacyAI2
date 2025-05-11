import { useState, useEffect, useCallback, useRef } from 'react';

type WebSocketMessage = {
  type: string;
  [key: string]: any;
};

type SendMessageOptions = {
  retryCount?: number;
  retryDelay?: number;
};

const defaultOptions: SendMessageOptions = {
  retryCount: 3,
  retryDelay: 500,
};

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const messageQueueRef = useRef<string[]>([]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      // Determine the WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      // Create new WebSocket connection
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      // Setup event handlers
      socket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        
        // Process any queued messages
        if (messageQueueRef.current.length > 0) {
          messageQueueRef.current.forEach(msg => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(msg);
            }
          });
          messageQueueRef.current = [];
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      socket.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError(new Error('WebSocket error occurred'));
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (document.visibilityState !== 'hidden') {
            connect();
          }
        }, 3000);
      };

      return () => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };
    } catch (err) {
      console.error('Failed to establish WebSocket connection:', err);
      setError(err instanceof Error ? err : new Error('Failed to connect'));
    }
  }, []);

  // Send message to WebSocket server
  const sendMessage = useCallback((message: WebSocketMessage, options: SendMessageOptions = {}) => {
    const opts = { ...defaultOptions, ...options };
    const messageString = JSON.stringify(message);
    
    const send = (retryCount = opts.retryCount) => {
      // If socket exists and is open, send directly
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(messageString);
        return true;
      } 
      
      // If not connected and have retries left
      if (retryCount && retryCount > 0) {
        setTimeout(() => send(retryCount - 1), opts.retryDelay);
        return false;
      }
      
      // Queue the message for later sending
      if (!isConnected) {
        messageQueueRef.current.push(messageString);
        // Try to connect
        connect();
        return false;
      }
      
      return false;
    };
    
    return send();
  }, [connect, isConnected]);

  // Ping the server to keep connection alive
  const pingServer = useCallback(() => {
    sendMessage({ type: 'ping' });
  }, [sendMessage]);

  // Automatically connect when the hook is first used
  useEffect(() => {
    connect();
    
    // Set up ping interval to keep connection alive
    const pingInterval = setInterval(pingServer, 30000); // Every 30 seconds
    
    return () => {
      clearInterval(pingInterval);
      socketRef.current?.close();
    };
  }, [connect, pingServer]);

  // Handle parent view authentication via WebSocket
  const authenticateParentView = useCallback((token: string) => {
    return sendMessage({
      type: 'parent_view',
      token
    });
  }, [sendMessage]);

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    authenticateParentView
  };
};