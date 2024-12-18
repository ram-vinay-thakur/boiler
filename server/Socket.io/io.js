import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export const socketConfig = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",  
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Middleware to authenticate socket connections only once during the handshake
    io.use((socket, next) => {
        const cookies = socket.request.headers.cookie;
        if (!cookies) {
            return next(new Error('Authentication error: No cookies found'));
        }

        // Extract the JWT token from cookies
        const parsedCookies = cookie.parse(cookies);
        const token = parsedCookies.accessToken;  // 'token' is the name of the cookie holding the JWT
        if (!token) {
            return next(new Error('Authentication error: No token found'));
        }

        // Verify the JWT token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedUser) => {
            if (err) {
                return next(new Error('Authentication error: Invalid token'));
            }
            socket.user = decodedUser;  
            next();  
        });
    });

    io.on('connection', (socket) => {

        io.emit('user_list', socket.user);

        socket.on('sendMessage', (data) => {
            console.log('Received message:', data);
            socket.emit('receiveMessage', { message: 'Message received!' });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });

    });

    return io;
};
