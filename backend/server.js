const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');
const cardRoutes = require('./routes/cardRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://127.0.0.1:8080,http://localhost:8080')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) {
                return process.env.NODE_ENV !== 'production'
                    ? callback(null, true)
                    : callback(new Error('CORS not allowed for this origin'));
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error('CORS not allowed for this origin'));
        },
    })
);
app.use(express.json());

const apiLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || 200),
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' },
});

app.use('/api', apiLimiter);

app.get('/', (req, res) => {
    res.json({ message: 'CUET Computer Club API is running' });
});

app.use('/api/admin', adminRoutes);
app.use('/api/cards', cardRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
