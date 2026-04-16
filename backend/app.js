const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const adminRoutes = require('./routes/adminRoutes');
const cardRoutes = require('./routes/cardRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

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
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
