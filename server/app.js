import express, { json } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import 'dotenv/config';
import http from 'http';
import { socketConfig } from './Socket.io/io.js';
import mongoSanitize from 'express-mongo-sanitize';
import xssClean from 'xss-clean';
import rateLimit from 'express-rate-limit';

import userRouter from './routes/user.router.js';

const app = express();
const server = http.createServer(app);

// Middleware configuration
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true,
    })
);

app.use(rateLimit);
app.use(json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(mongoSanitize());
app.use(xssClean());
app.use(cookieParser());

const io = socketConfig(server);

// const csrfProtection = csrf({ cookie: true })

// API routes
app.use('/api/v1/user', userRouter);

export { app, server };
