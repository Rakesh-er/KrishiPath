import { create } from 'zustand';
import io from 'socket.io-client';
import { SOCKET_URL } from '../config';

export const useSocketStore = create((set, get) => ({
    socket: null,
    isConnected: false,
    notifications: [],

    connect: (token) => {
        const prev = get().socket;
        if (prev) {
            prev.disconnect();
        }

        const socket = io(SOCKET_URL, {
            auth: { token },
            withCredentials: true
        });

        socket.on('connect', () => {
            set({ socket, isConnected: true });
        });

        socket.on('disconnect', () => {
            set({ isConnected: false });
        });

        socket.on('produceUpdated', (data) => {
            set(state => ({
                notifications: [...state.notifications, {
                    id: Date.now(),
                    type: 'produce_update',
                    message: `Produce batch ${data.batch.batchId} has been ${data.action}`,
                    data,
                    timestamp: new Date()
                }]
            }));
        });

        socket.on('transactionConfirmed', (data) => {
            set(state => ({
                notifications: [...state.notifications, {
                    id: Date.now(),
                    type: 'transaction',
                    message: `Transaction confirmed: ${data.txHash}`,
                    data,
                    timestamp: new Date()
                }]
            }));
        });
    },

    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, isConnected: false });
        }
    },

    removeNotification: (id) => {
        set(state => ({
            notifications: state.notifications.filter(n => n.id !== id)
        }));
    }
}));