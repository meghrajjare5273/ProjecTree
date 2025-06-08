// // lib/socket.ts
// import { io, Socket } from "socket.io-client";

// class SocketManager {
//   private socket: Socket | null = null;
//   private token: string | null = null;

//   private getSocketUrl() {
//     return process.env.NODE_ENV === "production"
//       ? process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
//           "https://your-render-app.onrender.com"
//       : "http://localhost:3001";
//   }

//   connect(authToken: string) {
//     if (this.socket?.connected) {
//       return this.socket;
//     }

//     this.token = authToken;

//     this.socket = io(this.getSocketUrl(), {
//       auth: {
//         token: authToken,
//       },
//       transports: ["websocket", "polling"],
//       timeout: 20000,
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//     });

//     this.socket.on("connect", () => {
//       console.log("Connected to WebSocket server");
//     });

//     this.socket.on("disconnect", (reason) => {
//       console.log("Disconnected from WebSocket server:", reason);
//     });

//     this.socket.on("connect_error", (error) => {
//       console.error("WebSocket connection error:", error);
//     });

//     return this.socket;
//   }

//   disconnect() {
//     if (this.socket) {
//       this.socket.disconnect();
//       this.socket = null;
//     }
//   }

//   getSocket() {
//     return this.socket;
//   }

//   isConnected() {
//     return this.socket?.connected ?? false;
//   }
// }

// export const socketManager = new SocketManager();

// // Hook for using socket in React components
// import { useEffect, useState } from "react";

// export function useSocket(token?: string) {
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [isConnected, setIsConnected] = useState(false);

//   useEffect(() => {
//     if (!token) {
//       socketManager.disconnect();
//       setSocket(null);
//       setIsConnected(false);
//       return;
//     }

//     const socketInstance = socketManager.connect(token);
//     setSocket(socketInstance);

//     const handleConnect = () => setIsConnected(true);
//     const handleDisconnect = () => setIsConnected(false);

//     socketInstance.on("connect", handleConnect);
//     socketInstance.on("disconnect", handleDisconnect);

//     // Set initial connection state
//     setIsConnected(socketInstance.connected);

//     return () => {
//       socketInstance.off("connect", handleConnect);
//       socketInstance.off("disconnect", handleDisconnect);
//     };
//   }, [token]);

//   return { socket, isConnected };
// }
