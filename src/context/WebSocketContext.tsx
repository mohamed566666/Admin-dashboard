import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { wsService } from '../services/websocket';
import { useAuth } from '../hooks/useAuth';

interface WebSocketContextType {
    isConnected: boolean;
    onSessionOpened: (cb: (data: any) => void) => () => void;
    onSessionClosed: (cb: (data: any) => void) => () => void;
    onAlert: (cb: (data: any) => void) => () => void;
    reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const { getManagerId, isAuthenticated } = useAuth();
    const ws = useRef(wsService);
    const managerIdRef = useRef<number | null>(null);

    // ── connect / disconnect when auth changes ───────────────────────────
    useEffect(() => {
        if (!isAuthenticated) {
            console.log('[WebSocketProvider] Not authenticated, disconnecting');
            ws.current.disconnect();
            setIsConnected(false);
            return;
        }

        const managerId = getManagerId();
        if (!managerId) {
            console.log('[WebSocketProvider] No manager_id found');
            return;
        }

        managerIdRef.current = managerId;
        console.log('[WebSocketProvider] Connecting WebSocket for manager:', managerId);
        ws.current.connect(managerId);

        // Poll connection state every second
        const poll = setInterval(() => {
            const connected = ws.current.isConnected;
            if (connected !== isConnected) {
                console.log('[WebSocketProvider] Connection status changed:', connected);
                setIsConnected(connected);
            }
        }, 1000);

        return () => {
            clearInterval(poll);
        };
    }, [isAuthenticated, getManagerId]);

    // ── helpers ───────────────────────────────────────────────────────────
    const reconnect = () => {
        const managerId = getManagerId();
        if (!managerId) return;
        console.log('[WebSocketProvider] Manual reconnect requested');
        ws.current.disconnect();
        setTimeout(() => ws.current.connect(managerId), 300);
    };

    // Subscribe helpers — return unsubscribe function
    const onSessionOpened = (cb: (data: any) => void) => {
        console.log('[WebSocketProvider] Registering session_opened handler');
        const handler = (data: any) => {
            console.log('[WebSocketProvider] session_opened event received:', data);
            cb(data);
        };
        ws.current.on('session_opened', handler);
        return () => ws.current.off('session_opened', handler);
    };

    const onSessionClosed = (cb: (data: any) => void) => {
        console.log('[WebSocketProvider] Registering session_closed handler');
        const handler = (data: any) => {
            console.log('[WebSocketProvider] session_closed event received:', data);
            cb(data);
        };
        ws.current.on('session_closed', handler);
        return () => ws.current.off('session_closed', handler);
    };

    const onAlert = (cb: (data: any) => void) => {
        console.log('[WebSocketProvider] Registering alert handler');
        const handler = (data: any) => {
            console.log('[WebSocketProvider] alert event received:', data);
            cb(data);
        };
        ws.current.on('alert', handler);
        return () => ws.current.off('alert', handler);
    };

    return (
        <WebSocketContext.Provider value={{ isConnected, onSessionOpened, onSessionClosed, onAlert, reconnect }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const ctx = useContext(WebSocketContext);
    if (!ctx) throw new Error('useWebSocket must be used inside WebSocketProvider');
    return ctx;
};