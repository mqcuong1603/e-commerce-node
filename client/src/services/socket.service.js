// src/services/socket.service.js
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';

let socket;

const connectSocket = () => {
  socket = io(SOCKET_URL);
  
  socket.on('connect', () => {
    console.log('Connected to socket server');
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from socket server');
  });
  
  return socket;
};

const getSocket = () => {
  if (!socket) {
    return connectSocket();
  }
  return socket;
};

const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

const SocketService = {
  connectSocket,
  getSocket,
  disconnectSocket,
  
  subscribeToReviewUpdates: (productId, callback) => {
    const socket = getSocket();
    socket.on('review_update', (data) => {
      if (data.productId === productId) {
        callback(data);
      }
    });
  },
  
  emitNewReview: (reviewData) => {
    const socket = getSocket();
    socket.emit('new_review', reviewData);
  },
  
  subscribeToCartUpdates: (callback) => {
    const socket = getSocket();
    socket.on('cart_changed', callback);
  },
  
  emitCartUpdate: (cartData) => {
    const socket = getSocket();
    socket.emit('cart_update', cartData);
  }
};

export default SocketService;