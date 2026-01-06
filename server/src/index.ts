import express, { Express } from 'express';
import connectDB from './config/db.js';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';
import { rateLimiter } from './middlewares/rateLimiter.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

import dotenv from 'dotenv';
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);
app.use(express.json({ limit: "10MB" }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:5173', (process.env.FRONTEND_DEPLOYED_URL as string)],
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));

app.use(rateLimiter);

import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import courseRouter from './routes/course.route.js';
import lectureRouter from './routes/lecture.route.js';
import paymentRouter from './routes/payment.route.js';
import moduleRouter from './routes/module.route.js';
import userCourseProgressRouter from './routes/userCourseProgress.route.js';

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/courses', courseRouter);
app.use('/api/lectures', lectureRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/modules', moduleRouter);
app.use('/api/progress', userCourseProgressRouter);

app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
    app.listen(PORT, async () => {
        console.log(`Server is listening on port ${PORT}`);
    })
}).catch((err) => {
    console.log(`Error connecting to DB`, err.message);
    process.exit(1);
});