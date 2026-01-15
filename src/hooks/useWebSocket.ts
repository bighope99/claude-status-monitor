import { useState, useEffect, useRef } from 'react';
import type { Session, WebSocketEvent } from '../types';

const WS_URL = 'ws://localhost:3001';
const RECONNECT_DELAY = 3000;

export const useWebSocket = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = () => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const wsEvent: WebSocketEvent = JSON.parse(event.data);

          switch (wsEvent.type) {
            case 'initial_state':
              setSessions(wsEvent.data.sessions);
              break;

            case 'session_updated':
              setSessions(prevSessions => {
                const existingIndex = prevSessions.findIndex(
                  s => s.projectPath === wsEvent.data.projectPath
                );

                if (existingIndex >= 0) {
                  const newSessions = [...prevSessions];
                  newSessions[existingIndex] = wsEvent.data;
                  return newSessions;
                } else {
                  return [...prevSessions, wsEvent.data];
                }
              });
              break;

            case 'session_removed':
              setSessions(prevSessions =>
                prevSessions.filter(s => s.projectPath !== wsEvent.data.projectPath)
              );
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // 再接続を試行
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, RECONNECT_DELAY);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      // 接続失敗時も再接続を試行
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connect();
      }, RECONNECT_DELAY);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { sessions, isConnected };
};
